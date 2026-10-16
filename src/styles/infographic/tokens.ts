/** infographic — "Keynote data morph" tokens from docs/styles/infographic/STYLE.md (1920×1080 px → unit u). */
export const C = {
  black: '#000000',
  bloom: '#0A3D91',
  bloomTeal: '#0B3A55',
  text: '#F5F5F7',
  text2: '#86868B',
  hair: '#1C1C1E',
  muted: '#627888',
  muted2: '#3F4D59',
  font: '"IBM Plex Sans Arabic", sans-serif',
  mono: '"IBM Plex Mono", monospace',
} as const;

/** category gradients, light top → saturated bottom; `cyan` is THE focus colour */
export const CAT = {
  cyan: ['#C9F4FF', '#64D2FF', '#1AA7EC'],
  blue: ['#9CC2FF', '#5B9BFF', '#1239A0'],
  ice: ['#FFFFFF', '#D6ECFF', '#8CCBFF'],
  indigo: ['#C9C8FF', '#A8A6FF', '#3D57E0'],
  muted: ['#8FA2B0', '#627888', '#3F4D59'],
} as const;
export type Cat = keyof typeof CAT;
export const CAT_ORDER: Cat[] = ['cyan', 'blue', 'ice', 'indigo'];

export const grad = (c: Cat, deg = 180) => `linear-gradient(${deg}deg, ${CAT[c][0]} 0%, ${CAT[c][1]} 55%, ${CAT[c][2]} 100%)`;

/** text in: 0.55 s easeOutExpo; out 0.3 s; counter 1.0 s; morph 0.85 s */
export const D = { textIn: 0.55, textOut: 0.3, counter: 1.0, morph: 0.85, stagger: 0.12 } as const;
