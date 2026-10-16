/**
 * Shared word knowledge for the local (no-key) planners: stop words in Darija / MSA / French / English, numbers,
 * key-word choice, contrast and question cues, and topic → icon hints. Pure functions, unit-tested.
 */
import { norm } from './timing';

const STOP_LIST = `
و في من على إلى الى عن مع هذا هذه ذلك تلك هو هي هم انا أنا انت أنت نحن احنا اللي الذي التي ما لا لم لن قد كل كان كانت يكون
باش بش بلي ب ل ك ف ثم او أو بل غير برك برّك واش كي كيف كيفاش علاش وين فين شحال هل ماشي راه راهي راني راك راكم ديال تاع نتاع
ان أن إن إذا اذا لما عند عندك عندو عندها لي له لها لك بيه بيها فيه فيها منه منها يا هاد هادي هاذ هاذي ذا دا داك ديك مازال
عليه عليها عليك تاعك تاعنا متاع جا جات يجي نجي تجي حتى بعد قبل كما لكن بصح ولا ولّا
le la les un une des de du et à au aux en pour par sur avec dans est sont ce cet cette ces qui que quoi pas plus ne se sa son ses
the a an and or of to in on for with is are be this that it its you your we our at by from as
`;
export const STOP = new Set(STOP_LIST.split(/\s+/).filter(Boolean).map(norm));

const strip = (w: string) => w.replace(/^[«"'([]+|[.,!?؟،؛:"'»)\]…]+$/g, '');
export const clean = strip;

export const isStop = (w: string) => {
  const n = norm(w);
  return !n || STOP.has(n) || (n.length <= 2 && !/\d/.test(n));
};

export const isNumberish = (w: string) => /[0-9٠-٩]/.test(w) || /^(مليون|مليار|ألف|الف|آلاف|%|بالمئة|بالمية)$/.test(norm(w));

/** index of the line's key word: a number if any, else the last content word (the reference accents the last one). */
export const keyIndex = (words: string[]): number => {
  const num = words.findIndex(isNumberish);
  if (num >= 0) return num;
  for (let i = words.length - 1; i >= 0; i--) if (!isStop(words[i]!) && norm(words[i]!).length >= 3) return i;
  let best = 0;
  words.forEach((w, i) => {
    if (norm(w).length > norm(words[best]!).length) best = i;
  });
  return best;
};

const CONTRAST = new Set(['لكن', 'لاكن', 'بصح', 'بصّح', 'الآن', 'الان', 'دابا', 'ضرك', 'درك', 'دروك', 'بدل', 'بدلا', 'عوض', 'mais', 'but', 'now', 'maintenant', 'however', 'بالعكس', 'اليوم']);
export const isContrast = (w: string) => CONTRAST.has(norm(strip(w)));

const QUESTION_START = new Set(['واش', 'هل', 'كيفاش', 'علاش', 'شحال', 'وين', 'فين', 'كيف', 'لماذا', 'متى', 'ماذا', 'pourquoi', 'comment', 'why', 'how', 'what']);
export const isQuestion = (text: string) => /[?؟]\s*$/.test(text.trim()) || QUESTION_START.has(norm(text.trim().split(/\s+/)[0] ?? ''));

/**
 * «A، B، C و D» style enumerations → segments (≥ 3), each with the index of its first word and a short label
 * (≤ 3 words). Splits at commas and at a «و…» word that follows a comma-separated item.
 */
export const listSegments = (words: string[]): Array<{ i: number; label: string }> => {
  const segs: number[][] = [[]];
  let sawComma = false;
  words.forEach((w, i) => {
    const cur = segs[segs.length - 1]!;
    if (cur.length && sawComma && /^و\S{2,}/.test(w) && !isStop(w)) segs.push([i]);
    else cur.push(i);
    if (/[،,]$/.test(w)) {
      sawComma = true;
      segs.push([]);
    }
  });
  const out = segs
    .filter((g) => g.length)
    .map((g) => {
      const content = g.filter((i) => !isStop(words[i]!));
      const pick = (content.length ? content : g).slice(-2);
      const label = pick.map((i) => strip(words[i]!).replace(/^و(?=\S{3,})/, '')).join(' ');
      return { i: pick[0]!, label, n: g.length };
    });
  if (out.length < 3 || out.some((o) => o.n > 4)) return [];
  return out.slice(0, 7).map(({ i, label }) => ({ i, label }));
};

/** first word index of each list item (≥ 3 items) */
export const listItems = (words: string[]): number[] => listSegments(words).map((x) => x.i);

/** topic hints → icon id (icons exist in every style's illustration library under the same names) */
const ICON_HINTS: Array<[RegExp, string]> = [
  [/توصيل|ليفري|livraison|delivery|شحن|ولاي/, 'truck'],
  [/سعر|ثمن|دينار|دج|da\b|prix|price|تخفيض|promo|عرض/, 'tag'],
  [/ضمان|جودة|qualit|garantie|آمن|امان|أمان|حماية/, 'shield'],
  [/هاتف|تيليفون|phone|portable|موبايل|تطبيق|app/, 'phone'],
  [/وقت|ساعة|دقيقة|دقائق|سريع|vite|rapide|fast|time/, 'clock'],
  [/هدية|cadeau|gift|مجان|gratuit|free/, 'gift'],
  [/دفع|كاش|paiement|cash|carte|بطاقة/, 'card'],
  [/قلب|حب|صحة|santé|health|love/, 'heart'],
  [/طبيع|bio|نبات|أعشاب|اعشاب|natur/, 'leaf'],
  [/ماء|eau|water|ترطيب|عطش/, 'drop'],
  [/سنان|أسنان|اسنان|dent|teeth/, 'tooth'],
  [/سيارة|طوموبيل|voiture|car\b|موتور|moteur/, 'car'],
  [/أكل|اكل|ماكلة|طعام|food|cuisine|مطعم|restaurant/, 'food'],
  [/قهوة|café|coffee|شاي|thé/, 'cup'],
  [/مدرس|دراسة|كتاب|école|book|livre|تعلم|درس/, 'book'],
  [/رياضة|sport|gym|عضل/, 'dumbbell'],
  [/مال|فلوس|دراهم|ربح|argent|money|بزنس|business/, 'money'],
  [/عالم|دول|world|monde|سفر|voyage/, 'globe'],
  [/دار|بيت|منزل|maison|home/, 'home'],
  [/مكان|عنوان|adresse|location|محل/, 'pin'],
  [/صور|كاميرا|photo|camera|فيديو|vidéo|video/, 'camera'],
  [/زبون|عميل|client|خدمة|service|دعم|support/, 'headset'],
  [/نمو|نتيجة|نتائج|زيادة|croissance|growth|مبيعات/, 'chart'],
  [/سلة|شراء|اشري|اشتري|achat|buy|commande|اطلب|طلب/, 'cart'],
  [/جديد|nouveau|new|سحر|magic/, 'sparkles'],
  [/قوة|قوي|طاقة|énergie|power/, 'bolt'],
  [/نار|حار|ساخن|feu|fire|hot/, 'fire'],
  [/شخص|إنسان|انسان|personne|user|زبائن/, 'user'],
  [/يوم|أيام|ايام|موعد|date|calendrier/, 'calendar'],
  [/سر|خصوصية|privé|lock/, 'lock'],
  [/علبة|منتج|produit|product|سلعة|كولي|colis/, 'box'],
  [/نجم|تقييم|avis|star|ممتاز/, 'star'],
  [/رسالة|واتساب|whatsapp|message|تواصل|كلم/, 'chat'],
  [/صاروخ|انطلاق|lancement|launch/, 'rocket'],
  [/ثمين|فخم|luxe|premium|ذهب/, 'gem'],
];
export const iconFor = (text: string, fallback = 'sparkles'): string => {
  const n = norm(text);
  for (const [re, id] of ICON_HINTS) if (re.test(n)) return id;
  return fallback;
};

/** split n items into k nearly-equal consecutive chunks of at most `max` */
export const chunk = <X>(xs: X[], max: number): X[][] => {
  if (xs.length <= max) return [xs];
  const parts = Math.ceil(xs.length / max);
  const size = Math.ceil(xs.length / parts);
  const out: X[][] = [];
  for (let i = 0; i < xs.length; i += size) out.push(xs.slice(i, i + size));
  return out;
};
