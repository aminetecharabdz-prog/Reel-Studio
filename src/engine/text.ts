/** Arabic / Latin / number text helpers (bidi runs, digits, normalisation, measured layout). */
const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]/;
const LTR = /[A-Za-zÀ-ɏ]/;
export type Dir = 'rtl' | 'ltr';

export const detectDir = (s: string, fb: Dir = 'rtl'): Dir => {
  for (const ch of s) {
    if (RTL.test(ch)) return 'rtl';
    if (LTR.test(ch)) return 'ltr';
  }
  return fb;
};
export const wordDir = (w: string): Dir | 'neutral' => {
  const x = w.replace(/[،؛؟۔]/g, '');
  return RTL.test(x) ? 'rtl' : LTR.test(x) || /\d/.test(x) ? 'ltr' : 'neutral';
};
/** Consecutive same-direction words form one isolate (a French phrase inside Arabic keeps its order). */
export const groupRuns = (words: string[]): Array<{ dir: Dir; idx: number[] }> => {
  const out: Array<{ dir: Dir; idx: number[] }> = [];
  words.forEach((w, i) => {
    const d = wordDir(w);
    const last = out[out.length - 1];
    if (last && (d === 'neutral' || d === last.dir)) last.idx.push(i);
    else out.push({ dir: d === 'neutral' ? 'rtl' : d, idx: [i] });
  });
  return out;
};

const EAST = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
export const toDigits = (s: string, style: 'western' | 'eastern') => (style === 'eastern' ? s.replace(/[0-9]/g, (d) => EAST[+d]!) : s);
export const fmtNum = (n: number, dec = 0) => {
  const [i, d] = n.toFixed(dec).split('.');
  const g = (i ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return d ? `${g}.${d}` : g;
};
export const normAr = (w: string) =>
  w.replace(/[.,!?؟،؛:;"'«»()\-…]/g, '').replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase();

const STOP = new Set(['راني', 'راك', 'راه', 'واش', 'باش', 'بلي', 'هاذ', 'هادي', 'هذا', 'تاع', 'بزاف', 'شوية', 'كيما', 'وين', 'كي', 'برك', 'غير', 'يا', 'ما', 'لي', 'اللي', 'في', 'من', 'على', 'مع', 'و', 'ولا', 'او', 'ثم', 'بصح', 'حتى', 'هو', 'هي', 'انا', 'ني', 'شي', 'ل', 'ب', 'الى', 'عن', 'كل', 'ان', 'لا', 'قد', 'كان', 'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'ou', 'en', 'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is']);
export const isStop = (w: string) => {
  const n = normAr(w);
  return n.length <= 1 || STOP.has(n);
};
export const salience = (w: string) => {
  const c = w.replace(/[^\p{L}\p{N}%]/gu, '');
  if (!c) return 0;
  if (/\d/.test(c)) return 3;
  if (isStop(c)) return 0;
  const n = normAr(c).length;
  return n >= 6 ? 2 : n >= 4 ? 1.5 : 1;
};

export type Measure = (s: string, size: number) => number;
/** Greedy wrap with real measurements; shrink until it fits width × maxLines (never splits a word). */
export const fitLines = (words: string[], maxW: number, maxSize: number, minSize: number, maxLines: number, measure: Measure) => {
  const REF = 100;
  const ww = words.map((w) => measure(w, REF));
  const sp = measure(' ', REF) || 25;
  const wrap = (size: number) => {
    const k = size / REF;
    const lines: number[][] = [];
    let cur: number[] = [];
    let cw = 0;
    ww.forEach((w, i) => {
      const add = (cur.length ? sp : 0) * k + w * k;
      if (cur.length && cw + add > maxW) {
        lines.push(cur);
        cur = [i];
        cw = w * k;
      } else {
        cur.push(i);
        cw += add;
      }
    });
    if (cur.length) lines.push(cur);
    return { lines, ok: lines.length <= maxLines && Math.max(...ww) * k <= maxW };
  };
  let size = maxSize;
  for (; size > minSize; size = Math.floor(size * 0.94)) {
    const r = wrap(size);
    if (r.ok) return { size, lines: r.lines, overflow: false };
  }
  const r = wrap(minSize);
  return { size: minSize, lines: r.lines, overflow: !r.ok };
};
