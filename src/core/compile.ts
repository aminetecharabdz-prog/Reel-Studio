import type { Transcript } from '@/engine/schema';
import { getStyle } from '@/styles/registry';
import { Timeline } from './timeline';
import { DIMS, type Aspect, type Compiled, type StyleId } from './types';

export const FPS = 30;

export type CompileInput = {
  styleId: StyleId;
  plan: unknown;
  transcript: Transcript;
  aspect: Aspect;
  voice?: string | null;
  music?: string | null;
  musicVolume?: number;
  sfx?: boolean;
  assets?: Record<string, string>;
  digits?: 'western' | 'eastern';
};

/** plan + transcript → everything the composition needs (frames, size, audio). Throws on an invalid plan. */
export const compileVideo = (i: CompileInput): Compiled => {
  const style = getStyle(i.styleId);
  const plan = style.schema.parse(i.plan);
  const tailFrames = Math.round(style.tailSeconds * FPS);
  const tl = new Timeline(i.transcript, FPS, tailFrames);
  const { w, h } = DIMS[i.aspect];
  return {
    styleId: i.styleId,
    plan,
    transcript: i.transcript,
    fps: FPS,
    width: w,
    height: h,
    aspect: i.aspect,
    durationInFrames: tl.durationInFrames,
    tailFrames,
    voice: i.voice ?? null,
    music: i.music ?? null,
    musicVolume: i.musicVolume ?? 0.5,
    sfx: i.sfx ?? true,
    assets: i.assets ?? {},
    digits: i.digits ?? 'western',
  };
};
