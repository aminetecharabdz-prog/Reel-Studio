/** Greedy line layout with real font measurements (SPEC §7: measure before layout, never split a word). */
export type MeasureFn = (text: string, fontSize: number) => number;

export type LayoutResult = { fontSize: number; lines: string[][]; overflow: boolean };

export const layoutText = (
  text: string,
  o: { maxWidth: number; maxSize: number; minSize: number; maxLines: number; measure: MeasureFn },
): LayoutResult => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { fontSize: o.maxSize, lines: [], overflow: false };
  // measure once at a reference size; width scales linearly with font size
  const REF = 100;
  const ww = words.map((w) => o.measure(w, REF));
  const space = o.measure(' ', REF) || REF * 0.25;
  const wrap = (size: number) => {
    const k = size / REF;
    const lines: string[][] = [];
    let cur: string[] = [];
    let curW = 0;
    for (let i = 0; i < words.length; i++) {
      const w = ww[i]! * k;
      const add = cur.length ? space * k + w : w;
      if (cur.length && curW + add > o.maxWidth) {
        lines.push(cur);
        cur = [words[i]!];
        curW = w;
      } else {
        cur.push(words[i]!);
        curW += add;
      }
    }
    if (cur.length) lines.push(cur);
    const widest = Math.max(...ww) * k;
    return { lines, fits: lines.length <= o.maxLines && widest <= o.maxWidth };
  };
  for (let size = o.maxSize; size >= o.minSize; size = Math.floor(size * 0.95)) {
    const r = wrap(size);
    if (r.fits) return { fontSize: size, lines: balance(r.lines, ww, words, space * (size / REF), size / REF, o.maxWidth), overflow: false };
    if (size === o.minSize) break;
    if (Math.floor(size * 0.95) < o.minSize) {
      const r2 = wrap(o.minSize);
      return { fontSize: o.minSize, lines: r2.lines, overflow: !r2.fits };
    }
  }
  const r = wrap(o.minSize);
  return { fontSize: o.minSize, lines: r.lines, overflow: !r.fits };
};

/** Avoid a ragged last line with a single short word: move words down while it keeps fitting. */
const balance = (lines: string[][], ww: number[], words: string[], space: number, k: number, maxW: number): string[][] => {
  if (lines.length < 2) return lines;
  const width = (ln: string[]) => ln.reduce((s, w, i) => s + ww[words.indexOf(w)]! * k + (i ? space : 0), 0);
  const out = lines.map((l) => [...l]);
  for (let guard = 0; guard < 6; guard++) {
    const last = out[out.length - 1]!;
    const prev = out[out.length - 2]!;
    if (prev.length < 2 || last.length >= prev.length - 1) break;
    const moved = prev[prev.length - 1]!;
    const cand = [moved, ...last];
    if (width(cand) > maxW) break;
    prev.pop();
    out[out.length - 1] = cand;
  }
  return out;
};
