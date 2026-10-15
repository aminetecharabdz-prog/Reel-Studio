import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'hex colour like #12abef');

export const FontRefSchema = z.object({
  family: z.string().min(1), // id from the font catalog (src/lib/design/fonts.ts) or an uploaded font family
  weight: z.number().int().min(100).max(900),
});
export type FontRef = z.infer<typeof FontRefSchema>;

export const EASINGS = ['snappy', 'smooth', 'bouncy', 'mechanical', 'elastic'] as const;
export const LAYOUT_GRAMMARS = ['centered', 'asymmetric', 'editorial-grid', 'stacked-cards', 'full-bleed', 'split'] as const;
export const BACKGROUND_KINDS = ['solid', 'gradient', 'mesh', 'grain', 'pattern', 'photo-blur', '3d-room'] as const;
export const TRANSITIONS = ['cut', 'fade', 'push', 'slide', 'wipe', 'zoom', 'iris', 'flash', 'shutter', 'blur'] as const;
export type TransitionId = (typeof TRANSITIONS)[number];

export const DesignDNASchema = z.object({
  mood: z.string().min(1),
  palette: z.object({
    bg: z.array(hex).min(1).max(4),
    surface: hex,
    primary: hex,
    accent: hex,
    text: hex,
    textOnAccent: hex,
  }),
  typography: z.object({
    display: FontRefSchema,
    body: FontRefSchema,
    captions: FontRefSchema,
    latin: z.string().optional(), // optional Latin display family paired in front of the Arabic one
    scale: z.number().min(0.7).max(1.4),
    weightContrast: z.enum(['low', 'mid', 'high']),
  }),
  layoutGrammar: z.enum(LAYOUT_GRAMMARS),
  motionLanguage: z.object({
    easing: z.enum(EASINGS),
    baseDurationFrames: z.number().int().min(6).max(30),
    overshoot: z.number().min(0).max(0.4),
    stagger: z.number().int().min(0).max(8),
    transitionFamily: z.array(z.enum(TRANSITIONS)).min(1).max(3),
  }),
  background: z.object({
    kind: z.enum(BACKGROUND_KINDS),
    params: z.record(z.string(), z.unknown()).default({}),
  }),
  illustrationStyle: z.string().min(1),
  iconSet: z.enum(['ph', 'tabler', 'solar', 'fluent-emoji-flat']),
  texture: z.object({
    grain: z.number().min(0).max(1),
    shadows: z.enum(['none', 'soft', 'hard', 'long']),
    corners: z.number().min(0).max(80),
  }),
  sfxPalette: z.enum(['soft-ui', 'punchy', 'cinematic', 'playful', 'mechanical']),
  seed: z.number().int().nonnegative(),
});
export type DesignDNA = z.infer<typeof DesignDNASchema>;
