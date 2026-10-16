/** Animation helpers. Everything is a pure function of time (seconds of the VIDEO clock). */
import { Easing, interpolate } from 'remotion';

export const ease = {
  linear: Easing.linear,
  outCubic: Easing.out(Easing.cubic),
  inCubic: Easing.in(Easing.cubic),
  inOutCubic: Easing.inOut(Easing.cubic),
  inOutSine: Easing.inOut(Easing.sin),
  outExpo: Easing.out(Easing.exp),
  inExpo: Easing.in(Easing.exp),
  outQuad: Easing.out(Easing.quad),
  inQuad: Easing.in(Easing.quad),
  inOutQuad: Easing.inOut(Easing.quad),
  outBack: Easing.out(Easing.back(1.4)),
  outBackSoft: Easing.out(Easing.back(1.1)),
};

/** 0 before a, 1 after b, eased in between (kit `prog`). */
export const prog = (t: number, a: number, b: number, easing: (x: number) => number = ease.linear) =>
  b <= a ? (t >= a ? 1 : 0) : interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

/** a damped spring evaluated analytically (deterministic, no state) — 0 → 1 with overshoot */
export const springAt = (t: number, start: number, { damping = 14, stiffness = 160, mass = 1 } = {}) => {
  const x = t - start;
  if (x <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * x) * (Math.cos(wd * x) + ((zeta * w0) / wd) * Math.sin(wd * x));
  }
  return 1 - Math.exp(-w0 * x) * (1 + w0 * x);
};

/** enter-from-blur state at time t (k = 0..1 entering) */
export const blurIn = (k: number, { blur = 18, scale = 1.06, y = 0 } = {}) => ({
  opacity: k,
  filter: k >= 1 ? undefined : `blur(${(1 - k) * blur}px)`,
  transform: `translateY(${(1 - k) * y}px) scale(${lerp(scale, 1, k)})`,
});

/** exit-to-blur (k = 0..1 leaving); dx drifts toward the reading end (left in RTL) */
export const blurOut = (k: number, { blur = 16, dx = -40 } = {}) => ({
  opacity: 1 - k,
  filter: k <= 0 ? undefined : `blur(${k * blur}px)`,
  transform: `translateX(${k * dx}px)`,
});

/** blink with a period, from time (no CSS animation) */
export const blink = (t: number, period = 1) => (t % period) / period < 0.5;
