/** whiteboard — two hand-authored demos: a product explainer (the «Safi» water filter) and a health explainer (why teeth decay). */
import { estimateTiming } from '@/engine/estimate';
import { TimingIndex } from '@/engine/timing';
import type { WhiteboardPlan } from '@/styles/whiteboard/schema';
import type { Demo } from './types';

const AD = `كيفاش يخدم فلتر صافي؟
الماء يدخل من الحنفية
يتصفى في ثلاث طبقات
ويخرج صافي ونقي
الفلتر يدوم ستة أشهر
بصح القارورات تكلفك أكثر وصافي يوفرلك
اطلب صافي اليوم`;

const adBuild = () => {
  const timing = estimateTiming(AD, { wps: 2.2, gap: 0.9, lead: 0.5, tail: 0.5 });
  const T = new TimingIndex(timing);
  const w = (l: string, q: string, n = 0) => T.word(l, q, n).id;
  const f = (l: string) => T.line(l).words[0]!.id;
  const plan: WhiteboardPlan = {
    style: 'whiteboard',
    title: { text: 'فلتر صافي', from: w('كيفاش', 'كيفاش'), to: w('كيفاش', 'صافي') },
    items: [
      { kind: 'object', from: f('الحنفية'), at: w('الحنفية', 'الماء'), prop: 'drop', label: 'الماء', color: 'blue', face: true },
      { kind: 'count', from: f('طبقات'), at: w('طبقات', 'ثلاث'), prop: 'box', n: 3, label: 'ثلاث طبقات', color: 'ink' },
      { kind: 'object', from: f('ويخرج'), at: w('ويخرج', 'صافي'), prop: 'cup', label: 'ماء صافي', color: 'blue', face: false },
      { kind: 'arrow', from: f('ويخرج'), at: w('ويخرج', 'ويخرج'), a: 0, b: 2, label: 'يتصفى', color: 'green' },
      { kind: 'object', from: f('الفلتر'), at: w('الفلتر', 'يدوم'), prop: 'clock', label: 'يدوم', color: 'orange', face: false },
      { kind: 'number', from: f('الفلتر'), at: w('الفلتر', 'ستة'), value: '6 أشهر', label: '', color: 'orange' },
      { kind: 'contrast', from: f('القارورات'), at: w('القارورات', 'القارورات'), a: { prop: 'money', label: 'القارورات' }, b: { prop: 'drop', label: 'صافي' } },
      { kind: 'note', from: f('اطلب'), at: w('اطلب', 'اطلب'), text: 'اطلب صافي اليوم' },
      { kind: 'reveal', from: f('اطلب') },
    ],
  };
  return { timing, plan };
};

const CONTENT = `علاش السنان تتسوس؟
السكر يبقى على السنة
البكتيريا تاكلو وتخرج حمض
والحمض يحفر في السنة
الحل: فرشي مرتين في النهار
وزور الطبيب كل ستة أشهر
وهكذا سنانك تبقى صحيحة
تابعنا لنصائح أخرى`;

const contentBuild = () => {
  const timing = estimateTiming(CONTENT, { wps: 2.2, gap: 0.9, lead: 0.5, tail: 0.5 });
  const T = new TimingIndex(timing);
  const w = (l: string, q: string, n = 0) => T.word(l, q, n).id;
  const f = (l: string) => T.line(l).words[0]!.id;
  const plan: WhiteboardPlan = {
    style: 'whiteboard',
    title: { text: 'علاش السنان تتسوس؟', from: w('علاش', 'علاش'), to: w('علاش', 'تتسوس') },
    items: [
      { kind: 'object', from: f('السكر'), at: w('السكر', 'السكر'), prop: 'food', label: 'السكر', color: 'orange', face: false },
      { kind: 'object', from: f('البكتيريا'), at: w('البكتيريا', 'حمض'), prop: 'bolt', label: 'حمض', color: 'red', face: false },
      { kind: 'arrow', from: f('البكتيريا'), at: w('البكتيريا', 'تاكلو'), a: 0, b: 1, label: 'البكتيريا', color: 'red' },
      { kind: 'object', from: f('والحمض'), at: w('والحمض', 'السنة'), prop: 'tooth', label: 'السنة', color: 'ink', face: true },
      { kind: 'arrow', from: f('والحمض'), at: w('والحمض', 'يحفر'), a: 1, b: 3, label: 'يحفر', color: 'red' },
      { kind: 'object', from: f('الحل'), at: w('الحل', 'فرشي'), prop: 'sparkles', label: 'فرشي', color: 'green', face: false },
      { kind: 'number', from: f('الحل'), at: w('الحل', 'مرتين'), value: '×2', label: 'في النهار', color: 'green' },
      { kind: 'object', from: f('الطبيب'), at: w('الطبيب', 'الطبيب'), prop: 'calendar', label: 'الطبيب', color: 'blue', face: false },
      { kind: 'emphasis', from: f('الطبيب'), at: w('الطبيب', 'أشهر'), target: 7 },
      { kind: 'journey', from: f('وهكذا'), at: w('وهكذا', 'سنانك'), mascot: 'tooth' },
      { kind: 'note', from: f('تابعنا'), at: w('تابعنا', 'تابعنا'), text: 'تابعنا لنصائح أخرى' },
      { kind: 'reveal', from: f('تابعنا') },
    ],
  };
  return { timing, plan };
};

export const WHITEBOARD_DEMOS: Demo[] = [
  { id: 'whiteboard-ad', styleId: 'whiteboard', kind: 'ad', titleAr: 'فلتر صافي', script: AD, product: null, build: adBuild },
  { id: 'whiteboard-teeth', styleId: 'whiteboard', kind: 'content', titleAr: 'علاش السنان تتسوس؟', script: CONTENT, product: null, build: contentBuild },
];
