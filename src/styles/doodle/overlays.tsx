/** doodle overlays in screen space: narration caption, bubbles, ؟ badge, name tag, icon cards, quote card. */
import type { CSSProperties, ReactNode } from 'react';
import { ICONS, type IconId } from '@/styles/product/icons';
import { ellipse, inkOf } from './ink';
import { K } from './tokens';

/** accent word: orange, soft peach glow, squiggle drawn under it (R → L) then drifting */
export const AccentWord = ({ children, draw, t, u }: { children: ReactNode; draw: number; t: number; u: number }) => {
  const wl = 22 * u;
  const amp = 4 * u;
  const phase = (t / 2) * wl;
  let d = '';
  for (let x = 0; x <= 400; x += 4) d += `${x === 0 ? 'M' : 'L'}${x} ${(Math.sin(((x + phase) / wl) * Math.PI * 2) * amp + amp * 2).toFixed(1)}`;
  return (
    <span style={{ position: 'relative', display: 'inline-block', color: K.accent }}>
      <span style={{ position: 'absolute', left: '-15%', right: '-15%', top: '-10%', bottom: '-10%', background: `radial-gradient(ellipse, rgba(255,208,160,${0.6 * draw}) 0%, rgba(255,208,160,0) 70%)` }} />
      <span style={{ position: 'relative' }}>{children}</span>
      <svg viewBox="0 0 400 20" preserveAspectRatio="none" style={{ position: 'absolute', left: -4 * u, right: -4 * u, width: 'calc(100% + 8px)', bottom: -6 * u, height: 14 * u, overflow: 'visible' }}>
        <path d={d} fill="none" stroke={K.accent} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} vectorEffect="non-scaling-stroke" transform="scale(-1 1) translate(-400 0)" />
      </svg>
    </span>
  );
};

/** a box with the hand ink outline drawn by SVG over a white fill */
export const InkBox = ({ w, h, r, children, style, tail, glow, tailX }: { w: number; h: number; r: number; children?: ReactNode; style?: CSSProperties; tail?: 'down' | 'up' | null; glow?: boolean; tailX?: number }) => {
  const tx = Math.max(r + 20, Math.min(w - r - 20, tailX ?? w / 2));
  const tailD = tail === 'down' ? `M${tx - 18} ${h - 2} L${tx} ${h + 28} L${tx + 18} ${h - 2}` : tail === 'up' ? `M${tx - 18} 2 L${tx} -28 L${tx + 18} 2` : '';
  const q = Math.min(r, w / 2, h / 2);
  const box = `M${q} 0 L${w - q} 0 Q${w} 0 ${w} ${q} L${w} ${h - q} Q${w} ${h} ${w - q} ${h} L${q} ${h} Q0 ${h} 0 ${h - q} L0 ${q} Q0 0 ${q} 0 Z`;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, ...style }}>
      {glow && <div style={{ position: 'absolute', inset: -24, background: 'radial-gradient(ellipse, rgba(240,127,46,0.25) 0%, rgba(240,127,46,0) 70%)' }} />}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {tail && <path d={`${tailD} Z`} fill={K.card} />}
        <path d={box} fill={K.card} />
        {tail && <path d={inkOf(tailD, 4.5, 3)} fill={K.ink} />}
        <path d={inkOf(box, 4.5, w % 7)} fill={K.ink} fillRule="evenodd" />
        {tail && <path d={`M${tx - 15} ${tail === 'down' ? h - 3 : 3} L${tx + 15} ${tail === 'down' ? h - 3 : 3}`} stroke={K.card} strokeWidth={8} />}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>{children}</div>
    </div>
  );
};

export const QBadge = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="-30 -30 60 60" style={{ overflow: 'visible' }}>
    <circle r={26} fill={K.card} />
    <path d={inkOf(ellipse(0, 0, 26, 26), 4, 2)} fill={K.ink} fillRule="evenodd" />
    <text x={0} y={11} textAnchor="middle" fontFamily={K.font} fontWeight={700} fontSize={34} fill={K.accent}>
      ؟
    </text>
  </svg>
);

/** an icon from the shared line library, drawn in ink with a pastel blob behind */
export const CardIcon = ({ id, size, tint }: { id: string; size: number; tint: string }) => {
  const ps = (ICONS[(id in ICONS ? id : 'sparkles') as IconId] ?? ICONS.sparkles) as readonly string[];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
      <circle cx={12} cy={12.5} r={10} fill={tint} />
      {ps.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={K.ink} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
};

export const TINTS = ['#FFE3B8', '#D7EEC0', '#CFE6F5', '#F8D3C5'];

/** thought bubble: cloud + two trailing circles */
export const Thought = ({ w, h, children }: { w: number; h: number; children: ReactNode }) => {
  const d = `M${w * 0.15} ${h * 0.8} Q${-w * 0.05} ${h * 0.75} ${w * 0.06} ${h * 0.45} Q${0} ${h * 0.1} ${w * 0.3} ${h * 0.12} Q${w * 0.45} ${-h * 0.08} ${w * 0.65} ${h * 0.1} Q${w * 1.0} ${h * 0.05} ${w * 0.95} ${h * 0.45} Q${w * 1.05} ${h * 0.85} ${w * 0.75} ${h * 0.85} Q${w * 0.45} ${h * 1.02} ${w * 0.15} ${h * 0.8} Z`;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h }}>
      <svg width={w} height={h + 70} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={d} fill={K.card} />
        <path d={inkOf(d, 4.5, 5)} fill={K.ink} fillRule="evenodd" />
        {[
          [w * 0.32, h + 22, 14],
          [w * 0.24, h + 52, 8],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={K.card} />
            <path d={inkOf(ellipse(x!, y!, r!, r!), 3.5, 7 + i)} fill={K.ink} fillRule="evenodd" />
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
};
