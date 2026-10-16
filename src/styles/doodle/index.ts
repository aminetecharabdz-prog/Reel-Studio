import '@fontsource/readex-pro/600.css';
import '@fontsource/readex-pro/700.css';
import type { StyleModule } from '@/engine/types';
import { listTexts, repairAnchors } from '@/engine/plan';
import { STYLES } from '@/styles/catalog';
import { doodleDirector } from './director';
import { doodleLocalPlan } from './plan';
import { DoodlePlanSchema, type DoodlePlan } from './schema';
import { doodleSfx } from './sfx';
import { DoodleVideo } from './Video';

const LABELS: Record<DoodlePlan['beats'][number]['kind'], string> = {
  establish: 'المشهد الافتتاحي',
  introduce: 'دخول شخصية',
  walkTo: 'مشي إلى مكان جديد',
  speak: 'فقاعة كلام',
  think: 'فقاعة تفكير',
  question: 'علامة سؤال',
  nameTag: 'بطاقة اسم',
  cards: 'بطاقات',
  weather: 'طقس',
  gesture: 'حركة يد',
  reveal: 'كشف النتيجة',
  quote: 'بطاقة اقتباس',
  closing: 'الختام',
};

const doodle: StyleModule<DoodlePlan> = {
  meta: STYLES.doodle,
  schema: DoodlePlanSchema as never,
  Video: DoodleVideo,
  fonts: ['700|Readex Pro', '600|Readex Pro'],
  tailSeconds: 1.6,
  cutaways: ['establish', 'cards', 'quote', 'closing', 'reveal'],
  sfx: doodleSfx,
  localPlan: doodleLocalPlan,
  director: doodleDirector,
  sanitize: (plan, T) => {
    const { plan: fixed, issues } = repairAnchors({ scenes: plan.beats } as never, T.words.map((w) => w.id)) as { plan: { scenes: unknown[] }; issues: string[] };
    const parsed = DoodlePlanSchema.safeParse({ ...plan, beats: fixed.scenes });
    if (!parsed.success) return { plan, issues: [...issues, ...parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)] };
    return { plan: parsed.data, issues };
  },
  scenes: (plan) => {
    const texts = listTexts({ scenes: plan.beats });
    return plan.beats.map((b, i) => ({ at: b.from, beat: b.kind, label: LABELS[b.kind], texts: texts.filter((t) => t.scene === i).map((t) => ({ path: t.path.replace(/^scenes/, 'beats'), label: t.label, value: t.value })) }));
  },
};

export default doodle;
