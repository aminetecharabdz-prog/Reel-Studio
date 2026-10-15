import type { ButtonHTMLAttributes, ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

export const Button = ({ variant = 'primary', size = 'md', className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'soft' | 'danger'; size?: 'sm' | 'md' | 'lg' }) => (
  <button
    {...p}
    className={cx(
      'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-[transform,background-color] active:scale-[0.97] disabled:opacity-45 disabled:active:scale-100',
      size === 'lg' && 'h-14 px-6 text-lg',
      size === 'md' && 'h-12 px-5 text-base',
      size === 'sm' && 'h-9 px-3.5 text-sm rounded-xl',
      variant === 'primary' && 'bg-rose text-white hover:bg-rose-deep',
      variant === 'ghost' && 'bg-transparent text-ink ring-1 ring-line hover:bg-raised',
      variant === 'soft' && 'bg-raised text-ink hover:bg-line',
      variant === 'danger' && 'bg-transparent text-rose ring-1 ring-rose/40 hover:bg-rose/10',
      className,
    )}
  />
);

export const Panel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx('rounded-[22px] border border-line bg-surface p-4', className)}>{children}</div>
);

export const Label = ({ children, hint }: { children: ReactNode; hint?: ReactNode }) => (
  <div className="mb-1.5">
    <div className="text-[15px] font-bold text-ink">{children}</div>
    {hint && <div className="text-[13px] leading-5 text-muted">{hint}</div>}
  </div>
);

export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={cx('h-12 w-full rounded-xl border border-line bg-raised px-3.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-mint focus:outline-none', p.className)} />
);

export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={cx('min-h-24 w-full rounded-xl border border-line bg-raised px-3.5 py-3 text-[16px] leading-7 text-ink placeholder:text-muted/70 focus:border-mint focus:outline-none', p.className)} />
);

export function Segmented<T extends string>({ value, options, onChange, className }: { value: T; options: Array<{ value: T; label: ReactNode }>; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="radiogroup" className={cx('flex gap-1 rounded-2xl bg-raised p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx('h-10 flex-1 rounded-xl px-2 text-sm font-bold transition-colors', value === o.value ? 'bg-ink text-night' : 'text-muted hover:text-ink')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) => (
  <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3">
    <span className="text-[15px] font-bold">{label}</span>
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cx('relative h-7 w-12 flex-none rounded-full transition-colors', checked ? 'bg-mint' : 'bg-line')}>
      <span className={cx('absolute top-1 h-5 w-5 rounded-full bg-white transition-all', checked ? 'right-1' : 'right-6')} />
    </button>
  </label>
);

export const Chip = ({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={cx('h-10 flex-none rounded-full px-4 text-sm font-bold ring-1 transition-colors', active ? 'bg-ink text-night ring-ink' : 'bg-transparent text-ink ring-line hover:bg-raised')}>
    {children}
  </button>
);

export const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-2.5 w-full overflow-hidden rounded-full bg-raised">
    <div className="h-full rounded-full bg-gradient-to-l from-rose via-lilac to-mint transition-[width] duration-300" style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
  </div>
);

/** The brand waveform motif (ن bowl bars) as an animated "working" indicator. */
export const Pulse = ({ active = true, bars = 9 }: { active?: boolean; bars?: number }) => (
  <span className="inline-flex h-6 items-end gap-[3px]" aria-hidden="true">
    {Array.from({ length: bars }, (_, i) => (
      <span key={i} className="w-[3px] rounded-full bg-gradient-to-t from-mint to-rose" style={{ height: `${30 + 60 * Math.sin((Math.PI * (i + 1)) / (bars + 1))}%`, transformOrigin: 'bottom', animation: active ? `nb-bar 0.9s ${i * 0.08}s ease-in-out infinite alternate` : undefined }} />
    ))}
  </span>
);
