import { z } from 'zod';
import type { Transcriber, TTS } from './types';
import { TranscriptSchema, type Word } from '../schema/transcript';
import { MODELS, PRICES } from './config';
import { logCost } from '../cost/ledger';

const ScribeSchema = z.object({
  language_code: z.string().optional(),
  text: z.string().optional(),
  words: z.array(z.object({ text: z.string(), start: z.number().nullable().optional(), end: z.number().nullable().optional(), type: z.string().optional(), logprob: z.number().nullable().optional() })),
});

/** ElevenLabs Scribe speech-to-text with word timestamps. */
export const elevenScribe = (apiKey: string): Transcriber => ({
  id: 'elevenlabs',
  async transcribe(file, opts) {
    const fd = new FormData();
    fd.append('model_id', MODELS.elevenStt);
    fd.append('file', file, (file as File).name ?? 'audio');
    fd.append('timestamps_granularity', 'word');
    fd.append('tag_audio_events', 'false');
    if (opts.language) fd.append('language_code', opts.language);
    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': apiKey }, body: fd });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = ScribeSchema.parse(await res.json());
    const words: Word[] = [];
    for (const w of data.words) {
      if (w.type && w.type !== 'word') continue;
      if (!w.text.trim() || w.start == null || w.end == null) continue;
      words.push({ id: `w${words.length}`, text: w.text.trim(), startMs: Math.round(w.start * 1000), endMs: Math.round(w.end * 1000), confidence: w.logprob != null ? Math.max(0, Math.min(1, Math.exp(w.logprob))) : 1 });
    }
    const durationMs = Math.max(opts.durationMs ?? 0, (words[words.length - 1]?.endMs ?? 0) + 300);
    await logCost({ projectId: opts.projectId ?? null, provider: 'elevenlabs', model: MODELS.elevenStt, op: 'transcribe', units: durationMs / 60000, unitLabel: 'min', usd: (durationMs / 60000) * PRICES.elevenSttPerMinute });
    return TranscriptSchema.parse({ language: data.language_code?.startsWith('fr') ? 'fr' : data.language_code?.startsWith('en') ? 'en' : 'ar', words, durationMs, source: 'elevenlabs' });
  },
});

const AlignSchema = z.object({
  audio_base64: z.string(),
  alignment: z.object({ characters: z.array(z.string()), character_start_times_seconds: z.array(z.number()), character_end_times_seconds: z.array(z.number()) }).nullable(),
});

/** ElevenLabs TTS with character timestamps → word-level transcript (mode B voice-over from a script). */
export const elevenTTS = (apiKey: string): TTS => ({
  id: 'elevenlabs-tts',
  async speak(script, opts) {
    const voice = opts.voiceId ?? 'pNInz6obpgDQGcFmaJgB';
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({ text: script, model_id: MODELS.elevenTts }),
    });
    if (!res.ok) throw new Error(`ElevenLabs TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = AlignSchema.parse(await res.json());
    const bytes = Uint8Array.from(atob(data.audio_base64), (c) => c.charCodeAt(0));
    const audio = new Blob([bytes], { type: 'audio/mpeg' });
    const words: Word[] = [];
    const a = data.alignment;
    if (a) {
      let cur = '';
      let start = 0;
      let end = 0;
      a.characters.forEach((ch, i) => {
        if (/\s/.test(ch)) {
          if (cur) words.push({ id: `w${words.length}`, text: cur, startMs: Math.round(start * 1000), endMs: Math.round(end * 1000), confidence: 1 });
          cur = '';
          return;
        }
        if (!cur) start = a.character_start_times_seconds[i]!;
        cur += ch;
        end = a.character_end_times_seconds[i]!;
      });
      if (cur) words.push({ id: `w${words.length}`, text: cur, startMs: Math.round(start * 1000), endMs: Math.round(end * 1000), confidence: 1 });
    }
    await logCost({ projectId: opts.projectId ?? null, provider: 'elevenlabs', model: MODELS.elevenTts, op: 'tts', units: script.length / 1000, unitLabel: 'k chars', usd: (script.length / 1000) * PRICES.elevenTtsPer1kChars });
    const durationMs = (words[words.length - 1]?.endMs ?? 1000) + 400;
    return { audio, transcript: TranscriptSchema.parse({ language: 'ar', words, durationMs, source: 'tts' }) };
  },
});
