import type { Project } from '@/lib/schema/project';
import type { CompiledReel } from '@/lib/timing/types';
import { PRIMITIVES, type PrimitiveId, type Scene } from '@/lib/schema/plan';
import { TRANSITIONS } from '@/lib/schema/dna';
import { PRIMITIVE_AR, TRANSITION_AR } from '@/lib/director/primitiveNames';
import { Button, Input, Label, Panel, Segmented, Toggle, cx } from '../../components/ui';
import { regenerateScene } from '@/lib/studio';
import { useState } from 'react';

const FAMILY_AR: Record<keyof typeof PRIMITIVES, string> = { text: 'نصوص', data: 'بيانات', media: 'صور', graphic: 'رسوم', structure: 'هيكل', ad: 'إعلان' };
const FAMILY_COLOR: Record<keyof typeof PRIMITIVES, string> = { text: '#B49CFF', data: '#3CE3B4', media: '#FFB86B', graphic: '#FF3E7A', structure: '#8FB8FF', ad: '#FFD84D' };
const familyOf = (p: PrimitiveId) => (Object.keys(PRIMITIVES) as Array<keyof typeof PRIMITIVES>).find((f) => (PRIMITIVES[f] as readonly string[]).includes(p))!;

export const ScenesTab = ({ project, reel, selected, onSelect, onChange }: { project: Project; reel: CompiledReel | null; selected: string | null; onSelect: (id: string) => void; onChange: (p: Project) => void }) => {
  const plan = project.plan!;
  const words = project.transcript!.words;
  const idx = new Map(words.map((w, i) => [w.id, i]));
  const sel = plan.scenes.find((s) => s.id === selected) ?? null;
  const [busy, setBusy] = useState(false);
  const total = reel?.durationInFrames ?? 1;

  const update = (id: string, f: (s: Scene) => Scene) => onChange({ ...project, plan: { ...plan, scenes: plan.scenes.map((s) => (s.id === id ? f(s) : s)) } });
  const moveStart = (id: string, delta: number) => {
    const i = plan.scenes.findIndex((s) => s.id === id);
    if (i <= 0) return;
    const s = plan.scenes[i]!;
    const prev = plan.scenes[i - 1]!;
    const newFrom = idx.get(s.from)! + delta;
    if (newFrom <= idx.get(prev.from)! || newFrom > idx.get(s.to)!) return;
    const scenes = plan.scenes.map((x, k) => (k === i ? { ...x, from: words[newFrom]!.id } : k === i - 1 ? { ...x, to: words[newFrom - 1]!.id } : x));
    onChange({ ...project, plan: { ...plan, scenes } });
  };

  return (
    <div className="space-y-4">
      {/* timeline strip: widths proportional to duration, colour = primitive family */}
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex min-w-full gap-1" style={{ width: `${Math.max(100, plan.scenes.length * 14)}%` }}>
          {plan.scenes.map((s, i) => {
            const cs = reel?.scenes.find((c) => c.id === s.id);
            const w = cs ? (cs.duration / total) * 100 : 100 / plan.scenes.length;
            const fam = familyOf(s.primitive);
            return (
              <button key={s.id} onClick={() => onSelect(s.id)} data-testid="scene-chip" className={cx('flex h-16 min-w-14 flex-col justify-between rounded-xl p-1.5 text-right ring-2 transition', selected === s.id ? 'ring-ink' : 'ring-transparent')} style={{ width: `${w}%`, backgroundColor: `${FAMILY_COLOR[fam]}26` }}>
                <span className="text-[11px] font-bold" style={{ color: FAMILY_COLOR[fam] }}>{i + 1}</span>
                <span className="truncate text-[11px] text-ink">{s.content.headline || PRIMITIVE_AR[s.primitive]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!sel && <Panel className="text-muted">اضغط على مشهد في الشريط لتعديله. كل مشهد مربوط بالكلمات التي تُقال فيه.</Panel>}

      {sel && (
        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-[19px] font-bold">المشهد {plan.scenes.indexOf(sel) + 1}: {PRIMITIVE_AR[sel.primitive]}</div>
            <Button size="sm" variant="soft" disabled={busy || sel.locked} onClick={async () => { setBusy(true); try { onChange(await regenerateScene(project, sel.id)); } finally { setBusy(false); } }}>أعد توليد المشهد</Button>
          </div>
          <div className="rounded-xl bg-raised p-3 text-[15px] leading-7" dir="rtl">
            <span className="text-muted">يُقال: </span>
            {words.slice(idx.get(sel.from)!, idx.get(sel.to)! + 1).map((w) => w.text).join(' ')}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">بداية المشهد:</span>
            <Button size="sm" variant="ghost" onClick={() => moveStart(sel.id, -1)}>كلمة قبل</Button>
            <Button size="sm" variant="ghost" onClick={() => moveStart(sel.id, 1)}>كلمة بعد</Button>
          </div>
          <div>
            <Label>الشكل</Label>
            <select value={sel.primitive} onChange={(e) => update(sel.id, (s) => ({ ...s, primitive: e.target.value as PrimitiveId }))} className="h-12 w-full rounded-xl border border-line bg-raised px-3 text-[16px]">
              {(Object.keys(PRIMITIVES) as Array<keyof typeof PRIMITIVES>).map((f) => (
                <optgroup key={f} label={FAMILY_AR[f]}>
                  {PRIMITIVES[f].map((p) => <option key={p} value={p}>{PRIMITIVE_AR[p]}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <Label>التنويعة</Label>
            <Segmented value={String(sel.variant)} options={[{ value: '0', label: '١' }, { value: '1', label: '٢' }, { value: '2', label: '٣' }]} onChange={(v) => update(sel.id, (s) => ({ ...s, variant: Number(v) }))} />
          </div>
          <div>
            <Label hint="يبقى قصيرًا: 1–5 كلمات مما قيل">العنوان على الشاشة</Label>
            <Input value={sel.content.headline ?? ''} onChange={(e) => update(sel.id, (s) => ({ ...s, content: { ...s.content, headline: e.target.value } }))} />
          </div>
          <div>
            <Label>نص ثانوي</Label>
            <Input value={sel.content.sub ?? ''} onChange={(e) => update(sel.id, (s) => ({ ...s, content: { ...s.content, sub: e.target.value || undefined } }))} />
          </div>
          {(sel.content.value !== undefined || ['big-number', 'donut-chart', 'progress-ring', 'icon-array', 'gauge', 'split-flap'].includes(sel.primitive)) && (
            <div className="grid grid-cols-2 gap-2">
              <div><Label>الرقم</Label><Input inputMode="decimal" value={sel.content.value ?? ''} onChange={(e) => update(sel.id, (s) => ({ ...s, content: { ...s.content, value: e.target.value === '' ? undefined : Number(e.target.value) } }))} /></div>
              <div><Label>الوحدة</Label><Input value={sel.content.unit ?? ''} onChange={(e) => update(sel.id, (s) => ({ ...s, content: { ...s.content, unit: e.target.value || undefined } }))} /></div>
            </div>
          )}
          {(sel.content.price !== undefined || sel.primitive === 'price-tag') && (
            <div className="grid grid-cols-2 gap-2">
              <div><Label>السعر</Label><Input inputMode="numeric" value={sel.content.price ?? ''} onChange={(e) => update(sel.id, (s) => ({ ...s, content: { ...s.content, price: e.target.value === '' ? undefined : Number(e.target.value) } }))} /></div>
              <div><Label>السعر القديم</Label><Input inputMode="numeric" value={sel.content.oldPrice ?? ''} onChange={(e) => update(sel.id, (s) => ({ ...s, content: { ...s.content, oldPrice: e.target.value === '' ? undefined : Number(e.target.value) } }))} /></div>
            </div>
          )}
          {sel.content.items && sel.content.items.length > 0 && (
            <div className="space-y-2">
              <Label>العناصر</Label>
              {sel.content.items.map((it, k) => (
                <Input key={k} value={it.text} onChange={(e) => update(sel.id, (s) => ({ ...s, content: { ...s.content, items: s.content.items!.map((x, j) => (j === k ? { ...x, text: e.target.value } : x)) } }))} />
              ))}
            </div>
          )}
          <div>
            <Label>الانتقال</Label>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {TRANSITIONS.map((tr) => (
                <button key={tr} onClick={() => update(sel.id, (s) => ({ ...s, transition: tr }))} className={cx('h-9 flex-none rounded-full px-3 text-sm font-bold ring-1', sel.transition === tr ? 'bg-ink text-night ring-ink' : 'ring-line')}>{TRANSITION_AR[tr]}</button>
              ))}
            </div>
          </div>
          <Toggle checked={sel.locked} onChange={(v) => update(sel.id, (s) => ({ ...s, locked: v }))} label="ثبّت هذا المشهد (لا يتغير عند إعادة التوليد)" />
        </Panel>
      )}
    </div>
  );
};
