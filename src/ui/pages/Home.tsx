import { useEffect, useState } from 'react';
import { useT } from '../i18n/ar';
import { navigate } from '../router';
import { Button, Panel, Pulse } from '../components/ui';
import { ReelPlayer } from '../components/ReelPlayer';
import { ensureDemo, useReel } from '../useProject';
import { DEMOS } from '@/lib/demos';
import { repo } from '@/lib/repo/db';
import type { Project } from '@/lib/schema/project';
import { LOGO_BARS } from '@/config/logo';

const MODE_ICON: Record<'A' | 'B' | 'C', string> = {
  A: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  B: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
  C: 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
};

const HeroReel = () => {
  const [p, setP] = useState<Project | null>(null);
  useEffect(() => {
    ensureDemo('dentist').then(setP).catch(console.error);
  }, []);
  const { reel } = useReel(p);
  return (
    <div className="relative mx-auto w-[min(78vw,320px)]">
      {/* the ن bowl of the logo, echoed behind the phone */}
      <svg viewBox="0 0 64 64" className="pointer-events-none absolute inset-x-0 -bottom-6 opacity-40" aria-hidden="true">
        <g stroke="url(#hero-g)" strokeWidth="2.4" strokeLinecap="round">
          {LOGO_BARS.map((b) => <line key={b.x} x1={b.x} y1={b.y1} x2={b.x} y2={b.y2} />)}
        </g>
        <defs><linearGradient id="hero-g" gradientUnits="userSpaceOnUse" x1="10" x2="54" y1="0" y2="0"><stop offset="0" stopColor="#3CE3B4" /><stop offset="1" stopColor="#FF3E7A" /></linearGradient></defs>
      </svg>
      <div className="relative rounded-[34px] bg-[#0b0710] p-2.5 shadow-[0_30px_80px_-20px_rgba(255,62,122,0.35)] ring-1 ring-line">
        <ReelPlayer reel={reel} autoPlay muted loop controls clickToPlay rounded />
      </div>
    </div>
  );
};

export const HomePage = () => {
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    repo.listProjects().then((ps) => setProjects(ps.filter((p) => !p.demo)));
  }, []);
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="grid items-center gap-8 pt-8 pb-12 md:grid-cols-[1.1fr_1fr] md:pt-14">
        <div>
          <h1 className="font-display text-[44px] leading-[1.15] font-bold md:text-[60px]">{t.heroTitle}</h1>
          <p className="mt-4 max-w-[34rem] text-[17px] leading-8 text-muted">{t.heroSub}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/new')}>{t.heroCta}</Button>
            <Button size="lg" variant="ghost" onClick={() => document.getElementById('demos')?.scrollIntoView({ behavior: 'smooth' })}>{t.heroSecondary}</Button>
          </div>
        </div>
        <HeroReel />
      </section>

      <section className="pb-12">
        <h2 className="font-display text-[28px] font-bold">{t.modesTitle}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {(['A', 'B', 'C'] as const).map((m) => (
            <button key={m} onClick={() => navigate(`/new?mode=${m}`)} className="group rounded-[22px] border border-line bg-surface p-5 text-right transition-colors hover:border-lilac/60">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-raised text-lilac">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={MODE_ICON[m]} /></svg>
                </span>
                <span className="font-display text-[21px] font-bold">{t[`mode${m}`]}</span>
              </div>
              <p className="mt-3 text-[15px] leading-7 text-muted">{t[`mode${m}Desc`]}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="demos" className="scroll-mt-20 pb-12">
        <h2 className="font-display text-[28px] font-bold">{t.demosTitle}</h2>
        <p className="mt-1 text-muted">{t.demosSub}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {DEMOS.map((d) => (
            <a key={d.id} href={`#/p/demo-${d.id}`} className="flex items-center justify-between gap-3 rounded-[22px] border border-line bg-surface p-4 hover:border-mint/50">
              <div>
                <div className="text-[13px] font-bold text-lilac">{d.mode === 'B' ? t.modeB : d.mode === 'C' ? t.modeC : t.modeA}</div>
                <div className="font-display text-[20px] font-bold">{d.name}</div>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-raised px-2.5 py-0.5 text-[12px] text-muted">
                  <Pulse active={false} bars={5} /> {d.mode === 'C' ? 'فيديو اصطناعي تجريبي' : t.demoVoiceBadge}
                </div>
              </div>
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-rose text-white">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="pb-12">
        <h2 className="font-display text-[28px] font-bold">{t.yourProjects}</h2>
        {projects.length === 0 ? (
          <Panel className="mt-4 text-muted">{t.noProjects}</Panel>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {projects.map((p) => (
              <a key={p.id} href={`#/p/${p.id}`} className="rounded-[22px] border border-line bg-surface p-4 hover:border-lilac/50">
                <div className="text-[13px] text-muted">{p.mode === 'A' ? t.modeA : p.mode === 'B' ? t.modeB : t.modeC}</div>
                <div className="font-display text-[19px] font-bold">{p.name}</div>
                <div className="text-[13px] text-muted">{new Date(p.updatedAt).toLocaleString('ar-DZ')}</div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 pb-16 md:grid-cols-2">
        <div>
          <h2 className="font-display text-[28px] font-bold">{t.whyTitle}</h2>
          <dl className="mt-4 space-y-4">
            {([1, 2, 3, 4] as const).map((i) => (
              <div key={i} className="border-r-2 border-lilac/60 pr-4">
                <dt className="text-[17px] font-bold">{t[`why${i}`]}</dt>
                <dd className="text-[15px] leading-7 text-muted">{t[`why${i}d`]}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="font-display text-[28px] font-bold">{t.howTitle}</h2>
          <ol className="mt-4 space-y-3">
            {([1, 2, 3, 4] as const).map((i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-raised font-display font-bold text-mint">{i}</span>
                <span className="text-[16px] font-bold">{t[`how${i}`]}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};
