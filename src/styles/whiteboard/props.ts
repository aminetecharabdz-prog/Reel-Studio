/**
 * whiteboard drawing library: every prop is stroke paths + hatch regions in a 100×100 box centred on (0, 0).
 * Bespoke hero props (sun, cloud, mountain, drop, wave…) plus the whole shared icon library scaled up, so any topic
 * (health, teeth, food, money, cars, phones, shops, delivery, school, sport, family, time, growth, warnings…) has a
 * drawable object. Stroke order = array order (big contour first, details last).
 */
import { ICONS } from '@/art/icons';
import { samplePath } from '@/art/ink';

export type PropDef = { strokes: string[]; hatch: string[]; face?: [number, number]; living?: 'spin' | 'rain' | 'wave' | 'float' };

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} Z`;

const BESPOKE: Record<string, PropDef> = {
  sun: {
    strokes: [circle(0, 0, 28), ...Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return `M${Math.cos(a) * 36} ${Math.sin(a) * 36} L${Math.cos(a) * 48} ${Math.sin(a) * 48}`;
    })],
    hatch: [circle(0, 0, 28)],
    face: [0, 2],
    living: 'spin',
  },
  cloud: {
    strokes: ['M-40 18 Q-52 18 -50 4 Q-48 -10 -34 -8 Q-32 -30 -10 -28 Q4 -44 22 -30 Q40 -32 40 -12 Q54 -8 50 8 Q48 18 36 18 Z'],
    hatch: ['M-40 18 Q-52 18 -50 4 Q-48 -10 -34 -8 Q-32 -30 -10 -28 Q4 -44 22 -30 Q40 -32 40 -12 Q54 -8 50 8 Q48 18 36 18 Z'],
    living: 'rain',
  },
  mountain: { strokes: ['M-50 30 L-18 -26 L-4 -6 L12 -36 L50 30 Z', 'M2 -22 L12 -36 L22 -20 L16 -24 L10 -18 L6 -24 Z'], hatch: ['M-50 30 L50 30 L50 34 L-50 34 Z'] },
  drop: { strokes: ['M0 -42 Q30 -2 26 16 Q22 40 0 40 Q-22 40 -26 16 Q-30 -2 0 -42 Z'], hatch: ['M0 -42 Q30 -2 26 16 Q22 40 0 40 Q-22 40 -26 16 Q-30 -2 0 -42 Z'], face: [0, 14], living: 'float' },
  wave: { strokes: ['M-50 -6 Q-42 -14 -34 -6 T-18 -6 T-2 -6 T14 -6 T30 -6 T46 -6', 'M-50 8 Q-42 0 -34 8 T-18 8 T-2 8 T14 8 T30 8 T46 8'], hatch: ['M-50 -6 L50 -6 L50 22 L-50 22 Z'], living: 'wave' },
  plant: { strokes: ['M0 40 L0 -10', 'M0 0 Q-30 -8 -30 -34 Q-6 -30 0 0 Z', 'M0 -10 Q28 -20 30 -44 Q6 -40 0 -10 Z', 'M-24 40 L24 40'], hatch: ['M0 0 Q-30 -8 -30 -34 Q-6 -30 0 0 Z', 'M0 -10 Q28 -20 30 -44 Q6 -40 0 -10 Z'], living: 'float' },
  person: { strokes: [circle(0, -28, 14), 'M0 -14 L0 18', 'M-20 -2 L0 -6 L20 -2', 'M0 18 L-14 42', 'M0 18 L14 42'], hatch: [circle(0, -28, 14)], face: [0, -27] },
  coin: { strokes: [circle(0, 0, 32), 'M0 -18 L0 18', 'M10 -10 Q0 -18 -10 -10 Q-10 0 0 0 Q10 0 10 10 Q0 18 -10 10'], hatch: [circle(0, 0, 32)], face: [0, 4] },
  bulb: { strokes: ['M-14 18 Q-30 4 -28 -14 Q-24 -40 0 -40 Q24 -40 28 -14 Q30 4 14 18 Z', 'M-12 26 L12 26', 'M-8 34 L8 34'], hatch: ['M-14 18 Q-30 4 -28 -14 Q-24 -40 0 -40 Q24 -40 28 -14 Q30 4 14 18 Z'], face: [0, -12] },
  arrowUp: { strokes: ['M0 40 L0 -36', 'M-16 -20 L0 -38 L16 -20'], hatch: [] },
  check: { strokes: ['M-28 0 L-8 22 L30 -24'], hatch: [] },
  cross: { strokes: ['M-24 -24 L24 24', 'M24 -24 L-24 24'], hatch: [] },
};

/** a prop by id: bespoke first, then the shared icons (24-grid → 100-box) */
export const propDef = (id: string): PropDef => {
  const b = BESPOKE[id];
  if (b) return b;
  const ic = (ICONS as Record<string, readonly string[]>)[id] ?? ICONS.sparkles;
  const scaled = ic.map((d) => scalePath(d, 100 / 24, -50, -50));
  const closed = scaled.filter((d) => samplePath(d, 2).some((s) => s.closed || isLoop(s.pts)));
  return { strokes: scaled, hatch: closed.slice(0, 1) };
};

const isLoop = (pts: Array<[number, number]>) => {
  const a = pts[0]!;
  const b = pts[pts.length - 1]!;
  return pts.length > 8 && Math.hypot(a[0] - b[0], a[1] - b[1]) < 2;
};

/** sample → transform → polyline path (keeps any command set working downstream) */
export const scalePath = (d: string, k: number, dx: number, dy: number) =>
  samplePath(d, 0.4)
    .map((s) => `M${s.pts.map(([x, y]) => `${(x * k + dx).toFixed(2)} ${(y * k + dy).toFixed(2)}`).join('L')}${s.closed ? 'Z' : ''}`)
    .join(' ');

export const PROP_IDS = [...Object.keys(BESPOKE), ...Object.keys(ICONS)];
