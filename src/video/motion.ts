import { Easing, interpolate, spring } from 'remotion';
import type { DesignDNA } from '@/lib/schema/dna';

const BEZIER: Record<DesignDNA['motionLanguage']['easing'], (t: number) => number> = {
  snappy: Easing.bezier(0.2, 0.9, 0.1, 1),
  smooth: Easing.bezier(0.4, 0, 0.2, 1),
  bouncy: Easing.bezier(0.34, 1.4, 0.64, 1),
  mechanical: (t: number) => Math.round(Easing.bezier(0.7, 0, 0.3, 1)(t) * 8) / 8,
  elastic: Easing.bezier(0.34, 1.7, 0.5, 1),
};

export type Motion = {
  /** 0→1 entrance progress starting at `start` (relative frames). May overshoot >1 for bouncy/elastic. */
  enter: (frame: number, start: number, dur?: number) => number;
  /** clamped 0→1 version (for opacity) */
  enterC: (frame: number, start: number, dur?: number) => number;
  /** 1→0 exit progress ending at `end` */
  exit: (frame: number, end: number, dur?: number) => number;
  /** short pulse 0→1→0 peaking 4 frames after `at` (emphasis on the stressed word) */
  pulse: (frame: number, at: number) => number;
  base: number;
  stagger: number;
  easing: DesignDNA['motionLanguage']['easing'];
};

export const makeMotion = (dna: DesignDNA, fps: number): Motion => {
  const m = dna.motionLanguage;
  const base = Math.round((m.baseDurationFrames * fps) / 30);
  const useSpring = m.easing === 'bouncy' || m.easing === 'elastic';
  const damping = m.easing === 'elastic' ? 7 : 11;
  const enter = (frame: number, start: number, dur = base) => {
    if (frame < start) return 0;
    if (useSpring) return spring({ frame: frame - start, fps, config: { damping, mass: 0.7, stiffness: 140 }, durationInFrames: Math.max(dur * 1.6, 8) });
    return BEZIER[m.easing](Math.min(1, (frame - start) / Math.max(1, dur)));
  };
  return {
    enter,
    enterC: (frame, start, dur) => Math.min(1, Math.max(0, enter(frame, start, dur))),
    exit: (frame, end, dur = base) => interpolate(frame, [end - dur, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) }),
    pulse: (frame, at) => {
      const d = frame - at;
      if (d < 0 || d > 14) return 0;
      return d < 4 ? d / 4 : 1 - (d - 4) / 10;
    },
    base,
    stagger: Math.round((m.stagger * fps) / 30),
    easing: m.easing,
  };
};

/** Typical "rise in" transform for a progress value p (0..1+) */
export const rise = (p: number, dist: number) => ({
  opacity: Math.min(1, Math.max(0, p * 1.4)),
  transform: `translateY(${(1 - p) * dist}px)`,
});
export const pop = (p: number) => ({
  opacity: Math.min(1, Math.max(0, p * 2)),
  transform: `scale(${0.4 + 0.6 * p})`,
});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
