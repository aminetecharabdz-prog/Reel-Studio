/**
 * Concept lexicon: Darija / Arabic / French / English stems → a bundled visual that literally shows the idea
 * (QUALITY_BAR MUST 2). Photoreal library cut-outs (obj/*) come first; glossy 3D objects (3d/*, Fluent UI Emoji, MIT)
 * cover what the photo library lacks. Used by the no-key director and by the QA auto-fix for scenes without a hero.
 */
import type { Src } from './schema';
import { LIBRARY } from './library';
import { STICKERS } from './stickers';
import { normAr } from './text';
import { ART_FILL } from './artMeta';

type V = `obj/${string}` | `3d/${string}`;
const LEX: Array<[V, string[]]> = [
  // health / dental
  ['3d/tooth', ['سنان', 'اسنان', 'سن', 'ضرس', 'ضراس', 'dent', 'dents', 'tooth', 'teeth', 'تسوس', 'carie', 'pulpe']],
  ['obj/toothpaste', ['فرشاه', 'فرشه', 'brosse', 'brush', 'معجون', 'dentifrice']],
  ['3d/thread', ['fil', 'خيط', 'floss']],
  ['3d/microbe', ['ميكروب', 'جراثيم', 'بكتيريا', 'microbe', 'bacterie', 'virus', 'infection']],
  ['obj/heart-anatomy', ['قلب', 'coeur', 'cœur', 'heart', 'cardio']],
  ['3d/pill', ['دواء', 'دوا', 'حبوب', 'medicament', 'médicament', 'pill']],
  ['3d/stethoscope', ['طبيب', 'دكتور', 'docteur', 'medecin', 'médecin', 'doctor', 'فحص', 'controle', 'contrôle']],
  ['obj/brain-color', ['عقل', 'مخ', 'دماغ', 'cerveau', 'brain', 'تفكير', 'تركيز', 'focus']],
  ['obj/dumbbells', ['رياضه', 'سبور', 'sport', 'gym', 'تمارين', 'musculation', 'عضلات']],
  // food & products
  ['obj/coffee-beans', ['قهوه', 'café', 'cafe', 'coffee', 'كافي']],
  ['obj/honey-jar', ['عسل', 'miel', 'honey']],
  ['obj/olive-oil-bottle', ['زيت', 'زيتون', 'huile', 'olive', 'oil']],
  ['obj/dates', ['تمر', 'دقله', 'dattes', 'dates']],
  ['obj/burger', ['اكل', 'ماكله', 'burger', 'fastfood', 'manger', 'food', 'مطعم', 'restaurant']],
  ['obj/pizza', ['بيتزا', 'pizza']],
  ['obj/cupcakes', ['حلويات', 'حلوى', 'gateau', 'gâteau', 'gateaux', 'patisserie', 'pâtisserie', 'cake']],
  ['obj/perfume', ['عطر', 'ريحه', 'parfum', 'perfume', 'fragrance']],
  ['3d/lipstick', ['ماكياج', 'rouge', 'maquillage', 'makeup', 'lipstick']],
  ['obj/cream-jars', ['كريم', 'creme', 'crème', 'cream', 'بشره', 'peau', 'skincare']],
  ['obj/wristwatch', ['ساعه', 'montre', 'watch']],
  ['obj/gold-ring', ['خاتم', 'ذهب', 'bague', 'bijou', 'bijoux', 'ring', 'gold', 'or']],
  ['obj/sneaker', ['صباط', 'سبادري', 'chaussure', 'chaussures', 'basket', 'baskets', 'sneaker', 'shoes']],
  ['obj/leather-bag', ['ساك', 'sac', 'bag', 'شنطه']],
  ['obj/sunglasses', ['نظارات', 'لونات', 'lunettes', 'sunglasses']],
  ['obj/mannequin', ['لبسه', 'لبسة', 'حوايج', 'ملابس', 'vetement', 'vêtement', 'vetements', 'mode', 'fashion', 'robe', 'تلبس']],
  ['obj/iphone', ['تيليفون', 'هاتف', 'telephone', 'téléphone', 'phone', 'portable', 'smartphone', 'iphone', 'انستغرام', 'إنستغرام', 'instagram', 'تيكتوك', 'tiktok', 'سكرول', 'scroll']],
  ['obj/macbook', ['كمبيوتر', 'ordinateur', 'pc', 'laptop', 'site', 'web', 'لاب']],
  ['obj/camera', ['تصوير', 'صوره', 'صورة', 'photo', 'camera', 'caméra', 'كاميرا']],
  ['obj/vintage-mic', ['صوت', 'ميكرو', 'micro', 'podcast', 'voix', 'voice']],
  ['obj/headphones-man', ['موسيقى', 'musique', 'music', 'تسمع', 'الودن', 'ودن', 'écoute', 'ecoute']],
  ['obj/sports-car', ['طوموبيل', 'سياره', 'لوطو', 'voiture', 'auto', 'car', 'موتور', 'محرك', 'moteur', 'engine']],
  ['3d/delivery-truck', ['توصيل', 'livraison', 'delivery', 'ولايه', 'ولايات', 'wilaya', 'wilayas', 'كامل الولايات']],
  ['3d/package', ['كولي', 'colis', 'commande', 'كوموند', 'الاستلام', 'استلام', 'package']],
  ['obj/shopping-bag', ['اطلب', 'شري', 'اشري', 'achete', 'achète', 'commandez', 'order', 'buy', 'shopping', 'تسوق']],
  ['obj/gift-box', ['هديه', 'هدية', 'cadeau', 'gift', 'كادو']],
  ['obj/suitcase', ['سفر', 'voyage', 'travel', 'عطله', 'vacances']],
  ['obj/travel-ticket', ['تذكره', 'بيليه', 'billet', 'ticket']],
  ['3d/house', ['دار', 'الدار', 'maison', 'home', 'house', 'شقه', 'appartement', 'عقار', 'immobilier']],
  // money & business
  ['obj/coin-stacks', ['دراهم', 'سعر', 'السعر', 'دج', 'prix', 'price', 'دينار', 'مال', 'money', 'argent', 'ربح', 'profit', 'رأس']],
  ['obj/piggy-bank', ['توفير', 'تصرف', 'économie', 'economie', 'épargne', 'epargne', 'save', 'رخيص', 'pas cher']],
  ['3d/chart-increasing', ['زياده', 'يزيد', 'نمو', 'augmente', 'croissance', 'growth', 'ventes', 'مبيعات', 'نتائج', 'résultats']],
  ['3d/chart-decreasing', ['نقص', 'ينقص', 'خساره', 'perte', 'baisse', 'loss']],
  ['obj/megaphone-man', ['اعلان', 'publicité', 'publicite', 'pub', 'ads', 'annonce', 'marketing', 'تسويق', 'ضجيج', 'bruit', 'noise']],
  ['obj/bullhorn', ['اشهار', 'promo', 'تخفيض', 'solde', 'remise', 'réduction']],
  ['obj/chess-king', ['استراتيجيه', 'الاستراتيجيه', 'strategie', 'stratégie', 'strategy', 'خطه', 'plan', 'تخطيط']],
  ['3d/bullseye', ['هدف', 'objectif', 'goal', 'target', 'cible']],
  ['obj/trophy', ['احسن', 'الاول', 'meilleur', 'best', 'champion', 'نجاح', 'succès', 'succes', 'success', 'ربحت']],
  ['obj/light-bulb', ['فكره', 'فكرة', 'نصيحه', 'نصائح', 'نصايح', 'conseil', 'conseils', 'astuce', 'idée', 'idee', 'idea', 'tip', 'tips']],
  ['obj/rocket-toy', ['سريع', 'بسرعه', 'rapide', 'fast', 'boost', 'انطلق', 'lancer', 'launch']],
  ['obj/hourglass', ['وقت', 'temps', 'time', 'بطيء', 'بطيئه', 'بطيئة', 'lent', 'slow', 'تستنى', 'attendre', 'صبر']],
  ['obj/alarm-clock', ['ثانيه', 'ثانيتين', 'ثواني', 'دقيقه', 'دقايق', 'minute', 'minutes', 'seconde', 'secondes', 'ساعات', 'heures', 'صباح', 'matin', 'اليوم', 'aujourd']],
  ['3d/spiral-calendar', ['شهر', 'شهور', 'mois', 'يوم', 'ايام', 'jour', 'jours', 'سيمانه', 'semaine', 'عام', 'سنه']],
  ['obj/magnifying-glass', ['ابحث', 'تحوس', 'cherche', 'chercher', 'search', 'تفاصيل', 'détail', 'detail', 'عين', 'العين', 'شوف', 'يشوفو', 'يشوفوك', 'يشوفوكش', 'تشوف', 'regarde', 'voir', 'vue', 'see', 'eye', 'انتباه', 'attention']],
  ['obj/padlock', ['حمايه', 'امان', 'آمن', 'sécurité', 'securite', 'secure', 'سري', 'secret', 'protection']],
  ['obj/chain', ['رابط', 'lien', 'link', 'علاقه', 'connexion']],
  ['obj/jigsaw', ['حل', 'solution', 'puzzle', 'لغز', 'مشكل', 'probleme', 'problème', 'problem']],
  ['obj/seedling', ['ابدا', 'بدايه', 'بداية', 'commence', 'start', 'debut', 'début', 'تكبر', 'grandir', 'grow']],
  ['obj/paper-plane', ['ارسل', 'ابعث', 'envoie', 'send', 'message', 'رساله', 'مساج']],
  ['obj/retro-computer', ['فيديو', 'vidéo', 'video', 'محتوى', 'المحتوى', 'contenu', 'content', 'ريلز', 'reel', 'reels', 'شورتس', 'shorts', 'مونتاج', 'montage']],
  ['obj/bronze-bust', ['جمهور', 'الجمهور', 'ناس', 'الناس', 'public', 'audience', 'متابعين', 'abonnés', 'abonnes', 'followers']],
  ['obj/fountain-pen', ['اكتب', 'كتابه', 'écrire', 'ecrire', 'write', 'سكريبت', 'script', 'نص']],
  ['3d/bell', ['تابع', 'تابعني', 'اشترك', 'abonne', 'abonnez', 'follow', 'subscribe', 'notification']],
  ['3d/thinking-face', ['واش', 'كيفاش', 'علاش', 'comment', 'pourquoi', 'question', 'how', 'why']],
  ['3d/warning', ['حذاري', 'احذر', 'خطر', 'danger', 'خطا', 'الخطا', 'غلطه', 'erreur', 'erreurs', 'mistake', 'اخطاء']],
  ['3d/prohibited', ['ممنوع', 'interdit', 'jamais', 'never', 'تقتل', 'tue', 'kill']],
  ['3d/flexed-biceps', ['قوي', 'قويه', 'قوية', 'fort', 'forte', 'strong', 'puissant']],
  ['obj/stressed-laptop', ['تعب', 'التعب', 'fatigue', 'stress', 'ضغط', 'مقلق']],
];

const exists = (v: V) => (v.startsWith('obj/') ? LIBRARY.has(v) : STICKERS.has(v.slice(3)));
/** thin objects (an eye, a watch seen edge-on) can't fill a hero slot at a sane size — not picked automatically */
const MIN_FILL = 0.3;
const usable = (v: V) => exists(v) && (ART_FILL[v] ?? 1) >= MIN_FILL;

/** Layer width (share of frame width) at which a visual covers about `target` of a 9:16 frame — never below `base`. */
export const heroWidth = (v: string, base: number, target = 0.3, aspect = 9 / 16) =>
  Math.min(1.3, Math.max(base, Math.sqrt(target / (aspect * (ART_FILL[v] ?? 0.6)))));
const entries = LEX.filter(([v]) => usable(v))
  .flatMap(([v, ws]) => ws.map((w) => [normAr(w), v] as const))
  .filter(([w]) => w.length >= 2)
  .sort((a, b) => b[0].length - a[0].length);

const matches = (w: string, stem: string) =>
  w === stem ||
  (stem.length >= 4 && (w.startsWith(stem) || w.endsWith(stem))) ||
  (stem.length >= 2 && w.length > stem.length && /^(و|ال|وال|بال|فال|لل|ب|ل)$/.test(w.slice(0, w.length - stem.length)) && w.endsWith(stem));

/** Visual for one word, or null. */
export const conceptFor = (word: string): V | null => {
  const w = normAr(word);
  if (w.length < 2) return null;
  for (const [stem, v] of entries) if (matches(w, stem)) return v;
  return null;
};

/** Best visual for a phrase: most salient matching word first (longer words win), skipping visuals already used. */
export const visualFor = (words: string[], used: Set<string> = new Set()): V | null => {
  const order = words.map((t, i) => ({ t, i })).sort((a, b) => normAr(b.t).length - normAr(a.t).length);
  for (const { t } of order) {
    const v = conceptFor(t);
    if (v && !used.has(v)) return v;
  }
  return null;
};

/** Meaningful fallbacks by sentence role when no word matches (never an empty scene, never a random shape). */
export const fallbackVisual = (words: string[], role: 'hook' | 'body' | 'cta', used: Set<string> = new Set()): V => {
  const txt = words.join(' ');
  const pools: V[] =
    role === 'cta' ? ['3d/bell', 'obj/paper-plane', '3d/rocket', '3d/party-popper']
    : /[؟?]/.test(txt) || /^(واش|كيفاش|علاش|شحال|wesh|comment|pourquoi)/i.test(normAr(words[0] ?? '')) ? ['3d/thinking-face', 'obj/magnifying-glass']
    : /(^|\s)(ما|ماشي|بلا|لا|ne|pas|no|not)(\s|$)|ش(\s|$)/.test(txt) ? ['3d/cross-mark', '3d/thumbs-down', 'obj/jigsaw']
    : role === 'hook' ? ['obj/light-bulb', '3d/high-voltage', 'obj/eye']
    : ['3d/glowing-star', 'obj/light-bulb', '3d/sparkles', '3d/bullseye', '3d/hundred-points', '3d/thumbs-up'];
  return pools.find((v) => usable(v) && !used.has(v)) ?? pools.find(usable) ?? '3d/sparkles';
};

export const visualSrc = (v: V): Src => (v.startsWith('obj/') ? { kind: 'library', name: v } : { kind: 'sticker', name: v.slice(3) });
