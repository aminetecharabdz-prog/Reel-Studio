/**
 * Claude Art Director + Scene Director (SPEC §4–§6). One strict tool call returns the Design DNA
 * and a word-anchored scene plan. The static rules + catalogs are prompt-cached. Output is
 * validated with Zod; the timing compiler (not the model) turns word ids into frames.
 */
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { Director, DirectorRequest } from './types';
import { MODELS } from './config';
import { claudeCost, logCost } from '../cost/ledger';
import { BG_TREATMENTS, HERO_LAYOUTS, PRIMITIVE_IDS, PlanSchema, type Hero, type Plan } from '../schema/plan';
import { ART3D } from '../design/art3d';
import { ILLUSTRATIONS, ILLUSTRATION_IDS } from '../../video/illustrations';
import { BACKGROUND_KINDS, EASINGS, LAYOUT_GRAMMARS, TRANSITIONS, type DesignDNA } from '../schema/dna';
import { ARABIC_FONTS, LATIN_FONTS, FONT_BY_ID } from '../design/fonts';
import { ICON_CONCEPTS } from '../design/icons';
import { PRIMITIVE_META } from '../director/primitiveMeta';
import { finalizeDNA } from '../design/artDirector';
import { buildBeats } from '../director/beats';
import type { Transcript } from '../schema/transcript';
import type { BrandKit } from '../schema/project';

const client = (apiKey: string) => new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

const S = (type: string | string[], extra: Record<string, unknown> = {}) => ({ type, ...extra });
const nullable = (t: string) => S([t, 'null']);

const ITEM = { type: 'object', additionalProperties: false, required: ['text', 'at', 'icon', 'value', 'tone'], properties: { text: S('string'), at: nullable('string'), icon: nullable('string'), value: nullable('number'), tone: S(['string', 'null'], { enum: ['good', 'bad', 'neutral', null] }) } };

const ART_ENUM = [...ART3D];
const nullEnum = (vals: readonly string[]) => S(['string', 'null'], { enum: [...vals, null] });
const HERO = {
  type: 'object',
  additionalProperties: false,
  required: ['note', 'layout', 'art', 'art2', 'illus', 'illusParams', 'mark', 'markAt', 'props', 'count', 'highlight', 'badgeArt', 'badgeText', 'badgeAt', 'backdrop'],
  properties: {
    note: S('string'),
    layout: nullEnum(HERO_LAYOUTS),
    art: nullEnum(ART_ENUM), art2: nullEnum(ART_ENUM),
    illus: nullEnum(ILLUSTRATION_IDS),
    illusParams: nullable('string'),
    mark: nullEnum(['forbidden', 'check', 'warning', 'cross', 'circle']),
    markAt: nullable('string'),
    props: S('array', { items: S('string', { enum: ART_ENUM }) }),
    count: nullable('integer'), highlight: nullable('integer'),
    badgeArt: nullEnum(ART_ENUM), badgeText: nullable('string'), badgeAt: nullable('string'),
    backdrop: nullEnum(['disc', 'blob', 'arch', 'ring', 'card', 'none']),
  },
};

const SCENE = {
  type: 'object',
  additionalProperties: false,
  required: ['from', 'to', 'primitive', 'variant', 'transition', 'emphasis', 'headline', 'headlineAt', 'sub', 'kicker', 'items', 'value', 'valueFrom', 'valueAt', 'unit', 'prefix', 'icon', 'icons', 'price', 'oldPrice', 'wilayas', 'rating', 'imagePrompt', 'userImage', 'speaker', 'zoomOn', 'bgIndex', 'bg', 'hero'],
  properties: {
    from: S('string'), to: S('string'),
    primitive: S('string', { enum: PRIMITIVE_IDS }),
    variant: S('integer'),
    transition: S('string', { enum: [...TRANSITIONS] }),
    emphasis: S('array', { items: S('string') }),
    headline: nullable('string'), headlineAt: nullable('string'), sub: nullable('string'), kicker: nullable('string'),
    items: S('array', { items: ITEM }),
    value: nullable('number'), valueFrom: nullable('number'), valueAt: nullable('string'), unit: nullable('string'), prefix: nullable('string'),
    icon: nullable('string'), icons: S('array', { items: S('string') }),
    price: nullable('number'), oldPrice: nullable('number'), wilayas: nullable('integer'), rating: nullable('number'),
    imagePrompt: nullable('string'), userImage: nullable('integer'),
    speaker: S(['string', 'null'], { enum: ['full', 'split-top', 'split-bottom', 'pip', 'hidden', null] }),
    zoomOn: S('array', { items: S('string') }),
    bgIndex: S('integer'),
    bg: S('string', { enum: [...BG_TREATMENTS] }),
    hero: HERO,
  },
};

const TOOL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['dna', 'scenes', 'hookVariants'],
  properties: {
    dna: {
      type: 'object',
      additionalProperties: false,
      required: ['mood', 'bg', 'surface', 'primary', 'accent', 'text', 'displayFont', 'bodyFont', 'captionsFont', 'latinFont', 'scale', 'weightContrast', 'layoutGrammar', 'easing', 'baseDurationFrames', 'overshoot', 'stagger', 'transitions', 'background', 'pattern', 'illustrationStyle', 'iconSet', 'grain', 'shadows', 'corners', 'sfxPalette'],
      properties: {
        mood: S('string'),
        bg: S('array', { items: S('string') }),
        surface: S('string'), primary: S('string'), accent: S('string'), text: S('string'),
        displayFont: S('string', { enum: ARABIC_FONTS.map((f) => f.id) }), bodyFont: S('string', { enum: ARABIC_FONTS.map((f) => f.id) }), captionsFont: S('string', { enum: ARABIC_FONTS.map((f) => f.id) }),
        latinFont: S('string', { enum: ['none', ...LATIN_FONTS.map((f) => f.id)] }),
        scale: S('number'), weightContrast: S('string', { enum: ['low', 'mid', 'high'] }),
        layoutGrammar: S('string', { enum: [...LAYOUT_GRAMMARS] }), easing: S('string', { enum: [...EASINGS] }),
        baseDurationFrames: S('integer'), overshoot: S('number'), stagger: S('integer'),
        transitions: S('array', { items: S('string', { enum: [...TRANSITIONS] }) }),
        background: S('string', { enum: [...BACKGROUND_KINDS] }), pattern: S('string', { enum: ['dots', 'grid', 'diagonal', 'waves', 'plus', 'rings'] }),
        illustrationStyle: S('string'), iconSet: S('string', { enum: ['ph', 'tabler', 'solar', 'fluent-emoji-flat'] }),
        grain: S('number'), shadows: S('string', { enum: ['none', 'soft', 'hard', 'long'] }), corners: S('integer'),
        sfxPalette: S('string', { enum: ['soft-ui', 'punchy', 'cinematic', 'playful', 'mechanical'] }),
      },
    },
    scenes: S('array', { items: SCENE }),
    hookVariants: S('array', { items: S('string') }),
  },
};

const RULES = `You are the art director AND scene director of an auto-generated vertical motion-graphics reel (Arabic/Algerian Darija + French + numbers). The bar is a senior motion designer at a top agency — never a slideshow, never a template.

DESIGN DNA — design a look specific to THIS topic and audience (palette, type pairing, layout grammar, motion family, background, texture, icon set, sfx palette). It must differ from the "avoid" fingerprints given. Brand colours, when given, win. Text colour must contrast ≥4.5:1 with every bg colour and surface. bg = 2–3 related colours. Pick fonts from the catalog by personality.

SCENES — read the speech, split it into beats (one idea each). Suggested beats are given; you may merge/split. For each scene:
- from/to = word ids (first/last word of the beat). Scenes must be in order, contiguous, cover all words, never cut mid-word. Respect the pacing window.
- Choose a primitive whose purpose matches what is SAID at that moment (catalog below). Never the same primitive twice in a row; ≤3 uses of any primitive; vary layout variants (0–2).
- QUALITY BAR (non-negotiable): EVERY scene has a big hero visual that LITERALLY shows the sentence — use primitive "hero-scene" for almost every scene. For each hero write hero.note = what the viewer sees and why it matches the words. Hero sources, best first: user image (userImage, set hero.layout null; product photos are cut-outs) → a topic illustration (hero.illus + illusParams "key=value;key=value") → glossy 3D objects (hero.art from the ART list; layouts: center | pair (art + art2, e.g. candy + soda) | count (count copies of art, the first "highlight" coloured, rest art2 — for numbers like 70% = 10 faces with 7 highlighted, 3 tips = 3 bulbs) | orbit (art + props circling) | side). Add 1–3 props, a badge (badgeArt/badgeText 1–2 words, badgeAt word id) and a mark (forbidden for "don't"/"avoid", check for "do"/"good", cross, warning, circle) drawn on markAt. A small line icon or a lone word is never a hero. Generic shapes are forbidden.
- bg = background treatment per scene: use at least 3 different ones across the video (dna, spotlight, split, rays, room, grid, duotone, deep).
- On-screen text: headline = 1–3 KEY words or a number (e.g. "70%", "مرتين", "le fil dentaire") — NEVER the caption sentence (captions already show every word). kicker = a short chip (1–3 words, may be the French/Arabic term). Keep the speaker's dialect; French words stay in Latin script, in spoken order. Never invent facts, prices, guarantees, medical claims or reviews that were not said. Numbers/prices only if spoken.
- Anchor everything to word ids: headlineAt, valueAt, items[].at = the word where it should appear. Emphasis = 1–2 stressed word ids.
- Hook in the first 1.5 s: strongest type, fastest motion.
- icons: use concept names from the icon list only.
- imagePrompt (English, no text in the image): only when IMAGE GENERATION is available. Then use it for the hero of up to 6 scenes where a rich illustration or lifestyle photo beats 3D objects (a consistent character acting out the sentence, the product in a real situation, a topic illustration); every prompt repeats the same character/product description and the illustrationStyle so the video stays consistent. Without image generation: null. userImage = index of a user-provided image to show (product photos), else null.
- Mode C (talking head): speaker = full | split-top | split-bottom | pip | hidden per scene; full-frame speaker scenes use light overlays (kinetic-headline, sticker-pop, big-number, highlight-sweep, word-build, icon-burst, warning-alert, cta); richer graphics with split-top. zoomOn = 0–1 emphasis word ids for punch-in zooms.
- Mode B (product ad): map the direct-response arc onto what was said: hook → problem → product reveal (product-hero with userImage) → benefits (feature-callouts / icon-grid) → offer (price-tag, delivery-badge, cod-badge — only if said) → CTA. hookVariants: 3 alternative hook lines in the same dialect.
- Use null for fields a primitive doesn't need. bgIndex 0–2 (subtle background shifts).
Always finish by calling submit_reel_plan exactly once.`;

const catalog = () => {
  const prims = Object.entries(PRIMITIVE_META).map(([id, m]) => `- ${id}: ${m.desc}; beats: ${m.beats.join('/')}; needs: ${m.needs}${m.modes ? `; modes: ${m.modes.join('')}` : ''}`).join('\n');
  const fonts = [...ARABIC_FONTS, ...LATIN_FONTS].map((f) => `${f.id} (${f.script}; ${f.tags.join(', ')})`).join('; ');
  const illus = Object.entries(ILLUSTRATIONS).map(([id, v]) => `- ${id}: ${v.note}; params: ${v.params}`).join('\n');
  return `PRIMITIVES:\n${prims}\n\nILLUSTRATIONS (animated, topic-literal):\n${illus}\n\nART (3D objects): ${ART3D.join(', ')}\n\nFONTS: ${fonts}\n\nICONS: ${ICON_CONCEPTS.join(', ')}`;
};

const wordList = (t: Transcript) => t.words.map((w) => `${w.id}:${w.text}@${(w.startMs / 1000).toFixed(2)}`).join(' ');

const HEX = /^#[0-9a-fA-F]{6}$/;
const hexOr = (v: string, fb: string) => (HEX.test(v) ? v : fb);

const toDNA = (raw: z.infer<typeof AiDnaSchema>, seed: number, brand?: BrandKit): DesignDNA => {
  const d = { ...raw, bg: raw.bg.filter((c) => HEX.test(c)), surface: hexOr(raw.surface, '#1E1E24'), primary: hexOr(raw.primary, '#4F7CFF'), accent: hexOr(raw.accent, '#FF8A3D'), text: hexOr(raw.text, '#FFFFFF') };
  const disp = FONT_BY_ID.get(d.displayFont);
  return finalizeDNA(
    {
      mood: d.mood,
      palette: { bg: d.bg.slice(0, 3).length ? d.bg.slice(0, 3) : [d.surface], surface: d.surface, primary: d.primary, accent: d.accent, text: d.text, textOnAccent: '#FFFFFF' },
      typography: {
        display: { family: d.displayFont, weight: disp ? disp.weights[disp.weights.length - 1]! : 800 },
        body: { family: d.bodyFont, weight: 500 },
        captions: { family: d.captionsFont, weight: 700 },
        latin: d.latinFont === 'none' ? undefined : d.latinFont,
        scale: Math.min(1.3, Math.max(0.8, d.scale)),
        weightContrast: d.weightContrast,
      },
      layoutGrammar: d.layoutGrammar,
      motionLanguage: { easing: d.easing, baseDurationFrames: Math.min(30, Math.max(6, d.baseDurationFrames)), overshoot: Math.min(0.4, Math.max(0, d.overshoot)), stagger: Math.min(8, Math.max(0, d.stagger)), transitionFamily: (d.transitions.length ? d.transitions : (['fade'] as const)).slice(0, 3) },
      background: { kind: d.background, params: { pattern: d.pattern, angle: seed % 360, density: 0.6 } },
      illustrationStyle: d.illustrationStyle,
      iconSet: d.iconSet,
      texture: { grain: Math.min(1, Math.max(0, d.grain)), shadows: d.shadows, corners: Math.min(80, Math.max(0, d.corners)) },
      sfxPalette: d.sfxPalette,
      seed,
    },
    brand,
  );
};

const AiDnaSchema = z.object({
  mood: z.string(), bg: z.array(z.string()), surface: z.string(), primary: z.string(), accent: z.string(), text: z.string(),
  displayFont: z.string(), bodyFont: z.string(), captionsFont: z.string(), latinFont: z.string(), scale: z.number(), weightContrast: z.enum(['low', 'mid', 'high']),
  layoutGrammar: z.enum(LAYOUT_GRAMMARS), easing: z.enum(EASINGS), baseDurationFrames: z.number(), overshoot: z.number(), stagger: z.number(),
  transitions: z.array(z.enum(TRANSITIONS)), background: z.enum(BACKGROUND_KINDS), pattern: z.string(), illustrationStyle: z.string(),
  iconSet: z.enum(['ph', 'tabler', 'solar', 'fluent-emoji-flat']), grain: z.number(), shadows: z.enum(['none', 'soft', 'hard', 'long']), corners: z.number(),
  sfxPalette: z.enum(['soft-ui', 'punchy', 'cinematic', 'playful', 'mechanical']),
});
const n2u = <T,>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);

/** Convert the model's scenes into the internal Plan (nulls → undefined), then Zod-validate. */
export const toPlan = (scenes: Array<Record<string, unknown>>, hookVariants: string[], imageRefs: Array<{ assetId?: string; src?: string }>): Plan => {
  const out = scenes.map((s, i) => {
    const items = ((s.items as Array<Record<string, unknown>>) ?? []).map((it) => ({ text: String(it.text ?? '').slice(0, 80), at: n2u(it.at as string | null), icon: n2u(it.icon as string | null), value: n2u(it.value as number | null), tone: n2u(it.tone as 'good' | 'bad' | 'neutral' | null) }));
    const userImage = n2u(s.userImage as number | null);
    const image = userImage !== undefined && imageRefs[userImage] ? imageRefs[userImage] : s.imagePrompt ? { prompt: String(s.imagePrompt) } : undefined;
    return {
      id: `s${i}`,
      from: String(s.from),
      to: String(s.to),
      primitive: s.primitive,
      variant: Math.min(3, Math.max(0, Number(s.variant ?? 0))),
      transition: s.transition ?? 'cut',
      emphasis: ((s.emphasis as string[]) ?? []).slice(0, 6),
      bgIndex: Math.min(3, Math.max(0, Number(s.bgIndex ?? 0))),
      speaker: n2u(s.speaker as 'full' | null),
      zoomOn: ((s.zoomOn as string[]) ?? []).slice(0, 4),
      locked: false,
      content: {
        headline: n2u(s.headline as string | null)?.slice(0, 90), headlineAt: n2u(s.headlineAt as string | null), sub: n2u(s.sub as string | null)?.slice(0, 140), kicker: n2u(s.kicker as string | null)?.slice(0, 40),
        items: items.length ? items.slice(0, 8) : undefined,
        value: n2u(s.value as number | null), valueFrom: n2u(s.valueFrom as number | null), valueAt: n2u(s.valueAt as string | null), unit: n2u(s.unit as string | null)?.slice(0, 12), prefix: n2u(s.prefix as string | null)?.slice(0, 8),
        icon: n2u(s.icon as string | null), icons: ((s.icons as string[]) ?? []).slice(0, 12),
        price: n2u(s.price as number | null), oldPrice: n2u(s.oldPrice as number | null), wilayas: n2u(s.wilayas as number | null), rating: n2u(s.rating as number | null),
        image: s.primitive === 'hero-scene' ? undefined : image,
        hero: toHero(s.hero as Record<string, unknown> | null | undefined, s.primitive === 'hero-scene' ? image : undefined),
      },
      bg: BG_TREATMENTS.includes(s.bg as 'dna') ? (s.bg as Plan['scenes'][number]['bg']) : undefined,
    };
  });
  return PlanSchema.parse({ scenes: out, hookVariants: hookVariants.slice(0, 3) });
};

/** "highlight=cold;floss=true;value=3" → typed params */
const parseParams = (raw: unknown): Hero['illusParams'] => {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const out: NonNullable<Hero['illusParams']> = {};
  for (const kv of raw.split(/[;,]/)) {
    const [k, v] = kv.split('=').map((x) => x?.trim());
    if (!k || v === undefined) continue;
    out[k] = v === 'true' ? true : v === 'false' ? false : /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
  }
  return out;
};

const toHero = (h: Record<string, unknown> | null | undefined, image?: { assetId?: string; src?: string; prompt?: string }): Hero | undefined => {
  if (!h && !image) return undefined;
  const g = (k: string) => (h?.[k] === null || h?.[k] === undefined ? undefined : h[k]);
  const badgeArt = g('badgeArt') as string | undefined;
  const badgeText = (g('badgeText') as string | undefined)?.slice(0, 24);
  return {
    note: (g('note') as string | undefined)?.slice(0, 240),
    layout: g('layout') as Hero['layout'],
    art: g('art') as string | undefined,
    art2: g('art2') as string | undefined,
    illus: g('illus') as string | undefined,
    illusParams: parseParams(g('illusParams')),
    image,
    cutout: image && !image.prompt ? true : undefined,
    mark: g('mark') as Hero['mark'],
    markAt: g('markAt') as string | undefined,
    props: ((g('props') as string[] | undefined) ?? []).slice(0, 5),
    count: g('count') !== undefined ? Math.min(12, Math.max(1, Math.round(Number(g('count'))))) : undefined,
    highlight: g('highlight') !== undefined ? Math.min(12, Math.max(0, Math.round(Number(g('highlight'))))) : undefined,
    badge: badgeArt || badgeText ? { art: badgeArt, text: badgeText, at: g('badgeAt') as string | undefined } : undefined,
    backdrop: g('backdrop') as Hero['backdrop'],
  };
};

export const claudeDirector = (apiKey: string, brand?: BrandKit, imageRefs: Array<{ assetId?: string; src?: string }> = []): Director => ({
  id: 'claude',
  async direct(req: DirectorRequest) {
    const beats = buildBeats(req.transcript.words, (req.pacing as 'auto') ?? 'auto');
    const user = [
      `MODE: ${req.mode}  TOPIC HINT: ${req.topicHint}  BUSINESS: ${req.business}  PACING: ${req.pacing}`,
      req.idea && `IDEA/CONTEXT: ${req.idea}`,
      req.visualStyle !== 'auto' && `VISUAL STYLE INGREDIENT: ${req.visualStyle}`,
      req.artDirection && `ART DIRECTION FROM USER: ${req.artDirection}`,
      req.brandColors.length && `BRAND COLOURS (must use): ${req.brandColors.join(', ')}`,
      req.product && `PRODUCT INFO (use only what is also said): ${JSON.stringify(req.product)}`,
      req.userImages.length && `USER IMAGES: ${req.userImages.map((i) => `#${i.index}${i.note ? ` (${i.note})` : ''}`).join(', ')}`,
      req.avoid.length && `AVOID (recent videos): ${req.avoid.map((a) => `${a.mood}/${a.easing}/[${a.sequence.join(',')}]`).join(' ; ')}`,
      `IMAGE GENERATION: ${req.imageGen ? 'available' : 'not available'}`,
      `SEED: ${req.seed}`,
      `SUGGESTED BEATS: ${beats.map((b) => `[${b.words[0]!.id}-${b.words[b.words.length - 1]!.id} ${b.type}]`).join(' ')}`,
      `WORDS (id:text@seconds): ${wordList(req.transcript)}`,
    ].filter(Boolean).join('\n');
    const res = await client(apiKey).messages.create({
      model: MODELS.director,
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      system: [
        { type: 'text', text: RULES },
        { type: 'text', text: catalog(), cache_control: { type: 'ephemeral' } },
      ],
      tools: [{ name: 'submit_reel_plan', description: 'Submit the Design DNA and the word-anchored scene plan.', input_schema: TOOL_SCHEMA as Anthropic.Tool['input_schema'], strict: true } as Anthropic.Tool],
      messages: [{ role: 'user', content: [
        ...(req.referenceImage ? [{ type: 'text' as const, text: 'REFERENCE IMAGE from the user: extract palette, mood and composition ideas from it (do not copy it).' }, { type: 'image' as const, source: { type: 'base64' as const, media_type: req.referenceImage.mime as 'image/png', data: req.referenceImage.base64 } }] : []),
        { type: 'text' as const, text: `${user}\n\nDesign this reel, then call submit_reel_plan.` },
      ] }],
    } as Anthropic.MessageCreateParamsNonStreaming);
    await logCost({ projectId: req.projectId ?? null, provider: 'anthropic', model: MODELS.director, op: 'direct', units: (res.usage.input_tokens ?? 0) + (res.usage.output_tokens ?? 0), unitLabel: 'tokens', usd: claudeCost(MODELS.director, res.usage) });
    if (res.stop_reason === 'refusal') throw new Error('Claude declined this request.');
    const call = res.content.find((b) => b.type === 'tool_use');
    if (!call || call.type !== 'tool_use') throw new Error('Claude did not return a plan.');
    const input = call.input as { dna: unknown; scenes: Array<Record<string, unknown>>; hookVariants: string[] };
    const dna = toDNA(AiDnaSchema.parse(input.dna), req.seed, brand);
    const plan = toPlan(input.scenes, input.hookVariants ?? [], imageRefs);
    return { dna, plan };
  },
});

const FixSchema = z.object({ fixes: z.array(z.object({ id: z.string(), text: z.string() })) });

/** "Fix with AI": correct spelling of what was said — never meaning or word order (SPEC §3 step 4). */
export const claudeFixTranscript = async (apiKey: string, t: Transcript, vocabulary: string, idea: string, projectId?: string) => {
  const res = await client(apiKey).messages.create({
    model: MODELS.director,
    max_tokens: 8000,
    output_config: { effort: 'low' },
    system: 'You correct speech-to-text errors in Algerian Darija / Arabic / French transcripts. Only fix the spelling of words that were clearly mis-transcribed, using context and the custom vocabulary. Never change meaning, never translate Darija to MSA, never reorder, add or remove words. Return only the words you changed, by id, via the submit_fixes tool.',
    tools: [{ name: 'submit_fixes', description: 'Corrected words', strict: true, input_schema: { type: 'object', additionalProperties: false, required: ['fixes'], properties: { fixes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'text'], properties: { id: { type: 'string' }, text: { type: 'string' } } } } } } } as Anthropic.Tool],
    messages: [{ role: 'user', content: `Vocabulary: ${vocabulary || '-'}\nContext: ${idea || '-'}\nWords: ${t.words.map((w) => `${w.id}:${w.text}`).join(' ')}\n\nCall submit_fixes.` }],
  } as Anthropic.MessageCreateParamsNonStreaming);
  await logCost({ projectId: projectId ?? null, provider: 'anthropic', model: MODELS.director, op: 'fix-transcript', units: res.usage.input_tokens + res.usage.output_tokens, unitLabel: 'tokens', usd: claudeCost(MODELS.director, res.usage) });
  const call = res.content.find((b) => b.type === 'tool_use');
  if (!call || call.type !== 'tool_use') return [];
  const ids = new Set(t.words.map((w) => w.id));
  return FixSchema.parse(call.input).fixes.filter((f) => ids.has(f.id) && f.text.trim() && !/\s/.test(f.text.trim()));
};

const VisionSchema = z.object({ issues: z.array(z.object({ scene: z.number().int(), severity: z.enum(['error', 'warning']), kind: z.enum(['unreadable', 'composition', 'reading-order', 'meaning-mismatch', 'cultural', 'arabic-shaping', 'other']), message: z.string() })) });
export type VisionIssue = z.infer<typeof VisionSchema>['issues'][number];

/** Vision QA on rendered stills (SPEC §8.2). */
export const claudeVisionQA = async (apiKey: string, stills: Array<{ scene: number; png: string; said: string }>, projectId?: string): Promise<VisionIssue[]> => {
  const content: Anthropic.ContentBlockParam[] = [];
  for (const s of stills) {
    content.push({ type: 'text', text: `Scene ${s.scene} — speech at this moment: "${s.said}"` });
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: s.png } });
  }
  content.push({ type: 'text', text: 'Flag only real problems: unreadable text, awkward composition, wrong reading order, visual not matching the speech, culturally inappropriate imagery, broken Arabic shaping (disconnected letters, reversed order). Call submit_issues (empty list if all good).' });
  const res = await client(apiKey).messages.create({
    model: MODELS.director,
    max_tokens: 4000,
    output_config: { effort: 'low' },
    system: 'You are a strict motion-graphics QA reviewer for Arabic/French vertical reels.',
    tools: [{ name: 'submit_issues', description: 'QA issues', strict: true, input_schema: { type: 'object', additionalProperties: false, required: ['issues'], properties: { issues: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['scene', 'severity', 'kind', 'message'], properties: { scene: { type: 'integer' }, severity: { type: 'string', enum: ['error', 'warning'] }, kind: { type: 'string', enum: ['unreadable', 'composition', 'reading-order', 'meaning-mismatch', 'cultural', 'arabic-shaping', 'other'] }, message: { type: 'string' } } } } } } } as Anthropic.Tool],
    messages: [{ role: 'user', content }],
  } as Anthropic.MessageCreateParamsNonStreaming);
  await logCost({ projectId: projectId ?? null, provider: 'anthropic', model: MODELS.director, op: 'vision-qa', units: res.usage.input_tokens + res.usage.output_tokens, unitLabel: 'tokens', usd: claudeCost(MODELS.director, res.usage) });
  const call = res.content.find((b) => b.type === 'tool_use');
  if (!call || call.type !== 'tool_use') return [];
  return VisionSchema.parse(call.input).issues;
};
