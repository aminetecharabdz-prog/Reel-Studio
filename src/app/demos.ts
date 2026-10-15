import { z } from 'zod';
import { PlanSchema, TranscriptSchema, type Plan, type Transcript } from '@/engine/schema';
import { publicUrl } from '@/engine/assets';

export const DemoSchema = z.object({
  id: z.string(),
  title: z.string(),
  blurb: z.string().default(''),
  mode: z.enum(['content', 'product', 'talking']),
  music: z.string().default('upbeat-pop'),
  voice: z.string().optional(),
  video: z.string().optional(),
  transcript: TranscriptSchema,
  plan: PlanSchema,
});
export type Demo = z.infer<typeof DemoSchema> & { plan: Plan; transcript: Transcript };

export const DEMO_IDS = ['content', 'product', 'shorts'] as const;

const cache = new Map<string, Promise<Demo>>();
export const loadDemo = (id: string): Promise<Demo> => {
  let p = cache.get(id);
  if (!p) {
    p = fetch(publicUrl(`demo/${id}.json`))
      .then((r) => {
        if (!r.ok) throw new Error(`demo ${id}: ${r.status}`);
        return r.json();
      })
      .then((j) => DemoSchema.parse(j) as Demo);
    cache.set(id, p);
  }
  return p;
};
