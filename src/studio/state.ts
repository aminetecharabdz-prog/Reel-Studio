import { z } from 'zod';
import { STYLE_IDS } from '@/styles/catalog';

/** The studio wizard document (saved in IndexedDB as ProjectRecord.doc). */
export const ASPECTS = ['9:16', '4:5', '1:1', '16:9'] as const;
export type Aspect = (typeof ASPECTS)[number];

export const WizardSchema = z.object({
  goal: z.enum(['ad', 'explainer', 'story', 'numbers', 'talking', 'free']).nullable().default(null),
  style: z.union([z.enum(STYLE_IDS), z.literal('auto')]).nullable().default(null),
  content: z
    .object({
      source: z.enum(['script', 'voice', 'video', 'write-for-me']).default('script'),
      script: z.string().default(''),
      topic: z.string().default(''),
      scriptLang: z.enum(['darija', 'msa', 'fr', 'en']).default('darija'),
      voiceAsset: z.string().nullable().default(null),
      videoAsset: z.string().nullable().default(null),
      product: z
        .object({
          name: z.string().default(''),
          photos: z.array(z.string()).default([]),
          price: z.string().default(''),
          oldPrice: z.string().default(''),
          offer: z.string().default(''),
          delivery58: z.boolean().default(true),
          cod: z.boolean().default(true),
          phone: z.string().default(''),
          whatsapp: z.string().default(''),
        })
        .default({ name: '', photos: [], price: '', oldPrice: '', offer: '', delivery58: true, cod: true, phone: '', whatsapp: '' }),
    })
    .default({
      source: 'script',
      script: '',
      topic: '',
      scriptLang: 'darija',
      voiceAsset: null,
      videoAsset: null,
      product: { name: '', photos: [], price: '', oldPrice: '', offer: '', delivery58: true, cod: true, phone: '', whatsapp: '' },
    }),
  settings: z
    .object({
      duration: z.number().min(10).max(180).default(30),
      aspect: z.enum(ASPECTS).default('9:16'),
      voiceOver: z.enum(['none', 'mine', 'ai']).default('none'),
      aiVoice: z.string().default('rachel'),
      voiceSpeed: z.number().min(0.7).max(1.3).default(1),
      music: z.enum(['calm', 'tech', 'bright', 'upload', 'none']).default('tech'),
      musicVolume: z.number().min(0).max(1).default(0.35),
      ducking: z.boolean().default(true),
      sfx: z.boolean().default(true),
      sfxIntensity: z.number().min(0).max(1).default(0.6),
      captions: z.boolean().default(true),
      captionSize: z.enum(['s', 'm', 'l']).default('m'),
      captionPos: z.enum(['top', 'middle', 'bottom']).default('bottom'),
      keywordColor: z.string().default(''),
      pace: z.enum(['calm', 'normal', 'fast']).default('normal'),
      accent: z.string().default(''),
      useBrandKit: z.boolean().default(true),
      endCard: z.boolean().default(true),
    })
    .default({
      duration: 30,
      aspect: '9:16',
      voiceOver: 'none',
      aiVoice: 'rachel',
      voiceSpeed: 1,
      music: 'tech',
      musicVolume: 0.35,
      ducking: true,
      sfx: true,
      sfxIntensity: 0.6,
      captions: true,
      captionSize: 'm',
      captionPos: 'bottom',
      keywordColor: '',
      pace: 'normal',
      accent: '',
      useBrandKit: true,
      endCard: true,
    }),
  step: z.number().int().min(1).max(7).default(1),
});
export type Wizard = z.infer<typeof WizardSchema>;
export const newWizard = (): Wizard => WizardSchema.parse({});
