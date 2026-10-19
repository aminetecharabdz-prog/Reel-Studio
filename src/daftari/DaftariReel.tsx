import type { ReactNode } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { arabicStack, colors, glassStyle, latinStack } from "../brand";
import { Caption } from "../components/Caption";
import { at, timeline } from "./timeline";
import { Accent, Appear, Backdrop, Counter, IconChip, Line, Logo, Phone, Pill, Row, Scene, Strike, Tile } from "./primitives";
import {
  IconAbsent, IconArrowUp, IconBell, IconBook, IconCalendar, IconChart, IconChat, IconCheck, IconCloud, IconFile,
  IconLock, IconOffline, IconQuestion, IconStar, IconTimer, IconUser, IconUsers,
} from "./icons";

/** Visuals enter a few frames before their key word. */
const LEAD = 4;

type SceneDef = {
  /** Phrase (or [phrase, occurrence]) whose first word starts the scene. */
  anchor: string | [string, number];
  /** Render with `l(phrase)` = local frame of a phrase inside this scene. */
  render: (l: (phrase: string, occurrence?: number) => number, duration: number) => ReactNode;
  whoosh?: boolean;
  /** Extra sound effects: [phrase, occurrence, sound]. */
  sfx?: [string, number, "tap" | "chime"][];
};

const ArrowBob: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ color: colors.coral, transform: `translateY(${Math.sin(frame / 7) * 12}px)` }}>
      <IconArrowUp size={150} />
    </div>
  );
};

/** Rows that drift apart slightly once "الفوضى زادت" is said. */
const Messy: React.FC<{ at: number; i: number; children: ReactNode }> = ({ at: chaosAt, i, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - chaosAt, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rot = [-3, 2.5, -2, 3][i % 4] * p;
  const dx = [-18, 22, -14, 16][i % 4] * p;
  return <div style={{ width: "100%", transform: `translateX(${dx}px) rotate(${rot}deg)` }}>{children}</div>;
};

const SCENES: SceneDef[] = [
  // 1. Hook
  {
    anchor: "يا أستاذ",
    render: (l) => (
      <>
        <Line from={l("يا أستاذ")} size={190}>يا <Accent>أستاذ</Accent>…</Line>
        <Line from={l("أنت اللي يبني")} size={110}>يبني <Accent>مستقبل</Accent></Line>
      </>
    ),
  },
  // 2. Story: "ما نقدرش" → success
  {
    anchor: "تلميذ كان يقول",
    whoosh: true,
    render: (l) => (
      <>
        <Line from={l("تلميذ كان يقول")} size={130}>«<Strike at={l("وعلى يدك نجح")}>ما نقدرش</Strike>»</Line>
        <Row from={l("نجح في الباك")} icon={<IconCheck size={56} />} width="auto" size={72}>نجح في الباك</Row>
      </>
    ),
  },
  // 3. Behind every success
  {
    anchor: "وراء كل نجاح",
    render: (l) => (
      <>
        <Line from={l("وراء كل نجاح")} size={110}>وراء كل نجاح…</Line>
        <Line from={l("كاين أستاذ")} size={170}>كاين <Accent>أستاذ</Accent></Line>
      </>
    ),
  },
  // 4. Question turn
  {
    anchor: "لكن خلّيني نسقسيك",
    whoosh: true,
    render: (l) => (
      <>
        <div style={{ ...glassStyle, borderRadius: 999, padding: 50, color: colors.coral, display: "flex" }}>
          <Appear from={l("لكن خلّيني")}><IconQuestion size={240} /></Appear>
        </div>
        <Line from={l("نسقسيك")} size={100}>خلّيني نسقسيك</Line>
      </>
    ),
  },
  // 5. Pain points stack up, then chaos
  {
    anchor: "شحال من مرة نسيت",
    render: (l) => (
      <>
        {[
          [l("شحال من مرة نسيت"), <IconBook size={56} />, "وين حبست مع الفوج؟"],
          [l("شحال من مرة ام"), <IconUser size={56} />, "«كيفاش راه وليدي؟»"],
          [l("شحال من مرة تلميذ"), <IconAbsent size={56} />, "غاب ثلاث مرات"],
          [l("وشحال من مرة"), <IconFile size={56} />, "الكراس ضاع"],
        ].map(([from, icon, text], i) => (
          <Messy key={i} at={l("والفوضى زادت")} i={i}>
            <Row from={from as number} icon={icon as ReactNode} muted size={58}>{text as string}</Row>
          </Messy>
        ))}
      </>
    ),
    sfx: [["شحال من مرة نسيت", 1, "tap"], ["شحال من مرة ام", 1, "tap"], ["شحال من مرة تلميذ", 1, "tap"], ["وشحال من مرة", 1, "tap"]],
  },
  // 6. A noble job doesn't deserve notebook + memory
  {
    anchor: "مهنة نبيلة",
    whoosh: true,
    render: (l) => (
      <>
        <Line from={l("مهنة نبيلة")} size={160}>مهنة <Accent>نبيلة</Accent></Line>
        <Line from={l("ما تستاهلش")} size={96} style={{ display: "flex", gap: 60 }}>
          <Strike at={l("بكراس وذاكرة")}>كراس</Strike>
          <Strike at={l("وذاكرة")}>ذاكرة</Strike>
        </Line>
      </>
    ),
  },
  // 7. Daftari reveal
  {
    anchor: "وهذا علاش صنعنا",
    whoosh: true,
    render: (l) => (
      <>
        <Logo from={l("دفتري")} width={760} />
        <div style={{ display: "flex", gap: 24 }}>
          <Pill from={l("تطبيق جزائري")}>تطبيق جزائري</Pill>
          <Pill from={l("مصمّم خصيصاً")}>للأستاذ الخصوصي</Pill>
        </div>
      </>
    ),
  },
  // 8. Every problem has a solution
  {
    anchor: "وكل مشكل حكيناه",
    render: (l) => (
      <>
        <Line from={l("وكل مشكل حكيناه")} size={120}>كل مشكل…</Line>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Line from={l("عندو حل")} size={170}>عندو <Accent>حل</Accent></Line>
          <Appear from={l("حل")}><IconChip size={130}><IconCheck size={84} /></IconChip></Appear>
        </div>
      </>
    ),
  },
  // 9. Programme per group
  {
    anchor: "نسيت وين وصلت",
    whoosh: true,
    render: (l) => (
      <>
        <Pill from={l("نسيت وين وصلت")} icon={<IconQuestion size={48} />}>نسيت وين وصلت؟</Pill>
        <Phone from={l("نسيت وين وصلت") + 8} src="daftari/groups.jpg" height={820} focus={{ at: l("البرنامج تاع"), y: 0.39, scale: 1.4 }} />
      </>
    ),
  },
  // 10. Student file
  {
    anchor: "الولي يسقسي",
    whoosh: true,
    render: (l) => (
      <>
        <Pill from={l("الولي يسقسي")} icon={<IconQuestion size={48} />}>الولي يسقسي؟</Pill>
        <div style={{ ...glassStyle, width: "100%", boxSizing: "border-box", padding: 44, display: "flex", flexDirection: "column", gap: 26 }}>
          <Line from={l("عندك ملف")} size={76} style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <span style={{ color: colors.coral, display: "flex" }}><IconFile size={70} /></span> ملف كامل لكل تلميذ
          </Line>
          <Row from={l("الحضور")} icon={<IconCheck size={56} />} size={60}>الحضور</Row>
          <Row from={l("النقاط")} icon={<IconChart size={56} />} size={60}>النقاط</Row>
          <Row from={l("ونقاط الضعف")} icon={<IconStar size={56} />} size={60}>نقاط الضعف</Row>
        </div>
      </>
    ),
    sfx: [["الحضور", 1, "tap"], ["النقاط", 1, "tap"], ["ونقاط الضعف", 1, "tap"]],
  },
  // 11. Monthly WhatsApp report
  {
    anchor: "وفي آخر الشهر",
    whoosh: true,
    render: (l) => (
      <>
        <div style={{ ...glassStyle, width: "100%", boxSizing: "border-box", padding: 44, borderBottomRightRadius: 8, display: "flex", flexDirection: "column", gap: 24 }}>
          <Line from={l("تبعثلو تقرير")} size={72} style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <span style={{ color: colors.coral, display: "flex" }}><IconChat size={70} /></span> تقرير الشهر
          </Line>
          <Row from={l("الحضور", 2)} icon={<IconCheck size={56} />} size={58}>الحضور</Row>
          <Row from={l("الدروس")} icon={<IconBook size={56} />} size={58}>الدروس</Row>
          <Row from={l("النقاط", 2)} icon={<IconChart size={56} />} size={58}>النقاط</Row>
        </div>
        <Pill from={l("أستاذ محترف")} icon={<IconStar size={48} />}>أستاذ محترف</Pill>
      </>
    ),
    sfx: [["تبعثلو تقرير", 1, "chime"], ["أستاذ محترف", 1, "tap"]],
  },
  // 12. Attendance + absence alerts
  {
    anchor: "تلميذ يغيب",
    whoosh: true,
    render: (l) => (
      <>
        <Pill from={l("تلميذ يغيب")} icon={<IconAbsent size={48} />}>تلميذ يغيب؟</Pill>
        <Phone from={l("تلميذ يغيب") + 8} src="daftari/home.jpg" height={820} focus={{ at: l("والتطبيق ينبّهك"), y: 0.5, scale: 1.4 }} />
      </>
    ),
    sfx: [["بضغطة وحدة", 1, "tap"], ["ينبّهك", 1, "chime"]],
  },
  // 13. Schedule
  {
    anchor: "المواعيد مخلّطة",
    whoosh: true,
    render: (l) => (
      <>
        <Pill from={l("المواعيد مخلّطة")} icon={<IconCalendar size={48} />}>المواعيد مخلّطة؟</Pill>
        <Phone from={l("المواعيد مخلّطة") + 8} src="daftari/schedule.jpg" height={660} />
        <div style={{ display: "flex", gap: 18 }}>
          <Pill from={l("تذكير قبل")} icon={<IconBell size={44} />}>تذكير</Pill>
          <Pill from={l("مؤقّت")} icon={<IconTimer size={44} />}>مؤقّت</Pill>
          <Pill from={l("والعطل")} icon={<IconCalendar size={44} />}>العطل</Pill>
        </div>
      </>
    ),
    sfx: [["تذكير قبل", 1, "tap"], ["مؤقّت", 1, "tap"], ["والعطل", 1, "tap"]],
  },
  // 14. Cloud, offline, private
  {
    anchor: "الكراس ضاع",
    whoosh: true,
    render: (l) => (
      <>
        <Pill from={l("الكراس ضاع")} icon={<IconFile size={48} />}>الكراس ضاع؟</Pill>
        <div style={{ display: "flex", gap: 24, width: "100%" }}>
          <Tile from={l("في السحابة")} icon={<IconCloud size={120} />} label="في السحابة" />
          <Tile from={l("بلا إنترنت")} icon={<IconOffline size={120} />} label="بلا إنترنت" />
          <Tile from={l("وبقفل سري")} icon={<IconLock size={120} />} label="قفل سري" pulseAt={l("معلوماتك تعرفها")} />
        </div>
        <Line from={l("معلوماتك تعرفها")} size={110}>غير <Accent>انت</Accent></Line>
      </>
    ),
    sfx: [["في السحابة", 1, "tap"], ["بلا إنترنت", 1, "tap"], ["وبقفل سري", 1, "tap"]],
  },
  // 15. Finances
  {
    anchor: "وما تعرفش قداه",
    whoosh: true,
    render: (l) => (
      <>
        <Pill from={l("وما تعرفش قداه")} icon={<IconChart size={48} />}>قداه دخّلت؟</Pill>
        <Phone from={l("وما تعرفش قداه") + 8} src="daftari/finance.jpg" height={820} focus={{ at: l("وصافي ربحك"), y: 0.53, scale: 1.55 }} />
      </>
    ),
  },
  // 16. Polite payment reminder
  {
    anchor: "وكي يتأخر ولي",
    whoosh: true,
    render: (l) => (
      <>
        <Pill from={l("وكي يتأخر ولي")} icon={<IconBell size={48} />}>ولي تأخر؟</Pill>
        <Phone from={l("وكي يتأخر ولي") + 8} src="daftari/home.jpg" height={820} focus={{ at: l("لبقة بأسلوبك"), y: 0.445, scale: 1.4 }} />
      </>
    ),
    sfx: [["بضغطة زر", 1, "tap"]],
  },
  // 17. Community
  {
    anchor: "وماشي غير تطبيق",
    whoosh: true,
    render: (l) => (
      <>
        <Line from={l("وماشي غير تطبيق")} size={110}>ماشي غير <Accent>تطبيق</Accent></Line>
        <div style={{ ...glassStyle, width: "100%", boxSizing: "border-box", padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
          <Line from={l("تدخل لمجتمع")} size={68} style={{ display: "flex", alignItems: "center", gap: 20, whiteSpace: "nowrap" }}>
            <span style={{ color: colors.coral, display: "flex" }}><IconUsers size={76} /></span> مجتمع أساتذة دفتري
          </Line>
          <div style={{ display: "flex", gap: 18 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Appear key={i} from={l("أساتذة من كل") + i * 3}>
                <IconChip size={104} muted={i % 2 === 1}><IconUser size={60} /></IconChip>
              </Appear>
            ))}
          </div>
          <Line from={l("يتعاونو ويكبرو")} size={64}>يتعاونو ويكبرو مع بعض</Line>
        </div>
      </>
    ),
  },
  // 18. The decision
  {
    anchor: "والآن، القرار عندك",
    whoosh: true,
    render: (l) => (
      <>
        <Line from={l("القرار عندك")} size={150}>القرار <Accent>عندك</Accent></Line>
        <Row from={l("تقدر تكمّل")} icon={<IconFile size={56} />} muted size={62}>
          <Strike at={l("ولا تعطي")}>الكراس والذاكرة</Strike>
        </Row>
        <Row from={l("ولا تعطي")} icon={<IconCheck size={56} />} size={62}>التنظيم اللي يستاهلوه</Row>
      </>
    ),
  },
  // 19. Free trial
  {
    anchor: "جرّب دفتري",
    whoosh: true,
    render: (l) => (
      <>
        <Line from={l("جرّب دفتري")} size={220} color={colors.coral} style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
          <Counter at={l("جرّب دفتري")} to={14} /> <span style={{ fontSize: 130, color: colors.white }}>يوم</span>
        </Line>
        <Line from={l("مجاناً")} size={110}>مجاناً</Line>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
          <Row from={l("بدون اي دفع")} icon={<IconCheck size={52} />} size={56}>بدون دفع</Row>
          <Row from={l("بلا أي التزام")} icon={<IconCheck size={52} />} size={56}>بلا التزام</Row>
          <Row from={l("وتبدا في دقيقة")} icon={<IconCheck size={52} />} size={56}>تبدا في دقيقة</Row>
        </div>
      </>
    ),
    sfx: [["بدون اي دفع", 1, "tap"], ["بلا أي التزام", 1, "tap"], ["وتبدا في دقيقة", 1, "tap"]],
  },
  // 20. Launch offer
  {
    anchor: "ولأول 50 أستاذ",
    whoosh: true,
    render: (l) => (
      <>
        <Line from={l("ولأول 50 أستاذ")} size={100}>لأول <Accent><Counter at={l("ولأول 50 أستاذ")} to={50} /></Accent> أستاذ</Line>
        <div style={{ ...glassStyle, border: `3px solid ${colors.coral}`, padding: "40px 90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Line from={l("تخفيض")} size={80}>تخفيض</Line>
          <Line from={l("تخفيض")} size={230} latin color={colors.coral}>-20%</Line>
        </div>
      </>
    ),
    sfx: [["تخفيض", 1, "chime"]],
  },
  // 21. Call to action
  {
    anchor: "اضغط على الرابط",
    whoosh: true,
    render: (l) => (
      <>
        <Appear from={l("اضغط على الرابط")}><ArrowBob /></Appear>
        <Line from={l("اضغط على الرابط")} size={84} color={colors.midnight} style={{ background: colors.coral, borderRadius: 999, padding: "26px 70px" }}>
          الرابط في البايو
        </Line>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
          <Row from={l("سجّل باسمك")} icon={<span style={{ fontFamily: latinStack, fontSize: 52, fontWeight: 700 }}>1</span>} size={56}>سجّل باسمك ورقمك</Row>
          <Row from={l("سجل أول فوج")} icon={<span style={{ fontFamily: latinStack, fontSize: 52, fontWeight: 700 }}>2</span>} size={56}>سجّل أول فوج</Row>
          <Row from={l("ابدا الخدمة")} icon={<span style={{ fontFamily: latinStack, fontSize: 52, fontWeight: 700 }}>3</span>} size={56}>ابدا الخدمة</Row>
        </div>
      </>
    ),
    sfx: [["اضغط على الرابط", 1, "tap"], ["سجّل باسمك", 1, "tap"], ["سجل أول فوج", 1, "tap"], ["ابدا الخدمة", 1, "tap"]],
  },
  // 22. End card
  {
    anchor: "أنت ركّز على التدريس",
    whoosh: true,
    render: (l) => (
      <>
        <Logo from={l("أنت ركّز")} width={820} />
        <Line from={l("ودفتري ينظّم")} size={64} style={{ fontFamily: arabicStack, opacity: 0.85 }}>جرّب 14 يوم مجاناً</Line>
      </>
    ),
  },
];

const anchorFrame = (a: SceneDef["anchor"]) => (typeof a === "string" ? at(a) : at(a[0], a[1]));

/** Scene schedule: each scene runs from its anchor (minus lead) to the next scene's start, plus a short overlap. */
export const SCHEDULE = SCENES.map((s, i) => {
  const start = i === 0 ? 0 : anchorFrame(s.anchor) - LEAD;
  const next = SCENES[i + 1];
  const end = next ? anchorFrame(next.anchor) - LEAD + 6 : timeline.durationInFrames;
  return { def: s, start, duration: end - start };
});

export const DaftariReel: React.FC = () => {
  const sfx: { from: number; src: string; volume: number }[] = [];
  SCHEDULE.forEach(({ def, start }, i) => {
    if (def.whoosh && i > 0) sfx.push({ from: start, src: "sfx/whoosh.wav", volume: 0.14 });
    def.sfx?.forEach(([phrase, occ, kind]) =>
      sfx.push({ from: at(phrase, occ) - 2, src: `sfx/${kind}.wav`, volume: kind === "chime" ? 0.16 : 0.22 }),
    );
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.midnight, overflow: "hidden" }}>
      <Backdrop />
      {SCHEDULE.map(({ def, start, duration }, i) => (
        <Sequence key={i} from={start} durationInFrames={duration} layout="none">
          <Scene duration={duration}>{def.render((p, occ = 1) => at(p, occ) - start, duration)}</Scene>
        </Sequence>
      ))}
      {timeline.captions.map((c, i) => (
        <Sequence key={`c${i}`} from={c.startFrame} durationInFrames={c.endFrame - c.startFrame} layout="none">
          <Caption text={c.text} fontSize={64} exitAt={c.endFrame - c.startFrame} />
        </Sequence>
      ))}
      {timeline.clips.map((v) => (
        <Sequence key={v.id} from={v.fromFrame} durationInFrames={v.durationInFrames} layout="none">
          <Audio src={staticFile(`daftari/${v.id}.mp3`)} />
        </Sequence>
      ))}
      {sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, s.from)} durationInFrames={45} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
