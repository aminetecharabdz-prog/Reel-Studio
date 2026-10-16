/**
 * infographic — two hand-authored demos: a numbers-driven product ad (Nova watch, the brand's own figures) and a
 * content piece with sourced figures (water in the body — USGS; daily water balance — Guyton & Hall physiology).
 */
import { estimateTiming } from '@/engine/estimate';
import { TimingIndex } from '@/engine/timing';
import type { InfographicPlan } from '@/styles/infographic/schema';
import { NOVA } from './product';
import type { Demo } from './types';

const AD = `واش تعرف شحال تمشي في النهار؟
نوفا تحسب كل خطوة بدقة 98 بالمية
البطارية تدوم 10 أيام مقابل 2 في الساعات العادية
نومك: 62 بالمية خفيف، 23 عميق و15 أحلام
وتشوف تقسيم نومك كل صباح
السعر 6900 دينار برك بدل 9500
اطلبها اليوم`;

const adBuild = () => {
  const timing = estimateTiming(AD, { wps: 2.2, gap: 0.7, lead: 0.4, tail: 0.6 });
  const T = new TimingIndex(timing);
  const w = (l: string, q: string, n = 0) => T.word(l, q, n).id;
  const first = (l: string) => T.line(l).words[0]!.id;
  const plan: InfographicPlan = {
    style: 'infographic',
    beats: [
      { kind: 'headline', from: first('شحال تمشي'), text: 'شحال تمشي في النهار؟', key: 'تمشي', eyebrow: 'نوفا · ساعة ذكية' },
      { kind: 'grid', from: first('بدقة'), num: { value: 98, decimals: 0, unit: '%', at: w('بدقة', '98') }, eyebrow: 'دقة حساب الخطوات', label: 'كل خطوة محسوبة', rest: '' },
      { kind: 'versus', from: first('البطارية'), title: 'مدة البطارية', eyebrow: 'بالأيام', a: { label: 'ساعة عادية', value: 2, at: w('البطارية', '2') }, b: { label: 'نوفا', value: 10, at: w('البطارية', '10') }, unit: ' أيام' },
      {
        kind: 'bar',
        from: first('نومك:'),
        title: 'نومك الليلة',
        eyebrow: 'تقسيم النوم',
        segments: [
          { label: 'خفيف', value: 62, at: w('نومك:', '62') },
          { label: 'عميق', value: 23, at: w('نومك:', '23') },
          { label: 'أحلام', value: 15, at: w('نومك:', 'و15') },
        ],
        unit: '%',
      },
      {
        kind: 'ring',
        from: first('وتشوف'),
        title: 'تقسيم نومك كل صباح',
        eyebrow: 'التقرير',
        segments: [
          { label: 'خفيف', value: 62, at: w('وتشوف', 'تقسيم') },
          { label: 'عميق', value: 23, at: w('وتشوف', 'نومك') },
          { label: 'أحلام', value: 15, at: w('وتشوف', 'صباح') },
        ],
        unit: '%',
      },
      { kind: 'symbol', from: first('السعر'), icon: 'coin', num: { value: 6900, decimals: 0, unit: ' دج', at: w('السعر', '6900') }, eyebrow: 'السعر', label: 'بدل 9500 دج', equation: '' },
      { kind: 'headline', from: first('اطلبها'), text: 'اطلبها اليوم', key: 'اليوم', eyebrow: 'توصيل لـ 58 ولاية · الدفع عند الاستلام' },
    ],
  };
  return { timing, plan };
};

const CONTENT = `جسمك فيه حوالي 60 بالمية ماء
والمخ وحده فيه 73 بالمية ماء
كل يوم نخسرو حوالي 2.2 لتر
البول 1.4 لتر، الجلد 0.45 والتنفس 0.35
لكن الأغلبية ما يشربوش كفاية
اشرب قبل ما تعطش
المصدر: USGS و Guyton & Hall`;

const contentBuild = () => {
  const timing = estimateTiming(CONTENT, { wps: 2.2, gap: 0.7, lead: 0.4, tail: 0.6 });
  const T = new TimingIndex(timing);
  const w = (l: string, q: string, n = 0) => T.word(l, q, n).id;
  const first = (l: string) => T.line(l).words[0]!.id;
  const plan: InfographicPlan = {
    style: 'infographic',
    beats: [
      { kind: 'stat', from: first('جسمك فيه'), num: { value: 60, decimals: 0, unit: '%', at: w('جسمك فيه', '60') }, visual: 'sphere', eyebrow: 'جسمك', label: 'من وزنك ماء' },
      { kind: 'grid', from: first('والمخ'), num: { value: 73, decimals: 0, unit: '%', at: w('والمخ', '73') }, eyebrow: 'المخ وحده', label: 'ماء', rest: 'الباقي' },
      { kind: 'symbol', from: first('نخسرو'), icon: 'drop', num: { value: 2.2, decimals: 1, unit: ' لتر', at: w('نخسرو', '2.2') }, eyebrow: 'نخسر كل يوم', label: 'تقريبًا', equation: '' },
      {
        kind: 'compare',
        from: first('البول'),
        title: 'وين يروح الماء؟',
        eyebrow: 'لتر في اليوم',
        items: [
          { label: 'البول', value: 1.4, at: w('البول', '1.4') },
          { label: 'الجلد', value: 0.45, at: w('البول', '0.45') },
          { label: 'التنفس', value: 0.35, at: w('البول', '0.35') },
        ],
        unit: '',
      },
      { kind: 'headline', from: first('الأغلبية'), text: 'الأغلبية ما يشربوش كفاية', key: 'كفاية', eyebrow: 'لكن' },
      { kind: 'headline', from: first('اشرب'), text: 'اشرب قبل ما تعطش', key: 'اشرب', eyebrow: '' },
      { kind: 'source', from: first('المصدر'), title: '', source: 'USGS · Guyton & Hall, Textbook of Medical Physiology' },
    ],
  };
  return { timing, plan };
};

export const INFOGRAPHIC_DEMOS: Demo[] = [
  { id: 'infographic-ad', styleId: 'infographic', kind: 'ad', titleAr: 'ساعة نوفا بالأرقام', script: AD, product: NOVA, build: adBuild },
  { id: 'infographic-water', styleId: 'infographic', kind: 'content', titleAr: 'الماء في جسمك', script: CONTENT, product: null, build: contentBuild },
];
