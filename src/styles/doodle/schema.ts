/** doodle — one continuous world, a cast, and beats placed along it. Every "when" is a word id. */
import { z } from 'zod';
import { PROP_KINDS } from './art';

export const WordId = z.string().regex(/^w\d+$/);
const s = (n: number) => z.string().trim().max(n);

export const CastMember = z.object({
  id: s(12),
  kind: z.enum(['man', 'woman', 'kid', 'elder']).default('man'),
  outfit: z.enum(['robe', 'casual']).default('robe'),
  color: z.enum(['white', 'red', 'gold', 'green', 'blue']).default('white'),
  name: s(24).default(''),
});

export const Zone = z.object({
  ground: z.enum(['sand', 'stones', 'grass', 'town', 'market']),
  props: z.array(z.enum(PROP_KINDS)).max(8).default([]),
  water: z.boolean().default(false),
});

const Item = z.object({ t: s(22), at: WordId, icon: s(16).default('sparkles') });

export const DoodleBeat = z.object({
  from: WordId,
  kind: z.enum(['establish', 'introduce', 'walkTo', 'speak', 'think', 'question', 'nameTag', 'cards', 'weather', 'gesture', 'reveal', 'quote', 'closing']),
  zone: z.number().int().min(0).max(11),
  /** cast ids on stage in this beat (the first is the focus) */
  cast: z.array(s(12)).max(4).default([]),
  /** bubble / tag / quote text */
  text: s(90).default(''),
  /** word that pops the object (default: the beat's first word) */
  at: WordId.optional(),
  items: z.array(Item).max(4).default([]),
  icon: s(16).default(''),
  weather: z.enum(['rain', 'sun', 'sparkles']).default('sparkles'),
});
export type DoodleBeat = z.infer<typeof DoodleBeat>;

export const DoodlePlanSchema = z.object({
  style: z.literal('doodle').default('doodle'),
  cast: z.array(CastMember).min(1).max(4),
  zones: z.array(Zone).min(1).max(12),
  beats: z.array(DoodleBeat).min(1).max(40),
  /** accent word per script line (line index → word id) */
  accents: z.array(WordId).default([]),
  /** optional small translation line per script line */
  subtitles: z.array(s(80)).default([]),
  series: s(40).default(''),
});
export type DoodlePlan = z.infer<typeof DoodlePlanSchema>;
