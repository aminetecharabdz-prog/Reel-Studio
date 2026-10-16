import { describe, expect, it } from 'vitest';
import { STYLE_IDS, STYLES } from './catalog';
import { MARK_PATH, logoSvg } from '@/brand/logo';

describe('catalog', () => {
  it('has the 10 kit styles with complete metadata', () => {
    expect(STYLE_IDS).toHaveLength(10);
    for (const id of STYLE_IDS) {
      const s = STYLES[id];
      expect(s.id).toBe(id);
      expect(s.nameAr.length).toBeGreaterThan(2);
      expect(s.swatch.every((c) => /^#[0-9A-F]{6}$/i.test(c))).toBe(true);
      expect(s.goals.length).toBeGreaterThan(0);
    }
  });
});

describe('brand', () => {
  it('logo is one continuous stroke (single move-to)', () => {
    expect(MARK_PATH.match(/M/g)).toHaveLength(1);
    expect(logoSvg({ tile: true })).toContain('<svg');
  });
});
