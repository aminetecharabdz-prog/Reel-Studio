/** Keyword detection for Darija / Arabic / French speech (reel-copywriting + arabic-rtl-video skills). */

export const STOPWORDS = new Set(
  [
    // Darija
    'راني', 'راك', 'راه', 'راهي', 'واش', 'باش', 'بلي', 'هاذ', 'هاذا', 'هادي', 'هذا', 'هذه', 'هذي', 'تاع', 'نتاع', 'بزاف', 'شوية', 'كيما', 'وين', 'كي', 'مور', 'برك', 'غير', 'يا', 'ما', 'لي', 'اللي', 'الي', 'في', 'من', 'على', 'مع', 'و', 'ولا', 'او', 'أو', 'ثم', 'بصح', 'خاطر', 'حتى', 'كامل', 'هو', 'هي', 'هوما', 'نتا', 'نتي', 'انا', 'أنا', 'حنا', 'نتوما', 'ني', 'شي', 'والو', 'دايما', 'دروك', 'ضرك', 'عندك', 'عندو', 'عندها', 'كاين', 'كاينة', 'يكون', 'تكون', 'لازم', 'قبل', 'بعد', 'هكا', 'هكذا', 'تع', 'ل', 'ب', 'لـ', 'بـ', 'إلى', 'الى', 'عن', 'كل', 'أن', 'ان', 'إن', 'لا', 'لم', 'لن', 'قد', 'كان', 'كانت', 'ذلك', 'التي', 'الذي',
    // French / English
    'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'ou', 'en', 'au', 'aux', 'pour', 'par', 'avec', 'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'is', 'it',
  ].map((w) => w.toLowerCase()),
);

const stripPunct = (w: string) => w.replace(/[.,!?؟،؛:;"'«»()\-…]/g, '');

/** Normalise an Arabic word for comparison: strip diacritics, tatweel, unify alef/ya/ta marbuta. */
export const normalizeAr = (w: string) =>
  stripPunct(w)
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();

export const isStopword = (w: string) => {
  const n = normalizeAr(w);
  return n.length <= 1 || STOPWORDS.has(n) || STOPWORDS.has(stripPunct(w).toLowerCase());
};

/** A rough salience score: numbers > long content words > short words; stopwords 0. */
export const salience = (w: string): number => {
  const clean = stripPunct(w);
  if (!clean) return 0;
  if (/\d/.test(clean)) return 3;
  if (isStopword(clean)) return 0;
  const len = normalizeAr(clean).length;
  return len >= 6 ? 2 : len >= 4 ? 1.5 : 1;
};

export const cleanWord = stripPunct;
