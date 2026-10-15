/**
 * Logo geometry: the Arabic letter "ن" (noon — the first letter of نبرة) drawn
 * as a bowl of audio-waveform bars, with its dot as a "record" pulse.
 * Shared by the React <Logo/> and the static favicon generator.
 */
export const LOGO_BARS: ReadonlyArray<{ x: number; y1: number; y2: number }> = (() => {
  const heights = [5, 9, 14, 11, 17, 11, 14, 9, 5];
  return heights.map((h, i) => {
    const x = 12 + i * 5;
    const t = (x - 12) / 40;
    const cy = 27 + 21 * Math.sin(Math.PI * t);
    return { x, y1: +(cy - h / 2).toFixed(2), y2: +(cy + h / 2).toFixed(2) };
  });
})();

export const logoSvg = (opts: { tile?: boolean; size?: number; rose: string; mint: string; night: string; lilac: string }) => {
  const { tile = false, size = 64, rose, mint, night, lilac } = opts;
  const bars = LOGO_BARS.map(
    (b) => `<line x1="${b.x}" y1="${b.y1}" x2="${b.x}" y2="${b.y2}" />`,
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
<defs><linearGradient id="nb-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${mint}"/><stop offset="0.55" stop-color="${lilac}"/><stop offset="1" stop-color="${rose}"/></linearGradient></defs>
${tile ? `<rect width="64" height="64" rx="15" fill="${night}"/>` : ''}
<g stroke="url(#nb-g)" stroke-width="3.3" stroke-linecap="round">${bars}</g>
<circle cx="32" cy="13" r="5.2" fill="${rose}"/>
</svg>`;
};
