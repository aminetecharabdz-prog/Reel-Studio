import { describe, expect, it } from 'vitest';
import { detectDir, splitRuns } from './bidi';
import { formatNumber, toDigits } from './digits';

describe('bidi runs (SPEC §7)', () => {
  it('keeps price and currency together in a Darija sentence', () => {
    const runs = splitRuns('الجاكيت ب 3500 DA مع livraison لـ 58 ولاية');
    expect(runs.map((r) => [r.dir, r.text.trim()])).toEqual([
      ['rtl', 'الجاكيت ب'],
      ['ltr', '3500 DA'],
      ['rtl', 'مع'],
      ['ltr', 'livraison'],
      ['rtl', 'لـ'],
      ['ltr', '58'],
      ['rtl', 'ولاية'],
    ]);
  });
  it('keeps percent and question mark with their runs', () => {
    const runs = splitRuns('واش تعرف بلي 70% من الناس؟');
    expect(runs.map((r) => r.text.trim())).toEqual(['واش تعرف بلي', '70%', 'من الناس؟']);
  });
  it('keeps grouped numbers with units', () => {
    const runs = splitRuns("أولا: بدّل l'huile كل 10 000 km");
    expect(runs.map((r) => r.text.trim())).toEqual(['أولا: بدّل', "l'huile", 'كل', '10 000 km']);
  });
  it('detects direction from first strong char', () => {
    expect(detectDir('Make it مع Claude')).toBe('ltr');
    expect(detectDir('70% من الناس')).toBe('rtl');
  });
  it('converts digits', () => {
    expect(toDigits('58 ولاية', 'eastern')).toBe('٥٨ ولاية');
    expect(formatNumber(10000)).toBe('10 000');
  });
});

import { groupWordRuns } from './bidi';
describe('word runs (regression: French phrase reversed in captions)', () => {
  it('keeps consecutive Latin words in one LTR run', () => {
    const r = groupWordRuns(['استعمل', 'le', 'fil', 'dentaire،', 'لخاطر']);
    expect(r).toEqual([{ dir: 'rtl', indices: [0] }, { dir: 'ltr', indices: [1, 2, 3] }, { dir: 'rtl', indices: [4] }]);
  });
  it('keeps number + currency in one run', () => {
    expect(groupWordRuns(['ب', '3500', 'DA', 'مع'])[1]).toEqual({ dir: 'ltr', indices: [1, 2] });
  });
});

import { captionLayoutText, layoutText } from './layout';
describe('caption layout keeps one token per spoken word', () => {
  it('a word with an inner space ("10 000") is one token (regression: engine scene 12 crashed)', () => {
    const words = ['بدّل', "l'huile", 'كل', '10 000', 'km،'];
    const lay = layoutText(captionLayoutText(words), { maxWidth: 1000, maxSize: 60, minSize: 40, maxLines: 2, measure: (x, s) => x.length * s * 0.5 });
    expect(lay.lines.flat().length).toBe(words.length);
  });
});
