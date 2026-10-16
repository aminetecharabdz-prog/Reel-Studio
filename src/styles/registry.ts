import type { StyleModule } from '@/engine/types';
import type { StyleId } from './catalog';

/** Style engines are code-split; load one before mounting a Player/export with it. */
const loaders: Partial<Record<StyleId, () => Promise<{ default: unknown }>>> = {
  product: () => import('./product'),
  infographic: () => import('./infographic'),
};

const loaded = new Map<StyleId, StyleModule<never>>();

export const hasEngine = (id: StyleId) => !!loaders[id];
export const getLoadedStyle = (id: StyleId) => loaded.get(id);
export const loadStyle = async (id: StyleId): Promise<StyleModule<never>> => {
  const hit = loaded.get(id);
  if (hit) return hit;
  const l = loaders[id];
  if (!l) throw new Error(`style ${id} has no engine yet`);
  const mod = (await l()).default as StyleModule<never>;
  await loadFonts(mod.fonts);
  loaded.set(id, mod);
  return mod;
};

/** waits until the given fonts ("700|Readex Pro") are usable, with Arabic + Latin samples */
export const loadFonts = async (specs: string[]) => {
  if (typeof document === 'undefined' || !document.fonts) return;
  await Promise.all(
    specs.map((s) => {
      const [weight = '400', family = s] = s.split('|');
      return document.fonts.load(`${weight} 64px "${family}"`, 'رسّام Rassam 0123').catch(() => undefined);
    }),
  );
};
