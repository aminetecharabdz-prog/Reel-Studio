import { describe, expect, it } from 'vitest';
import { estimateTiming } from '@/engine/estimate';
import { PLOTTER_DEMOS } from '@/demos/plotter';
import { plotterLocalPlan } from './plan';
import { PlotterPlanSchema } from './schema';

describe('plotter', () => {
  it('demo plans are valid', () =>
    PLOTTER_DEMOS.forEach((d) => {
      const r = PlotterPlanSchema.safeParse(d.build().plan);
      expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
    }));
  it('opens with the pen title and ends with the arc outro', () => {
    const p = plotterLocalPlan({ timing: estimateTiming('كيفاش تخدم الآلة؟\nتاخذ البيانات، تحللها وتقرر\nهنا السر\nتابعنا لأكثر'), goal: 'explainer', aspect: '9:16', topic: '', product: null, brandName: '', seed: 1 });
    expect(p.scenes[0]!.kind).toBe('penTitle');
    expect(p.scenes.map((s) => s.kind)).toContain('nodeFlow');
    expect(p.scenes[p.scenes.length - 1]!.kind).toBe('arcOutro');
  });
});
