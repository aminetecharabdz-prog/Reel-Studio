import { useEffect, useState } from 'react';

/** Hash router (GitHub Pages friendly): #/path?query */
export type Route = { path: string; parts: string[]; query: URLSearchParams };

const parse = (): Route => {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [p = '/', q = ''] = raw.split('?');
  const path = p.startsWith('/') ? p : `/${p}`;
  return { path, parts: path.split('/').filter(Boolean), query: new URLSearchParams(q) };
};

export const useRoute = () => {
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => {
      setR(parse());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
};

export const go = (to: string) => {
  window.location.hash = to.startsWith('#') ? to : `#${to}`;
};

export const href = (to: string) => `#${to}`;
