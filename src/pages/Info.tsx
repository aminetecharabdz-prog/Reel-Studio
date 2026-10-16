import { BRAND } from '@/brand/config';
import { href } from '@/app/router';
import { Icon, type IconName } from '@/ui/Icon';
import { Mark } from '@/ui/Logo';
import { Button, Section } from '@/ui/kit';

const GUIDES: Array<{ icon: IconName; title: string; steps: string[] }> = [
  { icon: 'plus', title: 'أول فيديو في 5 دقائق', steps: ['اضغط «إنشاء» في الأسفل.', 'اختر الهدف (إعلان، شرح، قصة...).', 'اختر ستايلًا أو «اختيار تلقائي».', 'اكتب نصك أو سجّل صوتك.', 'راجع المشاهد ثم «صدّر» لتحميل الفيديو.'] },
  { icon: 'cart', title: 'إعلان لمنتجك', steps: ['اختر الهدف «إعلان منتج».', 'أضف من 1 إلى 5 صور للمنتج (يمكن حذف الخلفية).', 'اكتب الاسم والسعر والعرض والتوصيل ورقم الواتساب.', 'اضغط «اكتب لي السكريبت» إذا أضفت مفتاح Claude، أو اكتبه أنت.', 'صدّر وأيضًا «3 نسخ للإعلان» لتجربة أي بداية تبيع أكثر.'] },
  { icon: 'camera', title: 'فيديو تظهر فيه بنفسك', steps: ['صوّر نفسك عموديًا في مكان هادئ.', 'اختر الهدف «الظهور بالصورة» وارفع الفيديو.', 'رسّام يقطع الصمت، ويقرّب على الكلمات المهمة.', 'اختر شكل التركيب: أنت كامل، أنت فوق والرسم تحت، أو رسم يغطي الشاشة على الأفكار المهمة.'] },
  { icon: 'mic', title: 'صوتك أنت', steps: ['سجّل من داخل رسّام أو ارفع ملف صوت.', 'بدون مفاتيح: التوقيت تقديري.', 'مع ElevenLabs أو OpenAI: تفريغ كلمة بكلمة ودقة كاملة في ظهور الرسومات.'] },
  { icon: 'key', title: 'إضافة المفاتيح من الهاتف', steps: ['افتح «الإعدادات».', 'تحت كل خانة اضغط «كيف أحصل عليه من الهاتف؟» واتبع الخطوات.', 'المفتاح يبقى في هاتفك فقط.'] },
  { icon: 'download', title: 'التصدير والنشر', steps: ['من خطوة «التصدير» اختر 720p للسرعة أو 1080p للجودة.', 'الفيديو يُصنع داخل المتصفح ويُحمَّل في هاتفك.', 'حمّل أيضًا ملف الترجمة SRT وصورة الغلاف.'] },
];

export const HelpPage = () => (
  <Section title="المساعدة" kicker="شروحات قصيرة">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {GUIDES.map((g) => (
        <article key={g.title} className="surface flex flex-col gap-3 rounded-[var(--radius-lg)] p-5">
          <span className="grid size-11 place-items-center rounded-xl bg-[rgb(255_122_26/0.12)] text-[var(--color-spark)]">
            <Icon name={g.icon} size={22} />
          </span>
          <h2 className="text-[1.1rem] font-bold">{g.title}</h2>
          <ol className="flex list-inside list-decimal flex-col gap-1.5 text-[0.92rem] text-[var(--text-2)]">
            {g.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  </Section>
);

export const AboutPage = () => (
  <Section title={`عن ${BRAND.nameAr}`} kicker={BRAND.taglineAr}>
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="flex max-w-2xl flex-col gap-4 text-[1rem] leading-[1.9] text-[var(--text-2)]">
        <p>
          «رسّام» معناه الذي يرسم. فكرته بسيطة: أنت تتكلم، وهو يرسم. كل رسمة في الفيديو مربوطة بكلمة من كلامك، فتظهر في اللحظة التي تنطقها بالضبط.
        </p>
        <p>
          صُنع للعربية أولًا: الحروف لا تتقطع، الاتجاه من اليمين لليسار، والفرنسية والأرقام في مكانها الصحيح داخل الجملة. وصُنع للهاتف أولًا: من الفكرة إلى الفيديو المحمّل بدون حاسوب.
        </p>
        <h2 id="credits" className="mt-6 text-[1.3rem] font-bold text-[var(--text)]">الاعتمادات</h2>
        <ul className="flex flex-col gap-2 text-[0.95rem]">
          <li>
            <strong className="text-[var(--text)]">Motion Starter Kit by Motalim</strong> — منهج صناعة الفيديو والستايلات العشرة ومولّدات الصوت والموسيقى (رخصة MIT).{' '}
            <a href={BRAND.kitUrl} className="text-[var(--color-spark)] underline decoration-dotted" target="_blank" rel="noreferrer">
              الرابط
            </a>
          </li>
          <li>
            <strong className="text-[var(--text)]">Remotion</strong> — محرك الفيديو المبني على React.
          </li>
          <li>
            <strong className="text-[var(--text)]">Three.js</strong> — الرسوم ثلاثية الأبعاد في الصفحة الرئيسية.
          </li>
          <li>الخطوط: ألكسندريا، IBM Plex Sans Arabic، Space Grotesk وغيرها (رخصة SIL OFL).</li>
        </ul>
      </div>
      <div className="card grid aspect-square place-items-center rounded-[var(--radius-xl)] text-[var(--text)]">
        <Mark size={160} animate duration={2} />
      </div>
    </div>
  </Section>
);

export const LegalPage = ({ kind }: { kind: 'terms' | 'privacy' }) => (
  <Section title={kind === 'terms' ? 'شروط الاستعمال' : 'الخصوصية'} kicker="بكلام بسيط">
    <div className="flex max-w-2xl flex-col gap-4 leading-[1.9] text-[var(--text-2)]">
      {kind === 'privacy' ? (
        <>
          <p>رسّام لا يملك خادمًا يحفظ بياناتك. مشاريعك وصورك وصوتك ومفاتيحك تبقى في متصفح هاتفك (IndexedDB و localStorage).</p>
          <p>عندما تستعمل مفتاحًا (Claude، ElevenLabs، OpenAI، Google)، يُرسل المحتوى اللازم مباشرة من هاتفك إلى تلك الشركة فقط، حسب سياسة خصوصيتها.</p>
          <p>يمكنك تحميل نسخة من بياناتك أو مسحها كلها من «الإعدادات».</p>
        </>
      ) : (
        <>
          <p>الفيديوهات التي تصنعها ملكك، ويمكنك استعمالها تجاريًا. أنت مسؤول عن حقوق الصور والأصوات والفيديوهات التي ترفعها.</p>
          <p>الموسيقى والمؤثرات الصوتية مولّدة داخل رسّام وحرة الاستعمال في فيديوهاتك.</p>
          <p>تكلفة استعمال المفاتيح تُدفع لمزوّد الخدمة مباشرة؛ رسّام يعرض تقديرًا لها قبل كل عملية مدفوعة.</p>
        </>
      )}
      <Button variant="ghost" href={href('/')} icon="home" className="self-start">
        الرئيسية
      </Button>
    </div>
  </Section>
);
