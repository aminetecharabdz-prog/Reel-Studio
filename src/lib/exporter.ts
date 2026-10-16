/**
 * Export in the browser (@remotion/web-renderer): MP4 (H.264/AAC) when the device can encode it, else WebM (VP8/Opus).
 * Plus cover stills and an SRT file from the word timing.
 */
import { canRenderMediaOnWeb, renderMediaOnWeb, renderStillOnWeb } from '@remotion/web-renderer';
import { RassamVideo, buildCtx } from '@/engine/Composition';
import type { Timing } from '@/engine/timing';
import { DIMS, type VideoInput } from '@/engine/types';

const comp = (input: VideoInput, scale = 1) => {
  const ctx = buildCtx(input);
  const { w, h } = DIMS[input.aspect];
  return {
    composition: { component: RassamVideo as never, id: 'rassam', width: w, height: h, fps: ctx.fps, durationInFrames: ctx.durationInFrames },
    inputProps: { input } as never,
    scale,
  };
};

export type ExportQuality = '720p' | '1080p';

export const exportVideo = async (input: VideoInput, opts: { quality: ExportQuality; onProgress?: (p: number) => void; signal?: AbortSignal; frameRange?: [number, number] }) => {
  const scale = opts.quality === '720p' ? 720 / Math.min(DIMS[input.aspect].w, DIMS[input.aspect].h) : 1;
  const base = comp(input, scale);
  const tries = [
    { container: 'mp4' as const, videoCodec: 'h264' as const, audioCodec: 'aac' as const, ext: 'mp4' },
    { container: 'webm' as const, videoCodec: 'vp8' as const, audioCodec: 'opus' as const, ext: 'webm' },
  ];
  let pick = tries[1]!;
  for (const t of tries) {
    try {
      const ok = await canRenderMediaOnWeb({ container: t.container, videoCodec: t.videoCodec, audioCodec: t.audioCodec, width: Math.round(DIMS[input.aspect].w * scale), height: Math.round(DIMS[input.aspect].h * scale) } as never);
      if ((ok as { canRender?: boolean }).canRender) {
        pick = t;
        break;
      }
    } catch {
      /* try next */
    }
  }
  const res = await renderMediaOnWeb({
    ...base,
    container: pick.container,
    videoCodec: pick.videoCodec,
    audioCodec: pick.audioCodec,
    videoBitrate: 'high',
    onProgress: (p: { progress: number }) => opts.onProgress?.(p.progress),
    signal: opts.signal ?? null,
    frameRange: opts.frameRange ?? null,
    licenseKey: 'free-license',
  } as never);
  return { blob: await res.getBlob(), ext: pick.ext };
};

export const exportStill = async (input: VideoInput, frame: number, format: 'jpeg' | 'png' = 'jpeg') => {
  const res = await renderStillOnWeb({ ...comp(input, 1), frame, licenseKey: 'free-license' } as never);
  return res.blob({ format, quality: 0.9 });
};

const ts = (s: number) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};
/** SRT from the timing: one cue per script line (Arabic stays RTL; players handle bidi) */
export const toSrt = (t: Timing) => t.lines.map((l, i) => `${i + 1}\n${ts(l.start)} --> ${ts(l.end + 0.3)}\n${l.text}\n`).join('\n');

export const download = (blob: Blob, name: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
};
