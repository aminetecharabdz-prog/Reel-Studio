import { describe, expect, it } from 'vitest';
import { estimateTiming } from '@/engine/estimate';
import { DOODLE_DEMOS } from '@/demos/doodle';
import { doodleLocalPlan } from './plan';
import { DoodlePlanSchema } from './schema';

describe('doodle', () => {
  it('demo plans are valid', () => {
    DOODLE_DEMOS.forEach((d) => {
      const r = DoodlePlanSchema.safeParse(d.build().plan);
      expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
    });
  });
  it('plans a story with one beat per sentence, a walk and a closing', () => {
    const s = 'كان واحد الراجل في الصحرا\nمشى بزاف حتى وصل للواد\nقال: «وين راهو الما؟»\nشاف سحابة ونزل المطر\nالعبرة: الصبر مفتاح الفرج\nتابعنا';
    const p = doodleLocalPlan({ timing: estimateTiming(s), goal: 'story', aspect: '9:16', topic: '', product: null, brandName: '', seed: 1 });
    expect(p.beats.length).toBe(6);
    expect(p.beats.map((b) => b.kind)).toEqual(['establish', 'walkTo', 'speak', 'weather', 'quote', 'closing']);
  });
});
