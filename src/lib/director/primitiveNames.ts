import type { PrimitiveId } from '../schema/plan';

export const PRIMITIVE_AR: Record<PrimitiveId, string> = {
  'kinetic-headline': 'عنوان متحرك', 'word-build': 'كلمات متراكبة', 'highlight-sweep': 'تظليل الكلمة', 'big-number': 'رقم كبير', 'quote-card': 'بطاقة اقتباس',
  typewriter: 'آلة كاتبة', 'split-flap': 'لوحة مطار', 'stacked-list': 'قائمة', 'question-hook': 'سؤال جذّاب',
  'bar-chart': 'أعمدة بيانية', 'line-chart': 'خط بياني', 'donut-chart': 'دائرة نسبة', 'progress-ring': 'حلقة تقدّم', versus: 'مقارنة', timeline: 'خط زمني',
  steps: 'خطوات', checklist: 'قائمة تحقق', rating: 'تقييم نجوم', 'algeria-map': 'خريطة الجزائر', 'icon-array': 'شبكة أشخاص',
  'image-card': 'بطاقة صورة', 'ken-burns': 'صورة كاملة متحركة', 'phone-mockup': 'هاتف', 'laptop-mockup': 'حاسوب', 'before-after': 'قبل وبعد',
  collage: 'كولاج', 'polaroid-stack': 'صور بولارويد', 'product-hero': 'عرض المنتج',
  'icon-burst': 'أيقونة منفجرة', 'icon-grid': 'شبكة أيقونات', 'illustration-scene': 'مشهد مرسوم', 'sticker-pop': 'ملصقات', 'callout-arrows': 'أسهم توضيحية',
  'highlighter-circle': 'دائرة يدوية', 'shape-morph': 'شكل متحوّل', gauge: 'عداد', 'do-dont': 'ديرها / ماديرهاش', 'warning-alert': 'تحذير',
  'title-card': 'بطاقة عنوان', 'chapter-divider': 'فاصل فصل', cta: 'دعوة للفعل', 'end-card': 'البطاقة الأخيرة', 'logo-sting': 'ظهور الشعار',
  'price-tag': 'السعر', 'delivery-badge': 'التوصيل', 'cod-badge': 'الدفع عند الاستلام', urgency: 'كمية محدودة', 'offer-ribbon': 'شريط العرض', 'feature-callouts': 'مميزات المنتج',
  'hero-scene': 'مشهد بطل مركّب',
};

export const TRANSITION_AR: Record<string, string> = {
  cut: 'قطع', fade: 'تلاشي', push: 'دفع', slide: 'انزلاق', wipe: 'مسح', zoom: 'زوم', iris: 'دائرة', flash: 'فلاش', shutter: 'مصراع', blur: 'ضبابي',
};
