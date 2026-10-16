/** plotter sound (STYLE.md §12d): crackle while the pen draws, ticks on nodes/key words, whoosh on glides, hit on slams, typewriter/marker/stamp on paper. */
import type { SfxEvent, VideoCtx } from '@/engine/types';
import type { PlotterPlan } from './schema';
import { CUT_LEAD } from './tokens';

export const plotterSfx = (plan: PlotterPlan, ctx: VideoCtx): SfxEvent[] => {
  const { T } = ctx;
  const at = (id: string) => T.byId(id).start;
  const wins = T.windows(plan.scenes.map((s) => s.from), ctx.contentEnd, CUT_LEAD);
  const ev: SfxEvent[] = [];
  plan.scenes.forEach((s, i) => {
    const w0 = wins[i]!.from;
    if (s.kind !== 'slam' && s.kind !== 'paperForm' && i > 0) ev.push({ name: 'whoosh', at: w0 + 0.3, vol: 0.3 });
    switch (s.kind) {
      case 'penTitle':
        s.words.forEach((w) => ev.push({ name: 'glitch', at: at(w.at), vol: 0.12 }));
        break;
      case 'slam':
        ev.push({ name: 'impact', at: at(s.word.at), vol: 0.7 });
        break;
      case 'nodeFlow':
        s.nodes.forEach((n) => ev.push({ name: 'tick', at: at(n.at) + 0.3, vol: 0.4 }));
        break;
      case 'heroStack':
        s.hero.forEach((h) => ev.push({ name: h.key ? 'hit' : 'tick', at: at(h.at), vol: h.key ? 0.35 : 0.3 }));
        break;
      case 'promptInput':
      case 'karaoke':
        s.words.filter((w) => w.key).forEach((w) => ev.push({ name: 'tick', at: at(w.at), vol: 0.35 }));
        break;
      case 'paperForm':
        ev.push({ name: 'type', at: at(s.oldRow.at) + 0.2, vol: 0.4 });
        ev.push({ name: 'swish', at: at(s.oldRow.at) + 1.0, vol: 0.3 });
        ev.push({ name: 'type', at: at(s.newRow.at) + 0.2, vol: 0.4 });
        ev.push({ name: 'hit', at: at(s.newRow.at) + s.newRow.t.length * 0.07 + 0.45, vol: 0.5 });
        break;
      case 'arcOutro':
        ev.push({ name: 'shimmer', at: at(s.b.at), vol: 0.3 });
        ev.push({ name: 'hit', at: at(s.end.at), vol: 0.45 });
        break;
      default:
        break;
    }
  });
  return ev.sort((a, b) => a.at - b.at);
};
