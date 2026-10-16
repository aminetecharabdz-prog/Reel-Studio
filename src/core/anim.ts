/** Frame-pure animation helpers (no CSS animations, no Math.random, no Date). */
import { Easing, interpolate } from 'remotion';

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const E = {
  out: Easing.out(Easing.cubic),
  in: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  sine: Easing.inOut(Easing.sin),
  outQuint: Easing.out(Easing.poly(5)),
  outBack: Easing.out(Easing.back(1.6)),
  expo: Easing.out(Easing.exp),
};

/** 0→1 between frame a and frame a+dur (frames), eased */
export const prog = (f: number, a: number, dur: number, ease: (x: number) => number = E.out) => (dur <= 0 ? (f >= a ? 1 : 0) : ease(clamp01((f - a) / dur)));

/** map k (0..1) to a range */
export const mix = (k: number, a: number, b: number) => a + (b - a) * k;

/** piecewise camera keys: [[frame, value], ...] eased between keys */
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

export const interp = (f: number, input: number[], output: number[], ease: (x: number) => number = E.out) =>
  interpolate(f, input, output, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

/** seconds → frames for SMALL durations only (entrances, holds). "When" always comes from a word. */
export const sec = (s: number, fps: number) => Math.round(s * fps);
