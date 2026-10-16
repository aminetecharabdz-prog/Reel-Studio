import { describe, expect, it } from 'vitest';
import { estimateTiming } from '@/engine/estimate';
import { TimingIndex } from '@/engine/timing';
import { INFOGRAPHIC_DEMOS } from '@/demos/infographic';
import { figures, infographicLocalPlan } from './plan';
import { InfographicPlanSchema } from './schema';

const plan = (s: string) => infographicLocalPlan({ timing: estimateTiming(s), goal: 'numbers', aspect: '9:16', topic: '', product: null, brandName: '', seed: 1 });

describe('infographic planner', () => {
  it('reads figures with their units', () => {
    const T = new TimingIndex(estimateTiming('من 97,5 بالمية إلى 2.5% و 2024'));
    const f = figures(T.lines[0]!.words);
    expect(f.map((x) => [x.value, x.unit, x.year])).toEqual([[97.5, '%', false], [2.5, '%', false], [2024, '', true]]);
  });
  it('splits shares into a bar with the right names, then a ring', () => {
    const p = plan('الفيديو 45 بالمية، الرسائل 30 و 25 للباقي\nوهذا التقسيم 45 بالمية، 30 و 25');
    const bar = p.beats[0]!;
    expect(bar.kind).toBe('bar');
    if (bar.kind === 'bar') expect(bar.segments.map((s) => s.label)).toEqual(['الفيديو', 'الرسائل', 'للباقي']);
    expect(p.beats[1]!.kind).toBe('ring');
  });
  it('makes grid / versus / timeline / source beats and never invents numbers', () => {
    const p = plan('73 بالمية من المخ ماء\nالبطارية 10 أيام مقابل 2\nمن 2010 إلى 2024\nالمصدر: USGS');
    expect(p.beats.map((b) => b.kind)).toEqual(['grid', 'versus', 'timeline', 'source']);
    const nums = JSON.stringify(p).match(/"value":(\d+(\.\d+)?)/g)!.map((x) => Number(x.split(':')[1]));
    nums.forEach((n) => expect([73, 10, 2]).toContain(n));
  });
  it('demo plans are valid', () => INFOGRAPHIC_DEMOS.forEach((d) => expect(InfographicPlanSchema.safeParse(d.build().plan).success).toBe(true)));
});
