import { useEffect, useState } from 'react';
import type { Project } from '@/lib/schema/project';
import { CAPTION_STYLES, type CaptionStyleId } from '@/lib/schema/plan';
import { BACKGROUND_KINDS, EASINGS } from '@/lib/schema/dna';
import { ARABIC_FONTS, ensureFonts, familyOf } from '@/lib/design/fonts';
import { finalizeDNA, designDNA, VISUAL_STYLES } from '@/lib/design/artDirector';
import { detectTopic } from '@/lib/design/topics';
import { MUSIC } from '@/lib/audio/library';
import { Button, Chip, Input, Label, Panel, Segmented, Textarea, Toggle } from '../../components/ui';
import { CaptionSample } from '../../components/CaptionSample';
import { useReel } from '../../useProject';

export const CAPTION_AR: Record<CaptionStyleId, string> = { pill: 'كبسولة', block: 'كتلة', karaoke: 'كاريوكي', 'word-pop': 'كلمة تقفز', outline: 'محدّد', gradient: 'متدرّج', 'boxed-keyword': 'كلمة في صندوق', minimal: 'بسيط' };
const EASING_AR: Record<string, string> = { snappy: 'حاد وسريع', smooth: 'ناعم', bouncy: 'مرن', mechanical: 'ميكانيكي', elastic: 'مطّاطي' };
const BG_AR: Record<string, string> = { solid: 'لون واحد', gradient: 'تدرّج', mesh: 'ميش', grain: 'حبيبات', pattern: 'نقشة', 'photo-blur': 'صورة ضبابية', '3d-room': 'غرفة ثلاثية' };

const FontOption = ({ id, sample, active, onClick }: { id: string; sample: string; active: boolean; onClick: () => void }) => {
  const [ok, setOk] = useState(false);
  useEffect(() => { ensureFonts([{ id, weight: 700 }]).then(() => setOk(true)).catch(() => undefined); }, [id]);
  return (
    <button onClick={onClick} className={`flex-none rounded-2xl px-4 py-3 text-right ring-1 ${active ? 'bg-ink text-night ring-ink' : 'bg-raised ring-line'}`} style={{ fontFamily: `"${familyOf(id)}"`, fontWeight: 700, opacity: ok ? 1 : 0.5 }}>
      <div className="text-[20px] leading-8 whitespace-nowrap">{sample}</div>
      <div className="font-body text-[11px] opacity-70" style={{ fontFamily: 'var(--font-body)' }}>{familyOf(id)}</div>
    </button>
  );
};

export const StyleTab = ({ project, onChange, onReplan }: { project: Project; onChange: (p: Project) => void; onReplan: () => void }) => {
  const dna = project.dna!;
  const st = project.style;
  const cs = st.captions;
  const { reel } = useReel(project);
  const sample = project.transcript!.words.slice(0, 4).map((w) => w.text).join(' ');
  const setStyle = (patch: Partial<Project['style']>) => onChange({ ...project, style: { ...st, ...patch } });
  const setCaptions = (patch: Partial<typeof cs>) => setStyle({ captions: { ...cs, ...patch } });
  const setDNA = (f: (d: typeof dna) => typeof dna) => onChange({ ...project, dna: finalizeDNA(f(structuredClone(dna)), project.brand) });
  const shufflePalette = () => {
    const { topic } = detectTopic(project.transcript!.words.map((w) => w.text).join(' '), project.business);
    const fresh = designDNA({ topic, seed: Math.floor(Math.random() * 1e6), visualStyle: st.visualStyle === 'auto' ? undefined : st.visualStyle });
    setDNA((d) => ({ ...d, palette: fresh.palette }));
  };
  const colorKeys: Array<[keyof typeof dna.palette, string]> = [['primary', 'الأساسي'], ['accent', 'المميّز'], ['text', 'النص'], ['surface', 'البطاقات']];

  return (
    <div className="space-y-4">
      <Panel className="space-y-3">
        <Label hint="تتغير ألوان الفيديو كله بدون تغيير التوقيت">الألوان</Label>
        <div className="flex flex-wrap gap-3">
          {dna.palette.bg.map((c, i) => (
            <label key={`bg${i}`} className="flex flex-col items-center gap-1 text-[12px] text-muted">
              <input type="color" value={c} onChange={(e) => setDNA((d) => { d.palette.bg[i] = e.target.value; return d; })} className="h-11 w-11 cursor-pointer rounded-full border-2 border-line bg-transparent" />
              خلفية {i + 1}
            </label>
          ))}
          {colorKeys.map(([k, label]) => (
            <label key={k} className="flex flex-col items-center gap-1 text-[12px] text-muted">
              <input type="color" value={dna.palette[k] as string} onChange={(e) => setDNA((d) => { (d.palette[k] as string) = e.target.value; return d; })} className="h-11 w-11 cursor-pointer rounded-full border-2 border-line bg-transparent" />
              {label}
            </label>
          ))}
        </div>
        <Button size="sm" variant="soft" onClick={shufflePalette}>ألوان جديدة</Button>
      </Panel>

      <Panel className="space-y-3">
        <Label hint="بكلماتك أنت">خط العناوين</Label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {ARABIC_FONTS.map((f) => <FontOption key={f.id} id={f.id} sample={sample} active={dna.typography.display.family === f.id} onClick={() => setDNA((d) => { d.typography.display = { family: f.id, weight: f.weights[f.weights.length - 1]! }; return d; })} />)}
        </div>
        <Label>خط النصوص والكابشن</Label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {ARABIC_FONTS.map((f) => <FontOption key={f.id} id={f.id} sample={sample} active={dna.typography.captions.family === f.id} onClick={() => setDNA((d) => { d.typography.captions = { family: f.id, weight: f.weights[Math.max(0, f.weights.length - 2)]! }; d.typography.body = { family: f.id, weight: 500 }; return d; })} />)}
        </div>
      </Panel>

      <Panel className="space-y-3">
        <Label>الكابشن</Label>
        <Toggle checked={cs.enabled} onChange={(v) => setCaptions({ enabled: v })} label="أظهر الكابشن" />
        {cs.enabled && (
          <>
            <div className="overflow-hidden rounded-2xl"><CaptionSample project={project} reel={reel} /></div>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {CAPTION_STYLES.map((s) => <Chip key={s} active={cs.style === s} onClick={() => setCaptions({ style: s })}>{CAPTION_AR[s]}</Chip>)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الحجم</Label><input type="range" min={42} max={100} value={cs.sizePx} onChange={(e) => setCaptions({ sizePx: Number(e.target.value) })} className="w-full accent-[#FF3E7A]" /></div>
              <div><Label>الموضع</Label><input type="range" min={0.3} max={0.82} step={0.01} value={cs.position} onChange={(e) => setCaptions({ position: Number(e.target.value) })} className="w-full accent-[#FF3E7A]" /></div>
            </div>
            <div><Label>عدد الكلمات في السطر</Label><Segmented value={String(cs.wordsPerLine)} options={[2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }))} onChange={(v) => setCaptions({ wordsPerLine: Number(v) })} /></div>
            <div><Label>الحركة</Label><Segmented value={cs.animation} options={[{ value: 'pop', label: 'قفزة' }, { value: 'fade', label: 'تلاشي' }, { value: 'slide', label: 'انزلاق' }, { value: 'none', label: 'بدون' }]} onChange={(v) => setCaptions({ animation: v })} /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">لون النص <input type="color" value={cs.color ?? dna.palette.text} onChange={(e) => setCaptions({ color: e.target.value })} className="h-9 w-9 rounded-full" /></label>
              <label className="flex items-center gap-2 text-sm">الكلمة النشطة <input type="color" value={cs.activeColor ?? dna.palette.accent} onChange={(e) => setCaptions({ activeColor: e.target.value })} className="h-9 w-9 rounded-full" /></label>
            </div>
            <Toggle checked={cs.emphasizeKeywords} onChange={(v) => setCaptions({ emphasizeKeywords: v })} label="لوّن الكلمة المهمة في كل سطر" />
          </>
        )}
      </Panel>

      <Panel className="space-y-3">
        <Label>الحركة والخلفية</Label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">{EASINGS.map((e) => <Chip key={e} active={dna.motionLanguage.easing === e} onClick={() => setDNA((d) => { d.motionLanguage.easing = e; return d; })}>{EASING_AR[e]}</Chip>)}</div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">{BACKGROUND_KINDS.map((b) => <Chip key={b} active={dna.background.kind === b} onClick={() => setDNA((d) => { d.background.kind = b; return d; })}>{BG_AR[b]}</Chip>)}</div>
        <div><Label>الحبيبات (Grain)</Label><input type="range" min={0} max={1} step={0.05} value={dna.texture.grain} onChange={(e) => setDNA((d) => { d.texture.grain = Number(e.target.value); return d; })} className="w-full accent-[#FF3E7A]" /></div>
        <div><Label>استدارة الزوايا</Label><input type="range" min={0} max={70} value={dna.texture.corners} onChange={(e) => setDNA((d) => { d.texture.corners = Number(e.target.value); return d; })} className="w-full accent-[#FF3E7A]" /></div>
      </Panel>

      <Panel className="space-y-3">
        <Label hint="نفس الصوت ونفس المشاهد بمقاس آخر">المقاس</Label>
        <Segmented value={st.aspect} options={(['9:16', '4:5', '1:1', '16:9'] as const).map((a) => ({ value: a, label: a }))} onChange={(v) => setStyle({ aspect: v })} />
        <Label>الأرقام</Label>
        <Segmented value={st.digits} options={[{ value: 'western', label: '123' }, { value: 'eastern', label: '١٢٣' }]} onChange={(v) => setStyle({ digits: v })} />
        <Label>منطقة الأمان</Label>
        <Segmented value={st.safeZone} options={[{ value: 'instagram', label: 'إنستغرام' }, { value: 'tiktok', label: 'تيك توك' }, { value: 'youtube', label: 'يوتيوب' }, { value: 'none', label: 'بدون' }]} onChange={(v) => setStyle({ safeZone: v })} />
      </Panel>

      <Panel className="space-y-3">
        <Label>الصوت</Label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <Chip active={st.music.trackId === 'auto'} onClick={() => setStyle({ music: { ...st.music, trackId: 'auto' } })}>تلقائي</Chip>
          {MUSIC.map((m) => <Chip key={m.id} active={st.music.trackId === m.id} onClick={() => setStyle({ music: { ...st.music, trackId: m.id } })}>{m.title}</Chip>)}
          <Chip active={st.music.trackId === 'none'} onClick={() => setStyle({ music: { ...st.music, trackId: 'none' } })}>بدون موسيقى</Chip>
        </div>
        <div><Label hint="تنخفض تلقائيًا تحت صوتك">مستوى الموسيقى</Label><input type="range" min={0} max={1} step={0.05} value={st.music.volume} onChange={(e) => setStyle({ music: { ...st.music, volume: Number(e.target.value) } })} className="w-full accent-[#FF3E7A]" /></div>
        <Toggle checked={st.sfx.enabled} onChange={(v) => setStyle({ sfx: { ...st.sfx, enabled: v } })} label="مؤثرات صوتية" />
        {st.sfx.enabled && <input type="range" min={0.1} max={1} step={0.05} value={st.sfx.intensity} onChange={(e) => setStyle({ sfx: { ...st.sfx, intensity: Number(e.target.value) } })} className="w-full accent-[#FF3E7A]" />}
      </Panel>

      <Panel className="space-y-3">
        <Label hint="اتركها فارغة = بدون بطاقة">البطاقة الأخيرة</Label>
        <Toggle checked={st.endCard.enabled} onChange={(v) => setStyle({ endCard: { ...st.endCard, enabled: v } })} label="أظهر البطاقة الأخيرة" />
        {st.endCard.enabled && (
          <div className="grid gap-2">
            <Input placeholder="جملة الدعوة (مثلاً: اطلب دروك)" value={st.endCard.cta} onChange={(e) => setStyle({ endCard: { ...st.endCard, cta: e.target.value } })} />
            <Input placeholder="@الحساب" dir="ltr" value={st.endCard.handle} onChange={(e) => setStyle({ endCard: { ...st.endCard, handle: e.target.value } })} />
            <Input placeholder="رقم الهاتف" dir="ltr" inputMode="tel" value={st.endCard.phone} onChange={(e) => setStyle({ endCard: { ...st.endCard, phone: e.target.value } })} />
            <Input placeholder="الموقع" dir="ltr" value={st.endCard.website} onChange={(e) => setStyle({ endCard: { ...st.endCard, website: e.target.value } })} />
          </div>
        )}
      </Panel>

      <Panel className="space-y-3">
        <Label hint="يعيد تصميم الفيديو كاملًا (نفس الصوت)">ستايل جديد بالكامل</Label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip active={st.visualStyle === 'auto'} onClick={() => setStyle({ visualStyle: 'auto' })}>تلقائي</Chip>
          {Object.entries(VISUAL_STYLES).map(([k, v]) => <Chip key={k} active={st.visualStyle === k} onClick={() => setStyle({ visualStyle: k })}>{v.label}</Chip>)}
        </div>
        <Textarea placeholder="وصف حر: مثلاً «داكن وسينمائي مع لمسات ذهبية»" value={st.artDirection} onChange={(e) => setStyle({ artDirection: e.target.value })} />
        <div><Label>الإيقاع</Label><Segmented value={st.pacing} options={[{ value: 'auto', label: 'تلقائي' }, { value: 'fast', label: 'سريع' }, { value: 'normal', label: 'عادي' }, { value: 'calm', label: 'هادئ' }]} onChange={(v) => setStyle({ pacing: v })} /></div>
        <Button onClick={onReplan}>طبّق وأعد التصميم</Button>
      </Panel>
    </div>
  );
};
