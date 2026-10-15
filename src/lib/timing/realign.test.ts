import { describe, expect, it } from 'vitest';
import { realign } from './realign';

const W = (t: string, s: number, e: number) => ({ id: t, text: t, startMs: s, endMs: e, confidence: 1 });
const old = [W('واش', 0, 300), W('تعرف', 300, 700), W('بلي', 700, 1000), W('السنان', 1000, 1600)];

describe('transcript re-alignment keeps timestamps', () => {
  it('keeps exact times for unchanged words', () => {
    const r = realign(old, 'واش تعرف بلي السنان');
    expect(r.map((w) => [w.text, w.startMs, w.endMs])).toEqual([['واش', 0, 300], ['تعرف', 300, 700], ['بلي', 700, 1000], ['السنان', 1000, 1600]]);
  });
  it('a corrected word takes the old word window', () => {
    const r = realign(old, 'واش تعرف بلي السنين');
    expect(r[3]).toMatchObject({ text: 'السنين', startMs: 1000, endMs: 1600 });
  });
  it('splitting one word into two shares its time by length', () => {
    const r = realign(old, 'واش تعرف بلي les dents');
    expect(r[3]!.startMs).toBe(1000);
    expect(r[4]!.endMs).toBe(1600);
    expect(r[3]!.endMs).toBe(r[4]!.startMs);
  });
  it('merging two words keeps the union window', () => {
    const r = realign(old, 'واشتعرف بلي السنان');
    expect(r[0]).toMatchObject({ startMs: 0, endMs: 700 });
    expect(r).toHaveLength(3);
  });
  it('keeps word ids so scene anchors survive edits', () => {
    expect(realign(old, 'واش تعرف').map((w) => w.id)).toEqual(['واش', 'تعرف']);
    const r = realign(old, 'واش تعرف بلي les dents');
    expect(new Set(r.map((w) => w.id)).size).toBe(r.length);
    expect(r[3]!.id).toBe('السنان');
  });
});
