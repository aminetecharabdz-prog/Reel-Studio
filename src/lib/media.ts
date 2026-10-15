import { repo, type AssetKind } from './repo/db';
import { sha256, uid } from './util/rng';
import { analyzeBuffer, decodeAudio, type AudioInfo } from './audio/analyze';
import { extractPalette } from './color/kmeans';

/** Save an uploaded file as an asset (deduplicated by content hash). */
export const saveUpload = async (file: File, kind: AssetKind, projectId: string): Promise<{ id: string; info?: AudioInfo }> => {
  const buf = await file.arrayBuffer();
  const hash = await sha256(buf);
  const existing = await repo.findAssetByHash(hash);
  let info: AudioInfo | undefined;
  if (kind === 'audio' || kind === 'video') {
    try {
      info = analyzeBuffer(await decodeAudio(file));
    } catch {
      info = undefined;
    }
  }
  if (existing && existing.projectId === projectId) return { id: existing.id, info };
  const id = uid(`${kind}_`);
  await repo.putAsset({ id, projectId, kind, name: file.name, mime: file.type, size: file.size, hash: existing ? `${hash}:${id}` : hash, blob: file, createdAt: Date.now(), meta: info ? { durationMs: info.durationMs, voiced: info.voiced, peakDb: info.peakDb } : {} });
  return { id, info };
};

/** k-means palette from a logo image. */
export const paletteFromImage = async (file: Blob): Promise<string[]> => {
  const bmp = await createImageBitmap(file);
  const c = new OffscreenCanvas(64, 64);
  const ctx = c.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0, 64, 64);
  return extractPalette(ctx.getImageData(0, 0, 64, 64).data, 5).slice(0, 5);
};

/** Silent WAV (for script-only reels without a TTS key). */
export const silentWav = (ms: number) => {
  const sr = 8000;
  const n = Math.ceil((ms / 1000) * sr);
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  return new Blob([buf], { type: 'audio/wav' });
};
