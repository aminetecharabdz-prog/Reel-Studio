import { repo } from '../repo/db';

/** BYOK keys live ONLY in this browser (SPEC §2.2). */
export type Keys = {
  anthropic?: string;
  elevenlabs?: string;
  openai?: string;
  imageProvider?: 'none' | 'gemini' | 'openai' | 'fal';
  gemini?: string;
  fal?: string;
  sttProvider?: 'elevenlabs' | 'openai' | 'demo';
};

let cache: Keys | null = null;
export const getKeys = async (): Promise<Keys> => (cache ??= (await repo.getSetting<Keys>('keys')) ?? {});
export const setKeys = async (k: Keys) => {
  cache = k;
  await repo.setSetting('keys', k);
  window.dispatchEvent(new CustomEvent('keys-changed'));
};
export const isDemoMode = (k: Keys) => !k.anthropic && !k.elevenlabs && !k.openai;
