/** User media (photos, voice, video) kept as Blobs in IndexedDB; object URLs are created on demand and cached. */
import { useEffect, useState } from 'react';
import { db, uid } from './db';

const urls = new Map<string, string>();

export const putAsset = async (file: Blob, name = 'file') => {
  const id = `a_${uid().slice(0, 12)}`;
  await (await db()).put('assets', { id, blob: file, type: file.type, name, at: Date.now() });
  return id;
};

export const assetUrl = async (id: string): Promise<string | null> => {
  const hit = urls.get(id);
  if (hit) return hit;
  const rec = await (await db()).get('assets', id);
  if (!rec) return null;
  const u = URL.createObjectURL(rec.blob);
  urls.set(id, u);
  return u;
};

export const deleteAsset = async (id: string) => {
  const u = urls.get(id);
  if (u) URL.revokeObjectURL(u);
  urls.delete(id);
  await (await db()).delete('assets', id);
};

/** id → object URL map for a list of asset ids (ids that are already URLs/paths are skipped) */
export const useAssetUrls = (ids: Array<string | null | undefined>) => {
  const key = ids.filter(Boolean).join('|');
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true;
    (async () => {
      const out: Record<string, string> = {};
      for (const id of key.split('|').filter((x) => x.startsWith('a_'))) {
        const u = await assetUrl(id);
        if (u) out[id] = u;
      }
      if (live) setMap(out);
    })();
    return () => {
      live = false;
    };
  }, [key]);
  return map;
};

/** duration (s) of an audio/video blob URL */
export const mediaDuration = (url: string, kind: 'audio' | 'video' = 'audio') =>
  new Promise<number>((res) => {
    const el = document.createElement(kind);
    el.preload = 'metadata';
    el.onloadedmetadata = () => res(Number.isFinite(el.duration) ? el.duration : 0);
    el.onerror = () => res(0);
    el.src = url;
  });

/** shrink a photo to ≤ maxPx on its long side (keeps PNG transparency) */
export const shrinkImage = async (file: File, maxPx = 1400): Promise<Blob> => {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, maxPx / Math.max(bmp.width, bmp.height));
  if (k >= 1 && file.size < 1.5e6) return file;
  const c = new OffscreenCanvas(Math.round(bmp.width * k), Math.round(bmp.height * k));
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.convertToBlob({ type: file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality: 0.9 });
};
