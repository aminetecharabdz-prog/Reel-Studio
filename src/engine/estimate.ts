/**
 * Word timing without a voice (port of the kit's `align.py --wps --gap`), and alignment of speech-to-text words
 * onto the user's script lines. Both produce the same `Timing` shape, so every style is built the same way.
 */
import { withIds, type Timing } from './timing';

const EDGE = /^[\s.,!?؟،؛:"'«»()[\]{}…\-–—]+|[\s.,!?؟،؛:"'«»()[\]{}…\-–—]+$/g;
const key = (tok: string) => tok.replace(EDGE, '').toLowerCase();

/** script text → lines of tokens (ElevenLabs [tags] removed, empty lines dropped) */
export const scriptLines = (script: string): string[][] =>
  script
    .split(/\r?\n/)
    .map((raw) =>
      raw
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/\.\.\./g, ' ')
        .replace(/…/g, '… ')
        .trim()
        .split(/\s+/)
        .filter((t) => key(t).length > 0),
    )
    .filter((l) => l.length > 0);

export type Pace = 'calm' | 'normal' | 'fast';
export const PACE_WPS: Record<Pace, number> = { calm: 1.9, normal: 2.2, fast: 2.6 };
export const PACE_GAP: Record<Pace, number> = { calm: 1.0, normal: 0.8, fast: 0.55 };

/** No audio: each word takes 1/wps seconds, scaled a little by its length (kit align.py speed_timings). */
export const estimateTiming = (script: string, opts: { wps?: number; gap?: number; lead?: number; tail?: number } = {}): Timing => {
  const { wps = 2.2, gap = 0.8, lead = 0.5, tail = 1.0 } = opts;
  const lines = scriptLines(script);
  if (!lines.length) throw new Error('السكريبت فارغ');
  let t = lead;
  const out = lines.map((toks) => {
    const words = toks.map((tok) => {
      const n = key(tok).length || 1;
      const d = (1 / wps) * Math.min(1.6, Math.max(0.6, n / 5));
      const w = { w: tok, start: round(t), end: round(t + d * 0.92) };
      t += d;
      return w;
    });
    t += gap;
    return { text: toks.join(' '), start: words[0]!.start, end: words[words.length - 1]!.end, words };
  });
  const last = out[out.length - 1]!;
  return { source: `estimate: ${wps} words/s, +${gap}s after every line (no voice)`, audio: null, duration: round(last.end + tail), lines: withIds(out) };
};

const round = (x: number) => Math.round(x * 1000) / 1000;

/** Levenshtein-free loose equality for aligning STT tokens to script tokens */
const same = (a: string, b: string) => {
  const x = key(a).replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  const y = key(b).replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  return x === y || (x.length > 3 && y.length > 3 && (x.includes(y) || y.includes(x)));
};

/**
 * Speech-to-text words (with times) → Timing whose lines follow the script. Script tokens without a match get times
 * interpolated between their matched neighbours. Without a script, lines are cut at pauses ≥ 0.45 s / 9 words.
 */
export const alignToScript = (stt: Array<{ w: string; start: number; end: number; conf?: number }>, script: string | null, audio: string | null, duration: number): Timing => {
  if (!stt.length) throw new Error('لم يُفهم أي كلام في الصوت');
  if (!script?.trim()) {
    const lines: Array<{ text: string; start: number; end: number; words: typeof stt }> = [];
    let cur: typeof stt = [];
    stt.forEach((w, i) => {
      cur.push(w);
      const next = stt[i + 1];
      if (!next || next.start - w.end >= 0.45 || cur.length >= 9 || /[.!?؟]$/.test(w.w)) {
        lines.push({ text: cur.map((x) => x.w).join(' '), start: cur[0]!.start, end: w.end, words: cur });
        cur = [];
      }
    });
    return { source: 'speech-to-text (lines cut at pauses)', audio, duration, lines: withIds(lines) };
  }
  const lines = scriptLines(script);
  const flat = lines.flat();
  const times: Array<{ start: number; end: number; conf?: number } | null> = flat.map(() => null);
  // greedy monotonic match with a small look-ahead window
  let j = 0;
  flat.forEach((tok, i) => {
    for (let k = j; k < Math.min(stt.length, j + 6); k++) {
      if (same(tok, stt[k]!.w)) {
        times[i] = { start: stt[k]!.start, end: stt[k]!.end, conf: stt[k]!.conf };
        j = k + 1;
        return;
      }
    }
  });
  // interpolate the gaps
  for (let i = 0; i < flat.length; i++) {
    if (times[i]) continue;
    let a = i - 1;
    while (a >= 0 && !times[a]) a--;
    let b = i + 1;
    while (b < flat.length && !times[b]) b++;
    const t0 = a >= 0 ? times[a]!.end : 0;
    const t1 = b < flat.length ? times[b]!.start : duration;
    const span = b - a - 1;
    const d = (t1 - t0) / Math.max(1, span);
    for (let k = a + 1; k < b; k++) times[k] = { start: round(t0 + d * (k - a - 1)), end: round(t0 + d * (k - a) - 0.02), conf: 0 };
    i = b - 1;
  }
  let n = 0;
  const out = lines.map((toks) => {
    const words = toks.map((w) => ({ w, ...times[n++]! }));
    return { text: toks.join(' '), start: words[0]!.start, end: words[words.length - 1]!.end, words };
  });
  return { source: 'speech-to-text aligned to the script', audio, duration, lines: withIds(out) };
};
