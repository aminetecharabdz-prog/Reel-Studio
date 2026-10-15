import { useEffect, useState } from 'react';
import { Logo } from './brand/Logo';
import { match, navigate, useRoute } from './router';
import { useT } from './i18n/ar';
import { getKeys, isDemoMode } from '@/lib/providers/keys';
import { HomePage } from './pages/Home';
import { ProjectPage } from './pages/Project';
import { NewProjectPage } from './pages/NewProject';
import { SettingsPage } from './pages/Settings';
import { AdminPage } from './pages/Admin';
import { QAPage } from './pages/QA';
import { cx } from './components/ui';

const useDemoMode = () => {
  const [demo, setDemo] = useState(true);
  useEffect(() => {
    const check = () => getKeys().then((k) => setDemo(isDemoMode(k)));
    check();
    window.addEventListener('keys-changed', check);
    return () => window.removeEventListener('keys-changed', check);
  }, []);
  return demo;
};

const NavIcon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export const App = () => {
  const { path } = useRoute();
  const t = useT();
  const demo = useDemoMode();
  let page: React.ReactNode;
  let p: Record<string, string> | null;
  if ((p = match('/p/:id', path))) page = <ProjectPage id={p.id!} />;
  else if (path === '/new') page = <NewProjectPage />;
  else if (path === '/settings') page = <SettingsPage />;
  else if (path === '/admin') page = <AdminPage />;
  else if (path === '/qa') return <QAPage />;
  else page = <HomePage />;
  const tab = path.startsWith('/new') ? 'new' : path.startsWith('/settings') ? 'settings' : path === '/' ? 'home' : '';
  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-night/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <a href="#/" aria-label="الرئيسية" className="text-[17px]"><Logo size={34} /></a>
          <div className="flex items-center gap-2">
            {demo && (
              <button onClick={() => navigate('/settings')} className="flex h-9 items-center gap-1.5 rounded-full bg-mint/12 px-3 text-[13px] font-bold text-mint ring-1 ring-mint/30" title={t.appDemoModeHint}>
                <span className="h-2 w-2 rounded-full bg-mint" />
                {t.appDemoMode}
              </button>
            )}
          </div>
        </div>
      </header>
      <main>{page}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line/60 bg-night/95 backdrop-blur pb-[env(safe-area-inset-bottom)]" aria-label="التنقل">
        <div className="mx-auto grid h-16 max-w-md grid-cols-3">
          {[
            { id: 'home', href: '#/', label: t.navHome, icon: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
            { id: 'new', href: '#/new', label: t.navNew, icon: 'M12 5v14M5 12h14' },
            { id: 'settings', href: '#/settings', label: t.navSettings, icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' },
          ].map((n) => (
            <a key={n.id} href={n.href} className={cx('flex flex-col items-center justify-center gap-0.5 text-[12px] font-bold', tab === n.id ? 'text-ink' : 'text-muted')}>
              {n.id === 'new' ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-white"><NavIcon d={n.icon} /></span>
              ) : (
                <NavIcon d={n.icon} />
              )}
              {n.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};
