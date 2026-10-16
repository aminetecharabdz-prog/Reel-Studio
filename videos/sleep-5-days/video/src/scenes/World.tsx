// The whole story in one continuous shot: moon -> five-day ring with an hours counter -> moon again.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, interpolateColors, random, useCurrentFrame } from 'remotion';
import { prog, toSec } from '../timing';
import { B } from '../beats';
import { C, DAY, FONT, grad } from '../theme';
import { VIDEO } from '../config';
import { Moon } from './Moon';
import { Ring, labelPos } from './Ring';
import { Counter } from './Counter';

const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const W = VIDEO.width;
const CX = W / 2;
const CY = 760;
const R = 330;

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: random(`sx${i}`) * W,
  y: random(`sy${i}`) * VIDEO.height,
  s: 1 + random(`ss${i}`) * 2,
  p: random(`sp${i}`) * 6.28,
}));

/** A line that rises out of a mask while it sharpens, then lifts away blurred. */
const Reveal: React.FC<{ t: number; at: number; out: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, out, children, style }) => {
  const k = prog(t, at, at + 0.6, OUT);
  const o = prog(t, out, out + 0.35, Easing.in(Easing.cubic));
  if (k <= 0 || o >= 1) return null;
  return (
    <div style={{ overflow: 'hidden', padding: '0.25em 0.2em', margin: '-0.25em 0', ...style }}>
      <div
        style={{
          transform: `translateY(${(1 - k) * 70 - o * 30}%)`,
          opacity: k * (1 - o),
          filter: `blur(${(1 - k) * 8 + o * 8}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Hi: React.FC<{ c: readonly [string, string]; children: React.ReactNode }> = ({ c, children }) => <span style={grad(c[0], c[1])}>{children}</span>;
const Num: React.FC<{ children: React.ReactNode }> = ({ children }) => <bdi dir="ltr">{children}</bdi>;

const FACTS: React.ReactNode[] = [
  <>دماغك يعمل كأنّ في دمك <Hi c={DAY[0]}><Num>0.1%</Num> كحول</Hi></>,
  <>يغفو دماغك <Hi c={DAY[1]}>ثوانيَ</Hi> دون أن تشعر</>,
  <>تبدأ <Hi c={DAY[2]}>الهلوسة</Hi>: ترى أشياء غير موجودة</>,
  <>لا تفرّق بين <Hi c={DAY[3]}>الحلم</Hi> والحقيقة</>,
  <>حالة تشبه <Hi c={DAY[4]}>الذهان</Hi></>,
];

export const World: React.FC<{ from: number }> = ({ from }) => {
  const t = from + toSec(useCurrentFrame());
  const d0 = B.days[0].start;

  // ---- moon: rises, gives way to the ring, comes back at the end
  const rise = prog(t, B.q1.start - 0.3, B.q1.start + 1.3, OUT);
  const moonAway = prog(t, d0 - 0.1, d0 + 0.7, Easing.inOut(Easing.sin));
  const moonBack = prog(t, B.end.start - 0.3, B.end.start + 1.0, OUT);
  const moonOp = (1 - moonAway) + moonBack;
  const moonR = interpolate(moonAway, [0, 1], [R - 20, R * 0.55]) * (1 - moonBack) + moonBack * (R - 40);
  const moonY = interpolate(rise, [0, 1], [1500, CY]);

  // ---- ring
  const track = prog(t, d0 - 0.1, d0 + 0.9, Easing.inOut(Easing.sin));
  const fill = B.days.map((d) => prog(t, d.start + 0.1, d.start + 1.1, OUT));
  const calm = prog(t, B.good.start, B.good.start + 1.4, Easing.inOut(Easing.sin));
  const ringOut = prog(t, B.end.start - 0.3, B.end.start + 0.7, Easing.in(Easing.cubic));
  const wave = (prog(t, B.dream - 0.6, B.dream + 1.2, Easing.inOut(Easing.sin)) * 14 + prog(t, B.days[4].start, B.psych + 0.5) * 10) * (1 - calm);

  // ---- disturbances
  const sway = prog(t, B.facts[0].start, B.facts[0].start + 0.8) * (1 - prog(t, B.days[1].start - 0.4, B.days[1].start + 0.2));
  const ghost = Math.max(
    sway * 0.5,
    prog(t, B.halluc - 0.2, B.halluc + 0.8, OUT) * (1 - calm),
  );
  const shake = prog(t, B.psych - 0.2, B.psych + 0.3) * (1 - calm);
  const frame = useCurrentFrame();
  const jx = (random(`jx${frame}`) - 0.5) * 16 * shake;
  const jy = (random(`jy${frame}`) - 0.5) * 16 * shake;
  const rot = Math.sin(t * 2.4) * 4 * sway;

  // ---- hours counter
  const di = B.days.reduce((acc, d, i) => (t >= d.start ? i : acc), 0);
  const ck = prog(t, B.days[di].start, B.days[di].start + 1.2, OUT);
  const counterOp = prog(t, d0 + 0.1, d0 + 0.6) * (1 - prog(t, B.good.start - 0.2, B.good.start + 0.4));
  const cCol = DAY[di];

  // ---- background glow follows the mood
  const stamps = [0, ...B.days.map((d) => d.start), B.good.start + 0.5, B.end.start];
  const glow = interpolateColors(t, stamps, [C.glow, '#08386E', '#0B2E7A', '#1F1A78', '#3A1470', '#5A0F3A', '#0A3D6E', '#0A3D91']);

  // ---- eyelids (microsleep)
  const lid = Math.max(
    ...B.blinks.map((b) => Math.min(prog(t, b, b + 0.18, Easing.in(Easing.quad)), 1 - prog(t, b + 0.45, b + 0.8, OUT))),
  );

  const ringProps = { R, width: 30, track, fill, calm, wave, t };
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT, color: C.text }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${CY / 19.2}%, ${glow} 0%, rgba(0,0,0,0) 55%)`, opacity: 0.85 }} />
      <svg width={W} height={VIDEO.height} style={{ position: 'absolute' }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s * 0.8} fill="#BFD9FF" opacity={0.18 + 0.15 * Math.sin(t * 1.3 + s.p)} />
        ))}
        <g transform={`translate(${CX + jx}, ${(moonAway < 1 ? moonY : CY) + jy})`}>
          {moonOp > 0.01 && <Moon r={moonR} spin={t * 0.18} opacity={Math.min(1, moonOp)} />}
        </g>
        <g transform={`translate(${CX + jx}, ${CY + jy}) rotate(${rot}) scale(${1 + ringOut * 0.12})`} opacity={1 - ringOut}>
          {ghost > 0.01 && (
            <>
              <g transform={`translate(${Math.sin(t * 2.1) * 26 * ghost}, ${Math.cos(t * 1.7) * 16 * ghost})`} opacity={0.4 * ghost} style={{ mixBlendMode: 'screen' }}>
                <Ring {...ringProps} R={R + 18 * ghost} tint="#3FE0FF" />
              </g>
              <g transform={`translate(${-Math.sin(t * 1.9) * 26 * ghost}, ${-Math.cos(t * 2.3) * 16 * ghost})`} opacity={0.4 * ghost} style={{ mixBlendMode: 'screen' }}>
                <Ring {...ringProps} R={R - 18 * ghost} tint="#FF4FD8" />
              </g>
            </>
          )}
          <Ring {...ringProps} />
          {B.days.map((d, i) => {
            const p = labelPos(i, R + 72);
            const on = prog(t, d.start, d.start + 0.5);
            return (
              <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontWeight={700} fontSize={36}
                fill={on > 0 ? interpolateColors(on, [0, 1], [C.gray, DAY[i][0]]) : C.gray} opacity={track * (0.45 + 0.55 * on)}>
                {i + 1}
              </text>
            );
          })}
        </g>
      </svg>

      {/* hours counter in the middle of the ring */}
      {counterOp > 0 && (
        <div style={{ position: 'absolute', left: 0, width: W, top: CY - 150, textAlign: 'center', opacity: counterOp, transform: `translate(${jx}px, ${jy}px)` }}>
          <div style={{ filter: `drop-shadow(0 0 30px ${cCol[1]}66)`, lineHeight: 1 }}>
            <Counter from={di * 24} to={(di + 1) * 24} k={ck} size={190} colors={cCol} />
          </div>
          <div dir="rtl" style={{ fontSize: 40, fontWeight: 500, color: C.gray, marginTop: 6 }}>ساعة بلا نوم</div>
        </div>
      )}

      {/* text block under the ring */}
      <div dir="rtl" style={{ position: 'absolute', top: 1240, left: 70, width: W - 140, textAlign: 'center', lineHeight: 1.4, textWrap: 'balance' }}>
        <Reveal t={t} at={B.q1.start} out={d0 - 0.45} style={{ fontSize: 58, fontWeight: 500, color: C.gray }}>ماذا يحدث لجسمك</Reveal>
        <Reveal t={t} at={B.q2.start} out={d0 - 0.4} style={{ fontSize: 86, fontWeight: 700 }}>
          لو بقيت <Hi c={DAY[0]}><Num>5</Num> أيام</Hi> بلا نوم؟
        </Reveal>
      </div>
      {B.days.map((d, i) => (
        <div key={i} dir="rtl" style={{ position: 'absolute', top: 1240, left: 70, width: W - 140, textAlign: 'center', lineHeight: 1.4, textWrap: 'balance' }}>
          <Reveal t={t} at={d.start} out={B.dayOut(i)} style={{ fontSize: 56, fontWeight: 700 }}>
            <Hi c={DAY[i]}>اليوم <Num>{i + 1}</Num></Hi>
          </Reveal>
          <Reveal t={t} at={B.facts[i].start} out={B.dayOut(i)} style={{ fontSize: 76, fontWeight: 700 }}>
            <span style={i === 3 ? { filter: `blur(${(1 + Math.sin(t * 3)) * 1.5}px)` } : undefined}>{FACTS[i]}</span>
          </Reveal>
        </div>
      ))}
      <div dir="rtl" style={{ position: 'absolute', top: 1240, left: 70, width: W - 140, textAlign: 'center', lineHeight: 1.4, textWrap: 'balance' }}>
        <Reveal t={t} at={B.goodHead} out={B.end.start - 0.4} style={{ fontSize: 56, fontWeight: 700 }}>
          <Hi c={DAY[0]}>الخبر الجيد</Hi>
        </Reveal>
        <Reveal t={t} at={B.goodBody} out={B.end.start - 0.4} style={{ fontSize: 76, fontWeight: 700 }}>النوم يصلح معظم الضرر</Reveal>
      </div>
      <div dir="rtl" style={{ position: 'absolute', top: 1240, left: 70, width: W - 140, textAlign: 'center', lineHeight: 1.4, textWrap: 'balance' }}>
        <Reveal t={t} at={B.end.start} out={1e9} style={{ fontSize: 92, fontWeight: 700 }}>
          نَم <Hi c={DAY[0]}><Num>7</Num> إلى <Num>9</Num> ساعات</Hi>
        </Reveal>
        <Reveal t={t} at={B.end.start + 0.5} out={1e9} style={{ fontSize: 60, fontWeight: 500, color: C.gray }}>كل ليلة</Reveal>
      </div>
      <div dir="rtl" style={{ position: 'absolute', bottom: 90, width: W, textAlign: 'center', fontSize: 26, color: C.gray, opacity: prog(t, B.end.start + 1, B.end.start + 1.8) * 0.85 }}>
        المصادر: <bdi>Dawson &amp; Reid, Nature 1997</bdi> · <bdi>Waters et al., Front. Psychiatry 2018</bdi>
      </div>

      {/* eyelids closing for a microsleep */}
      {lid > 0 && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, #000 85%, rgba(0,0,0,0))', height: `${lid * 55}%` }} />
          <AbsoluteFill style={{ background: 'linear-gradient(0deg, #000 85%, rgba(0,0,0,0))', top: 'auto', bottom: 0, height: `${lid * 55}%` }} />
        </>
      )}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)' }} />
    </AbsoluteFill>
  );
};
