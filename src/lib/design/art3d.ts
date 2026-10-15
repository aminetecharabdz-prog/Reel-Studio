/**
 * Glossy 3D illustration library (Microsoft Fluent UI Emoji 3D, MIT — public/art/3d/LICENSE-fluentui-emoji.txt),
 * curated and converted to 256px WebP. These are the default hero objects when no generated image exists
 * (QUALITY_BAR §MUST 3: "high-quality illustrated/3D icon sets composed into small scenes").
 */
import { normalizeAr } from '../text/keywords';

export const ART3D = [
  'tooth', 'toothbrush', 'mouth', 'tongue', 'microbe', 'candy', 'lollipop', 'chocolate-bar', 'cup-with-straw', 'soft-ice-cream', 'ice', 'snowflake',
  'cold-face', 'grimacing-face', 'face-with-thermometer', 'anxious-face-with-sweat', 'face-screaming-in-fear', 'smiling-face-with-smiling-eyes',
  'beaming-face-with-smiling-eyes', 'smiling-face-with-sunglasses', 'star-struck', 'smiling-face-with-heart-eyes', 'thinking-face', 'exploding-head',
  'woman-health-worker', 'man-health-worker', 'health-worker', 'hospital', 'stethoscope', 'pill', 'syringe', 'thermometer', 'alarm-clock', 'stopwatch',
  'timer-clock', 'hourglass-not-done', 'spiral-calendar', 'calendar', 'tear-off-calendar', 'sparkles', 'glowing-star', 'star', 'warning', 'prohibited',
  'stop-sign', 'check-mark-button', 'cross-mark', 'red-heart', 'sparkling-heart', 'bell', 'magnifying-glass-tilted-left', 'shield', 'thread', 'water-wave',
  'droplet', 'sweat-droplets', 'automobile', 'oncoming-automobile', 'racing-car', 'gear', 'wrench', 'hammer-and-wrench', 'nut-and-bolt', 'toolbox',
  'oil-drum', 'fuel-pump', 'fire', 'collision', 'high-voltage', 'dashing-away', 'cloud', 'fog', 'wind-face', 'motorway', 'man-mechanic', 'mechanic',
  'mobile-phone', 'mobile-phone-with-arrow', 'no-mobile-phones', 'package', 'delivery-truck', 'money-with-wings', 'money-bag', 'credit-card', 'party-popper',
  'confetti-ball', 'wrapped-gift', 'shopping-cart', 'shopping-bags', 'magnet', 'counterclockwise-arrows-button', 'clockwise-vertical-arrows', 'thumbs-up',
  'thumbs-down', 'backhand-index-pointing-down', 'index-pointing-at-the-viewer', 'waving-hand', 'clapping-hands', 'raising-hands', 'flexed-biceps',
  'person-raising-hand', 'brain', 'light-bulb', 'rocket', 'trophy', 'bullseye', 'bar-chart', 'chart-increasing', 'chart-decreasing', 'megaphone',
  'loudspeaker', 'hundred-points', 'laptop', 'camera', 'video-camera', 'telephone-receiver', 'round-pushpin', 'globe-showing-europe-africa', 'house',
  'office-building', 'link', 'broken-chain', 'hot-beverage', 'potable-water', 'placard', 'identification-card', 'snow-capped-mountain',
  'sun-behind-small-cloud', 'cloud-with-rain', 'leaf-fluttering-in-wind', 'woman-with-headscarf', 'man-office-worker', 'woman-office-worker',
  'person-bowing', 'pinched-fingers', 'night-with-stars', 'watch', 'window', 'rainbow', 'shooting-star', 'heart-on-fire', 'lotion-bottle', 'lipstick',
] as const;
export type Art3DId = (typeof ART3D)[number];
const SET = new Set<string>(ART3D);
export const isArt3D = (id: string | undefined): id is Art3DId => !!id && SET.has(id);
export const art3dPath = (id: string) => `art/3d/${id}.webp`;

/** concept lexicon: Darija / Arabic / French / English stems → art id (first match wins, longer stems first). */
const LEX: Array<[Art3DId, string[]]> = [
  ['tooth', ['سنان', 'اسنان', 'سن', 'ضرس', 'ضراس', 'dent', 'dents', 'tooth', 'teeth', 'تسوس', 'carie', 'émail', 'email', 'pulpe']],
  ['toothbrush', ['فرشاه', 'فرشه', 'brosse', 'brush', 'اغسل', 'يغسلو', 'غسل', 'نغسل', 'تغسل']],
  ['thread', ['fil', 'خيط', 'floss']],
  ['microbe', ['ميكروب', 'جراثيم', 'بكتيريا', 'microbe', 'bacterie', 'bactérie', 'virus', 'infection']],
  ['candy', ['سكر', 'حلوى', 'حلويات', 'sucre', 'bonbon', 'candy', 'sugar']],
  ['cup-with-straw', ['مشروبات', 'غازيه', 'قازوز', 'gazeuse', 'soda', 'boisson', 'coca']],
  ['ice', ['بارد', 'البارد', 'برد', 'froid', 'cold', 'glace']],
  ['grimacing-face', ['وجع', 'يوجع', 'الم', 'douleur', 'mal', 'pain', 'حساسيه', 'sensibilité', 'sensibilite']],
  ['woman-health-worker', ['دكتوره', 'طبيبه', 'doctoresse', 'dentiste']],
  ['man-health-worker', ['دكتور', 'طبيب', 'docteur', 'medecin', 'médecin', 'doctor']],
  ['hospital', ['عياده', 'مستشفي', 'clinique', 'cabinet', 'hopital', 'hôpital']],
  ['stethoscope', ['فحص', 'كشف', 'contrôle', 'controle', 'checkup']],
  ['pill', ['دواء', 'دوا', 'حبوب', 'médicament', 'medicament', 'pill']],
  ['alarm-clock', ['مرات', 'مره', 'النهار', 'صباح', 'ليل', 'fois', 'matin', 'soir']],
  ['stopwatch', ['دقايق', 'دقائق', 'دقيقه', 'ثانيه', 'ثواني', 'minute', 'minutes', 'seconde', 'secondes', 'وقت', 'temps', 'سرعه', 'vite']],
  ['spiral-calendar', ['شهور', 'شهر', 'اشهر', 'mois', 'يوم', 'ايام', 'jour', 'jours', 'سيمانه', 'semaine', 'عام', 'سنه', 'an', 'ans']],
  ['sparkles', ['نظيف', 'نقي', 'propre', 'brillant', 'بياض', 'تبييض', 'blancheur']],
  ['smiling-face-with-smiling-eyes', ['ابتسامه', 'ابتسامتك', 'sourire', 'smile', 'فرحان', 'مليح', 'مليحه', 'زين']],
  ['warning', ['حذاري', 'احذر', 'خطر', 'danger', 'attention', 'رد بالك', 'تحذير']],
  ['prohibited', ['ممنوع', 'interdit', 'jamais', 'never']],
  ['check-mark-button', ['صحيح', 'نعم', 'oui', 'correct', 'valide', 'مضمون']],
  ['red-heart', ['قلب', 'حب', 'نحب', 'coeur', 'cœur', 'amour', 'love', 'تستاهل']],
  ['bell', ['تابع', 'تابعني', 'abonne', 'abonnez', 'follow', 'subscribe', 'notification']],
  ['magnifying-glass-tilted-left', ['شوف', 'تشوف', 'ابحث', 'cherche', 'regarde', 'وشوف', 'vérifie', 'verifie', 'check']],
  ['shield', ['حمايه', 'يحمي', 'protection', 'protège', 'protege', 'آمن', 'امنه', 'امان', 'sécurité', 'securite', 'safe', 'آمنة']],
  ['water-wave', ['ماء', 'الماء', 'eau', 'water', 'refroidissement']],
  ['droplet', ['قطره', 'زيت', 'l\'huile', 'huile', 'oil', 'liquide']],
  ['automobile', ['طوموبيل', 'الطوموبيل', 'سياره', 'السياره', 'لوطو', 'voiture', 'auto', 'car', 'تسوق', 'سوق', 'conduis', 'conduire']],
  ['gear', ['موتور', 'الموتور', 'محرك', 'moteur', 'engine', 'piston', 'بيستون', 'يخدم', 'mécanique', 'mecanique', 'ميكانيك']],
  ['wrench', ['صيانه', 'entretien', 'تصليح', 'réparation', 'reparation', 'vidange', 'فيدونج']],
  ['fuel-pump', ['essence', 'l\'essence', 'بنزين', 'مازوت', 'gasoil', 'diesel', 'carburant']],
  ['high-voltage', ['شراره', 'bougie', 'étincelle', 'etincelle', 'spark', 'كهرباء', 'électricité']],
  ['collision', ['انفجار', 'والانفجار', 'explosion', 'boom', 'يدفع', 'pousse', 'بقوه', 'قوه', 'force', 'puissance']],
  ['dashing-away', ['دخان', 'الدخان', 'échappement', 'l\'échappement', 'echappement', 'fumée', 'fumee', 'يخرج']],
  ['wind-face', ['هوا', 'الهوا', 'هواء', 'air']],
  ['motorway', ['طريق', 'الطريق', 'route', 'autoroute', 'road', 'كيلومتر', 'km']],
  ['mechanic', ['ميكانيسيان', 'mécanicien', 'mecanicien', 'garage', 'قراج']],
  ['mobile-phone', ['تيليفون', 'التيليفون', 'التيليفونات', 'والتيليفون', 'هاتف', 'téléphone', 'telephone', 'phone', 'portable', 'smartphone']],
  ['magnet', ['مغناطيس', 'المغناطيسي', 'مغناطيسي', 'aimant', 'magnétique', 'magnetique', 'magnet', 'يشد', 'ويشد']],
  ['counterclockwise-arrows-button', ['يدور', 'دوره', 'تدور', 'تعاود', 'rotation', 'tourne', '360', 'cycle']],
  ['package', ['منتوج', 'produit', 'colis', 'كولي', 'product', 'commande', 'كوموند', 'الاستلام', 'استلام']],
  ['delivery-truck', ['توصيل', 'التوصيل', 'livraison', 'ليفريزون', 'delivery', 'ولايه', 'ولايات', 'wilaya', 'wilayas']],
  ['money-with-wings', ['تخفيض', 'promo', 'réduction', 'reduction', 'solde', 'remise']],
  ['money-bag', ['سعر', 'السعر', 'دراهم', 'دج', 'da', 'prix', 'price', 'دينار', 'خلاص', 'والخلاص', 'paiement']],
  ['shopping-cart', ['اطلب', 'شري', 'اشري', 'achète', 'achete', 'commandez', 'order', 'buy']],
  ['hourglass-not-done', ['يكمل', 'stock', 'محدود', 'limité', 'limite', 'urgent']],
  ['thumbs-up', ['مليح', 'جيد', 'top', 'super', 'bien', 'good', 'great', 'يصلح', 'ويصلح']],
  ['thinking-face', ['واش', 'كيفاش', 'علاش', 'comment', 'pourquoi', 'question', 'تعرف', 'how', 'why']],
  ['light-bulb', ['فكره', 'نصيحه', 'نصائح', 'نصايح', 'conseil', 'conseils', 'astuce', 'idée', 'idee', 'tip', 'tips', 'تعلم', 'تعرف']],
  ['brain', ['عقل', 'مخ', 'cerveau', 'brain', 'تفكير']],
  ['rocket', ['سريع', 'بسرعه', 'rapide', 'fast', 'boost', 'نجاح']],
  ['trophy', ['احسن', 'الاول', 'meilleur', 'best', 'champion', 'ربح']],
  ['bullseye', ['هدف', 'objectif', 'goal', 'target', 'السبب']],
  ['chart-increasing', ['زياده', 'يزيد', 'نمو', 'augmente', 'croissance', 'growth', 'ventes', 'مبيعات']],
  ['megaphone', ['اعلان', 'publicité', 'publicite', 'pub', 'ads', 'annonce', 'marketing']],
  ['laptop', ['كمبيوتر', 'ordinateur', 'pc', 'laptop', 'site', 'web']],
  ['camera', ['تصوير', 'صوره', 'photo', 'camera', 'caméra']],
  ['video-camera', ['فيديو', 'vidéo', 'video', 'reel', 'ريلز', 'مونتاج', 'montage']],
  ['telephone-receiver', ['اتصل', 'appelle', 'appel', 'call', 'رقم', 'numéro', 'numero']],
  ['house', ['دار', 'الدار', 'maison', 'home', 'house', 'شقه', 'appartement']],
];

const entries = LEX.filter(([id]) => SET.has(id)).flatMap(([id, ws]) => ws.map((w) => [normalizeAr(w), id] as const)).filter(([w]) => w.length >= 2);
entries.sort((a, b) => b[0].length - a[0].length);

/** Best 3D object for a piece of text (word or phrase). */
export const findArt = (text: string): Art3DId | null => {
  const words = text.split(/\s+/).map(normalizeAr).filter(Boolean);
  for (const w of words) {
    for (const [stem, id] of entries) {
      if (w === stem || (stem.length >= 4 && (w.startsWith(stem) || w.endsWith(stem))) || (stem.length >= 3 && w.length >= 4 && (w === `ال${stem}` || w === `و${stem}` || w === `وال${stem}`))) return id;
    }
  }
  return null;
};

/** Distinct 3D objects mentioned in a list of words, in speaking order. */
export const artsIn = (words: string[], max = 4): Art3DId[] => {
  const out: Art3DId[] = [];
  for (const w of words) {
    const a = findArt(w);
    if (a && !out.includes(a)) out.push(a);
    if (out.length >= max) break;
  }
  return out;
};
