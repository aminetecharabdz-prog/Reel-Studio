import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { BRAND, logoSvg } from '@/brand';

export const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(' ');

export const Logo = ({ size = 34, word = true }: { size?: number; word?: boolean }) => (
  <a href="#/" className="flex items-center gap-2.5" aria-label={BRAND.name}>
    <span style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: logoSvg({ size }) }} />
    {word && (
      <span dir="ltr" className="font-display text-[19px] font-black tracking-tight">
        {BRAND.name}
      </span>
    )}
  </a>
);

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { kind?: 'primary' | 'ghost' | 'soft' | 'danger'; size?: 'md' | 'lg' | 'sm'; icon?: ReactNode };
export const Btn = ({ kind = 'primary', size = 'md', icon, className, children, ...p }: BtnProps) => (
  <button
    {...p}
    className={cx(
      'inline-flex items-center justify-center gap-2 font-ar font-bold transition active:scale-[.97] disabled:opacity-40 disabled:pointer-events-none',
      size === 'lg' ? 'h-14 px-7 text-[17px] rounded-2xl' : size === 'sm' ? 'h-9 px-3.5 text-[13px] rounded-xl' : 'h-11 px-5 text-[15px] rounded-xl',
      kind === 'primary' && 'grad-bg text-white shadow-[0_10px_30px_-10px_rgba(124,92,255,.8)]',
      kind === 'ghost' && 'border border-line text-text hover:bg-raised',
      kind === 'soft' && 'bg-raised text-text hover:bg-line',
      kind === 'danger' && 'bg-coral/15 text-coral hover:bg-coral/25',
      className,
    )}
  >
    {icon}
    {children}
  </button>
);

export const Field = ({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block font-ar text-[14px] font-semibold text-text">{label}</span>
    {children}
    {hint && <span className="mt-1.5 block text-[12.5px] leading-relaxed text-muted">{hint}</span>}
  </label>
);
export const inputCls = 'w-full rounded-xl border border-line bg-ink px-3.5 py-3 text-[15px] text-text placeholder:text-muted/60 outline-none focus:border-violet';

export const Toggle = ({ on, onChange, label, testId }: { on: boolean; onChange: (v: boolean) => void; label: string; testId?: string }) => (
  <button type="button" data-testid={testId} role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 py-2 text-start">
    <span className="text-[14.5px]">{label}</span>
    <span className={cx('relative h-7 w-12 shrink-0 rounded-full transition', on ? 'grad-bg' : 'bg-line')}>
      <span className={cx('absolute top-1 h-5 w-5 rounded-full bg-white transition-all', on ? 'start-6' : 'start-1')} />
    </span>
  </button>
);

export function Seg<T extends string>({ value, options, onChange, testId }: { value: T; options: Array<{ v: T; label: ReactNode }>; onChange: (v: T) => void; testId?: string }) {
  return (
    <div data-testid={testId} className="flex flex-wrap gap-1.5 rounded-2xl bg-ink p-1.5">
      {options.map((o) => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)} className={cx('min-w-0 flex-1 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition', value === o.v ? 'bg-raised text-text shadow-[inset_0_0_0_1px_var(--color-line)]' : 'text-muted')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => <div className={cx('rounded-3xl border border-line bg-panel p-5', className)}>{children}</div>;

export const Spinner = ({ size = 18 }: { size?: number }) => <span className="spin inline-block rounded-full border-2 border-white/25 border-t-white" style={{ width: size, height: size }} />;

/** Inline icons (stroke, currentColor). */
const P = (d: ReactNode) => ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);
export const I = {
  home: P(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>),
  plus: P(<><path d="M12 5v14M5 12h14" /></>),
  film: P(<><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></>),
  gear: P(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>),
  mic: P(<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>),
  upload: P(<><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>),
  text: P(<><path d="M4 6h16M4 12h10M4 18h13" /></>),
  bag: P(<><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>),
  spark: P(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></>),
  user: P(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  play: P(<><path d="M7 4.5v15l12-7.5z" /></>),
  download: P(<><path d="M12 4v12M7 11l5 5 5-5" /><path d="M4 20h16" /></>),
  wand: P(<><path d="m15 4 5 5L9 20H4v-5z" /><path d="m13 6 5 5" /></>),
  undo: P(<><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></>),
  trash: P(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>),
  key: P(<><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l3 3" /></>),
  music: P(<><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>),
  palette: P(<><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A4.6 4.6 0 0 0 22 9.8C22 6 17.5 3 12 3z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7" r="1" /></>),
  layers: P(<><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>),
  check: P(<><path d="m5 12 5 5 9-10" /></>),
  x: P(<><path d="M6 6l12 12M18 6 6 18" /></>),
  back: P(<><path d="M9 6l6 6-6 6" /></>),
  coin: P(<><circle cx="12" cy="12" r="9" /><path d="M9 9.5c0-1 1.3-1.8 3-1.8s3 .8 3 1.8-1.3 1.6-3 2.2-3 1.2-3 2.3 1.3 1.8 3 1.8 3-.8 3-1.8M12 6v1.7M12 16.3V18" /></>),
};
