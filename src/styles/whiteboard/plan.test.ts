import { describe, expect, it } from 'vitest';
import { estimateTiming } from '@/engine/estimate';
import { WHITEBOARD_DEMOS } from '@/demos/whiteboard';
import { whiteboardLocalPlan } from './plan';
import { WhiteboardPlanSchema } from './schema';

describe('whiteboard', () => {
  it('demo plans are valid', () =>
    WHITEBOARD_DEMOS.forEach((d) => {
      const r = WhiteboardPlanSchema.safeParse(d.build().plan);
      expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
    }));
  it('plans title, objects, a process arrow and ends on the reveal', () => {
    const p = whiteboardLocalPlan({ timing: estimateTiming('دورة الماء في الطبيعة\nالشمس تسخن البحر\nالماء يطلع ويولي سحاب\nوهكذا الماء يرجع\nتابعنا'), goal: 'explainer', aspect: '9:16', topic: '', product: null, brandName: '', seed: 1 });
    expect(p.title.text).toBe('دورة الماء في الطبيعة');
    expect(p.items.some((x) => x.kind === 'arrow')).toBe(true);
    expect(p.items[p.items.length - 1]!.kind).toBe('reveal');
  });
});
