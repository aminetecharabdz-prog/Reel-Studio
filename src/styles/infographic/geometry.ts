/**
 * infographic geometry: the layout per aspect (STYLE.md §4 — split for 16:9, stacked for 9:16/4:5, centred for 1:1)
 * and, for every beat, its visual's geometry + 100 "unit" points used to morph one visual into the next.
 */
import { random } from 'remotion';
import type { Beat } from './schema';

export type Layout = {
  W: number;
  H: number;
  u: number;
  mode: 'split' | 'stack' | 'centre';
  /** the visual's centre and size */
  cx: number;
  cy: number;
  S: number;
  /** text block anchor: right edge x (RTL start), top y, width */
  tx: number;
  ty: number;
  tw: number;
  /** where the number goes when it is not in the text column (stack/centre) */
  ny: number;
};

export const layoutFor = (W: number, H: number): Layout => {
  const u = Math.min(W, H) / 1080;
  if (W > H * 1.2) return { W, H, u, mode: 'split', cx: W * 0.32, cy: H * 0.52, S: W * 0.3, tx: W * 0.92, ty: H * 0.3, tw: W * 0.4, ny: 0 };
  if (H > W * 1.2) {
    const S = W * 0.72;
    const cy = H * 0.47;
    return { W, H, u, mode: 'stack', cx: W / 2, cy, S, tx: W * 0.92, ty: H * 0.12, tw: W * 0.84, ny: cy + S * 0.58 };
  }
  const S = Math.min(W, H) * 0.5;
  const cy = H * 0.5;
  return { W, H, u, mode: 'centre', cx: W / 2, cy, S, tx: W * 0.92, ty: H * 0.08, tw: W * 0.84, ny: cy + S * 0.6 };
};

export type Pt = { x: number; y: number; r: number; hot: boolean };

/** bar geometry (also used by versus) */
export const barBox = (L: Layout) => {
  const w = L.mode === 'split' ? L.W * 0.73 : L.W * 0.84;
  const h = w * (L.mode === 'split' ? 0.079 : 0.1);
  return { x: (L.W - w) / 2, y: (L.mode === 'split' ? L.H * 0.56 : L.cy) - h / 2, w, h };
};

/** logarithmic sphere radii for a comparison row, clamped to ≥ 25 px */
export const compareRadii = (vals: number[], L: Layout) => {
  const max = Math.max(...vals, 1e-9);
  const big = (L.mode === 'split' ? L.H * 0.14 : L.W * 0.14) * (vals.length > 3 ? 0.85 : 1);
  return vals.map((v) => Math.max(25 * L.u, big * (0.25 + 0.75 * Math.max(0, Math.log10(1 + (9 * v) / max)))));
};

export const compareCentres = (vals: number[], L: Layout) => {
  const r = compareRadii(vals, L);
  const gap = 70 * L.u;
  const total = r.reduce((a, x) => a + 2 * x, 0) + gap * (r.length - 1);
  const vertical = L.mode === 'stack' && total > L.W * 0.9;
  if (vertical) {
    const totalV = r.reduce((a, x) => a + 2 * x, 0) + gap * 0.6 * (r.length - 1);
    let y = L.cy - totalV / 2;
    return r.map((ri) => {
      const c = { x: L.W / 2, y: y + ri, r: ri };
      y += 2 * ri + gap * 0.6;
      return c;
    });
  }
  // RTL: largest on the right, flowing to the smallest on the left
  let x = L.W / 2 + total / 2;
  return r.map((ri) => {
    const c = { x: x - ri, y: L.mode === 'split' ? L.H * 0.55 : L.cy, r: ri };
    x -= 2 * ri + gap;
    return c;
  });
};

const N = 100;
const rnd = (k: string) => random(`ig-${k}`);

/** 100 unit points for a beat's visual (the particle bridge between shapes) */
export const samples = (b: Beat, L: Layout): Pt[] => {
  const { cx, cy, S, u } = L;
  const dot = (S / 10) * 0.39;
  switch (b.kind) {
    case 'grid': {
      const hot = Math.round(Math.max(0, Math.min(100, b.num.value)));
      const pitch = S / 10;
      return Array.from({ length: N }, (_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        // RTL fill: units light from the top-right
        return { x: cx + (4.5 - col) * pitch, y: cy + (row - 4.5) * pitch, r: dot, hot: i < hot };
      });
    }
    case 'bar':
    case 'versus': {
      const B = barBox(L);
      const rows = b.kind === 'versus' ? 2 : 1;
      return Array.from({ length: N }, (_, i) => {
        const row = i % rows;
        const k = Math.floor(i / rows) / (N / rows - 1);
        const y = b.kind === 'versus' ? B.y + B.h / 2 + (row - 0.5) * B.h * 1.9 : B.y + B.h / 2 + (rnd(`by${i}`) - 0.5) * B.h * 0.5;
        return { x: B.x + B.w - k * B.w, y, r: B.h * 0.28, hot: i < 20 };
      });
    }
    case 'ring': {
      const R = S * 0.42;
      return Array.from({ length: N }, (_, i) => {
        const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
        return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, r: S * 0.05, hot: i < 20 };
      });
    }
    case 'compare': {
      const cs = compareCentres(b.items.map((x) => x.value), L);
      const tot = cs.reduce((a, c) => a + c.r * c.r, 0);
      const pts: Pt[] = [];
      cs.forEach((c, j) => {
        const n = j === cs.length - 1 ? N - pts.length : Math.round((N * c.r * c.r) / tot);
        for (let i = 0; i < n && pts.length < N; i++) {
          const a = rnd(`ca${j}-${i}`) * Math.PI * 2;
          const rr = Math.sqrt(rnd(`cr${j}-${i}`)) * c.r * 0.8;
          pts.push({ x: c.x + Math.cos(a) * rr, y: c.y + Math.sin(a) * rr, r: Math.max(4 * u, c.r * 0.12), hot: j === 0 });
        }
      });
      return pts;
    }
    case 'timeline': {
      const x0 = L.W * 0.12;
      const x1 = L.W * 0.88;
      const y = L.mode === 'split' ? L.H * 0.6 : L.cy;
      return Array.from({ length: N }, (_, i) => ({ x: x1 - (i / (N - 1)) * (x1 - x0), y, r: 5 * u, hot: false }));
    }
    case 'globe': {
      const R = S * 0.62;
      return Array.from({ length: N }, (_, i) => {
        // fibonacci sphere, front hemisphere projected
        const yy = 1 - (i / (N - 1)) * 2;
        const rad = Math.sqrt(1 - yy * yy);
        const th = i * 2.399963;
        return { x: cx + Math.cos(th) * rad * R, y: cy + yy * R, r: 6 * u, hot: false };
      });
    }
    case 'symbol':
    case 'sphere':
    case 'stat':
    case 'headline':
    case 'source':
    default: {
      const R = b.kind === 'symbol' ? S * 0.3 : b.kind === 'sphere' ? S * 0.34 : S * 0.2;
      const ox = b.kind === 'stat' && L.mode === 'split' ? 0 : 0;
      return Array.from({ length: N }, (_, i) => {
        const a = rnd(`sa${i}`) * Math.PI * 2;
        const rr = Math.sqrt(rnd(`sr${i}`)) * R * 0.85;
        return { x: cx + ox + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, r: dot * 0.8, hot: true };
      });
    }
  }
};

/** where the bloom sits for a beat */
export const bloomAt = (b: Beat, L: Layout) => {
  if (b.kind === 'bar' || b.kind === 'versus' || b.kind === 'timeline') {
    const B = barBox(L);
    return { x: L.W / 2, y: B.y + B.h / 2 };
  }
  if (b.kind === 'compare') return { x: L.W / 2, y: L.mode === 'split' ? L.H * 0.55 : L.cy };
  if (b.kind === 'headline' || (b.kind === 'stat' && b.visual === 'none')) return { x: L.W / 2, y: L.H * 0.5 };
  return { x: L.cx, y: L.cy };
};
