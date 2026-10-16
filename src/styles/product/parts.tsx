/** product style building blocks: glow stage, kinetic word line, gradient text, brand mark, neon frame. */
import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { E, clamp01, mix, prog, sec, useScene } from '@/engine/scene';
import { measure } from '@/engine/measure';
import { glow } from '@/engine/paint';
import { ACCENTS, T, type AccentId } from './tokens';

export const FAMILY = 'Readex Pro';
export const W_BOLD = 700;

/** The stage: near-black with a soft blue→violet→orange dome of light at the bottom (or light paper with a violet glow). */
export const Stage = ({ theme, warm = 0, lift = 0 }: { theme: 'dark' | 'light'; warm?: number; lift?: number }) => {
  const f = useCurrentFrame();
  const { W, H } = useScene(0);
  const drift = Math.sin(f / 70) * 0.04;
  const drift2 = Math.cos(f / 90) * 0.05;
  if (theme === 'light') {
    return (
      <AbsoluteFill style={{ backgroundColor: T.light }}>
        <div style={{ position: 'absolute', left: W * (0.12 + drift), width: W * 0.76, top: H * (0.62 - lift), height: H * 0.62, background: glow(`rgba(168,139,255,0.55), rgba(168,139,255,0.18) 55%, rgba(168,139,255,0) 100%`) }} />
        <div style={{ position: 'absolute', left: W * (0.3 + drift2), width: W * 0.4, top: H * (0.78 - lift), height: H * 0.4, background: glow(`rgba(217,70,239,0.28), rgba(217,70,239,0) 100%`) }} />
      </AbsoluteFill>
    );
  }
  const dome = H * 0.52;
  return (
    <AbsoluteFill style={{ backgroundColor: T.dark }}>
      {/* violet core */}
      <div style={{ position: 'absolute', left: -W * 0.15, width: W * 1.3, top: H - dome * (0.78 + lift), height: dome * 1.5, background: glow(`rgba(108,59,255,0.95), rgba(92,52,230,0.55) 45%, rgba(60,30,160,0.18) 75%, rgba(20,10,60,0) 100%`) }} />
      {/* blue left */}
      <div style={{ position: 'absolute', left: W * (-0.28 + drift), width: W * 0.9, top: H - dome * (0.62 + lift), height: dome * 1.2, background: glow(`rgba(47,91,255,0.85), rgba(47,91,255,0.25) 60%, rgba(47,91,255,0) 100%`) }} />
      {/* orange/pink right — warmer on "send" */}
      <div style={{ position: 'absolute', left: W * (0.42 + drift2), width: W * 0.9, top: H - dome * (0.5 + lift), height: dome * 1.1, background: glow(`rgba(255,106,26,${0.55 + 0.35 * warm}), rgba(217,70,239,${0.22 + 0.2 * warm}) 55%, rgba(217,70,239,0) 100%`) }} />
      {/* darken the top so the dome reads as a horizon */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${T.dark} 0%, rgba(5,5,10,0.92) 38%, rgba(5,5,10,0.15) 72%, rgba(5,5,10,0) 100%)` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }} />
    </AbsoluteFill>
  );
};

/** gradient-filled text (padding + negative margin so dots/descenders are never clipped). */
export const Grad = ({ children, grad, style }: { children: ReactNode; grad: string; style?: CSSProperties }) => (
  <span style={{ backgroundImage: grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', padding: '0.18em 0.08em', margin: '-0.18em -0.08em', display: 'inline-block', ...style }}>{children}</span>
);

export type LWord = { t: string; f: number; em?: 'grad' | 'accent' | 'muted' };

const wordColor = (em: LWord['em'], theme: 'dark' | 'light', accent: AccentId) => {
  if (em === 'accent') return ACCENTS[accent].a;
  if (em === 'muted') return theme === 'dark' ? T.grey : T.greyLight;
  return theme === 'dark' ? T.text : T.textDark;
};

/**
 * Kinetic line (the signature): word 1 enters giant out of a blur, then shrinks to line size while the next
 * words open beside it one by one (blur → sharp). Rows are centred; RTL. All frames are scene-local.
 */
export const KLine = ({ rows, size, giant, theme, accent, exitAt, y, echo = false }: { rows: LWord[][]; size: number; giant: boolean; theme: 'dark' | 'light'; accent: AccentId; exitAt: number; y: number; echo?: boolean }) => {
  const f = useCurrentFrame();
  const v = useScene(0);
  const { W, u } = v;
  const fps = v.fps;
  const maxW = W * 0.86;
  const all = rows.flat();
  const first = all[0];
  if (!first) return null;
  const second = all[1];
  const giantSize = Math.min(fitSize(first.t, W * (v.vertical ? 0.78 : 0.5)), size * 4.2);
  const shrinkAt = second ? second.f - sec(T.shrinkS * 0.6, fps) : Number.POSITIVE_INFINITY;
  const shrink = giant ? prog(f, shrinkAt, sec(T.shrinkS, fps), E.inOut) : 1;
  const exit = prog(f, exitAt - sec(T.exitS, fps), sec(T.exitS, fps), E.in);
  const rowSizes = rows.map((r) => {
    const w = r.reduce((a, x) => a + measure(x.t, FAMILY, W_BOLD, size) + size * 0.28, 0);
    return w > maxW ? (size * maxW) / w : size;
  });
  const gap = (s: number) => s * 0.28;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: `translateX(${-exit * 60 * u}px)`, opacity: 1 - exit, filter: exit > 0.01 ? `blur(${exit * 14 * u}px)` : undefined }}>
      {echo ? <Echo rows={rows} size={size} rowSizes={rowSizes} theme={theme} y={y} f={f} /> : null}
      <div dir="rtl" style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-50%)', gap: size * 0.35 }}>
        {rows.map((r, ri) => (
          <div key={ri} style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', fontFamily: T.font, fontWeight: W_BOLD, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
            {r.map((w, wi) => {
              const isFirst = ri === 0 && wi === 0;
              const rs = rowSizes[ri]!;
              const fs = isFirst && giant ? mix(shrink, giantSize, rs) : rs;
              const enterDur = sec(isFirst ? T.enterS : T.followS, fps);
              const k = prog(f, w.f - sec(0.06, fps), enterDur, E.out);
              const ww = measure(w.t, FAMILY, W_BOLD, rs) + gap(rs);
              // followers open their slot (line re-centres smoothly); the first word always has its slot
              const open = isFirst ? 1 : prog(f, w.f - sec(0.1, fps), sec(0.22, fps), E.out);
              const color = wordColor(w.em, theme, accent);
              const blur = (1 - k) * (isFirst ? 18 : 12) * u;
              const inner = w.em === 'grad' ? <Grad grad={ACCENTS[accent].grad}>{w.t}</Grad> : <span style={{ color }}>{w.t}</span>;
              return (
                <span key={wi} style={{ display: 'inline-flex', justifyContent: 'flex-start', width: isFirst ? undefined : ww * open, marginInlineEnd: isFirst ? gap(rs) * (second ? shrink : 0) : 0, clipPath: isFirst ? undefined : 'inset(-40% -2% -40% -2%)' }}>
                  <span style={{ fontSize: fs, opacity: k, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `scale(${mix(k, isFirst ? 1.06 : 1.03, 1)})`, display: 'inline-block', transformOrigin: '50% 60%' }}>{inner}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** faint ghost copies above and below a statement (the "لكل فكرة أسلوبها" moment). */
const Echo = ({ rows, size, rowSizes, theme, y, f }: { rows: LWord[][]; size: number; rowSizes: number[]; theme: 'dark' | 'light'; y: number; f: number }) => {
  const k = clamp01((f - (rows[0]?.[0]?.f ?? 0)) / 12);
  const text = rows.map((r) => r.map((w) => w.t).join(' ')).join(' ');
  const col = theme === 'dark' ? 'rgba(245,243,255,0.07)' : 'rgba(27,24,48,0.06)';
  return (
    <>
      {[-1, 1].map((d) => (
        <div key={d} dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: y + d * size * 1.35 * k, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: T.font, fontWeight: W_BOLD, fontSize: rowSizes[0] ?? size, color: col, lineHeight: 1.4, whiteSpace: 'nowrap', opacity: k, filter: `blur(${2}px)` }}>
          {text}
        </div>
      ))}
    </>
  );
};

/** font size so a word fills `width` (measured after fonts load). */
export const fitSize = (t: string, width: number, weight = W_BOLD) => {
  const w = measure(t, FAMILY, weight, 100);
  return w > 0 ? (100 * width) / w : 100;
};

/** Brand mark: a rounded hexagon tile with a gradient and the brand initial (or a play glyph). */
export const Mark = ({ size, accent, letter, glow = 1 }: { size: number; accent: AccentId; letter?: string; glow?: number }) => {
  const a = ACCENTS[accent];
  const hex = 'M50 4 L88 26 Q92 28.5 92 33 L92 67 Q92 71.5 88 74 L50 96 Q46 98 42 96 L12 74 Q8 71.5 8 67 L8 33 Q8 28.5 12 26 L42 4 Q46 2 50 4 Z';
  const id = `mk-${accent}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', display: 'block', filter: glow ? `drop-shadow(0 0 ${size * 0.25 * glow}px ${a.b}aa)` : undefined }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a.a} />
          <stop offset="1" stopColor={a.b} />
        </linearGradient>
      </defs>
      <path d={hex} fill={`url(#${id})`} />
      <path d={hex} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
      {letter ? (
        <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fontFamily={T.font} fontWeight={700} fontSize={letter.length > 1 ? 34 : 44} fill="#fff">
          {letter}
        </text>
      ) : (
        <path d="M40 33 L68 50 L40 67 Z" fill="#fff" strokeLinejoin="round" stroke="#fff" strokeWidth={4} />
      )}
      <circle cx="80" cy="20" r="5" fill={T.orangeLight} />
    </svg>
  );
};

/** Neon frame: an SVG rounded rect drawn by a running light head, with a blurred glow copy. */
export const NeonFrame = ({ w, h, r, draw, accent, strokeW, glow = 1 }: { w: number; h: number; r: number; draw: number; accent: AccentId; strokeW: number; glow?: number }) => {
  const id = `nf-${accent}-${Math.round(w)}`;
  const head = clamp01(draw);
  const path = `M ${w - r} 0 H ${r} A ${r} ${r} 0 0 0 0 ${r} V ${h - r} A ${r} ${r} 0 0 0 ${r} ${h} H ${w - r} A ${r} ${r} 0 0 0 ${w} ${h - r} V ${r} A ${r} ${r} 0 0 0 ${w - r} 0 Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ACCENTS[accent].a} />
          <stop offset="0.5" stopColor={T.pink} />
          <stop offset="1" stopColor={T.orangeLight} />
        </linearGradient>
      </defs>
      <path d={path} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - head} fill="none" stroke={`url(#${id})`} strokeWidth={strokeW * 3.2} opacity={0.45 * glow} style={{ filter: `blur(${strokeW * 3}px)` }} />
      <path d={path} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - head} fill="none" stroke={`url(#${id})`} strokeWidth={strokeW} strokeLinecap="round" />
      {head > 0 && head < 1 ? <path d={path} pathLength={1} strokeDasharray="0.025 1" strokeDashoffset={-(head - 0.025)} fill="none" stroke="#fff" strokeWidth={strokeW * 1.3} strokeLinecap="round" /> : null}
    </svg>
  );
};
