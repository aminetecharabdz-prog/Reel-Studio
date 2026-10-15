/**
 * Local (no-AI) Art Director: designs a unique Design DNA from the topic, style choices,
 * free-text art direction and brand kit. The Claude Art Director (director/claude.ts) produces
 * the same schema; both go through finalizeDNA() for contrast + brand overrides.
 */
import type { DesignDNA } from '../schema/dna';
import { DesignDNASchema } from '../schema/dna';
import type { BrandKit } from '../schema/project';
import { contrast, ensureContrast, hexToRgb, hslToHex, mix, rgbToHsl, textOn } from '../color/contrast';
import { rng, type Rng } from '../util/rng';
import type { Topic } from './topics';
import { FONT_BY_ID } from './fonts';

type Recipe = {
  moods: string[];
  hues: Array<[number, number]>; // candidate base hue ranges
  dark: number; // probability of a dark theme
  sat: [number, number];
  displayFonts: string[];
  bodyFonts: string[];
  latin: string[];
  easing: DesignDNA['motionLanguage']['easing'][];
  layouts: DesignDNA['layoutGrammar'][];
  backgrounds: DesignDNA['background']['kind'][];
  icons: DesignDNA['iconSet'][];
  sfx: DesignDNA['sfxPalette'][];
  transitions: DesignDNA['motionLanguage']['transitionFamily'][number][];
  corners: [number, number];
  shadows: DesignDNA['texture']['shadows'][];
  illustration: string[];
};

const R: Record<Topic, Recipe> = {
  dental: {
    moods: ['clinical-trust', 'fresh-mint-care', 'gentle-smile', 'bright-clinic'],
    hues: [[165, 195], [195, 215], [140, 165], [250, 270]],
    dark: 0.25, sat: [0.55, 0.85],
    displayFonts: ['tajawal', 'readex', 'mada', 'alexandria', 'cairo'], bodyFonts: ['readex', 'tajawal', 'mada'], latin: ['bricolage', 'space-grotesk'],
    easing: ['smooth', 'bouncy', 'smooth'], layouts: ['centered', 'stacked-cards', 'asymmetric'],
    backgrounds: ['gradient', 'mesh', 'solid', 'pattern'], icons: ['fluent-emoji-flat', 'ph', 'solar'], sfx: ['soft-ui', 'playful'],
    transitions: ['slide', 'zoom', 'fade', 'iris'], corners: [22, 48], shadows: ['soft', 'none'],
    illustration: ['friendly flat medical illustration, rounded shapes, mint and white', 'clean 3d-clay dental icons, soft light'],
  },
  medical: {
    moods: ['calm-care', 'clinical-trust', 'warm-family-doctor'], hues: [[190, 215], [150, 175], [330, 350]], dark: 0.2, sat: [0.45, 0.75],
    displayFonts: ['readex', 'tajawal', 'mada'], bodyFonts: ['readex', 'tajawal'], latin: ['bricolage'],
    easing: ['smooth'], layouts: ['centered', 'stacked-cards'], backgrounds: ['gradient', 'solid', 'mesh'], icons: ['ph', 'fluent-emoji-flat'],
    sfx: ['soft-ui'], transitions: ['fade', 'slide', 'zoom'], corners: [20, 40], shadows: ['soft'], illustration: ['clean flat medical illustration'],
  },
  automotive: {
    moods: ['industrial-precision', 'garage-night', 'motorsport-energy', 'blueprint-tech'],
    hues: [[10, 28], [195, 215], [40, 50], [0, 8]], dark: 0.85, sat: [0.65, 0.95],
    displayFonts: ['changa', 'alexandria', 'cairo', 'noto-kufi'], bodyFonts: ['cairo', 'ibm-plex', 'noto-kufi'], latin: ['unbounded', 'space-grotesk', 'archivo-black'],
    easing: ['mechanical', 'snappy', 'snappy'], layouts: ['asymmetric', 'editorial-grid', 'split', 'full-bleed'],
    backgrounds: ['grain', 'pattern', '3d-room', 'gradient'], icons: ['tabler', 'ph', 'solar'], sfx: ['mechanical', 'punchy', 'cinematic'],
    transitions: ['wipe', 'shutter', 'push', 'flash'], corners: [0, 14], shadows: ['hard', 'long', 'none'],
    illustration: ['technical cutaway illustration, blueprint lines, metallic', 'dark industrial 3d render, orange accents'],
  },
  product: {
    moods: ['bold-offer', 'clean-ecom', 'street-deal', 'premium-gadget'], hues: [[340, 360], [20, 35], [265, 290], [145, 165], [205, 220]],
    dark: 0.5, sat: [0.7, 0.95],
    displayFonts: ['lalezar', 'cairo', 'alexandria', 'changa'], bodyFonts: ['cairo', 'tajawal', 'alexandria'], latin: ['archivo-black', 'unbounded', 'bricolage'],
    easing: ['snappy', 'bouncy', 'elastic'], layouts: ['centered', 'split', 'stacked-cards'], backgrounds: ['gradient', 'mesh', '3d-room', 'solid'],
    icons: ['solar', 'ph', 'fluent-emoji-flat'], sfx: ['punchy', 'playful'], transitions: ['zoom', 'push', 'flash', 'slide'],
    corners: [16, 36], shadows: ['long', 'hard', 'soft'], illustration: ['studio product photo, soft shadow, gradient backdrop'],
  },
  fashion: {
    moods: ['editorial-chic', 'street-style', 'minimal-luxury'], hues: [[0, 15], [30, 45], [280, 300], [0, 360]], dark: 0.55, sat: [0.2, 0.7],
    displayFonts: ['reem-kufi', 'el-messiri', 'alexandria', 'lalezar'], bodyFonts: ['readex', 'ibm-plex'], latin: ['syne', 'dm-serif', 'fraunces'],
    easing: ['smooth', 'snappy'], layouts: ['editorial-grid', 'full-bleed', 'asymmetric'], backgrounds: ['solid', 'grain', 'photo-blur'], icons: ['ph', 'solar'],
    sfx: ['cinematic', 'soft-ui'], transitions: ['wipe', 'fade', 'blur'], corners: [0, 10], shadows: ['none', 'soft'], illustration: ['fashion editorial photo, magazine'],
  },
  food: {
    moods: ['warm-kitchen', 'street-food-fun', 'cozy-cafe'], hues: [[15, 35], [40, 55], [350, 360], [95, 120]], dark: 0.35, sat: [0.6, 0.9],
    displayFonts: ['lemonada', 'baloo', 'el-messiri', 'rakkas'], bodyFonts: ['tajawal', 'readex'], latin: ['fraunces', 'bricolage'],
    easing: ['bouncy', 'elastic', 'smooth'], layouts: ['stacked-cards', 'centered', 'asymmetric'], backgrounds: ['grain', 'pattern', 'gradient'],
    icons: ['fluent-emoji-flat'], sfx: ['playful', 'soft-ui'], transitions: ['iris', 'zoom', 'slide'], corners: [24, 60], shadows: ['soft', 'hard'], illustration: ['warm hand-drawn food illustration'],
  },
  beauty: {
    moods: ['soft-glow', 'rose-luxury', 'clean-skin'], hues: [[330, 350], [15, 30], [280, 300]], dark: 0.3, sat: [0.35, 0.7],
    displayFonts: ['el-messiri', 'reem-kufi', 'aref-ruqaa', 'tajawal'], bodyFonts: ['tajawal', 'readex'], latin: ['dm-serif', 'syne', 'fraunces'],
    easing: ['smooth'], layouts: ['centered', 'editorial-grid', 'full-bleed'], backgrounds: ['mesh', 'gradient', 'photo-blur'], icons: ['ph', 'fluent-emoji-flat'],
    sfx: ['soft-ui', 'cinematic'], transitions: ['fade', 'blur', 'zoom'], corners: [28, 70], shadows: ['soft', 'none'], illustration: ['soft pastel beauty photo'],
  },
  education: {
    moods: ['bright-classroom', 'smart-notes', 'curious-mind'], hues: [[210, 230], [45, 55], [120, 150], [260, 280]], dark: 0.3, sat: [0.6, 0.85],
    displayFonts: ['baloo', 'readex', 'cairo', 'marhey'], bodyFonts: ['readex', 'tajawal'], latin: ['bricolage', 'space-grotesk'],
    easing: ['bouncy', 'smooth'], layouts: ['stacked-cards', 'editorial-grid', 'centered'], backgrounds: ['pattern', 'solid', 'gradient'], icons: ['fluent-emoji-flat', 'ph'],
    sfx: ['playful', 'soft-ui'], transitions: ['slide', 'push', 'iris'], corners: [16, 34], shadows: ['hard', 'soft'], illustration: ['notebook doodle illustration'],
  },
  realestate: {
    moods: ['premium-living', 'bright-home', 'architectural'], hues: [[200, 220], [30, 45], [150, 170]], dark: 0.5, sat: [0.3, 0.6],
    displayFonts: ['reem-kufi', 'alexandria', 'el-messiri'], bodyFonts: ['ibm-plex', 'readex'], latin: ['syne', 'dm-serif'],
    easing: ['smooth'], layouts: ['editorial-grid', 'full-bleed', 'split'], backgrounds: ['photo-blur', 'gradient', 'solid'], icons: ['ph', 'solar'],
    sfx: ['cinematic', 'soft-ui'], transitions: ['fade', 'push', 'wipe'], corners: [4, 20], shadows: ['soft', 'long'], illustration: ['architectural photo, golden hour'],
  },
  tech: {
    moods: ['neon-hud', 'clean-saas', 'future-lab'], hues: [[250, 275], [180, 200], [140, 160], [300, 320]], dark: 0.8, sat: [0.7, 1],
    displayFonts: ['alexandria', 'noto-kufi', 'changa', 'cairo'], bodyFonts: ['ibm-plex', 'cairo'], latin: ['space-grotesk', 'unbounded'],
    easing: ['snappy', 'mechanical'], layouts: ['asymmetric', 'split', 'editorial-grid'], backgrounds: ['pattern', 'mesh', 'grain'], icons: ['tabler', 'ph'],
    sfx: ['mechanical', 'soft-ui'], transitions: ['wipe', 'shutter', 'zoom'], corners: [6, 20], shadows: ['none', 'hard'], illustration: ['isometric tech illustration, glowing lines'],
  },
  sport: {
    moods: ['high-energy', 'gym-grit', 'victory'], hues: [[0, 15], [80, 100], [200, 215], [25, 35]], dark: 0.75, sat: [0.8, 1],
    displayFonts: ['changa', 'lalezar', 'cairo'], bodyFonts: ['cairo', 'changa'], latin: ['archivo-black', 'unbounded'],
    easing: ['snappy', 'elastic'], layouts: ['full-bleed', 'asymmetric', 'split'], backgrounds: ['grain', 'gradient', '3d-room'], icons: ['tabler', 'solar'],
    sfx: ['punchy'], transitions: ['flash', 'push', 'shutter'], corners: [0, 12], shadows: ['hard', 'long'], illustration: ['dynamic sport photo, motion blur'],
  },
  finance: {
    moods: ['sharp-business', 'growth-green', 'trust-blue'], hues: [[145, 165], [205, 225], [40, 50]], dark: 0.6, sat: [0.5, 0.8],
    displayFonts: ['alexandria', 'noto-kufi', 'ibm-plex'], bodyFonts: ['ibm-plex', 'readex'], latin: ['space-grotesk', 'syne'],
    easing: ['smooth', 'snappy'], layouts: ['editorial-grid', 'asymmetric', 'centered'], backgrounds: ['gradient', 'pattern', 'solid'], icons: ['ph', 'tabler'],
    sfx: ['soft-ui', 'cinematic'], transitions: ['wipe', 'push', 'fade'], corners: [8, 24], shadows: ['soft', 'none'], illustration: ['clean finance infographic'],
  },
  kids: {
    moods: ['playground', 'crayon-fun'], hues: [[40, 55], [190, 210], [330, 345], [100, 130]], dark: 0.1, sat: [0.75, 0.95],
    displayFonts: ['baloo', 'lemonada', 'marhey'], bodyFonts: ['baloo', 'tajawal'], latin: ['bricolage'],
    easing: ['elastic', 'bouncy'], layouts: ['centered', 'stacked-cards'], backgrounds: ['pattern', 'solid', 'mesh'], icons: ['fluent-emoji-flat'],
    sfx: ['playful'], transitions: ['iris', 'zoom', 'slide'], corners: [30, 70], shadows: ['hard', 'soft'], illustration: ['bright crayon kids illustration'],
  },
  general: {
    moods: ['confident-creator', 'warm-story', 'bold-statement', 'calm-explainer'], hues: [[0, 360]], dark: 0.5, sat: [0.5, 0.9],
    displayFonts: ['alexandria', 'cairo', 'reem-kufi', 'changa', 'readex', 'el-messiri'], bodyFonts: ['readex', 'tajawal', 'ibm-plex'], latin: ['bricolage', 'syne', 'space-grotesk'],
    easing: ['smooth', 'snappy', 'bouncy'], layouts: ['centered', 'asymmetric', 'stacked-cards', 'editorial-grid'], backgrounds: ['gradient', 'mesh', 'grain', 'pattern', 'solid'],
    icons: ['ph', 'solar', 'fluent-emoji-flat', 'tabler'], sfx: ['soft-ui', 'punchy', 'cinematic'], transitions: ['fade', 'push', 'zoom', 'wipe', 'slide'],
    corners: [8, 40], shadows: ['soft', 'hard', 'none'], illustration: ['clean flat illustration'],
  },
};

/** Visual style "ingredients" that bend the recipe (SPEC §3 step 2 — styles are ingredients, not templates). */
export const VISUAL_STYLES: Record<string, { label: string; apply: (r: Recipe) => Partial<Recipe> }> = {
  'flat-illustration': { label: 'رسم مسطّح', apply: () => ({ icons: ['fluent-emoji-flat'], shadows: ['none'], backgrounds: ['solid', 'pattern'] }) },
  '3d-clay': { label: 'طين ثلاثي الأبعاد', apply: () => ({ corners: [36, 70], shadows: ['soft'], backgrounds: ['3d-room', 'gradient'], easing: ['bouncy'], icons: ['fluent-emoji-flat'] }) },
  isometric: { label: 'إيزومتري', apply: () => ({ layouts: ['asymmetric'], backgrounds: ['pattern'], shadows: ['long'], corners: [6, 14] }) },
  editorial: { label: 'مجلة / إيديتوريال', apply: () => ({ layouts: ['editorial-grid'], latin: ['syne', 'dm-serif', 'fraunces'], displayFonts: ['reem-kufi', 'el-messiri'], corners: [0, 6], shadows: ['none'] }) },
  'neo-brutalist': { label: 'نيو بروتاليزم', apply: () => ({ shadows: ['hard'], corners: [0, 6], sat: [0.85, 1], easing: ['snappy', 'mechanical'], layouts: ['asymmetric', 'stacked-cards'], backgrounds: ['solid', 'pattern'] }) },
  glass: { label: 'زجاجي', apply: () => ({ backgrounds: ['mesh'], corners: [28, 44], shadows: ['soft'], dark: 0.7 }) },
  retro: { label: 'ريترو 80s', apply: () => ({ displayFonts: ['rakkas', 'lalezar'], backgrounds: ['grain', 'pattern'], hues: [[15, 45], [300, 330]], shadows: ['long'] }) },
  'minimal-luxury': { label: 'فخامة بسيطة', apply: () => ({ dark: 0.9, sat: [0.15, 0.4], hues: [[38, 48]], displayFonts: ['el-messiri', 'reem-kufi', 'aref-ruqaa'], latin: ['dm-serif'], easing: ['smooth'], shadows: ['none'], backgrounds: ['grain', 'solid'] }) },
  doodle: { label: 'رسم يدوي', apply: () => ({ displayFonts: ['marhey', 'lemonada'], backgrounds: ['pattern'], easing: ['bouncy', 'elastic'], icons: ['fluent-emoji-flat'] }) },
  'tech-hud': { label: 'تقني HUD', apply: () => ({ dark: 1, hues: [[160, 195]], displayFonts: ['noto-kufi', 'changa'], latin: ['space-grotesk'], easing: ['mechanical'], backgrounds: ['pattern', 'grain'], shadows: ['none'], corners: [2, 8], icons: ['tabler'] }) },
  collage: { label: 'كولاج', apply: () => ({ backgrounds: ['grain'], shadows: ['hard', 'long'], layouts: ['asymmetric'], corners: [0, 4] }) },
  'gradient-mesh': { label: 'تدرّج ميش', apply: () => ({ backgrounds: ['mesh'], sat: [0.7, 1] }) },
  documentary: { label: 'وثائقي', apply: () => ({ backgrounds: ['photo-blur', 'grain'], easing: ['smooth'], transitions: ['fade', 'blur'], dark: 0.8 }) },
  'playful-kids': { label: 'مرح للأطفال', apply: () => ({ ...R.kids }) },
};

const ART_WORDS: Array<[RegExp, (r: Recipe) => Partial<Recipe>]> = [
  [/dark|sombre|ليل|داكن|مظلم|سينمائي|cinemat/i, () => ({ dark: 1 })],
  [/light|clair|فاتح|ابيض|أبيض|بيضاء|white/i, () => ({ dark: 0 })],
  [/gold|or\b|ذهب/i, () => ({ hues: [[40, 48]], sat: [0.55, 0.75] })],
  [/red|rouge|احمر|أحمر|حمراء/i, () => ({ hues: [[350, 360], [0, 8]] })],
  [/blue|bleu|ازرق|أزرق|زرقاء/i, () => ({ hues: [[205, 225]] })],
  [/green|vert|اخضر|أخضر|خضراء/i, () => ({ hues: [[130, 160]] })],
  [/pink|rose|وردي/i, () => ({ hues: [[325, 345]] })],
  [/orange|برتقالي|كاكي/i, () => ({ hues: [[20, 32]] })],
  [/purple|violet|بنفسجي|موف/i, () => ({ hues: [[265, 290]] })],
  [/minimal|بسيط|هادئ|calm/i, () => ({ easing: ['smooth'], shadows: ['none'], sat: [0.25, 0.55] })],
  [/energ|حماس|سريع|fast|punchy/i, () => ({ easing: ['snappy', 'elastic'], sfx: ['punchy'] })],
  [/apple|premium|luxe|فخم/i, () => ({ easing: ['smooth'], shadows: ['soft', 'none'], latin: ['syne', 'dm-serif'] })],
];

const pickIn = (r: Rng, [a, b]: [number, number]) => r.range(a, b);

export type ArtDirectorInput = {
  topic: Topic;
  seed: number;
  visualStyle?: string;
  artDirection?: string;
  brand?: BrandKit;
  avoid?: { moods: string[]; easings: string[]; hues: number[] }; // from recent fingerprints
};

export const designDNA = (input: ArtDirectorInput): DesignDNA => {
  const r = rng(input.seed);
  let rec: Recipe = { ...R[input.topic] };
  const style = input.visualStyle && VISUAL_STYLES[input.visualStyle];
  if (style) rec = { ...rec, ...style.apply(rec) };
  for (const [re, fn] of ART_WORDS) if (input.artDirection && re.test(input.artDirection)) rec = { ...rec, ...fn(rec) };

  const avoid = input.avoid;
  const easings = avoid ? rec.easing.filter((e) => !avoid.easings.includes(e)) : rec.easing;
  const moods = avoid ? rec.moods.filter((m) => !avoid.moods.includes(m)) : rec.moods;

  // ---- palette
  let hue = pickIn(r, r.pick(rec.hues));
  if (avoid) for (let tries = 0; tries < 6 && avoid.hues.some((h) => Math.min(Math.abs(h - hue), 360 - Math.abs(h - hue)) < 25); tries++) hue = pickIn(r, r.pick(rec.hues));
  const dark = r.chance(rec.dark);
  const sat = pickIn(r, rec.sat);
  const scheme = r.pick(['complementary', 'analogous', 'split', 'triadic', 'mono'] as const);
  const accentHue = { complementary: hue + 180, analogous: hue + 35, split: hue + 150, triadic: hue + 120, mono: hue + 12 }[scheme];
  const bg0 = dark ? hslToHex(hue + r.range(-12, 12), Math.min(0.6, sat * 0.55), r.range(0.07, 0.13)) : hslToHex(hue + r.range(-10, 10), Math.min(0.5, sat * 0.45), r.range(0.92, 0.97));
  const bg1 = dark ? hslToHex(hue + r.range(10, 30), Math.min(0.65, sat * 0.6), r.range(0.13, 0.2)) : hslToHex(hue + r.range(15, 35), Math.min(0.55, sat * 0.5), r.range(0.85, 0.92));
  const bg2 = hslToHex(accentHue, sat * (dark ? 0.6 : 0.5), dark ? r.range(0.16, 0.24) : r.range(0.8, 0.88));
  const primaryRaw = hslToHex(hue, sat, dark ? r.range(0.55, 0.68) : r.range(0.38, 0.5));
  const accentRaw = hslToHex(accentHue, Math.min(1, sat + 0.1), dark ? r.range(0.58, 0.7) : r.range(0.45, 0.58));
  const surface = dark ? mix(bg0, '#ffffff', r.range(0.06, 0.11)) : mix(bg0, '#ffffff', 0.7);
  const textBase = dark ? hslToHex(hue, 0.25, 0.96) : hslToHex(hue, 0.35, 0.1);

  // ---- type
  const display = r.pick(rec.displayFonts);
  const body = r.pick(rec.bodyFonts.filter((b) => b !== display).length ? rec.bodyFonts.filter((b) => b !== display) : rec.bodyFonts);
  const wc = r.pick(['low', 'mid', 'high'] as const);
  const dDef = FONT_BY_ID.get(display);
  const dWeight = dDef ? dDef.weights[dDef.weights.length - 1]! : 800;
  const captionsFont = r.chance(0.5) ? display : body;
  const cDef = FONT_BY_ID.get(captionsFont);
  const easing = r.pick(easings.length ? easings : rec.easing);
  const baseDur = { snappy: r.int(8, 11), smooth: r.int(14, 19), bouncy: r.int(12, 16), mechanical: r.int(8, 12), elastic: r.int(14, 18) }[easing];
  const transitions = r.shuffle(rec.transitions).slice(0, r.int(2, 3));
  const bgKind = r.pick(rec.backgrounds);

  const dna: DesignDNA = {
    mood: r.pick(moods.length ? moods : rec.moods),
    palette: { bg: [bg0, bg1, bg2], surface, primary: primaryRaw, accent: accentRaw, text: textBase, textOnAccent: textOn(accentRaw) },
    typography: {
      display: { family: display, weight: dWeight },
      body: { family: body, weight: 500 },
      captions: { family: captionsFont, weight: cDef ? cDef.weights[Math.max(0, cDef.weights.length - 2)]! : 700 },
      latin: r.chance(0.65) ? r.pick(rec.latin) : undefined,
      scale: Math.round(r.range(0.92, 1.12) * 100) / 100,
      weightContrast: wc,
    },
    layoutGrammar: r.pick(rec.layouts),
    motionLanguage: {
      easing,
      baseDurationFrames: baseDur,
      overshoot: easing === 'bouncy' || easing === 'elastic' ? Math.round(r.range(0.08, 0.25) * 100) / 100 : Math.round(r.range(0, 0.06) * 100) / 100,
      stagger: r.int(2, 5),
      transitionFamily: transitions.length ? transitions : ['fade'],
    },
    background: { kind: bgKind, params: { angle: r.int(0, 359), density: Math.round(r.range(0.3, 1) * 100) / 100, pattern: r.pick(['dots', 'grid', 'diagonal', 'waves', 'plus', 'rings']) } },
    illustrationStyle: r.pick(rec.illustration),
    iconSet: r.pick(rec.icons),
    texture: { grain: bgKind === 'grain' ? r.range(0.35, 0.7) : r.range(0, 0.25), shadows: r.pick(rec.shadows), corners: Math.round(pickIn(r, rec.corners)) },
    sfxPalette: r.pick(rec.sfx),
    seed: input.seed,
  };
  return finalizeDNA(dna, input.brand);
};

/** Apply brand overrides and guarantee readable contrast (WCAG AA 4.5:1 for all text pairs). */
export const finalizeDNA = (dna: DesignDNA, brand?: BrandKit): DesignDNA => {
  const d: DesignDNA = structuredClone(dna);
  if (brand?.enabled) {
    const [c1, c2, c3] = brand.colors;
    if (c1) d.palette.primary = c1;
    if (c2) d.palette.accent = c2;
    if (c3) {
      const [, , l] = rgbToHsl(hexToRgb(c3));
      if (l < 0.3 || l > 0.85) d.palette.bg[0] = c3; // only usable as background when very dark/light
    }
    if (brand.displayFont) d.typography.display.family = brand.displayFont;
    if (brand.bodyFont) d.typography.body.family = brand.bodyFont;
  }
  const bgs = d.palette.bg;
  const worst = (c: string) => Math.min(...bgs.map((b) => contrast(c, b)), contrast(c, d.palette.surface));
  // text must read on every background and surface
  if (worst(d.palette.text) < 4.5) {
    const dark = bgs.reduce((n, b) => n + (hexToRgb(b).reduce((a, x) => a + x, 0) < 384 ? 1 : 0), 0) >= bgs.length / 2;
    d.palette.text = dark ? '#FFFFFF' : '#111111';
    bgs.forEach((b, i) => {
      if (contrast(d.palette.text, b) < 4.5) bgs[i] = ensureContrast(b, d.palette.text, 4.5);
    });
    if (contrast(d.palette.text, d.palette.surface) < 4.5) d.palette.surface = ensureContrast(d.palette.surface, d.palette.text, 4.5);
  }
  d.palette.primary = ensureContrast(d.palette.primary, bgs[0]!, 3.2);
  d.palette.accent = ensureContrast(d.palette.accent, bgs[0]!, 3);
  d.palette.textOnAccent = textOn(d.palette.accent);
  if (contrast(d.palette.textOnAccent, d.palette.accent) < 4.5) d.palette.accent = ensureContrast(d.palette.accent, d.palette.textOnAccent, 4.5);
  return DesignDNASchema.parse(d);
};

/** Text colour to use on top of `primary` (headline boxes, chips). */
export const onPrimary = (dna: DesignDNA) => textOn(dna.palette.primary);
