import { describe, expect, it } from 'vitest';
import { inkOf, samplePath } from './ink';

describe('ink', () => {
  it('samples relative commands and arcs', () => {
    const [c] = samplePath('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18', 1);
    const r = c!.pts.map(([x, y]) => Math.hypot(x - 12, y - 12));
    expect(Math.min(...r)).toBeGreaterThan(8.7);
    expect(Math.max(...r)).toBeLessThan(9.3);
    const [b] = samplePath('M2 6h11v10H2z', 1);
    expect(b!.closed).toBe(true);
    expect(b!.pts.some(([x, y]) => x === 13 && y === 16)).toBe(true);
  });
  it('memoises ink ribbons', () => {
    expect(inkOf('M0 0 L100 0', 4, 1)).toBe(inkOf('M0 0 L100 0', 4, 1));
  });
});
