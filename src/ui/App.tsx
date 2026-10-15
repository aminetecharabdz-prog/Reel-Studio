import { Logo } from './brand/Logo';
import { BRAND } from '@/config/brand';

export const App = () => (
  <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 py-6">
    <Logo />
    <h1 className="font-display text-4xl font-bold">{BRAND.taglineAr}</h1>
    <p className="text-muted">قيد البناء…</p>
  </main>
);
