import { TranscriptSchema, type Transcript } from '../schema/transcript';

/** Reading-speed timings for a written script (no voice yet): ~2.6 words/s, longer words take longer, pauses on punctuation. */
export const timeScript = (script: string): Transcript => {
  const toks = script.trim().split(/\s+/).filter(Boolean);
  let t = 300;
  const words = toks.map((tok, i) => {
    const d = 230 + tok.length * 38;
    const w = { id: `w${i}`, text: tok, startMs: Math.round(t), endMs: Math.round(t + d), confidence: 1 };
    t += d + (/[.!?؟]$/.test(tok) ? 380 : /[،,]$/.test(tok) ? 180 : 40);
    return w;
  });
  return TranscriptSchema.parse({ language: 'ar', words, durationMs: Math.round(t + 400), source: 'manual' });
};
