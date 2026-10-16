import type { ReactNode } from 'react';
import { BRAND } from '@/brand/config';
import { Icon, type IconName } from '@/ui/Icon';
import { Lockup } from '@/ui/Logo';
import { cx, IconButton } from '@/ui/kit';
import { resolvedTheme, setSettings, useSettings } from '@/data/settings';
import { href, type Route } from './router';

type NavItem = { to: string; label: string; icon: IconName; match: (p: string) => boolean };
const NAV: NavItem[] = [
  { to: '/', label: 'الرئيسية', icon: 'home', match: (p) => p === '/' },
  { to: '/styles', label: 'الستايلات', icon: 'palette', match: (p) => p.startsWith('/styles') },
  { to: '/create', label: 'إنشاء فيديو', icon: 'plus', match: (p) => p.startsWith('/create') },
  { to: '/projects', label: 'مشاريعي', icon: 'folder', match: (p) => p.startsWith('/projects') },
  { to: '/brand', label: 'هوية علامتي', icon: 'brand', match: (p) => p.startsWith('/brand') },
  { to: '/settings', label: 'الإعدادات', icon: 'settings', match: (p) => p.startsWith('/settings') },
  { to: '/help', label: 'المساعدة', icon: 'help', match: (p) => p.startsWith('/help') },
];
const TABS = ['/', '/styles', '/create', '/projects', '/settings'];

const ThemeToggle = () => {
  const s = useSettings();
  const t = resolvedTheme(s);
  return <IconButton icon={t === 'dark' ? 'sun' : 'moon'} label={t === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'} onClick={() => setSettings({ theme: t === 'dark' ? 'light' : 'dark' })} />;
};

export const Shell = ({ route, children, bare }: { route: Route; children: ReactNode; bare?: boolean }) => (
  <div className="flex min-h-dvh flex-col" dir="rtl" lang="ar">
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:rounded-lg focus:bg-[var(--surface)] focus:px-3 focus:py-2">
      تخطَّ إلى المحتوى
    </a>
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href={href('/')} aria-label={`${BRAND.nameAr} — الرئيسية`} className="text-[var(--text)]">
          <Lockup size={34} />
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {NAV.filter((n) => n.to !== '/create').map((n) => (
            <a
              key={n.to}
              href={href(n.to)}
              aria-current={n.match(route.path) ? 'page' : undefined}
              className={cx('rounded-[var(--radius-sm)] px-3 py-2 text-[0.9rem] font-medium transition', n.match(route.path) ? 'bg-[var(--surface-2)] text-[var(--text)]' : 'text-[var(--text-2)] hover:text-[var(--text)]')}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <a
            href={href('/create')}
            className="hidden h-10 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-spark)] px-4 font-display text-[0.9rem] font-semibold text-[var(--on-spark)] shadow-[0_8px_24px_-10px_rgb(255_122_26/0.9)] sm:inline-flex"
          >
            <Icon name="plus" size={18} />
            إنشاء فيديو
          </a>
        </div>
      </div>
    </header>

    <main id="main" className={cx('flex-1', !bare && 'pb-tabbar')}>
      {children}
    </main>

    {!bare && <Footer />}

    {/* mobile tab bar */}
    <nav aria-label="التنقل السفلي" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_90%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid h-[72px] max-w-md grid-cols-5 items-center px-2">
        {NAV.filter((n) => TABS.includes(n.to)).map((n) => {
          const active = n.match(route.path);
          const center = n.to === '/create';
          return (
            <li key={n.to} className="flex justify-center">
              <a href={href(n.to)} aria-current={active ? 'page' : undefined} className={cx('flex flex-col items-center gap-1 text-[0.68rem] font-medium', active ? 'text-[var(--text)]' : 'text-[var(--text-3)]')}>
                {center ? (
                  <span className="-mt-7 grid size-14 place-items-center rounded-2xl bg-[var(--color-spark)] text-[var(--on-spark)] shadow-[0_12px_28px_-8px_rgb(255_122_26/0.9),inset_0_1px_0_rgb(255_255_255/0.35)]">
                    <Icon name="plus" size={26} />
                  </span>
                ) : (
                  <span className={cx('grid h-8 w-12 place-items-center rounded-full transition', active && 'bg-[var(--surface-3)]')}>
                    <Icon name={n.icon} size={21} />
                  </span>
                )}
                <span>{center ? 'إنشاء' : n.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  </div>
);

const Footer = () => (
  <footer className="border-t border-[var(--line)] bg-[var(--bg-2)] pb-tabbar">
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div className="flex flex-col gap-3">
        <Lockup size={32} />
        <p className="max-w-xs text-[0.88rem] text-[var(--text-2)]">{BRAND.descriptionAr}</p>
      </div>
      <FooterCol title="المنتج" links={[['/create', 'إنشاء فيديو'], ['/styles', 'الستايلات العشرة'], ['/projects', 'مشاريعي'], ['/brand', 'هوية علامتي']]} />
      <FooterCol title="الدعم" links={[['/help', 'المساعدة'], ['/settings', 'الإعدادات والمفاتيح'], ['/about', 'عن رسّام']]} />
      <FooterCol title="قانوني" links={[['/about#credits', 'الاعتمادات'], ['/terms', 'شروط الاستعمال'], ['/privacy', 'الخصوصية']]} />
    </div>
    <div className="mx-auto max-w-6xl px-4 pb-8 text-[0.78rem] text-[var(--text-3)] sm:px-6">
      مبني على منهج <a className="underline decoration-dotted" href={BRAND.kitUrl} target="_blank" rel="noreferrer">Motion Starter Kit</a> من Motalim (رخصة MIT) و Remotion.
    </div>
  </footer>
);

const FooterCol = ({ title, links }: { title: string; links: Array<[string, string]> }) => (
  <div>
    <h3 className="mb-3 text-[0.85rem] font-semibold text-[var(--text-3)]">{title}</h3>
    <ul className="flex flex-col gap-2 text-[0.92rem]">
      {links.map(([to, label]) => (
        <li key={to}>
          <a href={href(to)} className="text-[var(--text-2)] hover:text-[var(--text)]">
            {label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);
