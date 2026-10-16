import { describe, expect, it } from 'vitest';
import { estimateTiming } from '@/engine/estimate';
import { TimingIndex } from '@/engine/timing';
import { listSegments } from '@/engine/lexicon';
import { PRODUCT_DEMOS } from '@/demos/product';
import { productLocalPlan } from './plan';
import { ProductPlanSchema } from './schema';

const SCRIPTS = [
  'علاش لازم تشرب الماء كل صباح؟\nجسمك يبات ثمن ساعات بلا ماء\nكاس واحد يفيق المخ، ينقي الكلى ويحسن البشرة\nلكن الأغلبية ينساو\nمن 20 بالمية عطش إلى 0\nجرب سبع أيام وشوف الفرق\nتابعنا باش تعرف أكثر',
  'Votre boutique en ligne mérite mieux\nUne application simple, rapide et sûre\nCommandes, stock, livraison et paiement\nEssayez gratuitement aujourd’hui',
  'كريم مرطب طبيعي 100%\nيرطب، ينعم ويحمي بشرتك\nالسعر 2500 دج بدل 3500\nاطلبيه الآن',
];

describe('product local planner', () => {
  it('finds list segments with short labels', () => {
    expect(listSegments('كاس واحد يفيق المخ، ينقي الكلى ويحسن البشرة'.split(' ')).map((x) => x.label)).toEqual(['يفيق المخ', 'ينقي الكلى', 'يحسن البشرة']);
  });
  SCRIPTS.forEach((script, k) =>
    it(`plans script ${k} into a valid, ordered, word-anchored plan`, () => {
      const timing = estimateTiming(script);
      const T = new TimingIndex(timing);
      const product = k === 2 ? { name: 'كريم ندى', price: '2500 دج', oldPrice: '3500 دج', offer: '', delivery58: true, cod: true, phone: '', whatsapp: '', photos: [] } : null;
      const plan = productLocalPlan({ timing, goal: product ? 'ad' : 'explainer', aspect: '9:16', topic: 'test', product, brandName: '', seed: 3 });
      expect(ProductPlanSchema.safeParse(plan).success).toBe(true);
      const ids = new Set(T.words.map((w) => w.id));
      const anchors = JSON.stringify(plan).match(/"(from|at|typeFrom|typeTo|send)":"(w\d+)"/g) ?? [];
      anchors.forEach((a) => expect(ids.has(a.split('"')[3]!)).toBe(true));
      const starts = plan.scenes.map((s) => T.indexOf(s.from));
      expect([...starts].sort((a, b) => a - b)).toEqual(starts);
      expect(plan.scenes[plan.scenes.length - 1]!.kind).toBe('end');
      expect(plan.scenes.some((s) => s.kind === 'showcase')).toBe(true);
      // never two 3D scenes back to back
      plan.scenes.forEach((s, i) => {
        const prev = plan.scenes[i - 1];
        if (prev && ['showcase', 'cards'].includes(s.kind)) expect(['showcase', 'cards']).not.toContain(prev.kind);
      });
    }),
  );
  it('demo plans are valid', () => {
    PRODUCT_DEMOS.forEach((d) => expect(ProductPlanSchema.safeParse(d.build().plan).success).toBe(true));
  });
});
