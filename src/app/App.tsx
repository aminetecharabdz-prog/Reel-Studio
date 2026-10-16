import { lazy, Suspense, useEffect } from 'react';
import { applyTheme } from '@/data/settings';
import { Loader } from '@/ui/Logo';
import { Landing } from '@/pages/Landing';
import { NotFoundInline, StylePage, StylesPage } from '@/pages/Styles';
import { Shell } from './Shell';
import { useRoute } from './router';

const SettingsPage = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.SettingsPage })));
const ProjectsPage = lazy(() => import('@/pages/Projects').then((m) => ({ default: m.ProjectsPage })));
const BrandKitPage = lazy(() => import('@/pages/BrandKit').then((m) => ({ default: m.BrandKitPage })));
const Studio = lazy(() => import('@/studio/Studio').then((m) => ({ default: m.Studio })));
const HelpPage = lazy(() => import('@/pages/Info').then((m) => ({ default: m.HelpPage })));
const AboutPage = lazy(() => import('@/pages/Info').then((m) => ({ default: m.AboutPage })));
const LegalPage = lazy(() => import('@/pages/Info').then((m) => ({ default: m.LegalPage })));

export const App = () => {
  const route = useRoute();
  useEffect(() => applyTheme(), []);
  const [a, b] = route.parts;
  let page: React.ReactNode;
  let bare = false;
  switch (a) {
    case undefined:
      page = <Landing />;
      break;
    case 'styles':
      page = b ? <StylePage id={b} /> : <StylesPage />;
      break;
    case 'create':
      page = <Studio route={route} />;
      bare = true;
      break;
    case 'projects':
      page = <ProjectsPage />;
      break;
    case 'brand':
      page = <BrandKitPage />;
      break;
    case 'settings':
      page = <SettingsPage />;
      break;
    case 'help':
      page = <HelpPage />;
      break;
    case 'about':
      page = <AboutPage />;
      break;
    case 'terms':
    case 'privacy':
      page = <LegalPage kind={a} />;
      break;
    default:
      page = <NotFoundInline />;
  }
  return (
    <Shell route={route} bare={bare}>
      <Suspense fallback={<Loader />}>{page}</Suspense>
    </Shell>
  );
};
