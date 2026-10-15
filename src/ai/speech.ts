/** Speech providers: ElevenLabs Scribe (word timestamps), ElevenLabs TTS with alignment, and a no-key estimator. */
import type { Transcript } from '@/engine/schema';
import { logCost } from '@/data/db';
import { AIError } from './claude';

const words = (text: string) => text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);

/** No key: spread the script words over the audio duration (or a natural speaking rate). */
export const estimateTranscript = (script: string, durationMs?: number, language = 'ar'): Transcript => {
  const ws = words(script);
  const weights = ws.map((w) => 0.55 + 0.11 * w.replace(/[.,!?؟،…]/g, '').length + (/[.!?؟…]$/.test(w) ? 0.9 : /[,،]$/.test(w) ? 0.4 : 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  const lead = 300;
  const total = durationMs ? Math.max(1000, durationMs - lead - 300) : sum * 400;
  let t = lead;
  const out = ws.map((w, i) => {
    const d = (weights[i]! / sum) * total;
    const word = { id: `w${i}`, text: w, startMs: Math.round(t), endMs: Math.round(t + d * 0.85), confidence: 0.5 };
    t += d;
    return word;
  });
  return { words: out, durationMs: Math.round(t + 300), language, source: 'estimate' };
};

export const audioDuration = (blob: Blob) =>
  new Promise<number>((res) => {
    const a = document.createElement('audio');
    a.preload = 'metadata';
    a.onloadedmetadata = () => res(isFinite(a.duration) ? a.duration * 1000 : 0);
    a.onerror = () => res(0);
    a.src = URL.createObjectURL(blob);
  });

export const scribe = async (key: string, blob: Blob, language?: string, projectId?: string): Promise<Transcript> => {
  const fd = new FormData();
  fd.append('model_id', 'scribe_v1');
  fd.append('file', blob, 'audio');
  fd.append('timestamps_granularity', 'word');
  fd.append('tag_audio_events', 'false');
  if (language) fd.append('language_code', language === 'ar-dz' ? 'ar' : language);
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': key }, body: fd });
  if (r.status === 401) throw new AIError('key', 'مفتاح ElevenLabs غير صالح');
  if (!r.ok) throw new AIError('network', `ElevenLabs ${r.status}`);
  const j = (await r.json()) as { words: Array<{ text: string; start: number; end: number; type: string }>; language_code?: string };
  const ws = j.words.filter((w) => w.type === 'word' && w.text.trim());
  if (!ws.length) throw new AIError('invalid', 'لم يتم التعرف على كلام');
  const dur = (await audioDuration(blob)) || ws[ws.length - 1]!.end * 1000 + 500;
  await logCost({ provider: 'elevenlabs', what: 'scribe', usd: (dur / 3600000) * 0.4, projectId, detail: `${Math.round(dur / 1000)}s` });
  return { words: ws.map((w, i) => ({ id: `w${i}`, text: w.text.trim(), startMs: Math.round(w.start * 1000), endMs: Math.round(w.end * 1000), confidence: 1 })), durationMs: Math.round(dur), language: j.language_code ?? 'ar', source: 'elevenlabs' };
};

/** Script → natural voice + exact word timings (ElevenLabs with-timestamps). */
export const tts = async (key: string, voiceId: string, script: string, projectId?: string): Promise<{ audio: Blob; transcript: Transcript }> => {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text: script, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3 } }),
  });
  if (r.status === 401) throw new AIError('key', 'مفتاح ElevenLabs غير صالح');
  if (!r.ok) throw new AIError('network', `ElevenLabs ${r.status}`);
  const j = (await r.json()) as { audio_base64: string; alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] } };
  const bin = atob(j.audio_base64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const audio = new Blob([u], { type: 'audio/mpeg' });
  const a = j.alignment;
  const out: Transcript['words'] = [];
  let cur = '', s = 0, e = 0;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) out.push({ id: `w${out.length}`, text: cur, startMs: Math.round(s * 1000), endMs: Math.round(e * 1000), confidence: 1 });
      cur = '';
      return;
    }
    if (!cur) s = a.character_start_times_seconds[i]!;
    cur += ch;
    e = a.character_end_times_seconds[i]!;
  });
  if (cur) out.push({ id: `w${out.length}`, text: cur, startMs: Math.round(s * 1000), endMs: Math.round(e * 1000), confidence: 1 });
  await logCost({ provider: 'elevenlabs', what: 'tts', usd: script.length * 0.00018, projectId, detail: `${script.length} chars` });
  return { audio, transcript: { words: out, durationMs: Math.round(e * 1000) + 500, language: 'ar', source: 'elevenlabs-tts' } };
};
