import { useEffect, useRef, useState } from 'react';
import { BRAND } from '@/brand/config';
import { href } from '@/app/router';
import { resolvedTheme, useSettings } from '@/data/settings';
import { STYLE_LIST } from '@/styles/catalog';
import { Icon, type IconName } from '@/ui/Icon';
import { Mark } from '@/ui/Logo';
import { Badge, Button, Section } from '@/ui/kit';
import { StyleTile } from './StyleTile';

const Hero3D = () => {
  const host = useRef<HTMLDivElement>(null);
  const s = useSettings();
  const light = resolvedTheme(s) === 'light';
  const [mode, setMode] = useState<'pending' | '3d' | 'static'>('pending');
  useEffect(() => {
    let disposed = false;
    let handle: { dispose: () => void } | undefined;
    (async () => {
      const mod = await import('@/three/hero3d');
      if (disposed) return;
      const want = s.perfMode === 'full' || (s.perfMode === 'auto' && mod.canRun3D());
      if (!want || !host.current) return setMode('static');
      try {
        handle = mod.mountHero(host.current, { light });
        setMode('3d');
      } catch {
        setMode('static');
      }
    })();
    return () => {
      disposed = true;
      handle?.dispose();
    };
  }, [light, s.perfMode]);
  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true" data-hero={mode}>
      {mode !== '3d' && <StaticHero />}
    </div>
  );
};

/** fallback for weak devices / reduced motion: the self-drawing mark over a fan of style frames */
const StaticHero = () => (
  <div className="absolute inset-0 flex items-start justify-center pt-6 lg:items-center lg:justify-start lg:pt-0 lg:pl-[8%]">
    <div className="relative h-[300px] w-[300px] lg:h-[440px] lg:w-[440px]">
      {STYLE_LIST.slice(0, 5).map((st, i) => (
        <div
          key={st.id}
          className="absolute top-1/2 left-1/2 h-[46%] w-[26%] rounded-xl border border-[var(--line)] shadow-[var(--shadow-e2)]"
          style={{ background: st.swatch[0], transform: `translate(-50%,-50%) rotate(${(i - 2) * 14}deg) translateY(-34%)`, transformOrigin: '50% 140%' }}
        >
          <span className="absolute right-[18%] bottom-[16%] h-[6%] w-[45%] rounded" style={{ background: st.swatch[1] }} />
          <span className="absolute top-[30%] left-1/2 size-[28%] -translate-x-1/2 rounded-full" style={{ background: st.swatch[2] }} />
        </div>
      ))}
      <div className="absolute inset-0 grid place-items-center text-[var(--text)]">
        <Mark size={170} animate duration={2.2} />
      </div>
    </div>
  </div>
);

const PATHS: Array<{ id: string; icon: IconName; title: string; body: string; points: string[]; to: string }> = [
  {
    id: 'ecom',
    icon: 'cart',
    title: 'التجارة الإلكترونية',
    body: 'صوّر منتجك بالهاتف، اكتب السعر والعرض، وخذ إعلانًا جاهزًا للنشر.',
    points: ['صورة المنتج بطل كل مشهد', 'السعر، التخفيض، والتوصيل لـ 58 ولاية', 'زر واتساب أو الهاتف في الأخير'],
    to: '/create?goal=ad',
  },
  {
    id: 'creators',
    icon: 'spark',
    title: 'صنّاع المحتوى',
    body: 'شرح، قصة، أو أرقام — اكتب الفكرة أو أعطنا صوتك، ورسّام يرسم الباقي.',
    points: ['يكتب لك السكريبت بالدارجة أو الفصحى', 'رسومات تظهر على الكلمة بالضبط', 'عشرة ستايلات مرسومة'],
    to: '/create?goal=explainer',
  },
  {
    id: 'talking',
    icon: 'camera',
    title: 'الظهور بالصورة',
    body: 'صوّر نفسك وأنت تتكلم، ونحن نقطع الصمت ونرسم المونتاج حولك.',
    points: ['حذف الصمت والتأتأة تلقائيًا', 'زووم على الكلمات المهمة', 'رسومات الستايل حولك وترجمة مكتوبة'],
    to: '/create?goal=talking',
  },
];

const STEPS = [
  { title: 'اختر هدفك', body: 'إعلان، شرح، قصة، أرقام، أو فيديو تظهر فيه بنفسك.' },
  { title: 'اختر الستايل', body: 'واحد من عشرة ستايلات مرسومة، أو دع رسّام يختار لك مع السبب.' },
  { title: 'أعطه كلامك', body: 'صوتك، فيديو لك، سكريبت مكتوب، أو اطلب منه يكتب السكريبت.' },
  { title: 'عدّل وصدّر', body: 'كل مشهد قابل للتعديل، ثم حمّل الفيديو MP4 مباشرة على هاتفك.' },
];

const FAQ = [
  { q: 'هل أحتاج حاسوبًا؟', a: 'لا. رسّام مصمم للهاتف أولًا: تصنع الفيديو وتعدّله وتحمّله من متصفح الهاتف.' },
  { q: 'هل يعمل بدون مفاتيح API؟', a: 'نعم، في وضع التجربة: مخطط محلي يرسم الفيديو من كلامك، وصوت تقديري. المفاتيح تعطيك الذكاء الكامل (كتابة السكريبت، تفريغ صوتك، صوت طبيعي).' },
  { q: 'أين تبقى مفاتيحي ومشاريعي؟', a: 'في هاتفك فقط. لا نرفعها إلى أي خادم لنا؛ المفتاح يُرسل مباشرة إلى الشركة صاحبته عند الاستعمال.' },
  { q: 'هل يكتب بالدارجة الجزائرية؟', a: 'نعم: الدارجة، الفصحى، الفرنسية، والإنجليزية — مع ترتيب صحيح للعربية مع الفرنسية والأرقام.' },
  { q: 'ما الصيغ المتاحة؟', a: 'طولي 9:16 للريلز، 4:5 للمنشورات، مربع 1:1، وعرضي 16:9 — كل ستايل مُعاد تصميمه لكل صيغة، بدون أشرطة سوداء.' },
  { q: 'هل يمكنني استعمال الفيديو تجاريًا؟', a: 'نعم، الفيديو الذي تصنعه لك. الموسيقى والمؤثرات مولّدة داخل رسّام وحرة الاستعمال.' },
];

export const Landing = () => (
  <>
    {/* HERO */}
    <section className="drafting-grid relative isolate overflow-hidden border-b border-[var(--line)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_30%_40%,rgb(255_122_26/0.12),transparent_70%)]" />
      <div className="relative mx-auto grid min-h-[min(860px,calc(100dvh-64px))] max-w-6xl grid-rows-[340px_auto] px-4 sm:px-6 lg:grid-cols-2 lg:grid-rows-1">
        <div className="relative -mx-4 sm:-mx-6 lg:order-2 lg:mx-0">
          <Hero3D />
        </div>
        <div className="relative z-10 flex flex-col justify-center gap-6 pb-14 lg:order-1 lg:pb-0">
          <Badge tone="spark">عشرة ستايلات · العربية أولًا</Badge>
          <h1 className="text-[2.6rem] leading-[1.25] font-extrabold sm:text-[3.6rem]">{BRAND.taglineAr}</h1>
          <p className="max-w-lg text-[1.05rem] text-[var(--text-2)] sm:text-[1.15rem]">
            اكتب فكرتك أو سجّل صوتك، ورسّام يرسم حولها فيديو موشن احترافي: كل رسمة تظهر على كلمتها، والعربية مكتوبة صح.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="spark" size="lg" href={href('/create')} icon="plus">
              ابدأ مجانًا
            </Button>
            <Button variant="outline" size="lg" href={href('/styles')} icon="palette">
              شاهد الستايلات
            </Button>
          </div>
          <p className="text-[0.85rem] text-[var(--text-3)]">بدون حساب. يعمل على الهاتف. مشاريعك تبقى عندك.</p>
        </div>
      </div>
    </section>

    {/* AUDIENCE PATHS */}
    <Section title="لمن رسّام؟" kicker="ثلاثة طرق للبدء">
      <div className="grid gap-4 md:grid-cols-3">
        {PATHS.map((p) => (
          <a key={p.id} href={href(p.to)} className="card group relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--line-strong)]">
            <span className="grid size-12 place-items-center rounded-2xl bg-[rgb(255_122_26/0.12)] text-[var(--color-spark)]">
              <Icon name={p.icon} size={24} />
            </span>
            <h3 className="text-[1.35rem] font-extrabold">{p.title}</h3>
            <p className="text-[0.95rem] text-[var(--text-2)]">{p.body}</p>
            <ul className="mt-1 flex flex-col gap-2 text-[0.9rem]">
              {p.points.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Icon name="check" size={18} className="mt-0.5 shrink-0 text-[var(--color-teal)]" />
                  {x}
                </li>
              ))}
            </ul>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-display text-[0.92rem] font-semibold text-[var(--color-spark)]">
              ابدأ من هنا
              <Icon name="arrowL" size={18} className="transition group-hover:-translate-x-1" />
            </span>
          </a>
        ))}
      </div>
    </Section>

    {/* STYLE GALLERY */}
    <div className="border-y border-[var(--line)] bg-[var(--bg-2)]">
      <Section
        title="عشرة ستايلات، كل واحد بصانعه"
        kicker="معرض الستايلات"
        action={
          <Button variant="ghost" size="sm" href={href('/styles')} iconEnd="arrowL">
            الكل
          </Button>
        }
      >
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {STYLE_LIST.map((s) => (
            <StyleTile key={s.id} s={s} />
          ))}
        </div>
      </Section>
    </div>

    {/* HOW IT WORKS */}
    <Section title="كيف يعمل؟" kicker="أربع خطوات">
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="surface relative flex flex-col gap-2 rounded-[var(--radius-lg)] p-5">
            <span className="num grid size-9 place-items-center rounded-full border border-[var(--line-strong)] text-[0.95rem] font-bold text-[var(--color-spark)]">{i + 1}</span>
            <h3 className="text-[1.1rem] font-bold">{s.title}</h3>
            <p className="text-[0.92rem] text-[var(--text-2)]">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>

    {/* FAQ */}
    <Section title="أسئلة متكررة" kicker="قبل أن تبدأ">
      <div className="grid gap-3 md:grid-cols-2">
        {FAQ.map((f) => (
          <details key={f.q} className="surface group rounded-[var(--radius-md)] p-5 open:border-[var(--line-strong)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-[1rem] font-semibold">
              {f.q}
              <Icon name="plus" size={18} className="shrink-0 text-[var(--text-3)] transition group-open:rotate-45" />
            </summary>
            <p className="mt-3 text-[0.93rem] text-[var(--text-2)]">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>

    {/* FINAL CTA */}
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="card relative overflow-hidden rounded-[var(--radius-xl)] p-8 sm:p-12">
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(255_122_26/0.35),transparent_70%)]" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.7rem] font-extrabold sm:text-[2.2rem]">فيديوك الأول في دقائق</h2>
            <p className="mt-2 text-[var(--text-2)]">جرّب الآن بدون مفاتيح وبدون حساب.</p>
          </div>
          <Button variant="spark" size="lg" href={href('/create')} icon="plus">
            ابدأ مجانًا
          </Button>
        </div>
      </div>
    </section>
  </>
);
