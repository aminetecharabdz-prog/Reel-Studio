import type { Project } from './schema/project';
import { ProjectSchema, StyleSettingsSchema } from './schema/project';
import { CaptionSettingsSchema, EndCardSchema } from './schema/plan';

/** Built-in demo projects (SPEC §11 phase 1). Voices are generated demo voices — labelled in the UI. */
export const DEMOS = [
  {
    id: 'dentist',
    name: 'نصائح طبيب الأسنان',
    mode: 'A' as const,
    business: 'health',
    idea: 'طبيبة أسنان تعطي 3 نصائح للعناية بالأسنان للجمهور الجزائري',
    seed: 4127,
    visualStyle: 'auto',
    artDirection: 'light, clean, fresh mint green',
    captions: { style: 'pill', wordsPerLine: 4, position: 0.76 },
    endCard: { enabled: true, cta: 'احجز موعدك', handle: '@dr.sara.dental', phone: '0555 12 34 56', seconds: 3 },
  },
  {
    id: 'engine',
    name: 'كيفاش يخدم موتور السيارة',
    mode: 'A' as const,
    business: 'education',
    idea: 'شرح مبسط لدورة المحرك رباعي الأشواط بالدارجة، لأصحاب السيارات',
    seed: 90211,
    visualStyle: 'tech-hud',
    artDirection: 'dark',
    captions: { style: 'karaoke', wordsPerLine: 3, position: 0.74 },
    endCard: { enabled: true, cta: 'تابع للمزيد', handle: '@garage.dz', seconds: 2.5 },
  },
  {
    id: 'phone-holder',
    name: 'إعلان حامل الهاتف',
    mode: 'B' as const,
    business: 'ecommerce',
    idea: 'إعلان ممول لحامل هاتف مغناطيسي للسيارة، توصيل 58 ولاية والدفع عند الاستلام',
    seed: 31337,
    visualStyle: 'neo-brutalist',
    artDirection: 'orange, energetic, light',
    captions: { style: 'boxed-keyword', wordsPerLine: 3, position: 0.75 },
    endCard: { enabled: true, cta: 'اطلب دروك', phone: '0770 00 11 22', seconds: 3 },
    product: { name: 'حامل الهاتف المغناطيسي', price: 1500, oldPrice: 2500, currency: 'دج', offer: 'تخفيض 40%', deliveryWilayas: 58, cod: true, phone: '0770 00 11 22' },
    images: ['demo/phone-holder.svg', 'demo/phone-holder-in-use.svg'],
  },
  {
    id: 'talking',
    name: 'مونتاج فيديو متكلم (تجريبي)',
    mode: 'C' as const,
    business: 'personal',
    idea: 'صانع محتوى يعطي 3 أخطاء يديرها أصحاب المحلات في الإعلانات',
    seed: 7703,
    visualStyle: 'editorial',
    artDirection: 'red, light',
    captions: { style: 'word-pop', wordsPerLine: 3, position: 0.72 },
    endCard: { enabled: true, cta: 'تابعني', handle: '@yacine.biz', seconds: 2.5 },
    video: 'demo/talking.webm',
  },
] as const;

export type DemoId = (typeof DEMOS)[number]['id'];

export const demoProject = (id: DemoId, now = Date.now()): Project => {
  const d = DEMOS.find((x) => x.id === id)!;
  return ProjectSchema.parse({
    id: `demo-${id}`,
    name: d.name,
    createdAt: now,
    updatedAt: now,
    mode: d.mode,
    business: d.business,
    demo: id,
    style: StyleSettingsSchema.parse({
      visualStyle: d.visualStyle,
      artDirection: d.artDirection,
      captions: CaptionSettingsSchema.parse(d.captions),
      endCard: EndCardSchema.parse(d.endCard),
      music: { trackId: 'auto', volume: 0.45 },
    }),
    media: { idea: d.idea, vocabulary: '', extra: [], ...('video' in d ? { publicVideo: d.video } : { publicAudio: `demo/${id}.mp3` }) },
    product: 'product' in d ? { ...d.product, script: '', reviews: [] } : undefined,
    stage: 'transcript',
  });
};

export const demoSeed = (id: string) => DEMOS.find((d) => d.id === id)?.seed ?? 1;
export const demoImages = (id: string): string[] => {
  const d = DEMOS.find((x) => x.id === id);
  return d && 'images' in d ? [...d.images] : [];
};
