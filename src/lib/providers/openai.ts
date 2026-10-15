import { z } from 'zod';
import type { ImageGenerator, Transcriber } from './types';
import { TranscriptSchema, type Word } from '../schema/transcript';
import { MODELS, PRICES } from './config';
import { logCost } from '../cost/ledger';

const WhisperSchema = z.object({ language: z.string().optional(), duration: z.number().optional(), words: z.array(z.object({ word: z.string(), start: z.number(), end: z.number() })).default([]) });

export const openaiWhisper = (apiKey: string): Transcriber => ({
  id: 'openai',
  async transcribe(file, opts) {
    const fd = new FormData();
    fd.append('file', file, (file as File).name ?? 'audio.mp3');
    fd.append('model', MODELS.openaiStt);
    fd.append('response_format', 'verbose_json');
    fd.append('timestamp_granularities[]', 'word');
    if (opts.vocabulary) fd.append('prompt', opts.vocabulary.slice(0, 800));
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: fd });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = WhisperSchema.parse(await res.json());
    const words: Word[] = data.words.filter((w) => w.word.trim()).map((w, i) => ({ id: `w${i}`, text: w.word.trim(), startMs: Math.round(w.start * 1000), endMs: Math.round(w.end * 1000), confidence: 1 }));
    const durationMs = Math.max(opts.durationMs ?? 0, (data.duration ?? 0) * 1000, (words[words.length - 1]?.endMs ?? 0) + 300);
    await logCost({ projectId: opts.projectId ?? null, provider: 'openai', model: MODELS.openaiStt, op: 'transcribe', units: durationMs / 60000, unitLabel: 'min', usd: (durationMs / 60000) * PRICES.openaiSttPerMinute });
    return TranscriptSchema.parse({ language: 'ar', words, durationMs, source: 'openai' });
  },
});

export const openaiImages = (apiKey: string): ImageGenerator => ({
  id: 'openai-image',
  async generate(prompt, opts) {
    const size = opts.aspect === '1:1' ? '1024x1024' : '1024x1536';
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODELS.openaiImage, prompt, size, quality: 'low', n: 1 }),
    });
    if (!res.ok) throw new Error(`OpenAI image ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = z.object({ data: z.array(z.object({ b64_json: z.string() })) }).parse(await res.json());
    await logCost({ projectId: opts.projectId ?? null, provider: 'openai', model: MODELS.openaiImage, op: 'image', units: 1, unitLabel: 'image', usd: PRICES.openaiImage });
    return new Blob([Uint8Array.from(atob(data.data[0]!.b64_json), (c) => c.charCodeAt(0))], { type: 'image/png' });
  },
});
