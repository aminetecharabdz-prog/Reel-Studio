import { buildCtx } from '@/engine/Composition';
import type { Timing } from '@/engine/timing';
import type { Aspect, ProductInfo, VideoInput } from '@/engine/types';
import type { StyleId } from '@/styles/catalog';

/** A hand-authored demo project for a style (gallery previews, style pages, the quality gate). */
export type Demo = {
  id: string;
  styleId: StyleId;
  kind: 'ad' | 'content' | 'talking';
  titleAr: string;
  script: string;
  product: ProductInfo | null;
  build: () => { timing: Timing; plan: unknown };
};

/** a ready-to-play VideoInput for a demo (no voice, music off, SFX on) */
export const demoInput = (d: Demo, aspect: Aspect = '9:16', over: Partial<VideoInput> = {}): VideoInput => {
  const { timing, plan } = d.build();
  return {
    styleId: d.styleId,
    plan,
    timing,
    aspect,
    assets: {},
    audio: { voice: null, music: null, musicVolume: 0.3, ducking: true, sfx: true, sfxIntensity: 0.7 },
    captions: null,
    brand: null,
    endCard: false,
    product: d.product,
    digits: 'western',
    accent: null,
    talking: null,
    ...over,
  };
};

export const demoDuration = (input: VideoInput) => buildCtx(input).durationInFrames;
