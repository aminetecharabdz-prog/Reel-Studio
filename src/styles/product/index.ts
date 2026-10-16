import '@fontsource/readex-pro/300.css';
import '@fontsource/readex-pro/400.css';
import '@fontsource/readex-pro/500.css';
import '@fontsource/readex-pro/600.css';
import '@fontsource/readex-pro/700.css';
import '@fontsource/ibm-plex-mono/500.css';
import type { StyleModule } from '@/engine/types';
import { listTexts, repairAnchors } from '@/engine/plan';
import { STYLES } from '@/styles/catalog';
import { productDirector } from './director';
import { productLocalPlan } from './plan';
import { ProductPlanSchema, type ProductPlan } from './schema';
import { productSfx } from './sfx';
import { ProductVideo } from './Video';

export const SCENE_LABELS: Record<ProductPlan['scenes'][number]['kind'], string> = {
  words: 'سطر حركي',
  punch: 'كلمات سريعة',
  prompt: 'خانة الطلب',
  logo: 'ظهور الشعار',
  showcase: 'واجهة المنتج',
  capsule: 'كبسولة القيم',
  cards: 'كروت طائرة',
  orb: 'الكرة الزجاجية',
  end: 'الخاتمة',
};

const product: StyleModule<ProductPlan> = {
  meta: STYLES.product,
  schema: ProductPlanSchema as never,
  Video: ProductVideo,
  fonts: ['700|Readex Pro', '600|Readex Pro', '500|Readex Pro', '400|Readex Pro', '300|Readex Pro', '500|IBM Plex Mono'],
  tailSeconds: 1.6,
  sfx: productSfx,
  localPlan: productLocalPlan,
  director: productDirector,
  sanitize: (plan, T) => {
    const { plan: fixed, issues } = repairAnchors(plan, T.words.map((w) => w.id));
    const parsed = ProductPlanSchema.safeParse(fixed);
    if (!parsed.success) return { plan, issues: [...issues, ...parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)] };
    return { plan: parsed.data, issues };
  },
  scenes: (plan) => {
    const texts = listTexts(plan);
    return plan.scenes.map((s, i) => ({
      at: s.from,
      beat: s.kind,
      label: SCENE_LABELS[s.kind],
      texts: texts.filter((t) => t.scene === i).map((t) => ({ path: t.path, label: t.label, value: t.value })),
    }));
  },
};

export default product;
