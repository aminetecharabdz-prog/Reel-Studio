import '@fontsource/marhey/600.css';
import '@fontsource/marhey/700.css';
import type { StyleModule } from '@/engine/types';
import { listTexts, snapIds } from '@/engine/plan';
import { STYLES } from '@/styles/catalog';
import { whiteboardDirector } from './director';
import { whiteboardLocalPlan } from './plan';
import { WhiteboardPlanSchema, type WhiteboardPlan } from './schema';
import { whiteboardSfx } from './sfx';
import { WhiteboardVideo } from './Video';

const LABELS: Record<WhiteboardPlan['items'][number]['kind'], string> = {
  object: 'رسمة',
  arrow: 'سهم',
  count: 'تكرار',
  contrast: 'مقارنة ✗/✓',
  number: 'رقم',
  band: 'شريط أرضي',
  emphasis: 'تأكيد',
  note: 'ملاحظة',
  journey: 'رحلة الشخصية',
  reveal: 'الصورة الكاملة',
};

const whiteboard: StyleModule<WhiteboardPlan> = {
  meta: STYLES.whiteboard,
  schema: WhiteboardPlanSchema as never,
  Video: WhiteboardVideo,
  fonts: ['700|Marhey', '600|Marhey'],
  tailSeconds: 1.8,
  cutaways: ['reveal', 'journey', 'band'],
  sfx: whiteboardSfx,
  localPlan: whiteboardLocalPlan,
  director: whiteboardDirector,
  sanitize: (plan, T) => {
    const { plan: fixed, issues } = snapIds(plan, T.words.map((w) => w.id));
    const parsed = WhiteboardPlanSchema.safeParse(fixed);
    if (!parsed.success) return { plan, issues: [...issues, ...parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)] };
    return { plan: parsed.data, issues };
  },
  scenes: (plan) => {
    const texts = listTexts({ scenes: plan.items });
    return [
      { at: plan.title.from, beat: 'title', label: 'العنوان', texts: [{ path: 'title.text', label: 'العنوان', value: plan.title.text }] },
      ...plan.items.map((b, i) => ({ at: b.from, beat: b.kind, label: LABELS[b.kind], texts: texts.filter((t) => t.scene === i).map((t) => ({ path: t.path.replace(/^scenes/, 'items'), label: t.label, value: t.value })) })),
    ];
  },
};

export default whiteboard;
