import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './ui/App';
import { setUploadedFontLoader } from './lib/design/fonts';
import { repo } from './lib/repo/db';

setUploadedFontLoader(async (id) => (await (await repo.getAsset(id))?.blob.arrayBuffer()) ?? null);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
