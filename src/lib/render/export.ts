/**
 * The ONLY module that calls the Remotion web renderer (SPEC §2.1 licensing/telemetry: one place
 * to count renders). Exports MP4 (H.264/AAC) in the browser, stills (thumbnail / QA) and SRT.
 */
import { renderMediaOnWeb, renderStillOnWeb, canRenderMediaOnWeb } from '@remotion/web-renderer';
import type { CompiledReel } from '../timing/types';
import { Reel, prepareReel } from '@/video/Reel';
import { repo } from '../repo/db';

export type ExportQuality = 'fast' | 'hd';

const composition = (reel: CompiledReel) => ({
  id: 'reel',
  component: Reel as unknown as React.FC<Record<string, unknown>>,
  durationInFrames: reel.durationInFrames,
  fps: reel.fps,
  width: reel.width,
  height: reel.height,
  defaultProps: { reel } as Record<string, unknown>,
});

const countRender = async (kind: string) => {
  const n = ((await repo.getSetting<Record<string, number>>('renderCount')) ?? {}) as Record<string, number>;
  n[kind] = (n[kind] ?? 0) + 1;
  await repo.setSetting('renderCount', n);
};

let wakeLock: { release: () => Promise<void> } | null = null;
const keepAwake = async () => {
  try {
    wakeLock = await (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request('screen') ?? null;
  } catch {
    wakeLock = null;
  }
};
const releaseAwake = async () => {
  try {
    await wakeLock?.release();
  } catch {
    /* ignore */
  }
  wakeLock = null;
};

export const checkExportSupport = async (reel: CompiledReel, quality: ExportQuality) => {
  const scale = quality === 'fast' ? 720 / reel.width : 1;
  try {
    const r = await canRenderMediaOnWeb({ width: reel.width, height: reel.height, scale, container: 'mp4', videoCodec: 'h264' } as Parameters<typeof canRenderMediaOnWeb>[0]);
    return r as unknown as { canRender: boolean; issues?: Array<{ message: string }> };
  } catch (e) {
    return { canRender: false, issues: [{ message: String(e) }] };
  }
};

export const exportMp4 = async (reel: CompiledReel, quality: ExportQuality, onProgress: (p: number, etaMs: number | null) => void, signal?: AbortSignal): Promise<Blob> => {
  await prepareReel(reel);
  await keepAwake();
  try {
    const scale = quality === 'fast' ? 720 / Math.min(reel.width, reel.height) : 1;
    const { getBlob } = await renderMediaOnWeb({
      composition: composition(reel),
      inputProps: { reel },
      container: 'mp4',
      videoCodec: 'h264',
      scale,
      videoBitrate: quality === 'fast' ? 'medium' : 'high',
      signal,
      onProgress: ({ progress, renderEstimatedTime }: { progress: number; renderEstimatedTime?: number }) => onProgress(progress, renderEstimatedTime ?? null),
    } as unknown as Parameters<typeof renderMediaOnWeb>[0]);
    const blob = await getBlob();
    await countRender(`mp4-${quality}`);
    return blob;
  } finally {
    await releaseAwake();
  }
};

export const renderStill = async (reel: CompiledReel, frame: number, scale = 0.5): Promise<Blob> => {
  await prepareReel(reel);
  const res = await renderStillOnWeb({
    composition: composition(reel),
    inputProps: { reel },
    frame,
    imageFormat: 'png',
    scale,
  } as unknown as Parameters<typeof renderStillOnWeb>[0]);
  await countRender('still');
  const r = res as unknown as { blob?: () => Promise<Blob> } | Blob;
  if (r instanceof Blob) return r;
  if (r && typeof (r as { blob?: () => Promise<Blob> }).blob === 'function') return (r as { blob: () => Promise<Blob> }).blob();
  throw new Error('renderStillOnWeb returned no image');
};

const ts = (frame: number, fps: number) => {
  const ms = Math.round((frame / fps) * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000), x = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(x).padStart(3, '0')}`;
};

/** SRT captions from the compiled caption lines (same timing as the video). */
export const toSrt = (reel: CompiledReel) =>
  reel.captions.map((c, i) => `${i + 1}\n${ts(c.words[0]!.start, reel.fps)} --> ${ts(c.to, reel.fps)}\n${c.words.map((w) => w.text).join(' ')}\n`).join('\n');

export const download = (blob: Blob, name: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 4000);
};
