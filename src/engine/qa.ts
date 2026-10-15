/**
 * Automated video QA on a compiled reel (video-qa skill §1). Runs before every preview/export and in unit tests.
 * Errors are auto-fixed where possible (see autofix); the rest is reported.
 */
import type { Compiled, CScene } from './compile';
import { bgColorFor, contrast } from './render/theme';

export type Issue = { scene: string; layer?: string; code: 'short-scene' | 'out-of-frame' | 'contrast' | 'static' | 'crowded' | 'missing-asset' | 'late-layer' | 'no-text'; msg: string };

const SAFE = { x0: 0.07, x1: 0.9, y0: 0.1, y1: 0.8 };

export const checkReel = (c: Compiled): Issue[] => {
  const out: Issue[] = [];
  const st = c.plan.style;
  for (const s of c.scenes) {
    if (s.isEnd) continue;
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
  return checkReel(c);
};
