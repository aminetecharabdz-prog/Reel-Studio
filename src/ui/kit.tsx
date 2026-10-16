import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');
export { cx };

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'spark' | 'solid' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconEnd?: IconName;
  href?: string;
};

const BTN = {
  base: 'inline-flex select-none items-center justify-center gap-2 rounded-[var(--radius-md)] font-display font-semibold transition-[transform,background,box-shadow,border-color] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45',
  spark: 'bg-[var(--color-spark)] text-[var(--on-spark)] shadow-[0_10px_30px_-10px_rgb(255_122_26/0.8),inset_0_1px_0_rgb(255_255_255/0.35)] hover:bg-[#ff8a33]',
  solid: 'bg-[var(--text)] text-[var(--bg)] hover:opacity-90',
  ghost: 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
  outline: 'border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--text-3)]',
  danger: 'border border-[rgb(255_107_94/0.5)] text-[var(--color-danger)] hover:bg-[rgb(255_107_94/0.1)]',
  sm: 'h-9 px-3.5 text-[0.85rem]',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-14 px-7 text-[1.05rem]',
};

export const Button = ({ variant = 'outline', size = 'md', icon, iconEnd, className, children, href, ...rest }: BtnProps) => {
  const cls = cx(BTN.base, BTN[variant], BTN[size], className);
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === 'lg' ? 22 : 19} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={size === 'lg' ? 22 : 19} />}
    </>
  );
  if (href)
    return (
      <a href={href} className={cls} aria-disabled={rest.disabled}>
        {inner}
      </a>
    );
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
};

export const IconButton = ({ icon, label, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) => (
  <button type="button" aria-label={label} title={label} className={cx('grid size-10 place-items-center rounded-[var(--radius-sm)] text-[var(--text-2)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]', className)} {...rest}>
    <Icon name={icon} size={20} />
  </button>
);

export const Chip = ({ active, children, onClick, icon }: { active?: boolean; children: ReactNode; onClick?: () => void; icon?: IconName }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cx(
      'inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[0.85rem] font-medium transition',
      active ? 'border-[var(--color-spark)] bg-[rgb(255_122_26/0.12)] text-[var(--text)]' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--line-strong)]',
    )}
  >
    {icon && <Icon name={icon} size={16} />}
    {children}
  </button>
);

/** Segmented control (RTL-native). */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<{ value: T; label: ReactNode }>; onChange: (v: T) => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg-2)] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(
            'flex-1 rounded-[calc(var(--radius-md)-4px)] px-2 py-2 text-[0.85rem] font-medium transition',
            o.value === value ? 'bg-[var(--surface-3)] text-[var(--text)] shadow-[var(--shadow-e1)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Toggle = ({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
    <span className="flex flex-col">
      <span className="text-[0.95rem] font-medium">{label}</span>
      {hint && <span className="text-[0.8rem] text-[var(--text-3)]">{hint}</span>}
    </span>
    <span className="relative inline-flex shrink-0">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="h-7 w-12 rounded-full border border-[var(--line-strong)] bg-[var(--surface-3)] transition peer-checked:border-[var(--color-spark)] peer-checked:bg-[var(--color-spark)]" />
      <span className="absolute top-1 right-1 size-5 rounded-full bg-[var(--text)] shadow transition peer-checked:-translate-x-5 peer-checked:bg-white" />
    </span>
  </label>
);

export const Slider = ({ value, min, max, step = 1, onChange, label, format }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; label: string; format?: (v: number) => string }) => (
  <label className="flex flex-col gap-2 py-1">
    <span className="flex items-center justify-between text-[0.9rem]">
      <span className="font-medium">{label}</span>
      <span className="num text-[var(--text-2)]">{format ? format(value) : value}</span>
    </span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--color-spark)]" dir="rtl" />
  </label>
);

export const Field = ({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[0.9rem] font-medium">{label}</span>
    {children}
    {hint && <span className="text-[0.8rem] leading-relaxed text-[var(--text-3)]">{hint}</span>}
  </label>
);

const INPUT = 'w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-2)] px-3.5 py-2.5 text-[0.95rem] text-[var(--text)] placeholder:text-[var(--text-3)] transition focus:border-[var(--color-spark)] focus:outline-none';
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(INPUT, 'h-11', p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cx(INPUT, 'min-h-28 leading-relaxed', p.className)} />;

export const Section = ({ title, kicker, children, action, id }: { title: string; kicker?: string; children: ReactNode; action?: ReactNode; id?: string }) => (
  <section id={id} className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-20">
    <header className="mb-7 flex items-end justify-between gap-4">
      <div>
        {kicker && <p className="mb-1.5 text-[0.85rem] font-medium text-[var(--color-spark)]">{kicker}</p>}
        <h2 className="text-[1.6rem] font-extrabold sm:text-[2.1rem]">{title}</h2>
      </div>
      {action}
    </header>
    {children}
  </section>
);

export const Badge = ({ tone = 'neutral', children }: { tone?: 'neutral' | 'spark' | 'teal' | 'soon'; children: ReactNode }) => (
  <span
    className={cx(
      'inline-flex h-6 items-center rounded-full px-2.5 text-[0.72rem] font-semibold',
      tone === 'spark' && 'bg-[rgb(255_122_26/0.15)] text-[var(--color-spark)]',
      tone === 'teal' && 'bg-[rgb(111_209_195/0.15)] text-[var(--color-teal)]',
      tone === 'neutral' && 'bg-[var(--surface-3)] text-[var(--text-2)]',
      tone === 'soon' && 'border border-dashed border-[var(--line-strong)] text-[var(--text-3)]',
    )}
  >
    {children}
  </span>
);

export const Empty = ({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--line-strong)] px-6 py-14 text-center">
    <span className="grid size-14 place-items-center rounded-2xl bg-[var(--surface-2)] text-[var(--color-spark)]">
      <Icon name={icon} size={26} />
    </span>
    <h3 className="text-lg font-bold">{title}</h3>
    <p className="max-w-sm text-[0.92rem] text-[var(--text-2)]">{body}</p>
    {action}
  </div>
);
