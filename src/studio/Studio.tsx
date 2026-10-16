import { useEffect, useRef, useState } from 'react';
import { go, type Route } from '@/app/router';
import { getProject, saveProject, uid } from '@/data/db';
import { GOALS, STYLES, STYLE_LIST, type Goal, type StyleId } from '@/styles/catalog';
import { StylePoster } from '@/pages/StyleTile';
import { Icon, type IconName } from '@/ui/Icon';
import { Loader } from '@/ui/Logo';
import { Badge, Button, cx, Field, Input, Segmented, Slider, Textarea, Toggle } from '@/ui/kit';
import { ASPECTS, newWizard, WizardSchema, type Wizard } from './state';
import { Export, Preview, ScriptScenes } from './Production';
import { MediaInputs, PhotoInputs, WriteForMe } from './ContentInputs';

const STEPS = ['الهدف', 'الستايل', 'المحتوى', 'الإعدادات', 'السكريبت والمشاهد', 'المعاينة والتعديل', 'التصدير'] as const;
const GOAL_ICON: Record<Goal, IconName> = { ad: 'cart', explainer: 'help', story: 'film', numbers: 'layers', talking: 'camera', free: 'spark' };

const Progress = ({ step, max, onGo }: { step: number; max: number; onGo: (n: number) => void }) => (
  <div className="sticky top-16 z-30 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur-xl">
    <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
      <div className="mb-2 flex items-center justify-between text-[0.85rem]">
        <span className="font-display font-semibold">
          <span className="num text-[var(--color-spark)]">{step}</span>
          <span className="text-[var(--text-3)]"> / 7 </span>
          {STEPS[step - 1]}
        </span>
        <span className="text-[var(--text-3)]">يُحفظ تلقائيًا</span>
      </div>
      <ol className="grid grid-cols-7 gap-1.5" aria-label="خطوات الإنشاء">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              disabled={i + 1 > max}
              onClick={() => onGo(i + 1)}
              aria-label={`${i + 1}. ${s}`}
              aria-current={i + 1 === step ? 'step' : undefined}
              className={cx('block h-1.5 w-full rounded-full transition', i + 1 < step ? 'bg-[var(--color-spark)]' : i + 1 === step ? 'bg-[var(--color-spark)] shadow-[0_0_12px_rgb(255_122_26/0.7)]' : 'bg-[var(--surface-3)]')}
            />
          </li>
        ))}
      </ol>
    </div>
  </div>
);

const Option = ({ active, onClick, icon, title, body, children }: { active: boolean; onClick: () => void; icon?: IconName; title: string; body?: string; children?: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cx('card flex flex-col items-start gap-2 rounded-[var(--radius-lg)] p-4 text-right transition', active ? 'border-[var(--color-spark)] shadow-[0_0_0_1px_var(--color-spark),var(--shadow-e2)]' : 'hover:border-[var(--line-strong)]')}
  >
    {icon && (
      <span className={cx('grid size-10 place-items-center rounded-xl', active ? 'bg-[var(--color-spark)] text-[var(--on-spark)]' : 'bg-[var(--surface-3)] text-[var(--text-2)]')}>
        <Icon name={icon} size={20} />
      </span>
    )}
    {children}
    <span className="font-display text-[1rem] font-bold">{title}</span>
    {body && <span className="text-[0.83rem] leading-relaxed text-[var(--text-2)]">{body}</span>}
  </button>
);

export const Studio = ({ route }: { route: Route }) => {
  const [w, setW] = useState<Wizard | null>(null);
  const [pid, setPid] = useState<string>('');
  const created = useRef(0);

  // load or create the project
  useEffect(() => {
    const id = route.query.get('project');
    (async () => {
      if (id) {
        const p = await getProject(id);
        if (p) {
          setPid(p.id);
          setW(WizardSchema.parse(p.doc ?? {}));
          created.current = p.createdAt;
          return;
        }
      }
      const fresh = newWizard();
      const goal = route.query.get('goal') as Goal | null;
      const style = route.query.get('style') as StyleId | null;
      if (goal && goal in GOALS) fresh.goal = goal;
      if (style && style in STYLES) fresh.style = style;
      if (fresh.goal) fresh.step = fresh.style ? 3 : 2;
      setPid(uid());
      created.current = Date.now();
      setW(fresh);
    })();
  }, [route.query]);

  // autosave once the user has picked a goal
  useEffect(() => {
    if (!w || !pid || !w.goal) return;
    const t = setTimeout(() => {
      saveProject({
        id: pid,
        name: w.content.product.name || w.content.topic || `فيديو ${GOALS[w.goal!].ar}`,
        createdAt: created.current,
        updatedAt: Date.now(),
        styleId: w.style ?? 'auto',
        goal: w.goal!,
        aspect: w.settings.aspect,
        cover: null,
        doc: w,
      });
      if (!route.query.get('project')) history.replaceState(null, '', `#/create?project=${pid}`);
    }, 400);
    return () => clearTimeout(t);
  }, [w, pid, route.query]);

  if (!w) return <Loader label="نجهّز الاستوديو..." />;
  const set = (patch: Partial<Wizard>) => setW({ ...w, ...patch });
  const setS = (patch: Partial<Wizard['settings']>) => setW({ ...w, settings: { ...w.settings, ...patch } });
  const setC = (patch: Partial<Wizard['content']>) => setW({ ...w, content: { ...w.content, ...patch } });
  const canNext = w.step === 1 ? !!w.goal : w.step === 2 ? !!w.style : true;
  const maxStep = !w.goal ? 1 : !w.style ? 2 : 7;

  return (
    <div className="pb-tabbar">
      <Progress step={w.step} max={maxStep} onGo={(n) => set({ step: n })} />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {w.step === 1 && (
          <StepFrame title="ماذا تريد أن تصنع؟" sub="اختيارك يحدد الأسئلة التالية والستايلات المقترحة.">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {(Object.keys(GOALS) as Goal[]).map((g) => (
                <Option key={g} active={w.goal === g} onClick={() => set({ goal: g })} icon={GOAL_ICON[g]} title={GOALS[g].ar} body={GOALS[g].hint} />
              ))}
            </div>
          </StepFrame>
        )}

        {w.step === 2 && (
          <StepFrame title="اختر الستايل" sub="المقترحة لهدفك في الأول. «اختيار تلقائي» يترك رسّام يختار مع السبب.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <Option active={w.style === 'auto'} onClick={() => set({ style: 'auto' })} icon="wand" title="اختيار تلقائي" body="رسّام يقرأ كلامك ويختار الستايل الأنسب، ويشرح لماذا." />
              {[...STYLE_LIST].sort((a, b) => Number(b.ready) * 10 + Number(!!w.goal && b.goals.includes(w.goal)) - (Number(a.ready) * 10 + Number(!!w.goal && a.goals.includes(w.goal)))).map((s) => (
                <Option key={s.id} active={w.style === s.id} onClick={() => s.ready && set({ style: s.id })} title={s.nameAr} body={s.ready ? s.goodForAr[0] : 'قريبًا — قيد فحص الجودة'}>
                  <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)]">
                    <StylePoster s={s} className="absolute inset-0 h-full w-full" />
                    <span className="absolute top-2 right-2">{s.ready ? <Badge tone="teal">جاهز</Badge> : <Badge>قريبًا</Badge>}</span>
                  </span>
                </Option>
              ))}
            </div>
          </StepFrame>
        )}

        {w.step === 3 && (
          <StepFrame title="المحتوى" sub="من أين يأتي الكلام؟">
            <Segmented
              label="مصدر الكلام"
              value={w.content.source}
              onChange={(source) => setC({ source })}
              options={[
                { value: 'script', label: 'أكتب النص' },
                { value: 'write-for-me', label: 'اكتب لي' },
                { value: 'voice', label: 'صوتي' },
                { value: 'video', label: 'فيديو لي' },
              ]}
            />
            <div className="mt-5 flex flex-col gap-5">
              {w.content.source === 'script' && (
                <Field label="السكريبت" hint="سطر لكل جملة. يظهر الكلام على الشاشة بنفس ترتيبه.">
                  <Textarea rows={8} value={w.content.script} onChange={(e) => setC({ script: e.target.value })} placeholder={'مثال:\nواش راك تخسر في الإعلانات بلا ما تعرف علاش؟\nالمشكل ماشي في المنتج...'} />
                </Field>
              )}
              {w.content.source === 'write-for-me' && (
                <>
                  <Field label="الموضوع أو المنتج" hint="رسّام يكتب السكريبت (يحتاج مفتاح Claude؛ بدونه نقترح قالبًا تعدّله).">
                    <Input value={w.content.topic} onChange={(e) => setC({ topic: e.target.value })} placeholder="مثال: فوائد شرب الماء في الصباح" />
                  </Field>
                  <Field label="لغة السكريبت">
                    <Segmented
                      value={w.content.scriptLang}
                      onChange={(scriptLang) => setC({ scriptLang })}
                      options={[
                        { value: 'darija', label: 'الدارجة' },
                        { value: 'msa', label: 'الفصحى' },
                        { value: 'fr', label: 'Français' },
                        { value: 'en', label: 'English' },
                      ]}
                    />
                  </Field>
                  <WriteForMe w={w} setW={setW} />
                </>
              )}
              {(w.content.source === 'voice' || w.content.source === 'video') && <MediaInputs w={w} setW={setW} />}
              {w.goal === 'ad' && (
                <div className="surface grid gap-4 rounded-[var(--radius-lg)] p-5 sm:grid-cols-2">
                  <h3 className="font-bold sm:col-span-2">معلومات المنتج</h3>
                  <Field label="اسم المنتج">
                    <Input value={w.content.product.name} onChange={(e) => setC({ product: { ...w.content.product, name: e.target.value } })} placeholder="مثال: ساعة كلاسيك" />
                  </Field>
                  <Field label="العرض">
                    <Input value={w.content.product.offer} onChange={(e) => setC({ product: { ...w.content.product, offer: e.target.value } })} placeholder="مثال: الثانية بنصف السعر" />
                  </Field>
                  <Field label="السعر (دج)">
                    <Input inputMode="numeric" dir="ltr" value={w.content.product.price} onChange={(e) => setC({ product: { ...w.content.product, price: e.target.value } })} placeholder="3900" />
                  </Field>
                  <Field label="السعر القديم (اختياري)">
                    <Input inputMode="numeric" dir="ltr" value={w.content.product.oldPrice} onChange={(e) => setC({ product: { ...w.content.product, oldPrice: e.target.value } })} placeholder="5500" />
                  </Field>
                  <Field label="واتساب">
                    <Input inputMode="tel" dir="ltr" value={w.content.product.whatsapp} onChange={(e) => setC({ product: { ...w.content.product, whatsapp: e.target.value } })} placeholder="0555 12 34 56" />
                  </Field>
                  <PhotoInputs w={w} setW={setW} />
                  <div className="flex flex-col">
                    <Toggle label="التوصيل لـ 58 ولاية" checked={w.content.product.delivery58} onChange={(delivery58) => setC({ product: { ...w.content.product, delivery58 } })} />
                    <Toggle label="الدفع عند الاستلام" checked={w.content.product.cod} onChange={(cod) => setC({ product: { ...w.content.product, cod } })} />
                  </div>
                </div>
              )}
            </div>
          </StepFrame>
        )}

        {w.step === 4 && (
          <StepFrame title="الإعدادات" sub="كل خيار يظهر أثره في المعاينة.">
            <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
              <div className="flex flex-col gap-5">
                <Field label="المقاس">
                  <Segmented value={w.settings.aspect} onChange={(aspect) => setS({ aspect })} options={ASPECTS.map((a) => ({ value: a, label: <span className="num">{a}</span> }))} />
                </Field>
                <Slider label="المدة" value={w.settings.duration} min={10} max={120} step={5} onChange={(duration) => setS({ duration })} format={(v) => `${v} ث`} />
                <Field label="الإيقاع">
                  <Segmented
                    value={w.settings.pace}
                    onChange={(pace) => setS({ pace })}
                    options={[
                      { value: 'calm', label: 'هادئ' },
                      { value: 'normal', label: 'عادي' },
                      { value: 'fast', label: 'سريع' },
                    ]}
                  />
                </Field>
                <Field label="التعليق الصوتي">
                  <Segmented
                    value={w.settings.voiceOver}
                    onChange={(voiceOver) => setS({ voiceOver })}
                    options={[
                      { value: 'none', label: 'بدون' },
                      { value: 'mine', label: 'صوتي' },
                      { value: 'ai', label: 'صوت ذكي' },
                    ]}
                  />
                </Field>
                <Field label="الموسيقى">
                  <Segmented
                    value={w.settings.music}
                    onChange={(music) => setS({ music })}
                    options={[
                      { value: 'calm', label: 'هادئة' },
                      { value: 'tech', label: 'تقنية' },
                      { value: 'bright', label: 'مبهجة' },
                      { value: 'none', label: 'بدون' },
                    ]}
                  />
                </Field>
                <Slider label="مستوى الموسيقى" value={Math.round(w.settings.musicVolume * 100)} min={0} max={100} onChange={(v) => setS({ musicVolume: v / 100 })} format={(v) => `${v}%`} />
                <Toggle label="خفض الموسيقى تحت الكلام" checked={w.settings.ducking} onChange={(ducking) => setS({ ducking })} />
                <Toggle label="المؤثرات الصوتية" checked={w.settings.sfx} onChange={(sfx) => setS({ sfx })} />
                <Toggle label="الترجمة المكتوبة" checked={w.settings.captions} onChange={(captions) => setS({ captions })} />
                {w.settings.captions && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="حجم الترجمة">
                      <Segmented
                        value={w.settings.captionSize}
                        onChange={(captionSize) => setS({ captionSize })}
                        options={[
                          { value: 's', label: 'صغير' },
                          { value: 'm', label: 'متوسط' },
                          { value: 'l', label: 'كبير' },
                        ]}
                      />
                    </Field>
                    <Field label="مكان الترجمة">
                      <Segmented
                        value={w.settings.captionPos}
                        onChange={(captionPos) => setS({ captionPos })}
                        options={[
                          { value: 'top', label: 'فوق' },
                          { value: 'middle', label: 'وسط' },
                          { value: 'bottom', label: 'تحت' },
                        ]}
                      />
                    </Field>
                  </div>
                )}
                <Toggle label="هوية علامتي وبطاقة النهاية" checked={w.settings.endCard} onChange={(endCard) => setS({ endCard })} />
              </div>
              <aside className="lg:sticky lg:top-36 lg:self-start">
                <AspectPreview w={w} />
              </aside>
            </div>
          </StepFrame>
        )}

        {w.step === 5 && (
          <StepFrame title="السكريبت والمشاهد" sub="هذه خطة الفيديو: أي مشهد يظهر على أي كلمة. عدّل ما تريد ثم انتقل للمعاينة.">
            <ScriptScenes w={w} setW={setW} />
          </StepFrame>
        )}
        {w.step === 6 && (
          <StepFrame title="المعاينة والتعديل" sub="شغّل الفيديو، غيّر اللون والإيقاع والموسيقى، واضغط على مشهد للذهاب إليه.">
            <Preview w={w} setW={setW} />
          </StepFrame>
        )}
        {w.step === 7 && (
          <StepFrame title="التصدير" sub="يُصنع الفيديو داخل هاتفك، بلا رفع ولا انتظار في طابور.">
            <Export w={w} setW={setW} name={w.content.product.name || w.content.topic || 'رسام'} />
          </StepFrame>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" icon="arrowR" onClick={() => (w.step > 1 ? set({ step: w.step - 1 }) : go('/'))}>
            {w.step > 1 ? 'السابق' : 'خروج'}
          </Button>
          {w.step < 7 && (
            <Button variant="spark" iconEnd="arrowL" disabled={!canNext} onClick={() => set({ step: w.step + 1 })}>
              التالي
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const StepFrame = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
  <section>
    <h1 className="text-[1.7rem] font-extrabold sm:text-[2rem]">{title}</h1>
    {sub && <p className="mt-1.5 mb-6 text-[var(--text-2)]">{sub}</p>}
    {children}
  </section>
);

/** live preview of aspect, caption size/position */
const AspectPreview = ({ w }: { w: Wizard }) => {
  const [a, b] = w.settings.aspect.split(':').map(Number) as [number, number];
  const st = w.style && w.style !== 'auto' ? STYLES[w.style] : STYLE_LIST[0]!;
  const size = { s: '0.62rem', m: '0.78rem', l: '0.95rem' }[w.settings.captionSize];
  const pos = { top: 'top-[10%]', middle: 'top-1/2 -translate-y-1/2', bottom: 'bottom-[12%]' }[w.settings.captionPos];
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[0.85rem] text-[var(--text-3)]">معاينة المقاس والترجمة</p>
      <div className="relative w-full max-w-[240px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] shadow-[var(--shadow-e3)] transition-[aspect-ratio] duration-300" style={{ aspectRatio: `${a}/${b}`, background: st.swatch[0] }}>
        <span className="absolute top-1/2 left-1/2 size-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60" style={{ background: st.swatch[2] }} />
        {w.settings.captions && (
          <span className={cx('absolute inset-x-3 rounded-md bg-black/55 px-2 py-1 text-center font-display font-bold text-white', pos)} style={{ fontSize: size }}>
            هذا مثال على <span style={{ color: w.settings.keywordColor || '#FFB45C' }}>الترجمة</span>
          </span>
        )}
      </div>
    </div>
  );
};
