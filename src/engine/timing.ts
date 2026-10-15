import type { Transcript, Word } from './schema';

/** The only place ms become frames. */
export const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);
/** visuals land 3–6 frames before their spoken word (anticipation) */
export const LEAD = (fps: number) => Math.round((4 / 30) * fps);

/** cut between two scenes: inside the pause, at most 150 ms before the next word */
export const cutBefore = (prev: Word | undefined, first: Word) => (prev ? Math.max(prev.endMs, first.startMs - 150) : 0);

export type Cut = { startMs: number; endMs: number; enabled: boolean; kind: 'silence' | 'filler' | 'manual'; label?: string };
export type Segment = { srcStartMs: number; srcEndMs: number; outStartMs: number };

/** Remove cut ranges from a transcript (talking-head mode); words keep their ids. */
export const applyCuts = (t: Transcript, cuts: Cut[]): { transcript: Transcript; segments: Segment[] } => {
  const r = cuts.filter((c) => c.enabled && c.endMs > c.startMs).map((c) => ({ s: Math.max(0, c.startMs), e: Math.min(t.durationMs, c.endMs) })).sort((a, b) => a.s - b.s);
  const merged: { s: number; e: number }[] = [];
  for (const c of r) {
    const l = merged[merged.length - 1];
    if (l && c.s <= l.e) l.e = Math.max(l.e, c.e);
    else merged.push({ ...c });
  }
  if (!merged.length) return { transcript: t, segments: [{ srcStartMs: 0, srcEndMs: t.durationMs, outStartMs: 0 }] };
  const segments: Segment[] = [];
  let cur = 0, removed = 0;
  for (const c of merged) {
    if (c.s > cur) segments.push({ srcStartMs: cur, srcEndMs: c.s, outStartMs: cur - removed });
    removed += c.e - Math.max(c.s, cur);
    cur = Math.max(cur, c.e);
  }
  if (cur < t.durationMs) segments.push({ srcStartMs: cur, srcEndMs: t.durationMs, outStartMs: cur - removed });
  const words: Word[] = [];
  for (const w of t.words) {
    const mid = (w.startMs + w.endMs) / 2;
    const seg = segments.find((s) => mid >= s.srcStartMs && mid <= s.srcEndMs);
    if (!seg) continue;
    words.push({ ...w, startMs: seg.outStartMs + Math.max(w.startMs, seg.srcStartMs) - seg.srcStartMs, endMs: seg.outStartMs + Math.min(w.endMs, seg.srcEndMs) - seg.srcStartMs });
  }
  const last = segments[segments.length - 1]!;
  return { transcript: { ...t, words, durationMs: last.outStartMs + last.srcEndMs - last.srcStartMs }, segments };
};

/** Split speech into phrases (for the local director and captions). */
export const phrases = (words: Word[], maxWords = 6, pauseMs = 380): Word[][] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const n = words[i + 1];
    const gap = n ? n.startMs - w.endMs : 1e9;
    if (/[.!?؟…،,:]$/.test(w.text) || gap >= pauseMs || cur.length >= maxWords) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};
