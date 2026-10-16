import { useEffect, useState } from 'react';
import { BrandKitSchema, getBrandKit, saveBrandKit, type BrandKit } from '@/data/db';
import { Icon } from '@/ui/Icon';
import { Loader } from '@/ui/Logo';
import { Button, Field, Input, Section, Segmented, Toggle } from '@/ui/kit';

const FONTS: BrandKit['font'][] = ['Alexandria', 'IBM Plex Sans Arabic', 'Readex Pro', 'Noto Kufi Arabic', 'Changa', 'El Messiri'];

/** live preview of the end card with the brand kit applied */
const EndCardPreview = ({ b }: { b: BrandKit }) => {
  const [c1 = '#FF7A1A', c2 = '#0A141B'] = b.colors;
  return (
    <div className="mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] shadow-[var(--shadow-e3)]" style={{ background: c2 }}>
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center" style={{ fontFamily: b.font }}>
        {b.logo ? <img src={b.logo} alt="" className="size-20 rounded-2xl object-contain" /> : <span className="grid size-20 place-items-center rounded-2xl text-[2rem] font-bold" style={{ background: c1, color: c2 }}>{(b.name || 'ر').slice(0, 1)}</span>}
        <p className="text-[1.3rem] font-bold" style={{ color: '#fff' }}>
          {b.name || 'اسم علامتك'}
        </p>
        {b.endCard.line && <p className="text-[0.9rem]" style={{ color: '#ffffffb3' }}>{b.endCard.line}</p>}
        {(b.handles.whatsapp || b.handles.phone) && (
          <span className="num inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.85rem] font-bold" style={{ background: c1, color: c2 }} dir="ltr">
            {b.handles.whatsapp || b.handles.phone}
          </span>
        )}
        {b.handles.instagram && (
          <span className="latin text-[0.8rem]" style={{ color: '#ffffffb3' }} dir="ltr">
            @{b.handles.instagram.replace(/^@/, '')}
          </span>
        )}
      </div>
    </div>
  );
};

export const BrandKitPage = () => {
  const [b, setB] = useState<BrandKit | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    getBrandKit().then(setB).catch(() => setB(BrandKitSchema.parse({})));
  }, []);
  if (!b) return <Loader />;
  const set = (patch: Partial<BrandKit>) => {
    setSaved(false);
    setB({ ...b, ...patch });
  };
  const setHandle = (k: keyof BrandKit['handles'], v: string) => set({ handles: { ...b.handles, [k]: v } });

  return (
    <Section title="هوية علامتي" kicker="تظهر في كل فيديو تختاره">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="surface flex flex-col gap-5 rounded-[var(--radius-lg)] p-5">
            <Field label="اسم العلامة">
              <Input value={b.name} onChange={(e) => set({ name: e.target.value })} placeholder="مثال: متجر الأمل" />
            </Field>
            <Field label="الشعار" hint="صورة PNG بخلفية شفافة أفضل.">
              <div className="flex items-center gap-3">
                <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line-strong)] bg-[var(--surface)] px-4 text-[0.9rem] font-semibold">
                  <Icon name="upload" size={18} />
                  اختر صورة
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = () => set({ logo: String(r.result) });
                      r.readAsDataURL(f);
                    }}
                  />
                </label>
                {b.logo && (
                  <Button variant="ghost" size="sm" onClick={() => set({ logo: null })}>
                    إزالة
                  </Button>
                )}
              </div>
            </Field>
            <Field label="الألوان" hint="اللون الأول للأزرار والتمييز، والثاني للخلفية.">
              <div className="flex gap-3">
                {[0, 1].map((i) => (
                  <label key={i} className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-2)] px-2 py-1.5">
                    <input type="color" value={b.colors[i] ?? '#000000'} onChange={(e) => set({ colors: b.colors.map((c, j) => (j === i ? e.target.value : c)) })} className="size-8 cursor-pointer rounded border-0 bg-transparent" aria-label={`اللون ${i + 1}`} />
                    <span className="num text-[0.8rem] text-[var(--text-2)]" dir="ltr">
                      {b.colors[i]}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="الخط">
              <Segmented value={b.font} onChange={(font) => set({ font })} options={FONTS.slice(0, 3).map((f) => ({ value: f, label: <span style={{ fontFamily: f }}>{f === 'IBM Plex Sans Arabic' ? 'بلكس' : f === 'Readex Pro' ? 'ريدكس' : 'ألكسندريا'}</span> }))} />
            </Field>
          </div>

          <div className="surface flex flex-col gap-4 rounded-[var(--radius-lg)] p-5">
            <h3 className="font-bold">الحسابات والتواصل</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="واتساب">
                <Input dir="ltr" inputMode="tel" value={b.handles.whatsapp} onChange={(e) => setHandle('whatsapp', e.target.value)} placeholder="0555 12 34 56" />
              </Field>
              <Field label="الهاتف">
                <Input dir="ltr" inputMode="tel" value={b.handles.phone} onChange={(e) => setHandle('phone', e.target.value)} placeholder="0555 12 34 56" />
              </Field>
              <Field label="إنستغرام">
                <Input dir="ltr" value={b.handles.instagram} onChange={(e) => setHandle('instagram', e.target.value)} placeholder="@yourshop" />
              </Field>
              <Field label="تيك توك">
                <Input dir="ltr" value={b.handles.tiktok} onChange={(e) => setHandle('tiktok', e.target.value)} placeholder="@yourshop" />
              </Field>
            </div>
          </div>

          <div className="surface flex flex-col gap-3 rounded-[var(--radius-lg)] p-5">
            <Toggle label="بطاقة النهاية" hint="آخر ثانيتين: شعارك، اسمك، ورقمك." checked={b.endCard.enabled} onChange={(enabled) => set({ endCard: { ...b.endCard, enabled } })} />
            <Field label="جملة البطاقة">
              <Input value={b.endCard.line} onChange={(e) => set({ endCard: { ...b.endCard, line: e.target.value } })} placeholder="مثال: التوصيل لـ 58 ولاية" />
            </Field>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="spark"
              icon="check"
              onClick={async () => {
                await saveBrandKit(b);
                setSaved(true);
              }}
            >
              حفظ الهوية
            </Button>
            {saved && (
              <span role="status" className="text-[0.9rem] text-[var(--color-teal)]">
                تم الحفظ
              </span>
            )}
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-center text-[0.85rem] text-[var(--text-3)]">معاينة بطاقة النهاية</p>
          <EndCardPreview b={b} />
        </aside>
      </div>
    </Section>
  );
};
