/** whiteboard sound (STYLE.md §12d): marker scribble on strokes, ticks on finished words, pops on stars/faces, cap snap at the end. */
import type { SfxEvent, VideoCtx } from '@/engine/types';
import { drawWindows } from './layout';
import type { WhiteboardPlan } from './schema';

export const whiteboardSfx = (plan: WhiteboardPlan, ctx: VideoCtx): SfxEvent[] => {
  const { T } = ctx;
  const wins = drawWindows(plan, T);
  const ev: SfxEvent[] = [];
  const t0 = T.byId(plan.title.from).start;
  const t1 = T.byId(plan.title.to).end;
  for (let t = t0; t < t1; t += 0.6) ev.push({ name: 'pen', at: t + 0.3, vol: 0.28 });
  ev.push({ name: 'pop', at: t1 + 0.8, vol: 0.3 });
  plan.items.forEach((it, i) => {
    const w = wins[i]!;
    if (it.kind === 'reveal') {
      ev.push({ name: 'click', at: T.byId(it.from).start + 1.2, vol: 0.5 });
      return;
    }
    for (let t = w.outline.t0; t < w.hatch.t1; t += 0.55) ev.push({ name: 'pen', at: t + 0.3, vol: 0.24 });
    if ('label' in it && it.label) ev.push({ name: 'tick', at: w.label.t1, vol: 0.35 });
    if (it.kind === 'emphasis' || it.kind === 'note' || (it.kind === 'object' && it.face)) ev.push({ name: 'pop', at: w.hatch.t1, vol: 0.3 });
  });
  return ev.sort((a, b) => a.at - b.at);
};
