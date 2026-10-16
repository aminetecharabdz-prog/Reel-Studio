import { href } from '@/app/router';
import { GOALS, STYLES, STYLE_LIST, type StyleId } from '@/styles/catalog';
import { Icon } from '@/ui/Icon';
import { Badge, Button, Section } from '@/ui/kit';
import { StylePoster, StyleTile } from './StyleTile';

export const StylesPage = () => (
  <Section title="الستايلات العشرة" kicker="اختر الأسلوب الذي يشبه فكرتك">
    <p className="-mt-3 mb-8 max-w-2xl text-[var(--text-2)]">
      كل ستايل محرّك رسم كامل: ألوانه، خطوطه، حركته، ومكتبة رسوماته. داخل نفس الستايل، كل فيديو يُخطَّط من كلامك أنت — لا قالب ثابت.
    </p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {STYLE_LIST.map((s) => (
        <StyleTile key={s.id} s={s} />
      ))}
    </div>
  </Section>
);

const ASPECT_AR: Record<string, string> = { '9:16': 'طولي 9:16', '4:5': 'منشور 4:5', '1:1': 'مربع 1:1', '16:9': 'عرضي 16:9' };

export const StylePage = ({ id }: { id: string }) => {
  const s = STYLES[id as StyleId];
  if (!s) return <NotFoundInline />;
  const others = STYLE_LIST.filter((x) => x.id !== s.id).slice(0, 4);
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:py-16">
        <div className="card overflow-hidden rounded-[var(--radius-xl)]">
          <div className="relative aspect-[9/14]">
            <StylePoster s={s} className="absolute inset-0 h-full w-full" />
            {!s.ready && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
                <p className="text-[0.9rem]">المعاينة الحية تظهر هنا عندما يجتاز الستايل فحص الجودة.</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {s.ready ? <Badge tone="teal">جاهز</Badge> : <Badge tone="soon">قريبًا — قيد فحص الجودة</Badge>}
            <Badge>{s.nameEn}</Badge>
          </div>
          <h1 className="text-[2.2rem] font-extrabold sm:text-[2.8rem]">{s.nameAr}</h1>
          <p className="max-w-xl text-[1.08rem] text-[var(--text-2)]">{s.lookAr}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface rounded-[var(--radius-lg)] p-5">
              <h2 className="mb-3 text-[1rem] font-bold">يناسب</h2>
              <ul className="flex flex-col gap-2 text-[0.93rem]">
                {s.goodForAr.map((g) => (
                  <li key={g} className="flex items-start gap-2">
                    <Icon name="check" size={18} className="mt-0.5 shrink-0 text-[var(--color-teal)]" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface rounded-[var(--radius-lg)] p-5">
              <h2 className="mb-3 text-[1rem] font-bold">أفضل الصيغ</h2>
              <div className="flex flex-wrap gap-2">
                {(s.nativeAspect === '9:16' ? ['9:16', '4:5', '1:1', '16:9'] : ['16:9', '9:16', '1:1', '4:5']).map((a, i) => (
                  <Badge key={a} tone={i === 0 ? 'spark' : 'neutral'}>
                    {ASPECT_AR[a]}
                  </Badge>
                ))}
              </div>
              <h2 className="mt-5 mb-3 text-[1rem] font-bold">الأهداف</h2>
              <div className="flex flex-wrap gap-2">
                {s.goals.map((g) => (
                  <Badge key={g}>{GOALS[g].ar}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="spark" size="lg" icon="wand" href={href(`/create?style=${s.id}`)} disabled={!s.ready}>
              استعمل هذا الستايل
            </Button>
            <Button variant="ghost" size="lg" href={href('/styles')} iconEnd="arrowL">
              كل الستايلات
            </Button>
          </div>
        </div>
      </section>
      <Section title="ستايلات أخرى" kicker="قارن">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {others.map((o) => (
            <StyleTile key={o.id} s={o} />
          ))}
        </div>
      </Section>
    </>
  );
};

export const NotFoundInline = () => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
    <h1 className="text-[1.8rem] font-extrabold">الصفحة غير موجودة</h1>
    <p className="text-[var(--text-2)]">الرابط قديم أو فيه خطأ. ارجع إلى الرئيسية وابدأ من هناك.</p>
    <Button variant="spark" href={href('/')} icon="home">
      الرئيسية
    </Button>
  </div>
);
