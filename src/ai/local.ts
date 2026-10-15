/**
 * No-key fallback director: kinetic typography only (plus the user's own product photos).
 * It never maps keywords to pictures — with Claude connected, the AI decides the visuals.
 */
import type { Layer, MWord, Plan, Scene, Style, Transcript, Word } from '@/engine/schema';
import { phrases } from '@/engine/timing';
import { salience } from '@/engine/text';

const rng = (seedStr: string) => {
  let a = 2166136261;
  for (const ch of seedStr) a = Math.imul(a ^ ch.charCodeAt(0), 16777619);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const hsl = (h: number, s: number, l: number) => {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${[f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')}`;
};

const PAIRS = [
  { display: ['alexandria', 'inter', 900], serif: ['amiri', 'playfair'], impact: ['changa', 'bebas'] },
  { display: ['cairo', 'archivo-black', 900], serif: ['el-messiri', 'fraunces'], impact: ['lalezar', 'bebas'] },
  { display: ['readex', 'space-grotesk', 700], serif: ['amiri', 'playfair'], impact: ['changa', 'unbounded'] },
  { display: ['tajawal', 'syne', 900], serif: ['el-messiri', 'playfair'], impact: ['rakkas', 'bebas'] },
  { display: ['ibm-plex', 'inter', 700], serif: ['noto-naskh', 'fraunces'], impact: ['changa', 'bebas'] },
] as const;

export const localStyle = (seed: string, brandColors: string[] = []): Style => {
  const r = rng(seed);
  const h = Math.floor(r() * 360);
  const p = PAIRS[Math.floor(r() * PAIRS.length)]!;
  const warmPaper = r() > 0.5;
  return {
    name: 'Kinetic',
    palette: {
      ink: hsl(h, 18, 9),
      paper: warmPaper ? hsl(40, 30, 93) : hsl(h, 14, 94),
      accent: brandColors[0] ?? hsl(h, 88, 56),
      accent2: brandColors[1] ?? hsl((h + 150 + Math.floor(r() * 60)) % 360, 92, 60),
      muted: hsl(h, 8, 55),
      dark: hsl(h, 22, 6),
    },
    fonts: {
      display: { ar: p.display[0], lat: p.display[1], weight: p.display[2], italic: false },
      serif: { ar: p.serif[0], lat: p.serif[1], weight: 700, italic: true },
      body: { ar: 'readex', lat: 'inter', weight: 500, italic: false },
      impact: { ar: p.impact[0], lat: p.impact[1], weight: 800, italic: false },
    },
    grain: 0.24,
    motion: (['snappy', 'smooth', 'bouncy'] as const)[Math.floor(r() * 3)]!,
    music: (['upbeat-pop', 'tech-pulse', 'warm-pluck'] as const)[Math.floor(r() * 3)]!,
    sfx: 'punchy',
    captions: 'none',
  };
};

export const localDirector = (tr: Transcript, o: { mode: 'content' | 'product' | 'talking'; seed?: string; media?: number; brandColors?: string[]; cta?: string }): Plan => {
  const seed = o.seed ?? tr.words.map((w) => w.text).join(' ');
  const r = rng(seed + ':layout');
  const style = localStyle(seed, o.brandColors);
  const beats = phrases(tr.words, 7, 420);
  // merge very short beats
  const merged: Word[][] = [];
  for (const b of beats) {
    const last = merged[merged.length - 1];
    if (last && (last.length < 3 || b.length < 2) && last.length + b.length <= 8) last.push(...b);
    else merged.push([...b]);
  }
  const tones: Scene['bg']['tone'][] = ['dark', 'light', 'dark', 'accent', 'light', 'dark'];
  const kinds: Scene['bg']['kind'][] = ['spotlight', 'paper', 'noise-dark', 'gradient', 'paper', 'rays', 'split'];
  const anims = ['rise', 'mask', 'pop', 'blur', 'slide', 'stamp'] as const;
  const ems = ['accent', 'serif', 'highlight', 'big', 'underline', 'box'] as const;
  const trans: Scene['transition'][] = ['cut', 'cut', 'whip', 'cut', 'zoom', 'cut', 'flash'];
  const cams: Scene['camera']['move'][] = ['push', 'drift', 'push', 'punch', 'rise', 'pan-left'];
  let mediaUse = 0;
  const scenes: Scene[] = merged.map((b, i) => {
    const tone = i === 0 ? 'dark' : tones[(i + Math.floor(r() * 2)) % tones.length]!;
    let kind = kinds[(i * 3 + Math.floor(r() * 3)) % kinds.length]!;
    if (tone === 'light' && kind !== 'paper' && kind !== 'split') kind = 'paper';
    if (tone === 'accent') kind = 'gradient';
    const best = b.reduce((bi, w, k) => (salience(w.text) > salience(b[bi]!.text) ? k : bi), 0);
    const em = ems[(i + Math.floor(r() * 3)) % ems.length]!;
    // lines of 1–3 words, breaking before the emphasised word when possible
    const lines: MWord[][] = [];
    let cur: MWord[] = [];
    b.forEach((w, k) => {
      if (cur.length >= (k === best ? 1 : 3)) {
        lines.push(cur);
        cur = [];
      }
      cur.push({ t: w.text, at: w.id, ...(k === best && salience(w.text) > 0 ? { em } : {}) });
    });
    if (cur.length) lines.push(cur);
    const layers: Layer[] = [];
    const num = b.find((w) => /^\d+([.,]\d+)?%?$/.test(w.text.replace(/[^\d.,%]/g, '')) && /\d/.test(w.text));
    const hasMedia = (o.media ?? 0) > 0 && (o.mode === 'product' ? i % 2 === 0 : i % 3 === 1);
    const layout = hasMedia ? 'media' : num ? 'number' : (['center', 'top', 'bottom'] as const)[Math.floor(r() * 3)]!;
    const size = lines.length >= 4 ? 'l' : lines.length === 3 ? 'xl' : 'xxl';
    const anim = anims[Math.floor(r() * anims.length)]!;
    if (layout === 'media') {
      const idx = mediaUse++ % (o.media ?? 1);
      layers.push({ id: `m${i}`, type: 'image', src: { kind: 'user', index: idx, cutout: true }, x: 0.5, y: 0.36, w: 0.7, rotate: 0, at: b[0]!.id, opacity: 1, anim: 'pop', idle: 'float', shadow: true, frame: 'none', fit: 'contain', depth: 0.6, flipX: false });
      layers.push({ id: `t${i}`, type: 'text', lines, x: 0.5, y: 0.7, w: 0.86, rotate: 0, opacity: 1, role: 'display', size: lines.length > 2 ? 'l' : 'xl', color: 'ink', align: 'center', anim, tracking: 0, hier: true });
    } else if (layout === 'number' && num) {
      const v = parseFloat(num.text.replace(/[^\d.]/g, ''));
      layers.push({ id: `c${i}`, type: 'counter', value: isFinite(v) ? v : 0, from: 0, prefix: '', suffix: num.text.includes('%') ? '%' : '', decimals: 0, size: 'mega', color: 'accent', role: 'impact', x: 0.5, y: 0.36, w: 0.8, rotate: 0, at: num.id, opacity: 1 });
      layers.push({ id: `t${i}`, type: 'text', lines, x: 0.5, y: 0.64, w: 0.86, rotate: 0, opacity: 1, role: 'display', size: 'l', color: 'ink', align: 'center', anim, tracking: 0, hier: true });
    } else {
      const y = layout === 'top' ? 0.34 : layout === 'bottom' ? 0.6 : 0.46;
      layers.push({ id: `t${i}`, type: 'text', lines, x: 0.5, y, w: 0.88, rotate: 0, opacity: 1, role: 'display', size, color: tone === 'accent' ? 'white' : 'ink', align: layout === 'center' ? 'center' : 'start', anim, tracking: 0, hier: true });
      if (r() > 0.55) layers.push({ id: `g${i}`, type: 'shape', kind: (['underline', 'spark', 'dots', 'ring'] as const)[Math.floor(r() * 4)]!, x: layout === 'top' ? 0.7 : 0.25, y: layout === 'top' ? 0.66 : 0.24, w: 0.18, rotate: 0, at: b[best]!.id, opacity: 1, color: 'accent2', fill: false, stroke: 8, anim: 'pop' });
    }
    return {
      id: `s${i}`, from: b[0]!.id, to: b[b.length - 1]!.id, intent: '',
      bg: { kind, tone, grid: r() > 0.6, vignette: true, leak: tone === 'dark' && r() > 0.5, glow: tone === 'dark' ? 'accent' : undefined },
      camera: { move: cams[(i + Math.floor(r() * 3)) % cams.length]!, amount: 0.4 },
      transition: i === 0 ? 'cut' : trans[Math.floor(r() * trans.length)]!,
      speaker: o.mode === 'talking' ? (['full', 'top', 'full', 'bottom', 'pip'] as const)[i % 5] : undefined,
      layers: o.mode === 'talking' && i % 5 === 0 ? layers.map((l) => (l.type === 'text' ? { ...l, y: 0.72, size: 'l' as const } : l)) : layers,
    };
  });
  if (o.cta && scenes.length) {
    const last = scenes[scenes.length - 1]!;
    last.layers.push({ id: 'cta', type: 'ui', kind: 'button', title: o.cta, sub: '', items: [], x: 0.5, y: 0.8, w: 0.7, rotate: 0, opacity: 1, color: 'accent', anim: 'pop', at: tr.words[tr.words.length - 1]!.id });
  }
  if (o.mode === 'talking') style.captions = 'pop';
  return { v: 1, style, scenes, hooks: [], author: 'local' };
};
