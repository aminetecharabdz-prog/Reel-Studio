import type { ReactNode } from 'react';
import { BRAND } from '@/brand';
import { Btn, I, Logo, cx } from './kit';

const NAV = [
  { href: '#/', label: 'الرئيسية', icon: I.home, key: '' },
  { href: '#/projects', label: 'مشاريعي', icon: I.film, key: 'projects' },
  { href: '#/new', label: 'جديد', icon: I.plus, key: 'new' },
  { href: '#/settings', label: 'الإعدادات', icon: I.gear, key: 'settings' },
];

export const Shell = ({ active, children, wide }: { active: string; children: ReactNode; wide?: boolean }) => (
  <div className="min-h-dvh pb-24 md:pb-0">
    <header className="sticky top-0 z-30 border-b border-line/60 bg-ink/80 backdrop-blur-xl">
      <div className={cx('mx-auto flex h-16 items-center justify-between gap-3 px-4', wide ? 'max-w-7xl' : 'max-w-6xl')}>
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a key={n.key} href={n.href} className={cx('rounded-xl px-3.5 py-2 text-[14px] font-semibold transition', active === n.key ? 'bg-raised text-text' : 'text-muted hover:text-text')}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#/new" className="md:hidden">
          <Btn size="sm" icon={<I.plus size={16} />}>فيديو جديد</Btn>
        </a>
      </div>
    </header>
    <main className={cx('mx-auto px-4', wide ? 'max-w-7xl' : 'max-w-6xl')}>{children}</main>
    <nav aria-label={BRAND.name} className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4">
        {NAV.map((n) => (
          <a key={n.key} href={n.href} data-testid={`nav-${n.key || 'home'}`} className={cx('flex flex-col items-center gap-1 py-2.5 text-[11.5px] font-semibold', active === n.key ? 'text-text' : 'text-muted')}>
            <span className={cx('grid h-8 w-12 place-items-center rounded-full transition', active === n.key && (n.key === 'new' ? 'grad-bg text-white' : 'bg-raised'))}>
              <n.icon size={20} />
            </span>
            {n.label}
          </a>
        ))}
      </div>
    </nav>
  </div>
);
