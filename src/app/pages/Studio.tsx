import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlayerRef } from '@remotion/player';
import { Shell } from '../ui/Shell';
import { Btn, Card, Field, I, Seg, Spinner, Toggle, cx, inputCls } from '../ui/kit';
import { ReelPlayer } from '../ui/ReelPlayer';
import { getProject, putProject } from '@/data/db';
import type { Project } from '@/data/project';
import { useSettings } from '@/data/settings';
import { runProject, type Step } from '@/ai/pipeline';
import { AIError } from '@/ai/claude';
import type { Compiled } from '@/engine/compile';
import type { Style } from '@/engine/schema';
import { FONTS } from '@/engine/fonts';
import { MUSIC, MUSIC_INFO } from '@/engine/audio';
import { compileProject } from '../lib/compileProject';
import { download, exportVideo, toSrt } from '../lib/export';
import { loadDemo } from '../demos';

const STEPS: Array<{ k: Step; label: string }> = [
  { k: 'listen', label: 'نسمعو الكلام ونوقّتو كل كلمة' },
  { k: 'voice', label: 'نصنعو الصوت' },
  { k: 'direct', label: 'المخرج يصمّم المشاهد والألوان والحركة' },
  { k: 'images', label: 'نصنعو الصور' },
];
const TABS = [
  { k: 'direct', label: 'الإخراج', icon: I.wand },
  { k: 'style', label: 'الستايل', icon: I.palette },
  { k: 'audio', label: 'الصوت', icon: I.music },
  { k: 'end', label: 'النهاية', icon: I.layers },
  { k: 'export', label: 'تصدير', icon: I.download },
] as const;
type Tab = (typeof TABS)[number]['k'];

const RESTYLES = ['ألوان أجرأ', 'أفخم وأهدأ', 'إيقاع أسرع', 'صور أكثر', 'كتابة أكبر', 'مفاجئني'];

/** Demo projects are copies of the bundled fixtures, editable like any project. */
export const ensureDemoProject = async (demoId: string) => {
  const id = `demo-${demoId}`;
  const ex = await getProject(id);
  const d = await loadDemo(demoId);
  // content hash of the fixture: any re-authored demo replaces the copy cached in the owner's browser
  let h = 2166136261;
  for (const ch of JSON.stringify([d.plan, d.transcript])) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rev = `${demoId}@${(h >>> 0).toString(36)}`;
  if (ex && ex.demo === rev) return id;
  const now = Date.now();
  const p: Project = {
    id, demo: rev, title: d.title, mode: d.mode, createdAt: now, updatedAt: now, status: 'ready', script: d.transcript.words.map((w) => w.text).join(' '), notes: '', media: [], history: [], images: {}, cost: 0,
    transcript: d.transcript, plan: d.plan,
    options: { aspect: '9:16', captions: d.mode === 'talking', music: d.music, musicVolume: 0.5, sfx: true, digits: 'western', endCard: false, cta: '', handle: '', phone: '' },
  };
  await putProject(p);
  return id;
};

export const Studio = ({ id, q }: { id: string; q: URLSearchParams }) => {
  const s = useSettings();
  const [p, setP] = useState<Project | null>(null);
  const [c, setC] = useState<Compiled | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [err, setErr] = useState<{ msg: string; code?: string } | null>(null);
  const [tab, setTab] = useState<Tab>('direct');
  const [restyle, setRestyle] = useState('');
  const player = useRef<PlayerRef>(null);
  const running = useRef(false);

  const recompile = useCallback(async (proj: Project) => setC(await compileProject(proj, proj.demo ? {} : undefined)), []);
  const save = useCallback(async (next: Project) => {
    setP({ ...next });
    await putProject(next);
    await recompile(next);
  }, [recompile]);

  const run = useCallback(async (proj: Project, opts: { restyle?: string; keepTranscript?: boolean } = {}) => {
    if (running.current) return;
    running.current = true;
    setErr(null);
    setStep('listen');
    try {
      const done = await runProject(structuredClone(proj), (x) => setStep(x.step === 'repair' ? 'direct' : x.step), opts);
      setP({ ...done });
      await recompile(done);
      setStep(null);
    } catch (e) {
      setStep(null);
      setErr({ msg: e instanceof Error ? e.message : String(e), code: e instanceof AIError ? e.code : undefined });
      const cur = await getProject(proj.id);
      if (cur) {
        cur.status = cur.plan ? 'ready' : 'error';
        cur.error = String(e);
        await putProject(cur);
      }
    } finally {
      running.current = false;
    }
  }, [recompile]);

  useEffect(() => {
    let alive = true;
    getProject(id).then(async (proj) => {
      if (!alive) return;
      if (!proj) return setErr({ msg: 'المشروع غير موجود' });
      setP(proj);
      if (proj.plan) await recompile(proj);
      else if (q.get('run') === '1' || proj.status === 'draft') run(proj);
    });
    return () => {
      alive = false;
    };
  }, [id, q, recompile, run]);

  if (!p) return <Shell active="projects"><div className="grid h-[60vh] place-items-center">{err ? err.msg : <Spinner size={28} />}</div></Shell>;
  const st = p.plan?.style;
  const setStyle = (fn: (st: Style) => void) => {
    if (!p.plan) return;
    const next = structuredClone(p);
    fn(next.plan!.style);
    save(next);
  };
  const setOpt = (patch: Partial<Project['options']>) => save({ ...p, options: { ...p.options, ...patch } });

  return (
    <Shell active="projects" wide>
      <div className="grid gap-6 pt-5 pb-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h1 className="min-w-0 truncate font-ar text-[20px] font-extrabold">{p.title}</h1>
            {p.plan && <span className="shrink-0 rounded-full bg-raised px-3 py-1 text-[12px] text-muted">{p.plan.author === 'claude' ? 'إخراج Claude' : p.plan.author === 'fixture' ? 'مثال' : 'المخرج المحلي'}</span>}
          </div>
          <div className="relative mx-auto max-w-[380px]">
            {c ? <ReelPlayer ref={player} c={c} /> : <div className="rounded-[22px] bg-panel" style={{ aspectRatio: '9/16' }} />}
            {step && (
              <div data-testid="progress" className="absolute inset-0 grid place-items-center rounded-[22px] bg-ink/90 p-6 backdrop-blur">
                <ul className="w-full space-y-3">
                  {STEPS.filter((x) => x.k !== 'voice' || step === 'voice').map((x) => {
                    const order = STEPS.findIndex((y) => y.k === x.k), curI = STEPS.findIndex((y) => y.k === step);
                    const state = order < curI ? 'done' : order === curI ? 'now' : 'todo';
                    return (
                      <li key={x.k} className={cx('flex items-center gap-3 text-[14.5px]', state === 'todo' && 'text-muted/60')}>
                        <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full', state === 'done' ? 'bg-mint text-ink' : state === 'now' ? 'grad-bg' : 'bg-raised')}>
                          {state === 'done' ? <I.check size={15} /> : state === 'now' ? <Spinner size={14} /> : null}
                        </span>
                        {x.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          {err && (
            <div className="mt-4 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-[14px] leading-relaxed text-coral">
              {err.msg}
              <div className="mt-3 flex gap-2">
                {err.code === 'key' && <a href="#/settings"><Btn size="sm" kind="soft">افتح الإعدادات</Btn></a>}
                <Btn size="sm" kind="soft" onClick={() => run(p, { keepTranscript: !!p.transcript })}>أعد المحاولة</Btn>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
            {TABS.map((t) => (
              <button key={t.k} data-testid={`tab-${t.k}`} onClick={() => setTab(t.k)} className={cx('flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition', tab === t.k ? 'bg-raised text-text shadow-[inset_0_0_0_1px_var(--color-line)]' : 'text-muted')}>
                <t.icon size={17} /> {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            {tab === 'direct' && (
              <>
                <Card>
                  <h2 className="font-ar text-[17px] font-extrabold">إخراج جديد</h2>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">المخرج يعاود يصمّم الفيديو كامل بفكرة جديدة. قل له واش تحب، ولا خليه يفاجئك.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {RESTYLES.map((r) => <button key={r} onClick={() => setRestyle(r)} className={cx('rounded-full border px-3 py-1.5 text-[13px]', restyle === r ? 'border-violet bg-violet/20' : 'border-line text-muted')}>{r}</button>)}
                  </div>
                  <input className={cx(inputCls, 'mt-3')} value={restyle} onChange={(e) => setRestyle(e.target.value)} placeholder="مثلا: خلفيات صور حقيقية وألوان ذهبية" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn data-testid="restyle" disabled={!!step || !p.transcript} onClick={() => run(p, { restyle: restyle || 'surprise me with a totally different direction', keepTranscript: true })} icon={<I.wand size={17} />}>أعد الإخراج</Btn>
                    {p.history.length > 0 && <Btn kind="ghost" onClick={() => save({ ...p, plan: p.history[0], history: [p.plan!, ...p.history.slice(1)] })} icon={<I.undo size={17} />}>النسخة السابقة</Btn>}
                  </div>
                  {!s.keys.claude && <p className="mt-3 text-[12.5px] text-sun">بدون مفتاح Claude، الإخراج الجديد يكون بالمخرج المحلي البسيط.</p>}
                </Card>
                {p.plan && (
                  <Card>
                    <h2 className="font-ar text-[17px] font-extrabold">المشاهد ({p.plan.scenes.length})</h2>
                    <ol className="mt-3 space-y-2">
                      {c?.scenes.filter((x) => !x.isEnd).map((sc, i) => {
                        const words = p.transcript?.words ?? [];
                        const a = words.findIndex((w) => w.id === sc.from), b = words.findIndex((w) => w.id === sc.to);
                        return (
                          <li key={sc.id + i}>
                            <button onClick={() => player.current?.seekTo(sc.startF + 8)} className="flex w-full items-start gap-3 rounded-2xl bg-ink p-3 text-start hover:bg-raised">
                              <span className="mt-0.5 h-9 w-9 shrink-0 rounded-lg border border-line" style={{ background: sc.bg.tone === 'light' ? st?.palette.paper : sc.bg.tone === 'accent' ? st?.palette.accent : st?.palette.dark }} />
                              <span className="min-w-0">
                                <span className="block text-[14px] font-semibold" dir="auto">{words.slice(a, b + 1).map((w) => w.text).join(' ')}</span>
                                {sc.intent && <span className="mt-0.5 block text-[12.5px] text-muted" dir="auto">{sc.intent}</span>}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </Card>
                )}
                {p.plan?.hooks && p.plan.hooks.length > 0 && (
                  <Card>
                    <h2 className="font-ar text-[17px] font-extrabold">خطّافات بديلة</h2>
                    <ul className="mt-2 space-y-1.5 text-[14px]" dir="auto">{p.plan.hooks.map((h) => <li key={h}>• {h}</li>)}</ul>
                  </Card>
                )}
              </>
            )}

            {tab === 'style' && st && (
              <>
                <Card>
                  <h2 className="font-ar text-[17px] font-extrabold">الألوان</h2>
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {(['accent', 'accent2', 'paper', 'dark', 'ink', 'muted'] as const).map((k) => (
                      <label key={k} className="flex flex-col items-center gap-1.5 text-[12px] text-muted">
                        <input type="color" value={st.palette[k]} onChange={(e) => setStyle((x) => { x.palette[k] = e.target.value; })} className="h-12 w-12 cursor-pointer rounded-xl border border-line bg-transparent" />
                        {{ accent: 'الأساسي', accent2: 'الثانوي', paper: 'فاتح', dark: 'غامق', ink: 'الكتابة', muted: 'هادئ' }[k]}
                      </label>
                    ))}
                  </div>
                </Card>
                <Card className="space-y-4">
                  <h2 className="font-ar text-[17px] font-extrabold">الخطوط</h2>
                  {(['display', 'serif', 'impact'] as const).map((role) => (
                    <div key={role} className="grid grid-cols-2 gap-2">
                      <Field label={{ display: 'العناوين (عربي)', serif: 'التمييز (عربي)', impact: 'الأرقام (عربي)' }[role]}>
                        <select className={inputCls} value={st.fonts[role].ar} onChange={(e) => setStyle((x) => { x.fonts[role].ar = e.target.value; })}>
                          {FONTS.filter((f) => f.script === 'ar').map((f) => <option key={f.id} value={f.id}>{f.family}</option>)}
                        </select>
                      </Field>
                      <Field label="لاتيني">
                        <select className={inputCls} value={st.fonts[role].lat} onChange={(e) => setStyle((x) => { x.fonts[role].lat = e.target.value; })}>
                          {FONTS.filter((f) => f.script === 'lat').map((f) => <option key={f.id} value={f.id}>{f.family}</option>)}
                        </select>
                      </Field>
                    </div>
                  ))}
                </Card>
                <Card className="space-y-4">
                  <Field label="إحساس الحركة">
                    <Seg value={st.motion} onChange={(v) => setStyle((x) => { x.motion = v; })} options={[{ v: 'snappy', label: 'حاد' }, { v: 'smooth', label: 'ناعم' }, { v: 'bouncy', label: 'مرح' }, { v: 'cinematic', label: 'سينمائي' }]} />
                  </Field>
                  <Field label={`حبيبات الفيلم: ${Math.round(st.grain * 100)}%`}>
                    <input type="range" min={0} max={0.6} step={0.02} value={st.grain} onChange={(e) => setStyle((x) => { x.grain = +e.target.value; })} className="w-full" />
                  </Field>
                </Card>
                <Card className="space-y-3">
                  <Toggle on={p.options.captions} onChange={(v) => setOpt({ captions: v })} label="ترجمة سفلية (كابشن)" />
                  {p.options.captions && <Seg value={st.captions === 'none' ? 'clean' : st.captions} onChange={(v) => setStyle((x) => { x.captions = v; })} options={[{ v: 'clean', label: 'بسيط' }, { v: 'boxed', label: 'بإطار' }, { v: 'pop', label: 'نابض' }]} />}
                  <Field label="الأرقام">
                    <Seg value={p.options.digits} onChange={(v) => setOpt({ digits: v })} options={[{ v: 'western', label: '123' }, { v: 'eastern', label: '١٢٣' }]} />
                  </Field>
                  <Field label="الشكل">
                    <Seg value={p.options.aspect} onChange={(v) => setOpt({ aspect: v })} options={[{ v: '9:16', label: '9:16' }, { v: '4:5', label: '4:5' }, { v: '1:1', label: '1:1' }, { v: '16:9', label: '16:9' }]} />
                  </Field>
                </Card>
              </>
            )}

            {tab === 'audio' && (
              <Card className="space-y-4">
                <Field label="الموسيقى">
                  <div className="grid grid-cols-2 gap-2">
                    {['auto', ...MUSIC, 'none'].map((m) => (
                      <button key={m} onClick={() => setOpt({ music: m })} className={cx('rounded-xl border px-3 py-3 text-[14px]', p.options.music === m ? 'border-violet bg-violet/15' : 'border-line text-muted')}>
                        {m === 'auto' ? 'اختيار المخرج' : m === 'none' ? 'بدون موسيقى' : MUSIC_INFO[m as (typeof MUSIC)[number]].ar}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label={`مستوى الموسيقى: ${Math.round(p.options.musicVolume * 100)}%`}>
                  <input type="range" min={0} max={1} step={0.05} value={p.options.musicVolume} onChange={(e) => setOpt({ musicVolume: +e.target.value })} className="w-full" />
                </Field>
                <Toggle on={p.options.sfx} onChange={(v) => setOpt({ sfx: v })} label="مؤثرات صوتية (whoosh, pop…)" />
                <p className="text-[12.5px] text-muted">الموسيقى تنخفض وحدها كي يكون كلام.</p>
              </Card>
            )}

            {tab === 'end' && (
              <Card className="space-y-4">
                <Toggle on={p.options.endCard} onChange={(v) => setOpt({ endCard: v })} label="بطاقة النهاية" />
                <Field label="جملة الدعوة"><input className={inputCls} value={p.options.cta} onChange={(e) => setP({ ...p, options: { ...p.options, cta: e.target.value } })} onBlur={() => save(p)} placeholder="اطلب دروك" /></Field>
                <Field label="الحساب"><input className={inputCls} dir="ltr" value={p.options.handle} onChange={(e) => setP({ ...p, options: { ...p.options, handle: e.target.value } })} onBlur={() => save(p)} placeholder="@yourbrand" /></Field>
                <Field label="الهاتف"><input className={inputCls} dir="ltr" value={p.options.phone} onChange={(e) => setP({ ...p, options: { ...p.options, phone: e.target.value } })} onBlur={() => save(p)} placeholder="0555 00 00 00" /></Field>
              </Card>
            )}

            {tab === 'export' && c && <ExportPanel c={c} p={p} />}
          </div>
        </div>
      </div>
    </Shell>
  );
};

const ExportPanel = ({ c, p }: { c: Compiled; p: Project }) => {
  const s = useSettings();
  const [q, setQ] = useState<'720' | '1080'>(s.defaults.quality);
  const [prog, setProg] = useState<number | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const abort = useRef<AbortController | null>(null);
  const start = async () => {
    setErr('');
    setDone(null);
    setProg(0);
    abort.current = new AbortController();
    try {
      const { blob, ext } = await exportVideo(c, q, setProg, abort.current.signal);
      const name = `${p.title.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 40) || 'motiq'}.${ext}`;
      download(blob, name);
      setDone(ext.toUpperCase());
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setErr('تعذّر التصدير. جرّب جودة 720 أو أغلق التبويبات الأخرى.');
    } finally {
      setProg(null);
    }
  };
  return (
    <Card className="space-y-4">
      <Field label="الجودة"><Seg value={q} onChange={setQ} options={[{ v: '720', label: '720p أسرع' }, { v: '1080', label: '1080p' }]} /></Field>
      {prog === null ? (
        <Btn size="lg" className="w-full" data-testid="export" onClick={start} icon={<I.download size={20} />}>صدّر الفيديو</Btn>
      ) : (
        <div data-testid="export-progress">
          <div className="h-3 overflow-hidden rounded-full bg-ink"><div className="h-full grad-bg transition-all" style={{ width: `${Math.round(prog * 100)}%` }} /></div>
          <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
            <span>{Math.round(prog * 100)}% — خلّي الصفحة مفتوحة</span>
            <button onClick={() => abort.current?.abort()} className="text-coral">إلغاء</button>
          </div>
        </div>
      )}
      {done && <p data-testid="export-done" className="text-[14px] text-mint">تم! الفيديو ({done}) تنزّل في هاتفك.</p>}
      {err && <p className="text-[14px] text-coral">{err}</p>}
      {p.transcript && <Btn kind="ghost" onClick={() => download(new Blob([toSrt(p.transcript!.words)], { type: 'text/plain' }), 'captions.srt')}>تنزيل الترجمة SRT</Btn>}
      <p className="text-[12.5px] leading-relaxed text-muted">التصدير يصير داخل هاتفك، بلا رفع لأي خادم. فيديو 30 ثانية ياخذ تقريبا دقيقة إلى ثلاث.</p>
    </Card>
  );
};
