import type { ReactNode } from 'react';
import { href } from '@/app/router';
import type { StyleId, StyleMeta } from '@/styles/catalog';
import { Badge } from '@/ui/kit';

/** A tiny drawn poster per style (placeholder until the engine's looping preview replaces it). */
const MOTIF: Record<StyleId, (c: [string, string, string]) => ReactNode> = {
  product: ([, ink, ac]) => (
    <>
      <rect x="18" y="70" width="84" height="22" rx="11" fill="none" stroke={ac} strokeWidth="2.5" />
      <rect x="26" y="78" width="40" height="6" rx="3" fill={ink} opacity=".8" />
      <circle cx="60" cy="140" r="30" fill={ac} opacity=".35" />
      <rect x="30" y="118" width="60" height="40" rx="6" fill="none" stroke={ink} strokeWidth="2" transform="skewY(-8)" />
    </>
  ),
  infographic: ([, ink, ac]) => (
    <>
      <text x="60" y="95" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="34" fill={ink}>
        71%
      </text>
      {Array.from({ length: 25 }, (_, i) => (
        <circle key={i} cx={30 + (i % 5) * 15} cy={120 + Math.floor(i / 5) * 12} r="4" fill={i === 24 ? ac : ink} opacity={i === 24 ? 1 : 0.35} />
      ))}
    </>
  ),
  doodle: ([, ink, ac]) => (
    <>
      <path d="M0 150 Q60 135 120 150 V200 H0Z" fill="#F1D9AE" />
      <circle cx="60" cy="105" r="14" fill="#F1E8E0" stroke={ink} strokeWidth="2.5" />
      <path d="M46 150 Q60 118 74 150Z" fill="#D06643" stroke={ink} strokeWidth="2.5" />
      <path d="M53 108 Q60 114 67 108" fill="none" stroke={ink} strokeWidth="2" />
      <path d="M30 60 Q45 54 60 60 T90 60" fill="none" stroke={ac} strokeWidth="3" />
    </>
  ),
  whiteboard: ([, ink, ac]) => (
    <>
      <circle cx="45" cy="95" r="16" fill="none" stroke="#F28C12" strokeWidth="3" />
      <path d="M68 120 l18 -26 l18 26z" fill="none" stroke={ac} strokeWidth="3" />
      <path d="M22 145 h76" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 158 q30 8 60 0" stroke="#E0412E" strokeWidth="2.5" fill="none" />
    </>
  ),
  plotter: ([, ink, ac]) => (
    <>
      <path d="M20 140 L45 100 L70 120 L98 72" fill="none" stroke={ink} strokeWidth="2" />
      <circle cx="98" cy="72" r="5" fill={ac} />
      <circle cx="98" cy="72" r="12" fill={ac} opacity=".25" />
      <path d="M20 165 h80" stroke={ink} strokeWidth="1" strokeDasharray="3 4" opacity=".6" />
    </>
  ),
  stickman: ([, ink, ac]) => (
    <>
      <path d="M0 150 H120" stroke={ink} strokeWidth="3" />
      <ellipse cx="60" cy="118" rx="12" ry="18" fill="#fff" stroke={ink} strokeWidth="3" />
      <path d="M48 120 L32 108 M72 120 L90 100 M54 135 L48 150 M66 135 L72 150" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <rect x="82" y="80" width="22" height="14" rx="3" fill={ac} transform="rotate(-8 93 87)" />
    </>
  ),
  chalkboard: ([, ink, ac]) => (
    <>
      <path d="M30 150 L30 95 L85 150Z" fill="none" stroke={ink} strokeWidth="2.5" opacity=".9" />
      <rect x="30" y="150" width="55" height="0" />
      <text x="70" y="88" fontFamily="Aref Ruqaa" fontSize="20" fill={ac}>
        a²+b²
      </text>
    </>
  ),
  isometric: ([, ink, ac]) => (
    <>
      <path d="M60 90 l30 17 l-30 17 l-30 -17z" fill="#E4F5DC" />
      <path d="M45 98 l10 6 v-22 l-10 -6z" fill={ac} />
      <path d="M55 104 l10 -6 v-22 l-10 6z" fill="#818CF8" />
      <path d="M45 76 l10 -6 l10 6 l-10 6z" fill="#A5B4FC" />
      <circle cx="80" cy="104" r="6" fill="#34D399" />
      <path d="M20 150 h80" stroke={ink} strokeWidth="2" opacity=".2" />
    </>
  ),
  fake3d: ([, ink, ac]) => (
    <>
      {[6, 4, 2, 0].map((d) => (
        <g key={d} transform={`translate(${d} ${d})`} opacity={d ? 0.5 : 1}>
          <circle cx="52" cy="100" r="16" fill="none" stroke={d ? '#B4641A' : ac} strokeWidth="7" />
          <path d="M66 108 L96 130 M86 123 l6 -8 M92 127 l6 -8" stroke={d ? '#B4641A' : ac} strokeWidth="7" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="40" cy="88" r="3" fill={ink} />
    </>
  ),
  'map-journey': ([, ink, ac]) => (
    <>
      <path d="M10 120 Q30 90 60 100 T112 80" fill="none" stroke={ink} strokeWidth="2" opacity=".7" />
      <path d="M20 150 Q50 120 70 130 T104 112" fill="none" stroke={ac} strokeWidth="3" strokeDasharray="6 4" />
      <path d="M104 112 v-22 l12 6 l-12 6" fill={ac} stroke={ac} strokeWidth="1.5" />
    </>
  ),
};

export const StylePoster = ({ s, className = '' }: { s: StyleMeta; className?: string }) => (
  <svg viewBox="0 0 120 200" className={className} role="img" aria-label={s.nameAr}>
    <rect width="120" height="200" fill={s.swatch[0]} />
    {MOTIF[s.id](s.swatch)}
  </svg>
);

export const StyleTile = ({ s }: { s: StyleMeta }) => (
  <a href={href(`/styles/${s.id}`)} className="group card flex w-[46vw] max-w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-lg)] sm:w-auto sm:max-w-none">
    <div className="relative aspect-[9/14] overflow-hidden border-b border-[var(--line)]">
      <StylePoster s={s} className="absolute inset-0 h-full w-full transition duration-500 group-hover:scale-[1.04]" />
      <span className="absolute top-2.5 right-2.5">{s.ready ? <Badge tone="teal">جاهز</Badge> : <Badge tone="neutral">قريبًا</Badge>}</span>
    </div>
    <div className="flex flex-col gap-1 p-3.5">
      <h3 className="text-[1rem] font-bold">{s.nameAr}</h3>
      <p className="latin text-[0.72rem] text-[var(--text-3)]" lang="en">
        {s.nameEn}
      </p>
    </div>
  </a>
);
