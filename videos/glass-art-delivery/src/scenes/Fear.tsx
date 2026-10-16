// «وإذا تكسرت في الطريق؟» → «هذا هو الخوف…»: the glass panel cracks on the word, shards fall, the fear word lands.
import React from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import { C, DISPLAY, EASE_IN, EASE_MOVE } from '../theme';
import { line, prog, word } from '../timing';
import { Finish, Headline, clock } from '../ui';

const PW = 520, PH = 980; // panel2 at 630x1188 → 520x980
const PX = (1080 - PW) / 2, PY = 430;
const HIT = { x: PW * 0.58, y: PH * 0.38 }; // impact point (panel pixels)

// Jagged crack lines radiating from the impact point (deterministic).
const CRACKS = Array.from({ length: 11 }, (_, i) => {
  const a0 = (i / 11) * Math.PI * 2 + random(`a${i}`) * 0.4;
  const len = 260 + random(`l${i}`) * 520;
  let x = HIT.x, y = HIT.y, d = `M${x} ${y}`;
  const steps = 6;
  for (let s = 1; s <= steps; s++) {
    const a = a0 + (random(`j${i}-${s}`) - 0.5) * 0.7;
    x += Math.cos(a) * (len / steps); y += Math.sin(a) * (len / steps);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return { d, w: 2 + random(`w${i}`) * 3.5, delay: random(`d${i}`) * 0.12 };
});
const RING = Array.from({ length: 2 }, (_, r) => {
  const R = 70 + r * 90; const n = 10;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2; const rr = R * (0.8 + random(`r${r}-${i}`) * 0.4);
    d += `${i ? 'L' : 'M'}${(HIT.x + Math.cos(a) * rr).toFixed(1)} ${(HIT.y + Math.sin(a) * rr).toFixed(1)} `;
  }
  return d;
});
const SHARDS = Array.from({ length: 16 }, (_, i) => ({
  x: HIT.x + (random(`sx${i}`) - 0.5) * 300, y: HIT.y + (random(`sy${i}`) - 0.5) * 200,
  vx: (random(`vx${i}`) - 0.5) * 500, rot: (random(`ro${i}`) - 0.5) * 720, s: 14 + random(`ss${i}`) * 26,
}));

export const Fear: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = clock(from, frame);
  const l3 = line('وإذا تكسرت');
  const crack = word(l3, 'تكسرت');
  const l4 = line('هذا هو الخوف');
  const fear = word(l4, 'الخوف');
  const T = crack.start + 0.12; // the moment of impact

  const kin = prog(t, from, from + 0.45, EASE_IN);
  const sinceHit = Math.max(0, t - T);
  const shake = t >= T ? Math.exp(-sinceHit * 7) * 22 : 0;
  const sx = Math.sin(sinceHit * 70) * shake, sy = Math.cos(sinceHit * 55) * shake * 0.6;
  const flash = t >= T ? Math.exp(-sinceHit * 9) : 0;
  const push = interpolate(t, [from, from + 4.2], [1.0, 1.1]);
  const grey = prog(t, l4.start, l4.start + 0.8, EASE_MOVE);
  const kFear = prog(t, fear.start - 0.1, fear.start + 0.5, EASE_IN);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 50% at 50% 45%, #3A2B20 0%, ${C.espresso} 70%)`, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <div style={{ position: 'absolute', left: PX, top: PY, width: PW, height: PH, transform: `translate(${sx}px, ${sy}px) rotate(${-3 + sx * 0.05}deg) scale(${0.92 + 0.08 * kin})`, opacity: kin, boxShadow: '0 60px 120px rgba(0,0,0,.6)' }}>
          <Img src={staticFile('panel2.jpg')} style={{ width: PW, height: PH, filter: `grayscale(${grey * 0.7}) brightness(${1 - grey * 0.3})` }} />
          <svg width={PW} height={PH} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {CRACKS.map((c, i) => {
              const k = prog(t, T + c.delay, T + c.delay + 0.25, EASE_IN);
              return (
                <g key={i}>
                  <path d={c.d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth={c.w + 2} strokeLinejoin="round" transform="translate(2 2)" />
                  <path d={c.d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} fill="none" stroke="rgba(255,255,255,.95)" strokeWidth={c.w} strokeLinejoin="round" />
                </g>
              );
            })}
            {RING.map((d, i) => {
              const k = prog(t, T + 0.08 + i * 0.06, T + 0.3 + i * 0.06);
              return <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={2.5} />;
            })}
          </svg>
          {/* falling shards */}
          {SHARDS.map((s, i) => {
            if (t < T) return null;
            const d = sinceHit;
            return (
              <div key={i} style={{ position: 'absolute', left: s.x + s.vx * d, top: s.y + 900 * d * d - 120 * d, width: s.s, height: s.s, background: 'linear-gradient(135deg, rgba(255,255,255,.9), rgba(200,220,230,.35))', clipPath: 'polygon(50% 0, 100% 80%, 0 100%)', transform: `rotate(${s.rot * d}deg)`, opacity: Math.max(0, 1 - d * 0.6) }} />
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: flash * 0.55 }} />
      <Headline t={t} out={l4.start - 0.05} color={C.white} glow words={[{ w: 'تكسرت', at: crack.start, chip: true }, { w: 'في الطريق؟', at: crack.end }]} size={78} y={270} />
      {/* fear word: huge, sits over the cracked panel */}
      <div dir="rtl" style={{ position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 230, lineHeight: 1.35, color: C.amberSoft, opacity: kFear, filter: `blur(${(1 - kFear) * 20}px)`, transform: `scale(${1.25 - 0.25 * kFear})`, textShadow: '0 20px 60px rgba(0,0,0,.6)' }}>الخوف</div>
      <Finish frame={frame} dark />
    </AbsoluteFill>
  );
};
