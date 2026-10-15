import type { CSSProperties, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import type { TransitionId } from '@/lib/schema/dna';
import { useTheme } from './theme';
import { clamp01 } from './motion';

export const transitionFrames = (id: TransitionId, fps: number) => (id === 'cut' ? 0 : Math.round(((id === 'flash' ? 8 : id === 'fade' || id === 'blur' ? 12 : 14) * fps) / 30));

/** Wraps an incoming scene; animates over its first N frames. Directional moves follow RTL reading order. */
export const TransitionIn = ({ id, children }: { id: TransitionId; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const n = transitionFrames(id, t.fps);
  if (n === 0 || frame >= n) return <div style={{ position: 'absolute', inset: 0 }}>{children}</div>;
  const raw = clamp01(frame / n);
  const p = 1 - Math.pow(1 - raw, 3);
  const { W, H } = t;
  let style: CSSProperties = {};
  let overlay: ReactNode = null;
  switch (id) {
    case 'fade':
      style = { opacity: p };
      break;
    case 'push':
      style = { transform: `translateX(${(1 - p) * -W}px)` }; // new content enters from the left: reading flows right→left
      break;
    case 'slide':
      style = { transform: `translateY(${(1 - p) * H}px)` };
      break;
    case 'wipe':
      style = { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` }; // reveals from right to left
      break;
    case 'zoom':
      style = { transform: `scale(${1.6 - 0.6 * p})`, opacity: p };
      break;
    case 'iris':
      style = { clipPath: `circle(${p * 75}% at 50% 45%)` };
      break;
    case 'shutter':
      style = { clipPath: `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0)` };
      break;
    case 'blur':
      style = { opacity: p, filter: `blur(${(1 - p) * 30 * t.u}px)` };
      break;
    case 'flash':
      style = {};
      overlay = <div style={{ position: 'absolute', inset: 0, backgroundColor: '#ffffff', opacity: 1 - raw }} />;
      break;
    default:
      break;
  }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      {children}
      {overlay}
    </div>
  );
};
