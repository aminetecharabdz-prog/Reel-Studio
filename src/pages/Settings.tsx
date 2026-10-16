import { useState } from 'react';
import { clearSettings, setSettings, useSettings, type Settings } from '@/data/settings';
import { clearAllData, exportAllData } from '@/data/db';
import { Icon } from '@/ui/Icon';
import { Badge, Button, Field, Input, Section, Segmented } from '@/ui/kit';

type KeyId = keyof Settings['keys'];
const KEYS: Array<{ id: KeyId; name: string; role: string; required: boolean; placeholder: string; steps: string[] }> = [
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    role: 'المخرج الذكي: يكتب السكريبت ويخطط المشاهد ويختار الستايل.',
    required: false,
    placeholder: 'sk-ant-...',
    steps: ['افتح console.anthropic.com في كروم وسجّل الدخول.', 'اضغط القائمة ☰ ثم API Keys.', 'اضغط Create Key، سمّه «رسّام»، ثم Copy.', 'ارجع هنا والصق المفتاح في الخانة.', 'أضف رصيدًا صغيرًا من Billing (5 دولار تكفي لعشرات الفيديوهات).'],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    role: 'صوت طبيعي بالعربية والفرنسية، وتفريغ صوتك كلمة بكلمة بدقة.',
    required: false,
    placeholder: 'sk_...',
    steps: ['افتح elevenlabs.io وسجّل الدخول.', 'اضغط صورة حسابك ثم API Keys.', 'اضغط Create API Key ثم انسخه.', 'الصقه هنا.'],
  },
  {
    id: 'openai',
    name: 'OpenAI (اختياري)',
    role: 'بديل لتفريغ الصوت (Whisper) إذا لم يكن عندك ElevenLabs.',
    required: false,
    placeholder: 'sk-...',
    steps: ['افتح platform.openai.com وسجّل الدخول.', 'من القائمة اختر API keys.', 'اضغط Create new secret key ثم انسخه.', 'الصقه هنا.'],
  },
  {
    id: 'google',
    name: 'Google AI (اختياري)',
    role: 'صور مولّدة خاصة بفيديوك عندما لا تكفي مكتبة الرسومات.',
    required: false,
    placeholder: 'AIza...',
    steps: ['افتح aistudio.google.com وسجّل الدخول بحساب Google.', 'اضغط Get API key ثم Create API key.', 'انسخ المفتاح والصقه هنا.'],
  },
];

const KeyCard = ({ k }: { k: (typeof KEYS)[number] }) => {
  const s = useSettings();
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const value = s.keys[k.id];
  return (
    <div className="surface flex flex-col gap-3 rounded-[var(--radius-lg)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="latin text-[1.02rem] font-bold" dir="ltr" style={{ textAlign: 'right' }}>
            {k.name}
          </h3>
          <p className="mt-1 text-[0.88rem] text-[var(--text-2)]">{k.role}</p>
        </div>
        {value ? <Badge tone="teal">مضاف</Badge> : <Badge>غير مضاف</Badge>}
      </div>
      <div className="flex gap-2">
        <Input
          dir="ltr"
          type={show ? 'text' : 'password'}
          autoComplete="off"
          spellCheck={false}
          placeholder={k.placeholder}
          value={value}
          aria-label={`مفتاح ${k.name}`}
          onChange={(e) => setSettings((p) => ({ ...p, keys: { ...p.keys, [k.id]: e.target.value.trim() } }))}
        />
        <Button variant="outline" onClick={() => setShow((x) => !x)} aria-label={show ? 'إخفاء' : 'إظهار'}>
          {show ? 'إخفاء' : 'إظهار'}
        </Button>
      </div>
      <button type="button" onClick={() => setOpen((x) => !x)} className="inline-flex items-center gap-1.5 self-start text-[0.88rem] font-medium text-[var(--color-spark)]" aria-expanded={open}>
        <Icon name="help" size={17} />
        كيف أحصل عليه من الهاتف؟
      </button>
      {open && (
        <ol className="flex list-inside list-decimal flex-col gap-1.5 rounded-[var(--radius-md)] bg-[var(--bg-2)] p-4 text-[0.88rem] text-[var(--text-2)]">
          {k.steps.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
      )}
    </div>
  );
};

export const SettingsPage = () => {
  const s = useSettings();
  const [msg, setMsg] = useState('');
  const anyKey = Object.values(s.keys).some(Boolean);
  return (
    <Section title="الإعدادات" kicker="كل شيء يبقى في هاتفك">
      <div className={`mb-8 flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 ${anyKey ? 'border-[rgb(111_209_195/0.4)] bg-[rgb(111_209_195/0.08)]' : 'border-[rgb(255_122_26/0.4)] bg-[rgb(255_122_26/0.08)]'}`}>
        <Icon name={anyKey ? 'check' : 'info'} size={22} className={anyKey ? 'text-[var(--color-teal)]' : 'text-[var(--color-spark)]'} />
        <p className="text-[0.92rem]">
          {anyKey
            ? 'الوضع الكامل مفعّل للخدمات التي أضفت مفاتيحها. المفاتيح محفوظة في هذا المتصفح فقط.'
            : 'أنت في وضع التجربة: كل شيء يعمل بدون مفاتيح (مخطط محلي وصوت تقديري). أضف مفتاح Claude لتحصل على الكتابة والإخراج الذكي.'}
        </p>
      </div>

      <h2 className="mb-4 text-[1.25rem] font-bold">مفاتيح الخدمات</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {KEYS.map((k) => (
          <KeyCard key={k.id} k={k} />
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-[1.25rem] font-bold">المظهر واللغة</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="المظهر">
          <Segmented
            label="المظهر"
            value={s.theme}
            onChange={(theme) => setSettings({ theme })}
            options={[
              { value: 'dark', label: 'داكن' },
              { value: 'light', label: 'فاتح' },
              { value: 'system', label: 'حسب الهاتف' },
            ]}
          />
        </Field>
        <Field label="لغة الواجهة" hint="الواجهة بالعربية الآن؛ الفرنسية والإنجليزية في الطريق.">
          <Segmented
            label="لغة الواجهة"
            value={s.uiLang}
            onChange={(uiLang) => setSettings({ uiLang })}
            options={[
              { value: 'ar', label: 'العربية' },
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' },
            ]}
          />
        </Field>
        <Field label="الأرقام في الفيديو" hint="اختيار واحد للفيديو كله. الأرقام الغربية أوضح على الشاشة.">
          <Segmented
            label="الأرقام"
            value={s.digits}
            onChange={(digits) => setSettings({ digits })}
            options={[
              { value: 'western', label: '123' },
              { value: 'eastern', label: '١٢٣' },
            ]}
          />
        </Field>
        <Field label="الرسوم ثلاثية الأبعاد" hint="«خفيف» يوقف الرسم ثلاثي الأبعاد في الصفحة الرئيسية للهواتف الضعيفة.">
          <Segmented
            label="الأداء"
            value={s.perfMode}
            onChange={(perfMode) => setSettings({ perfMode })}
            options={[
              { value: 'auto', label: 'تلقائي' },
              { value: 'full', label: 'كامل' },
              { value: 'lite', label: 'خفيف' },
            ]}
          />
        </Field>
      </div>

      <h2 className="mt-12 mb-4 text-[1.25rem] font-bold">بياناتك</h2>
      <div className="surface flex flex-col gap-4 rounded-[var(--radius-lg)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.92rem] text-[var(--text-2)]">مشاريعك وهويتك ومفاتيحك محفوظة في هذا المتصفح فقط. يمكنك تحميل نسخة منها أو مسحها.</p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            icon="download"
            onClick={async () => {
              const data = await exportAllData();
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
              a.download = 'rassam-backup.json';
              a.click();
              setMsg('تم تحميل النسخة الاحتياطية.');
            }}
          >
            تحميل نسخة
          </Button>
          <Button
            variant="danger"
            icon="trash"
            onClick={async () => {
              if (!window.confirm('مسح كل المشاريع والهوية والمفاتيح من هذا المتصفح؟ لا يمكن التراجع.')) return;
              await clearAllData();
              clearSettings();
              setMsg('تم مسح كل البيانات.');
            }}
          >
            مسح كل شيء
          </Button>
        </div>
      </div>
      {msg && (
        <p role="status" className="mt-3 text-[0.9rem] text-[var(--color-teal)]">
          {msg}
        </p>
      )}
    </Section>
  );
};
