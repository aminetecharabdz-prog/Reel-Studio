// «وهذا اللي نديروه قبل ما تخرج اللوحة»: cut to light, the five packing steps line up on a card.
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, DISPLAY, EASE_IN } from '../theme';
import { line, prog } from '../timing';
import { Finish, Headline, clock } from '../ui';
import { IconBox, IconBubbles, IconCorner, IconLens, IconShake } from './icons';

export const STEPS = [
  { n: '01', label: 'فحص الزاج', I: IconLens },
  { n: '02', label: 'حماية الأركان', I: IconCorner },
  { n: '03', label: 'بلاستيك الفقاعات', I: IconBubbles },
  { n: '04', label: 'كارتون مقوّى', I: IconBox },
  { n: '05', label: 'تسكير واختبار الهزّ', I: IconShake },
];

export const Steps: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = clock(from, frame);
  const l5 = line('وهذا اللي نديروه');
  const kCard = prog(t, from + 0.05, from + 0.55, EASE_IN);
  const drift = interpolate(t, [from, from + 3.2], [0, -24]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 40%, ${C.white} 0%, ${C.linen} 100%)`, overflow: 'hidden' }}>
      {/* the triptych hangs faintly behind the card */}
      <Img src={staticFile('triptych.jpg')} style={{ position: 'absolute', width: 1300, left: -110, top: 470, opacity: 0.16, filter: 'blur(3px)', transform: `translateY(${drift}px)` }} />
      <Headline t={t} words={[{ w: '5 خطوات', at: l5.words[1].start, chip: true }, { w: 'قبل التوصيل', at: l5.words[3].start }]} size={104} />
      <div dir="rtl" style={{ position: 'absolute', left: 90, right: 90, top: 630, padding: '34px 48px', borderRadius: 52, background: C.white, boxShadow: '0 50px 100px rgba(80,55,35,.22)', opacity: kCard, transform: `translateY(${(1 - kCard) * 60 + drift * 0.5}px)` }}>
        {STEPS.map((s, i) => {
          const at = l5.words[Math.min(l5.words.length - 1, 1 + i)].start;
          const k = prog(t, at - 0.1, at + 0.35, EASE_IN);
          return (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 30, padding: '16px 0', borderTop: i ? `2px solid ${C.linen}` : 'none', opacity: k, transform: `translateX(${(1 - k) * 60}px)` }}>
              <div style={{ width: 96, height: 96, borderRadius: 30, background: i % 2 ? C.linen : C.espresso, color: i % 2 ? C.oak : C.amberSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.I s={54} /></div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: C.ink, flex: 1, lineHeight: 1.4 }}>{s.label}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 40, color: C.taupe }}>{s.n}</div>
            </div>
          );
        })}
      </div>
      <Finish frame={frame} />
    </AbsoluteFill>
  );
};
