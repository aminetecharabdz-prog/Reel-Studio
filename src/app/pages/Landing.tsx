import { useEffect, useState } from 'react';
import { Thumbnail } from '@remotion/player';
import { BRAND } from '@/brand';
import { Reel } from '@/engine/render/Reel';
import { Shell } from '../ui/Shell';
import { Btn, I } from '../ui/kit';
import { ReelPlayer } from '../ui/ReelPlayer';
import { useDemo } from '../lib/useDemo';
import { DEMO_IDS } from '../demos';

const HEADLINE = ['صوتك،', 'يولّي', 'موشن', 'جرافيك.'];

const USES = [
  { icon: I.bag, title: 'للتجّار الإلكترونيين', body: 'صوّر منتوجك بالهاتف واكتب سطرين. الذكاء الاصطناعي يقطع الخلفية، يختار الألوان، ويبني إعلان بالسعر والعرض وزر الطلب.', mode: 'product' },
  { icon: I.text, title: 'لصنّاع المحتوى والمسوّقين', body: 'سجّل فكرتك بصوتك. كل كلمة تبان في وقتها، والكلمة المهمة تكبر وتتلوّن، مع صور تعبّر على المعنى.', mode: 'content' },
  { icon: I.play, title: 'لأصحاب يوتيوب شورتس', body: 'إيقاع سريع، خطّاف قوي في أول ثانيتين، وتنويع في المشاهد حتى ما يهربش المشاهد.', mode: 'content' },
  { icon: I.user, title: 'لفيديو شخص يتكلّم', body: 'ارفع فيديو وجهك. نقصّ السكتات، نزيد العناوين والرسومات حول وجهك، ونبدّل التخطيط مع الكلام.', mode: 'talking' },
];

const DemoTile = ({ id }: { id: string }) => {
  const { d, c } = useDemo(id);
  return (
    <a href={`#/demo/${id}`} data-testid={`demo-${id}`} className="group block w-[46vw] max-w-[230px] shrink-0 snap-start">
      <div dir="ltr" className="relative overflow-hidden rounded-[20px] border border-line bg-panel" style={{ aspectRatio: '9 / 16' }}>
        {c && <Thumbnail component={Reel} inputProps={{ c }} compositionWidth={c.width} compositionHeight={c.height} durationInFrames={c.durationInFrames} fps={c.fps} frameToDisplay={Math.round(c.scenes[Math.min(1, c.scenes.length - 1)]!.startF + 40)} style={{ width: '100%', height: '100%' }} />}
        <span className="absolute bottom-3 left-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink transition group-hover:scale-110"><I.play size={18} /></span>
      </div>
      <div className="mt-2.5 font-ar text-[14.5px] font-bold leading-snug">{d?.title ?? '…'}</div>
      <div className="text-[12.5px] text-muted">{d?.blurb}</div>
    </a>
  );
};

export const Landing = () => {
  const hero = useDemo('content');
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x >= HEADLINE.length ? x : x + 1)), 260);
    return () => clearInterval(t);
  }, []);
  return (
    <Shell active="">
      <section className="relative isolate grid items-center gap-10 overflow-x-clip pt-8 pb-14 md:grid-cols-[1.1fr_.9fr] md:pt-16">
        <div className="pointer-events-none absolute -top-24 start-[-30%] h-[420px] w-[420px] rounded-full bg-violet/25 blur-[110px]" />
        <div className="pointer-events-none absolute top-40 end-[-20%] h-[360px] w-[360px] rounded-full bg-coral/20 blur-[120px]" />
        <div className="relative">
          <h1 className="font-ar text-[54px] leading-[1.05] font-black tracking-tight sm:text-[76px] md:text-[92px]" aria-label={HEADLINE.join(' ')}>
            {HEADLINE.map((w, i) => (
              <span key={w} className={i === 2 || i === 3 ? 'grad-text' : ''} style={{ display: 'inline-block', opacity: i < n ? 1 : 0, transform: i < n ? 'none' : 'translateY(30%)', filter: i < n ? 'none' : 'blur(8px)', transition: 'all .55s cubic-bezier(.2,.9,.1,1)', marginInlineEnd: '0.22em' }}>
                {w}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-[34ch] text-[17px] leading-[1.75] text-muted">
            {BRAND.name} مخرج موشن جرافيك بالذكاء الاصطناعي. يسمع كلامك، يفهم الفكرة، ويصمّم فيديو ريلز احترافي: الألوان، الخطوط، الصور، الحركة والتوقيت على كل كلمة. بلا قوالب.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#/new"><Btn size="lg" data-testid="cta-start" icon={<I.spark size={20} />}>اصنع أول فيديو</Btn></a>
            <a href="#/demo/content"><Btn size="lg" kind="ghost" icon={<I.play size={18} />}>شوف مثال</Btn></a>
          </div>
          <div className="mt-8 flex items-center gap-4 text-[13px] text-muted">
            <div className="streaks w-14"><i style={{ width: '60%' }} /><i /><i style={{ width: '60%' }} /></div>
            يخدم من الهاتف، بالدارجة والعربية والفرنسية
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[330px]">
          <div className="absolute -inset-6 rounded-[44px] grad-bg opacity-30 blur-3xl" />
          <div className="relative rounded-[34px] border border-white/10 bg-black p-2 shadow-2xl">
            {hero.c ? <ReelPlayer c={hero.c} autoPlay muted loop controls={false} /> : <div style={{ aspectRatio: '9/16' }} />}
          </div>
          <div className="absolute -bottom-4 start-1/2 -translate-x-1/2 rounded-full border border-line bg-panel px-4 py-1.5 text-[12px] whitespace-nowrap text-muted rtl:translate-x-1/2">تصميم ذكي، بلا قوالب</div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="font-ar text-[30px] font-black sm:text-[40px]">واحد التطبيق، أربع خدمات</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {USES.map((u, i) => (
            <a key={u.title} href={`#/new?mode=${u.mode}`} className={`group relative overflow-hidden rounded-[28px] border border-line p-6 transition hover:border-violet/60 ${i === 0 ? 'bg-gradient-to-br from-violet/25 to-panel' : 'bg-panel'}`}>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-raised text-sun"><u.icon size={24} /></span>
              <h3 className="mt-5 font-ar text-[21px] font-extrabold">{u.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.8] text-muted">{u.body}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-ar text-[30px] font-black sm:text-[40px]">أمثلة صمّمها الذكاء الاصطناعي</h2>
        </div>
        <div className="-mx-4 mt-7 flex snap-x gap-4 overflow-x-auto px-4 pb-3">
          {DEMO_IDS.map((id) => <DemoTile key={id} id={id} />)}
        </div>
      </section>

      <section className="py-12">
        <h2 className="font-ar text-[30px] font-black sm:text-[40px]">كيفاش يخدم</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            ['سجّل أو اكتب', 'صوتك، نص مكتوب، صور منتوجك، أو فيديو وجهك.'],
            ['الذكاء الاصطناعي يخرج', 'Claude يحلّل الكلام ويقرّر كل مشهد. Gemini يصنع الصور الواقعية.'],
            ['عدّل وصدّر', 'بدّل الستايل بضغطة، غيّر الألوان والموسيقى، ونزّل MP4 جاهز للريلز.'],
          ].map(([t, b], i) => (
            <li key={t} className="relative ps-14">
              <span className="absolute start-0 top-0 font-display text-[40px] leading-none font-black text-line">{i + 1}</span>
              <h3 className="font-ar text-[19px] font-extrabold">{t}</h3>
              <p className="mt-1.5 text-[14.5px] leading-[1.8] text-muted">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      <Pricing />

      <footer className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-line py-8 text-[13px] text-muted sm:flex-row sm:items-center">
        <span>{BRAND.name} · {BRAND.nameAr}</span>
        <a href="#/credits" className="underline-offset-4 hover:underline">الحقوق والصور المستعملة</a>
      </footer>
    </Shell>
  );
};

export const Pricing = () => (
  <section id="pricing" className="py-12">
    <h2 className="font-ar text-[30px] font-black sm:text-[40px]">بالنقاط، تخلّص غير واش تستعمل</h2>
    <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.8] text-muted">النسخة التجريبية مجانية بمفاتيحك الخاصة. الدفع والنقاط راهم في الطريق: فيديو 60 ثانية كامل بالصور يكلّف تقريبا 6 نقاط.</p>
    <div className="mt-7 grid gap-4 md:grid-cols-3">
      {[
        { name: 'تجربة', price: '0 دج', pts: 'مفاتيحك الخاصة', items: ['كل الميزات', 'تصدير MP4 بدون علامة', 'المفاتيح تبقى في هاتفك'] },
        { name: 'منشئ', price: '1 900 دج', pts: '60 نقطة', items: ['حوالي 10 فيديوهات بالصور', 'صور Gemini واقعية', 'Claude للإخراج'], hot: true },
        { name: 'وكالة', price: '5 900 دج', pts: '220 نقطة', items: ['هوية العلامة التجارية', 'أولوية في المعالجة', 'عدة حسابات'] },
      ].map((p) => (
        <div key={p.name} className={`rounded-[28px] border p-6 ${p.hot ? 'border-violet/70 bg-gradient-to-b from-violet/20 to-panel' : 'border-line bg-panel'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-ar text-[19px] font-extrabold">{p.name}</h3>
            {p.hot && <span className="rounded-full bg-sun px-2.5 py-1 text-[11.5px] font-bold text-ink">الأكثر طلبا</span>}
          </div>
          <div className="mt-4 font-ar text-[34px] font-black">{p.price}</div>
          <div className="text-[13px] text-muted">{p.pts}</div>
          <ul className="mt-5 space-y-2 text-[14px]">
            {p.items.map((it) => <li key={it} className="flex items-center gap-2"><span className="text-mint"><I.check size={16} /></span>{it}</li>)}
          </ul>
          {p.name !== 'تجربة' && <div className="mt-5 text-[12px] text-muted">الدفع قريبا</div>}
        </div>
      ))}
    </div>
  </section>
);
