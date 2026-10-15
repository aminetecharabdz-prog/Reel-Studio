import { useState } from 'react';
import { Shell } from '../ui/Shell';
import { Btn, Card, Field, I, Seg, Spinner, Toggle, cx, inputCls } from '../ui/kit';
import { Recorder } from '../ui/Recorder';
import { go } from '../router';
import { putAsset, putProject, uid } from '@/data/db';
import type { Project } from '@/data/project';
import { useSettings } from '@/data/settings';
import { writeScript } from '@/ai/script';

type Mode = Project['mode'];
const MODES: Array<{ v: Mode; title: string; body: string; icon: typeof I.bag }> = [
  { v: 'content', title: 'محتوى / شورتس', body: 'فكرة، نصيحة، قصة، شرح. صوتك أو نص مكتوب.', icon: I.text },
  { v: 'product', title: 'إعلان منتوج', body: 'صور المنتوج + السعر + العرض. إعلان يبيع.', icon: I.bag },
  { v: 'talking', title: 'فيديو شخص يتكلّم', body: 'فيديو وجهك + عناوين ورسومات حولك.', icon: I.user },
];
const MOODS = ['فاخر وهادئ', 'حماسي وسريع', 'عصري تقني', 'دافئ وعائلي', 'جريء وملوّن', 'سينمائي'];

export const New = ({ q }: { q: URLSearchParams }) => {
  const s = useSettings();
  const [mode, setMode] = useState<Mode | null>((q.get('mode') as Mode) || null);
  const [script, setScript] = useState('');
  const [title, setTitle] = useState('');
  const [voice, setVoice] = useState<Blob | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [product, setProduct] = useState({ name: '', price: '', offer: '' });
  const [moods, setMoods] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState<'write' | 'record' | 'upload'>('write');
  const [aspect, setAspect] = useState(s.defaults.aspect);
  const [endCard, setEndCard] = useState(s.endCard);
  const [cta, setCta] = useState(s.brand.cta);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [err, setErr] = useState('');

  const aiWrite = async () => {
    setErr('');
    if (!s.keys.claude) return setErr('كتابة النص بالذكاء الاصطناعي تحتاج مفتاح Claude في الإعدادات.');
    setAiBusy(true);
    try {
      const brief = mode === 'product' ? `Product: ${product.name}. Price: ${product.price}. Offer: ${product.offer}. Notes: ${notes || script}` : `Topic/notes: ${script || notes || title}`;
      const r = await writeScript({ key: s.keys.claude, model: s.claudeModel, brief, language: s.defaults.language, mode: mode ?? 'content' });
      setScript(r.script);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  };

  const ready = mode === 'talking' ? !!video : source === 'write' ? script.trim().split(/\s+/).length >= 4 : !!voice;

  const submit = async () => {
    if (!mode) return;
    setBusy(true);
    setErr('');
    try {
      const id = uid('p_');
      const now = Date.now();
      const media = await Promise.all(photos.map(async (f, i) => ({ assetId: await putAsset(f, f.name), label: product.name ? `${product.name} photo ${i + 1}` : `photo ${i + 1}` })));
      const p: Project = {
        id, mode, createdAt: now, updatedAt: now, status: 'draft',
        title: title.trim() || product.name || script.trim().split(/\s+/).slice(0, 5).join(' ') || 'فيديو جديد',
        script: script.trim(),
        notes: [moods.join('، '), notes].filter(Boolean).join(' — '),
        voiceAsset: voice && mode !== 'talking' ? await putAsset(voice, 'voice') : undefined,
        videoAsset: video ? await putAsset(video, video.name) : undefined,
        media,
        product: mode === 'product' ? product : undefined,
        history: [], images: {}, cost: 0,
        options: { aspect, captions: mode === 'talking' ? true : s.defaults.captions, music: s.defaults.music, musicVolume: s.defaults.musicVolume, sfx: s.defaults.sfx, digits: s.defaults.digits, endCard, cta, handle: s.brand.handle, phone: s.brand.phone },
      };
      await putProject(p);
      go(`/p/${id}?run=1`);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  if (!mode)
    return (
      <Shell active="new">
        <h1 className="mt-8 font-ar text-[34px] font-black">واش نصنعو اليوم؟</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {MODES.map((m) => (
            <button key={m.v} data-testid={`mode-${m.v}`} onClick={() => setMode(m.v)} className="group rounded-[28px] border border-line bg-panel p-6 text-start transition hover:border-violet/70">
              <span className="grid h-14 w-14 place-items-center rounded-2xl grad-bg text-white"><m.icon size={26} /></span>
              <h2 className="mt-5 font-ar text-[21px] font-extrabold">{m.title}</h2>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{m.body}</p>
            </button>
          ))}
        </div>
      </Shell>
    );

  const cur = MODES.find((m) => m.v === mode)!;
  return (
    <Shell active="new">
      <div className="mx-auto max-w-2xl pb-10">
        <button onClick={() => setMode(null)} className="mt-6 flex items-center gap-1.5 text-[14px] text-muted"><I.back size={16} /> {cur.title}</button>
        <h1 className="mt-3 font-ar text-[30px] font-black">{mode === 'product' ? 'عرّفنا بالمنتوج' : mode === 'talking' ? 'ارفع فيديو وجهك' : 'قل فكرتك'}</h1>

        <div className="mt-6 space-y-5">
          {mode === 'product' && (
            <Card className="space-y-4">
              <Field label="صور المنتوج" hint="صورة واضحة على خلفية بسيطة تعطي أحسن نتيجة. نقطعو الخلفية وحدنا.">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-ink py-6 text-muted hover:border-violet">
                  <I.upload /> اختر الصور
                  <input data-testid="photos" type="file" accept="image/*" multiple className="hidden" onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files ?? [])].slice(0, 6))} />
                </label>
              </Field>
              {photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {photos.map((f, i) => (
                    <div key={i} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line">
                      <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => setPhotos(photos.filter((_, k) => k !== i))} className="absolute top-1 end-1 grid h-6 w-6 place-items-center rounded-full bg-black/70"><I.x size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="اسم المنتوج"><input className={inputCls} value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} placeholder="لوحة حائط" /></Field>
                <Field label="السعر"><input className={inputCls} value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} placeholder="2900 دج" /></Field>
                <Field label="العرض"><input className={inputCls} value={product.offer} onChange={(e) => setProduct({ ...product, offer: e.target.value })} placeholder="توصيل 58 ولاية" /></Field>
              </div>
            </Card>
          )}

          {mode === 'talking' && (
            <Card>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-ink py-10 text-muted hover:border-violet">
                <I.upload size={28} />
                {video ? <span className="text-text">{video.name}</span> : 'اختر فيديو (عمودي أحسن)'}
                <input data-testid="video" type="file" accept="video/*" className="hidden" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
              </label>
            </Card>
          )}

          <Card className="space-y-4">
            {mode !== 'talking' && (
              <Seg value={source} onChange={setSource} options={[{ v: 'write', label: 'نكتب النص' }, { v: 'record', label: 'نسجّل صوتي' }, { v: 'upload', label: 'نرفع تسجيل' }]} />
            )}
            {mode !== 'talking' && source === 'record' && <Recorder onDone={setVoice} />}
            {mode !== 'talking' && source === 'upload' && (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-ink py-6 text-muted hover:border-violet">
                <I.upload /> {voice ? 'تم اختيار التسجيل' : 'اختر ملف صوتي'}
                <input type="file" accept="audio/*,video/*" className="hidden" onChange={(e) => setVoice(e.target.files?.[0] ?? null)} />
              </label>
            )}
            {voice && source !== 'write' && <audio controls src={URL.createObjectURL(voice)} className="w-full" />}
            <Field
              label={source === 'write' || mode === 'talking' ? 'النص' : 'نص الكلام (اختياري، يساعد بدون مفتاح ElevenLabs)'}
              hint={source === 'write' && mode !== 'talking' ? (s.keys.elevenlabs ? 'نحوّلو النص لصوت طبيعي.' : 'بدون مفتاح ElevenLabs يكون الفيديو بالموسيقى والكتابة فقط.') : undefined}
            >
              <textarea data-testid="script" dir="auto" rows={6} className={cx(inputCls, 'leading-[1.9]')} value={script} onChange={(e) => setScript(e.target.value)} placeholder="مثال: عندك فكرة قوية ومنتوج مليح بزاف… بصح الناس ما يشوفوكش." />
            </Field>
            <Btn kind="soft" size="sm" onClick={aiWrite} disabled={aiBusy} icon={aiBusy ? <Spinner size={14} /> : <I.wand size={16} />}>{script ? 'حسّن النص بالذكاء الاصطناعي' : 'اكتب لي النص بالذكاء الاصطناعي'}</Btn>
          </Card>

          <Card className="space-y-4">
            <Field label="الإحساس اللي تحب (اختياري)" hint="الذكاء الاصطناعي يقرّر كل شيء، هذا غير توجيه.">
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button key={m} type="button" onClick={() => setMoods(moods.includes(m) ? moods.filter((x) => x !== m) : [...moods, m])} className={cx('rounded-full border px-3.5 py-1.5 text-[13.5px] transition', moods.includes(m) ? 'border-violet bg-violet/20 text-text' : 'border-line text-muted')}>{m}</button>
                ))}
              </div>
            </Field>
            <Field label="ملاحظات للمخرج"><input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثلا: جمهوري شباب، نحب الأخضر" /></Field>
            <Field label="الشكل">
              <Seg value={aspect} onChange={setAspect} options={[{ v: '9:16', label: 'ريلز 9:16' }, { v: '4:5', label: 'منشور 4:5' }, { v: '1:1', label: 'مربع' }, { v: '16:9', label: 'يوتيوب' }]} />
            </Field>
            <Toggle on={endCard} onChange={setEndCard} label="بطاقة نهاية (دعوة + حساب/هاتف)" />
            {endCard && <Field label="جملة الدعوة"><input className={inputCls} value={cta} onChange={(e) => setCta(e.target.value)} placeholder="اطلب دروك" /></Field>}
            <Field label="عنوان المشروع (اختياري)"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          </Card>

          {!s.keys.claude && (
            <p className="rounded-2xl border border-sun/30 bg-sun/10 p-4 text-[13.5px] leading-relaxed text-sun">
              بدون مفتاح Claude نخدمو بالمخرج المحلي (كتابة متحركة فقط). للنتيجة الاحترافية الكاملة زيد المفاتيح في <a href="#/settings" className="underline">الإعدادات</a>.
            </p>
          )}
          {err && <p className="text-[14px] text-coral">{err}</p>}
          <Btn size="lg" className="w-full" data-testid="generate" disabled={!ready || busy} onClick={submit} icon={busy ? <Spinner /> : <I.spark size={20} />}>اصنع الفيديو</Btn>
        </div>
      </div>
    </Shell>
  );
};
