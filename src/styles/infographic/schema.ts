/** infographic — the morph-chain vocabulary. Every "when" is a word id; every number comes from the script. */
import { z } from 'zod';

export const WordId = z.string().regex(/^w\d+$/);
const s = (n: number) => z.string().trim().max(n);
const Num = z.object({ value: z.number(), decimals: z.number().int().min(0).max(2).default(0), unit: s(8).default(''), at: WordId });
const Seg = z.object({ label: s(36), value: z.number().min(0), at: WordId });
const Text = { eyebrow: s(60).default(''), label: s(60).default('') };

export const Beat = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('stat'), from: WordId, num: Num, visual: z.enum(['none', 'sphere', 'globe']).default('none'), ...Text }),
  z.object({ kind: z.literal('globe'), from: WordId, num: Num.optional(), ...Text }),
  z.object({ kind: z.literal('sphere'), from: WordId, num: Num.optional(), ...Text }),
  z.object({ kind: z.literal('grid'), from: WordId, num: Num, rest: s(40).default(''), ...Text }),
  z.object({ kind: z.literal('bar'), from: WordId, title: s(60).default(''), eyebrow: s(60).default(''), segments: z.array(Seg).min(1).max(4), unit: s(8).default('%') }),
  z.object({ kind: z.literal('ring'), from: WordId, title: s(60).default(''), eyebrow: s(60).default(''), segments: z.array(Seg).min(2).max(5), unit: s(8).default('%') }),
  z.object({ kind: z.literal('symbol'), from: WordId, icon: s(20), num: Num.optional(), equation: s(70).default(''), ...Text }),
  z.object({ kind: z.literal('compare'), from: WordId, title: s(60).default(''), eyebrow: s(60).default(''), items: z.array(Seg).min(2).max(4), unit: s(8).default('') }),
  z.object({ kind: z.literal('versus'), from: WordId, title: s(60).default(''), eyebrow: s(60).default(''), a: Seg, b: Seg, unit: s(8).default('') }),
  z.object({ kind: z.literal('timeline'), from: WordId, at: WordId, fromYear: z.number().int(), toYear: z.number().int(), ...Text }),
  z.object({ kind: z.literal('headline'), from: WordId, text: s(90), key: s(30).default(''), eyebrow: s(60).default('') }),
  z.object({ kind: z.literal('source'), from: WordId, title: s(70).default(''), source: s(90).default('') }),
]);
export type Beat = z.infer<typeof Beat>;

export const InfographicPlanSchema = z.object({
  style: z.literal('infographic').default('infographic'),
  beats: z.array(Beat).min(1).max(30),
});
export type InfographicPlan = z.infer<typeof InfographicPlanSchema>;
