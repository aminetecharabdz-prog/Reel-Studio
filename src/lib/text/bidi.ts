/** Bidi helpers for mixed Arabic / Latin / number text (SPEC §7, arabic-rtl-video skill). */

const RTL_RE = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const LTR_RE = /[A-Za-zÀ-ɏ]/;

export type Dir = 'rtl' | 'ltr';

/** Direction of a string from its first strong character (default rtl — Arabic-first product). */
export const detectDir = (text: string, fallback: Dir = 'rtl'): Dir => {
  for (const ch of text) {
    if (RTL_RE.test(ch)) return 'rtl';
    if (LTR_RE.test(ch)) return 'ltr';
  }
  return fallback;
};

export const isRtlChar = (ch: string) => RTL_RE.test(ch);
export const hasArabic = (text: string) => RTL_RE.test(text);
export const hasLatin = (text: string) => LTR_RE.test(text);

export type Run = { text: string; dir: Dir | 'neutral' };

/**
 * Split text into runs that each get their own isolate: Arabic runs, Latin runs and
 * number+unit runs ("3500 DA", "10 000 km", "70%"). Spaces stay attached to the
 * preceding run so word spacing is preserved. Numbers glued to currency/units are kept
 * together so they never get separated by the bidi algorithm.
 */
export const splitRuns = (text: string): Run[] => {
  const parts = text.split(/(\s+)/).filter((p) => p.length > 0);
  const classify = (tok: string): Run['dir'] => {
    if (RTL_RE.test(tok)) return 'rtl';
    if (LTR_RE.test(tok) || /\d/.test(tok)) return 'ltr'; // Latin words, digits, %, prices
    return 'neutral'; // whitespace / punctuation only
  };
  const runs: Run[] = [];
  let pendingNeutral = '';
  for (const p of parts) {
    const dir = classify(p);
    const last = runs[runs.length - 1];
    if (dir === 'neutral') {
      if (last) last.text += p;
      else pendingNeutral += p;
      continue;
    }
    if (last && last.dir === dir) last.text += p;
    else runs.push({ text: pendingNeutral + p, dir });
    pendingNeutral = '';
  }
  if (pendingNeutral) runs.push({ text: pendingNeutral, dir: 'neutral' });
  return runs;
};

/** Trailing whitespace of a run belongs outside the isolate so spacing is not swallowed. */
export const trimRun = (t: string) => {
  const m = /^(.*?)(\s*)$/s.exec(t);
  return { core: m?.[1] ?? t, space: m?.[2] ?? '' };
};
