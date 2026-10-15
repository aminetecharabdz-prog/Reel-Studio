import type { Transcript, Word } from '../schema/transcript';
import { TranscriptSchema } from '../schema/transcript';

/**
 * Free fallback (demo mode, no key): the user types what they said; words are spread over the
 * detected voiced segments proportionally to their length. Marked low-confidence so the review
 * screen highlights them. Not frame-perfect — the UI says so.
 */
export const alignTextToVoice = (text: string, voiced: Array<[number, number]>, durationMs: number): Transcript => {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const segs = voiced.length ? voiced : [[200, Math.max(400, durationMs - 200)] as [number, number]];
  const totalVoiced = segs.reduce((s, [a, b]) => s + (b - a), 0);
  const weights = tokens.map((t) => Math.max(2, t.replace(/[^\p{L}\p{N}]/gu, '').length) + 1.5);
  const totalW = weights.reduce((a, b) => a + b, 0);
  const words: Word[] = [];
  let segIdx = 0;
  let segPos = segs[0]![0];
  tokens.forEach((tok, i) => {
    let dur = (weights[i]! / totalW) * totalVoiced;
    let start = segPos;
    // move to the next voiced segment if this one is used up
    while (segIdx < segs.length && segPos >= segs[segIdx]![1] - 30) {
      segIdx++;
      if (segIdx < segs.length) segPos = segs[segIdx]![0];
      start = segPos;
    }
    const segEnd = segs[Math.min(segIdx, segs.length - 1)]![1];
    dur = Math.min(dur, Math.max(80, segEnd - start));
    words.push({ id: `w${i}`, text: tok, startMs: Math.round(start), endMs: Math.round(start + dur), confidence: 0.5 });
    segPos = start + dur;
  });
  return TranscriptSchema.parse({ language: 'ar', words, durationMs, source: 'manual' });
};
