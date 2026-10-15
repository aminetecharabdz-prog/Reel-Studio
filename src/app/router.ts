import { useEffect, useState } from 'react';

export type Route = { path: string; parts: string[]; q: URLSearchParams };
const parse = (): Route => {
  const h = location.hash.replace(/^#/, '') || '/';
  const [p = '/', qs = ''] = h.split('?');
  return { path: p, parts: p.split('/').filter(Boolean), q: new URLSearchParams(qs) };
};
export const useRoute = () => {
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => {
      setR(parse());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
};
export const go = (path: string) => {
  location.hash = path;
};
