/**
 * The 10 styles of the Motion Starter Kit as product metadata (names, use cases, swatches, readiness).
 * `ready` flips to true only when the style passes the MISSION_V4 §5 gate (see docs/progress.md).
 */
export const STYLE_IDS = ['product', 'infographic', 'doodle', 'whiteboard', 'plotter', 'stickman', 'chalkboard', 'isometric', 'fake3d', 'map-journey'] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export type Goal = 'ad' | 'explainer' | 'story' | 'numbers' | 'talking' | 'free';

export type StyleMeta = {
  id: StyleId;
  nameAr: string;
  nameEn: string;
  /** one line: what it looks like */
  lookAr: string;
  /** what it is good for */
  goodForAr: string[];
  goals: Goal[];
  /** the kit reference's native aspect */
  nativeAspect: '16:9' | '9:16';
  /** ground, ink, accent */
  swatch: [string, string, string];
  ready: boolean;
  /** words that hint this style to the automatic picker */
  keywords: string[];
};

export const STYLES: Record<StyleId, StyleMeta> = {
  product: {
    id: 'product',
    nameAr: 'إطلاق منتج',
    nameEn: 'Product launch',
    lookAr: 'كلمات ضخمة تخرج من الضباب، خانة طلب بإطار نيون، وواجهة منتجك مائلة بحافة متوهجة.',
    goodForAr: ['إعلان منتج أو تطبيق', 'عرض ميزة جديدة', 'إعلانات الهاتف والتقنية'],
    goals: ['ad', 'free'],
    nativeAspect: '16:9',
    swatch: ['#05050A', '#F5F3FF', '#6C3BFF'],
    ready: true,
    keywords: ['تطبيق', 'منتج', 'برنامج', 'app', 'launch', 'إطلاق', 'جديد', 'ميزة', 'هاتف', 'تقنية'],
  },
  infographic: {
    id: 'infographic',
    nameAr: 'إنفوجرافيك',
    nameEn: 'Infographic',
    lookAr: 'أرقام ضخمة تدور كالعدّاد على خلفية سوداء، وأشكال تتحول من كرة إلى نقاط إلى شريط إلى حلقة.',
    goodForAr: ['أرقام وإحصاءات', 'مقارنة أسعار وعروض', 'حقائق تصدم المشاهد'],
    goals: ['numbers', 'explainer', 'ad'],
    nativeAspect: '16:9',
    swatch: ['#000000', '#F5F5F7', '#64D2FF'],
    ready: true,
    keywords: ['نسبة', 'رقم', 'إحصاء', '%', 'مليون', 'مقارنة', 'سعر', 'أرقام'],
  },
  doodle: {
    id: 'doodle',
    nameAr: 'دودل الحكاية',
    nameEn: 'Doodle story',
    lookAr: 'شخصيات كرتونية بالحبر تمشي في عالم واحد بلا قطع، والكلام كلمة كلمة بكلمة برتقالية متوهجة.',
    goodForAr: ['قصة أو حكاية قصيرة', 'نصيحة بمثال', 'ريلز طولي'],
    goals: ['story', 'explainer'],
    nativeAspect: '9:16',
    swatch: ['#AFDCF0', '#3A2A1E', '#F07F2E'],
    ready: true,
    keywords: ['قصة', 'حكاية', 'كان', 'يوم', 'راجل', 'طفل', 'عبرة'],
  },
  whiteboard: {
    id: 'whiteboard',
    nameAr: 'السبورة البيضاء',
    nameEn: 'Whiteboard',
    lookAr: 'ماركر يرسم ويلوّن ويكتب خطوة بخطوة، والكاميرا تقترب من كل جزء، والرسمة تعيش بعد اكتمالها.',
    goodForAr: ['درس أو شرح خطوة بخطوة', 'طريقة استعمال منتج', 'نصائح مرتبة'],
    goals: ['explainer', 'ad', 'talking'],
    nativeAspect: '16:9',
    swatch: ['#FAFAF8', '#23272E', '#1E63D6'],
    ready: true,
    keywords: ['خطوات', 'كيفاش', 'طريقة', 'شرح', 'درس', 'نصائح'],
  },
  plotter: {
    id: 'plotter',
    nameAr: 'البلوتر',
    nameEn: 'Plotter',
    lookAr: 'قلم بشرارة برتقالية يرسم على ورق مربعات داكن، وكلمات تضيء مع الصوت، وثلاثة ألوان فقط.',
    goodForAr: ['شرح فكرة أو موضوع تقني', 'ذكاء اصطناعي وبرمجة', 'محتوى تعليمي جاد'],
    goals: ['explainer', 'talking', 'free'],
    nativeAspect: '16:9',
    swatch: ['#090909', '#D1CDC2', '#F04A14'],
    ready: true,
    keywords: ['ذكاء', 'برمجة', 'تقنية', 'نظام', 'AI', 'كود', 'فكرة'],
  },
  stickman: {
    id: 'stickman',
    nameAr: 'الشخصية العصوية',
    nameEn: 'Stickman',
    lookAr: 'شخصية مرنة بيدين ورجلين من العصي ووجه معبّر، في مواقف كوميدية ومؤثرات.',
    goodForAr: ['نصيحة بقصة كوميدية', 'أخطاء شائعة', 'محتوى خفيف للريلز'],
    goals: ['story', 'explainer'],
    nativeAspect: '16:9',
    swatch: ['#FAF9F4', '#1F2328', '#EB5757'],
    ready: false,
    keywords: ['خطأ', 'أخطاء', 'ضحك', 'مشكل', 'تأجيل', 'عادة'],
  },
  chalkboard: {
    id: 'chalkboard',
    nameAr: 'سبورة الطباشير',
    nameEn: 'Chalkboard',
    lookAr: 'طباشيرة ترسم وتكتب على سبورة خضراء، يتساقط منها الغبار، مع إثبات بصري متحرك.',
    goodForAr: ['درس رياضيات أو علوم', 'معادلة أو قاعدة', 'محتوى مدرسي'],
    goals: ['explainer', 'numbers'],
    nativeAspect: '16:9',
    swatch: ['#3F6357', '#F3F1E7', '#F6E07A'],
    ready: false,
    keywords: ['رياضيات', 'قانون', 'معادلة', 'درس', 'مدرسة', 'علوم', 'حساب'],
  },
  isometric: {
    id: 'isometric',
    nameAr: 'العالم الأيزومتريك',
    nameEn: 'Isometric world',
    lookAr: 'عالم ملوّن بمناطق ومبانٍ، والكاميرا تسافر بينها مع ما يتحرك، ومراحل مرقّمة فوقه.',
    goodForAr: ['شرح رحلة أو نظام من مراحل', 'كيف يصل طلبك', 'خدمة توصيل أو متجر'],
    goals: ['explainer', 'ad'],
    nativeAspect: '16:9',
    swatch: ['#EAF1FF', '#1E1B4B', '#6366F1'],
    ready: false,
    keywords: ['توصيل', 'مراحل', 'رحلة', 'طلب', 'نظام', 'مدينة', 'مخزن'],
  },
  fake3d: {
    id: 'fake3d',
    nameAr: 'الثلاثي الأبعاد',
    nameEn: 'Fake 3D',
    lookAr: 'رسم مسطّح بإضاءة ناعمة، والأشياء تلف ويظهر سُمكها، في لقطة واحدة تنتهي ببوستر.',
    goodForAr: ['فكرة ملهمة أو افتتاحية', 'رسالة عاطفية قصيرة', 'منتج فاخر'],
    goals: ['free', 'story', 'ad'],
    nativeAspect: '16:9',
    swatch: ['#341844', '#FFF6E2', '#F5B54A'],
    ready: false,
    keywords: ['حلم', 'إلهام', 'نجاح', 'مفتاح', 'باب', 'فرصة'],
  },
  'map-journey': {
    id: 'map-journey',
    nameAr: 'رحلة الخريطة',
    nameEn: 'Map journey',
    lookAr: 'خريطة قديمة بسواحل حقيقية، والكاميرا تطير فوقها خلف مسافر على خط الرحلة، مع أعلام وكروت.',
    goodForAr: ['رحلة أو حدث تاريخي', 'التوصيل عبر الولايات', 'قصة مدينة أو بلد'],
    goals: ['story', 'explainer', 'ad'],
    nativeAspect: '16:9',
    swatch: ['#EAD9B5', '#3B2716', '#9C2A1C'],
    ready: false,
    keywords: ['رحلة', 'خريطة', 'تاريخ', 'ولاية', 'مدينة', 'سفر', 'الجزائر'],
  },
};

export const STYLE_LIST: StyleMeta[] = STYLE_IDS.map((id) => STYLES[id]);

export const GOALS: Record<Goal, { ar: string; hint: string }> = {
  ad: { ar: 'إعلان منتج', hint: 'صور المنتج، السعر، العرض، والطلب عبر واتساب' },
  explainer: { ar: 'شرح فكرة', hint: 'درس، طريقة، أو نصائح مرتبة' },
  story: { ar: 'قصة', hint: 'حكاية قصيرة بعبرة أو مثال' },
  numbers: { ar: 'أرقام وإحصاءات', hint: 'نسبة، مقارنة، أو حقيقة بالأرقام' },
  talking: { ar: 'الظهور بالصورة', hint: 'فيديو لك وأنت تتكلم ومونتاج حولك' },
  free: { ar: 'حر', hint: 'افتتاحية، رسالة، أو أي فكرة أخرى' },
};
