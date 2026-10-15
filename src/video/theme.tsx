import { createContext, useContext } from 'react';
import type { DesignDNA } from '@/lib/schema/dna';
import type { CompiledReel } from '@/lib/timing/types';
import { fontStack } from '@/lib/design/fonts';
import { mix, textOn, withAlpha } from '@/lib/color/contrast';
import type { DigitStyle } from '@/lib/text/digits';

export type Box = { x: number; y: number; w: number; h: number };

export type Theme = {
  dna: DesignDNA;
  W: number;
  H: number;
  u: number; // 1 unit = 1px at 1080 short side
  fps: number;
  digits: DigitStyle;
  stage: Box; // where scene graphics live (safe zones + caption band excluded)
  captionBand: Box | null;
  fonts: { display: string; body: string; captions: string; displayWeight: number; bodyWeight: number; captionWeight: number };
  c: {
    bg: string[];
    surface: string;
    primary: string;
    accent: string;
    text: string;
    textOnAccent: string;
    textOnPrimary: string;
    muted: string;
    line: string;
    good: string;
    bad: string;
  };
  radius: (k?: number) => number;
  shadow: (level?: number) => string;
  isDark: boolean;
  orientation: 'portrait' | 'square' | 'landscape';
};

const ThemeCtx = createContext<Theme | null>(null);
export const ThemeProvider = ThemeCtx.Provider;
export const useTheme = () => {
  const t = useContext(ThemeCtx);
  if (!t) throw new Error('ThemeProvider missing');
  return t;
};

const SAFE: Record<CompiledReel['safeZone'], { top: number; bottom: number; right: number; left: number }> = {
  none: { top: 0.07, bottom: 0.08, right: 0.07, left: 0.07 },
  instagram: { top: 0.12, bottom: 0.2, right: 0.12, left: 0.07 },
  tiktok: { top: 0.12, bottom: 0.22, right: 0.14, left: 0.07 },
  youtube: { top: 0.11, bottom: 0.2, right: 0.13, left: 0.07 },
};
export const safeInsets = (zone: CompiledReel['safeZone'], W: number, H: number) => {
  const s = SAFE[zone];
  // safe zones only matter for vertical/feed formats; landscape keeps generous symmetric margins
  if (W > H) return { top: 0.08 * H, bottom: 0.1 * H, right: 0.06 * W, left: 0.06 * W };
  return { top: s.top * H, bottom: (H / W < 1.5 ? s.bottom * 0.6 : s.bottom) * H, right: s.right * W, left: s.left * W };
};

export const buildTheme = (reel: Pick<CompiledReel, 'dna' | 'width' | 'height' | 'fps' | 'digits' | 'safeZone' | 'captionSettings'>): Theme => {
  const { dna, width: W, height: H } = reel;
  const u = Math.min(W, H) / 1080;
  const ins = safeInsets(reel.safeZone, W, H);
  const cs = reel.captionSettings;
  const capH = cs.enabled ? cs.sizePx * u * 1.45 * 2 + 30 * u : 0;
  const capCenter = cs.position * H;
  const captionBand = cs.enabled ? { x: ins.left, y: capCenter - capH / 2, w: W - ins.left - ins.right, h: capH } : null;
  let top = ins.top;
  let bottom = H - ins.bottom;
  if (captionBand) {
    if (cs.position >= 0.5) bottom = Math.min(bottom, captionBand.y - 24 * u);
    else top = Math.max(top, captionBand.y + captionBand.h + 24 * u);
  }
  const stage = { x: ins.left, y: top, w: W - ins.left - ins.right, h: Math.max(200 * u, bottom - top) };
  const p = dna.palette;
  const bgSum = p.bg[0]!.slice(1).match(/../g)!.reduce((n, h) => n + parseInt(h, 16), 0);
  const isDark = bgSum < 384;
  const corners = dna.texture.corners;
  const shadowKind = dna.texture.shadows;
  const tw = dna.typography;
  return {
    dna,
    W,
    H,
    u,
    fps: reel.fps,
    digits: reel.digits,
    stage,
    captionBand,
    fonts: {
      display: fontStack(tw.display.family, tw.latin),
      body: fontStack(tw.body.family),
      captions: fontStack(cs.font ?? tw.captions.family),
      displayWeight: tw.display.weight,
      bodyWeight: tw.body.weight,
      captionWeight: cs.weight ?? tw.captions.weight,
    },
    c: {
      bg: p.bg,
      surface: p.surface,
      primary: p.primary,
      accent: p.accent,
      text: p.text,
      textOnAccent: p.textOnAccent,
      textOnPrimary: textOn(p.primary),
      muted: mix(p.text, p.bg[0]!, 0.35),
      line: withAlpha(p.text, 0.16),
      good: isDark ? '#4ADE9B' : '#15803D',
      bad: isDark ? '#FF6B6B' : '#C62828',
    },
    radius: (k = 1) => Math.round(corners * k * u),
    shadow: (level = 1) => {
      const col = isDark ? 'rgba(0,0,0,0.45)' : withAlpha(mix(p.primary, '#000000', 0.6), 0.22);
      switch (shadowKind) {
        case 'none':
          return 'none';
        case 'hard':
          return `${10 * level * u}px ${10 * level * u}px 0px ${isDark ? 'rgba(0,0,0,0.6)' : mix(p.text, p.bg[0]!, 0.1)}`;
        case 'long':
          return `${18 * level * u}px ${24 * level * u}px ${8 * u}px ${col}`;
        default:
          return `0px ${14 * level * u}px ${40 * level * u}px ${col}`;
      }
    },
    isDark,
    orientation: W > H * 1.1 ? 'landscape' : H > W * 1.1 ? 'portrait' : 'square',
  };
};
