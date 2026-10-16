import React from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile } from 'remotion';
import { BODY, C, DISPLAY, EASE_IN, SAFE } from './theme';
import { Line, TIMING, prog } from './timing';

/** Scene clock in seconds (same numbers as words.json). */
export const clock = (from: number, frame: number, fps = 30) => from + frame / fps;

/** Full-bleed photo with a slow, deterministic camera move. */
export const Photo: React.FC<{
  src: string; t: number; a: number; b: number;
  from: { s: number; x: number; y: number }; to: { s: number; x: number; y: number };
  style?: React.CSSProperties;
}> = ({ src, t, a, b, from, to, style }) => {
  const k = prog(t, a, b, (x) => x * (2 - x));
  const s = interpolate(k, [0, 1], [from.s, to.s]);
  const x = interpolate(k, [0, 1], [from.x, to.x]);
  const y = interpolate(k, [0, 1], [from.y, to.y]);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: '50% 50%' }} />
    </AbsoluteFill>
  );
};

/** Soft film grain + vignette, the finishing layer on every scene. */
export const Finish: React.FC<{ frame: number; dark?: boolean }> = ({ frame, dark }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 45%, transparent 55%, ${dark ? 'rgba(0,0,0,.55)' : 'rgba(60,40,25,.22)'} 100%)` }} />
    <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'soft-light' }}>
      <filter id={`g${frame % 4}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 4} /></filter>
      <rect width="1080" height="1920" filter={`url(#g${frame % 4})`} />
    </svg>
  </AbsoluteFill>
);

/** Big headline: words enter one by one from blur; `chip` words sit in an amber pill. */
export const Headline: React.FC<{
  t: number; words: { w: string; at: number; chip?: boolean }[];
  y?: number; size?: number; color?: string; out?: number; glow?: boolean;
}> = ({ t, words, y = SAFE.top + 40, size = 118, color = C.ink, out, glow }) => {
  const ko = out === undefined ? 0 : prog(t, out, out + 0.3, EASE_IN);
  return (
    <div dir="rtl" style={{ position: 'absolute', top: y, left: 70, right: 70, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.28}px`, opacity: 1 - ko, transform: `translateY(${-ko * 30}px)` }}>
      {words.map((w, i) => {
        const k = prog(t, w.at - 0.12, w.at + 0.38, EASE_IN);
        const pop = w.chip ? interpolate(prog(t, w.at, w.at + 0.5), [0, 0.4, 1], [0.9, 1.06, 1]) : 1;
        return (
          <span key={i} style={{
            fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 1.4, color: w.chip ? C.espresso : color,
            opacity: k, filter: `blur(${(1 - k) * 14}px)`, transform: `translateY(${(1 - k) * 34}px) scale(${pop})`, display: 'inline-block',
            padding: w.chip ? `0 ${size * 0.26}px` : 0, borderRadius: size * 0.32, background: w.chip ? C.amber : 'transparent',
            boxShadow: w.chip ? '0 18px 40px rgba(120,70,20,.35)' : 'none',
            textShadow: glow ? '0 4px 30px rgba(0,0,0,.35)' : 'none',
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};

/** Step tag used through the packing process: number disc + short label. */
export const StepTag: React.FC<{ t: number; at: number; n: string; label: string; dark?: boolean }> = ({ t, at, n, label, dark }) => {
  const k = prog(t, at - 0.15, at + 0.35, EASE_IN);
  return (
    <div dir="rtl" style={{ position: 'absolute', top: SAFE.top + 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * -30}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '16px 40px 16px 20px', borderRadius: 999, background: dark ? 'rgba(255,251,245,.1)' : C.white, boxShadow: '0 20px 50px rgba(80,55,35,.18)' }}>
        <div style={{ width: 92, height: 92, borderRadius: 46, background: C.espresso, color: C.amberSoft, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, color: dark ? C.white : C.ink, lineHeight: 1.35 }}>{label}</div>
      </div>
    </div>
  );
};

/** Captions: the spoken line in chunks of up to 4 words; the word being said turns amber. */
type Chunk = { words: Line['words']; start: number; end: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const l of TIMING.lines) {
    const n = Math.ceil(l.words.length / 4);
    const per = Math.ceil(l.words.length / n);
    for (let i = 0; i < l.words.length; i += per) {
      const ws = l.words.slice(i, i + per);
      out.push({ words: ws, start: ws[0].start, end: ws[ws.length - 1].end });
    }
  }
  return out.map((c, i) => ({ ...c, end: Math.min(c.end + 0.5, out[i + 1]?.start ?? c.end + 0.5) }));
})();

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.start - 0.08 && t < x.end);
  if (!c) return null;
  const k = prog(t, c.start - 0.08, c.start + 0.14, EASE_IN);
  return (
    <div dir="rtl" style={{ position: 'absolute', left: 60, right: 60, bottom: 1920 - SAFE.captionBottom, display: 'flex', justifyContent: 'center' }}>
      <div style={{ padding: '18px 36px 22px', borderRadius: 30, background: 'rgba(33,26,21,.82)', boxShadow: '0 16px 40px rgba(0,0,0,.25)', opacity: k, transform: `scale(${0.94 + 0.06 * k})`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 18px', maxWidth: 940 }}>
        {c.words.map((w, i) => {
          const on = t >= w.start - 0.05;
          return (
            <span key={i} style={{ fontFamily: BODY, fontWeight: 800, fontSize: 60, lineHeight: 1.45, color: on ? (t < w.end + 0.05 ? C.amberSoft : C.white) : 'rgba(255,251,245,.45)' }}>{w.w}</span>
          );
        })}
      </div>
    </div>
  );
};

/** A check mark disc that pops in. */
export const Check: React.FC<{ k: number; size?: number; style?: React.CSSProperties }> = ({ k, size = 90, style }) => {
  const s = interpolate(k, [0, 0.6, 1], [0, 1.15, 1]);
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 10px 26px rgba(120,70,20,.4)', ...style }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke={C.espresso} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, k * 1.4)} /></svg>
    </div>
  );
};

/** Deterministic pseudo-random helper. */
export const rnd = (seed: string) => random(seed);
