import { BRAND } from './config';

/**
 * The Rassam mark: ONE continuous hand-drawn stroke. It rises as the left edge of a play triangle, runs to the tip,
 * hooks back like the head of the letter «ر» and sweeps down in the letter's tail — closing the triangle — and ends
 * at the pen tip, where the orange spark glows. viewBox 0 0 64 64.
 */
export const MARK_PATH = 'M18 42 L18 12 L47 29 C 42 26.5, 37.5 29.5, 38 35 C 38.5 44, 31 51, 17 54';
/** where the stroke ends: the spark */
export const MARK_TIP = { x: 17, y: 54 } as const;
/** approximate length of MARK_PATH in viewBox units (for dash animations) */
export const MARK_LENGTH = 132;

type LogoOpts = { size?: number; tile?: boolean; stroke?: string; strokeWidth?: number };

/** Static SVG string (favicon, PWA icon, OG). With `tile`, sits on a rounded night tile so it reads at 16 px. */
export const logoSvg = ({ size = 64, tile = false, stroke = BRAND.colors.chalk, strokeWidth }: LogoOpts = {}) => {
  const c = BRAND.colors;
  const sw = strokeWidth ?? (tile ? 6.4 : 5.4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
<defs><radialGradient id="rs-g"><stop offset="0" stop-color="${c.sparkCore}"/><stop offset=".35" stop-color="${c.sparkGlow}"/><stop offset="1" stop-color="${c.spark}" stop-opacity="0"/></radialGradient></defs>
${tile ? `<rect width="64" height="64" rx="15" fill="${c.ink}"/>` : ''}
<path d="${MARK_PATH}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="${MARK_TIP.x}" cy="${MARK_TIP.y}" r="${tile ? 6.5 : 7}" fill="url(#rs-g)"/>
<circle cx="${MARK_TIP.x}" cy="${MARK_TIP.y}" r="${tile ? 3.4 : 2.2}" fill="${tile ? c.spark : c.sparkCore}"/>
</svg>`;
};
