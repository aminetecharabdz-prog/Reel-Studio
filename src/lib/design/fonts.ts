/**
 * Bundled OFL fonts (self-hosted via @fontsource, no network needed). Arabic fonts include
 * Latin glyphs; Latin-only display fonts are put IN FRONT of the Arabic family in the CSS
 * stack so Latin runs use them and Arabic glyphs fall back to the Arabic face.
 */
export type FontDef = {
  id: string;
  family: string; // CSS family name
  script: 'arabic' | 'latin';
  weights: number[];
  tags: string[]; // personality, used by the art director
  load: (weight: number) => Promise<unknown>;
};

const W = (ws: number[], imp: Record<number, () => Promise<unknown>>) => (w: number) => {
  const best = ws.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a), ws[0]!);
  return (imp[best] ?? imp[ws[0]!]!)();
};

export const FONTS: FontDef[] = [
  { id: 'cairo', family: 'Cairo', script: 'arabic', weights: [400, 600, 700, 800, 900], tags: ['modern', 'clean', 'bold', 'versatile', 'tech'],
    load: W([400, 600, 700, 800, 900], { 400: () => import('@fontsource/cairo/400.css'), 600: () => import('@fontsource/cairo/600.css'), 700: () => import('@fontsource/cairo/700.css'), 800: () => import('@fontsource/cairo/800.css'), 900: () => import('@fontsource/cairo/900.css') }) },
  { id: 'tajawal', family: 'Tajawal', script: 'arabic', weights: [400, 500, 700, 800, 900], tags: ['clean', 'friendly', 'light', 'medical', 'calm'],
    load: W([400, 500, 700, 800, 900], { 400: () => import('@fontsource/tajawal/400.css'), 500: () => import('@fontsource/tajawal/500.css'), 700: () => import('@fontsource/tajawal/700.css'), 800: () => import('@fontsource/tajawal/800.css'), 900: () => import('@fontsource/tajawal/900.css') }) },
  { id: 'alexandria', family: 'Alexandria', script: 'arabic', weights: [400, 600, 700, 800, 900], tags: ['geometric', 'modern', 'premium', 'tech', 'bold'],
    load: W([400, 600, 700, 800, 900], { 400: () => import('@fontsource/alexandria/400.css'), 600: () => import('@fontsource/alexandria/600.css'), 700: () => import('@fontsource/alexandria/700.css'), 800: () => import('@fontsource/alexandria/800.css'), 900: () => import('@fontsource/alexandria/900.css') }) },
  { id: 'readex', family: 'Readex Pro', script: 'arabic', weights: [400, 500, 600, 700], tags: ['readable', 'friendly', 'calm', 'education', 'medical'],
    load: W([400, 500, 600, 700], { 400: () => import('@fontsource/readex-pro/400.css'), 500: () => import('@fontsource/readex-pro/500.css'), 600: () => import('@fontsource/readex-pro/600.css'), 700: () => import('@fontsource/readex-pro/700.css') }) },
  { id: 'changa', family: 'Changa', script: 'arabic', weights: [400, 600, 700, 800], tags: ['condensed', 'sport', 'energetic', 'street', 'tech', 'mechanical'],
    load: W([400, 600, 700, 800], { 400: () => import('@fontsource/changa/400.css'), 600: () => import('@fontsource/changa/600.css'), 700: () => import('@fontsource/changa/700.css'), 800: () => import('@fontsource/changa/800.css') }) },
  { id: 'lalezar', family: 'Lalezar', script: 'arabic', weights: [400], tags: ['display', 'loud', 'ad', 'street', 'playful', 'bold'],
    load: W([400], { 400: () => import('@fontsource/lalezar/400.css') }) },
  { id: 'el-messiri', family: 'El Messiri', script: 'arabic', weights: [400, 600, 700], tags: ['elegant', 'luxury', 'warm', 'heritage', 'food'],
    load: W([400, 600, 700], { 400: () => import('@fontsource/el-messiri/400.css'), 600: () => import('@fontsource/el-messiri/600.css'), 700: () => import('@fontsource/el-messiri/700.css') }) },
  { id: 'reem-kufi', family: 'Reem Kufi', script: 'arabic', weights: [400, 500, 600, 700], tags: ['geometric', 'kufi', 'heritage', 'premium', 'editorial'],
    load: W([400, 500, 600, 700], { 400: () => import('@fontsource/reem-kufi/400.css'), 500: () => import('@fontsource/reem-kufi/500.css'), 600: () => import('@fontsource/reem-kufi/600.css'), 700: () => import('@fontsource/reem-kufi/700.css') }) },
  { id: 'baloo', family: 'Baloo Bhaijaan 2', script: 'arabic', weights: [400, 600, 700, 800], tags: ['rounded', 'playful', 'kids', 'friendly', 'food'],
    load: W([400, 600, 700, 800], { 400: () => import('@fontsource/baloo-bhaijaan-2/400.css'), 600: () => import('@fontsource/baloo-bhaijaan-2/600.css'), 700: () => import('@fontsource/baloo-bhaijaan-2/700.css'), 800: () => import('@fontsource/baloo-bhaijaan-2/800.css') }) },
  { id: 'noto-kufi', family: 'Noto Kufi Arabic', script: 'arabic', weights: [400, 600, 700, 800, 900], tags: ['neutral', 'corporate', 'clean', 'tech', 'news'],
    load: W([400, 600, 700, 800, 900], { 400: () => import('@fontsource/noto-kufi-arabic/400.css'), 600: () => import('@fontsource/noto-kufi-arabic/600.css'), 700: () => import('@fontsource/noto-kufi-arabic/700.css'), 800: () => import('@fontsource/noto-kufi-arabic/800.css'), 900: () => import('@fontsource/noto-kufi-arabic/900.css') }) },
  { id: 'ibm-plex', family: 'IBM Plex Sans Arabic', script: 'arabic', weights: [400, 500, 600, 700], tags: ['corporate', 'tech', 'readable', 'editorial', 'news'],
    load: W([400, 500, 600, 700], { 400: () => import('@fontsource/ibm-plex-sans-arabic/400.css'), 500: () => import('@fontsource/ibm-plex-sans-arabic/500.css'), 600: () => import('@fontsource/ibm-plex-sans-arabic/600.css'), 700: () => import('@fontsource/ibm-plex-sans-arabic/700.css') }) },
  { id: 'mada', family: 'Mada', script: 'arabic', weights: [400, 600, 700, 900], tags: ['clean', 'modern', 'minimal', 'medical'],
    load: W([400, 600, 700, 900], { 400: () => import('@fontsource/mada/400.css'), 600: () => import('@fontsource/mada/600.css'), 700: () => import('@fontsource/mada/700.css'), 900: () => import('@fontsource/mada/900.css') }) },
  { id: 'lemonada', family: 'Lemonada', script: 'arabic', weights: [400, 600, 700], tags: ['playful', 'rounded', 'fun', 'food', 'kids'],
    load: W([400, 600, 700], { 400: () => import('@fontsource/lemonada/400.css'), 600: () => import('@fontsource/lemonada/600.css'), 700: () => import('@fontsource/lemonada/700.css') }) },
  { id: 'marhey', family: 'Marhey', script: 'arabic', weights: [400, 600, 700], tags: ['handwritten', 'playful', 'warm', 'casual'],
    load: W([400, 600, 700], { 400: () => import('@fontsource/marhey/400.css'), 600: () => import('@fontsource/marhey/600.css'), 700: () => import('@fontsource/marhey/700.css') }) },
  { id: 'rakkas', family: 'Rakkas', script: 'arabic', weights: [400], tags: ['display', 'retro', 'warm', 'heritage', 'loud'],
    load: W([400], { 400: () => import('@fontsource/rakkas/400.css') }) },
  { id: 'aref-ruqaa', family: 'Aref Ruqaa', script: 'arabic', weights: [400, 700], tags: ['calligraphy', 'heritage', 'elegant', 'luxury'],
    load: W([400, 700], { 400: () => import('@fontsource/aref-ruqaa/400.css'), 700: () => import('@fontsource/aref-ruqaa/700.css') }) },
  // Latin display partners
  { id: 'unbounded', family: 'Unbounded', script: 'latin', weights: [500, 700, 900], tags: ['tech', 'bold', 'street', 'energetic'],
    load: W([500, 700, 900], { 500: () => import('@fontsource/unbounded/500.css'), 700: () => import('@fontsource/unbounded/700.css'), 900: () => import('@fontsource/unbounded/900.css') }) },
  { id: 'space-grotesk', family: 'Space Grotesk', script: 'latin', weights: [500, 700], tags: ['tech', 'mechanical', 'modern'],
    load: W([500, 700], { 500: () => import('@fontsource/space-grotesk/500.css'), 700: () => import('@fontsource/space-grotesk/700.css') }) },
  { id: 'fraunces', family: 'Fraunces', script: 'latin', weights: [600, 800], tags: ['editorial', 'warm', 'luxury', 'food'],
    load: W([600, 800], { 600: () => import('@fontsource/fraunces/600.css'), 800: () => import('@fontsource/fraunces/800.css') }) },
  { id: 'bricolage', family: 'Bricolage Grotesque', script: 'latin', weights: [600, 800], tags: ['playful', 'modern', 'friendly'],
    load: W([600, 800], { 600: () => import('@fontsource/bricolage-grotesque/600.css'), 800: () => import('@fontsource/bricolage-grotesque/800.css') }) },
  { id: 'syne', family: 'Syne', script: 'latin', weights: [700, 800], tags: ['editorial', 'premium', 'fashion'],
    load: W([700, 800], { 700: () => import('@fontsource/syne/700.css'), 800: () => import('@fontsource/syne/800.css') }) },
  { id: 'dm-serif', family: 'DM Serif Display', script: 'latin', weights: [400], tags: ['luxury', 'elegant', 'editorial'],
    load: W([400], { 400: () => import('@fontsource/dm-serif-display/400.css') }) },
  { id: 'archivo-black', family: 'Archivo Black', script: 'latin', weights: [400], tags: ['loud', 'ad', 'sport', 'bold'],
    load: W([400], { 400: () => import('@fontsource/archivo-black/400.css') }) },
];

export const FONT_BY_ID = new Map(FONTS.map((f) => [f.id, f]));
export const ARABIC_FONTS = FONTS.filter((f) => f.script === 'arabic');
export const LATIN_FONTS = FONTS.filter((f) => f.script === 'latin');

/** User-uploaded fonts registered at runtime (FontFace API). */
const uploaded = new Map<string, string>();
export const registerUploadedFont = async (id: string, family: string, data: ArrayBuffer) => {
  const face = new FontFace(family, data);
  await face.load();
  document.fonts.add(face);
  uploaded.set(id, family);
};

export const familyOf = (id: string | undefined): string => {
  if (!id) return 'Cairo';
  return FONT_BY_ID.get(id)?.family ?? uploaded.get(id) ?? id;
};

/** CSS font-family stack: optional Latin partner first, then the Arabic face, then safe fallbacks. */
export const fontStack = (arabicId: string | undefined, latinId?: string) => {
  const parts = [] as string[];
  if (latinId) parts.push(`"${familyOf(latinId)}"`);
  parts.push(`"${familyOf(arabicId)}"`);
  parts.push('"Cairo"', 'sans-serif');
  return parts.join(', ');
};

const SAMPLE = 'نبرة أبجد هوز Nabra 0123456789%';

/** Load the given fonts and wait until the browser can use them (always before render). */
/** Loader for uploaded fonts ("upload:<assetId>"), set by the app (fonts live in IndexedDB). */
let uploadLoader: ((assetId: string) => Promise<ArrayBuffer | null>) | null = null;
export const setUploadedFontLoader = (fn: (assetId: string) => Promise<ArrayBuffer | null>) => {
  uploadLoader = fn;
};

export const ensureFonts = async (refs: Array<{ id: string | undefined; weight: number }>) => {
  const jobs = refs.map(async ({ id, weight }) => {
    if (id?.startsWith('upload:') && !uploaded.has(id) && uploadLoader) {
      const data = await uploadLoader(id.slice(7));
      if (data) await registerUploadedFont(id, `NabraUpload-${id.slice(7)}`, data);
    }
    const def = id ? FONT_BY_ID.get(id) : undefined;
    if (def) await def.load(weight);
    const fam = familyOf(id);
    if (typeof document !== 'undefined') await document.fonts.load(`${weight} 40px "${fam}"`, SAMPLE);
  });
  await Promise.all(jobs);
  if (typeof document !== 'undefined') await document.fonts.ready;
};
