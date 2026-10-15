import { useCurrentFrame } from 'remotion';
import type { CLayer } from '../compile';
import type { CounterL } from '../schema';
import { fmtNum, toDigits } from '../text';
import { alpha, useTheme } from './theme';
import { clamp01, exitP, popSpring } from './anim';

const SIZE = { l: 150, xl: 210, xxl: 290, mega: 400 } as const;

export const CounterLayerView = ({ l }: { l: CLayer & CounterL }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  if (frame < l.inF) return null;
  const out = exitP(frame, l.outF, t.fps);
  const p = clamp01((frame - l.inF) / Math.round(0.85 * t.fps));
  const e = 1 - Math.pow(1 - p, 4);
  const v = l.from + (l.value - l.from) * e;
  const f = t.font(l.role);
  const c = t.color(l.color);
  const s = popSpring(frame, l.inF, t.fps);
  const text = toDigits(`${l.prefix}${fmtNum(v, l.decimals)}${l.suffix}`, t.digits);
  const size = SIZE[l.size] * t.u * Math.min(1, 6 / Math.max(3, text.length));
  return (
    <div dir="ltr" style={{ position: 'absolute', left: l.x * t.W - (l.w * t.W) / 2, top: l.y * t.H - size * 0.6, width: l.w * t.W, textAlign: 'center', fontFamily: f.family, fontWeight: f.weight, fontSize: size, lineHeight: 1.1, color: c, opacity: out * clamp01(s * 2) * l.opacity, transform: `scale(${0.6 + 0.4 * s}) rotate(${l.rotate}deg)`, textShadow: t.tone === 'dark' ? `0 0 ${size * 0.25}px ${alpha(t.style.palette.accent, 0.45)}` : undefined }}>
      {text}
    </div>
  );
};
