/** The ONE place to rename the product (UI, title, manifest, logo wordmark all read from here). */
export const BRAND = {
  name: 'Motiq',
  nameAr: 'موتيك',
  tagline: 'AI motion graphics for reels',
  taglineAr: 'فيديوهات موشن جرافيك احترافية… يصمّمها الذكاء الاصطناعي',
  colors: {
    ink: '#0A0910',
    panel: '#14121D',
    raised: '#1D1A29',
    line: '#2A2638',
    text: '#F5F3FB',
    muted: '#A49EBA',
    violet: '#7C5CFF',
    coral: '#FF5B2E',
    sun: '#FFC43D',
  },
} as const;

/** Logo: a play triangle sliced by three motion streaks (motion + play), on a gradient tile. */
export const logoSvg = ({ size = 64, tile = true }: { size?: number; tile?: boolean } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
<defs><linearGradient id="mq" gradientUnits="userSpaceOnUse" x1="4" y1="60" x2="60" y2="4"><stop offset="0" stop-color="${BRAND.colors.violet}"/><stop offset="1" stop-color="${BRAND.colors.coral}"/></linearGradient>
<mask id="mqm"><rect width="64" height="64" fill="#fff"/><rect x="0" y="22.5" width="40" height="4" rx="2" fill="#000"/><rect x="0" y="30" width="46" height="4" rx="2" fill="#000"/><rect x="0" y="37.5" width="40" height="4" rx="2" fill="#000"/></mask></defs>
${tile ? `<rect width="64" height="64" rx="16" fill="url(#mq)"/>` : ''}
<path d="M22 13.5c0-2.3 2.5-3.7 4.5-2.5l24.2 14.9c3.4 2.1 3.4 7 0 9.1L26.5 50c-2 1.2-4.5-.2-4.5-2.5z" fill="${tile ? '#fff' : 'url(#mq)'}" mask="url(#mqm)"/>
<rect x="8" y="22.5" width="9" height="4" rx="2" fill="${tile ? '#fff' : BRAND.colors.violet}" opacity=".55"/><rect x="4" y="30" width="13" height="4" rx="2" fill="${tile ? '#fff' : BRAND.colors.violet}" opacity=".8"/><rect x="8" y="37.5" width="9" height="4" rx="2" fill="${tile ? '#fff' : BRAND.colors.violet}" opacity=".55"/>
</svg>`;
