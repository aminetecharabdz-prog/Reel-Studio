// Design DNA for this reel: taken from the product photo (warm cream wall, linen sofa, oak, candle glow).
import { Easing, continueRender, delayRender, staticFile } from 'remotion';
import FACES from './fonts.json';

// Fonts are bundled in public/fonts (Google Fonts woff2, arabic + latin subsets) so renders never
// depend on the network.
if (typeof document !== 'undefined') {
  const handle = delayRender('fonts');
  Promise.all(
    FACES.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, { weight: f.weight, unicodeRange: f.range, display: 'block' });
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle), (e) => { console.error(e); continueRender(handle); });
}

export const DISPLAY = 'Alexandria';
export const BODY = 'Tajawal';

export const C = {
  cream: '#F5EFE7',
  linen: '#EAE0D3',
  sand: '#D9C9B4',
  taupe: '#9A8775',
  oak: '#8A5E3B',
  kraft: '#C79C6B',
  kraftDark: '#A97E50',
  espresso: '#211A15',
  ink: '#2A221C',
  amber: '#E09A45',
  amberSoft: '#F3C98F',
  white: '#FFFBF5',
};

// One motion family for the whole video: smooth, with gentle springs for small pops.
export const EASE_IN = Easing.bezier(0.2, 0.8, 0.2, 1);
export const EASE_OUT = Easing.bezier(0.6, 0, 0.8, 0.2);
export const EASE_MOVE = Easing.bezier(0.45, 0, 0.2, 1);

// Safe zones (1080x1920): text stays below y=240 and above y=1530.
export const SAFE = { top: 250, captionBottom: 1515 };
