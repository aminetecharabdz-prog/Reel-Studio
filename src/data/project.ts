import { z } from 'zod';
import { PlanSchema, TranscriptSchema } from '@/engine/schema';

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  mode: z.enum(['content', 'product', 'talking']),
  createdAt: z.number(),
  updatedAt: z.number(),
  status: z.enum(['draft', 'ready', 'error']).default('draft'),
  demo: z.string().optional(),
  script: z.string().default(''),
  notes: z.string().default(''),
  voiceAsset: z.string().optional(),
  videoAsset: z.string().optional(),
  media: z.array(z.object({ assetId: z.string(), label: z.string().default('') })).default([]),
  product: z.object({ name: z.string().default(''), price: z.string().default(''), offer: z.string().default('') }).optional(),
  transcript: TranscriptSchema.optional(),
  plan: PlanSchema.optional(),
  history: z.array(PlanSchema).default([]),
  /** generated image cache: prompt hash → asset id */
  images: z.record(z.string(), z.string()).default({}),
  options: z
    .object({
      aspect: z.enum(['9:16', '4:5', '1:1', '16:9']).default('9:16'),
      captions: z.boolean().default(false),
      music: z.string().default('auto'),
      musicVolume: z.number().default(0.5),
      sfx: z.boolean().default(true),
      digits: z.enum(['western', 'eastern']).default('western'),
      endCard: z.boolean().default(false),
      cta: z.string().default(''),
      handle: z.string().default(''),
      phone: z.string().default(''),
    })
    .default({ aspect: '9:16', captions: false, music: 'auto', musicVolume: 0.5, sfx: true, digits: 'western', endCard: false, cta: '', handle: '', phone: '' }),
  cost: z.number().default(0),
  error: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;
