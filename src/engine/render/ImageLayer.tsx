import { Img, useCurrentFrame } from 'remotion';
import type { CLayer } from '../compile';
import type { ImageL } from '../schema';
import { alpha, useTheme } from './theme';
import { clamp01, enter, exitP, popSpring } from './anim';

/** Photo / cut-out object / framed media, with entrance, idle loop, drop shadow and optional glow. */
export const ImageLayerView = ({ l, cam }: { l: CLayer & ImageL; cam: { dx: number; dy: number } }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const { W, H, u, fps } = t;
  if (!l.url) return null;
  const w = l.w * W;
  const h = (l.h ?? l.w * (l.frame === 'phone' ? 2.05 : l.frame === 'polaroid' ? 1.18 : l.frame === 'tv' ? 0.85 : 1)) * (l.h ? H : W);
  const out = exitP(frame, l.outF, fps);
  if (out <= 0) return null;
  const p = enter(frame, l.inF, t.style.motion, fps, 16);
  const s = popSpring(frame, l.inF, fps);
  const k = frame - l.inF;
  let tr = '';
  let op = 1;
  let clip: string | undefined;
  switch (l.anim) {
    case 'pop': tr = `scale(${0.3 + 0.7 * s})`; op = clamp01(s * 2); break;
    case 'drop': tr = `translateY(${(1 - s) * -H * 0.6}px) rotate(${(1 - s) * 12}deg)`; op = clamp01(s * 3); break;
    case 'float': tr = `translateY(${(1 - p) * 140 * u}px)`; op = clamp01(p * 1.4); break;
    case 'slide-left': tr = `translateX(${(1 - p) * -W * 0.8}px)`; break;
    case 'slide-right': tr = `translateX(${(1 - p) * W * 0.8}px)`; break;
    case 'zoom': tr = `scale(${1.6 - 0.6 * p})`; op = clamp01(p * 1.5); break;
    case 'reveal': clip = `inset(${(1 - clamp01(p)) * 100}% 0 0 0)`; break;
    case 'spin': tr = `rotate(${(1 - s) * -180}deg) scale(${0.4 + 0.6 * s})`; op = clamp01(s * 2); break;
    case 'flip': tr = `scaleX(${Math.max(0.02, s)})`; break;
    default: op = clamp01(p);
  }
  if (frame < l.inF) return null;
  const idle = l.idle === 'float' ? `translateY(${Math.sin(k / 22) * 14 * u}px)` : l.idle === 'bob' ? `translateY(${Math.abs(Math.sin(k / 10)) * -16 * u}px)` : l.idle === 'spin' ? `rotate(${k * 0.6}deg)` : l.idle === 'pulse' ? `scale(${1 + Math.sin(k / 9) * 0.03})` : l.idle === 'sway' ? `rotate(${Math.sin(k / 18) * 4}deg)` : '';
  const par = (l.depth - 0.5) * 2;
  const glow = l.glow ? t.color(l.glow) : null;
  const shadow = l.shadow ? (l.frame === 'none' ? `drop-shadow(0px ${26 * u}px ${30 * u}px ${alpha('#000000', t.tone === 'light' ? 0.28 : 0.6)})` : '') : '';
  const glowF = glow ? ` drop-shadow(0px 0px ${40 * u}px ${alpha(glow, 0.75)})` : '';
  const framed = l.frame !== 'none';
  const radius = l.frame === 'circle' ? '50%' : l.frame === 'arch' ? `${w / 2}px ${w / 2}px ${24 * u}px ${24 * u}px` : l.frame === 'phone' ? 70 * u : l.frame === 'rounded' || l.frame === 'card' ? 36 * u : l.frame === 'tv' ? 40 * u : 6 * u;
  const media = <Img src={l.url} style={{ width: '100%', height: '100%', objectFit: framed ? 'cover' : l.fit, transform: l.flipX ? 'scaleX(-1)' : undefined, display: 'block' }} />;
  return (
    <div style={{ position: 'absolute', left: l.x * W - w / 2 + cam.dx * par, top: l.y * H - h / 2 + cam.dy * par, width: w, height: h, opacity: op * out * l.opacity, transform: `${tr} rotate(${l.rotate}deg)`, clipPath: clip, filter: `${shadow}${glowF}` || undefined }}>
      <div style={{ width: '100%', height: '100%', transform: idle || undefined }}>
        {l.frame === 'none' ? media : (
          <div style={{ width: '100%', height: '100%', borderRadius: radius, overflow: 'hidden', backgroundColor: l.frame === 'polaroid' ? '#FAFAF7' : '#0E0E12', padding: l.frame === 'polaroid' ? `${18 * u}px ${18 * u}px ${70 * u}px` : l.frame === 'phone' ? 14 * u : l.frame === 'tv' ? 26 * u : 0, boxShadow: `0 ${30 * u}px ${60 * u}px ${alpha('#000000', 0.45)}`, border: l.frame === 'card' ? `${6 * u}px solid #FFFFFF` : undefined }}>
            <div style={{ width: '100%', height: '100%', borderRadius: l.frame === 'phone' ? 56 * u : l.frame === 'tv' ? 22 * u : 0, overflow: 'hidden' }}>{media}</div>
          </div>
        )}
      </div>
    </div>
  );
};
