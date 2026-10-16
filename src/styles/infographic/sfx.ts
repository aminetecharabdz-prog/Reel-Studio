/** infographic sound (STYLE.md §12d): airy swells on beat changes, whooshes under morphs, counter ticks, glass pings. */
import type { SfxEvent, VideoCtx } from '@/engine/types';
import type { InfographicPlan } from './schema';
import { CUT_LEAD } from './Video';

export const infographicSfx = (plan: InfographicPlan, ctx: VideoCtx): SfxEvent[] => {
  const { T } = ctx;
  const at = (id: string) => T.byId(id).start;
  const wins = T.windows(plan.beats.map((b) => b.from), ctx.contentEnd, CUT_LEAD);
  const ev: SfxEvent[] = [];
  const roll = (id: string, start: number) => {
    const s = Math.max(start + 0.15, at(id) - 0.75);
    for (let k = 0; k < 10; k++) ev.push({ name: 'tick', at: s + k * 0.08 * (1 + k * 0.08), vol: 0.16 });
    ev.push({ name: 'blip', at: s + 1.0, vol: 0.3 });
  };
  plan.beats.forEach((b, i) => {
    const s = wins[i]!.from;
    if (i > 0 && b.kind !== 'source') ev.push({ name: 'whoosh', at: s + 0.3, vol: 0.32 });
    ev.push({ name: 'swell', at: s + 0.4, vol: 0.12 });
    switch (b.kind) {
      case 'stat':
      case 'grid':
        roll(b.num.at, s);
        if (b.kind === 'grid') ev.push({ name: 'shimmer', at: at(b.num.at), vol: 0.25 });
        break;
      case 'globe':
      case 'sphere':
      case 'symbol':
        if (b.num) roll(b.num.at, s);
        if (b.kind === 'symbol') ev.push({ name: 'pop', at: s + 0.3, vol: 0.4 });
        break;
      case 'bar':
      case 'ring':
        b.segments.forEach((g) => ev.push({ name: 'pop', at: at(g.at), vol: 0.3 }));
        roll(b.segments[b.segments.length - 1]!.at, s);
        break;
      case 'compare':
        b.items.forEach((g) => ev.push({ name: 'pop', at: at(g.at), vol: 0.35 }));
        break;
      case 'versus':
        [b.a, b.b].forEach((g) => roll(g.at, s));
        break;
      case 'timeline':
        ev.push({ name: 'riser', at: at(b.at) + 0.2, vol: 0.2 });
        break;
      default:
        break;
    }
  });
  ev.sort((a, b) => a.at - b.at);
  return ev.filter((e, i) => i === 0 || e.name !== 'tick' || e.at - ev[i - 1]!.at > 1 / 30);
};
