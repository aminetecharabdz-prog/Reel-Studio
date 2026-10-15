import { BRAND } from '@/config/brand';
import { LOGO_BARS } from '@/config/logo';

export const LogoMark = ({ size = 36, tile = false }: { size?: number; tile?: boolean }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
    <defs>
      <linearGradient id="nb-mark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={BRAND.colors.mint} />
        <stop offset="0.55" stopColor={BRAND.colors.lilac} />
        <stop offset="1" stopColor={BRAND.colors.rose} />
      </linearGradient>
    </defs>
    {tile && <rect width="64" height="64" rx="15" fill={BRAND.colors.night} />}
    <g stroke="url(#nb-mark)" strokeWidth="3.3" strokeLinecap="round">
      {LOGO_BARS.map((b) => (
        <line key={b.x} x1={b.x} y1={b.y1} x2={b.x} y2={b.y2} />
      ))}
    </g>
    <circle cx="32" cy="13" r="5.2" fill={BRAND.colors.rose} />
  </svg>
);

export const Logo = ({ size = 34 }: { size?: number }) => (
  <span className="inline-flex items-center gap-2" aria-label={`${BRAND.nameAr} ${BRAND.nameLatin}`}>
    <LogoMark size={size} />
    <span className="flex flex-col leading-none">
      <span className="font-display text-[1.45em] font-bold tracking-normal">{BRAND.nameAr}</span>
      <span className="text-[0.62em] font-medium text-muted" dir="ltr">{BRAND.nameLatin}</span>
    </span>
  </span>
);
