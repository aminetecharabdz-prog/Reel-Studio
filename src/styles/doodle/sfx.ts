/** doodle sound (STYLE.md §12d): soft pops for bubbles/cards/tags/؟, light whoosh on long camera moves, footsteps, rain, sparkle chime. */
import type { SfxEvent, VideoCtx } from '@/engine/types';
import type { DoodlePlan } from './schema';

export const doodleSfx = (plan: DoodlePlan, ctx: VideoCtx): SfxEvent[] => {
  const { T } = ctx;
  const ev: SfxEvent[] = [];
  plan.beats.forEach((b, i) => {
    const s = T.byId(b.from).start;
    const at = b.at ? T.byId(b.at).start : s;
    if (i > 0 && plan.beats[i - 1]!.zone !== b.zone) {
      ev.push({ name: 'swish', at: s - 0.4, vol: 0.18 });
      for (let k = 0; k < 5; k++) ev.push({ name: 'tick', at: s - 0.7 + k * 0.45, vol: 0.12 });
    }
    switch (b.kind) {
      case 'speak':
      case 'think':
      case 'nameTag':
      case 'question':
      case 'introduce':
        ev.push({ name: 'pop', at, vol: 0.35 });
        break;
      case 'cards':
        b.items.forEach((it) => ev.push({ name: 'pop', at: T.byId(it.at).start, vol: 0.35 }));
        break;
      case 'weather':
        ev.push({ name: b.weather === 'rain' ? 'swell' : 'shimmer', at: at + 0.3, vol: 0.25 });
        break;
      case 'reveal':
      case 'closing':
      case 'establish':
        ev.push({ name: 'shimmer', at: at + 0.2, vol: 0.22 });
        break;
      case 'quote':
        ev.push({ name: 'swish', at, vol: 0.2 });
        break;
      default:
        break;
    }
  });
  return ev.sort((a, b) => a.at - b.at);
};
