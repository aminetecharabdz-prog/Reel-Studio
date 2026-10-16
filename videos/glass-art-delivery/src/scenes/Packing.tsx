// «أول حاجة…» → «…ما تتحركش»: one continuous packing table. The same glass panel is inspected,
// gets corner guards, bubble wrap (bubbles pop on «ترطقوها»), drops into a reinforced box,
// is taped, shaken, then x-rayed to show it stays put.
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BODY, C, DISPLAY, EASE_IN, EASE_MOVE } from '../theme';
import { Line, line, prog, word } from '../timing';
import { Check, Finish, StepTag, clock } from '../ui';
import { STEPS } from './Promise';

const PW = 470, PH = 886; // panel2 (630x1188)
const CX = 540, CY = 900;
const M = 46; // bubble-wrap margin around the panel
const CORNERS = [
  { x: PW, y: 0, sx: -1, sy: 1 }, // top-right first (RTL reading order)
  { x: 0, y: 0, sx: 1, sy: 1 },
  { x: 0, y: PH, sx: 1, sy: -1 },
  { x: PW, y: PH, sx: -1, sy: -1 },
];

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const at = (l: Line, i: number) => l.words[Math.min(i, l.words.length - 1)].start;

// Bubble grid in panel-local coords (covers panel + margin).
const BUB: { x: number; y: number }[] = [];
for (let y = -M + 30; y < PH + M - 20; y += 60) for (let x = -M + 30 + ((y / 60) % 2 ? 30 : 0); x < PW + M - 20; x += 60) BUB.push({ x, y });
const POPPED = [41, 58, 75, 64, 90, 47, 82, 99].filter((i) => i < BUB.length);

// Box geometry (screen coords, used from step 04).
const BX0 = 260, BX1 = 820, BTOP = 860, BBOT = 1360, BACK = 780, BI = 40;
const poly = (pts: number[][]) => pts.map((p) => p.join(',')).join(' ');
const mix = (a: number[][], b: number[][], k: number) => a.map((p, i) => [lerp(p[0], b[i][0], k), lerp(p[1], b[i][1], k)]);

export const Packing: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = clock(from, frame);
  const lA = line('أول حاجة'), lB = line('بعدها نحطوا'), lC = line('وتغليف كامل'), lD = line('اللي كامل تحبوا');
  const lE = line('ونزيدوا كذلك'), lF = line('وقبل ما نسكروه'), lG = line('باش نتأكدوا');
  const stepStarts = [lA.start, lB.start, lC.start, lE.start, lF.start];
  const step = stepStarts.filter((s) => t >= s - 0.15).length - 1;

  // ── 01 inspect: lens visits the 4 corners
  const lensTimes = [lA.start, at(lA, 2), at(lA, 3), at(lA, 4), at(lA, 5)];
  const lensPts = [{ x: PW / 2, y: PH / 2 }, ...CORNERS.map((c) => ({ x: c.x + c.sx * 70, y: c.y + c.sy * 70 }))];
  let lx = lensPts[0].x, ly = lensPts[0].y;
  for (let i = 1; i < lensPts.length; i++) {
    const k = prog(t, lensTimes[i] - 0.45, lensTimes[i] - 0.02, EASE_MOVE);
    lx = lerp(lx, lensPts[i].x, k); ly = lerp(ly, lensPts[i].y, k);
  }
  const lensIn = prog(t, lA.start, lA.start + 0.35, EASE_IN) * (1 - prog(t, at(lA, 6) + 0.25, at(lA, 6) + 0.5));
  const checksOut = 1 - prog(t, lB.start, lB.start + 0.3);
  const shine = prog(t, at(lA, 3) - 0.1, at(lA, 3) + 0.8, EASE_MOVE);

  // ── 02 corner guards land between «نحطوا» and «الأركان»
  const gA = at(lB, 1), gB = lB.end;

  // ── 03 bubble wrap slides in right → left, bubbles pop on «تحبوا ترطقوها»
  const wrapK = prog(t, at(lC, 0) - 0.1, at(lC, 2) + 0.3, EASE_MOVE);
  const bubbleGlow = prog(t, at(lC, 4) - 0.1, at(lC, 4) + 0.7);
  const popA = at(lD, 2) - 0.1, popB = lD.end;

  // ── 04 panel shrinks, lifts, drops into the box; flaps close on «يغلّف كلش»
  const E0 = lE.start;
  const lift = prog(t, E0 - 0.1, E0 + 0.55, EASE_MOVE);
  const drop = prog(t, E0 + 0.75, E0 + 1.35, (x) => x * x);
  const settle = t > E0 + 1.35 ? Math.sin((t - E0 - 1.35) * 22) * Math.exp(-(t - E0 - 1.35) * 9) * 10 : 0;
  const gs = lerp(1, 0.5, lift);
  const gcy = lerp(lerp(CY, 560, lift), 1095, drop) + settle;
  const boxIn = prog(t, E0 + 0.1, E0 + 0.7, EASE_IN);
  const thick = word(lE, 'مقوى');
  const kThick = prog(t, thick.start - 0.1, thick.start + 0.4, EASE_IN) * (1 - prog(t, lF.start, lF.start + 0.3));
  const kBackFlap = prog(t, at(lE, 4) - 0.1, at(lE, 4) + 0.35, EASE_MOVE);
  const kFlaps = prog(t, at(lE, 5) - 0.05, lE.end + 0.05, EASE_MOVE);

  // ── 05 tape, shake, x-ray
  const tapeK = prog(t, at(lF, 2) - 0.1, at(lF, 2) + 0.45, EASE_MOVE);
  const shakeT0 = at(lF, 3);
  const shake1 = t > shakeT0 ? Math.sin((t - shakeT0) * 26) * 8 * Math.exp(-Math.max(0, t - shakeT0 - 0.9) * 4) * prog(t, shakeT0, shakeT0 + 0.15) : 0;
  const xray = prog(t, at(lG, 1) - 0.1, at(lG, 1) + 0.45, EASE_MOVE);
  const shake2T = at(lG, 2);
  const shake2 = t > shake2T ? Math.sin((t - shake2T) * 22) * 5 * Math.exp(-(t - shake2T) * 1.2) : 0;
  const rot = shake1 + shake2;
  const still = word(lG, 'تتحركش');
  const kStill = prog(t, still.start - 0.15, still.start + 0.3, EASE_IN);

  const sand = prog(t, E0 - 0.2, E0 + 0.6);
  const push = interpolate(t, [lA.start, lE.start], [1, 1.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // flap shapes
  const openL = [[BX0, BTOP], [BX0 + BI, BACK], [BX0 - 90, BACK - 190], [BX0 - 150, BTOP - 150]];
  const shutL = [[BX0, BTOP], [BX0 + BI, BACK], [540, BACK], [540, BTOP]];
  const openR = openL.map(([x, y]) => [1080 - x, y]);
  const shutR = shutL.map(([x, y]) => [1080 - x, y]);
  const openB = [[BX0 + BI, BACK], [BX1 - BI, BACK], [BX1 - BI - 20, BACK - 170], [BX0 + BI + 20, BACK - 170]];
  const shutB = [[BX0 + BI, BACK], [BX1 - BI, BACK], [BX1 - BI + 10, BACK + 50], [BX0 + BI - 10, BACK + 50]];
  const flapsVisible = t >= E0;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 45%, ${C.white} 0%, ${C.linen} 100%)`, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 50%, ${C.linen} 0%, ${C.sand} 100%)`, opacity: sand }} />
      {/* subtle table grid */}
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 19 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke={C.sand} strokeWidth={1} />)}
        {Array.from({ length: 33 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1080} y2={i * 60} stroke={C.sand} strokeWidth={1} />)}
      </svg>

      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '540px 1000px' }}>
        <div style={{ position: 'absolute', inset: 0, transformOrigin: `540px ${BBOT}px`, transform: `rotate(${rot}deg)` }}>
          {/* box interior + back flap (behind the panel) */}
          {flapsVisible ? (
            <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: boxIn, transform: `translateY(${(1 - boxIn) * 700}px)` }}>
              <polygon points={poly([[BX0, BTOP], [BX1, BTOP], [BX1 - BI, BACK], [BX0 + BI, BACK]])} fill="#7A5634" />
              <polygon points={poly(mix(openB, shutB, kBackFlap))} fill={C.kraftDark} stroke="#8E6740" strokeWidth={3} />
            </svg>
          ) : null}

          {/* the panel group */}
          <div style={{ position: 'absolute', left: CX - PW / 2, top: gcy - PH / 2, width: PW, height: PH, transform: `scale(${gs})` }}>
            <div style={{ position: 'absolute', inset: 0, boxShadow: '0 50px 90px rgba(70,45,25,.35)' }} />
            <Img src={staticFile('panel2.jpg')} style={{ position: 'absolute', inset: 0, width: PW, height: PH }} />
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', mixBlendMode: 'screen' }}>
              <div style={{ position: 'absolute', top: -300, bottom: -300, width: 140, left: lerp(-200, PW + 60, shine), transform: 'rotate(16deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent)' }} />
            </div>
            {/* checks at each inspected corner */}
            {CORNERS.map((c, i) => {
              const k = prog(t, lensTimes[i + 1], lensTimes[i + 1] + 0.35);
              return <Check key={i} k={k} size={78} style={{ position: 'absolute', left: c.x - 39 + c.sx * 70, top: c.y - 39 + c.sy * 70, opacity: checksOut }} />;
            })}
            {/* corner guards */}
            <svg width={PW} height={PH} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              {CORNERS.map((c, i) => {
                const a = lerp(gA, gB, i / 4) - 0.25;
                const k = prog(t, a, a + 0.3, EASE_IN);
                const off = (1 - k) * 260;
                const T = 34, L = 150, O = 12;
                const d = `M${-O} ${-O} h${L} v${T} h${-(L - T)} v${L - T} h${-T} z`;
                return (
                  <g key={i} transform={`translate(${c.x - c.sx * off} ${c.y - c.sy * off}) scale(${c.sx} ${c.sy})`} opacity={k}>
                    <path d={d} fill={C.kraft} stroke={C.kraftDark} strokeWidth={4} />
                    <path d={`M${-O + 8} ${-O + 8} h${L - 20}`} stroke="#E2C29A" strokeWidth={4} />
                  </g>
                );
              })}
            </svg>
            {/* bubble wrap */}
            <div style={{ position: 'absolute', left: -M, top: -M, width: PW + 2 * M, height: PH + 2 * M, clipPath: `inset(-5% 0 -5% ${(1 - wrapK) * 100}%)` }}>
              <svg width={PW + 2 * M} height={PH + 2 * M} style={{ position: 'absolute', inset: 0 }}>
                <rect x={0} y={0} width={PW + 2 * M} height={PH + 2 * M} rx={22} fill="rgba(235,245,250,.32)" stroke="rgba(255,255,255,.8)" strokeWidth={3} />
                {BUB.map((b, i) => {
                  const pi = POPPED.indexOf(i);
                  const pt = pi < 0 ? 0 : lerp(popA, popB, pi / POPPED.length);
                  const pk = pi < 0 ? 0 : prog(t, pt, pt + 0.12);
                  const r = 23 * (pi < 0 ? 1 : interpolate(pk, [0, 0.5, 1], [1, 1.3, 0.55]));
                  const glow = 0.25 + 0.35 * Math.max(0, Math.sin(bubbleGlow * Math.PI - (b.y / PH) * 2));
                  return (
                    <g key={i} transform={`translate(${b.x + M} ${b.y + M})`}>
                      <circle r={r} fill={`rgba(255,255,255,${pk >= 1 ? 0.06 : 0.16 + glow * 0.3})`} stroke={`rgba(255,255,255,${pk >= 1 ? 0.35 : 0.85})`} strokeWidth={2.5} />
                      {pk < 1 ? <ellipse cx={-7} cy={-8} rx={7} ry={4.5} fill="rgba(255,255,255,.85)" transform="rotate(-30)" /> : null}
                      {pi >= 0 && pk > 0 && t < pt + 0.4 ? (
                        <g stroke={C.amber} strokeWidth={4} strokeLinecap="round" opacity={1 - prog(t, pt + 0.15, pt + 0.4)}>
                          {[0, 1, 2, 3, 4, 5].map((j) => {
                            const a = (j / 6) * Math.PI * 2; const r0 = 30 + 20 * prog(t, pt, pt + 0.3); const r1 = r0 + 16;
                            return <line key={j} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} />;
                          })}
                        </g>
                      ) : null}
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* magnifier */}
            {lensIn > 0.001 ? (
              <div style={{ position: 'absolute', left: lx - 125, top: ly - 125, width: 250, height: 250, opacity: lensIn, transform: `scale(${0.7 + 0.3 * lensIn})` }}>
                <div style={{ position: 'absolute', left: 205, top: 205, width: 40, height: 150, borderRadius: 20, background: C.espresso, transform: 'rotate(-45deg)', transformOrigin: '20px 0' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: 125, overflow: 'hidden', border: `14px solid ${C.espresso}`, boxShadow: '0 24px 50px rgba(0,0,0,.35)', background: C.white }}>
                  <Img src={staticFile('panel2.jpg')} style={{ position: 'absolute', width: PW * 2, height: PH * 2, left: 111 - lx * 2, top: 111 - ly * 2 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.45), transparent 45%)' }} />
                </div>
              </div>
            ) : null}
          </div>

          {/* box front + side flaps + tape (in front of the panel) */}
          {flapsVisible ? (
            <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: boxIn, transform: `translateY(${(1 - boxIn) * 700}px)` }}>
              <g opacity={1 - xray * 0.78}>
                <rect x={BX0} y={BTOP} width={BX1 - BX0} height={BBOT - BTOP} fill={C.kraft} />
                {Array.from({ length: 27 }, (_, i) => <line key={i} x1={BX0 + 10 + i * 20} y1={BTOP + 6} x2={BX0 + 10 + i * 20} y2={BBOT - 6} stroke="rgba(120,85,50,.12)" strokeWidth={3} />)}
                <rect x={BX0} y={BTOP} width={BX1 - BX0} height={BBOT - BTOP} fill="none" stroke={C.kraftDark} strokeWidth={5} />
                <rect x={BX0} y={BBOT - 26} width={BX1 - BX0} height={26} fill="rgba(90,60,30,.18)" />
                {/* "fragile" stamp: glass + arrows */}
                <g transform="translate(540 1110)" stroke="#7B3B2A" strokeWidth={6} fill="none" opacity={0.85}>
                  <rect x={-150} y={-120} width={300} height={240} rx={18} strokeWidth={5} />
                  <path d="M-80 -80h56l-6 50a22 22 0 0 1-44 0z M-52 -8v50 M-74 42h44" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M40 40v-110 M18 -48l22-24 22 24 M90 40v-110 M68 -48l22-24 22 24" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <text x={540} y={1300} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={44} fill="#7B3B2A" opacity={0.85}>قابل للكسر</text>
              </g>
              <polygon points={poly(mix(openL, shutL, kFlaps))} fill={C.kraft} stroke={C.kraftDark} strokeWidth={4} opacity={1 - xray * 0.7} />
              <polygon points={poly(mix(openR, shutR, kFlaps))} fill="#D2A877" stroke={C.kraftDark} strokeWidth={4} opacity={1 - xray * 0.7} />
              {/* tape along the seam and down the front */}
              <rect x={505} y={BACK - 4} width={70} height={(BTOP - BACK + 110) * tapeK} fill="rgba(214,168,102,.92)" stroke="rgba(150,100,50,.5)" strokeWidth={2} />
              {/* x-ray: lock marks around the panel */}
              {xray > 0 ? [[392, 875], [688, 875], [392, 1318], [688, 1318]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={18 + 6 * Math.sin(t * 8 + i)} fill="none" stroke={C.amber} strokeWidth={5} opacity={xray} />
              )) : null}
              {/* shake motion arcs */}
              {Math.abs(rot) > 2 ? [-1, 1].map((s) => (
                <path key={s} d={s < 0 ? 'M200 980 q-50 120 0 240' : 'M880 980 q50 120 0 240'} stroke={C.taupe} strokeWidth={8} fill="none" strokeLinecap="round" opacity={Math.min(1, Math.abs(rot) / 6)} />
              )) : null}
            </svg>
          ) : null}
        </div>

        {/* reinforced-cardboard callout */}
        {kThick > 0 ? (
          <div style={{ position: 'absolute', left: 700, top: 1000, width: 280, height: 280, borderRadius: 140, background: C.white, border: `10px solid ${C.espresso}`, overflow: 'hidden', transform: `scale(${interpolate(kThick, [0, 0.7, 1], [0.2, 1.08, 1])})`, opacity: Math.min(1, kThick * 2), boxShadow: '0 30px 60px rgba(60,40,20,.35)' }}>
            <svg width="260" height="260" viewBox="0 0 260 260">
              <rect x="0" y="70" width="260" height="14" fill={C.kraftDark} />
              <path d={`M0 100 ${Array.from({ length: 9 }, (_, i) => `Q${i * 30 + 15} ${i % 2 ? 140 : 60} ${i * 30 + 30} 100`).join(' ')}`} transform="translate(0 0)" fill="none" stroke={C.kraft} strokeWidth="9" />
              <rect x="0" y="116" width="260" height="12" fill={C.kraftDark} />
              <path d={`M0 146 ${Array.from({ length: 9 }, (_, i) => `Q${i * 30 + 15} ${i % 2 ? 186 : 106} ${i * 30 + 30} 146`).join(' ')}`} fill="none" stroke={C.kraft} strokeWidth="9" />
              <rect x="0" y="162" width="260" height="14" fill={C.kraftDark} />
            </svg>
          </div>
        ) : null}
      </AbsoluteFill>

      {/* "it doesn't move" badge */}
      {kStill > 0 ? (
        <div dir="rtl" style={{ position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: kStill, transform: `translateY(${(1 - kStill) * 30}px) scale(${interpolate(kStill, [0, 0.7, 1], [0.8, 1.05, 1])})` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '14px 40px 14px 18px', borderRadius: 999, background: C.espresso }}>
            <Check k={kStill} size={76} />
            <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 60, color: C.white, lineHeight: 1.4 }}>ثابتة في بلاصتها</span>
          </div>
        </div>
      ) : null}

      {step >= 0 ? <StepTag key={step} t={t} at={stepStarts[step]} n={STEPS[step].n} label={STEPS[step].label} /> : null}
      <Finish frame={frame} />
    </AbsoluteFill>
  );
};

