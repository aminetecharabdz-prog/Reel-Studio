/**
 * Motion scene graph — the language the AI director writes. No templates: every scene is a free
 * composition of layers (kinetic text runs, images, shapes, counters, UI elements) on a background,
 * with a camera move and a transition. All timing is anchored to spoken word ids; the compiler turns
 * them into frames (SPEC §6). Coordinates are fractions of the frame (0..1), centre-anchored.
 */
import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const frac = z.number().min(-0.5).max(1.5);

export const MOTION_FONTS = ['display', 'serif', 'body', 'condensed'] as const;
export const EMPHASIS = ['accent', 'big', 'serif', 'outline', 'ghost', 'highlight', 'strike', 'box', 'glow'] as const;
export const TEXT_ANIMS = ['word-rise', 'word-pop', 'word-blur', 'mask-up', 'type', 'slide', 'scale-in', 'stamp', 'fade'] as const;
export const IMAGE_ANIMS = ['pop', 'drop', 'float-in', 'slide-left', 'slide-right', 'zoom-in', 'reveal-up', 'spin-in', 'fade'] as const;
export const IDLES = ['float', 'bob', 'rotate', 'pulse', 'sway', 'none'] as const;
export const SHAPES = ['circle', 'ring', 'rect', 'line', 'arrow', 'underline', 'scribble', 'burst', 'cross', 'check', 'blob', 'bar', 'grid', 'spark'] as const;
export const SHAPE_ANIMS = ['draw', 'pop', 'grow', 'pulse', 'spin', 'fade'] as const;
export const UI_KINDS = ['badge', 'price', 'button', 'notification', 'chat', 'checklist', 'progress', 'rating', 'profile', 'search'] as const;
export const BG_KINDS = ['light', 'dark', 'accent', 'gradient', 'photo', 'image-blur', 'paper', 'spotlight'] as const;
export const CAMERAS = ['none', 'push', 'pull', 'pan-left', 'pan-right', 'drift', 'shake', 'tilt'] as const;
export const MOTION_TRANSITIONS = ['cut', 'flash', 'whip', 'zoom', 'fade', 'slide-up', 'glitch', 'iris', 'blur'] as const;
export const COLOR_ROLES = ['ink', 'inkOnDark', 'accent', 'accent2', 'muted', 'white', 'black'] as const;

export const MWordSchema = z.object({
  t: z.string().min(1).max(40),
  at: z.string().optional(), // word id it lands on (spoken word); omitted = with the previous word
  em: z.enum(EMPHASIS).optional(),
});
export type MWord = z.infer<typeof MWordSchema>;

export const AssetSrcSchema = z.object({
  kind: z.enum(['generate', 'user', 'sticker', 'url']),
  prompt: z.string().max(600).optional(), // generate: what Gemini must draw
  cutout: z.boolean().optional(), // generate: isolate the object (transparent background)
  index: z.number().int().min(0).optional(), // user media index
  name: z.string().max(60).optional(), // sticker name (bundled 3D objects)
  url: z.string().optional(),
  assetId: z.string().optional(), // resolved generated image (filled after generation)
});
export type AssetSrc = z.infer<typeof AssetSrcSchema>;

const base = {
  id: z.string().max(24),
  x: frac.default(0.5),
  y: frac.default(0.5),
  w: z.number().min(0.02).max(1.6).default(0.8),
  rotate: z.number().min(-45).max(45).default(0),
  at: z.string().optional(), // entrance anchored to this word (default: scene start)
  exitAt: z.string().optional(), // leaves when this word starts (default: stays until the scene ends)
};

export const TextLayerSchema = z.object({
  ...base,
  type: z.literal('text'),
  lines: z.array(z.array(MWordSchema).min(1).max(8)).min(1).max(5),
  font: z.enum(MOTION_FONTS).default('display'),
  size: z.enum(['xs', 's', 'm', 'l', 'xl', 'xxl']).default('l'),
  color: z.enum(COLOR_ROLES).default('ink'),
  align: z.enum(['center', 'start', 'end']).default('center'),
  anim: z.enum(TEXT_ANIMS).default('word-rise'),
});
export const ImageLayerSchema = z.object({
  ...base,
  type: z.literal('image'),
  src: AssetSrcSchema,
  h: z.number().min(0.02).max(1.6).optional(),
  anim: z.enum(IMAGE_ANIMS).default('pop'),
  idle: z.enum(IDLES).default('float'),
  shadow: z.boolean().default(true),
  glow: z.enum(COLOR_ROLES).optional(),
  frame: z.enum(['none', 'card', 'circle', 'polaroid', 'phone', 'arch', 'rounded']).default('none'),
  fit: z.enum(['contain', 'cover']).default('contain'),
  depth: z.number().min(0).max(1).default(0.5),
});
export const ShapeLayerSchema = z.object({
  ...base,
  type: z.literal('shape'),
  kind: z.enum(SHAPES),
  h: z.number().min(0.005).max(1.6).optional(),
  color: z.enum(COLOR_ROLES).default('accent'),
  fill: z.boolean().default(false),
  stroke: z.number().min(1).max(40).default(10),
  anim: z.enum(SHAPE_ANIMS).default('draw'),
});
export const CounterLayerSchema = z.object({
  ...base,
  type: z.literal('counter'),
  value: z.number(),
  from: z.number().default(0),
  prefix: z.string().max(8).default(''),
  suffix: z.string().max(12).default(''),
  size: z.enum(['m', 'l', 'xl', 'xxl']).default('xl'),
  color: z.enum(COLOR_ROLES).default('accent'),
  font: z.enum(MOTION_FONTS).default('display'),
});
export const UILayerSchema = z.object({
  ...base,
  type: z.literal('ui'),
  kind: z.enum(UI_KINDS),
  title: z.string().max(60).default(''),
  sub: z.string().max(80).default(''),
  items: z.array(z.object({ t: z.string().max(50), at: z.string().optional(), good: z.boolean().optional() })).max(5).default([]),
  value: z.number().optional(),
  oldValue: z.number().optional(),
  color: z.enum(COLOR_ROLES).default('accent'),
  anim: z.enum(IMAGE_ANIMS).default('pop'),
});

export const LayerSchema = z.discriminatedUnion('type', [TextLayerSchema, ImageLayerSchema, ShapeLayerSchema, CounterLayerSchema, UILayerSchema]);
export type Layer = z.infer<typeof LayerSchema>;
export type TextLayer = z.infer<typeof TextLayerSchema>;
export type ImageLayer = z.infer<typeof ImageLayerSchema>;
export type ShapeLayer = z.infer<typeof ShapeLayerSchema>;
export type CounterLayer = z.infer<typeof CounterLayerSchema>;
export type UILayer = z.infer<typeof UILayerSchema>;

export const MotionSceneSchema = z.object({
  id: z.string().max(24),
  from: z.string(),
  to: z.string(),
  intent: z.string().max(200).default(''), // what the viewer sees and why it matches the words (director's note)
  bg: z.object({
    kind: z.enum(BG_KINDS),
    color: hex.optional(),
    color2: hex.optional(),
    image: AssetSrcSchema.optional(),
    grid: z.boolean().default(false),
    vignette: z.boolean().default(false),
    lightLeak: z.boolean().default(false),
    glow: z.enum(COLOR_ROLES).optional(),
  }),
  camera: z.object({ move: z.enum(CAMERAS).default('push'), amount: z.number().min(0).max(1).default(0.4) }).default({ move: 'push', amount: 0.4 }),
  transition: z.enum(MOTION_TRANSITIONS).default('cut'),
  speaker: z.enum(['full', 'top', 'bottom', 'pip', 'hidden']).optional(),
  layers: z.array(LayerSchema).max(10),
});
export type MotionScene = z.infer<typeof MotionSceneSchema>;

export const MotionStyleSchema = z.object({
  name: z.string().max(60),
  palette: z.object({ light: hex, dark: hex, ink: hex, inkOnDark: hex, accent: hex, accent2: hex, muted: hex }),
  fonts: z.object({ display: z.string(), serif: z.string(), body: z.string(), condensed: z.string() }),
  grain: z.number().min(0).max(1).default(0.25),
  motion: z.enum(['snappy', 'smooth', 'bouncy', 'cinematic']).default('snappy'),
  music: z.string().default('auto'),
  sfx: z.enum(['soft-ui', 'punchy', 'cinematic', 'playful', 'mechanical', 'none']).default('punchy'),
  captions: z.enum(['none', 'boxed', 'clean', 'karaoke']).default('none'),
});
export type MotionStyle = z.infer<typeof MotionStyleSchema>;

export const MotionPlanSchema = z.object({
  version: z.literal(2),
  style: MotionStyleSchema,
  scenes: z.array(MotionSceneSchema).min(1).max(40),
  hooks: z.array(z.string().max(120)).max(3).default([]),
  author: z.enum(['claude', 'local', 'fixture']).default('local'),
});
export type MotionPlan = z.infer<typeof MotionPlanSchema>;
