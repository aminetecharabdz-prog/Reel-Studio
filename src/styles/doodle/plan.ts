/**
 * doodle — the no-key planner. One world, one cast, one beat per sentence chosen from what the sentence does
 * (quote → bubble, question → ؟, list → cards, motion → walk, memory → thought, names → tag, weather, discovery,
 * result → reveal, moral/number → quote card, last line → closing), travelling through 2–5 zones.
 */
import { TimingIndex, norm } from '@/engine/timing';
import { clean, iconFor, isQuestion, listSegments } from '@/engine/lexicon';
import type { PlanInput } from '@/engine/types';
import type { PropKind } from './art';
import { DoodlePlanSchema, type DoodleBeat, type DoodlePlan } from './schema';

const cut = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trim()}…`);
const has = (text: string, re: RegExp) => re.test(norm(text));

const RE = {
  speech: /(قال|قالت|يقول|تقول|قالو|قاله|قالها|قالتلها|قالتلو|قالي|قاتلو|said|dit)/,
  motion: /(مشى|مشا|راح|ذهب|يمشي|نمشي|جا|جاء|دخل|خرج|سافر|وصل|طلع|هبط|went|walk|va |alla)/,
  memory: /(تذكر|فكر|حلم|سمع|تخيل|يخمم|خمم|imagine|remember|pense)/,
  names: /(اسمه|اسمها|سميتو|هذا هو|هاذي هي|هذي هي|يسمى|تسمى|named|appelle)/,
  weather: /(مطر|شتا|نزل|تغير|الشمس|ريح|سحاب|rain|pluie|soleil)/,
  joy: /(فرح|وجد|لقى|شاف|مرحبا|سلام|شكرا|يضحك|happy|merci|bonjour)/,
  result: /(فاذا|النتيجه|وهكذا|فوجد|في الاخير|ولات|صارت|result|finalement)/,
  moral: /(حكمه|نصيحه|قاعده|تذكر دايما|الدرس|العبره|lesson|conseil)/,
  person: /(رجل|راجل|امراه|مرا|طفل|ولد|بنت|زبون|صاحب|شيخ|عجوز|خويا|يما|بابا|ماما|client|homme|femme)/,
};

export const doodleLocalPlan = (input: PlanInput): DoodlePlan => {
  const T = new TimingIndex(input.timing);
  const lines = T.lines;
  const modern = input.goal === 'ad' || input.goal === 'explainer' || input.goal === 'numbers' || !!input.product;
  const WOMAN = /(امراه|مرا|ماما|يما|خالتي|عمتي|جارتي|femme|woman|she)/;
  const KID = /(طفل|ولد|بنت|بنتها|بنتو|وليد|صغير|kid|enfant|fille|garcon)/;
  const ELDER = /(شيخ|عجوز|جد|جدة|جدتي|جدي|grand)/;
  const kindOf = (txt: string, fb: 'man' | 'woman' | 'kid' | 'elder') => (has(txt, WOMAN) ? 'woman' : has(txt, ELDER) ? 'elder' : has(txt, KID) ? 'kid' : fb);
  const firstPerson = lines.find((l) => has(l.text, RE.person) || has(l.text, WOMAN))?.text ?? '';
  const secondPerson = lines.filter((l) => has(l.text, RE.person) || has(l.text, WOMAN) || has(l.text, KID)).map((l) => l.text)[1] ?? '';
  const aKind = kindOf(firstPerson, 'man');
  const outfit = (modern ? 'casual' : 'robe') as 'casual' | 'robe';
  const cast = [
    { id: 'a', kind: aKind, outfit, color: modern ? ('blue' as const) : ('white' as const), name: '' },
    { id: 'b', kind: kindOf(secondPerson.replace(firstPerson, ''), aKind === 'woman' ? 'man' : 'woman'), outfit, color: 'red' as const, name: '' },
  ];
  const grounds: Array<DoodlePlan['zones'][number]> = modern
    ? [
        { ground: 'town', props: ['house', 'tree', 'house'], water: false },
        { ground: 'market', props: ['stall', 'box', 'stall'], water: false },
        { ground: 'town', props: ['house', 'car', 'tree'], water: false },
        { ground: 'grass', props: ['tree', 'bush', 'house'], water: false },
      ]
    : [
        { ground: 'sand', props: ['palm', 'palm', 'mountain'], water: false },
        { ground: 'stones', props: ['palm', 'stone'], water: false },
        { ground: 'grass', props: ['wall', 'palm', 'bush', 'tree'], water: true },
        { ground: 'grass', props: ['wall', 'tree', 'pile'], water: false },
      ];
  const beats: DoodleBeat[] = [];
  let zone = 0;
  let introducedB = false;
  let sinceMove = 0;
  lines.forEach((l, li) => {
    const ws = l.words;
    const w0 = ws[0]!;
    const text = l.text;
    const quote = /«([^»]+)»/.exec(text)?.[1] ?? /"([^"]+)"/.exec(text)?.[1];
    const segs = listSegments(ws.map((w) => w.w));
    const last = li === lines.length - 1 && lines.length > 2;
    const castNow = introducedB ? ['a', 'b'] : ['a'];
    const base = { from: w0.id, zone, cast: castNow, text: '', items: [], icon: '', weather: 'sparkles' as const };
    if (li === 0) {
      beats.push({ ...base, kind: 'establish', cast: ['a'] });
      return;
    }
    if (last) {
      zone = Math.min(grounds.length - 1, Math.max(zone, 1));
      beats.push({ ...base, zone, kind: 'closing', cast: introducedB ? ['a', 'b'] : ['a'], text: input.product ? cut(input.product.whatsapp ? `واتساب ${input.product.whatsapp}` : 'اطلب الآن', 40) : '' });
      return;
    }
    if (has(text, RE.motion)) {
      zone = Math.min(grounds.length - 1, zone + 1);
      sinceMove = 0;
      beats.push({ ...base, zone, kind: 'walkTo' });
      return;
    }
    sinceMove++;
    if (quote || has(text, RE.speech)) {
      const newcomer = !introducedB && li > 1 && (has(text, RE.person) || has(text, KID) || has(text, WOMAN)) && !has(text, /^(قال|قالت)/);
      if (newcomer) introducedB = true;
      const speakerB = newcomer || (introducedB && li % 2 === 0);
      beats.push({ ...base, kind: 'speak', cast: speakerB ? ['b', 'a'] : introducedB ? ['a', 'b'] : castNow, text: cut(quote ?? (ws.slice(Math.max(0, ws.findIndex((w) => RE.speech.test(norm(w.w))) + 1)).map((w) => w.w).join(' ') || text), 90) });
      return;
    }
    if (segs.length >= 2) {
      beats.push({ ...base, kind: 'cards', items: segs.slice(0, 4).map((s) => ({ t: cut(s.label, 22), at: ws[s.i]!.id, icon: iconFor(s.label, ['sparkles', 'star', 'heart', 'check'][s.i % 4]!) })) });
      return;
    }
    if (isQuestion(text)) {
      beats.push({ ...base, kind: 'question' });
      return;
    }
    if (has(text, RE.names) || (input.product?.name && norm(text).includes(norm(input.product.name).split(' ')[0] ?? '∅'))) {
      const name = input.product?.name && norm(text).includes(norm(input.product.name).split(' ')[0] ?? '∅') ? input.product.name : clean(ws[ws.length - 1]!.w);
      beats.push({ ...base, kind: 'nameTag', text: cut(name, 24) });
      return;
    }
    if (has(text, RE.person) && !introducedB && li > 0) {
      introducedB = true;
      beats.push({ ...base, kind: 'introduce', cast: ['b', 'a'] });
      return;
    }
    if (has(text, RE.weather)) {
      beats.push({ ...base, kind: 'weather', weather: has(text, /(مطر|شتا|نزل|rain|pluie)/) ? 'rain' : has(text, /(شمس|soleil|sun)/) ? 'sun' : 'sparkles' });
      return;
    }
    if (has(text, RE.memory)) {
      beats.push({ ...base, kind: 'think', icon: iconFor(text, 'sparkles') });
      return;
    }
    if (has(text, RE.result)) {
      beats.push({ ...base, kind: 'reveal' });
      return;
    }
    if (has(text, RE.moral) || /\d/.test(text)) {
      beats.push({ ...base, kind: 'quote', text: cut(text, 90) });
      return;
    }
    if (has(text, RE.joy)) {
      beats.push({ ...base, kind: 'gesture' });
      return;
    }
    if (sinceMove >= 3) {
      zone = Math.min(grounds.length - 1, zone + 1);
      sinceMove = 0;
      beats.push({ ...base, zone, kind: 'walkTo' });
      return;
    }
    const icon = iconFor(text, '');
    beats.push(icon ? { ...base, kind: 'think', icon } : { ...base, kind: li % 2 ? 'gesture' : 'speak', text: li % 2 ? '' : cut(text, 90) });
  });
  const zonesUsed = Math.max(...beats.map((b) => b.zone)) + 1;
  const zones = grounds.slice(0, Math.max(1, zonesUsed)).map((z) => ({ ...z, props: z.props as PropKind[] }));
  return DoodlePlanSchema.parse({ style: 'doodle', cast: introducedB ? cast : [cast[0]!], zones, beats, accents: [], subtitles: [], series: '' });
};
