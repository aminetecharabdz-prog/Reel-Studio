/** plotter — two hand-authored demos: a tech product ad (Nova watch, schematic + photo) and an explainer (how a phone understands your voice). */
import { estimateTiming } from '@/engine/estimate';
import { TimingIndex } from '@/engine/timing';
import type { PlotterPlan } from '@/styles/plotter/schema';
import { NOVA } from './product';
import type { Demo } from './types';

const AD = `ساعة تفهم يومك
هاذي هي نوفا الذكية
خطواتك، قلبك ونومك
بطارية أطول بعشر مرات
بدل 9500 دينار الآن 6900
هنا الفرق
اطلبها اليوم من نوفا`;

const adBuild = () => {
  const timing = estimateTiming(AD, { wps: 2.3, gap: 0.7, lead: 0.4, tail: 0.6 });
  const T = new TimingIndex(timing);
  const w = (l: string, q: string, n = 0) => T.word(l, q, n).id;
  const f = (l: string) => T.line(l).words[0]!.id;
  const k = (l: string, q: string, key = false) => ({ t: q, at: w(l, q), key });
  const plan: PlotterPlan = {
    style: 'plotter',
    scenes: [
      { kind: 'penTitle', from: f('تفهم'), words: [k('تفهم', 'ساعة'), k('تفهم', 'تفهم'), k('تفهم', 'يومك')] },
      { kind: 'schematic', from: f('هاذي هي'), prop: 'clock', label: 'نوفا', at: w('هاذي هي', 'نوفا'), photo: NOVA.photos[0]!, dims: '', words: [k('هاذي هي', 'هاذي'), k('هاذي هي', 'هي'), k('هاذي هي', 'نوفا', true), k('هاذي هي', 'الذكية')] },
      { kind: 'nodeFlow', from: f('خطواتك'), title: '', nodes: [{ t: 'خطواتك', at: w('خطواتك', 'خطواتك'), key: false }, { t: 'قلبك', at: w('خطواتك', 'قلبك'), key: false }, { t: 'نومك', at: w('خطواتك', 'ونومك'), key: false }] },
      { kind: 'graphCard', from: f('بطارية'), words: [k('بطارية', 'بطارية'), k('بطارية', 'أطول'), k('بطارية', 'بعشر', true), k('بطارية', 'مرات')], formula: 'battery(t) × 10' },
      { kind: 'paperForm', from: f('9500'), title: 'استمارة السعر', oldRow: { t: '9500 دج', at: w('9500', '9500'), key: false }, newRow: { t: 'الآن 6900 دج', at: w('9500', 'الآن'), key: true }, stamp: 'عرض' },
      { kind: 'slam', from: f('هنا الفرق'), word: { t: 'هنا الفرق', at: w('هنا الفرق', 'الفرق'), key: true }, counter: '0.97' },
      { kind: 'arcOutro', from: f('اطلبها'), a: k('اطلبها', 'اطلبها'), b: k('اطلبها', 'اليوم'), end: { t: 'نوفا', at: w('اطلبها', 'نوفا'), key: true } },
    ],
  };
  return { timing, plan };
};

const CONTENT = `كيفاش يفهم الهاتف صوتك؟
تقول جملة قصيرة
الصوت يتحول لموجات، كلمات، ومعنى
«شغّل الموسيقى»
وكل مرة يولي أسرع وأدق
هنا السر
من الصوت للمعنى في ثانية`;

const contentBuild = () => {
  const timing = estimateTiming(CONTENT, { wps: 2.3, gap: 0.7, lead: 0.4, tail: 0.6 });
  const T = new TimingIndex(timing);
  const w = (l: string, q: string, n = 0) => T.word(l, q, n).id;
  const f = (l: string) => T.line(l).words[0]!.id;
  const k = (l: string, q: string, key = false) => ({ t: q, at: w(l, q), key });
  const plan: PlotterPlan = {
    style: 'plotter',
    scenes: [
      { kind: 'penTitle', from: f('كيفاش'), words: [k('كيفاش', 'كيفاش'), k('كيفاش', 'يفهم'), k('كيفاش', 'الهاتف'), k('كيفاش', 'صوتك؟')] },
      { kind: 'heroStack', from: f('تقول'), kicker: [k('تقول', 'تقول')], hero: [k('تقول', 'جملة'), k('تقول', 'قصيرة', true)], prop: 'phone' },
      { kind: 'nodeFlow', from: f('الصوت يتحول'), title: 'الصوت يتحول', nodes: [{ t: 'موجات', at: w('الصوت يتحول', 'لموجات'), key: false }, { t: 'كلمات', at: w('الصوت يتحول', 'كلمات'), key: false }, { t: 'معنى', at: w('الصوت يتحول', 'ومعنى'), key: true }] },
      {
        kind: 'promptInput',
        from: f('شغّل'),
        words: [k('شغّل', 'شغّل'), k('شغّل', 'الموسيقى', true)],
        table: [
          { t: 'الموسيقى', v: 0.91 },
          { t: 'الموسيقار', v: 0.05 },
          { t: 'موسيقي', v: 0.03 },
        ],
      },
      { kind: 'graphCard', from: f('أسرع'), words: [k('أسرع', 'وكل'), k('أسرع', 'مرة'), k('أسرع', 'يولي'), k('أسرع', 'أسرع', true), k('أسرع', 'وأدق')], formula: 'accuracy(n)' },
      { kind: 'slam', from: f('السر'), word: { t: 'هنا السر', at: w('السر', 'السر'), key: true }, counter: '0.91' },
      { kind: 'arcOutro', from: f('من الصوت'), a: k('من الصوت', 'الصوت'), b: k('من الصوت', 'للمعنى'), end: { t: 'ثانية', at: w('من الصوت', 'ثانية'), key: true } },
    ],
  };
  return { timing, plan };
};

export const PLOTTER_DEMOS: Demo[] = [
  { id: 'plotter-ad', styleId: 'plotter', kind: 'ad', titleAr: 'نوفا: رسم تقني', script: AD, product: NOVA, build: adBuild },
  { id: 'plotter-voice', styleId: 'plotter', kind: 'content', titleAr: 'كيفاش يفهم الهاتف صوتك', script: CONTENT, product: null, build: contentBuild },
];
