import { useSyncExternalStore } from 'react';
import { z } from 'zod';

/**
 * App settings, kept ONLY in this browser (BYOK: keys never leave the device except to the provider's own API).
 */
export const SettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  uiLang: z.enum(['ar', 'fr', 'en']).default('ar'),
  digits: z.enum(['western', 'eastern']).default('western'),
  keys: z
    .object({
      anthropic: z.string().default(''),
      elevenlabs: z.string().default(''),
      openai: z.string().default(''),
      google: z.string().default(''),
    })
    .default({ anthropic: '', elevenlabs: '', openai: '', google: '' }),
  claudeModel: z.string().default('claude-sonnet-5-5'),
  perfMode: z.enum(['auto', 'full', 'lite']).default('auto'),
});
export type Settings = z.infer<typeof SettingsSchema>;

const KEY = 'rassam.settings.v1';
const read = (): Settings => {
  try {
    return SettingsSchema.parse(JSON.parse(localStorage.getItem(KEY) ?? '{}'));
  } catch {
    return SettingsSchema.parse({});
  }
};

let current: Settings = typeof localStorage === 'undefined' ? SettingsSchema.parse({}) : read();
const subs = new Set<() => void>();

export const getSettings = () => current;
export const setSettings = (patch: Partial<Settings> | ((s: Settings) => Settings)) => {
  current = typeof patch === 'function' ? patch(current) : { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* private mode: keep in memory */
  }
  applyTheme();
  subs.forEach((f) => f());
};
export const clearSettings = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  current = SettingsSchema.parse({});
  applyTheme();
  subs.forEach((f) => f());
};

export const useSettings = () =>
  useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => current,
  );

export const resolvedTheme = (s: Settings = current): 'dark' | 'light' =>
  s.theme === 'system' ? (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : s.theme;

export const applyTheme = () => {
  if (typeof document === 'undefined') return;
  const t = resolvedTheme();
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#F3F2EE' : '#0A141B');
};

export const hasKey = (k: keyof Settings['keys']) => !!current.keys[k].trim();
