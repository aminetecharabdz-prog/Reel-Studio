import { useEffect, useState } from 'react';

/** Hash router: survives refresh on GitHub Pages (SPEC §2.1). */
const parse = () => {
  const h = window.location.hash.replace(/^#/, '') || '/';
  const [path = '/', query = ''] = h.split('?');
  return { path, query: new URLSearchParams(query) };
};

export const navigate = (to: string) => {
  window.location.hash = to;
  window.scrollTo({ top: 0 });
};

export const useRoute = () => {
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => setR(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
};

export const match = (pattern: string, path: string): Record<string, string> | null => {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.startsWith(':')) params[a[i]!.slice(1)] = decodeURIComponent(b[i]!);
    else if (a[i] !== b[i]) return null;
  }
  return params;
};
