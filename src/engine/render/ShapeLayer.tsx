import { useCurrentFrame } from 'remotion';
import type { CLayer } from '../compile';
import type { ShapeL } from '../schema';
import { useTheme } from './theme';
import { clamp01, enter, exitP, popSpring } from './anim';

/** Vector accents: circles, rings, arrows, scribbles, bursts… drawn on with stroke animation. */
export const ShapeLayerView = ({ l }: { l: CLayer & ShapeL }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const { W, H, u, fps } = t;
  if (frame < l.inF) return null;
  const out = exitP(frame, l.outF, fps);
  if (out <= 0) return null;
  const w = l.w * W;
  const h = (l.h ?? (['line', 'underline', 'arrow', 'bar', 'wave'].includes(l.kind) ? 0.04 : l.w)) * (l.h ? H : W);
  const c = t.color(l.color);
  const sw = l.stroke * u;
  const d = clamp01(enter(frame, l.inF, 'smooth', fps, 18));
  const s = popSpring(frame, l.inF, fps);
  const k = frame - l.inF;
  const L = 1000;
  const dash = l.anim === 'draw' ? { strokeDasharray: L, strokeDashoffset: L * (1 - d), pathLength: L } : {};
  const fill = l.fill ? c : 'none';
  let g: React.ReactNode = null;
  const vb = `0 0 ${w} ${h}`;
  switch (l.kind) {
    case 'circle': g = <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - sw} ry={h / 2 - sw} fill={fill} stroke={l.fill ? 'none' : c} strokeWidth={sw} {...dash} />; break;
    case 'ring': g = <><ellipse cx={w / 2} cy={h / 2} rx={w / 2 - sw} ry={h / 2 - sw} fill="none" stroke={c} strokeWidth={sw} opacity={0.35} /><ellipse cx={w / 2} cy={h / 2} rx={w / 2 - sw} ry={h / 2 - sw} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" {...dash} /></>; break;
    case 'rect':
    case 'frame': g = <rect x={sw} y={sw} width={w - 2 * sw} height={h - 2 * sw} rx={l.kind === 'frame' ? 0 : 24 * u} fill={fill} stroke={l.fill ? 'none' : c} strokeWidth={sw} {...dash} />; break;
    case 'line':
    case 'underline': g = <path d={`M ${sw} ${h / 2} L ${w - sw} ${h / 2}`} stroke={c} strokeWidth={l.kind === 'underline' ? h * 0.7 : sw} strokeLinecap="round" {...dash} />; break;
    case 'bar': g = <rect x={0} y={0} width={w * d} height={h} rx={h / 2} fill={c} />; break;
    case 'arrow': g = <><path d={`M ${sw} ${h / 2} Q ${w * 0.5} ${-h * 0.6} ${w - sw * 3} ${h / 2}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" {...dash} />{d > 0.85 && <path d={`M ${w - sw * 7} ${h / 2 - sw * 3} L ${w - sw} ${h / 2} L ${w - sw * 7} ${h / 2 + sw * 3}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />}</>; break;
    case 'scribble': g = <path d={`M ${w * 0.5} ${h * 0.06} C ${w * 0.95} ${h * 0.02} ${w * 0.99} ${h * 0.55} ${w * 0.62} ${h * 0.93} C ${w * 0.25} ${h * 1.02} ${w * 0.01} ${h * 0.62} ${w * 0.08} ${h * 0.3} C ${w * 0.15} ${h * 0.05} ${w * 0.6} ${h * 0.04} ${w * 0.7} ${h * 0.12}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" {...dash} />; break;
    case 'burst': g = <>{Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; const r0 = Math.min(w, h) * 0.22, r1 = Math.min(w, h) * (0.32 + 0.16 * d); return <line key={i} x1={w / 2 + Math.cos(a) * r0} y1={h / 2 + Math.sin(a) * r0} x2={w / 2 + Math.cos(a) * r1} y2={h / 2 + Math.sin(a) * r1} stroke={c} strokeWidth={sw} strokeLinecap="round" opacity={d} />; })}</>; break;
    case 'cross': g = <path d={`M ${w * 0.15} ${h * 0.15} L ${w * 0.85} ${h * 0.85} M ${w * 0.85} ${h * 0.15} L ${w * 0.15} ${h * 0.85}`} stroke={c} strokeWidth={sw} strokeLinecap="round" {...dash} />; break;
    case 'check': g = <path d={`M ${w * 0.12} ${h * 0.55} L ${w * 0.4} ${h * 0.82} L ${w * 0.9} ${h * 0.18}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...dash} />; break;
    case 'blob': { const r = (o: number) => 0.42 + 0.06 * Math.sin(k / 20 + o); g = <path d={`M ${w * 0.5} ${h * (0.5 - r(0))} C ${w * (0.5 + r(1))} ${h * 0.05} ${w * 0.98} ${h * (0.5 - 0.1)} ${w * (0.5 + r(2))} ${h * 0.55} C ${w * 0.95} ${h * 0.95} ${w * 0.6} ${h * (0.5 + r(3))} ${w * 0.45} ${h * 0.94} C ${w * 0.1} ${h * 0.96} ${w * (0.5 - r(4))} ${h * 0.6} ${w * 0.08} ${h * 0.42} C ${w * 0.05} ${h * 0.1} ${w * 0.35} ${h * 0.04} ${w * 0.5} ${h * (0.5 - r(0))} Z`} fill={c} opacity={0.9} />; break; }
    case 'dots': g = <>{Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => <circle key={`${i}-${j}`} cx={(w / 5) * (i + 0.5)} cy={(h / 5) * (j + 0.5)} r={Math.min(w, h) * 0.025} fill={c} opacity={clamp01(d * 2 - (i + j) * 0.08)} />))}</>; break;
    case 'spark': g = <path d={`M ${w / 2} 0 C ${w * 0.55} ${h * 0.4} ${w * 0.6} ${h * 0.45} ${w} ${h / 2} C ${w * 0.6} ${h * 0.55} ${w * 0.55} ${h * 0.6} ${w / 2} ${h} C ${w * 0.45} ${h * 0.6} ${w * 0.4} ${h * 0.55} 0 ${h / 2} C ${w * 0.4} ${h * 0.45} ${w * 0.45} ${h * 0.4} ${w / 2} 0 Z`} fill={c} />; break;
    case 'arc': g = <path d={`M ${w * 0.05} ${-h * 0.05} C ${w * 0.15} ${h * 0.45} ${w * 0.95} ${h * 0.4} ${w * 0.85} ${h * 1.05}`} fill="none" stroke={c} strokeWidth={sw * 6} strokeLinecap="butt" opacity={0.55} {...dash} />; break;
    case 'shard': g = <>{[[0.0, 0.0, 1.0, 0.18, 0.3, 0.55], [0.0, 0.0, 0.7, 0.5, 0.12, 0.9], [0.0, 0.0, 0.45, 0.85, 0.05, 0.6]].map(([x0, y0, x1, y1, x2, y2], i) => <path key={i} d={`M ${x0! * w} ${y0! * h} L ${x1! * w * (0.3 + 0.7 * d)} ${y1! * h * (0.3 + 0.7 * d)} L ${x2! * w * (0.3 + 0.7 * d)} ${y2! * h * (0.3 + 0.7 * d)} Z`} fill={c} opacity={i ? 0.85 : 1} />)}</>; break;
    case 'wave': g = <path d={Array.from({ length: 41 }, (_, i) => `${i ? 'L' : 'M'} ${(i / 40) * w} ${h / 2 + Math.sin(i / 3 + k / 5) * h * 0.35 * d}`).join(' ')} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />; break;
  }
  const tr = l.anim === 'pop' ? `scale(${s})` : l.anim === 'grow' ? `scaleX(${d})` : l.anim === 'pulse' ? `scale(${(0.6 + 0.4 * s) * (1 + Math.sin(k / 8) * 0.05)})` : l.anim === 'spin' ? `rotate(${k * 1.2}deg) scale(${s})` : '';
  return (
    <svg width={w} height={h} viewBox={vb} style={{ position: 'absolute', left: l.x * W - w / 2, top: l.y * H - h / 2, overflow: 'visible', opacity: out * l.opacity * (l.anim === 'fade' ? d : 1), transform: `${tr} rotate(${l.rotate}deg)` }}>
      {g}
    </svg>
  );
};
