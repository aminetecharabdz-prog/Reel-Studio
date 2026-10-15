import type { Src } from './schema';
import { STICKERS } from './stickers';
import { LIBRARY } from './library';

export const publicUrl = (p: string) => `${import.meta.env?.BASE_URL ?? './'}${p.replace(/^\.?\//, '')}`;

/** Resolve an image source to a URL: generated/user assets via the lookup, stickers & public files directly. */
export const makeResolver = (lookup: (assetId: string) => string | null, userMedia: string[] = []) => (s: Src): string | null => {
  if (s.assetId) {
    const u = lookup(s.assetId);
    if (u) return u;
  }
  if (s.kind === 'user' && s.index !== undefined) return userMedia[s.index] ?? null;
  if (s.kind === 'url' && s.url) return /^(https?:|blob:|data:)/.test(s.url) ? s.url : publicUrl(s.url);
  if (s.kind === 'library' && s.name && LIBRARY.has(s.name)) return publicUrl(`art/${s.name}.webp`);
  if (s.name && STICKERS.has(s.name)) return publicUrl(`art/3d/${s.name}.webp`);
  return null;
};
