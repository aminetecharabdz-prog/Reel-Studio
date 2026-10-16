// 0 → «وإذا تكسرت»: tight on the glass triptych (shine sweep), pull back to the room, delivery card "69 ولاية".
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, DISPLAY, EASE_IN, EASE_MOVE } from '../theme';
import { line, prog, word } from '../timing';
import { Finish, Headline, clock } from '../ui';

// room.jpg is 972x1538; covering 1080x1920 gives a 1213x1920 layer shifted 66px left.
const LW = 1213, LH = 1920, LX = -66;
const S = LW / 972;
const TRI = { x: 258 * S, y: 272 * S, w: 670 * S, h: 406 * S }; // triptych in layer pixels

export const Hook: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = clock(from, frame);
  const l1 = line('لوحات زجاجية');
  const l2 = line('وتوصلك');
  const n69 = word(l2, '69');
  const wil = word(l2, 'ولاية');

  // Camera: tight on the triptych, then pull back as «وتوصلك» starts.
  const cx = TRI.x + TRI.w / 2 + LX, cy = TRI.y + TRI.h / 2;
  const zoomTight = interpolate(t, [0, l1.end], [1.3, 1.27]);
  const back = prog(t, l2.start - 0.15, l2.start + 1.0, EASE_MOVE);
  const s = interpolate(back, [0, 1], [zoomTight, 1.04]);
  const tx = interpolate(back, [0, 1], [(540 - cx) * zoomTight, 0]);
  const ty = interpolate(back, [0, 1], [Math.min(960 * (zoomTight - 1), 750 - 960 - (cy - 960) * zoomTight), 0]);
  const shine = prog(t, 0.25, 1.35, EASE_MOVE);

  // Delivery card
  const kc = prog(t, l2.start + 0.35, l2.start + 0.95, EASE_IN);
  const count = Math.round(interpolate(t, [l2.start + 0.6, n69.start + 0.05], [1, 69], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - (1 - x) ** 3 }));
  const land = interpolate(prog(t, n69.start, n69.start + 0.4), [0, 0.35, 1], [1, 1.12, 1]);
  const kWil = prog(t, wil.start - 0.1, wil.start + 0.3, EASE_IN);
  const van = prog(t, l2.start + 0.6, wil.end + 0.2, EASE_MOVE);

  return (
    <AbsoluteFill style={{ backgroundColor: C.linen, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: LX, top: 0, width: LW, height: LH, transformOrigin: `${540 - LX}px 960px`, transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Img src={staticFile('room.jpg')} style={{ width: LW, height: LH }} />
        {/* light sweeping across the glass */}
        <div style={{ position: 'absolute', left: TRI.x, top: TRI.y, width: TRI.w, height: TRI.h, overflow: 'hidden', mixBlendMode: 'screen' }}>
          <div style={{ position: 'absolute', top: -200, bottom: -200, width: 160, left: interpolate(shine, [0, 1], [-260, TRI.w + 100]), transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)' }} />
        </div>
      </div>
      {/* top scrim so the headline reads on the ceiling */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(245,239,231,.85) 0%, rgba(245,239,231,0) 30%)' }} />
      <Headline t={t} out={l2.start + 0.2} words={[{ w: 'لوحات', at: l1.words[0].start }, { w: 'زجاجية', at: l1.words[1].start, chip: true }]} size={108} y={250} />

      {/* delivery card */}
      <div dir="rtl" style={{ position: 'absolute', left: 90, right: 90, top: 1000, height: 330, borderRadius: 48, background: 'rgba(255,251,245,.94)', boxShadow: '0 40px 80px rgba(60,40,25,.28)', opacity: kc, transform: `translateY(${(1 - kc) * 80}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, overflow: 'hidden' }}>
        <svg width="110" height="140" viewBox="0 0 24 30" style={{ marginBottom: 50 }}>
          <path d="M12 29s10-10.2 10-17A10 10 0 0 0 2 12c0 6.8 10 17 10 17z" fill={C.amber} />
          <circle cx="12" cy="12" r="4" fill={C.white} />
        </svg>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 210, lineHeight: 1, color: C.espresso, transform: `scale(${land})`, marginBottom: 40, minWidth: 250, textAlign: 'center' }}>{count}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, color: C.oak, opacity: kWil, transform: `translateX(${(1 - kWil) * -30}px)`, marginBottom: 40, lineHeight: 1.4 }}>ولاية</div>
        {/* route along the card bottom, van travels right → left */}
        <svg width="900" height="80" style={{ position: 'absolute', bottom: 8, left: 0 }}>
          <line x1="840" y1="44" x2="60" y2="44" stroke={C.sand} strokeWidth="6" strokeDasharray="4 18" strokeLinecap="round" />
          <circle cx="60" cy="44" r="12" fill={C.amber} />
          <g transform={`translate(${interpolate(van, [0, 1], [800, 70])}, 18)`}>
            <rect x="0" y="4" width="62" height="32" rx="6" fill={C.espresso} />
            <path d="M-26 16h26v20h-30v-12z" fill={C.oak} />
            <circle cx="10" cy="40" r="7" fill={C.ink} /><circle cx="48" cy="40" r="7" fill={C.ink} />
          </g>
        </svg>
      </div>
      <Finish frame={frame} />
    </AbsoluteFill>
  );
};
