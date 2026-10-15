import { z } from 'zod';
import { TRANSITIONS } from './dna';

export const PRIMITIVES = {
  text: ['kinetic-headline', 'word-build', 'highlight-sweep', 'big-number', 'quote-card', 'typewriter', 'split-flap', 'stacked-list', 'question-hook'],
  data: ['bar-chart', 'line-chart', 'donut-chart', 'progress-ring', 'versus', 'timeline', 'steps', 'checklist', 'rating', 'algeria-map', 'icon-array'],
  media: ['image-card', 'ken-burns', 'phone-mockup', 'laptop-mockup', 'before-after', 'collage', 'polaroid-stack', 'product-hero'],
  graphic: ['icon-burst', 'icon-grid', 'illustration-scene', 'sticker-pop', 'callout-arrows', 'highlighter-circle', 'shape-morph', 'gauge', 'do-dont', 'warning-alert'],
  structure: ['title-card', 'chapter-divider', 'cta', 'end-card', 'logo-sting'],
  ad: ['price-tag', 'delivery-badge', 'cod-badge', 'urgency', 'offer-ribbon', 'feature-callouts'],
} as const;

export type PrimitiveFamily = keyof typeof PRIMITIVES;
export const PRIMITIVE_IDS = Object.values(PRIMITIVES).flat() as [string, ...string[]];
export type PrimitiveId = (typeof PRIMITIVES)[PrimitiveFamily][number];
export const PrimitiveIdSchema = z.enum(PRIMITIVE_IDS as unknown as [PrimitiveId, ...PrimitiveId[]]);

export const ImageRefSchema = z.object({
  src: z.string().optional(), // url / blob url / public path (resolved at compile time)
  assetId: z.string().optional(), // user media or generated image id (IndexedDB)
  prompt: z.string().optional(), // when an image should be generated
});
export type ImageRef = z.infer<typeof ImageRefSchema>;

export const ItemSchema = z.object({
  text: z.string().max(80),
  at: z.string().optional(), // word id the item appears with
  icon: z.string().optional(), // "set:name" iconify id
  value: z.number().optional(),
  tone: z.enum(['good', 'bad', 'neutral']).optional(),
});
export type Item = z.infer<typeof ItemSchema>;

export const SceneContentSchema = z.object({
  headline: z.string().max(90).optional(),
  headlineAt: z.string().optional(),
  sub: z.string().max(140).optional(),
  kicker: z.string().max(40).optional(),
  items: z.array(ItemSchema).max(8).optional(),
  value: z.number().optional(),
  valueFrom: z.number().optional(),
  valueAt: z.string().optional(),
  unit: z.string().max(12).optional(),
  prefix: z.string().max(8).optional(),
  decimals: z.number().int().min(0).max(2).optional(),
  icon: z.string().optional(),
  icons: z.array(z.string()).max(12).optional(),
  image: ImageRefSchema.optional(),
  images: z.array(ImageRefSchema).max(6).optional(),
  price: z.number().optional(),
  oldPrice: z.number().optional(),
  currency: z.string().max(8).optional(),
  phone: z.string().max(24).optional(),
  handle: z.string().max(40).optional(),
  url: z.string().max(60).optional(),
  rating: z.number().min(0).max(5).optional(),
  wilayas: z.number().int().optional(),
  colorTone: z.enum(['primary', 'accent', 'warning', 'success']).optional(),
});
export type SceneContent = z.infer<typeof SceneContentSchema>;

export const SceneSchema = z.object({
  id: z.string(),
  from: z.string(), // first word id
  to: z.string(), // last word id
  primitive: PrimitiveIdSchema,
  variant: z.number().int().min(0).max(3).default(0),
  content: SceneContentSchema,
  emphasis: z.array(z.string()).max(6).default([]), // word ids that get emphasis motion
  transition: z.enum(TRANSITIONS).default('cut'),
  bgIndex: z.number().int().min(0).max(3).default(0),
  /** mode C: how the speaker footage is shown in this scene */
  speaker: z.enum(['full', 'split-top', 'split-bottom', 'pip', 'hidden']).optional(),
  zoomOn: z.array(z.string()).max(4).default([]), // mode C punch-in word ids
  locked: z.boolean().default(false),
});
export type Scene = z.infer<typeof SceneSchema>;

export const CAPTION_STYLES = ['pill', 'block', 'karaoke', 'word-pop', 'outline', 'gradient', 'boxed-keyword', 'minimal'] as const;
export type CaptionStyleId = (typeof CAPTION_STYLES)[number];

export const CaptionSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  style: z.enum(CAPTION_STYLES).default('karaoke'),
  font: z.string().optional(), // font family id; defaults to DNA captions font
  weight: z.number().int().min(300).max(900).optional(),
  sizePx: z.number().min(42).max(110).default(64), // at 1080 width
  color: z.string().optional(),
  activeColor: z.string().optional(),
  background: z.string().optional(),
  position: z.number().min(0.15).max(0.85).default(0.74), // vertical centre as fraction of height
  wordsPerLine: z.number().int().min(1).max(7).default(4),
  animation: z.enum(['pop', 'fade', 'slide', 'none']).default('pop'),
  emphasizeKeywords: z.boolean().default(true),
});
export type CaptionSettings = z.infer<typeof CaptionSettingsSchema>;

export const EndCardSchema = z.object({
  enabled: z.boolean().default(false),
  cta: z.string().max(60).default(''),
  handle: z.string().max(40).default(''),
  phone: z.string().max(24).default(''),
  website: z.string().max(60).default(''),
  logoAssetId: z.string().optional(),
  seconds: z.number().min(1.5).max(6).default(3),
});
export type EndCard = z.infer<typeof EndCardSchema>;

export const PlanSchema = z.object({
  scenes: z.array(SceneSchema).min(1),
  hookVariants: z.array(z.string()).max(3).optional(),
  notes: z.string().optional(),
});
export type Plan = z.infer<typeof PlanSchema>;
