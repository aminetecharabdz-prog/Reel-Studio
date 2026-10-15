/**
 * Automated video QA on a compiled reel (video-qa skill §1). Runs before every preview/export and in unit tests.
 * Errors are auto-fixed where possible (see autofix); the rest is reported.
 */
import type { CLayer, Compiled, CScene } from './compile';
import { bgColorFor, contrast } from './render/theme';
import { ART_FILL } from './artMeta';
import { STICKERS } from './stickers';
import { fallbackVisual, heroWidth, visualFor, visualSrc } from './concepts';
import { makeResolver } from './assets';

export type Issue = { scene: string; layer?: string; code: 'short-scene' | 'out-of-frame' | 'contrast' | 'static' | 'crowded' | 'missing-asset' | 'late-layer' | 'no-text' | 'no-hero' | 'bg-repeat' | 'bg-variety' | 'hero-reuse'; msg: string };

const SAFE = { x0: 0.07, x1: 0.9, y0: 0.1, y1: 0.8 };

/** Minimum share of the frame covered by the scene's hero visual(s) — QUALITY_BAR MUST 1 ("no empty scenes").
 * Measured on the object's visible (alpha) bbox, which is stricter than the layer box: 0.2 ≈ a layer box of ~35 %. */
export const HERO_MIN = 0.2;

const artKey = (l: CLayer) => {
  if (l.type !== 'image') return null;
  const n = l.src.name;
  if (!n) return null;
  if (l.src.kind === 'library') return n;
  return STICKERS.has(n) ? `3d/${n}` : null;
};

/** Share of the frame covered by hero visuals (images, big numbers, price/stat cards, full-bleed photos, the speaker). */
export const heroArea = (c: Compiled, s: CScene): number => {
  const W = c.width, H = c.height;
  if (s.bg.kind === 'photo' && s.bgUrl) return 1;
  if (c.mode === 'talking' && (s.speaker ?? 'full') !== 'hidden' && s.speaker !== 'pip') return s.speaker === 'top' || s.speaker === 'bottom' ? 0.52 : 1;
  let a = 0;
  for (const l of s.layers) {
    if (l.opacity < 0.5) continue;
    if (l.type === 'image') {
      const key = artKey(l);
      const framed = l.frame !== 'none' || l.fit === 'cover';
      const fill = framed ? 1 : key ? ART_FILL[key] ?? 0.6 : l.src.kind === 'user' ? 0.65 : 0.7;
      const bw = l.w * W;
      const bh = (l.h ?? l.w * (l.frame === 'phone' ? 2.05 : l.frame === 'polaroid' ? 1.18 : l.frame === 'tv' ? 0.85 : 1)) * (l.h ? H : W);
      const x0 = Math.max(0, l.x * W - bw / 2), x1 = Math.min(W, l.x * W + bw / 2);
      const y0 = Math.max(0, l.y * H - bh / 2), y1 = Math.min(H, l.y * H + bh / 2);
      const inFrame = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
      a += (inFrame / (W * H)) * fill;
    } else if (l.type === 'counter') a += l.size === 'mega' ? 0.14 : l.size === 'xxl' ? 0.08 : 0.04;
    else if (l.type === 'ui') a += ['price', 'stat', 'checklist', 'chat', 'timer'].includes(l.kind) ? Math.max(0.16, l.w * 0.25) : ['profile', 'notification', 'rating', 'progress', 'search'].includes(l.kind) ? l.w * 0.12 : 0;
  }
  return Math.min(1, a);
};

const bgSig = (s: CScene) => `${s.bg.kind}|${s.bg.tone}|${s.bg.image?.name ?? ''}|${s.bg.color ?? ''}`;

export const checkReel = (c: Compiled): Issue[] => {
  const out: Issue[] = [];
  const st = c.plan.style;
  const body = c.scenes.filter((s) => !s.isEnd);
  // backgrounds: ≥ 3 different treatments per video, never the same one twice in a row (QUALITY_BAR MUST 4)
  if (body.length >= 4 && new Set(body.map(bgSig)).size < 3) out.push({ scene: '*', code: 'bg-variety', msg: `${new Set(body.map(bgSig)).size} background treatments` });
  body.forEach((s, i) => {
    if (i > 0 && bgSig(s) === bgSig(body[i - 1]!)) out.push({ scene: s.id, code: 'bg-repeat', msg: `same background as ${body[i - 1]!.id}` });
  });
  // the same cut-out as hero in many scenes reads as a template (the product itself is allowed to recur)
  if (c.mode !== 'product') {
    const uses = new Map<string, string[]>();
    for (const s of body) for (const l of s.layers) {
      const k = artKey(l);
      if (k) uses.set(k, [...new Set([...(uses.get(k) ?? []), s.id])]);
    }
    for (const [k, ids] of uses) if (ids.length > 1) out.push({ scene: ids.join(','), code: 'hero-reuse', msg: `${k} used in ${ids.length} scenes` });
  }
  for (const s of body) {
    const ha = heroArea(c, s);
    if (ha < HERO_MIN) out.push({ scene: s.id, code: 'no-hero', msg: `hero covers ${(ha * 100).toFixed(0)} % of the frame` });
    if (s.duration < 12) out.push({ scene: s.id, code: 'short-scene', msg: `${s.duration} frames` });
    if (s.layers.length > 9) out.push({ scene: s.id, code: 'crowded', msg: `${s.layers.length} layers` });
    const base = bgColorFor(st, s.bg.tone, s.bg.color);
    // something must move at least every 2 s (entrances; idle loops and camera also help)
    const starts = [0, ...s.layers.flatMap((l) => (l.words ? l.words.flat().map((w) => w.inF) : [l.inF]))].sort((a, b) => a - b);
    const gaps = starts.map((f, i) => (starts[i + 1] ?? s.duration) - f);
    if (s.camera.move === 'none' && Math.max(...gaps) > c.fps * 2) out.push({ scene: s.id, code: 'static', msg: `${Math.max(...gaps)} frames without motion` });
    for (const l of s.layers) {
      if (l.inF >= s.duration) out.push({ scene: s.id, layer: l.id, code: 'late-layer', msg: 'enters after the scene ends' });
      if (l.type === 'image' && !l.url) out.push({ scene: s.id, layer: l.id, code: 'missing-asset', msg: 'image not resolved' });
      if (l.type === 'text' || l.type === 'counter' || l.type === 'ui') {
        if (l.x < SAFE.x0 - 0.02 || l.x > SAFE.x1 + 0.02 || l.y < SAFE.y0 - 0.02 || l.y > SAFE.y1 + 0.04) out.push({ scene: s.id, layer: l.id, code: 'out-of-frame', msg: `centre ${l.x.toFixed(2)},${l.y.toFixed(2)} outside safe area` });
      }
      if (l.type === 'text' && !s.bgUrl) {
        const col = l.color === 'white' ? '#FFFFFF' : l.color === 'black' ? '#0B0B0F' : null;
        if (col && contrast(col, base) < 3 && l.opacity > 0.5) out.push({ scene: s.id, layer: l.id, code: 'contrast', msg: `${col} on ${base}` });
      }
    }
  }
  return out;
};

/** Fix what can be fixed without changing the creative intent; returns the issues that remain. */
export const autofix = (c: Compiled): Issue[] => {
  const clampXY = (s: CScene) => s.layers.forEach((l) => {
    if (l.type === 'text' || l.type === 'counter' || l.type === 'ui') {
      l.x = Math.min(SAFE.x1, Math.max(SAFE.x0, l.x));
      l.y = Math.min(SAFE.y1 + 0.02, Math.max(SAFE.y0, l.y));
    }
  });
  for (const s of c.scenes) {
    clampXY(s);
    // drop unresolved images (never show a broken frame)
    s.layers = s.layers.filter((l) => l.type !== 'image' || !!l.url);
    for (const l of s.layers) if (l.inF >= s.duration) l.inF = Math.max(0, s.duration - 8);
    // white/black text on a background it can't be read on → switch to the auto-contrast ink
    const base = bgColorFor(c.plan.style, s.bg.tone, s.bg.color);
    for (const l of s.layers) if (l.type === 'text' && (l.color === 'white' || l.color === 'black') && contrast(l.color === 'white' ? '#FFFFFF' : '#0B0B0F', base) < 3 && !s.bgUrl) l.color = 'ink';
  }
  addMissingHeroes(c);
  return checkReel(c);
};

/** A scene without a hero gets the visual its words name (concept lexicon), text moves to the top third. */
export const addMissingHeroes = (c: Compiled) => {
  const resolve = makeResolver(() => null);
  const used = new Set<string>();
  for (const s of c.scenes) for (const l of s.layers) {
    const k = artKey(l);
    if (k) used.add(k);
  }
  const body = c.scenes.filter((s) => !s.isEnd);
  body.forEach((s, i) => {
    if (heroArea(c, s) >= HERO_MIN) return;
    const words = s.layers.flatMap((l) => (l.type === 'text' && l.opacity >= 0.5 ? (l.words ?? []).flat().map((w) => w.t) : []));
    const role = i === 0 ? 'hook' : i === body.length - 1 ? 'cta' : 'body';
    const v = visualFor(words, used) ?? fallbackVisual(words, role, used);
    used.add(v);
    const src = visualSrc(v);
    const url = resolve(src);
    if (!url) return;
    // make room: main text into the top third, small items (buttons, badges) to the very bottom
    for (const l of s.layers) {
      if (l.type === 'text' && l.opacity >= 0.5 && l.y > 0.4) l.y = 0.26;
      if (l.type === 'ui' && l.kind === 'button') l.y = Math.max(l.y, 0.84);
    }
    const firstText = s.layers.find((l) => l.type === 'text' && l.opacity >= 0.5);
    const inF = Math.min(s.duration - 8, (firstText?.inF ?? 0) + 6);
    const layer = { id: `hero${s.index}`, type: 'image' as const, src, x: 0.5, y: 0.64, w: heroWidth(v, 0.9, 0.3, c.width / c.height), rotate: 0, opacity: 1, anim: 'pop' as const, idle: 'float' as const, shadow: true, frame: 'none' as const, fit: 'contain' as const, depth: 0.6, flipX: false, inF, outF: null, url };
    // DOM order is z-order: behind the text, above background shapes
    const ti = s.layers.findIndex((l) => l.type === 'text' && l.opacity >= 0.5);
    s.layers.splice(ti < 0 ? s.layers.length : ti, 0, layer);
  });
};

