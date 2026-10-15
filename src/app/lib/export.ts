/** The only module that calls the Remotion web renderer: MP4 (or WebM fallback) export in the browser + SRT. */
import { renderMediaOnWeb, getEncodableVideoCodecs } from '@remotion/web-renderer';
import type { Compiled } from '@/engine/compile';
import { Reel, prepare } from '@/engine/render/Reel';

export type ExportQuality = '720' | '1080';

const pickFormat = async (): Promise<{ container: 'mp4' | 'webm'; videoCodec: 'h264' | 'vp9' | 'vp8'; ext: string }> => {
  try {
    const mp4 = await getEncodableVideoCodecs('mp4');
    if (mp4.includes('h264')) return { container: 'mp4', videoCodec: 'h264', ext: 'mp4' };
    const webm = await getEncodableVideoCodecs('webm');
    if (webm.includes('vp9')) return { container: 'webm', videoCodec: 'vp9', ext: 'webm' };
    if (webm.includes('vp8')) return { container: 'webm', videoCodec: 'vp8', ext: 'webm' };
  } catch {
    /* fall through */
  }
  return { container: 'mp4', videoCodec: 'h264', ext: 'mp4' };
};

type WakeLock = { release: () => Promise<void> };
export const exportVideo = async (c: Compiled, quality: ExportQuality, onProgress: (p: number) => void, signal?: AbortSignal): Promise<{ blob: Blob; ext: string }> => {
  await prepare(c);
  let lock: WakeLock | null = null;
  try {
    lock = (await (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLock> } }).wakeLock?.request('screen')) ?? null;
  } catch {
    lock = null;
  }
  try {
    const f = await pickFormat();
    const scale = quality === '720' ? 720 / Math.min(c.width, c.height) : 1;
    const { getBlob } = await renderMediaOnWeb({
      composition: { id: 'reel', component: Reel as unknown as React.FC<Record<string, unknown>>, durationInFrames: c.durationInFrames, fps: c.fps, width: c.width, height: c.height, defaultProps: { c } as Record<string, unknown> },
      inputProps: { c },
      container: f.container,
      videoCodec: f.videoCodec,
      scale,
      videoBitrate: quality === '720' ? 'medium' : 'high',
      signal,
      onProgress: ({ progress }: { progress: number }) => onProgress(progress),
    } as unknown as Parameters<typeof renderMediaOnWeb>[0]);
    return { blob: await getBlob(), ext: f.ext };
  } finally {
    await lock?.release().catch(() => undefined);
  }
};

const ts = (frame: number, fps: number) => {
  const ms = Math.round((frame / fps) * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000), x = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(x).padStart(3, '0')}`;
};
export const toSrt = (words: Array<{ text: string; startMs: number; endMs: number }>, fps = 30) => {
  const out: string[] = [];
  for (let i = 0, n = 1; i < words.length; i += 5, n++) {
    const g = words.slice(i, i + 5);
    out.push(`${n}\n${ts(Math.round((g[0]!.startMs / 1000) * fps), fps)} --> ${ts(Math.round((g[g.length - 1]!.endMs / 1000) * fps), fps)}\n${g.map((w) => w.text).join(' ')}\n`);
  }
  return out.join('\n');
};

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
