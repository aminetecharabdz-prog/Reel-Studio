import { useRoute } from './router';
import { QA } from './pages/QA';

export const App = () => {
  const r = useRoute();
  if (r.parts[0] === 'qa') return <QA q={r.q} />;
  return <div>Motiq</div>;
};
