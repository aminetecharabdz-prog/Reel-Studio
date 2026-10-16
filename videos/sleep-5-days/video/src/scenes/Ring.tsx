// Five arcs around the centre, one per day. Radius can wobble (reality bending) via `wave`.
import React from 'react';
import { interpolateColors } from 'remotion';
import { C, DAY } from '../theme';

const GAP = 7; // degrees between days
const arc = (a0: number, a1: number, rad: (a: number) => number) => {
  if (a1 - a0 < 0.05) return '';
  const n = Math.max(2, Math.ceil((a1 - a0) / 1.5));
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const th = (a * Math.PI) / 180;
    const r = rad(th);
    d += `${i ? 'L' : 'M'}${(Math.cos(th) * r).toFixed(1)},${(Math.sin(th) * r).toFixed(1)}`;
  }
  return d;
};

export type RingProps = {
  R: number;
  width: number;
  track: number; // 0..1 how much of the empty track is drawn
  fill: number[]; // 0..1 per day
  calm: number; // 0..1 every day turns back to the first, calm colour
  wave: number; // px of radius wobble
  t: number;
  tint?: string; // ghost copies: one flat colour
};

export const Ring: React.FC<RingProps> = ({ R, width, track, fill, calm, wave, t, tint }) => {
  const rad = (th: number) => R + wave * Math.sin(6 * th + t * 4) + wave * 0.5 * Math.sin(11 * th - t * 6);
  return (
    <g>
      {DAY.map((cols, i) => {
        const a0 = -90 + i * 72 + GAP / 2;
        const span = 72 - GAP;
        const tr = Math.min(1, Math.max(0, track * 5 - i));
        const c0 = interpolateColors(calm, [0, 1], [cols[0], DAY[0][0]]);
        const c1 = interpolateColors(calm, [0, 1], [cols[1], DAY[0][1]]);
        const d = arc(a0, a0 + span * fill[i], rad);
        return (
          <g key={i}>
            {!tint && <path d={arc(a0, a0 + span * tr, rad)} stroke={C.track} strokeWidth={width} strokeLinecap="round" fill="none" />}
            {d && (
              <>
                <defs>
                  <linearGradient id={`seg${i}${tint ?? ''}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={tint ?? c0} />
                    <stop offset="100%" stopColor={tint ?? c1} />
                  </linearGradient>
                </defs>
                {!tint && <path d={d} stroke={c1} strokeOpacity={0.35} strokeWidth={width * 2.2} strokeLinecap="round" fill="none" style={{ filter: 'blur(14px)' }} />}
                <path d={d} stroke={`url(#seg${i}${tint ?? ''})`} strokeWidth={width} strokeLinecap="round" fill="none" />
              </>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** Where day i's small number sits: just outside the middle of its arc. */
export const labelPos = (i: number, r: number) => {
  const th = ((-90 + i * 72 + 36) * Math.PI) / 180;
  return { x: Math.cos(th) * r, y: Math.sin(th) * r };
};
