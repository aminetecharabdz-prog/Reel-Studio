// After the last word: the product, the brand, two proof badges and the call to action.
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { BODY, C, DISPLAY, EASE_IN } from '../theme';
import { prog } from '../timing';
import { Finish, clock } from '../ui';

const Badge: React.FC<{ k: number; icon: React.ReactNode; text: string }> = ({ k, icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 30px 14px 16px', borderRadius: 999, background: C.white, boxShadow: '0 16px 36px rgba(60,40,25,.18)', opacity: k, transform: `translateY(${(1 - k) * 30}px) scale(${0.9 + 0.1 * k})` }}>
    <div style={{ width: 64, height: 64, borderRadius: 32, background: C.linen, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.oak }}>{icon}</div>
    <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 48, color: C.ink, lineHeight: 1.4 }}>{text}</span>
  </div>
);

export const EndCard: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = clock(from, frame);
  const k0 = prog(t, from, from + 0.5, EASE_IN);
  const kArt = prog(t, from + 0.1, from + 0.7, EASE_IN);
  const kBrand = prog(t, from + 0.45, from + 0.9, EASE_IN);
  const kB1 = prog(t, from + 0.8, from + 1.15, EASE_IN);
  const kB2 = prog(t, from + 0.95, from + 1.3, EASE_IN);
  const kCta = prog(t, from + 1.3, from + 1.7, EASE_IN);
  const pulse = 1 + 0.035 * Math.max(0, Math.sin((t - from - 1.7) * 5));
  const nudge = Math.max(0, Math.sin((t - from - 1.7) * 5)) * -14;
  const float = Math.sin((t - from) * 1.6) * 8;
  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, overflow: 'hidden' }}>
      <Img src={staticFile('room.jpg')} style={{ position: 'absolute', inset: -60, width: 1200, height: 2040, objectFit: 'cover', filter: 'blur(26px)', opacity: 0.55 * k0, transform: `scale(${interpolate(t, [from, from + 4], [1.05, 1.12])})` }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(245,239,231,.65), rgba(245,239,231,.9))' }} />

      <div style={{ position: 'absolute', left: 70, right: 70, top: 380, opacity: kArt, transform: `translateY(${(1 - kArt) * 70 + float}px) scale(${0.94 + 0.06 * kArt})` }}>
        <Img src={staticFile('triptych.jpg')} style={{ width: '100%', borderRadius: 28, boxShadow: '0 50px 90px rgba(60,40,25,.35)' }} />
      </div>

      <div style={{ position: 'absolute', top: 990, left: 0, right: 0, textAlign: 'center', opacity: kBrand, transform: `translateY(${(1 - kBrand) * 30}px)` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 92, color: C.espresso, lineHeight: 1.2 }}>S&amp;C Décoration</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 46, color: C.oak, marginTop: 8 }}>@sc_deco_dz</div>
      </div>

      <div dir="rtl" style={{ position: 'absolute', top: 1205, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22 }}>
        <Badge k={kB1} text="69 ولاية" icon={<svg width="36" height="36" viewBox="0 0 24 30"><path d="M12 29s10-10.2 10-17A10 10 0 0 0 2 12c0 6.8 10 17 10 17z" fill="currentColor" /><circle cx="12" cy="12" r="4" fill={C.linen} /></svg>} />
        <Badge k={kB2} text="تغليف آمن" icon={<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round"><path d="M3 8l9-4 9 4v9l-9 4-9-4z" /><path d="M3 8l9 4 9-4M12 12v9" /></svg>} />
      </div>

      <div dir="rtl" style={{ position: 'absolute', top: 1370, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: kCta, transform: `translateY(${(1 - kCta) * 40}px) scale(${pulse})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '24px 56px', borderRadius: 999, background: C.espresso, boxShadow: '0 30px 60px rgba(33,26,21,.35)' }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, color: C.white, lineHeight: 1.35 }}>اطلبي دروك</span>
          <svg width="64" height="64" viewBox="0 0 24 24" style={{ transform: `translateX(${nudge}px)` }}><circle cx="12" cy="12" r="12" fill={C.amber} /><path d="M14 7l-5 5 5 5" fill="none" stroke={C.espresso} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <Finish frame={frame} />
    </AbsoluteFill>
  );
};
