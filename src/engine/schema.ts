/**
 * Motiq scene graph — the language the AI director writes. No templates: every scene is a free
 * composition of layers (kinetic text, images, shapes, counters, UI pieces) on a background, with a
 * camera move and a transition. Timing is anchored to spoken word ids; the compiler converts them to
 * frames. Positions are fractions of the frame (0..1, centre of the layer).
 */
import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const pos = z.number().min(-0.4).max(1.4);

export const WordSchema = z.object({ id: z.string(), text: z.string().min(1), startMs: z.number().min(0), endMs: z.number().min(0), confidence: z.number().min(0).max(1).default(1) });
export type Word = z.infer<typeof WordSchema>;
export const TranscriptSchema = z.object({ words: z.array(WordSchema).min(1), durationMs: z.number().positive(), language: z.string().default('ar'), source: z.string().default('manual') });
export type Transcript = z.infer<typeof TranscriptSchema>;

export const ROLES = ['display', 'serif', 'body', 'impact'] as const;
export const EMPHASIS = ['accent', 'big', 'serif', 'outline', 'ghost', 'highlight', 'strike', 'box', 'glow', 'underline'] as const;
export const TEXT_ANIMS = ['rise', 'pop', 'blur', 'mask', 'type', 'slide', 'zoom', 'stamp', 'fade', 'wave'] as const;
export const IMG_ANIMS = ['pop', 'drop', 'float', 'slide-left', 'slide-right', 'zoom', 'reveal', 'spin', 'fade', 'flip'] as const;
export const IDLES = ['float', 'bob', 'spin', 'pulse', 'sway', 'none'] as const;
export const SHAPES = ['circle', 'ring', 'rect', 'line', 'arrow', 'underline', 'scribble', 'burst', 'cross', 'check', 'blob', 'bar', 'dots', 'spark', 'frame', 'wave', 'arc', 'shard'] as const;
export const SHAPE_ANIMS = ['draw', 'pop', 'grow', 'pulse', 'spin', 'fade'] as const;
export const UI_KINDS = ['badge', 'price', 'button', 'notification', 'chat', 'checklist', 'progress', 'rating', 'profile', 'search', 'timer', 'stat'] as const;
export const BGS = ['solid', 'gradient', 'spotlight', 'paper', 'photo', 'blur-photo', 'split', 'rays', 'noise-dark'] as const;
export const CAMERAS = ['none', 'push', 'pull', 'pan-left', 'pan-right', 'rise', 'drift', 'shake', 'tilt', 'punch'] as const;
export const TRANSITIONS = ['cut', 'flash', 'whip', 'zoom', 'fade', 'slide-up', 'glitch', 'iris', 'blur', 'wipe', 'shutter'] as const;
export const COLORS = ['ink', 'paper', 'accent', 'accent2', 'muted', 'white', 'black'] as const;
export type ColorRole = (typeof COLORS)[number];

export const MWordSchema = z.object({ t: z.string().min(1).max(40), at: z.string().optional(), em: z.enum(EMPHASIS).optional() });
export type MWord = z.infer<typeof MWordSchema>;

export const SrcSchema = z.object({
  kind: z.enum(['generate', 'user', 'sticker', 'library', 'url']),
  prompt: z.string().max(700).optional(),
  cutout: z.boolean().optional(),
  index: z.number().int().min(0).optional(),
  name: z.string().max(60).optional(),
  url: z.string().optional(),
  assetId: z.string().optional(),
});
export type Src = z.infer<typeof SrcSchema>;

const common = {
  id: z.string().max(32),
  x: pos.default(0.5),
  y: pos.default(0.5),
  w: z.number().min(0.02).max(1.8).default(0.8),
  rotate: z.number().min(-180).max(180).default(0),
  at: z.string().optional(),
  exitAt: z.string().optional(),
  opacity: z.number().min(0.05).max(1).default(1),
};

export const TextLayer = z.object({
  ...common,
  type: z.literal('text'),
  lines: z.array(z.array(MWordSchema).min(1).max(8)).min(1).max(6),
  role: z.enum(ROLES).default('display'),
  size: z.enum(['xs', 's', 'm', 'l', 'xl', 'xxl', 'mega']).default('l'),
  color: z.enum(COLORS).default('ink'),
  align: z.enum(['center', 'start', 'end']).default('center'),
  anim: z.enum(TEXT_ANIMS).default('rise'),
  tracking: z.number().min(-0.08).max(0.4).default(0),
  /** typographic hierarchy: lines without an emphasised word render at half size (small lead-in, huge key word) */
  hier: z.boolean().default(true),
});
export const ImageLayer = z.object({
  ...common,
  type: z.literal('image'),
  src: SrcSchema,
  h: z.number().min(0.02).max(1.8).optional(),
  anim: z.enum(IMG_ANIMS).default('pop'),
  idle: z.enum(IDLES).default('float'),
  shadow: z.boolean().default(true),
  glow: z.enum(COLORS).optional(),
  frame: z.enum(['none', 'card', 'circle', 'polaroid', 'phone', 'arch', 'rounded', 'tv', 'window']).default('none'),
  fit: z.enum(['contain', 'cover']).default('contain'),
  depth: z.number().min(0).max(1).default(0.5),
  flipX: z.boolean().default(false),
});
export const ShapeLayer = z.object({
  ...common,
  type: z.literal('shape'),
  kind: z.enum(SHAPES),
  h: z.number().min(0.004).max(1.8).optional(),
  color: z.enum(COLORS).default('accent'),
  fill: z.boolean().default(false),
  stroke: z.number().min(1).max(60).default(10),
  anim: z.enum(SHAPE_ANIMS).default('draw'),
});
export const CounterLayer = z.object({
  ...common,
  type: z.literal('counter'),
  value: z.number(),
  from: z.number().default(0),
  prefix: z.string().max(8).default(''),
  suffix: z.string().max(14).default(''),
  decimals: z.number().int().min(0).max(2).default(0),
  size: z.enum(['l', 'xl', 'xxl', 'mega']).default('xxl'),
  color: z.enum(COLORS).default('accent'),
  role: z.enum(ROLES).default('impact'),
});
export const UILayer = z.object({
  ...common,
  type: z.literal('ui'),
  kind: z.enum(UI_KINDS),
  title: z.string().max(70).default(''),
  sub: z.string().max(90).default(''),
  items: z.array(z.object({ t: z.string().max(60), at: z.string().optional(), good: z.boolean().optional() })).max(5).default([]),
  value: z.number().optional(),
  oldValue: z.number().optional(),
  color: z.enum(COLORS).default('accent'),
  anim: z.enum(IMG_ANIMS).default('pop'),
});

export const LayerSchema = z.discriminatedUnion('type', [TextLayer, ImageLayer, ShapeLayer, CounterLayer, UILayer]);
export type Layer = z.infer<typeof LayerSchema>;
export type TextL = z.infer<typeof TextLayer>;
export type ImageL = z.infer<typeof ImageLayer>;
export type ShapeL = z.infer<typeof ShapeLayer>;
export type CounterL = z.infer<typeof CounterLayer>;
export type UIL = z.infer<typeof UILayer>;

export const SceneSchema = z.object({
  id: z.string().max(32),
  from: z.string(),
  to: z.string(),
  intent: z.string().max(240).default(''),
  bg: z.object({
    kind: z.enum(BGS),
    tone: z.enum(['light', 'dark', 'accent']).default('dark'),
    color: hex.optional(),
    color2: hex.optional(),
    image: SrcSchema.optional(),
    grid: z.boolean().default(false),
    vignette: z.boolean().default(true),
    leak: z.boolean().default(false),
    glow: z.enum(COLORS).optional(),
    grain: z.number().min(0).max(1).optional(),
  }),
  camera: z.object({ move: z.enum(CAMERAS).default('push'), amount: z.number().min(0).max(1).default(0.35) }).default({ move: 'push', amount: 0.35 }),
  transition: z.enum(TRANSITIONS).default('cut'),
  speaker: z.enum(['full', 'top', 'bottom', 'pip', 'hidden']).optional(),
  layers: z.array(LayerSchema).max(12),
});
export type Scene = z.infer<typeof SceneSchema>;

export const FontPair = z.object({ ar: z.string(), lat: z.string(), italic: z.boolean().default(false), weight: z.number().int().min(300).max(900).default(800) });
export const StyleSchema = z.object({
  name: z.string().max(60),
  palette: z.object({ ink: hex, paper: hex, accent: hex, accent2: hex, muted: hex, dark: hex }),
  fonts: z.object({ display: FontPair, serif: FontPair, body: FontPair, impact: FontPair }),
  grain: z.number().min(0).max(1).default(0.22),
  motion: z.enum(['snappy', 'smooth', 'bouncy', 'cinematic']).default('snappy'),
  music: z.string().default('auto'),
  sfx: z.enum(['soft', 'punchy', 'cinematic', 'none']).default('punchy'),
  captions: z.enum(['none', 'boxed', 'clean', 'pop']).default('none'),
});
export type Style = z.infer<typeof StyleSchema>;

export const PlanSchema = z.object({
  v: z.literal(1),
  style: StyleSchema,
  scenes: z.array(SceneSchema).min(1).max(48),
  hooks: z.array(z.string().max(140)).max(3).default([]),
  author: z.enum(['claude', 'local', 'fixture']).default('local'),
});
export type Plan = z.infer<typeof PlanSchema>;
