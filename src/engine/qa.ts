/**
 * Automated video QA on a compiled reel (video-qa skill §1). Runs before every preview/export and in unit tests.
 * Errors are auto-fixed where possible (see autofix); the rest is reported.
 */
import type { CLayer, Compiled, CScene } from './compile';
import { bgColorFor, contrast } from './render/theme';
import { ART_BOX, ART_FILL } from './artMeta';
import { STICKERS } from './stickers';
import { fallbackVisual, heroWidth, visualFor, visualSrc } from './concepts';
import { makeResolver } from './assets';

export type Issue = { scene: string; layer?: string; code: 'short-scene' | 'out-of-frame' | 'contrast' | 'static' | 'crowded' | 'missing-asset' | 'late-layer' | 'no-text' | 'no-hero' | 'bg-repeat' | 'bg-variety' | 'hero-reuse' | 'collision'; msg: string };

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

type Rect = [number, number, number, number];
const TEXT_PX: Record<string, number> = { xs: 44, s: 64, m: 92, l: 128, xl: 172, xxl: 230, mega: 310 };
const COUNTER_PX: Record<string, number> = { l: 150, xl: 210, xxl: 290, mega: 400 };
const ARABIC = /[\u0600-\u06FF]/;

/** Approximate on-screen rect of a readable element (text block, counter, button) in px; null for decorative layers. */
export const readableRect = (c: CScene['layers'][number], W: number, H: number): Rect | null => {
  const u = Math.min(W, H) / 1080;
  if (c.type === 'text') {
    if (c.opacity < 0.5 || c.exitAt) return null;
    const lines = c.words ?? [];
    const anyEm = lines.some((ln) => ln.some((w) => w.em && w.em !== 'ghost'));
    const ls = lines.map((ln) => (c.hier !== false && anyEm && lines.length > 1 && !ln.some((w) => w.em && w.em !== 'ghost') ? 0.5 : 1));
    const size = TEXT_PX[c.size]! * u;
    const boxW = Math.min(c.w, 0.83) * W;
    const lineW = lines.map((ln, i) => Math.min(boxW, ln.reduce((a, w) => a + (w.t.length + 1) * size * ls[i]! * (w.em === 'big' ? 0.7 : 0.5), 0)));
    const tw = Math.max(0, ...lineW);
    const th = ls.reduce((a, k) => a + k * size * 1.3, 0);
    const rtl = ARABIC.test(lines.flat().map((w) => w.t).join(''));
    const cx = c.x * W;
    const right = c.align === 'center' ? cx + tw / 2 : (c.align === 'start') === rtl ? cx + boxW / 2 : cx - boxW / 2 + tw;
    const cy = Math.min(Math.max(c.y * H, 0.1 * H + th / 2), 0.8 * H - th / 2);
    return [right - tw, cy - th / 2, right, cy + th / 2];
  }
  if (c.type === 'counter') {
    const h = COUNTER_PX[c.size]! * u;
    const tw = (String(c.value).length + c.prefix.length + c.suffix.length) * h * 0.62;
    return [c.x * W - tw / 2, c.y * H - h * 0.6, c.x * W + tw / 2, c.y * H + h * 0.5];
  }
  if (c.type === 'ui' && c.kind === 'button') {
    const h = 120 * u, tw = Math.min(c.w * W, (c.title.length + 3) * 32 * u + 90 * u);
    return [c.x * W - tw / 2, c.y * H - h / 2, c.x * W + tw / 2, c.y * H + h / 2];
  }
  return null;
};

/** Visible rect of an image layer (alpha bbox for bundled cut-outs) in px. */
export const imageRect = (l: CScene['layers'][number], W: number, H: number): Rect | null => {
  if (l.type !== 'image' || l.opacity < 0.5) return null;
  const bw = l.w * W;
  const bh = (l.h ?? l.w * (l.frame === 'phone' ? 2.05 : l.frame === 'polaroid' ? 1.18 : l.frame === 'tv' ? 0.85 : 1)) * (l.h ? H : W);
  const x0 = l.x * W - bw / 2, y0 = l.y * H - bh / 2;
  const key = artKey(l);
  const b = key && l.frame === 'none' && l.fit === 'contain' ? ART_BOX[key] : undefined;
  return b ? [x0 + b[0] * bw, y0 + b[1] * bh, x0 + b[2] * bw, y0 + b[3] * bh] : [x0, y0, x0 + bw, y0 + bh];
};
const overlap = (a: Rect, b: Rect) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
const area = (a: Rect) => Math.max(1, (a[2] - a[0]) * (a[3] - a[1]));

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
    // readable things (text, numbers, buttons) must not sit on top of a picture or each other once everything has landed
    const reads = s.layers.map((l) => [l, readableRect(l, c.width, c.height)] as const).filter((x): x is readonly [CLayer, Rect] => !!x[1]);
    const pics = s.layers.map((l) => [l, imageRect(l, c.width, c.height)] as const).filter((x): x is readonly [CLayer, Rect] => !!x[1]);
    for (const [tl, tr] of reads) {
      for (const [il, ir] of pics) {
        const k = overlap(tr, ir) / area(tr);
        if (k > 0.08) out.push({ scene: s.id, layer: tl.id, code: 'collision', msg: `${(k * 100).toFixed(0)} % of ${tl.id} covered by ${il.id}` });
      }
      for (const [ol, or] of reads) {
        if (ol === tl || ol.id < tl.id) continue;
        const k = overlap(tr, or) / Math.min(area(tr), area(or));
        if (k > 0.15) out.push({ scene: s.id, layer: tl.id, code: 'collision', msg: `${tl.id} overlaps ${ol.id} (${(k * 100).toFixed(0)} %)` });
      }
    }
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
  settleCollisions(c);
  return checkReel(c);
};

/** Pictures give way to text: move a colliding image away from the text it covers, then shrink it a little. */
export const settleCollisions = (c: Compiled) => {
  const W = c.width, H = c.height;
  for (const s of c.scenes) {
    const reads = s.layers.map((l) => readableRect(l, W, H)).filter((r): r is Rect => !!r);
    if (!reads.length) continue;
    for (const l of s.layers) {
      if (l.type !== 'image' || l.exitAt) continue;
      for (let k = 0; k < 16; k++) {
        const ir = imageRect(l, W, H);
        if (!ir) break;
        const hit = reads.find((tr) => overlap(tr, ir) / area(tr) > 0.06);
        if (!hit) break;
        const down = (ir[1] + ir[3]) / 2 >= (hit[1] + hit[3]) / 2;
        const ny = l.y + (down ? 0.025 : -0.025);
        if (ny > 0.2 && ny < 0.82 && k < 10) l.y = ny;
        else l.w *= 0.94;
      }
    }
  }
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
      if (l.type === 'ui' && l.kind === 'button') l.y = Math.max(l.y, 0.82);
    }
    const firstText = s.layers.find((l) => l.type === 'text' && l.opacity >= 0.5);
    const inF = Math.min(s.duration - 8, (firstText?.inF ?? 0) + 6);
    const layer = { id: `hero${s.index}`, type: 'image' as const, src, x: 0.5, y: 0.64, w: heroWidth(v, 0.9, 0.3, c.width / c.height), rotate: 0, opacity: 1, anim: 'pop' as const, idle: 'float' as const, shadow: true, frame: 'none' as const, fit: 'contain' as const, depth: 0.6, flipX: false, inF, outF: null, url };
    // DOM order is z-order: behind the text, above background shapes
    const ti = s.layers.findIndex((l) => l.type === 'text' && l.opacity >= 0.5);
    s.layers.splice(ti < 0 ? s.layers.length : ti, 0, layer);
  });
};

