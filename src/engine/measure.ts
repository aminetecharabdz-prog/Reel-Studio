/**
 * Text measurement for layout decisions inside compositions (fit a word to a width, wrap a prompt).
 * Canvas-based, cached; fonts are loaded by the style registry before the first frame, so results are stable.
 * Outside a browser (unit tests) it falls back to a per-character estimate.
 */
const cache = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null | undefined;

const getCtx = () => {
  if (ctx !== undefined) return ctx;
  ctx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  return ctx;
};

/** width in px of `text` set in `family` at `weight` and `size` px */
export const measure = (text: string, family: string, weight: number, size: number): number => {
  const key = `${family}|${weight}|${text}`;
  let w100 = cache.get(key);
  if (w100 === undefined) {
    const c = getCtx();
    if (c) {
      c.font = `${weight} 100px "${family}"`;
      w100 = c.measureText(text).width;
    } else {
      w100 = [...text].reduce((a, ch) => a + (ch === ' ' ? 28 : /[؀-ۿ]/.test(ch) ? 46 : 56), 0);
    }
    cache.set(key, w100);
  }
  return (w100 * size) / 100;
};

/** font size at which `text` is exactly `width` wide */
export const fitSize = (text: string, width: number, family: string, weight: number) => {
  const w = measure(text, family, weight, 100);
  return w > 0 ? (100 * width) / w : 100;
};

/** greedy word wrap (never splits a word) */
export const wrapWords = (text: string, maxW: number, family: string, weight: number, size: number): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(next, family, weight, size) > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
};

/** clears the cache (after a late font load) */
export const resetMeasure = () => cache.clear();

/** 'rtl' when the text starts with an Arabic letter, else 'ltr' (first strong character wins) */
export const detectDir = (s: string, fallback: 'rtl' | 'ltr' = 'rtl'): 'rtl' | 'ltr' => {
  for (const ch of s) {
    if (/[֐-ࣿ]/.test(ch)) return 'rtl';
    if (/[A-Za-zÀ-ɏ]/.test(ch)) return 'ltr';
  }
  return fallback;
};
