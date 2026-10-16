import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { applyTheme } from '@/data/settings';
import { App } from './app/App';

applyTheme();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
