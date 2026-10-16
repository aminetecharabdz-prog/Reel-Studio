import { BRAND } from '@/brand/config';
import { MARK_LENGTH, MARK_PATH, MARK_TIP } from '@/brand/logo';

/**
 * The mark as a React component. `animate` = the stroke draws itself and the spark travels along it, then rests
 * at the pen tip with a soft pulse (landing hero, loading states). UI-only: CSS animation is fine here.
 */
export const Mark = ({ size = 40, animate = false, duration = 1.6, className = '' }: { size?: number; animate?: boolean; duration?: number; className?: string }) => {
  const c = BRAND.colors;
  const id = `rsg-${size}-${animate ? 'a' : 's'}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label={BRAND.nameAr}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={c.sparkCore} />
          <stop offset=".35" stopColor={c.sparkGlow} />
          <stop offset="1" stopColor={c.spark} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d={MARK_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={size < 28 ? 6.4 : 5.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animate
            ? ({ strokeDasharray: MARK_LENGTH, ['--len' as string]: MARK_LENGTH, animation: `rs-draw ${duration}s cubic-bezier(.65,0,.35,1) both` } as React.CSSProperties)
            : undefined
        }
      />
      {animate ? (
        <g style={{ offsetPath: `path('${MARK_PATH}')`, animation: `rs-spark-travel ${duration}s cubic-bezier(.65,0,.35,1) both`, offsetRotate: '0deg' } as React.CSSProperties}>
          <circle r="7" fill={`url(#${id})`} />
          <circle r="2.2" fill={c.sparkCore} />
        </g>
      ) : (
        <g transform={`translate(${MARK_TIP.x} ${MARK_TIP.y})`}>
          <circle r="7" fill={`url(#${id})`} style={{ transformOrigin: 'center', animation: 'rs-pulse 2.6s ease-in-out infinite' }} />
          <circle r="2.2" fill={c.sparkCore} />
        </g>
      )}
    </svg>
  );
};

/** Lockup: mark + Arabic wordmark (+ small Latin name). */
export const Lockup = ({ size = 34, animate = false }: { size?: number; animate?: boolean }) => (
  <span className="inline-flex items-center gap-2.5" dir="rtl">
    <Mark size={size} animate={animate} />
    <span className="flex flex-col leading-none">
      <span className="font-display text-[1.32rem] font-extrabold" style={{ lineHeight: 1.15 }}>
        {BRAND.nameAr}
      </span>
      <span className="latin text-[0.62rem] font-medium text-[var(--text-3)]" style={{ letterSpacing: '0.18em' }} lang="en">
        {BRAND.name.toUpperCase()}
      </span>
    </span>
  </span>
);

/** Loading state: the mark draws itself in a loop. */
export const Loader = ({ label = 'لحظة...' }: { label?: string }) => (
  <div className="flex flex-col items-center gap-3 py-10 text-[var(--text-2)]" role="status">
    <Mark size={56} animate />
    <span className="text-sm">{label}</span>
  </div>
);
