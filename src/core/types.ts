/** Rassam core types shared by every style engine. */
import { z } from 'zod';
import type { Transcript } from '@/engine/schema';

export const ASPECTS = ['9:16', '16:9', '1:1'] as const;
export type Aspect = (typeof ASPECTS)[number];
export const DIMS: Record<Aspect, { w: number; h: number }> = {
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
  '1:1': { w: 1080, h: 1080 },
};

export const STYLE_IDS = ['product', 'infographic', 'doodle', 'whiteboard', 'plotter', 'stickman', 'chalkboard', 'isometric', 'fake3d', 'map-journey'] as const;
export type StyleId = (typeof STYLE_IDS)[number];

/** A word id from the transcript ("w12"). Every "when" in a plan is one of these, never seconds. */
export const WordId = z.string().regex(/^w\d+$/);

/** Everything a style engine needs to render one video (output of the compiler). */
export type Compiled = {
  styleId: StyleId;
  plan: unknown;
  transcript: Transcript;
  fps: number;
  width: number;
  height: number;
  aspect: Aspect;
  durationInFrames: number;
  /** extra frames after the last word (end card hold) */
  tailFrames: number;
  voice: string | null;
  music: string | null;
  musicVolume: number;
  sfx: boolean;
  /** asset id → object URL (user photos) */
  assets: Record<string, string>;
  digits: 'western' | 'eastern';
};

export type PlanInput = {
  transcript: Transcript;
  topic: string;
  aspect: Aspect;
  /** product ads: user product photo asset ids + facts */
  product?: { name?: string; price?: string; offer?: string; photos?: string[] };
  brand?: string;
  cta?: string;
};
