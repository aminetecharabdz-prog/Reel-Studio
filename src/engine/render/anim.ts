import { Easing, spring } from 'remotion';

export type Feel = 'snappy' | 'smooth' | 'bouncy' | 'cinematic';
const EASE: Record<Feel, (t: number) => number> = {
  snappy: Easing.bezier(0.16, 1, 0.3, 1),
  smooth: Easing.bezier(0.45, 0, 0.2, 1),
  bouncy: Easing.bezier(0.34, 1.56, 0.64, 1),
  cinematic: Easing.bezier(0.7, 0, 0.2, 1),
};
const DUR: Record<Feel, number> = { snappy: 11, smooth: 16, bouncy: 15, cinematic: 22 };

/** entrance progress 0→1 (may overshoot for bouncy) */
export const enter = (frame: number, start: number, feel: Feel, fps: number, dur?: number) => {
  if (frame < start) return 0;
  const d = Math.round(((dur ?? DUR[feel]) * fps) / 30);
  if (feel === 'bouncy') return spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 160, mass: 0.6 }, durationInFrames: d * 1.6 });
  return EASE[feel](Math.min(1, (frame - start) / Math.max(1, d)));
};
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const exitP = (frame: number, out: number | null, fps: number, dur = 7) => (out === null ? 1 : clamp01(1 - (frame - out) / Math.max(1, Math.round((dur * fps) / 30))));
export const popSpring = (frame: number, start: number, fps: number) => (frame < start ? 0 : spring({ frame: frame - start, fps, config: { damping: 9, stiffness: 180, mass: 0.55 } }));
