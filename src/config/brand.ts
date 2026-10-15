/**
 * The ONE place to rename the product. Change these values and the whole UI,
 * page title, manifest and logo wordmark follow (see scripts/postbuild.mjs for
 * the static HTML title/manifest).
 */
export const BRAND = {
  nameAr: 'نبرة',
  nameLatin: 'Nabra',
  taglineAr: 'صوتك يصير ريلز بالموشن جرافيك',
  taglineLatin: 'Your voice, in motion.',
  // Product colours (UI only — videos get their own per-video Design DNA).
  colors: {
    night: '#170E21',
    surface: '#221630',
    raised: '#2D1F3D',
    line: '#3D2D50',
    ink: '#F7F0FA',
    muted: '#BBAACB',
    rose: '#FF3E7A',
    mint: '#3CE3B4',
    lilac: '#B49CFF',
  },
} as const;

export type Brand = typeof BRAND;
