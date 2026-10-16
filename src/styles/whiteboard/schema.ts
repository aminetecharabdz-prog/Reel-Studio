/** whiteboard — one board, one complete diagram. Every "when" is a word id. */
import { z } from 'zod';

export const WordId = z.string().regex(/^w\d+$/);
const s = (n: number) => z.string().trim().max(n);
const Color = z.enum(['ink', 'blue', 'red', 'orange', 'green']);

export const WbItem = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('object'), from: WordId, at: WordId, prop: s(20), label: s(24).default(''), color: Color.default('ink'), face: z.boolean().default(false) }),
  z.object({ kind: z.literal('arrow'), from: WordId, at: WordId, a: z.number().int().min(0), b: z.number().int().min(0), label: s(24).default(''), color: Color.default('red') }),
  z.object({ kind: z.literal('count'), from: WordId, at: WordId, prop: s(20), n: z.number().int().min(2).max(6), label: s(24).default(''), color: Color.default('blue') }),
  z.object({ kind: z.literal('contrast'), from: WordId, at: WordId, a: z.object({ prop: s(20), label: s(24) }), b: z.object({ prop: s(20), label: s(24) }) }),
  z.object({ kind: z.literal('number'), from: WordId, at: WordId, value: s(12), label: s(24).default(''), color: Color.default('orange') }),
  z.object({ kind: z.literal('band'), from: WordId, at: WordId, label: s(24).default(''), color: Color.default('blue'), wavy: z.boolean().default(true) }),
  z.object({ kind: z.literal('emphasis'), from: WordId, at: WordId, target: z.number().int().min(0) }),
  z.object({ kind: z.literal('note'), from: WordId, at: WordId, text: s(36) }),
  z.object({ kind: z.literal('journey'), from: WordId, at: WordId, mascot: s(20).default('drop') }),
  z.object({ kind: z.literal('reveal'), from: WordId }),
]);
export type WbItem = z.infer<typeof WbItem>;

export const WhiteboardPlanSchema = z.object({
  style: z.literal('whiteboard').default('whiteboard'),
  title: z.object({ text: s(40), from: WordId, to: WordId }),
  items: z.array(WbItem).min(1).max(16),
});
export type WhiteboardPlan = z.infer<typeof WhiteboardPlanSchema>;
