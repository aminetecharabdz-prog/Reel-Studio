import { useEffect, useState, type ReactNode } from 'react';
import { Shell } from '../ui/Shell';
import { Btn, Card, Field, I, Seg, Spinner, Toggle, cx, inputCls } from '../ui/kit';
import { CLAUDE_MODELS, GEMINI_IMAGE_MODELS, patchSettings, saveSettings, SettingsSchema, useSettings, type Settings as S } from '@/data/settings';
import { ledger, type LedgerRow } from '@/data/db';
import { testClaudeKey } from '@/ai/claude';

const Section = ({ title, children, sub }: { title: string; sub?: string; children: ReactNode }) => (
  <Card className="space-y-4">
    <div>
      <h2 className="font-ar text-[18px] font-extrabold">{title}</h2>
      {sub && <p className="mt-1 text-[13px] leading-relaxed text-muted">{sub}</p>}
    </div>
    {children}
  </Card>
);

const Steps = ({ items }: { items: string[] }) => (
  <ol className="list-inside list-decimal space-y-1 text-[12.5px] leading-relaxed text-muted">{items.map((x) => <li key={x}>{x}</li>)}</ol>
);

const KeyField = ({ k, label, steps, test }: { k: keyof S['keys']; label: string; steps: string[]; test?: (v: string) => Promise<boolean> }) => {
  const s = useSettings();
  const [v, setV] = useState(s.keys[k]);
  const [show, setShow] = useState(false);
  const [st, setSt] = useState<'idle' | 'busy' | 'ok' | 'bad'>('idle');
  useEffect(() => setV(s.keys[k]), [s.keys, k]);
  const commit = (val: string) => patchSettings((x) => ({ ...x, keys: { ...x.keys, [k]: val.trim() } }));
  return (
    <div className="space-y-2">
      <Field label={label}>
        <div className="flex gap-2">
          <input data-testid={`key-${k}`} dir="ltr" type={show ? 'text' : 'password'} autoComplete="off" className={cx(inputCls, 'font-mono text-[13px]')} value={v} onChange={(e) => { setV(e.target.value); setSt('idle'); }} onBlur={() => commit(v)} placeholder="paste key…" />
          <Btn kind="soft" size="md" onClick={() => setShow(!show)} aria-label="show">{show ? <I.x size={16} /> : <I.key size={16} />}</Btn>
        </div>
      </Field>
      <div className="flex items-center gap-3">
        {test && v && (
          <Btn kind="ghost" size="sm" onClick={async () => { commit(v); setSt('busy'); try { setSt((await test(v.trim())) ? 'ok' : 'bad'); } catch { setSt('bad'); } }}>
            {st === 'busy' ? <Spinner size={14} /> : 'اختبر المفتاح'}
          </Btn>
        )}
        {st === 'ok' && <span className="text-[13px] text-mint">يخدم ✓</span>}
        {st === 'bad' && <span className="text-[13px] text-coral">ما خدمش، تأكد من المفتاح والرصيد</span>}
        {s.keys[k] && st === 'idle' && <span className="text-[12.5px] text-mint">محفوظ في هاتفك</span>}
      </div>
      <details className="rounded-xl bg-ink p-3">
        <summary className="cursor-pointer text-[13px] font-semibold text-muted">كيفاش نجيبو من الهاتف؟</summary>
        <div className="mt-2"><Steps items={steps} /></div>
      </details>
    </div>
  );
};

export const Settings = () => {
  const s = useSettings();
  const set = (fn: (x: S) => void) => patchSettings((x) => { fn(x); return x; });
  const [rows, setRows] = useState<LedgerRow[]>([]);
  useEffect(() => { ledger().then(setRows).catch(() => setRows([])); }, []);
  const month = rows.filter((r) => r.at > Date.now() - 30 * 864e5).reduce((a, r) => a + r.usd, 0);
  const model = CLAUDE_MODELS.find((m) => m.id === s.claudeModel) ?? CLAUDE_MODELS[0];
  const est = (25000 * model.inUsd * 0.35 + 9000 * model.outUsd) / 1e6 + (s.keys.gemini && s.imageQuality !== 'off' ? s.maxImages * (s.imageQuality === 'eco' ? 0.039 : 0.134) : 0) + (s.keys.elevenlabs ? 0.02 : 0);

  return (
    <Shell active="settings">
      <div className="mx-auto max-w-2xl space-y-5 pt-6 pb-12">
        <h1 className="font-ar text-[30px] font-black">الإعدادات</h1>

        <Section title="مفاتيح الذكاء الاصطناعي" sub="المفاتيح تبقى في هذا الهاتف فقط، وتروح مباشرة للشركة صاحبة الخدمة. ما نخزنوهاش عندنا.">
          <KeyField k="claude" label="Claude — المخرج (الأهم)" test={(v) => testClaudeKey(v, 'claude-haiku-5-5')} steps={['افتح console.anthropic.com وسجّل الدخول', 'اضغط Settings ثم API Keys', 'Create Key، انسخه والصقه هنا', 'زيد رصيد صغير من Billing (5$ تكفي لعشرات الفيديوهات)']} />
          <KeyField k="gemini" label="Gemini — الصور الواقعية" steps={['افتح aistudio.google.com', 'اضغط Get API key', 'Create API key، انسخه والصقه هنا']} />
          <KeyField k="elevenlabs" label="ElevenLabs — تفريغ صوتك وصوت طبيعي" steps={['افتح elevenlabs.io وسجّل', 'اضغط على صورتك ثم API Keys', 'Create، انسخ المفتاح والصقه هنا']} />
        </Section>

        <Section title="المخرج (Claude)">
          <Field label="النموذج">
            <div className="space-y-2">
              {CLAUDE_MODELS.map((m) => (
                <button key={m.id} onClick={() => set((x) => { x.claudeModel = m.id; })} className={cx('flex w-full items-center justify-between rounded-xl border px-4 py-3 text-start text-[14px]', s.claudeModel === m.id ? 'border-violet bg-violet/15' : 'border-line')}>
                  <span>{m.ar}</span>
                  <span className="text-[12px] text-muted" dir="ltr">${m.inUsd}/${m.outUsd} per M</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="عمق التفكير" hint="أعمق = إخراج أذكى، أبطأ وأغلى قليلا.">
            <Seg value={s.effort} onChange={(v) => set((x) => { x.effort = v; })} options={[{ v: 'low', label: 'سريع' }, { v: 'medium', label: 'متوازن' }, { v: 'high', label: 'عميق' }]} />
          </Field>
        </Section>

        <Section title="الصور (Gemini)">
          <Field label="الجودة">
            <Seg value={s.imageQuality} onChange={(v) => set((x) => { x.imageQuality = v; })} options={[{ v: 'full', label: 'كاملة' }, { v: 'eco', label: 'اقتصادية' }, { v: 'off', label: 'بدون صور' }]} />
          </Field>
          <Field label={`أقصى عدد صور في الفيديو: ${s.maxImages}`}>
            <input type="range" min={0} max={12} value={s.maxImages} onChange={(e) => set((x) => { x.maxImages = +e.target.value; })} className="w-full" />
          </Field>
          <Field label="نموذج الصور" hint="«تلقائي» يجرّب أحسن نموذج متاح لمفتاحك.">
            <select className={inputCls} value={s.geminiModel} onChange={(e) => set((x) => { x.geminiModel = e.target.value; })}>
              <option value="auto">تلقائي</option>
              {GEMINI_IMAGE_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </Section>

        <Section title="الصوت">
          <Field label="لغة الكلام">
            <Seg value={s.defaults.language} onChange={(v) => set((x) => { x.defaults.language = v; })} options={[{ v: 'ar-dz', label: 'دارجة' }, { v: 'ar', label: 'عربية' }, { v: 'fr', label: 'Français' }, { v: 'en', label: 'English' }]} />
          </Field>
          <Field label="صوت ElevenLabs (Voice ID)" hint="الصوت المستعمل كي تكتب النص بلا تسجيل.">
            <input dir="ltr" className={inputCls} value={s.voiceId} onChange={(e) => set((x) => { x.voiceId = e.target.value.trim(); })} />
          </Field>
          <Toggle on={s.defaults.sfx} onChange={(v) => set((x) => { x.defaults.sfx = v; })} label="مؤثرات صوتية افتراضيا" />
          <Field label={`قوة المؤثرات: ${Math.round(s.defaults.sfxLevel * 100)}%`}>
            <input type="range" min={0} max={1.5} step={0.05} value={s.defaults.sfxLevel} onChange={(e) => set((x) => { x.defaults.sfxLevel = +e.target.value; })} className="w-full" />
          </Field>
          <Field label={`مستوى الموسيقى الافتراضي: ${Math.round(s.defaults.musicVolume * 100)}%`}>
            <input type="range" min={0} max={1} step={0.05} value={s.defaults.musicVolume} onChange={(e) => set((x) => { x.defaults.musicVolume = +e.target.value; })} className="w-full" />
          </Field>
        </Section>

        <Section title="الفيديو الافتراضي">
          <Field label="الشكل"><Seg value={s.defaults.aspect} onChange={(v) => set((x) => { x.defaults.aspect = v; })} options={[{ v: '9:16', label: '9:16' }, { v: '4:5', label: '4:5' }, { v: '1:1', label: '1:1' }, { v: '16:9', label: '16:9' }]} /></Field>
          <Field label="الأرقام"><Seg value={s.defaults.digits} onChange={(v) => set((x) => { x.defaults.digits = v; })} options={[{ v: 'western', label: '123' }, { v: 'eastern', label: '١٢٣' }]} /></Field>
          <Field label="جودة التصدير"><Seg value={s.defaults.quality} onChange={(v) => set((x) => { x.defaults.quality = v; })} options={[{ v: '720', label: '720p' }, { v: '1080', label: '1080p' }]} /></Field>
          <Toggle on={s.defaults.captions} onChange={(v) => set((x) => { x.defaults.captions = v; })} label="ترجمة سفلية افتراضيا" />
          <Toggle on={s.endCard} onChange={(v) => set((x) => { x.endCard = v; })} label="بطاقة نهاية افتراضيا" />
          <Toggle on={s.safeOverlay} onChange={(v) => set((x) => { x.safeOverlay = v; })} label="بيّن مناطق واجهة تيك توك/إنستغرام في المعاينة" />
        </Section>

        <Section title="هوية علامتك" sub="كي تفعّلها، المخرج يستعمل ألوانك وحسابك في كل فيديو.">
          <Toggle on={s.brand.enabled} onChange={(v) => set((x) => { x.brand.enabled = v; })} label="فعّل هوية العلامة" />
          <Field label="اسم العلامة"><input className={inputCls} value={s.brand.name} onChange={(e) => set((x) => { x.brand.name = e.target.value; })} /></Field>
          <Field label="ألوان العلامة">
            <div className="flex flex-wrap items-center gap-2">
              {[0, 1, 2].map((i) => (
                <input key={i} type="color" value={s.brand.colors[i] ?? ['#7C5CFF', '#FF5B2E', '#FFC43D'][i]} onChange={(e) => set((x) => { const c = [...x.brand.colors]; while (c.length < i) c.push('#7C5CFF'); c[i] = e.target.value; x.brand.colors = c; })} className="h-11 w-11 rounded-xl border border-line bg-transparent" />
              ))}
              {s.brand.colors.length > 0 && <button className="text-[12.5px] text-muted underline" onClick={() => set((x) => { x.brand.colors = []; })}>مسح</button>}
            </div>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="الحساب"><input dir="ltr" className={inputCls} value={s.brand.handle} onChange={(e) => set((x) => { x.brand.handle = e.target.value; })} placeholder="@brand" /></Field>
            <Field label="الهاتف"><input dir="ltr" className={inputCls} value={s.brand.phone} onChange={(e) => set((x) => { x.brand.phone = e.target.value; })} /></Field>
          </div>
          <Field label="جملة الدعوة الافتراضية"><input className={inputCls} value={s.brand.cta} onChange={(e) => set((x) => { x.brand.cta = e.target.value; })} placeholder="اطلب دروك" /></Field>
        </Section>

        <Section title="التكلفة" sub="كل طلب مدفوع يتسجّل هنا (من هاتفك فقط).">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-ink p-4"><div className="text-[12.5px] text-muted">تقدير فيديو 60 ثانية</div><div className="mt-1 font-display text-[22px] font-black" dir="ltr">${est.toFixed(2)}</div></div>
            <div className="rounded-2xl bg-ink p-4"><div className="text-[12.5px] text-muted">آخر 30 يوم</div><div className="mt-1 font-display text-[22px] font-black" dir="ltr">${month.toFixed(2)}</div></div>
          </div>
          {rows.length > 0 && (
            <ul className="max-h-56 space-y-1 overflow-y-auto text-[12.5px] text-muted">
              {rows.slice(0, 40).map((r) => <li key={r.id} className="flex justify-between gap-2"><span>{new Date(r.at).toLocaleString('ar-DZ')} · {r.provider} {r.what}</span><span dir="ltr">${r.usd.toFixed(4)}</span></li>)}
            </ul>
          )}
        </Section>

        <Section title="البيانات">
          <div className="flex flex-wrap gap-2">
            <Btn kind="ghost" onClick={() => { const b = new Blob([JSON.stringify({ ...s, keys: { claude: '', gemini: '', elevenlabs: '' } }, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'motiq-settings.json'; a.click(); }}>تصدير الإعدادات (بدون مفاتيح)</Btn>
            <Btn kind="danger" onClick={() => { if (confirm('نرجّعو كل الإعدادات للأصل؟ المفاتيح تتمسح.')) saveSettings(SettingsSchema.parse({})); }} icon={<I.trash size={16} />}>إعادة الضبط</Btn>
          </div>
        </Section>
      </div>
    </Shell>
  );
};
