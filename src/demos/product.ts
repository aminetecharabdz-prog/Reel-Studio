/**
 * product — two hand-authored demo projects (MISSION_V4 §4): one e-commerce ad, one content/app explainer.
 * Timing comes from the script (no voice: SFX-driven like the reference); every anchor is looked up with the kit's
 * `line()` / `word()` API, never typed as seconds.
 */
import { estimateTiming } from '@/engine/estimate';
import { TimingIndex } from '@/engine/timing';
import type { ProductInfo } from '@/engine/types';
import type { ProductPlan } from '@/styles/product/schema';
import type { Demo } from './types';

export const NOVA: ProductInfo = {
  name: 'ساعة نوفا الذكية',
  price: '6900 دج',
  oldPrice: '9500 دج',
  offer: 'تخفيض 27%',
  delivery58: true,
  cod: true,
  phone: '0555 12 34 56',
  whatsapp: '0555 12 34 56',
  photos: ['./demo/nova-watch.svg'],
};

const AD_SCRIPT = `ساعتك القديمة تعبتك؟
حاب ساعة تحسب كلش وتبان شابة؟
هاذي هي ساعة نوفا الذكية
تحسب خطواتك، دقات قلبك ونومك
والبطارية؟ من يومين ولّات عشرة أيام
ضد الماء، خفيفة وأنيقة
بـ 6900 دينار برك بدل 9500
التوصيل لـ 58 ولاية والدفع عند الاستلام
اطلبها اليوم من نوفا`;

const adBuild = () => {
  const timing = estimateTiming(AD_SCRIPT, { wps: 2.4, gap: 0.55, lead: 0.4, tail: 0.6 });
  const T = new TimingIndex(timing);
  const w = (line: string, q: string, nth = 0) => T.word(line, q, nth).id;
  const L = (q: string) => T.line(q).words;
  const plan: ProductPlan = {
    style: 'product',
    brand: { name: 'نوفا', mark: 'ن' },
    accent: 'violet',
    scenes: [
      {
        kind: 'words',
        from: L('ساعتك القديمة')[0]!.id,
        theme: 'dark',
        giant: true,
        echo: false,
        rows: [[{ t: 'ساعتك', at: w('ساعتك القديمة', 'ساعتك') }, { t: 'القديمة', at: w('ساعتك القديمة', 'القديمة') }, { t: 'تعبتك؟', at: w('ساعتك القديمة', 'تعبتك'), em: 'grad' }]],
      },
      { kind: 'prompt', from: L('حاب ساعة')[0]!.id, text: 'حاب ساعة تحسب كلش وتبان شابة؟', typeFrom: w('حاب ساعة', 'حاب'), typeTo: w('حاب ساعة', 'شابة'), send: w('حاب ساعة', 'شابة') },
      { kind: 'logo', from: L('هاذي هي')[0]!.id, at: w('هاذي هي', 'نوفا'), tagline: 'الساعة اللي تفهمك', ghost: true },
      {
        kind: 'showcase',
        from: L('تحسب خطواتك')[0]!.id,
        title: 'نوفا · نشاطك اليوم',
        photo: NOVA.photos[0]!,
        steps: [
          { t: 'خطواتك', at: w('تحسب خطواتك', 'خطواتك') },
          { t: 'دقات القلب', at: w('تحسب خطواتك', 'قلبك') },
          { t: 'النوم', at: w('تحسب خطواتك', 'ونومك') },
        ],
        chips: [],
      },
      {
        kind: 'capsule',
        from: L('والبطارية')[0]!.id,
        title: [{ t: 'البطارية', at: w('والبطارية', 'والبطارية'), em: 'grad' }],
        items: [
          { t: 'يومين', at: w('والبطارية', 'يومين') },
          { t: '10 أيام', at: w('والبطارية', 'عشرة') },
        ],
      },
      {
        kind: 'punch',
        from: L('ضد الماء')[0]!.id,
        words: [
          { t: 'ضد الماء', at: w('ضد الماء', 'ضد') },
          { t: 'خفيفة', at: w('ضد الماء', 'خفيفة') },
          { t: 'وأنيقة', at: w('ضد الماء', 'وأنيقة'), em: 'grad' },
        ],
      },
      {
        kind: 'showcase',
        from: L('6900')[0]!.id,
        title: 'العرض',
        photo: NOVA.photos[0]!,
        steps: [],
        price: { t: '6900 دج', at: w('6900', '6900'), old: '9500 دج' },
        chips: [
          { t: 'توصيل لـ 58 ولاية', at: w('التوصيل', 'التوصيل'), icon: 'truck' },
          { t: 'الدفع عند الاستلام', at: w('التوصيل', 'والدفع'), icon: 'card' },
        ],
      },
      { kind: 'end', from: L('اطلبها')[0]!.id, at: w('اطلبها', 'نوفا'), line: 'اطلبها اليوم', cta: 'اطلب الآن', handle: NOVA.whatsapp },
    ],
  };
  return { timing, plan };
};

const CONTENT_SCRIPT = `فلوسك تروح وما تعرفش وين؟
اكتب برك: شحال صرفت هاد الشهر؟
مصروفي يجاوبك في ثانية
يرتب المصاريف، يحسب التوفير وينبهك قبل ما تخسر
الحساب كان ياخذ ساعات، دابا دقيقة
لكل دينار مكانه
ماكلة، كراء، نقل وخرجات
بسيط. سريع. مجاني.
حمّل مصروفي اليوم`;

const contentBuild = () => {
  const timing = estimateTiming(CONTENT_SCRIPT, { wps: 2.4, gap: 0.55, lead: 0.4, tail: 0.6 });
  const T = new TimingIndex(timing);
  const w = (line: string, q: string, nth = 0) => T.word(line, q, nth).id;
  const L = (q: string) => T.line(q).words;
  const plan: ProductPlan = {
    style: 'product',
    brand: { name: 'مصروفي', mark: 'م' },
    accent: 'violet',
    scenes: [
      {
        kind: 'words',
        from: L('فلوسك')[0]!.id,
        theme: 'dark',
        giant: true,
        echo: false,
        rows: [[{ t: 'فلوسك', at: w('فلوسك', 'فلوسك') }, { t: 'تروح', at: w('فلوسك', 'تروح') }, { t: 'وما', at: w('فلوسك', 'وما') }, { t: 'تعرفش', at: w('فلوسك', 'تعرفش') }, { t: 'وين؟', at: w('فلوسك', 'وين'), em: 'grad' }]],
      },
      { kind: 'prompt', from: L('اكتب برك')[0]!.id, text: 'شحال صرفت هاد الشهر؟', typeFrom: w('اكتب برك', 'شحال'), typeTo: w('اكتب برك', 'الشهر'), send: w('اكتب برك', 'الشهر') },
      { kind: 'logo', from: L('يجاوبك')[0]!.id, at: w('يجاوبك', 'مصروفي'), tagline: 'مصروفك واضح في ثانية', ghost: true },
      {
        kind: 'showcase',
        from: L('يرتب المصاريف')[0]!.id,
        title: 'مصروفي · هذا الشهر',
        steps: [
          { t: 'المصاريف', at: w('يرتب المصاريف', 'المصاريف') },
          { t: 'التوفير', at: w('يرتب المصاريف', 'التوفير') },
          { t: 'التنبيهات', at: w('يرتب المصاريف', 'وينبهك') },
        ],
        chips: [],
      },
      {
        kind: 'capsule',
        from: L('الحساب كان')[0]!.id,
        title: [{ t: 'وقت', at: w('الحساب كان', 'الحساب') }, { t: 'الحساب', at: w('الحساب كان', 'كان'), em: 'grad' }],
        items: [
          { t: 'ساعات', at: w('الحساب كان', 'ساعات') },
          { t: 'دقيقة', at: w('الحساب كان', 'دقيقة') },
        ],
      },
      {
        kind: 'words',
        from: L('لكل دينار')[0]!.id,
        theme: 'dark',
        giant: false,
        echo: true,
        rows: [[{ t: 'لكل', at: w('لكل دينار', 'لكل') }, { t: 'دينار', at: w('لكل دينار', 'دينار') }, { t: 'مكانه', at: w('لكل دينار', 'مكانه'), em: 'grad' }]],
      },
      {
        kind: 'cards',
        from: L('ماكلة')[0]!.id,
        title: [],
        cards: [
          { t: 'ماكلة', at: w('ماكلة', 'ماكلة'), icon: 'food' },
          { t: 'كراء', at: w('ماكلة', 'كراء'), icon: 'home' },
          { t: 'نقل', at: w('ماكلة', 'نقل'), icon: 'car' },
          { t: 'خرجات', at: w('ماكلة', 'وخرجات'), icon: 'cup' },
        ],
      },
      {
        kind: 'punch',
        from: L('بسيط')[0]!.id,
        words: [
          { t: 'بسيط', at: w('بسيط', 'بسيط') },
          { t: 'سريع', at: w('بسيط', 'سريع') },
          { t: 'مجاني', at: w('بسيط', 'مجاني'), em: 'grad' },
        ],
      },
      { kind: 'end', from: L('حمّل')[0]!.id, at: w('حمّل', 'مصروفي'), line: 'رتّب فلوسك من اليوم', cta: 'حمّل التطبيق' },
    ],
  };
  return { timing, plan };
};

export const PRODUCT_DEMOS: Demo[] = [
  { id: 'product-ad', styleId: 'product', kind: 'ad', titleAr: 'إعلان ساعة ذكية', script: AD_SCRIPT, product: NOVA, build: adBuild },
  { id: 'product-app', styleId: 'product', kind: 'content', titleAr: 'تطبيق مصروفي', script: CONTENT_SCRIPT, product: null, build: contentBuild },
];
