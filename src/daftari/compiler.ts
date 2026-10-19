// Timing compiler: the only place where seconds become frames.
// Visuals and captions are anchored to word IDs found by phrase text, never to typed seconds.

export type RawVoice = { id: string; duration: number };
export type RawWord = { id: string; voice: string; text: string; start: number; end: number; breakAfter: number };

export type Word = RawWord & { index: number; startFrame: number; endFrame: number };
export type CaptionChunk = { text: string; firstWord: number; lastWord: number; startFrame: number; endFrame: number };
export type VoiceClip = { id: string; fromFrame: number; durationInFrames: number };

/** Longest caption allowed: two lines at the caption font size (checked by scripts/check-daftari.ts). */
export const MAX_CAPTION_CHARS = 44;

const normalize = (s: string) =>
  s
    .replace(/[ً-ْ]/g, "") // harakat / shadda
    .replace(/[^\p{L}\p{N}%]/gu, "")
    .toLowerCase();

export const compileTimeline = (voices: RawVoice[], raw: RawWord[], fps: number, tailSeconds: number) => {
  const offsets = new Map<string, number>();
  let t = 0;
  const clips: VoiceClip[] = [];
  for (const v of voices) {
    offsets.set(v.id, t);
    clips.push({ id: v.id, fromFrame: Math.round(t * fps), durationInFrames: Math.ceil(v.duration * fps) });
    t += v.duration;
  }
  const durationInFrames = Math.ceil((t + tailSeconds) * fps);

  const words: Word[] = raw.map((w, index) => {
    const off = offsets.get(w.voice);
    if (off === undefined) throw new Error(`Unknown voice ${w.voice}`);
    return {
      ...w,
      index,
      startFrame: Math.round((off + w.start) * fps),
      endFrame: Math.max(Math.round((off + w.start) * fps) + 1, Math.round((off + w.end) * fps)),
    };
  });
  const norm = words.map((w) => normalize(w.text));

  /** Index of the first word of the `occurrence`-th match of `phrase`. */
  const find = (phrase: string, occurrence = 1): number => {
    const toks = phrase.split(/\s+/).map(normalize).filter(Boolean);
    let seen = 0;
    for (let i = 0; i + toks.length <= norm.length; i++) {
      if (toks.every((tok, k) => norm[i + k] === tok)) {
        seen++;
        if (seen === occurrence) return i;
      }
    }
    throw new Error(`Phrase not found in transcript: "${phrase}" (#${occurrence})`);
  };

  /** Frame where `phrase` starts being spoken. */
  const at = (phrase: string, occurrence = 1) => words[find(phrase, occurrence)].startFrame;
  /** Frame where the last word of `phrase` ends. */
  const endOf = (phrase: string, occurrence = 1) => {
    const i = find(phrase, occurrence);
    return words[i + phrase.split(/\s+/).filter((x) => normalize(x)).length - 1].endFrame;
  };

  return { words, clips, durationInFrames, at, endOf, captions: buildCaptions(words, fps) };
};

const chunkText = (ws: Word[]) => ws.map((w) => w.text).join(" ");

/** One caption per phrase (split at punctuation); short list items merge; long phrases split in two. */
export const buildCaptions = (words: Word[], fps: number): CaptionChunk[] => {
  const phrases: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const voiceEnds = i + 1 < words.length && words[i + 1].voice !== w.voice;
    if (w.breakAfter >= 1.5 || voiceEnds || i === words.length - 1) {
      phrases.push(cur);
      cur = [];
    }
  });

  // Merge tiny neighbouring phrases (e.g. "الحضور، النقاط،") when they fit and follow each other closely.
  const merged: Word[][] = [];
  for (const p of phrases) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last[0].voice === p[0].voice &&
      (chunkText(last).length < 14 || chunkText(p).length < 10) &&
      chunkText([...last, ...p]).length <= 30 &&
      p[0].startFrame - last[last.length - 1].endFrame < fps * 0.6
    ) {
      last.push(...p);
    } else {
      merged.push([...p]);
    }
  }

  // Split anything too long for two lines at the word nearest the middle.
  const fitted: Word[][] = [];
  const split = (p: Word[]) => {
    if (chunkText(p).length <= MAX_CAPTION_CHARS || p.length < 2) {
      fitted.push(p);
      return;
    }
    const total = chunkText(p).length;
    let best = 1;
    let bestDiff = Infinity;
    for (let k = 1; k < p.length; k++) {
      const d = Math.abs(chunkText(p.slice(0, k)).length - total / 2);
      if (d < bestDiff) {
        bestDiff = d;
        best = k;
      }
    }
    split(p.slice(0, best));
    split(p.slice(best));
  };
  merged.forEach(split);

  return fitted.map((p, i) => {
    const next = fitted[i + 1];
    const startFrame = Math.max(0, p[0].startFrame - 3);
    const naturalEnd = p[p.length - 1].endFrame + Math.round(fps * 0.6);
    const endFrame = next ? Math.min(naturalEnd, next[0].startFrame - 3) : naturalEnd;
    return { text: chunkText(p), firstWord: p[0].index, lastWord: p[p.length - 1].index, startFrame, endFrame };
  });
};
