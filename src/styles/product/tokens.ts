/**
 * product — "tech launch promo" style tokens. Every value comes from docs/styles/product/STYLE.md
 * (analysis of the Motion Starter Kit reference, 1280×720 → scaled to our 1080-based unit `u`).
 */
export const T = {
  dark: '#05050A',
  dark2: '#0B0A14',
  light: '#F8F7FF',
  text: '#F5F3FF',
  textDark: '#1B1830',
  grey: '#8B88A6',
  greyLight: '#B9B6CF',
  violet: '#6C3BFF',
  violetLight: '#A88BFF',
  blue: '#2F5BFF',
  pink: '#D946EF',
  orange: '#FF6A1A',
  orangeLight: '#FF8A3D',
  font: '"Readex Pro", "IBM Plex Sans Arabic", sans-serif',
  /** entrance: blur 18px → 0, scale 1.06 → 1, 0.40 s easeOutCubic */
  enterS: 0.4,
  /** follower words: 0.28 s, offset 0.08 s */
  followS: 0.28,
  /** giant → line shrink 0.32 s easeInOutCubic */
  shrinkS: 0.32,
  /** exits: blur 14px + 60px side shift, 0.3 s easeInCubic */
  exitS: 0.3,
} as const;

export const ACCENTS = {
  violet: { a: '#A88BFF', b: '#6C3BFF', grad: 'linear-gradient(90deg, #FF8A3D 0%, #D946EF 45%, #8B5CFF 100%)' },
  orange: { a: '#FF8A3D', b: '#FF6A1A', grad: 'linear-gradient(90deg, #FFB25C 0%, #FF6A1A 50%, #D946EF 100%)' },
  blue: { a: '#7EA0FF', b: '#2F5BFF', grad: 'linear-gradient(90deg, #8B5CFF 0%, #2F5BFF 60%, #3FD3FF 100%)' },
  pink: { a: '#F08BFF', b: '#D946EF', grad: 'linear-gradient(90deg, #FF8A3D 0%, #FF4FA3 45%, #D946EF 100%)' },
} as const;
export type AccentId = keyof typeof ACCENTS;

/** hard cuts land just before the scene's first word (STYLE.md §6: "hard cut on a strong word") */
export const CUT_LEAD = 0.1;
