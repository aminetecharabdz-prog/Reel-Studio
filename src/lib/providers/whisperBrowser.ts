import type { Transcriber } from './types';
import { TranscriptSchema, type Word } from '../schema/transcript';

/**
 * Free in-browser Whisper (transformers.js). Downloads the model on first use (~80–250 MB) and
 * runs on the phone — slow, lower Arabic accuracy, but needs no key. Loaded lazily.
 */
export const browserWhisper = (onProgress?: (msg: string) => void): Transcriber => ({
  id: 'whisper-browser',
  async transcribe(file, opts) {
    onProgress?.('تحميل نموذج Whisper…');
    const url = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
    const mod = (await import(/* @vite-ignore */ url)) as {
      pipeline: (task: string, model: string, o?: Record<string, unknown>) => Promise<(audio: Float32Array, o: Record<string, unknown>) => Promise<{ chunks?: Array<{ text: string; timestamp: [number, number | null] }> }>>;
    };
    const asr = await mod.pipeline('automatic-speech-recognition', 'Xenova/whisper-small', { dtype: 'q8', progress_callback: (p: { status?: string; progress?: number }) => onProgress?.(`${p.status ?? ''} ${p.progress ? Math.round(p.progress) + '%' : ''}`) });
    onProgress?.('التفريغ جارٍ…');
    const ctx = new OfflineAudioContext(1, 1, 16000);
    const buf = await ctx.decodeAudioData(await file.arrayBuffer());
    const off = new OfflineAudioContext(1, Math.ceil(buf.duration * 16000), 16000);
    const src = off.createBufferSource();
    src.buffer = buf;
    src.connect(off.destination);
    src.start();
    const pcm = (await off.startRendering()).getChannelData(0);
    const out = await asr(pcm, { return_timestamps: 'word', language: opts.language ?? 'arabic', task: 'transcribe', chunk_length_s: 30 });
    const words: Word[] = (out.chunks ?? []).filter((c) => c.text.trim()).map((c, i) => ({ id: `w${i}`, text: c.text.trim(), startMs: Math.round(c.timestamp[0] * 1000), endMs: Math.round((c.timestamp[1] ?? c.timestamp[0] + 0.3) * 1000), confidence: 0.7 }));
    return TranscriptSchema.parse({ language: 'ar', words, durationMs: Math.max(opts.durationMs ?? 0, (words[words.length - 1]?.endMs ?? 0) + 300), source: 'whisper' });
  },
});
