/** Studio step 3 inputs: «اكتب لي» script writer, voice upload/recording, talking-head video upload, product photos. */
import { useEffect, useRef, useState } from 'react';
import { putAsset, deleteAsset, shrinkImage, useAssetUrls } from '@/data/assets';
import { hasClaude } from '@/lib/providers/claude';
import { writeScript } from '@/lib/scriptwriter';
import { Icon } from '@/ui/Icon';
import { Badge, Button, Field, Textarea } from '@/ui/kit';
import type { Wizard } from './state';

type P = { w: Wizard; setW: (w: Wizard) => void };

export const WriteForMe = ({ w, setW }: P) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const go = async () => {
    setBusy(true);
    setErr('');
    try {
      const pr = w.content.product;
      const out = await writeScript({
        goal: w.goal ?? 'free',
        lang: w.content.scriptLang,
        topic: w.content.topic,
        product: w.goal === 'ad' ? { name: pr.name, price: pr.price ? `${pr.price} دج` : '', oldPrice: pr.oldPrice ? `${pr.oldPrice} دج` : '', offer: pr.offer, delivery58: pr.delivery58, cod: pr.cod, whatsapp: pr.whatsapp } : null,
        seconds: w.settings.duration,
      });
      setW({ ...w, content: { ...w.content, script: out.script, source: 'script' }, production: w.production ? { ...w.production, hooks: out.hooks } : null });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <Button variant="spark" icon="wand" disabled={busy || (!w.content.topic.trim() && !w.content.product.name.trim())} onClick={go}>
        {busy ? 'نكتب...' : 'اكتب لي السكريبت'}
      </Button>
      <p className="text-[0.82rem] text-[var(--text-3)]">{hasClaude() ? 'يكتبه Claude بمفتاحك، ثم تعدّله كما تريد.' : 'بدون مفتاح Claude نكتب قالبًا جاهزًا تعدّله. أضف المفتاح من الإعدادات لنص أذكى.'}</p>
      {err && <p className="text-[var(--color-danger)]">{err}</p>}
    </div>
  );
};

const Recorder = ({ onDone }: { onDone: (b: Blob) => void }) => {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [sec, setSec] = useState(0);
  const chunks = useRef<Blob[]>([]);
  useEffect(() => {
    if (!rec) return;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [rec]);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = (e) => chunks.current.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        onDone(new Blob(chunks.current, { type: r.mimeType || 'audio/webm' }));
      };
      r.start();
      setSec(0);
      setRec(r);
    } catch {
      alert('لم نستطع فتح الميكروفون. اسمح للمتصفح باستعماله.');
    }
  };
  return rec ? (
    <Button
      variant="danger"
      icon="pause"
      onClick={() => {
        rec.stop();
        setRec(null);
      }}
    >
      أوقف التسجيل <span className="num">{sec}ث</span>
    </Button>
  ) : (
    <Button icon="mic" onClick={start}>
      سجّل الآن
    </Button>
  );
};

export const MediaInputs = ({ w, setW }: P) => {
  const isVoice = w.content.source === 'voice';
  const cur = isVoice ? w.content.voiceAsset : w.content.videoAsset;
  const urls = useAssetUrls([cur]);
  const save = async (b: Blob, name: string) => {
    const id = await putAsset(b, name);
    if (cur) await deleteAsset(cur);
    setW({ ...w, content: { ...w.content, ...(isVoice ? { voiceAsset: id } : { videoAsset: id }) } });
  };
  const url = cur ? urls[cur] : null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--line-strong)] p-6 text-center">
        <Icon name={isVoice ? 'mic' : 'camera'} size={30} className="text-[var(--color-spark)]" />
        <p className="text-[0.95rem]">{isVoice ? 'ارفع ملف صوت أو سجّل الآن.' : 'ارفع فيديو تتكلم فيه (عمودي أفضل). الرسومات تظهر حولك على كلماتك.'}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line-strong)] bg-[var(--surface)] px-5 font-display font-semibold">
            <Icon name="upload" size={19} />
            {isVoice ? 'ارفع صوتًا' : 'ارفع فيديو'}
            <input type="file" accept={isVoice ? 'audio/*' : 'video/*'} className="sr-only" onChange={(e) => e.target.files?.[0] && save(e.target.files[0], e.target.files[0].name)} />
          </label>
          {isVoice && <Recorder onDone={(b) => save(b, 'recording')} />}
        </div>
        {url && (isVoice ? <audio src={url} controls className="w-full max-w-sm" /> : <video src={url} controls playsInline className="max-h-72 rounded-[var(--radius-md)]" />)}
        {cur && <Badge tone="teal">تم الحفظ في جهازك</Badge>}
      </div>
      <Field label="ماذا تقول؟ (السكريبت)" hint="اكتب كلامك سطرًا بسطر. نوزّعه على مدة تسجيلك؛ ومع مفتاح التفريغ يصير التوقيت كلمة بكلمة.">
        <Textarea rows={6} value={w.content.script} onChange={(e) => setW({ ...w, content: { ...w.content, script: e.target.value } })} />
      </Field>
    </div>
  );
};

export const PhotoInputs = ({ w, setW }: P) => {
  const ids = w.content.product.photos;
  const urls = useAssetUrls(ids);
  const add = async (files: FileList) => {
    const out = [...ids];
    for (const f of [...files].slice(0, 5 - ids.length)) out.push(await putAsset(await shrinkImage(f), f.name));
    setW({ ...w, content: { ...w.content, product: { ...w.content.product, photos: out } } });
  };
  const remove = async (id: string) => {
    await deleteAsset(id);
    setW({ ...w, content: { ...w.content, product: { ...w.content.product, photos: ids.filter((x) => x !== id) } } });
  };
  return (
    <div className="sm:col-span-2">
      <Field label="صور المنتج (حتى 5)" hint="صورة بخلفية بيضاء أو شفافة (PNG) تعطي أجمل نتيجة.">
        <div className="flex flex-wrap gap-2">
          {ids.map((id) => (
            <div key={id} className="relative size-20 overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)]">
              {urls[id] && <img src={urls[id]} alt="" className="h-full w-full object-contain" />}
              <button type="button" aria-label="حذف الصورة" onClick={() => remove(id)} className="absolute top-1 left-1 grid size-6 place-items-center rounded-full bg-black/60 text-white">
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
          {ids.length < 5 && (
            <label className="grid size-20 cursor-pointer place-items-center rounded-[var(--radius-md)] border border-dashed border-[var(--line-strong)] text-[var(--text-2)]">
              <Icon name="plus" size={22} />
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => e.target.files && add(e.target.files)} />
            </label>
          )}
        </div>
      </Field>
    </div>
  );
};
