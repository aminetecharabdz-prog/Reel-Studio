/**
 * The ONE compiler module where milliseconds become frames (SPEC §6, kit references/remotion.md).
 * Plans only ever say "on word w12"; components ask the timeline for that word's frame.
 */
import type { Transcript } from '@/engine/schema';

export type TWord = { id: string; i: number; text: string; s: number; e: number };

export class Timeline {
  readonly words: TWord[];
  private byId = new Map<string, TWord>();
  constructor(
    t: Transcript,
    readonly fps: number,
    readonly tailFrames: number,
  ) {
    this.words = t.words.map((w, i) => ({ id: w.id, i, text: w.text, s: Math.round((w.startMs / 1000) * fps), e: Math.max(Math.round((w.startMs / 1000) * fps) + 1, Math.round((w.endMs / 1000) * fps)) }));
    this.words.forEach((w) => this.byId.set(w.id, w));
    this.lastFrame = Math.max(Math.round((t.durationMs / 1000) * fps), (this.words[this.words.length - 1]?.e ?? 0) + Math.round(fps * 0.4));
  }
  readonly lastFrame: number;
  get durationInFrames() {
    return this.lastFrame + this.tailFrames;
  }
  word(id: string | undefined): TWord | undefined {
    return id ? this.byId.get(id) : undefined;
  }
  /** start frame of a word; unknown ids fall back */
  at(id: string | undefined, fallback = 0): number {
    return this.word(id)?.s ?? fallback;
  }
  end(id: string | undefined, fallback = 0): number {
    return this.word(id)?.e ?? fallback;
  }
  index(id: string | undefined): number {
    return this.word(id)?.i ?? -1;
  }
  /** words from a to b inclusive */
  range(a: string, b: string): TWord[] {
    const i = this.index(a), j = this.index(b);
    if (i < 0 || j < 0) return [];
    return this.words.slice(Math.min(i, j), Math.max(i, j) + 1);
  }
  /** the cut before a scene's first word: in the pause, at most 5 frames before the word */
  cutBefore(id: string): number {
    const w = this.word(id);
    if (!w || w.i === 0) return 0;
    const prev = this.words[w.i - 1]!;
    return Math.max(prev.e, w.s - Math.round(this.fps * 0.16));
  }
  /** scene windows from each scene's first word id (sorted by time); the last one runs to the end */
  scenes(firstIds: string[]): Array<{ from: number; to: number }> {
    return firstIds.map((id, k) => {
      const from = k === 0 ? 0 : this.cutBefore(id);
      const next = firstIds[k + 1];
      const to = next ? this.cutBefore(next) : this.durationInFrames;
      return { from, to: Math.max(from + 1, to) };
    });
  }
}

/** Seconds per word on screen before it may leave (kit arabic.md §8: 0.3 s per word + 0.6 s). */
export const minReadFrames = (words: number, fps: number) => Math.round((0.3 * words + 0.6) * fps);
