/**
 * doodle world model: zones along x, prop placement (seeded), each cast member's position per beat, and the camera
 * keyframes (moves only in the pauses between sentences, STYLE.md §6). Pure functions of the plan + timing.
 */
import { random } from 'remotion';
import type { TimingIndex } from '@/engine/timing';
import type { PropKind } from './art';
import type { DoodleBeat, DoodlePlan } from './schema';

export const ZW = 1400; // world width of one zone
export const HORIZON = 960;
export const FEET = 1440;
export const CHAR_H = 320;

const BACK = new Set<PropKind>(['palm', 'house', 'stall', 'wall', 'tree', 'mountain', 'car']);

export type Placed = { kind: PropKind; x: number; y: number; s: number; seed: number; back: boolean };

export const placeProps = (plan: DoodlePlan): Placed[] => {
  const out: Placed[] = [];
  plan.zones.forEach((z, zi) => {
    const x0 = zi * ZW;
    z.props.forEach((k, i) => {
      const r = random(`dp${zi}-${i}`);
      const back = BACK.has(k);
      const slot = (i + 0.5) / Math.max(1, z.props.length);
      const x = x0 + ZW * (0.08 + 0.84 * slot) + (r - 0.5) * 120;
      const y = back ? (k === 'mountain' ? HORIZON + 10 : k === 'wall' ? 1290 : 1230 + r * 40) : k === 'stone' || k === 'sprout' || k === 'bush' ? 1560 + r * 260 : FEET + 30;
      out.push({ kind: k, x, y, s: back ? 0.95 + r * 0.15 : k === 'stone' || k === 'sprout' ? 1 + r * 0.5 : 1, seed: zi * 31 + i * 7 + 3, back });
    });
    // ground texture so no zone is empty: a few stones / sprouts in the foreground
    const fill: PropKind = z.ground === 'grass' ? 'sprout' : z.ground === 'stones' ? 'stone' : 'stone';
    const nFill = z.ground === 'stones' ? 7 : z.ground === 'grass' ? 5 : 2;
    for (let i = 0; i < nFill; i++) {
      const r = random(`df${zi}-${i}`);
      out.push({ kind: fill, x: x0 + ZW * ((i + r) / nFill), y: 1520 + random(`dfy${zi}-${i}`) * 330, s: 0.8 + r * 0.6, seed: zi * 53 + i * 11, back: false });
    }
  });
  return out.sort((a, b) => a.y - b.y);
};

export const ZOOM: Record<DoodleBeat['kind'], number> = {
  establish: 0.9,
  introduce: 1.2,
  walkTo: 1.05,
  speak: 1.3,
  think: 1.25,
  question: 1.45,
  nameTag: 1.2,
  cards: 1.0,
  weather: 0.95,
  gesture: 1.25,
  reveal: 0.88,
  quote: 1.0,
  closing: 0.85,
};

export type Key = { t0: number; t1: number; x: number; zoom: number; sine?: boolean };
export type Walk = { id: string; t0: number; t1: number; x0: number; x1: number };

/** where each cast member stands in each beat (focus at the zone centre, others beside) */
export const stagePositions = (plan: DoodlePlan): Array<Record<string, number>> => {
  const pos: Record<string, number> = {};
  return plan.beats.map((b) => {
    const xc = (b.zone + 0.5) * ZW;
    const n = b.cast.length;
    b.cast.forEach((id, k) => {
      // RTL reading: the focus stands right of centre, the others to its left
      pos[id] = n <= 1 ? xc : xc + (n - 1) * 115 - k * 230;
    });
    return { ...pos };
  });
};

export const beatStarts = (plan: DoodlePlan, T: TimingIndex) => plan.beats.map((b) => T.byId(b.from).start);

/** camera keyframes: hold during speech, move in the pause before each beat (≤ 1.6 s, never mid-word); when the
 *  focus walks to a new place the camera travels WITH them (same window, same easing) */
export const cameraKeys = (plan: DoodlePlan, T: TimingIndex, positions: Array<Record<string, number>>, ws: Walk[] = []): Key[] => {
  const starts = beatStarts(plan, T);
  let lastZoom = 0;
  return plan.beats.map((b, i) => {
    const ps = b.cast.map((id) => positions[i]![id]).filter((x): x is number => x !== undefined);
    const x = ps.length ? ps.reduce((a, v) => a + v, 0) / ps.length - (b.kind === 'cards' || b.kind === 'nameTag' ? 60 : 0) : (b.zone + 0.5) * ZW;
    let zoom = ZOOM[b.kind];
    if (Math.abs(zoom - lastZoom) < 0.06) zoom += zoom > 1.1 ? -0.14 : 0.14;
    lastZoom = zoom;
    const start = starts[i]!;
    const idx = T.indexOf(b.from);
    const prevEnd = idx > 0 ? T.words[idx - 1]!.end : 0;
    const gap = Math.max(0.5, start - prevEnd);
    const t0 = i === 0 ? 0 : Math.max(prevEnd + 0.05, start - Math.min(1.6, gap + 0.3));
    const fw = ws.filter((w) => b.cast.includes(w.id) && Math.abs(w.x1 - w.x0) > 400 && w.t0 >= start - 1.0 && w.t0 <= start + 0.1).sort((a, c) => Math.abs(c.x1 - c.x0) - Math.abs(a.x1 - a.x0))[0];
    if (fw && i > 0) return { t0: fw.t0, t1: fw.t1, x, zoom, sine: true };
    return { t0, t1: i === 0 ? 0.001 : Math.max(t0 + 0.6, start + 0.15), x, zoom };
  });
};

/** walks: whenever a member's position changes between beats */
export const walks = (plan: DoodlePlan, T: TimingIndex, positions: Array<Record<string, number>>): Walk[] => {
  const starts = beatStarts(plan, T);
  const out: Walk[] = [];
  const cur: Record<string, number> = {};
  positions.forEach((p, i) => {
    for (const [id, x] of Object.entries(p)) {
      if (cur[id] === undefined) {
        cur[id] = x;
        // first appearance: walk in from the outer side (never through the others)
        const others = Object.entries(p).filter(([o]) => o !== id).map(([, v]) => v);
        const side = others.length && others.every((o) => o < x) ? 1 : others.length && others.every((o) => o > x) ? -1 : 1;
        out.push({ id, t0: Math.max(0, starts[i]! - 0.6), t1: starts[i]! + 0.9, x0: x + side * 300, x1: x });
        continue;
      }
      if (Math.abs(cur[id]! - x) > 2) {
        const dur = Math.max(1.0, Math.min(3.2, Math.abs(cur[id]! - x) / 420));
        const t0 = Math.max(0, starts[i]! - 0.8);
        out.push({ id, t0, t1: t0 + dur, x0: cur[id]!, x1: x });
        cur[id] = x;
      }
    }
  });
  return out;
};
