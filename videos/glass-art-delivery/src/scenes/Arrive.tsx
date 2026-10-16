// «هكا توصلك سليمة حتى لباب دارك»: back in the finished room, the promise lands.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BODY, C, EASE_IN } from '../theme';
import { line, prog, word } from '../timing';
import { Check, Finish, Headline, Photo, clock } from '../ui';

export const Arrive: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = clock(from, frame);
  const l = line('هكا توصلك');
  const safe = word(l, 'سليمة');
  const door = word(l, 'لباب');
  const kDoor = prog(t, door.start - 0.15, door.start + 0.35, EASE_IN);
  const kIn = prog(t, from, from + 0.4, EASE_IN);
  return (
    <AbsoluteFill style={{ backgroundColor: C.linen }}>
      <Photo src="room.jpg" t={t} a={from} b={from + 4} from={{ s: 1.15, x: -30, y: 144 }} to={{ s: 1.1, x: 0, y: 96 }} style={{ opacity: kIn }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(245,239,231,.92) 0%, rgba(245,239,231,0) 34%)' }} />
      <Headline t={t} words={[{ w: 'توصلك', at: word(l, 'توصلك').start }, { w: 'سليمة', at: safe.start, chip: true }]} size={110} y={250} />
      <div dir="rtl" style={{ position: 'absolute', top: 1170, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: kDoor, transform: `translateY(${(1 - kDoor) * 40}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '18px 44px 18px 22px', borderRadius: 999, background: 'rgba(255,251,245,.95)', boxShadow: '0 26px 60px rgba(60,40,25,.3)' }}>
          <div style={{ width: 84, height: 84, borderRadius: 42, background: C.espresso, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={C.amberSoft} strokeWidth={2} strokeLinejoin="round"><path d="M5 21V3h14v18" /><path d="M3 21h18" /><circle cx="15" cy="12" r="1.2" fill={C.amberSoft} /></svg>
          </div>
          <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 62, color: C.ink, lineHeight: 1.4 }}>التوصيل حتى للدار</span>
          <Check k={prog(t, door.end, door.end + 0.4)} size={66} />
        </div>
      </div>
      <Finish frame={frame} />
    </AbsoluteFill>
  );
};
