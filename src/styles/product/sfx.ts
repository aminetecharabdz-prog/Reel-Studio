/**
 * product sound design (STYLE.md §12d): whooshes on hero words, shimmer on the neon frame, keyboard ticks while
 * typing, a click on send, riser → hit into the logo / finale, a swell into every dark → light cut, pops on rings,
 * chips and checks. Every event is placed at the visual moment (word start); the composition pre-rolls by the peak.
 */
import type { SfxEvent, VideoCtx } from '@/engine/types';
import type { ProductPlan } from './schema';
import { CUT_LEAD } from './tokens';

export const productSfx = (plan: ProductPlan, ctx: VideoCtx): SfxEvent[] => {
  const { T } = ctx;
  const at = (id: string) => T.byId(id).start;
  const ev: SfxEvent[] = [];
  const voiced = !!ctx.input.audio.voice;
  const soft = voiced ? 0.5 : 1; // −6 dB on staggered words under a voice
  const wins = T.windows(plan.scenes.map((s) => s.from), ctx.contentEnd, CUT_LEAD);
  let prevTheme: 'dark' | 'light' = 'dark';
  plan.scenes.forEach((s, i) => {
    const w0 = wins[i]!.from;
    const theme: 'dark' | 'light' = (s.kind === 'words' && s.theme === 'light') || s.kind === 'capsule' || s.kind === 'orb' ? 'light' : 'dark';
    if (i > 0 && theme !== prevTheme) ev.push({ name: 'swell', at: w0, vol: 0.32 });
    prevTheme = theme;
    switch (s.kind) {
      case 'words':
        s.rows.flat().forEach((k, j) => ev.push({ name: 'whoosh', at: at(k.at), vol: j === 0 ? 0.5 : 0.22 * soft }));
        break;
      case 'punch':
        s.words.forEach((k, j) => ev.push({ name: j === 0 ? 'hit' : 'whoosh', at: at(k.at), vol: j === 0 ? 0.42 : 0.4 }));
        break;
      case 'prompt': {
        ev.push({ name: 'shimmer', at: w0 + 0.05, vol: 0.35 });
        T.range(s.typeFrom, s.typeTo).forEach((w) => ev.push({ name: 'tick', at: w.start, vol: 0.3 }));
        const send = s.send ? at(s.send) : T.byId(s.typeTo).end + 0.5;
        ev.push({ name: 'click', at: send, vol: 0.6 });
        ev.push({ name: 'swish', at: send + 0.05, vol: 0.25 });
        break;
      }
      case 'logo':
        ev.push({ name: 'riser', at: at(s.at), vol: 0.3 });
        ev.push({ name: 'impact', at: at(s.at), vol: 0.55 });
        break;
      case 'showcase':
        ev.push({ name: 'whoosh', at: w0 + 0.25, vol: 0.4 });
        s.steps.forEach((st) => ev.push({ name: 'pop', at: at(st.at), vol: 0.35 }));
        s.chips.forEach((ch) => ev.push({ name: 'pop', at: at(ch.at), vol: 0.4 }));
        if (s.price) ev.push({ name: 'blip', at: at(s.price.at), vol: 0.5 });
        break;
      case 'capsule':
        s.title.forEach((k, j) => ev.push({ name: 'whoosh', at: at(k.at), vol: j === 0 ? 0.35 : 0.18 * soft }));
        s.items.forEach((it) => ev.push({ name: 'pop', at: at(it.at), vol: 0.4 }));
        break;
      case 'cards':
        s.cards.forEach((c) => ev.push({ name: 'whoosh', at: at(c.at), vol: 0.28 }));
        break;
      case 'orb':
        s.steps.forEach((st) => ev.push({ name: 'swish', at: at(st.at), vol: 0.22 }));
        s.list.forEach((l) => ev.push({ name: 'tick', at: at(l.at), vol: 0.3 }));
        break;
      case 'end':
        ev.push({ name: 'riser', at: at(s.at), vol: 0.28 });
        ev.push({ name: 'impact', at: at(s.at), vol: 0.5 });
        break;
    }
  });
  // thin to ≤ 12 events per second (STYLE.md: digital ticks)
  ev.sort((a, b) => a.at - b.at);
  return ev.filter((e, i) => i === 0 || e.name !== 'tick' || e.at - ev[i - 1]!.at > 1 / 12);
};
