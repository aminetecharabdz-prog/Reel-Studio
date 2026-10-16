import type { FC } from 'react';
import type { z } from 'zod';
import type { StyleId, StyleMeta } from '@/styles/catalog';
import type { Timing, TimingIndex } from './timing';

export const ASPECTS = ['9:16', '4:5', '1:1', '16:9'] as const;
export type Aspect = (typeof ASPECTS)[number];
export const DIMS: Record<Aspect, { w: number; h: number }> = {
  '9:16': { w: 1080, h: 1920 },
  '4:5': { w: 1080, h: 1350 },
  '1:1': { w: 1080, h: 1080 },
  '16:9': { w: 1920, h: 1080 },
};

export type SfxName = 'tick' | 'click' | 'type' | 'pop' | 'blip' | 'hit' | 'impact' | 'whoosh' | 'swish' | 'riser' | 'swell' | 'shimmer' | 'glitch' | 'drop' | 'pen';
/** a sound effect whose PEAK lands at `at` seconds (pre-rolled by the file's peak offset) */
export type SfxEvent = { name: SfxName; at: number; vol?: number };

export type ProductInfo = {
  name: string;
  price: string;
  oldPrice: string;
  offer: string;
  delivery58: boolean;
  cod: boolean;
  phone: string;
  whatsapp: string;
  /** asset ids of product photos (resolved through VideoInput.assets) */
  photos: string[];
};

export type BrandInfo = {
  name: string;
  logo: string | null;
  colors: string[];
  handle: string;
  phone: string;
  endLine: string;
};

/** Everything one video needs. Serialisable (goes into the Player, the exporter, and the project file). */
export type VideoInput = {
  styleId: StyleId;
  plan: unknown;
  timing: Timing;
  aspect: Aspect;
  /** id → URL for user media (photos, voice, talking-head video) */
  assets: Record<string, string>;
  audio: {
    voice: string | null;
    music: string | null;
    musicVolume: number;
    ducking: boolean;
    sfx: boolean;
    sfxIntensity: number;
  };
  captions: null | { size: 's' | 'm' | 'l'; position: 'top' | 'middle' | 'bottom'; keywordColor: string };
  brand: BrandInfo | null;
  endCard: boolean;
  product: ProductInfo | null;
  digits: 'western' | 'eastern';
  /** overrides the style's accent within its palette */
  accent: string | null;
  /** talking-head mode: the user's video (asset id) and the layout per scene */
  talking: null | { video: string; cuts: Array<{ from: number; to: number }> };
};

/** What a style component receives through context. */
export type VideoCtx = {
  input: VideoInput;
  T: TimingIndex;
  W: number;
  H: number;
  /** type/size unit: min(W, H) / 1080 */
  u: number;
  portrait: boolean;
  fps: number;
  /** total frames (voice/script + tail + end card) */
  durationInFrames: number;
  /** seconds where the end card starts (or the video end) */
  contentEnd: number;
  asset: (id: string | undefined | null) => string | null;
  num: (s: string | number) => string;
};

export type PlanInput = {
  timing: Timing;
  goal: 'ad' | 'explainer' | 'story' | 'numbers' | 'talking' | 'free';
  aspect: Aspect;
  topic: string;
  product: ProductInfo | null;
  brandName: string;
  /** a seed so "regenerate" gives a different but deterministic plan */
  seed: number;
};

export type DirectorSpec = {
  /** style bible + vocabulary + rules, for Claude */
  system: string;
  /** JSON schema of the plan (tool input schema) */
  toolSchema: Record<string, unknown>;
};

export type StyleModule<P = unknown> = {
  meta: StyleMeta;
  schema: z.ZodType<P>;
  Video: FC<{ plan: P }>;
  /** fonts the style needs, loaded before the first frame */
  fonts: string[];
  /** seconds the end card / outro needs after the last word */
  tailSeconds: number;
  /** sound design for a plan */
  sfx: (plan: P, ctx: VideoCtx) => SfxEvent[];
  /** the no-key planner: a good video from the words alone */
  localPlan: (input: PlanInput) => P;
  director: DirectorSpec;
  /** repairs a parsed plan against the timing (unknown word ids, ordering, read-time) */
  sanitize: (plan: P, T: TimingIndex) => { plan: P; issues: string[] };
  /** beats shown full screen over the speaker in talking-head mode */
  cutaways?: string[];
  /** scene list for the editor: first word + label + editable texts */
  scenes: (plan: P) => Array<{ at: string; beat: string; label: string; texts: Array<{ path: string; label: string; value: string }> }>;
};
