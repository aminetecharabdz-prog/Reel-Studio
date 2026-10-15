import { describe, expect, it } from 'vitest';
import { timeScript } from '../providers/scriptTiming';
import { designDNA } from '../design/artDirector';
import { planLocally } from '../director/localDirector';

// Regression (owner report): a wall-decor product ad showed a tooth "lesson" in its intro.
describe('topic illustrations stay in their topic', () => {
  it('wall-decor ad never gets tooth / engine / car-dashboard illustrations', () => {
    const s = 'ديكور لوحات الحائط تزين دارك. اللوحة ما تتكسرش وما تتبدلش سنين حتى مع البارد. تتركب في ثانية وتبقى ثابتة. السعر 3500 دج. التوصيل لـ 58 ولاية والدفع عند الاستلام. اطلب دروك.';
    const t = timeScript(s);
    for (let seed = 1; seed < 6; seed++) {
      const plan = planLocally({ transcript: t, dna: designDNA({ topic: 'product', seed }), mode: 'B', pacing: 'auto', seed, business: 'ecommerce' });
      const illus = plan.scenes.map((sc) => (sc.content as { hero?: { illus?: string } }).hero?.illus).filter(Boolean);
      expect(illus.filter((i) => /tooth|teeth|engine|gauge|car-dash/.test(String(i)))).toEqual([]);
    }
  });
});
