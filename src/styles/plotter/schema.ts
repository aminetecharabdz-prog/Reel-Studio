/** plotter — scene vocabulary (STYLE.md §12a). Every "when" is a word id. */
import { z } from 'zod';

export const WordId = z.string().regex(/^w\d+$/);
const s = (n: number) => z.string().trim().max(n);
const KW = z.object({ t: s(28), at: WordId, key: z.boolean().default(false) });

export const PlotterScene = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('penTitle'), from: WordId, words: z.array(KW).min(1).max(8) }),
  z.object({ kind: z.literal('heroStack'), from: WordId, kicker: z.array(KW).max(6).default([]), hero: z.array(KW).min(1).max(3), prop: s(20).default('') }),
  z.object({ kind: z.literal('slam'), from: WordId, word: KW, counter: s(12).default('') }),
  z.object({ kind: z.literal('nodeFlow'), from: WordId, title: s(60).default(''), nodes: z.array(KW).min(2).max(5) }),
  z.object({ kind: z.literal('promptInput'), from: WordId, words: z.array(KW).min(1).max(16), table: z.array(z.object({ t: s(20), v: z.number() })).max(4).default([]) }),
  z.object({ kind: z.literal('karaoke'), from: WordId, words: z.array(KW).min(1).max(16) }),
  z.object({ kind: z.literal('graphCard'), from: WordId, words: z.array(KW).min(1).max(10), formula: s(30).default('ease(t)') }),
  z.object({ kind: z.literal('schematic'), from: WordId, prop: s(20), label: s(24), at: WordId, photo: z.string().optional(), dims: s(16).default(''), words: z.array(KW).max(10).default([]) }),
  z.object({ kind: z.literal('paperForm'), from: WordId, title: s(40), oldRow: KW, newRow: KW, stamp: s(14).default('معتمد') }),
  z.object({ kind: z.literal('filmStrip'), from: WordId, words: z.array(KW).min(1).max(10) }),
  z.object({ kind: z.literal('arcOutro'), from: WordId, a: KW, b: KW, end: KW }),
]);
export type PlotterScene = z.infer<typeof PlotterScene>;

export const PlotterPlanSchema = z.object({
  style: z.literal('plotter').default('plotter'),
  scenes: z.array(PlotterScene).min(1).max(40),
});
export type PlotterPlan = z.infer<typeof PlotterPlanSchema>;
