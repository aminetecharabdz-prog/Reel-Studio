import '@fontsource/ibm-plex-sans-arabic/300.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/ibm-plex-mono/500.css';
import type { StyleModule } from '@/engine/types';
import { listTexts, repairAnchors } from '@/engine/plan';
import { STYLES } from '@/styles/catalog';
import { infographicDirector } from './director';
import { infographicLocalPlan } from './plan';
import { InfographicPlanSchema, type InfographicPlan } from './schema';
import { infographicSfx } from './sfx';
import { InfographicVideo } from './Video';

const LABELS: Record<InfographicPlan['beats'][number]['kind'], string> = {
  stat: 'رقم كبير',
  globe: 'الكرة الأرضية',
  sphere: 'كرة زجاجية',
  grid: 'شبكة 100 نقطة',
  bar: 'شريط التقسيم',
  ring: 'الحلقة والقائمة',
  symbol: 'رمز وسط الضوء',
  compare: 'مقارنة الكرات',
  versus: 'مقابل',
  timeline: 'خط الزمن',
  headline: 'عنوان',
  source: 'المصدر',
};

const infographic: StyleModule<InfographicPlan> = {
  meta: STYLES.infographic,
  schema: InfographicPlanSchema as never,
  Video: InfographicVideo,
  fonts: ['700|IBM Plex Sans Arabic', '500|IBM Plex Sans Arabic', '300|IBM Plex Sans Arabic', '500|IBM Plex Mono'],
  tailSeconds: 1.8,
  cutaways: ['grid', 'bar', 'ring', 'compare', 'source'],
  sfx: infographicSfx,
  localPlan: infographicLocalPlan,
  director: infographicDirector,
  sanitize: (plan, T) => {
    const { plan: fixed, issues } = repairAnchors({ scenes: plan.beats } as never, T.words.map((w) => w.id)) as { plan: { scenes: unknown[] }; issues: string[] };
    const parsed = InfographicPlanSchema.safeParse({ ...plan, beats: fixed.scenes });
    if (!parsed.success) return { plan, issues: [...issues, ...parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)] };
    return { plan: parsed.data, issues };
  },
  scenes: (plan) => {
    const texts = listTexts({ scenes: plan.beats });
    return plan.beats.map((b, i) => ({ at: b.from, beat: b.kind, label: LABELS[b.kind], texts: texts.filter((t) => t.scene === i).map((t) => ({ path: t.path.replace(/^scenes/, 'beats'), label: t.label, value: t.value })) }));
  },
};

export default infographic;
