/**
 * Scene-local helpers for the product style. Each scene renders inside its own <Sequence>, so `f` is the frame
 * inside the scene. "When" always comes from a word id → TimingIndex (the one place seconds become frames).
 */
import { Easing, useCurrentFrame } from 'remotion';
import { useVideo } from '@/engine/context';

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const mix = (k: number, a: number, b: number) => a + (b - a) * k;

export const E = {
  out: Easing.out(Easing.cubic),
  in: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  sine: Easing.inOut(Easing.sin),
  outBack: Easing.out(Easing.back(1.4)),
  outQuad: Easing.out(Easing.quad),
  linear: Easing.linear,
};

/** 0→1 between frame a and a+dur (frames), eased */
export const prog = (f: number, a: number, dur: number, ease: (x: number) => number = E.out) => (dur <= 0 ? (f >= a ? 1 : 0) : ease(clamp01((f - a) / dur)));

/** piecewise keys [[frame, value], …] eased between keys */
export const keys = (f: number, ks: Array<[number, number]>, ease: (x: number) => number = E.sine) => {
  if (!ks.length) return 0;
  if (f <= ks[0]![0]) return ks[0]![1];
  for (let i = 1; i < ks.length; i++) {
    const [f1, v1] = ks[i]!;
    const [f0, v0] = ks[i - 1]!;
    if (f <= f1) return v0 + (v1 - v0) * ease(clamp01((f - f0) / Math.max(1, f1 - f0)));
  }
  return ks[ks.length - 1]![1];
};

/** seconds → frames for SMALL durations only (entrances, holds). "When" always comes from a word. */
export const sec = (s: number, fps: number) => Math.round(s * fps);

/** scene clock: `from` = the scene's first frame on the video clock */
export const useScene = (from: number) => {
  const v = useVideo();
  const f = useCurrentFrame();
  const { T } = v;
  return {
    ...v,
    f,
    vertical: v.H > v.W * 1.2,
    square: Math.abs(v.W - v.H) < 10,
    /** start frame of a word, scene-local */
    at: (id: string | undefined, fb = 0) => (id ? T.toFrame(T.byId(id).start) - from : fb),
    /** end frame of a word, scene-local */
    end: (id: string | undefined, fb = 0) => (id ? Math.max(T.toFrame(T.byId(id).start) + 1, T.toFrame(T.byId(id).end)) - from : fb),
    range: (a: string, b: string) => T.range(a, b).map((w) => ({ id: w.id, s: T.toFrame(w.start) - from, e: T.toFrame(w.end) - from })),
  };
};
