/**
 * Hero direction without AI (QUALITY_BAR §MUSTs 1–5): turn a beat into a `hero-scene` whose visual
 * literally illustrates the words — a topic illustration when one matches, else 3D objects found in the
 * sentence (count / pair / orbit / center layouts), a red/green mark for do/don't, a badge, and a
 * 1–3 word label that never repeats the caption.
 */
import type { Word } from '../schema/transcript';
import type { BgTreatment, Hero, ImageRef, SceneContent } from '../schema/plan';
import type { ProductInfo } from '../schema/project';
import { artsIn, findArt, type Art3DId } from '../design/art3d';
import { normalizeAr, isStopword } from '../text/keywords';
import { distill, findNumbers } from './content';
import type { BeatType } from './primitiveMeta';

type Rule = { re: RegExp; illus: string; params: Hero['illusParams'] };
/** topic illustrations, matched on the normalised beat text (first match wins) */
const ILLUS_RULES: Rule[] = [
  { re: /(بارد|البارد|froid|حساسيه|sensib)/, illus: 'tooth-cross', params: { highlight: 'cold' } },
  { re: /(تسوس|التسوس|carie|سوسه)/, illus: 'tooth-cross', params: { highlight: 'cavity' } },
  { re: /(تشقق|تشققات|fissure|كسر|مكسور)/, illus: 'tooth-cross', params: { highlight: 'crack' } },
  { re: /(\bfil\b|خيط|floss)/, illus: 'teeth-row', params: { plaque: true, floss: true } },
  { re: /(ما يغسلوش|مايغسلوش|بلاك|plaque|tartre|جير)/, illus: 'teeth-row', params: { plaque: true } },
  { re: /(ابيض|بياض|blancheur|تبييض|ابتسام)/, illus: 'teeth-row', params: { clean: true } },
  { re: /(يهبط.*يدخل|admission|الشفط)/, illus: 'engine-cylinder', params: { stroke: 1 } },
  { re: /(يضغط|compression)/, illus: 'engine-cylinder', params: { stroke: 2 } },
  { re: /(bougie|شراره|étincelle|etincelle)/, illus: 'engine-cylinder', params: { stroke: 3 } },
  { re: /(échappement|echappement|الدخان)/, illus: 'engine-cylinder', params: { stroke: 4 } },
  { re: /(piston|بيستون|موتور|moteur|محرك)/, illus: 'engine-cylinder', params: { stroke: 'cycle', speed: 1.1 } },
  { re: /(tr\/min|rpm|دوره.*تمشي|كي تمشي ب)/, illus: 'gauge-dial', params: { value: 3, max: 8, unit: 'x1000 tr/min' } },
  { re: /(تسوق|تسوقي|conduis).*(تيليفون|هاتف|phone)|(تيليفون|phone).*(يطيح|طاح|tombe)/, illus: 'car-dash', params: { phone: 'falling', bumpy: true } },
  { re: /(يتركب|clim|يشد|ثابت|support)/, illus: 'car-dash', params: { phone: 'snap' } },
  { re: /(يدور|360|rotation)/, illus: 'car-dash', params: { phone: 'rotate' } },
];

const NEG = /^(ما|ماشي|لا|ممنوع|حذاري|وحذاري|جامي|jamais|ne|pas|never|don't)$/;
const POS = /^(مليح|صحيح|ديما|دايما|toujours|ok|يصلح|ويصلح|امنه|آمنة)$/;
const BG_CYCLE: BgTreatment[] = ['spotlight', 'dna', 'split', 'rays', 'grid', 'room', 'duotone'];
const BACKDROPS: NonNullable<Hero['backdrop']>[] = ['disc', 'blob', 'ring', 'arch', 'card'];

export const pickBg = (i: number, seed: number): BgTreatment => BG_CYCLE[(i + (seed % BG_CYCLE.length)) % BG_CYCLE.length]!;

/** 1–3 word label distilled from the speech (never the whole caption). */
export const shortLabel = (words: Word[], max = 3) => {
  const d = distill(words, max);
  const ws = d.text.split(/\s+/).filter(Boolean);
  // never end on a dangling article/preposition (… "استعمل le")
  while (ws.length > 1 && isStopword(ws[ws.length - 1]!)) ws.pop();
  return { text: ws.slice(0, max).join(' '), firstId: d.firstId };
};

export type HeroInput = { words: Word[]; type: BeatType; index: number; seed: number; mode: 'A' | 'B' | 'C'; product?: ProductInfo; image?: ImageRef; overused?: (art: string) => boolean };

/** Build hero-scene content for a beat. */
export const heroContent = (x: HeroInput): SceneContent => {
  const { words, type, index, seed } = x;
  const norm = words.map((w) => normalizeAr(w.text)).join(' ');
  const raw = words.map((w) => w.text.toLowerCase()).join(' ');
  const nums = findNumbers(words);
  const pct = nums.find((n) => n.isPercent);
  const prices = nums.filter((n) => n.isPrice);
  const wil = nums.find((n) => n.isWilaya);
  const small = nums.find((n) => !n.isPercent && !n.isPrice && !n.isWilaya && n.value >= 2 && n.value <= 8 && Number.isInteger(n.value));
  const found = artsIn(words.map((w) => w.text), 5);
  // an object already used often in this video moves to the back (variety), unless it's the only one
  const arts = [...found.filter((a) => !x.overused?.(a)), ...found.filter((a) => x.overused?.(a))];
  const label = shortLabel(words, 3);
  const hero: Hero = { backdrop: BACKDROPS[(index + seed) % BACKDROPS.length] };
  const content: SceneContent = { headline: label.text, headlineAt: label.firstId, hero };
  const neg = words.some((w) => NEG.test(normalizeAr(w.text)) || /^ما.+ش[؟?!.،]*$/.test(w.text));
  const pos = words.some((w) => POS.test(normalizeAr(w.text)));
  const rule = ILLUS_RULES.find((r) => r.re.test(norm) || r.re.test(raw));

  // product ads: the real product is the hero for product / offer beats
  if (x.mode === 'B' && x.image && (type === 'product' || (type === 'offer' && prices.length))) {
    hero.image = x.image;
    hero.cutout = true;
    hero.props = arts.filter((a) => a !== 'money-bag').slice(0, 2);
    if (prices.length) {
      const p = prices[prices.length - 1]!;
      content.price = p.value;
      content.oldPrice = prices.length >= 2 ? prices[0]!.value : undefined;
      content.currency = x.product?.currency || 'دج';
      content.valueAt = p.wordId;
      if (content.oldPrice && content.oldPrice > p.value) content.kicker = `-${Math.round((1 - p.value / content.oldPrice) * 100)}%`;
    }
    hero.note = 'the real product, with the offer on it';
    return content;
  }
  if (rule) {
    hero.illus = rule.illus;
    hero.illusParams = rule.params;
    hero.backdrop = 'card';
    if (arts[0]) hero.badge = { art: arts[0], at: words.find((w) => findArt(w.text) === arts[0])?.id };
    hero.note = `${rule.illus} illustrates “${label.text}”`;
  } else if (pct) {
    hero.layout = 'count';
    hero.count = 10;
    hero.highlight = Math.max(1, Math.min(10, Math.round(pct.value / 10)));
    hero.art = neg || type === 'problem' || type === 'hook' ? 'grimacing-face' : 'smiling-face-with-smiling-eyes';
    hero.art2 = hero.art === 'grimacing-face' ? 'smiling-face-with-smiling-eyes' : 'thinking-face';
    hero.backdrop = 'card';
    content.headline = `${pct.value}%`;
    content.headlineAt = pct.wordId;
    hero.note = `${hero.highlight} of 10 faces = ${pct.value}%`;
  } else if (wil) {
    hero.art = 'delivery-truck';
    hero.props = ['package', 'round-pushpin'];
    hero.badge = { art: 'globe-showing-europe-africa', text: `${wil.value} ولاية`, at: wil.wordId };
    hero.note = 'delivery truck + wilaya count';
  } else if (small && arts[0] && arts[0] !== 'alarm-clock') {
    hero.layout = 'count';
    hero.count = small.value;
    hero.art = arts[0];
    hero.backdrop = 'none';
    hero.note = `${small.value} × ${arts[0]}`;
  } else if (arts.length >= 2 && (type === 'comparison' || /\sو/.test(` ${norm}`) || neg)) {
    hero.layout = 'pair';
    hero.art = arts[0];
    hero.art2 = arts[1];
    hero.props = arts.slice(2, 4);
    hero.note = `${arts[0]} + ${arts[1]}`;
  } else {
    hero.art = arts[0] ?? defaultArt(type, x.mode);
    if (arts[0] && x.overused?.(arts[0])) hero.layout = index % 2 ? 'orbit' : 'side';
    hero.props = (arts.length > 1 ? arts.slice(1, 4) : propsFor(type)).filter((a) => a !== hero.art);
    if (type === 'cta') hero.layout = 'orbit';
    hero.note = arts[0] ? `${arts[0]} named in the sentence` : `${hero.art} for a ${type} beat`;
  }
  // do / don't marks
  if (!hero.illus && neg && (type === 'problem' || /حذاري|ممنوع|ماشي/.test(norm))) {
    hero.mark = 'forbidden';
    hero.markAt = words.find((w) => NEG.test(normalizeAr(w.text)))?.id;
  } else if (!hero.illus && pos && !neg && type !== 'hook') hero.mark = 'check';
  if (type === 'problem' && !hero.badge && !hero.mark) hero.badge = { art: 'warning' };
  // kicker: the number + unit when one was said and is not already the headline
  const n0 = nums[0];
  if (n0 && !content.kicker && !content.headline?.includes(String(n0.value)) && !pct && !wil) content.kicker = `${n0.value}${n0.unit ? ` ${n0.unit === '%' ? '%' : n0.unit}` : ''}`;
  return content;
};

const defaultArt = (type: BeatType, mode: 'A' | 'B' | 'C'): Art3DId => {
  switch (type) {
    case 'hook': return 'thinking-face';
    case 'problem': return 'warning';
    case 'fact': return 'light-bulb';
    case 'emotion': return 'red-heart';
    case 'cta': return mode === 'B' ? 'shopping-cart' : 'bell';
    case 'offer': return 'wrapped-gift';
    case 'product': return 'package';
    case 'process': return 'gear';
    default: return 'sparkles';
  }
};
const propsFor = (type: BeatType): Art3DId[] => {
  switch (type) {
    case 'cta': return ['thumbs-up', 'red-heart', 'sparkles'];
    case 'emotion': return ['sparkles', 'sparkling-heart'];
    case 'problem': return ['warning'];
    case 'offer': return ['party-popper', 'money-with-wings'];
    default: return ['sparkles'];
  }
};

/** Composition fingerprint for repetition checks (two hero-scenes are "the same" only if they look the same). */
export const heroKey = (c: SceneContent) => {
  const h = c.hero;
  if (!h) return 'hero:none';
  return `hero:${h.layout ?? 'center'}:${h.illus ? `${h.illus}${JSON.stringify(h.illusParams ?? {})}` : h.image ? 'image' : h.art ?? ''}`;
};

/** What a scene looks like, for anti-repetition fingerprints (primitive id, or the hero composition). */
export const sceneSignature = (s: { primitive: string; content: SceneContent }) => (s.primitive === 'hero-scene' ? heroKey(s.content) : s.primitive);
