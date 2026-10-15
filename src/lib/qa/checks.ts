/**
 * Deterministic QA on the plan + compiled reel (SPEC §8.1, video-qa skill). Each check returns
 * issues; autoFixPlan() repairs what can be repaired and the loop re-checks (max 2 passes).
 */
import type { Plan, Scene } from '../schema/plan';
import type { QAIssue } from '../schema/project';
import type { Transcript } from '../schema/transcript';
import type { CompiledReel } from '../timing/types';
import { msToFrame } from '../timing/frames';
import { contrast } from '../color/contrast';
import { PRIMITIVE_META } from '../director/primitiveMeta';

const need = (s: Scene): string | null => {
  const c = s.content;
  switch (s.primitive) {
    case 'big-number': case 'donut-chart': case 'progress-ring': case 'icon-array': case 'gauge': case 'split-flap':
      return c.value === undefined && !(s.primitive === 'split-flap' && c.headline) ? 'needs a value' : null;
    case 'price-tag':
      return c.price === undefined && c.value === undefined ? 'needs a price' : null;
    case 'versus': case 'before-after':
      return (c.items?.length ?? 0) < 2 && (c.images?.length ?? 0) < 2 ? 'needs two sides' : null;
    case 'stacked-list': case 'checklist': case 'steps': case 'timeline': case 'icon-grid': case 'do-dont': case 'bar-chart': case 'line-chart':
      return (c.items?.length ?? 0) < 2 ? 'needs ≥2 items' : null;
    case 'feature-callouts': case 'callout-arrows':
      return (c.items?.length ?? 0) < 1 ? 'needs items' : null;
    case 'rating':
      return c.rating === undefined ? 'needs a real rating' : null;
    case 'end-card':
      return null;
    default:
      return !c.headline && !c.items?.length && !c.image && c.value === undefined && c.price === undefined && c.wilayas === undefined ? 'has no content' : null;
  }
};

export const checkPlan = (plan: Plan, t: Transcript, mode: 'A' | 'B' | 'C'): QAIssue[] => {
  const issues: QAIssue[] = [];
  const order = new Map(t.words.map((w, i) => [w.id, i]));
  let prevTo = -1;
  plan.scenes.forEach((s, i) => {
    const a = order.get(s.from);
    const b = order.get(s.to);
    if (a === undefined || b === undefined) issues.push({ check: 'anchors', severity: 'error', sceneId: s.id, message: `المشهد ${i + 1}: كلمة البداية/النهاية غير موجودة`, fixed: false });
    else {
      if (a > b) issues.push({ check: 'anchors', severity: 'error', sceneId: s.id, message: `المشهد ${i + 1}: البداية بعد النهاية`, fixed: false });
      if (a !== prevTo + 1) issues.push({ check: 'coverage', severity: 'error', sceneId: s.id, message: `المشهد ${i + 1} لا يبدأ بعد المشهد السابق مباشرة`, fixed: false });
      prevTo = b;
      const inRange = (id?: string) => !id || (order.has(id) && order.get(id)! >= a && order.get(id)! <= (plan.scenes[i + 1] ? order.get(plan.scenes[i + 1]!.from)! - 1 : t.words.length - 1));
      const c = s.content;
      const bad = [c.headlineAt, c.valueAt, ...(c.items ?? []).map((it) => it.at), ...s.emphasis].filter((id) => !inRange(id));
      if (bad.length) issues.push({ check: 'anchors', severity: 'warning', sceneId: s.id, message: `المشهد ${i + 1}: عناصر مربوطة بكلمات خارج المشهد`, fixed: false });
    }
    const n = need(s);
    if (n) issues.push({ check: 'content', severity: 'error', sceneId: s.id, message: `المشهد ${i + 1} (${s.primitive}) ${n}`, fixed: false });
    const modes = PRIMITIVE_META[s.primitive].modes;
    if (modes && !modes.includes(mode) && !s.content.image) issues.push({ check: 'mode', severity: 'warning', sceneId: s.id, message: `${s.primitive} مخصص لوضع آخر`, fixed: false });
    const prev = plan.scenes[i - 1];
    if (prev && prev.primitive === s.primitive && prev.variant === s.variant) issues.push({ check: 'repetition', severity: 'warning', sceneId: s.id, message: `نفس الشكل مرتين متتاليتين (${s.primitive})`, fixed: false });
  });
  if (prevTo !== t.words.length - 1) issues.push({ check: 'coverage', severity: 'error', message: 'بعض الكلمات في الآخر بلا مشهد', fixed: false });
  const counts = new Map<string, number>();
  for (const s of plan.scenes) counts.set(s.primitive, (counts.get(s.primitive) ?? 0) + 1);
  for (const [p, n] of counts) if (n > 3 && p !== 'end-card') issues.push({ check: 'repetition', severity: 'warning', message: `${p} مستعمل ${n} مرات`, fixed: false });
  return issues;
};

export const checkReel = (reel: CompiledReel, t: Transcript): QAIssue[] => {
  const issues: QAIssue[] = [];
  const fps = reel.fps;
  // timing
  reel.scenes.forEach((s, i) => {
    if (s.duration < 12) issues.push({ check: 'scene-length', severity: 'error', sceneId: s.id, message: `المشهد ${i + 1} قصير جدًا (${s.duration} إطار)`, fixed: false });
    const next = reel.scenes[i + 1];
    if (next && s.from + s.duration !== next.from) issues.push({ check: 'empty-frames', severity: 'error', sceneId: s.id, message: `فراغ بين المشهد ${i + 1} والذي بعده`, fixed: false });
    if (s.duration > 7 * fps && !s.isEndCard) issues.push({ check: 'static', severity: 'warning', sceneId: s.id, message: `المشهد ${i + 1} طويل (${(s.duration / fps).toFixed(1)} ث) — قسّمه لتفادي الملل`, fixed: false });
  });
  if (reel.scenes[0] && reel.scenes[0].from !== 0) issues.push({ check: 'empty-frames', severity: 'error', message: 'بداية الفيديو بلا مشهد', fixed: false });
  // captions: every word exactly once, drift ≤ 1 frame
  if (reel.captionSettings.enabled && reel.mode !== 'C') {
    const ids = reel.captions.flatMap((c) => c.words.map((w) => w.id));
    if (ids.length !== t.words.length || ids.some((id, i) => id !== t.words[i]!.id)) issues.push({ check: 'caption-coverage', severity: 'error', message: 'بعض الكلمات ناقصة أو مكررة في الكابشن', fixed: false });
    const byId = new Map(t.words.map((w) => [w.id, w]));
    let maxDrift = 0;
    for (const c of reel.captions) for (const w of c.words) maxDrift = Math.max(maxDrift, Math.abs(w.start - msToFrame(byId.get(w.id)!.startMs, fps)));
    if (maxDrift > 1) issues.push({ check: 'caption-drift', severity: 'error', message: `انحراف الكابشن ${maxDrift} إطار`, fixed: false });
    for (let i = 1; i < reel.captions.length; i++) if (reel.captions[i]!.from < reel.captions[i - 1]!.to) issues.push({ check: 'caption-overlap', severity: 'error', message: 'سطران من الكابشن يظهران معًا', fixed: false });
  }
  // readability
  const cs = reel.captionSettings;
  if (cs.sizePx < 42) issues.push({ check: 'font-size', severity: 'error', message: 'حجم الكابشن أصغر من 42px', fixed: false });
  const p = reel.dna.palette;
  for (const bg of [...p.bg, p.surface]) if (contrast(p.text, bg) < 4.5) issues.push({ check: 'contrast', severity: 'error', message: `تباين النص ${contrast(p.text, bg).toFixed(1)}:1 أقل من 4.5`, fixed: false });
  if (cs.color && !['pill', 'block', 'gradient'].includes(cs.style)) for (const bg of p.bg) if (contrast(cs.color, bg) < 3) issues.push({ check: 'contrast', severity: 'warning', message: 'لون الكابشن ضعيف التباين مع الخلفية', fixed: false });
  // assets
  if (!reel.voice && reel.video.length === 0) issues.push({ check: 'assets', severity: 'error', message: 'لا يوجد صوت', fixed: false });
  reel.scenes.forEach((s, i) => s.images.forEach((im) => { if (!im) issues.push({ check: 'assets', severity: 'warning', sceneId: s.id, message: `صورة المشهد ${i + 1} غير متوفرة — تم استعمال رسم بديل`, fixed: false }); }));
  return issues;
};

/** Repair what can be repaired automatically. Returns the fixed plan and the list of fixes. */
export const autoFixPlan = (plan: Plan, t: Transcript, issues: QAIssue[]): { plan: Plan; fixed: QAIssue[] } => {
  const next: Plan = structuredClone(plan);
  const fixed: QAIssue[] = [];
  const order = new Map(t.words.map((w, i) => [w.id, i]));
  // rebuild contiguity from scene starts
  next.scenes = next.scenes.filter((s) => order.has(s.from) && order.has(s.to)).sort((a, b) => order.get(a.from)! - order.get(b.from)!);
  if (next.scenes.length && next.scenes[0]!.from !== t.words[0]!.id) next.scenes[0]!.from = t.words[0]!.id;
  next.scenes.forEach((s, i) => {
    const n = next.scenes[i + 1];
    s.to = n ? t.words[order.get(n.from)! - 1]!.id : t.words[t.words.length - 1]!.id;
  });
  for (const iss of issues) {
    const s = next.scenes.find((x) => x.id === iss.sceneId);
    if (iss.check === 'content' && s) {
      const words = t.words.slice(order.get(s.from)!, order.get(s.to)! + 1);
      s.primitive = 'kinetic-headline';
      s.content = { ...s.content, headline: s.content.headline || words.slice(0, 4).map((w) => w.text).join(' '), headlineAt: words[0]?.id };
      fixed.push({ ...iss, fixed: true });
    } else if (iss.check === 'anchors' && s) {
      const a = order.get(s.from)!, b = order.get(s.to)!;
      const ok = (id?: string) => (id && order.has(id) && order.get(id)! >= a && order.get(id)! <= b ? id : undefined);
      s.content.headlineAt = ok(s.content.headlineAt);
      s.content.valueAt = ok(s.content.valueAt);
      s.content.items = s.content.items?.map((it) => ({ ...it, at: ok(it.at) }));
      s.emphasis = s.emphasis.filter((id) => ok(id));
      fixed.push({ ...iss, fixed: true });
    } else if (iss.check === 'repetition' && s) {
      s.variant = (s.variant + 1) % 3;
      fixed.push({ ...iss, fixed: true });
    } else if (iss.check === 'coverage') {
      fixed.push({ ...iss, fixed: true });
    }
  }
  // merge scenes that would be shorter than 12 frames at 30 fps (≈400 ms)
  for (let i = next.scenes.length - 1; i > 0; i--) {
    const s = next.scenes[i]!;
    const dur = t.words[order.get(s.to)!]!.endMs - t.words[order.get(s.from)!]!.startMs;
    if (dur < 420) {
      next.scenes[i - 1]!.to = s.to;
      next.scenes.splice(i, 1);
      fixed.push({ check: 'scene-length', severity: 'warning', sceneId: s.id, message: 'دُمج مشهد قصير جدًا مع الذي قبله', fixed: true });
    }
  }
  return { plan: next, fixed };
};
