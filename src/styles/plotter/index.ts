import '@fontsource/alexandria/200.css';
import '@fontsource/alexandria/700.css';
import '@fontsource/alexandria/800.css';
import '@fontsource/alexandria/900.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/readex-pro/700.css';
import type { StyleModule } from '@/engine/types';
import { listTexts, repairAnchors } from '@/engine/plan';
import { STYLES } from '@/styles/catalog';
import { plotterDirector } from './director';
import { plotterLocalPlan } from './plan';
import { PlotterPlanSchema, type PlotterPlan } from './schema';
import { plotterSfx } from './sfx';
import { PlotterVideo } from './Video';

const LABELS: Record<PlotterPlan['scenes'][number]['kind'], string> = {
  penTitle: 'عنوان بالقلم',
  heroStack: 'كلمات كبيرة',
  slam: 'ضربة برتقالية',
  nodeFlow: 'مخطط خطوات',
  promptInput: 'خانة الإدخال',
  karaoke: 'سطر يضيء كلمة كلمة',
  graphCard: 'منحنى',
  schematic: 'رسم تقني',
  paperForm: 'استمارة ورقية',
  filmStrip: 'شريط فيلم',
  arcOutro: 'الختام',
};

const plotter: StyleModule<PlotterPlan> = {
  meta: STYLES.plotter,
  schema: PlotterPlanSchema as never,
  Video: PlotterVideo,
  fonts: ['900|Alexandria', '800|Alexandria', '700|Alexandria', '200|Alexandria', '500|IBM Plex Sans Arabic', '400|IBM Plex Mono', '700|Readex Pro'],
  tailSeconds: 1.6,
  cutaways: ['slam', 'paperForm', 'arcOutro', 'nodeFlow'],
  sfx: plotterSfx,
  localPlan: plotterLocalPlan,
  director: plotterDirector,
  sanitize: (plan, T) => {
    const { plan: fixed, issues } = repairAnchors(plan, T.words.map((w) => w.id));
    const parsed = PlotterPlanSchema.safeParse(fixed);
    if (!parsed.success) return { plan, issues: [...issues, ...parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)] };
    return { plan: parsed.data, issues };
  },
  scenes: (plan) => {
    const texts = listTexts(plan);
    return plan.scenes.map((s, i) => ({ at: s.from, beat: s.kind, label: LABELS[s.kind], texts: texts.filter((t) => t.scene === i).map((t) => ({ path: t.path, label: t.label, value: t.value })) }));
  },
};

export default plotter;
