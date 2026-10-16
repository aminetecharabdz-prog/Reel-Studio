/**
 * THE timing module (kit references/remotion.md + our SPEC §6): when every word is said. Scenes never hard-code
 * seconds; they ask for a word — by text (`line()` / `word()`, the kit's API, used by hand-authored demos) or by id
 * (`w12`, used by AI and local plans). Seconds become frames ONLY here (`toFrame`).
 */
import { z } from 'zod';

export const WordSchema = z.object({
  id: z.string().regex(/^w\d+$/),
  w: z.string().min(1),
  start: z.number().min(0),
  end: z.number().min(0),
  conf: z.number().min(0).max(1).optional(),
});
export const LineSchema = z.object({
  text: z.string(),
  start: z.number(),
  end: z.number(),
  words: z.array(WordSchema).min(1),
});
export const TimingSchema = z.object({
  source: z.string().default(''),
  /** voice file (asset id or URL) or null for SFX/music-only videos */
  audio: z.string().nullable().default(null),
  duration: z.number().positive(),
  lines: z.array(LineSchema).min(1),
});
export type Word = z.infer<typeof WordSchema>;
export type Line = z.infer<typeof LineSchema>;
export type Timing = z.infer<typeof TimingSchema>;

export const FPS = 30;

/** Compare Arabic and Latin text loosely: no diacritics, tatweel or punctuation; one alef, ya and ha. */
export const norm = (s: string) =>
  s
    .normalize('NFKC')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const toFrame = (s: number, fps = FPS) => Math.round(s * fps);
export const toSec = (f: number, fps = FPS) => f / fps;

/** Seconds a line must stay readable (kit arabic.md §8): 0.3 s per word + 0.6 s. */
export const readSeconds = (words: number) => 0.3 * words + 0.6;

export class TimingIndex {
  readonly words: Word[];
  readonly lines: Line[];
  private byIdMap = new Map<string, { word: Word; line: number; index: number }>();
  constructor(
    readonly timing: Timing,
    readonly fps = FPS,
  ) {
    this.lines = timing.lines;
    this.words = timing.lines.flatMap((l) => l.words);
    timing.lines.forEach((l, li) => l.words.forEach((w) => this.byIdMap.set(w.id, { word: w, line: li, index: this.words.indexOf(w) })));
  }
  get duration() {
    return this.timing.duration;
  }
  /** a word by id (`w12`); unknown ids snap to the nearest word so a bad plan never crashes a render */
  byId(id: string): Word {
    const hit = this.byIdMap.get(id);
    if (hit) return hit.word;
    const n = Number(id.replace(/\D/g, '')) || 0;
    return this.words[Math.max(0, Math.min(this.words.length - 1, n))]!;
  }
  /** index of a word in the whole video */
  indexOf(id: string) {
    return this.byIdMap.get(id)?.index ?? this.words.indexOf(this.byId(id));
  }
  /** the line a word belongs to */
  lineOf(id: string): Line {
    return this.lines[this.byIdMap.get(id)?.line ?? 0]!;
  }
  /** words from a to b inclusive (by id) */
  range(a: string, b: string): Word[] {
    const i = this.indexOf(a);
    const j = this.indexOf(b);
    return this.words.slice(Math.min(i, j), Math.max(i, j) + 1);
  }
  /** the first line whose text contains `query` (kit API) */
  line(query: string): Line {
    const q = norm(query);
    const l = this.lines.find((x) => norm(x.text).includes(q));
    if (!l) throw new Error(`No line contains «${query}». Lines: ${this.lines.map((x) => x.text).join(' | ')}`);
    return l;
  }
  /** a word of a line (or of the line containing `inLine`); `nth` picks a later repeat (kit API) */
  word(inLine: Line | string, query: string, nth = 0): Word {
    const l = typeof inLine === 'string' ? this.line(inLine) : inLine;
    const q = norm(query);
    const hits = l.words.filter((w) => norm(w.w) === q || norm(w.w).includes(q));
    const w = hits[nth];
    if (!w) throw new Error(`No word «${query}» in «${l.text}»`);
    return w;
  }
  /** where a scene opening on this word (id) starts: in the pause before it, never mid-word */
  cutBefore(id: string, lead = 0.2): number {
    const i = this.indexOf(id);
    if (i <= 0) return 0;
    const prev = this.words[i - 1]!;
    const w = this.words[i]!;
    return Math.max(prev.end, w.start - lead);
  }
  /** scene windows (seconds) from each scene's first word id; the last runs to the end of the video */
  windows(firstIds: string[], end = this.duration): Array<{ from: number; to: number }> {
    return firstIds.map((id, k) => {
      const from = k === 0 ? 0 : this.cutBefore(id);
      const next = firstIds[k + 1];
      const to = next ? this.cutBefore(next) : end;
      return { from, to: Math.max(from + 1 / this.fps, to) };
    });
  }
  toFrame(s: number) {
    return toFrame(s, this.fps);
  }
}

/** A plain words list (one entry per line of script) → word ids assigned in order. */
export const withIds = (lines: Array<{ text: string; start: number; end: number; words: Array<Omit<Word, 'id'> & { id?: string }> }>): Line[] => {
  let n = 0;
  return lines.map((l) => ({ ...l, words: l.words.map((w) => ({ ...w, id: `w${n++}` })) }));
};
