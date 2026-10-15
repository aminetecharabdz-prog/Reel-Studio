import type { Transcript, Word } from '../schema/transcript';
import type { CutRange } from '../schema/project';

export type Segment = { srcStartMs: number; srcEndMs: number; outStartMs: number };

/** Merge enabled cut ranges into sorted, non-overlapping intervals. */
export const normalizeCuts = (cuts: CutRange[], durationMs: number) => {
  const r = cuts
    .filter((c) => c.enabled && c.endMs > c.startMs)
    .map((c) => ({ s: Math.max(0, c.startMs), e: Math.min(durationMs, c.endMs) }))
    .sort((a, b) => a.s - b.s);
  const out: { s: number; e: number }[] = [];
  for (const c of r) {
    const last = out[out.length - 1];
    if (last && c.s <= last.e) last.e = Math.max(last.e, c.e);
    else out.push({ ...c });
  }
  return out;
};

/**
 * Apply cuts to a transcript (mode C). Words fully inside a cut are dropped; the rest are
 * shifted left by the total cut time before them. Returns the kept source segments so the
 * composition can play the footage piecewise.
 */
export const applyCuts = (t: Transcript, cuts: CutRange[]): { transcript: Transcript; segments: Segment[] } => {
  const ranges = normalizeCuts(cuts, t.durationMs);
  if (ranges.length === 0) return { transcript: t, segments: [{ srcStartMs: 0, srcEndMs: t.durationMs, outStartMs: 0 }] };
  const segments: Segment[] = [];
  let cursor = 0;
  let removed = 0;
  for (const c of ranges) {
    if (c.s > cursor) segments.push({ srcStartMs: cursor, srcEndMs: c.s, outStartMs: cursor - removed });
    removed += c.e - Math.max(c.s, cursor);
    cursor = Math.max(cursor, c.e);
  }
  if (cursor < t.durationMs) segments.push({ srcStartMs: cursor, srcEndMs: t.durationMs, outStartMs: cursor - removed });
  const mapMs = (ms: number): number | null => {
    for (const s of segments) if (ms >= s.srcStartMs && ms <= s.srcEndMs) return s.outStartMs + (ms - s.srcStartMs);
    return null;
  };
  const words: Word[] = [];
  for (const w of t.words) {
    const mid = (w.startMs + w.endMs) / 2;
    if (mapMs(mid) === null) continue; // word removed (filler)
    const seg = segments.find((s) => mid >= s.srcStartMs && mid <= s.srcEndMs)!;
    const start = Math.max(w.startMs, seg.srcStartMs);
    const end = Math.min(w.endMs, seg.srcEndMs);
    words.push({ ...w, startMs: seg.outStartMs + (start - seg.srcStartMs), endMs: seg.outStartMs + (end - seg.srcStartMs) });
  }
  const last = segments[segments.length - 1]!;
  const durationMs = last.outStartMs + (last.srcEndMs - last.srcStartMs);
  return { transcript: { ...t, words, durationMs }, segments };
};
