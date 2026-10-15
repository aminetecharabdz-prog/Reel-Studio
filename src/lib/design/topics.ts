import { normalizeAr } from '../text/keywords';

export type Topic = 'dental' | 'medical' | 'automotive' | 'product' | 'fashion' | 'food' | 'beauty' | 'education' | 'realestate' | 'tech' | 'sport' | 'finance' | 'kids' | 'general';

const LEX: Record<Exclude<Topic, 'general'>, string[]> = {
  dental: ['سنان', 'سن', 'اسنان', 'ضرس', 'لثة', 'فرشاة', 'معجون', 'تسوس', 'طبيب الاسنان', 'dentist', 'dent', 'dentaire', 'تقويم', 'تبييض', 'brosse'],
  medical: ['طبيب', 'دكتور', 'صحة', 'مرض', 'دواء', 'علاج', 'سكري', 'ضغط', 'medecin', 'santé', 'sante', 'health', 'clinic', 'عيادة', 'مستشفى'],
  automotive: ['محرك', 'موتور', 'طوموبيل', 'سيارة', 'لوطو', 'زيت', 'huile', 'moteur', 'piston', 'بيستون', 'فرامل', 'frein', 'vidange', 'فيدونج', 'km', 'كيلومتر', 'garage', 'ميكانيك', 'mecanique', 'بنزين', 'essence', 'diesel', 'مازوت', 'شمعة', 'bougie', 'radiateur', 'رادياتور', 'courroie', 'turbo'],
  product: ['اطلب', 'سعر', 'دج', 'da', 'livraison', 'ليفريزون', 'توصيل', 'ولاية', 'promo', 'تخفيض', 'عرض', 'منتوج', 'حامل', 'support', 'الدفع عند الاستلام', 'stock', 'commande', 'كوموند'],
  fashion: ['لبسة', 'حوايج', 'جاكيت', 'veste', 'سباط', 'صباط', 'chaussure', 'robe', 'قندورة', 'fashion', 'mode', 'ستيل', 'style', 'تريكو'],
  food: ['ماكلة', 'اكل', 'طبخ', 'وصفة', 'recette', 'بيتزا', 'pizza', 'قهوة', 'cafe', 'café', 'مطعم', 'restaurant', 'حلويات', 'gateau', 'شوكولا'],
  beauty: ['بشرة', 'شعر', 'مكياج', 'makeup', 'كريم', 'creme', 'soin', 'تجميل', 'beauté', 'beaute', 'عطر', 'parfum'],
  education: ['تعلم', 'درس', 'قراية', 'طالب', 'امتحان', 'bac', 'باك', 'cours', 'formation', 'تكوين', 'لغة', 'langue', 'مدرسة', 'جامعة'],
  realestate: ['دار', 'شقة', 'appartement', 'f3', 'f4', 'كراء', 'location', 'بيع', 'عقار', 'immobilier', 'فيلا', 'villa', 'terrain'],
  tech: ['تطبيق', 'application', 'app', 'برنامج', 'ذكاء', 'ia', 'ai', 'هاتف', 'تيليفون', 'telephone', 'كمبيوتر', 'pc', 'انترنت', 'internet', 'web', 'site', 'رقمي', 'digital', 'تقنية'],
  sport: ['رياضة', 'sport', 'تمارين', 'musculation', 'جيم', 'gym', 'كورة', 'football', 'جري', 'وزن', 'régime', 'regime', 'لياقة', 'fitness'],
  finance: ['دراهم', 'فلوس', 'مال', 'ربح', 'استثمار', 'بنك', 'banque', 'argent', 'business', 'بيزنس', 'مشروع', 'تجارة', 'crypto'],
  kids: ['دراري', 'ذراري', 'طفل', 'اطفال', 'enfant', 'bébé', 'bebe', 'لعب', 'jouet'],
};

export const BUSINESS_TOPIC: Record<string, Topic> = {
  ecommerce: 'product', services: 'general', restaurant: 'food', beauty: 'beauty', health: 'medical', education: 'education',
  realestate: 'realestate', tech: 'tech', personal: 'general', other: 'general',
};

/** Score topics by lexicon hits in the transcript + idea text. */
export const detectTopic = (text: string, business?: string): { topic: Topic; scores: Record<string, number> } => {
  const norm = ' ' + text.split(/\s+/).map(normalizeAr).join(' ') + ' ';
  const scores: Record<string, number> = {};
  for (const [topic, words] of Object.entries(LEX)) {
    let s = 0;
    for (const w of words) {
      const n = normalizeAr(w);
      if (!n) continue;
      const re = new RegExp(`(^|\\s)(ال|و|ب|ل|لل|f)?${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      s += (norm.match(re) ?? []).length * (n.length > 3 ? 1.5 : 1);
    }
    scores[topic] = s;
  }
  if (business && BUSINESS_TOPIC[business] && BUSINESS_TOPIC[business] !== 'general') scores[BUSINESS_TOPIC[business]!] = (scores[BUSINESS_TOPIC[business]!] ?? 0) + 3;
  if ((scores.dental ?? 0) > 0) scores.dental = (scores.dental ?? 0) + (scores.medical ?? 0);
  let best: Topic = 'general';
  let bs = 1.4;
  for (const [t, s] of Object.entries(scores)) if (s > bs) { bs = s; best = t as Topic; }
  return { topic: best, scores };
};
