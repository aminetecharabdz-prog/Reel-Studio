import type { Word } from '../schema/transcript';
import { salience } from '../text/keywords';

export type CaptionGroupOptions = {
  wordsPerLine: number;
  maxChars: number;
  pauseBreakMs: number;
  /** word ids where a new scene starts — a caption line never crosses these */
  hardBreaksBefore: Set<string>;
};

const ENDS_PHRASE = /[.!?؟،,؛;:…]$/;

/**
 * Group words into caption lines by phrase punctuation, pauses, max words/chars, and never
 * across a scene cut (SPEC §6). Avoids single-word orphans when the phrase allows it.
 */
export const groupCaptionLines = (words: Word[], o: CaptionGroupOptions): Word[][] => {
  const lines: Word[][] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) lines.push(cur);
    cur = [];
  };
  words.forEach((w, i) => {
    if (cur.length && o.hardBreaksBefore.has(w.id)) flush();
    const chars = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
    if (cur.length && (cur.length >= o.wordsPerLine || chars > o.maxChars)) flush();
    cur.push(w);
    const next = words[i + 1];
    const pause = next ? next.startMs - w.endMs : Infinity;
    if (ENDS_PHRASE.test(w.text) || pause >= o.pauseBreakMs) flush();
  });
  flush();
  // orphan fix: move a lone trailing word back onto the previous line when allowed
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    const prev = lines[i - 1]!;
    const only = line[0]!;
    const prevLast = prev[prev.length - 1]!;
    if (
      line.length === 1 &&
      !o.hardBreaksBefore.has(only.id) &&
      !ENDS_PHRASE.test(prevLast.text) &&
      only.startMs - prevLast.endMs < o.pauseBreakMs &&
      prev.length < o.wordsPerLine + 1 &&
      prev.reduce((n, x) => n + x.text.length + 1, 0) + only.text.length <= o.maxChars + 4
    ) {
      prev.push(only);
      lines.splice(i, 1);
      i--;
    }
  }
  return lines;
};

/** Pick at most one keyword per line (reel-copywriting: highlight 1 keyword per caption line). */
export const pickLineKeyword = (line: Word[], forced: Set<string>): string | null => {
  const f = line.find((w) => forced.has(w.id));
  if (f) return f.id;
  let best: Word | null = null;
  let bestScore = 1.49;
  for (const w of line) {
    const s = salience(w.text) + w.text.length * 0.01;
    if (s > bestScore) {
      best = w;
      bestScore = s;
    }
  }
  return best?.id ?? null;
};
