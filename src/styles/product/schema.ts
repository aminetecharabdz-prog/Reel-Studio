/** product style — the scene vocabulary the director (Claude or local) writes. Every "when" is a word id. */
import { z } from 'zod';
import { ICON_IDS } from './icons';

export const WordId = z.string().regex(/^w\d+$/);

const short = (n: number) => z.string().trim().min(1).max(n);
export const Em = z.enum(['grad', 'accent', 'muted']);
export const KWord = z.object({ t: short(28), at: WordId, em: Em.optional() });
export type KWord = z.infer<typeof KWord>;
const Timed = z.object({ t: short(40), at: WordId });
const Icon = z.enum(ICON_IDS);

export const WordsScene = z.object({
  kind: z.literal('words'),
  from: WordId,
  theme: z.enum(['dark', 'light']).default('dark'),
  /** first word enters giant (fills the frame) then shrinks into the line */
  giant: z.boolean().default(true),
  /** echo: ghost copies above/below (statement moments) */
  echo: z.boolean().default(false),
  rows: z.array(z.array(KWord).min(1).max(5)).min(1).max(2),
});
export const PromptScene = z.object({
  kind: z.literal('prompt'),
  from: WordId,
  text: short(110),
  typeFrom: WordId,
  typeTo: WordId,
  send: WordId.optional(),
});
export const LogoScene = z.object({
  kind: z.literal('logo'),
  from: WordId,
  at: WordId,
  tagline: z.string().trim().max(60).optional(),
  ghost: z.boolean().default(true),
});
export const ShowcaseScene = z.object({
  kind: z.literal('showcase'),
  from: WordId,
  title: z.string().trim().max(60).optional(),
  /** user product photo (asset id). Without it the window shows a live app UI. */
  photo: z.string().optional(),
  steps: z.array(Timed).max(4).default([]),
  chips: z.array(z.object({ t: short(30), at: WordId, icon: Icon.optional() })).max(3).default([]),
  price: z.object({ t: short(24), at: WordId, old: z.string().max(24).optional() }).optional(),
});
export const CapsuleScene = z.object({
  kind: z.literal('capsule'),
  from: WordId,
  title: z.array(KWord).min(1).max(5),
  items: z.array(Timed).min(2).max(4),
});
export const CardsScene = z.object({
  kind: z.literal('cards'),
  from: WordId,
  title: z.array(KWord).max(4).default([]),
  cards: z.array(z.object({ t: short(28), at: WordId, icon: Icon })).min(3).max(7),
});
export const OrbScene = z.object({
  kind: z.literal('orb'),
  from: WordId,
  steps: z.array(Timed).min(3).max(6),
  list: z.array(Timed).max(4).default([]),
});
export const PunchScene = z.object({
  kind: z.literal('punch'),
  from: WordId,
  words: z.array(KWord).min(1).max(4),
});
export const EndScene = z.object({
  kind: z.literal('end'),
  from: WordId,
  at: WordId,
  line: z.string().trim().max(60).optional(),
  cta: z.string().trim().max(40).optional(),
  handle: z.string().trim().max(40).optional(),
});

export const ProductSceneSchema = z.discriminatedUnion('kind', [WordsScene, PromptScene, LogoScene, ShowcaseScene, CapsuleScene, CardsScene, OrbScene, PunchScene, EndScene]);
export type ProductScene = z.infer<typeof ProductSceneSchema>;

export const ProductPlanSchema = z.object({
  style: z.literal('product').default('product'),
  brand: z.object({ name: short(28), mark: z.string().trim().max(2).optional() }),
  accent: z.enum(['violet', 'orange', 'blue', 'pink']).default('violet'),
  scenes: z.array(ProductSceneSchema).min(1).max(40),
});
export type ProductPlan = z.infer<typeof ProductPlanSchema>;
