import { continueRender, delayRender, staticFile } from 'remotion';
import faces from './fonts.json';

// IBM Plex Sans Arabic, bundled in public/fonts (arabic + latin subsets) so renders never depend on the network.
export const FONT = 'Plex Arabic';
const handle = delayRender('fonts');
Promise.all(
  faces.map((f) => {
    const face = new FontFace(FONT, `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, { weight: f.weight, unicodeRange: f.range });
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));

export const C = {
  bg: '#000000',
  text: '#F5F5F7',
  gray: '#86868B',
  track: '#1E2230',
  glow: '#0A3D91',
};

/** One colour pair per day, light -> deep: calm blue drifting to alarm. */
export const DAY = [
  ['#C9F4FF', '#64D2FF'],
  ['#9CC4FF', '#5B9BFF'],
  ['#C4BEFF', '#7D6BFF'],
  ['#E2B8FF', '#B05CFF'],
  ['#FFB3C6', '#FF4D7A'],
] as const;

export const grad = (a: string, b: string) => ({
  backgroundImage: `linear-gradient(180deg, ${a} 0%, ${b} 100%)`,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
});

/** Fast start, soft landing: the text and number reveal curve of the reference. */
export { Easing } from 'remotion';
