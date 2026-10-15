import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n/ar';
import { navigate, useRoute } from '../router';
import { Button, Chip, Input, Label, Panel, Pulse, Segmented, Textarea, Toggle, cx } from '../components/ui';
import { TranscriptEditor } from '../components/TranscriptEditor';
import { ProjectSchema, StyleSettingsSchema, type Project } from '@/lib/schema/project';
import { CAPTION_STYLES } from '@/lib/schema/plan';
import { repo } from '@/lib/repo/db';
import { uid } from '@/lib/util/rng';
import { paletteFromImage, saveUpload, silentWav } from '@/lib/media';
import { transcribeProject } from '@/lib/studio';
import { getKeys, type Keys } from '@/lib/providers/keys';
import { alignTextToVoice } from '@/lib/providers/manual';
import { timeScript } from '@/lib/providers/scriptTiming';
import { elevenTTS } from '@/lib/providers/elevenlabs';
import { proposeCuts } from '@/lib/mode-c';
import { VISUAL_STYLES } from '@/lib/design/artDirector';
import { CAPTION_AR } from './project/StyleTab';
import { MUSIC } from '@/lib/audio/library';

const BUSINESS: Array<[string, string]> = [['ecommerce', 'تجارة إلكترونية'], ['services', 'خدمات'], ['restaurant', 'مطعم / مقهى'], ['beauty', 'تجميل'], ['health', 'صحة'], ['education', 'تعليم'], ['realestate', 'عقار'], ['tech', 'تقنية'], ['personal', 'علامة شخصية'], ['other', 'أخرى']];
type Step = 'basics' | 'media' | 'style' | 'transcript';

const FilePick = ({ accept, label, hint, onFile, multiple, testId }: { accept: string; label: string; hint?: string; onFile: (f: File[]) => void; multiple?: boolean; testId?: string }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button onClick={() => ref.current?.click()} className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-raised/50 p-6 text-center hover:border-lilac">
      <span className="text-[16px] font-bold">{label}</span>
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
      <input ref={ref} data-testid={testId} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => e.target.files && onFile(Array.from(e.target.files))} />
    </button>
  );
};

export const NewProjectPage = () => {
  const t = useT();
  const { query } = useRoute();
  const [p, setP] = useState<Project | null>(null);
  const [step, setStep] = useState<Step>('basics');
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [keys, setKeysState] = useState<Keys>({});
  const [manualText, setManualText] = useState('');
  const [voiceMode, setVoiceMode] = useState<'record' | 'script'>('record');

  useEffect(() => { getKeys().then(setKeysState); }, []);
  useEffect(() => {
    const resume = query.get('project');
    (async () => {
      if (resume) {
        const ex = await repo.getProject(resume);
        if (ex) { setP(ex); setStep(ex.transcript ? 'transcript' : 'media'); return; }
      }
      const mode = (query.get('mode') as 'A' | 'B' | 'C') ?? 'A';
      setP(ProjectSchema.parse({ id: uid('p_'), name: 'مشروع جديد', createdAt: Date.now(), updatedAt: Date.now(), mode, business: mode === 'B' ? 'ecommerce' : 'other', style: StyleSettingsSchema.parse({}), product: mode === 'B' ? { currency: 'دج', cod: true } : undefined }));
    })();
  }, [query]);

  if (!p) return null;
  const up = (patch: Partial<Project>) => setP({ ...p, ...patch });
  const persist = async (next: Project) => { setP(next); await repo.saveProject(next); };
  const stepIdx = ['basics', 'media', 'style', 'transcript'].indexOf(step);

  const onVoice = async (files: File[]) => {
    const f = files[0]!;
    setBusy('تحليل الملف…');
    try {
      const isVideo = f.type.startsWith('video/');
      const { id, info } = await saveUpload(f, isVideo ? 'video' : 'audio', p.id);
      const media = { ...p.media, ...(isVideo ? { videoAssetId: id, voiceAssetId: p.mode === 'C' ? undefined : id } : { voiceAssetId: id }) };
      await persist({ ...p, media, stage: 'media' });
      if (info && info.durationMs > 3 * 60 * 1000) setErr('الملف أطول من 3 دقائق — يُنصح بريلز أقصر من 90 ثانية.');
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(null);
    }
  };
  const onImages = async (files: File[]) => {
    setBusy('حفظ الصور…');
    const extra = [...p.media.extra];
    for (const f of files.slice(0, 6)) extra.push({ assetId: (await saveUpload(f, 'image', p.id)).id, note: '' });
    await persist({ ...p, media: { ...p.media, extra } });
    setBusy(null);
  };
  const onLogo = async (files: File[]) => {
    const f = files[0]!;
    const { id } = await saveUpload(f, 'logo', p.id);
    let colors: string[] = [];
    try { colors = await paletteFromImage(f); } catch { colors = []; }
    await persist({ ...p, brand: { ...p.brand, enabled: true, logoAssetId: id, colors: colors.slice(0, 3) } });
  };

  const transcribe = async () => {
    setErr(null);
    setBusy('التفريغ جارٍ…');
    try {
      let next = { ...p };
      if (p.mode === 'B' && voiceMode === 'script') {
        const script = p.product?.script ?? '';
        if (!script.trim()) throw new Error('اكتب سكريبت الإعلان أولاً');
        if (keys.elevenlabs) {
          setBusy('توليد التعليق الصوتي…');
          const { audio, transcript } = await elevenTTS(keys.elevenlabs).speak(script, { projectId: p.id });
          const file = new File([audio], 'voiceover.mp3', { type: 'audio/mpeg' });
          const { id } = await saveUpload(file, 'audio', p.id);
          next = { ...next, transcript, media: { ...next.media, voiceAssetId: id } };
        } else {
          const transcript = timeScript(script);
          const file = new File([silentWav(transcript.durationMs)], 'silence.wav', { type: 'audio/wav' });
          const { id } = await saveUpload(file, 'audio', p.id);
          next = { ...next, transcript, media: { ...next.media, voiceAssetId: id } };
        }
      } else if (!keys.elevenlabs && !keys.openai && manualText.trim()) {
        const a = await repo.getAsset(p.media.voiceAssetId ?? p.media.videoAssetId ?? '');
        const voiced = (a?.meta?.voiced as Array<[number, number]>) ?? [];
        next = { ...next, transcript: alignTextToVoice(manualText, voiced, Number(a?.meta?.durationMs ?? 30000)) };
      } else {
        next = { ...next, transcript: await transcribeProject(p, (m) => setBusy(m)) };
      }
      if (p.mode === 'C' && next.transcript) {
        const a = await repo.getAsset(p.media.videoAssetId ?? '');
        next.cuts = proposeCuts(next.transcript, (a?.meta?.voiced as Array<[number, number]>) ?? [[0, next.transcript.durationMs]]);
      }
      await persist({ ...next, stage: 'transcript' });
    } catch (e) {
      setErr(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(null);
    }
  };

  const hasMedia = p.mode === 'C' ? !!p.media.videoAssetId : p.mode === 'B' && voiceMode === 'script' ? !!p.product?.script?.trim() : !!(p.media.voiceAssetId || p.media.videoAssetId);
  const noKeys = !keys.elevenlabs && !keys.openai;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <div className="flex gap-1.5" aria-label="الخطوات">
        {['النوع', 'الوسائط', 'الستايل', 'النص'].map((s, i) => (
          <button key={s} onClick={() => i < stepIdx && setStep((['basics', 'media', 'style', 'transcript'] as Step[])[i]!)} className="flex-1 text-center">
            <div className={cx('h-1.5 rounded-full', i <= stepIdx ? 'bg-rose' : 'bg-line')} />
            <div className={cx('mt-1 text-[12px] font-bold', i === stepIdx ? 'text-ink' : 'text-muted')}>{s}</div>
          </button>
        ))}
      </div>

      {step === 'basics' && (
        <div className="space-y-4">
          <h1 className="font-display text-[28px] font-bold">مشروع جديد</h1>
          <div className="grid gap-2">
            {(['A', 'B', 'C'] as const).map((m) => (
              <button key={m} onClick={() => up({ mode: m, product: m === 'B' ? p.product ?? { name: '', currency: 'دج', offer: '', cod: true, phone: '', script: '', reviews: [] } : p.product })} className={cx('rounded-2xl p-4 text-right ring-2', p.mode === m ? 'bg-surface ring-rose' : 'bg-surface ring-line')} data-testid={`mode-${m}`}>
                <div className="font-display text-[19px] font-bold">{t[`mode${m}`]}</div>
                <div className="text-[14px] text-muted">{t[`mode${m}Desc`]}</div>
              </button>
            ))}
          </div>
          <div><Label>اسم المشروع</Label><Input value={p.name} onChange={(e) => up({ name: e.target.value })} /></div>
          <div>
            <Label>النشاط</Label>
            <div className="flex flex-wrap gap-2">{BUSINESS.map(([k, v]) => <Chip key={k} active={p.business === k} onClick={() => up({ business: k })}>{v}</Chip>)}</div>
          </div>
          <Button size="lg" className="w-full" onClick={async () => { await persist(p); setStep('media'); }}>{t.next}</Button>
        </div>
      )}

      {step === 'media' && (
        <div className="space-y-4">
          <h1 className="font-display text-[28px] font-bold">{p.mode === 'B' ? 'المنتج والصوت' : p.mode === 'C' ? 'الفيديو' : 'الصوت'}</h1>
          {p.mode === 'B' && (
            <Panel className="space-y-3">
              <FilePick accept="image/*" multiple label="صور المنتج" hint="حتى 6 صور — أول صورة هي الصورة الرئيسية" onFile={onImages} />
              {p.media.extra.length > 0 && <div className="text-[14px] text-mint">{p.media.extra.length} صورة ✓</div>}
              <div><Label>اسم المنتج</Label><Input value={p.product?.name ?? ''} onChange={(e) => up({ product: { ...p.product!, name: e.target.value } })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>السعر</Label><Input inputMode="numeric" value={p.product?.price ?? ''} onChange={(e) => up({ product: { ...p.product!, price: e.target.value ? Number(e.target.value) : undefined } })} /></div>
                <div><Label>السعر القديم</Label><Input inputMode="numeric" value={p.product?.oldPrice ?? ''} onChange={(e) => up({ product: { ...p.product!, oldPrice: e.target.value ? Number(e.target.value) : undefined } })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>التوصيل (عدد الولايات)</Label><Input inputMode="numeric" value={p.product?.deliveryWilayas ?? ''} onChange={(e) => up({ product: { ...p.product!, deliveryWilayas: e.target.value ? Number(e.target.value) : undefined } })} /></div>
                <div><Label>الهاتف</Label><Input dir="ltr" inputMode="tel" value={p.product?.phone ?? ''} onChange={(e) => up({ product: { ...p.product!, phone: e.target.value } })} /></div>
              </div>
              <Toggle checked={p.product?.cod ?? true} onChange={(v) => up({ product: { ...p.product!, cod: v } })} label="الدفع عند الاستلام" />
              <div><Label>العرض</Label><Input value={p.product?.offer ?? ''} onChange={(e) => up({ product: { ...p.product!, offer: e.target.value } })} /></div>
              <Segmented value={voiceMode} options={[{ value: 'record', label: 'عندي تسجيل صوتي' }, { value: 'script', label: 'عندي سكريبت مكتوب' }]} onChange={setVoiceMode} />
              {voiceMode === 'script' && (
                <div>
                  <Label hint={keys.elevenlabs ? 'سيُقرأ بصوت ElevenLabs' : 'بدون مفتاح ElevenLabs: فيديو بلا صوت مع كابشن بسرعة القراءة'}>السكريبت</Label>
                  <Textarea value={p.product?.script ?? ''} onChange={(e) => up({ product: { ...p.product!, script: e.target.value } })} placeholder="راك تسوق والتيليفون يطيح؟ هاذا هو الحل…" />
                </div>
              )}
            </Panel>
          )}
          {!(p.mode === 'B' && voiceMode === 'script') && (
            <Panel className="space-y-3">
              <FilePick testId="voice-input" accept={p.mode === 'C' ? 'video/*' : 'audio/*,video/*'} label={p.mode === 'C' ? 'ارفع فيديو الشخص المتكلم' : 'ارفع التسجيل الصوتي'} hint={p.mode === 'C' ? 'MP4 / MOV' : 'MP3 / WAV / M4A أو فيديو (نأخذ الصوت منه)'} onFile={onVoice} />
              {(p.media.voiceAssetId || p.media.videoAssetId) && <div className="text-[14px] font-bold text-mint">تم رفع الملف ✓</div>}
            </Panel>
          )}
          {p.mode === 'A' && (
            <Panel className="space-y-2">
              <FilePick accept="image/*" multiple label="صور إضافية (اختياري)" hint="مثلاً صورة العيادة أو المنتج" onFile={onImages} />
              {p.media.extra.map((e, i) => (
                <Input key={e.assetId} placeholder={`ملاحظة للصورة ${i + 1}: متى تظهر؟`} value={e.note} onChange={(ev) => up({ media: { ...p.media, extra: p.media.extra.map((x, k) => (k === i ? { ...x, note: ev.target.value } : x)) } })} />
              ))}
            </Panel>
          )}
          <Panel className="space-y-3">
            <div><Label hint="اختياري: الموضوع، الجمهور، كلمات مهمة">الفكرة</Label><Textarea value={p.media.idea} onChange={(e) => up({ media: { ...p.media, idea: e.target.value } })} /></div>
            <div><Label hint="أسماء علامات، منتجات، كلمات فرنسية — تساعد التفريغ">كلمات خاصة</Label><Input value={p.media.vocabulary} onChange={(e) => up({ media: { ...p.media, vocabulary: e.target.value } })} /></div>
          </Panel>
          <Panel className="space-y-3">
            <Label hint="اختياري: الشعار يعطي ألوانًا تلقائيًا">هوية العلامة</Label>
            <FilePick accept="image/*" label="ارفع الشعار" onFile={onLogo} />
            {p.brand.colors.length > 0 && (
              <div className="flex items-center gap-2">
                {p.brand.colors.map((c, i) => (
                  <input key={i} type="color" value={c} onChange={(e) => up({ brand: { ...p.brand, colors: p.brand.colors.map((x, k) => (k === i ? e.target.value : x)) } })} className="h-10 w-10 rounded-full" />
                ))}
              </div>
            )}
            <Toggle checked={p.brand.enabled} onChange={(v) => up({ brand: { ...p.brand, enabled: v } })} label="استعمل ألوان العلامة في الفيديو" />
          </Panel>
          {busy && <div className="flex items-center gap-2 text-muted"><Pulse /> {busy}</div>}
          {err && <p className="text-rose">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep('basics')}>{t.back}</Button>
            <Button className="flex-1" size="lg" disabled={!hasMedia} onClick={async () => { await persist(p); setStep('style'); }}>{t.next}</Button>
          </div>
        </div>
      )}

      {step === 'style' && (
        <div className="space-y-4">
          <h1 className="font-display text-[28px] font-bold">الستايل</h1>
          <p className="text-muted">كل شيء اختياري — «تلقائي» يعني أن نبرة تختار حسب الموضوع. ستشاهد كل تغيير مباشرة في المحرر بعد التوليد.</p>
          <Panel className="space-y-3">
            <Label>الستايل البصري</Label>
            <div className="flex flex-wrap gap-2">
              <Chip active={p.style.visualStyle === 'auto'} onClick={() => up({ style: { ...p.style, visualStyle: 'auto' } })}>تلقائي</Chip>
              {Object.entries(VISUAL_STYLES).map(([k, v]) => <Chip key={k} active={p.style.visualStyle === k} onClick={() => up({ style: { ...p.style, visualStyle: k } })}>{v.label}</Chip>)}
            </div>
            <Textarea placeholder="وصف حر (اختياري): «داكن وسينمائي، لمسات ذهبية»" value={p.style.artDirection} onChange={(e) => up({ style: { ...p.style, artDirection: e.target.value } })} />
            <FilePick accept="image/*" label="صورة مرجعية (اختياري)" hint="نأخذ منها الألوان والإحساس — لا ننسخها" onFile={async (f) => { const { id } = await saveUpload(f[0]!, 'image', p.id); await persist({ ...p, style: { ...p.style, referenceAssetId: id } }); }} />
            {p.style.referenceAssetId && <div className="text-[14px] text-mint">تمت إضافة الصورة المرجعية ✓</div>}
          </Panel>
          <Panel className="space-y-3">
            <Label>الكابشن</Label>
            <div className="flex flex-wrap gap-2">{CAPTION_STYLES.map((s) => <Chip key={s} active={p.style.captions.style === s} onClick={() => up({ style: { ...p.style, captions: { ...p.style.captions, style: s } } })}>{CAPTION_AR[s]}</Chip>)}</div>
            <Toggle checked={p.style.captions.enabled} onChange={(v) => up({ style: { ...p.style, captions: { ...p.style.captions, enabled: v } } })} label="أظهر الكابشن" />
          </Panel>
          <Panel className="space-y-3">
            <Label>الإيقاع</Label>
            <Segmented value={p.style.pacing} options={[{ value: 'auto', label: 'تلقائي' }, { value: 'fast', label: 'سريع' }, { value: 'normal', label: 'عادي' }, { value: 'calm', label: 'هادئ' }]} onChange={(v) => up({ style: { ...p.style, pacing: v } })} />
            <Label>المقاس</Label>
            <Segmented value={p.style.aspect} options={(['9:16', '4:5', '1:1', '16:9'] as const).map((a) => ({ value: a, label: a }))} onChange={(v) => up({ style: { ...p.style, aspect: v } })} />
            <Label>الموسيقى</Label>
            <div className="flex flex-wrap gap-2">
              <Chip active={p.style.music.trackId === 'auto'} onClick={() => up({ style: { ...p.style, music: { ...p.style.music, trackId: 'auto' } } })}>تلقائي</Chip>
              {MUSIC.map((m) => <Chip key={m.id} active={p.style.music.trackId === m.id} onClick={() => up({ style: { ...p.style, music: { ...p.style.music, trackId: m.id } } })}>{m.title}</Chip>)}
              <Chip active={p.style.music.trackId === 'none'} onClick={() => up({ style: { ...p.style, music: { ...p.style.music, trackId: 'none' } } })}>بدون</Chip>
            </div>
          </Panel>
          <Panel className="space-y-2">
            <Toggle checked={p.style.endCard.enabled} onChange={(v) => up({ style: { ...p.style, endCard: { ...p.style.endCard, enabled: v } } })} label="بطاقة أخيرة (الحساب / الهاتف)" />
            {p.style.endCard.enabled && (
              <div className="grid gap-2">
                <Input placeholder="جملة الدعوة" value={p.style.endCard.cta} onChange={(e) => up({ style: { ...p.style, endCard: { ...p.style.endCard, cta: e.target.value } } })} />
                <Input placeholder="@الحساب" dir="ltr" value={p.style.endCard.handle} onChange={(e) => up({ style: { ...p.style, endCard: { ...p.style.endCard, handle: e.target.value } } })} />
                <Input placeholder="الهاتف" dir="ltr" value={p.style.endCard.phone} onChange={(e) => up({ style: { ...p.style, endCard: { ...p.style.endCard, phone: e.target.value } } })} />
              </div>
            )}
          </Panel>
          {noKeys && !(p.mode === 'B' && voiceMode === 'script') && (
            <Panel className="space-y-2">
              <Label hint="بدون مفتاح ElevenLabs: إما تفريغ مجاني داخل الهاتف (Whisper، بطيء ويحمّل نموذجًا ~250MB)، أو تكتب ما قلته ونوزّعه على صوتك">التفريغ في الوضع التجريبي</Label>
              <Textarea placeholder="(اختياري) اكتب هنا ما قلته في التسجيل حرفيًا…" value={manualText} onChange={(e) => setManualText(e.target.value)} />
            </Panel>
          )}
          {busy && <div className="flex items-center gap-2 text-muted"><Pulse /> {busy}</div>}
          {err && <p className="text-rose">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep('media')}>{t.back}</Button>
            <Button className="flex-1" size="lg" disabled={!!busy} onClick={async () => { await persist(p); await transcribe(); setStep('transcript'); }} data-testid="transcribe">{p.mode === 'B' && voiceMode === 'script' ? 'جهّز الصوت والنص' : 'فرّغ الصوت'}</Button>
          </div>
        </div>
      )}

      {step === 'transcript' && (
        <div className="space-y-4">
          <h1 className="font-display text-[28px] font-bold">راجع النص</h1>
          {!p.transcript ? (
            <Panel className="space-y-3">
              {busy ? <div className="flex items-center gap-2"><Pulse /> {busy}</div> : <Button onClick={transcribe}>أعد المحاولة</Button>}
              {err && <p className="text-rose">{err}</p>}
            </Panel>
          ) : (
            <>
              {p.transcript.source === 'manual' && <Panel className="text-[14px] text-muted">التوقيت تقريبي (موزّع على صوتك). للحصول على تزامن دقيق بالإطار أضف مفتاح ElevenLabs.</Panel>}
              <TranscriptEditor transcript={p.transcript} vocabulary={p.media.vocabulary} idea={p.media.idea} projectId={p.id} onApply={(tr) => persist({ ...p, transcript: tr })} />
              {p.mode === 'C' && p.cuts.length > 0 && (
                <Panel className="space-y-2">
                  <Label hint="اضغط لإلغاء أي قص">القصّات المقترحة ({p.cuts.filter((c) => c.enabled).length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {p.cuts.map((c, i) => <Chip key={i} active={c.enabled} onClick={() => persist({ ...p, cuts: p.cuts.map((x, k) => (k === i ? { ...x, enabled: !x.enabled } : x)) })}>{c.label ?? c.kind}</Chip>)}
                  </div>
                </Panel>
              )}
              <Button size="lg" className="w-full" data-testid="to-generate" onClick={async () => { await persist({ ...p, stage: 'generating' }); navigate(`/p/${p.id}`); }}>{t.generate}</Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
