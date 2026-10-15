import { useEffect, useState, type ReactNode } from 'react';
import { getKeys, setKeys, type Keys } from '@/lib/providers/keys';
import { Button, Input, Label, Panel, Segmented } from '../components/ui';
import { BRAND } from '@/config/brand';

const Steps = ({ items }: { items: ReactNode[] }) => (
  <ol className="mt-2 list-decimal space-y-1 pr-5 text-[14px] leading-7 text-muted">{items.map((s, i) => <li key={i}>{s}</li>)}</ol>
);

const KeyField = ({ label, value, onChange, placeholder, test }: { label: string; value?: string; onChange: (v: string) => void; placeholder: string; test?: (v: string) => Promise<string> }) => {
  const [show, setShow] = useState(false);
  const [res, setRes] = useState<string | null>(null);
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input dir="ltr" type={show ? 'text' : 'password'} autoComplete="off" spellCheck={false} placeholder={placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value.trim())} />
        <Button size="md" variant="ghost" onClick={() => setShow(!show)} aria-label="إظهار">{show ? 'إخفاء' : 'إظهار'}</Button>
      </div>
      {test && value && (
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" variant="soft" onClick={async () => { setRes('جارٍ التجربة…'); try { setRes(await test(value)); } catch (e) { setRes(`✗ ${String(e instanceof Error ? e.message : e).slice(0, 120)}`); } }}>جرّب المفتاح</Button>
          {res && <span className={`text-[13px] ${res.startsWith('✓') ? 'text-mint' : 'text-rose'}`}>{res}</span>}
        </div>
      )}
    </div>
  );
};

const testClaude = async (k: string) => {
  const r = await fetch('https://api.anthropic.com/v1/models?limit=1', { headers: { 'x-api-key': k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 80)}`);
  return '✓ المفتاح يعمل';
};
const testEleven = async (k: string) => {
  const r = await fetch('https://api.elevenlabs.io/v1/models', { headers: { 'xi-api-key': k } });
  if (!r.ok) throw new Error(`${r.status}`);
  return '✓ المفتاح يعمل';
};
const testOpenAI = async (k: string) => {
  const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${k}` } });
  if (!r.ok) throw new Error(`${r.status}`);
  return '✓ المفتاح يعمل';
};

export const SettingsPage = () => {
  const [k, setK] = useState<Keys | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { getKeys().then(setK); }, []);
  if (!k) return null;
  const up = (patch: Partial<Keys>) => { setK({ ...k, ...patch }); setSaved(false); };
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-display text-[30px] font-bold">الإعدادات</h1>
      <Panel className="text-[15px] leading-7 text-muted">
        المفاتيح تُحفظ في متصفحك هذا فقط، ولا تُرسل إلا للمزوّد نفسه. بدونها يعمل {BRAND.nameAr} في <b className="text-mint">الوضع التجريبي</b>: المشاريع التجريبية، التصميم والتحريك المحلي، والتصدير — كلها مجانية.
      </Panel>

      <Panel className="space-y-3">
        <KeyField label="مفتاح Claude (التصميم الذكي والإخراج)" placeholder="sk-ant-..." value={k.anthropic} onChange={(v) => up({ anthropic: v })} test={testClaude} />
        <details className="rounded-xl bg-raised p-3">
          <summary className="cursor-pointer font-bold">كيف أحصل عليه من الهاتف؟</summary>
          <Steps items={[<>افتح <b dir="ltr">platform.claude.com</b> في كروم وسجّل الدخول (حساب منفصل عن اشتراك Pro).</>, <>اضغط القائمة ← <b>Billing</b> ← اشحن رصيدًا صغيرًا (مثلاً 5$).</>, <>القائمة ← <b>API Keys</b> ← <b>Create Key</b> ← اكتب اسمًا مثل «نبرة».</>, <>انسخ المفتاح (يبدأ بـ <span dir="ltr">sk-ant-</span>) والصقه هنا، ثم «احفظ».</>]} />
        </details>
      </Panel>

      <Panel className="space-y-3">
        <KeyField label="مفتاح ElevenLabs (تفريغ الصوت بتوقيت كل كلمة + التعليق الصوتي)" placeholder="sk_..." value={k.elevenlabs} onChange={(v) => up({ elevenlabs: v })} test={testEleven} />
        <details className="rounded-xl bg-raised p-3">
          <summary className="cursor-pointer font-bold">كيف أحصل عليه من الهاتف؟</summary>
          <Steps items={[<>افتح <b dir="ltr">elevenlabs.io</b> وأنشئ حسابًا.</>, <>اضغط على صورتك أعلى الصفحة ← <b>API Keys</b> (أو <b>Developers</b> ← <b>API Keys</b>).</>, <><b>Create API Key</b> ← فعّل صلاحية <b dir="ltr">Speech to Text</b> و <b dir="ltr">Text to Speech</b>.</>, <>انسخ المفتاح والصقه هنا.</>]} />
        </details>
      </Panel>

      <Panel className="space-y-3">
        <Label hint="إذا لم يوجد مفتاح: تفريغ مجاني داخل الهاتف (Whisper، أبطأ وأقل دقة)">مزوّد التفريغ</Label>
        <Segmented value={k.sttProvider ?? 'elevenlabs'} options={[{ value: 'elevenlabs', label: 'ElevenLabs' }, { value: 'openai', label: 'OpenAI' }]} onChange={(v) => up({ sttProvider: v })} />
        <KeyField label="مفتاح OpenAI (اختياري: تفريغ بديل أو صور)" placeholder="sk-..." value={k.openai} onChange={(v) => up({ openai: v })} test={testOpenAI} />
      </Panel>

      <Panel className="space-y-3">
        <Label hint="ينصح به: يولّد صورًا خاصة لكل مشهد مهم (شخصية ثابتة، منتجك في مواقف حقيقية) — الجودة الكاملة. الصور تُحفظ لإعادة الاستعمال">مزوّد الصور (اختياري)</Label>
        <Segmented value={k.imageProvider ?? 'none'} options={[{ value: 'none', label: 'بدون' }, { value: 'gemini', label: 'Gemini' }, { value: 'openai', label: 'OpenAI' }, { value: 'fal', label: 'fal' }]} onChange={(v) => up({ imageProvider: v })} />
        {k.imageProvider === 'gemini' && (
          <>
            <KeyField label="مفتاح Gemini" placeholder="AIza..." value={k.gemini} onChange={(v) => up({ gemini: v })} />
            <Steps items={[<>افتح <b dir="ltr">aistudio.google.com</b> بحساب Google.</>, <><b>Get API key</b> ← <b>Create API key</b>.</>, <>انسخه والصقه هنا (قد يطلب تفعيل الفوترة لنموذج الصور).</>]} />
          </>
        )}
        {k.imageProvider === 'fal' && (
          <>
            <KeyField label="مفتاح fal.ai" placeholder="key..." value={k.fal} onChange={(v) => up({ fal: v })} />
            <Steps items={[<>افتح <b dir="ltr">fal.ai</b> ← <b>Dashboard</b> ← <b>Keys</b> ← <b>Add key</b>.</>, <>انسخه والصقه هنا.</>]} />
          </>
        )}
        {k.imageProvider === 'openai' && !k.openai && <p className="text-[14px] text-rose">أضف مفتاح OpenAI أعلاه.</p>}
      </Panel>

      <div className="flex items-center gap-3">
        <Button size="lg" onClick={async () => { await setKeys(k); setSaved(true); }}>احفظ</Button>
        {saved && <span className="font-bold text-mint">تم الحفظ ✓</span>}
      </div>
      <p className="pb-6 text-[13px] leading-6 text-muted">
        التكلفة التقريبية لفيديو 60 ثانية بمفاتيحك: تفريغ ≈ <bdi dir="ltr">$0.01</bdi>، تصميم Claude ≈ <bdi dir="ltr">$0.08–0.15</bdi>، صور المشاهد (≈ 6 + ورقة أسلوب) ≈ <bdi dir="ltr">$0.25–0.30</bdi> — المجموع ≈ <bdi dir="ltr">$0.35–0.45</bdi>. <a className="underline" href="#/admin">سجل التكاليف</a>
      </p>
    </div>
  );
};
