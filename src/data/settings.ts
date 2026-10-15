/** Owner/customer settings. API keys live ONLY in this browser (localStorage), never sent anywhere but the provider. */
import { useSyncExternalStore } from 'react';
import { z } from 'zod';

export const CLAUDE_MODELS = [
  { id: 'claude-sonnet-5-5', ar: 'Sonnet 5.5 — متوازن (موصى به)', inUsd: 2, outUsd: 10 },
  { id: 'claude-opus-5-5', ar: 'Opus 5.5 — أعلى إبداع', inUsd: 4, outUsd: 20 },
  { id: 'claude-haiku-5-5', ar: 'Haiku 5.5 — الأرخص والأسرع', inUsd: 1, outUsd: 5 },
] as const;
export const GEMINI_IMAGE_MODELS = ['gemini-3-pro-image-preview', 'gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview'] as const;

export const SettingsSchema = z.object({
  keys: z.object({ claude: z.string().default(''), gemini: z.string().default(''), elevenlabs: z.string().default('') }).default({ claude: '', gemini: '', elevenlabs: '' }),
  claudeModel: z.string().default('claude-sonnet-5-5'),
  effort: z.enum(['low', 'medium', 'high']).default('medium'),
  geminiModel: z.string().default('auto'),
  imageQuality: z.enum(['off', 'eco', 'full']).default('full'),
  maxImages: z.number().int().min(0).max(12).default(6),
  voiceId: z.string().default('JBFqnCBsd6RMkjVDRZzb'),
  defaults: z
    .object({
      aspect: z.enum(['9:16', '4:5', '1:1', '16:9']).default('9:16'),
      digits: z.enum(['western', 'eastern']).default('western'),
      captions: z.boolean().default(false),
      music: z.string().default('auto'),
      musicVolume: z.number().min(0).max(1).default(0.5),
      sfx: z.boolean().default(true),
      sfxLevel: z.number().min(0).max(1.5).default(1),
      language: z.enum(['ar-dz', 'ar', 'fr', 'en']).default('ar-dz'),
      quality: z.enum(['720', '1080']).default('1080'),
    })
    .default({ aspect: '9:16', digits: 'western', captions: false, music: 'auto', musicVolume: 0.5, sfx: true, sfxLevel: 1, language: 'ar-dz', quality: '1080' }),
  brand: z
    .object({ enabled: z.boolean().default(false), name: z.string().default(''), colors: z.array(z.string()).default([]), handle: z.string().default(''), phone: z.string().default(''), cta: z.string().default(''), font: z.string().default('') })
    .default({ enabled: false, name: '', colors: [], handle: '', phone: '', cta: '', font: '' }),
  endCard: z.boolean().default(true),
  safeOverlay: z.boolean().default(false),
  uiLang: z.enum(['ar', 'fr', 'en']).default('ar'),
});
export type Settings = z.infer<typeof SettingsSchema>;

const KEY = 'motiq.settings.v1';
const load = (): Settings => {
  try {
    return SettingsSchema.parse(JSON.parse(localStorage.getItem(KEY) ?? '{}'));
  } catch {
    return SettingsSchema.parse({});
  }
};
let cur: Settings = typeof localStorage === 'undefined' ? SettingsSchema.parse({}) : load();
const subs = new Set<() => void>();
export const getSettings = () => cur;
export const saveSettings = (s: Settings) => {
  cur = SettingsSchema.parse(s);
  try {
    localStorage.setItem(KEY, JSON.stringify(cur));
  } catch {
    /* storage blocked: keep in memory */
  }
  subs.forEach((f) => f());
};
export const patchSettings = (fn: (s: Settings) => Settings) => saveSettings(fn(structuredClone(cur)));
export const useSettings = () =>
  useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => cur,
  );
export const modelPrice = (id: string) => CLAUDE_MODELS.find((m) => m.id === id) ?? CLAUDE_MODELS[0];
