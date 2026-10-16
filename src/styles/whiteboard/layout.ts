/**
 * whiteboard layout solver: the board world equals the frame at zoom 1. Title band on top, diagram below in RTL
 * reading order (start right / top-right), slots per aspect (STYLE.md §4), band at the bottom, notes under it.
 * Then every element gets its drawing window from its word ids, and the camera a key per beat.
 */
import type { TimingIndex } from '@/engine/timing';
import type { WbItem, WhiteboardPlan } from './schema';
import { CHAR_S } from './tokens';

export type Box = { x: number; y: number; w: number; h: number };
export type Placed = { i: number; item: WbItem; box: Box; size: number; label?: { x: number; y: number; size: number } };

export type Board = {
  W: number;
  H: number;
  u: number;
  title: { x: number; y: number; size: number; maxW: number };
  placed: Placed[];
  band: Box;
};

const slotsFor = (W: number, H: number, u: number, n: number) => {
  const land = W > H * 1.2;
  const port = H > W * 1.4;
  const cols = land ? (n <= 3 ? 3 : 4) : port ? 2 : W > H * 0.95 ? 3 : 2;
  const rows = Math.max(land ? 1 : 2, Math.min(land ? 2 : port ? 4 : 3, Math.ceil(n / cols)));
  const top = land ? 220 * u : port ? 430 * u : 260 * u;
  const bottom = H - (land ? 190 * u : port ? 420 * u : 230 * u);
  const left = 96 * u;
  const right = W - 96 * u;
  const cw = (right - left) / cols;
  const ch = (bottom - top) / rows;
  const out: Box[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      // RTL: the story starts at the right; alternate rows snake (right→left, then left→right) so arrows stay short
      const cc = r % 2 === 0 ? cols - 1 - c : c;
      out.push({ x: left + cc * cw, y: top + r * ch, w: cw, h: ch });
    }
  return { out, land, port };
};

export const layoutBoard = (plan: WhiteboardPlan, W: number, H: number): Board => {
  const u = Math.min(W, H) / 1080;
  const nPlaced = plan.items.filter((item, i) => item.kind === 'object' || item.kind === 'count' || item.kind === 'contrast' || (item.kind === 'number' && !hasTarget(plan, i))).length;
  const { out: slots, land, port } = slotsFor(W, H, u, nPlaced);
  const titleSize = (port ? 68 : 76) * u;
  const placed: Placed[] = [];
  let k = 0;
  plan.items.forEach((item, i) => {
    if (item.kind === 'object' || item.kind === 'count' || item.kind === 'contrast' || (item.kind === 'number' && !hasTarget(plan, i))) {
      const slot = slots[k % slots.length]!;
      k++;
      const size = Math.min(slot.w, slot.h) * (item.kind === 'count' || item.kind === 'contrast' ? 0.52 : 0.68);
      placed.push({ i, item, box: slot, size, label: { x: slot.x + slot.w / 2, y: slot.y + slot.h / 2 + size * 0.62, size: 44 * u } });
    } else placed.push({ i, item, box: { x: 0, y: 0, w: 0, h: 0 }, size: 0 });
  });
  const bandH = (land ? 110 : 120) * u;
  const band = { x: 96 * u, y: H - (land ? 170 : port ? 400 : 210) * u, w: W - 192 * u, h: bandH };
  return { W, H, u, title: { x: W / 2, y: (land ? 70 : port ? 140 : 80) * u, size: titleSize, maxW: W - 200 * u }, placed, band };
};

// numbers always get their own slot (an arrow points to the object they describe) so nothing overlaps
const hasTarget = (_plan: WhiteboardPlan, _i: number) => false;

/** the object a number/emphasis/arrow end refers to (index into placed) */
export const targetOf = (plan: WhiteboardPlan, i: number) => {
  for (let j = i - 1; j >= 0; j--) if (plan.items[j]!.kind === 'object') return j;
  return -1;
};

export type Win = { t0: number; t1: number };

/** drawing windows: outline starts 0.2 s before the noun, label writes from the noun's end */
export const drawWindows = (plan: WhiteboardPlan, T: TimingIndex) =>
  plan.items.map((it) => {
    const at = it.kind === 'reveal' ? T.byId(it.from).start : T.byId(it.at).start;
    const atEnd = it.kind === 'reveal' ? at : T.byId(it.at).end;
    const draw = it.kind === 'count' ? 0.3 + it.n * 0.12 : it.kind === 'arrow' ? 0.6 : it.kind === 'band' ? 0.9 : it.kind === 'number' ? 0.6 : 0.8;
    const labelText = 'label' in it ? it.label : it.kind === 'note' ? it.text : '';
    const t0 = Math.max(T.byId(it.from).start - 0.1, at - 0.2);
    const outline = { t0, t1: t0 + draw };
    const hatch = { t0: outline.t1, t1: outline.t1 + 0.6 };
    const lab = { t0: Math.max(atEnd, hatch.t0 - 0.1), t1: Math.max(atEnd, hatch.t0 - 0.1) + Math.max(0.3, (labelText?.length ?? 0) * CHAR_S) };
    return { outline, hatch, label: lab };
  });
