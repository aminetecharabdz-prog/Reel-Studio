import { z } from 'zod';
import { TranscriptSchema } from './transcript';
import { DesignDNASchema } from './dna';
import { CaptionSettingsSchema, EndCardSchema, PlanSchema } from './plan';

export const ASPECTS = { '9:16': [1080, 1920], '4:5': [1080, 1350], '1:1': [1080, 1080], '16:9': [1920, 1080] } as const;
export type Aspect = keyof typeof ASPECTS;
export const AspectSchema = z.enum(['9:16', '4:5', '1:1', '16:9']);

export const BrandKitSchema = z.object({
  enabled: z.boolean().default(false),
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(8).default([]),
  displayFont: z.string().optional(),
  bodyFont: z.string().optional(),
  logoAssetId: z.string().optional(),
});
export type BrandKit = z.infer<typeof BrandKitSchema>;

export const StyleSettingsSchema = z.object({
  visualStyle: z.string().default('auto'),
  artDirection: z.string().max(400).default(''),
  referenceAssetId: z.string().optional(),
  captions: CaptionSettingsSchema.default(CaptionSettingsSchema.parse({})),
  pacing: z.enum(['auto', 'fast', 'normal', 'calm']).default('auto'),
  aspect: AspectSchema.default('9:16'),
  sfx: z.object({ enabled: z.boolean().default(true), intensity: z.number().min(0).max(1).default(0.6) }).default({ enabled: true, intensity: 0.6 }),
  music: z
    .object({ trackId: z.string().default('auto'), assetId: z.string().optional(), volume: z.number().min(0).max(1).default(0.5) })
    .default({ trackId: 'auto', volume: 0.5 }),
  endCard: EndCardSchema.default(EndCardSchema.parse({})),
  safeZone: z.enum(['none', 'instagram', 'tiktok', 'youtube']).default('instagram'),
  digits: z.enum(['western', 'eastern']).default('western'),
  fps: z.union([z.literal(30), z.literal(60)]).default(30),
});
export type StyleSettings = z.infer<typeof StyleSettingsSchema>;

export const ProductInfoSchema = z.object({
  name: z.string().max(80).default(''),
  price: z.number().nonnegative().optional(),
  oldPrice: z.number().nonnegative().optional(),
  currency: z.string().max(8).default('دج'),
  offer: z.string().max(120).default(''),
  deliveryWilayas: z.number().int().min(0).max(69).optional(),
  cod: z.boolean().default(true),
  phone: z.string().max(24).default(''),
  script: z.string().max(2000).default(''),
  reviews: z.array(z.string().max(200)).max(5).default([]),
});
export type ProductInfo = z.infer<typeof ProductInfoSchema>;

export const CutRangeSchema = z.object({
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
  kind: z.enum(['silence', 'filler', 'manual']),
  enabled: z.boolean().default(true),
  label: z.string().optional(),
});
export type CutRange = z.infer<typeof CutRangeSchema>;

export const MediaSchema = z.object({
  voiceAssetId: z.string().optional(),
  videoAssetId: z.string().optional(),
  extra: z.array(z.object({ assetId: z.string(), note: z.string().max(200).default('') })).default([]),
  idea: z.string().max(1000).default(''),
  vocabulary: z.string().max(600).default(''),
  /** demo projects ship their audio/images in /public */
  publicAudio: z.string().optional(),
  publicVideo: z.string().optional(),
});

export const VersionSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  label: z.string(),
  dna: DesignDNASchema,
  plan: PlanSchema,
});
export type Version = z.infer<typeof VersionSchema>;

export const QAIssueSchema = z.object({
  check: z.string(),
  severity: z.enum(['error', 'warning']),
  sceneId: z.string().optional(),
  message: z.string(),
  fixed: z.boolean().default(false),
});
export type QAIssue = z.infer<typeof QAIssueSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  createdAt: z.number(),
  updatedAt: z.number(),
  mode: z.enum(['A', 'B', 'C']),
  business: z.string().default('other'),
  demo: z.string().optional(), // demo id when this is a built-in sample
  demoRev: z.number().int().optional(), // demo direction revision this project was generated from
  brand: BrandKitSchema.default(BrandKitSchema.parse({})),
  style: StyleSettingsSchema.default(StyleSettingsSchema.parse({})),
  media: MediaSchema.default(MediaSchema.parse({})),
  product: ProductInfoSchema.optional(),
  transcript: TranscriptSchema.optional(),
  cuts: z.array(CutRangeSchema).default([]),
  dna: DesignDNASchema.optional(),
  plan: PlanSchema.optional(),
  versions: z.array(VersionSchema).default([]),
  qa: z.array(QAIssueSchema).default([]),
  stage: z.enum(['setup', 'media', 'transcript', 'generating', 'ready']).default('setup'),
});
export type Project = z.infer<typeof ProjectSchema>;
