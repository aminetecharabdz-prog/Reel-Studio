import { useEffect, useState } from 'react';
import { useRoute } from './router';
import { QA } from './pages/QA';
import { Landing } from './pages/Landing';
import { New } from './pages/New';
import { Studio, ensureDemoProject } from './pages/Studio';
import { Settings } from './pages/Settings';
import { Projects } from './pages/Projects';
import { Credits } from './pages/Credits';
import { Spinner } from './ui/kit';

const DemoRoute = ({ id }: { id: string }) => {
  const [pid, setPid] = useState<string | null>(null);
  useEffect(() => { ensureDemoProject(id).then(setPid); }, [id]);
  if (!pid) return <div className="grid h-dvh place-items-center"><Spinner size={28} /></div>;
  return <Studio id={pid} q={new URLSearchParams()} />;
};

export const App = () => {
  const r = useRoute();
  const [a, b] = r.parts;
  switch (a) {
    case 'qa': return <QA q={r.q} />;
    case 'new': return <New key={r.q.toString()} q={r.q} />;
    case 'p': return b ? <Studio key={b} id={b} q={r.q} /> : <Projects />;
    case 'demo': return <DemoRoute key={b} id={b ?? 'content'} />;
    case 'settings': return <Settings />;
    case 'projects': return <Projects />;
    case 'credits': return <Credits />;
    default: return <Landing />;
  }
};
