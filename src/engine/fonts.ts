/** Self-hosted OFL fonts (no CDN). The AI picks ids from this catalog per video. */
export type FontDef = { id: string; family: string; script: 'ar' | 'lat'; weights: number[]; italic?: boolean; vibe: string; load: (w: number, it: boolean) => Promise<unknown> };

const L = (map: Record<string, () => Promise<unknown>>, ws: number[], italic = false) => (w: number, it: boolean) => {
  const best = ws.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a), ws[0]!);
  const key = `${best}${it && italic ? 'i' : ''}`;
  return (map[key] ?? map[String(best)] ?? Object.values(map)[0]!)();
};

export const FONTS: FontDef[] = [
  { id: 'alexandria', family: 'Alexandria', script: 'ar', weights: [400, 600, 800, 900], vibe: 'geometric modern bold, premium tech', load: L({ 400: () => import('@fontsource/alexandria/400.css'), 600: () => import('@fontsource/alexandria/600.css'), 800: () => import('@fontsource/alexandria/800.css'), 900: () => import('@fontsource/alexandria/900.css') }, [400, 600, 800, 900]) },
  { id: 'cairo', family: 'Cairo', script: 'ar', weights: [400, 600, 800, 900], vibe: 'clean versatile, ads, news', load: L({ 400: () => import('@fontsource/cairo/400.css'), 600: () => import('@fontsource/cairo/600.css'), 800: () => import('@fontsource/cairo/800.css'), 900: () => import('@fontsource/cairo/900.css') }, [400, 600, 800, 900]) },
  { id: 'tajawal', family: 'Tajawal', script: 'ar', weights: [400, 500, 800, 900], vibe: 'friendly light, health, lifestyle', load: L({ 400: () => import('@fontsource/tajawal/400.css'), 500: () => import('@fontsource/tajawal/500.css'), 800: () => import('@fontsource/tajawal/800.css'), 900: () => import('@fontsource/tajawal/900.css') }, [400, 500, 800, 900]) },
  { id: 'readex', family: 'Readex Pro', script: 'ar', weights: [400, 500, 700], vibe: 'readable rounded-geometric, explainers', load: L({ 400: () => import('@fontsource/readex-pro/400.css'), 500: () => import('@fontsource/readex-pro/500.css'), 700: () => import('@fontsource/readex-pro/700.css') }, [400, 500, 700]) },
  { id: 'changa', family: 'Changa', script: 'ar', weights: [500, 700, 800], vibe: 'condensed sporty energetic, impact', load: L({ 500: () => import('@fontsource/changa/500.css'), 700: () => import('@fontsource/changa/700.css'), 800: () => import('@fontsource/changa/800.css') }, [500, 700, 800]) },
  { id: 'lalezar', family: 'Lalezar', script: 'ar', weights: [400], vibe: 'loud poster display, street ads', load: L({ 400: () => import('@fontsource/lalezar/400.css') }, [400]) },
  { id: 'el-messiri', family: 'El Messiri', script: 'ar', weights: [400, 600, 700], vibe: 'elegant warm, luxury, food', load: L({ 400: () => import('@fontsource/el-messiri/400.css'), 600: () => import('@fontsource/el-messiri/600.css'), 700: () => import('@fontsource/el-messiri/700.css') }, [400, 600, 700]) },
  { id: 'reem-kufi', family: 'Reem Kufi', script: 'ar', weights: [500, 700], vibe: 'geometric kufi, heritage-modern, editorial', load: L({ 500: () => import('@fontsource/reem-kufi/500.css'), 700: () => import('@fontsource/reem-kufi/700.css') }, [500, 700]) },
  { id: 'amiri', family: 'Amiri', script: 'ar', weights: [400, 700], italic: true, vibe: 'classic naskh serif, spiritual, literary, luxury', load: L({ 400: () => import('@fontsource/amiri/400.css'), 700: () => import('@fontsource/amiri/700.css'), '400i': () => import('@fontsource/amiri/400-italic.css'), '700i': () => import('@fontsource/amiri/700-italic.css') }, [400, 700], true) },
  { id: 'noto-naskh', family: 'Noto Naskh Arabic', script: 'ar', weights: [400, 700], vibe: 'neutral naskh, calm', load: L({ 400: () => import('@fontsource/noto-naskh-arabic/400.css'), 700: () => import('@fontsource/noto-naskh-arabic/700.css') }, [400, 700]) },
  { id: 'ibm-plex', family: 'IBM Plex Sans Arabic', script: 'ar', weights: [400, 500, 700], vibe: 'corporate precise, tech, finance', load: L({ 400: () => import('@fontsource/ibm-plex-sans-arabic/400.css'), 500: () => import('@fontsource/ibm-plex-sans-arabic/500.css'), 700: () => import('@fontsource/ibm-plex-sans-arabic/700.css') }, [400, 500, 700]) },
  { id: 'baloo', family: 'Baloo Bhaijaan 2', script: 'ar', weights: [500, 700, 800], vibe: 'rounded playful, kids, food', load: L({ 500: () => import('@fontsource/baloo-bhaijaan-2/500.css'), 700: () => import('@fontsource/baloo-bhaijaan-2/700.css'), 800: () => import('@fontsource/baloo-bhaijaan-2/800.css') }, [500, 700, 800]) },
  { id: 'marhey', family: 'Marhey', script: 'ar', weights: [500, 700], vibe: 'hand-drawn casual, fun', load: L({ 500: () => import('@fontsource/marhey/500.css'), 700: () => import('@fontsource/marhey/700.css') }, [500, 700]) },
  { id: 'rakkas', family: 'Rakkas', script: 'ar', weights: [400], vibe: 'retro display, bold heritage', load: L({ 400: () => import('@fontsource/rakkas/400.css') }, [400]) },
  { id: 'unbounded', family: 'Unbounded', script: 'lat', weights: [500, 700, 900], vibe: 'wide futuristic display', load: L({ 500: () => import('@fontsource/unbounded/500.css'), 700: () => import('@fontsource/unbounded/700.css'), 900: () => import('@fontsource/unbounded/900.css') }, [500, 700, 900]) },
  { id: 'inter', family: 'Inter', script: 'lat', weights: [400, 600, 800, 900], vibe: 'neutral modern sans (Helvetica-like)', load: L({ 400: () => import('@fontsource/inter/400.css'), 600: () => import('@fontsource/inter/600.css'), 800: () => import('@fontsource/inter/800.css'), 900: () => import('@fontsource/inter/900.css') }, [400, 600, 800, 900]) },
  { id: 'playfair', family: 'Playfair Display', script: 'lat', weights: [500, 700, 900], italic: true, vibe: 'high-contrast editorial serif (italic for emphasis)', load: L({ 500: () => import('@fontsource/playfair-display/500.css'), 700: () => import('@fontsource/playfair-display/700.css'), 900: () => import('@fontsource/playfair-display/900.css'), '500i': () => import('@fontsource/playfair-display/500-italic.css'), '700i': () => import('@fontsource/playfair-display/700-italic.css'), '900i': () => import('@fontsource/playfair-display/900-italic.css') }, [500, 700, 900], true) },
  { id: 'bebas', family: 'Bebas Neue', script: 'lat', weights: [400], vibe: 'tall condensed caps, sport, impact numbers', load: L({ 400: () => import('@fontsource/bebas-neue/400.css') }, [400]) },
  { id: 'space-grotesk', family: 'Space Grotesk', script: 'lat', weights: [500, 700], vibe: 'tech grotesk', load: L({ 500: () => import('@fontsource/space-grotesk/500.css'), 700: () => import('@fontsource/space-grotesk/700.css') }, [500, 700]) },
  { id: 'syne', family: 'Syne', script: 'lat', weights: [700, 800], vibe: 'artsy editorial', load: L({ 700: () => import('@fontsource/syne/700.css'), 800: () => import('@fontsource/syne/800.css') }, [700, 800]) },
  { id: 'archivo-black', family: 'Archivo Black', script: 'lat', weights: [400], vibe: 'heavy grotesk, punchy ads', load: L({ 400: () => import('@fontsource/archivo-black/400.css') }, [400]) },
  { id: 'fraunces', family: 'Fraunces', script: 'lat', weights: [600, 800], vibe: 'soft warm serif', load: L({ 600: () => import('@fontsource/fraunces/600.css'), 800: () => import('@fontsource/fraunces/800.css') }, [600, 800]) },
];
export const FONT = new Map(FONTS.map((f) => [f.id, f]));

const uploaded = new Map<string, string>();
let uploadLoader: ((id: string) => Promise<ArrayBuffer | null>) | null = null;
export const setUploadLoader = (fn: (id: string) => Promise<ArrayBuffer | null>) => {
  uploadLoader = fn;
};
export const familyOf = (id: string) => FONT.get(id)?.family ?? uploaded.get(id) ?? 'Cairo';
export const stackOf = (pair: { ar: string; lat: string }) => `"${familyOf(pair.lat)}", "${familyOf(pair.ar)}", "Cairo", sans-serif`;

const SAMPLE = 'موتيك ابجد هوز Motiq 0123456789%';
export const ensureFonts = async (pairs: Array<{ ar: string; lat: string; italic?: boolean; weight?: number }>) => {
  const jobs: Promise<unknown>[] = [];
  for (const p of pairs) {
    for (const id of [p.ar, p.lat]) {
      if (id.startsWith('upload:') && !uploaded.has(id) && uploadLoader) {
        jobs.push(
          uploadLoader(id.slice(7)).then(async (buf) => {
            if (!buf) return;
            const face = new FontFace(`MotiqUpload-${id.slice(7)}`, buf);
            await face.load();
            document.fonts.add(face);
            uploaded.set(id, `MotiqUpload-${id.slice(7)}`);
          }),
        );
        continue;
      }
      const def = FONT.get(id);
      if (def) jobs.push(def.load(p.weight ?? 800, !!p.italic).then(() => document.fonts.load(`${p.italic && def.italic ? 'italic ' : ''}${p.weight ?? 800} 40px "${def.family}"`, SAMPLE)));
    }
  }
  await Promise.all(jobs);
  await document.fonts.ready;
};
