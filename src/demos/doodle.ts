/**
 * doodle — two hand-authored demos: an e-commerce explainer (a delivery app, modern town) and a short original story
 * (the baker and his neighbour, a Maghreb neighbourhood). Anchors via line()/word().
 */
import { estimateTiming } from '@/engine/estimate';
import { TimingIndex } from '@/engine/timing';
import type { DoodlePlan } from '@/styles/doodle/schema';
import type { Demo } from './types';

const AD = `حبيت تشري حاجة وما عندكش الوقت؟
هذا سمير، خدام من الصباح للعشية
دخل لتطبيق دوز وطلب في دقيقة
ملابس، هواتف وأدوات الدار
والكولي جاه للدار في نهار واحد
قال: «كي شفت السلعة فرحت بزاف»
الدفع عند الاستلام في 58 ولاية
حمّل دوز اليوم`;

const adBuild = () => {
  const timing = estimateTiming(AD, { wps: 2.1, gap: 0.9, lead: 0.5, tail: 0.6 });
  const T = new TimingIndex(timing);
  const w = (l: string, q: string, n = 0) => T.word(l, q, n).id;
  const f = (l: string) => T.line(l).words[0]!.id;
  const plan: DoodlePlan = {
    style: 'doodle',
    cast: [
      { id: 'samir', kind: 'man', outfit: 'casual', color: 'blue', name: 'سمير' },
      { id: 'liv', kind: 'man', outfit: 'casual', color: 'gold', name: 'الموصّل' },
    ],
    zones: [
      { ground: 'town', props: ['house', 'tree', 'house'], water: false },
      { ground: 'market', props: ['stall', 'box', 'stall'], water: false },
      { ground: 'town', props: ['house', 'scooter', 'tree'], water: false },
      { ground: 'grass', props: ['house', 'tree', 'bush'], water: false },
    ],
    beats: [
      { from: f('حبيت'), kind: 'question', zone: 0, cast: ['samir'], text: '', items: [], icon: '', weather: 'sparkles', at: w('حبيت', 'الوقت') },
      { from: f('هذا سمير'), kind: 'nameTag', zone: 0, cast: ['samir'], text: 'سمير', items: [], icon: '', weather: 'sparkles', at: w('هذا سمير', 'سمير') },
      { from: f('دخل'), kind: 'think', zone: 0, cast: ['samir'], text: '', items: [], icon: 'phone', weather: 'sparkles', at: w('دخل', 'دوز') },
      {
        from: f('ملابس'),
        kind: 'cards',
        zone: 1,
        cast: ['samir'],
        text: '',
        items: [
          { t: 'ملابس', at: w('ملابس', 'ملابس'), icon: 'gift' },
          { t: 'هواتف', at: w('ملابس', 'هواتف'), icon: 'phone' },
          { t: 'أدوات الدار', at: w('ملابس', 'وأدوات'), icon: 'home' },
        ],
        icon: '',
        weather: 'sparkles',
      },
      { from: f('والكولي'), kind: 'walkTo', zone: 2, cast: ['liv', 'samir'], text: '', items: [], icon: '', weather: 'sparkles' },
      { from: f('قال:'), kind: 'speak', zone: 2, cast: ['samir', 'liv'], text: 'كي شفت السلعة فرحت بزاف', items: [], icon: '', weather: 'sparkles', at: w('قال:', 'كي') },
      { from: f('الدفع'), kind: 'quote', zone: 2, cast: ['samir', 'liv'], text: 'الدفع عند الاستلام في 58 ولاية', items: [], icon: '', weather: 'sparkles' },
      { from: f('حمّل'), kind: 'closing', zone: 3, cast: ['samir', 'liv'], text: 'حمّل دوز اليوم', items: [], icon: '', weather: 'sparkles' },
    ],
    accents: [w('حبيت', 'الوقت'), w('هذا سمير', 'سمير'), w('دخل', 'دقيقة'), w('ملابس', 'هواتف'), w('والكولي', 'نهار'), w('قال:', 'فرحت'), w('الدفع', 'الاستلام'), w('حمّل', 'دوز')],
    subtitles: [],
    series: 'دوز · توصيل',
  };
  return { timing, plan };
};

const STORY = `واش تعرف علاش الخير يرجعلك؟
كان واحد الخباز في حومة صغيرة
كل صباح يعطي خبزة لجارو الشيخ
وفي نهار من النهارات مشى للسوق
قالو الشيخ: «ربي يبارك في يديك»
ولما رجع لقى الحومة كاملة تستناه
الحليب، التمر والفاكهة كانو هدية
الخير اللي تعطيه يرجعلك
شارك القصة مع صحابك`;

const storyBuild = () => {
  const timing = estimateTiming(STORY, { wps: 2.0, gap: 0.95, lead: 0.5, tail: 0.6 });
  const T = new TimingIndex(timing);
  const w = (l: string, q: string, n = 0) => T.word(l, q, n).id;
  const f = (l: string) => T.line(l).words[0]!.id;
  const plan: DoodlePlan = {
    style: 'doodle',
    cast: [
      { id: 'baker', kind: 'man', outfit: 'robe', color: 'white', name: 'الخباز' },
      { id: 'sheikh', kind: 'elder', outfit: 'robe', color: 'red', name: 'الشيخ' },
      { id: 'kid', kind: 'kid', outfit: 'robe', color: 'green', name: '' },
    ],
    zones: [
      { ground: 'sand', props: ['palm', 'mountain', 'palm'], water: false },
      { ground: 'town', props: ['house', 'palm', 'house'], water: false },
      { ground: 'market', props: ['stall', 'palm', 'stall'], water: false },
      { ground: 'grass', props: ['wall', 'palm', 'pile', 'tree'], water: true },
    ],
    beats: [
      { from: f('واش تعرف'), kind: 'establish', zone: 0, cast: ['baker'], text: '', items: [], icon: '', weather: 'sparkles' },
      { from: f('الخباز'), kind: 'nameTag', zone: 1, cast: ['baker'], text: 'الخباز', items: [], icon: '', weather: 'sparkles', at: w('الخباز', 'الخباز') },
      { from: f('كل صباح'), kind: 'introduce', zone: 1, cast: ['sheikh', 'baker'], text: 'الشيخ', items: [], icon: '', weather: 'sparkles', at: w('كل صباح', 'الشيخ') },
      { from: f('للسوق'), kind: 'walkTo', zone: 2, cast: ['baker'], text: '', items: [], icon: '', weather: 'sparkles' },
      { from: f('ربي يبارك'), kind: 'speak', zone: 2, cast: ['sheikh', 'baker'], text: 'ربي يبارك في يديك', items: [], icon: '', weather: 'sparkles', at: w('ربي يبارك', 'ربي') },
      { from: f('لقى الحومة'), kind: 'reveal', zone: 3, cast: ['baker', 'sheikh', 'kid'], text: '', items: [], icon: '', weather: 'sparkles', at: w('لقى الحومة', 'تستناه') },
      {
        from: f('الحليب'),
        kind: 'cards',
        zone: 3,
        cast: ['baker', 'sheikh', 'kid'],
        text: '',
        items: [
          { t: 'الحليب', at: w('الحليب', 'الحليب'), icon: 'cup' },
          { t: 'التمر', at: w('الحليب', 'التمر'), icon: 'heart' },
          { t: 'الفاكهة', at: w('الحليب', 'والفاكهة'), icon: 'gift' },
        ],
        icon: '',
        weather: 'sparkles',
      },
      { from: f('الخير اللي'), kind: 'quote', zone: 3, cast: ['baker'], text: 'الخير اللي تعطيه يرجعلك', items: [], icon: '', weather: 'sparkles' },
      { from: f('شارك'), kind: 'closing', zone: 3, cast: ['baker', 'sheikh', 'kid'], text: 'شارك القصة', items: [], icon: '', weather: 'sparkles' },
    ],
    accents: [w('واش تعرف', 'الخير'), w('الخباز', 'الخباز'), w('كل صباح', 'خبزة'), w('للسوق', 'للسوق'), w('ربي يبارك', 'يبارك'), w('لقى الحومة', 'تستناه'), w('الحليب', 'هدية'), w('الخير اللي', 'يرجعلك'), w('شارك', 'القصة')],
    subtitles: ['Do you know why kindness comes back?', 'There was a baker in a small neighbourhood', 'Every morning he gave bread to the old neighbour', 'One day he went to the market', '“Bless your hands,” said the old man', 'When he came back, the whole street was waiting', 'Milk, dates and fruit — all gifts', 'The good you give comes back to you', 'Share the story with your friends'],
    series: 'حكايات رسّام',
  };
  return { timing, plan };
};

export const DOODLE_DEMOS: Demo[] = [
  { id: 'doodle-ad', styleId: 'doodle', kind: 'ad', titleAr: 'تطبيق دوز للتوصيل', script: AD, product: null, build: adBuild },
  { id: 'doodle-story', styleId: 'doodle', kind: 'content', titleAr: 'الخباز والجار', script: STORY, product: null, build: storyBuild },
];
