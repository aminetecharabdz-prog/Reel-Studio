import { useEffect, useRef, useState } from 'react';
import type { PlayerRef } from '@remotion/player';
import { useT } from '../i18n/ar';
import { useProject, useReel } from '../useProject';
import { ReelPlayer } from '../components/ReelPlayer';
import { Button, Panel, ProgressBar, Pulse, cx, Toggle } from '../components/ui';
import { generateProject, type Stage } from '@/lib/studio';
import { exportMp4, renderStill, toSrt, download, type ExportQuality } from '@/lib/render/export';
import { ScenesTab } from './project/ScenesTab';
import { StyleTab } from './project/StyleTab';
import { TextTab } from './project/TextTab';
import { VersionsTab } from './project/VersionsTab';
import { QATab } from './project/QATab';
import { navigate } from '../router';
import type { Project } from '@/lib/schema/project';
import { repo } from '@/lib/repo/db';

const STAGES: Array<{ id: Stage; label: string }> = [
  { id: 'transcribe', label: 'التفريغ' },
  { id: 'design', label: 'التصميم' },
  { id: 'plan', label: 'تخطيط المشاهد' },
  { id: 'assets', label: 'الصور والأصوات' },
  { id: 'qa', label: 'الفحص التلقائي' },
];

const GenerateProgress = ({ stage }: { stage: Stage }) => {
  const idx = STAGES.findIndex((s) => s.id === stage);
  return (
    <Panel className="space-y-3">
      <div className="flex items-center gap-3 font-bold"><Pulse /> جارٍ صنع الفيديو…</div>
      <ol className="space-y-2">
        {STAGES.map((s, i) => (
          <li key={s.id} className={cx('flex items-center gap-2 text-[15px]', i < idx ? 'text-mint' : i === idx ? 'text-ink font-bold' : 'text-muted')}>
            <span className={cx('h-2.5 w-2.5 rounded-full', i < idx ? 'bg-mint' : i === idx ? 'bg-rose' : 'bg-line')} />
            {s.label}
          </li>
        ))}
      </ol>
    </Panel>
  );
};

const ExportPanel = ({ project, reel }: { project: Project; reel: NonNullable<ReturnType<typeof useReel>['reel']> }) => {
  const t = useT();
  const [busy, setBusy] = useState<ExportQuality | null>(null);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Blob | null>(null);
  const abort = useRef<AbortController | null>(null);
  const run = async (q: ExportQuality) => {
    setBusy(q);
    setError(null);
    setDone(null);
    setProgress(0);
    abort.current = new AbortController();
    try {
      const blob = await exportMp4(reel, q, (p, e) => {
        setProgress(p);
        setEta(e);
      }, abort.current.signal);
      setDone(blob);
      download(blob, `${project.name.replace(/\s+/g, '-')}-${q}.mp4`);
    } catch (e) {
      if (!abort.current.signal.aborted) setError(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(null);
    }
  };
  return (
    <Panel className="space-y-3">
      <div className="font-display text-[20px] font-bold">{t.export}</div>
      {busy ? (
        <div className="space-y-2" data-testid="export-progress">
          <div className="flex items-center justify-between text-sm"><span className="font-bold">{t.exporting}</span><span>{Math.round(progress * 100)}%{eta ? ` — ${Math.ceil(eta / 1000)} ث` : ''}</span></div>
          <ProgressBar value={progress} />
          <p className="text-[13px] text-muted">{t.keepOpen}</p>
          <Button size="sm" variant="ghost" onClick={() => abort.current?.abort()}>{t.cancel}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => run('fast')} data-testid="export-fast">{t.exportFast}</Button>
          <Button variant="soft" onClick={() => run('hd')}>{t.exportHd}</Button>
        </div>
      )}
      {done && (
        <div className="flex items-center justify-between rounded-xl bg-mint/10 p-3 text-mint" data-testid="export-done">
          <span className="font-bold">تم التصدير ✓ ({(done.size / 1e6).toFixed(1)} MB)</span>
          <Button size="sm" variant="ghost" onClick={() => download(done, `${project.name}.mp4`)}>نزّل مرة أخرى</Button>
        </div>
      )}
      {error && <p className="rounded-xl bg-rose/10 p-3 text-[14px] text-rose">تعذّر التصدير: {error}. جرّب «سريع 720p» أو استعمل Chrome محدّث.</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => download(new Blob([toSrt(reel)], { type: 'text/plain' }), `${project.name}.srt`)}>{t.downloadSrt}</Button>
        <Button size="sm" variant="ghost" onClick={async () => download(await renderStill(reel, reel.scenes[0] ? Math.min(reel.durationInFrames - 1, reel.scenes[0].from + 24) : 0, 1), `${project.name}.png`)}>{t.downloadThumb}</Button>
      </div>
    </Panel>
  );
};

type Tab = 'scenes' | 'style' | 'text' | 'versions' | 'qa';

export const ProjectPage = ({ id }: { id: string }) => {
  const t = useT();
  const { project, save, error, setProject } = useProject(id);
  const [safe, setSafe] = useState(false);
  const { reel } = useReel(project, { showSafeZone: safe });
  const [stage, setStage] = useState<Stage | null>(null);
  const [tab, setTab] = useState<Tab>('scenes');
  const [selected, setSelected] = useState<string | null>(null);
  const player = useRef<PlayerRef>(null);

  useEffect(() => {
    if (project && !project.transcript) navigate(`/new?project=${project.id}`);
  }, [project]);
  const autoStarted = useRef(false);
  useEffect(() => {
    if (project?.transcript && !project.plan && !autoStarted.current) {
      autoStarted.current = true;
      setStage('design');
      generateProject(project, (s) => setStage(s))
        .then(setProject)
        .catch((e) => alert(String(e)))
        .finally(() => setStage(null));
    }
  }, [project, setProject]);

  if (error) return <div className="mx-auto max-w-md p-6 text-rose">{error}</div>;
  if (!project) return <div className="mx-auto flex max-w-md items-center gap-3 p-6 text-muted"><Pulse /> {t.loading}</div>;

  const regenerate = async (newLook: boolean) => {
    setStage('design');
    try {
      const next = await generateProject(project, (s) => setStage(s), { newLook });
      setProject(next);
    } finally {
      setStage(null);
    }
  };
  const seekScene = (sceneId: string) => {
    setSelected(sceneId);
    const s = reel?.scenes.find((x) => x.id === sceneId);
    if (s) player.current?.seekTo(s.from + Math.min(20, Math.floor(s.duration / 2)));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-bold text-lilac">{project.mode === 'A' ? t.modeA : project.mode === 'B' ? t.modeB : t.modeC}{project.demo ? ` · ${t.demoVoiceBadge}` : ''}</div>
          <h1 className="font-display text-[26px] leading-tight font-bold">{project.name}</h1>
        </div>
        {!project.demo && (
          <Button size="sm" variant="danger" onClick={async () => { if (confirm('حذف المشروع؟')) { await repo.deleteProject(project.id); navigate('/'); } }}>{t.delete}</Button>
        )}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-3 md:sticky md:top-20 md:self-start">
          <div className="mx-auto w-full max-w-[380px]">
            {stage ? <GenerateProgress stage={stage} /> : project.plan ? <ReelPlayer ref={player} reel={reel} /> : (
              <Panel className="space-y-3 text-center">
                <p className="text-muted">النص جاهز. اضغط لصنع الفيديو.</p>
                <Button size="lg" onClick={() => regenerate(false)} data-testid="generate">{t.generate}</Button>
              </Panel>
            )}
          </div>
          {project.plan && !stage && (
            <>
              <div className="flex items-center gap-2">
                <Button variant="soft" className="flex-1" onClick={() => regenerate(true)} data-testid="new-version">{t.regenerate}</Button>
              </div>
              <Toggle checked={safe} onChange={setSafe} label="أظهر مناطق الأمان (أزرار المنصات)" />
              {reel && <ExportPanel project={project} reel={reel} />}
            </>
          )}
        </div>
        {project.plan && (
          <div>
            <div role="tablist" className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
              {([['scenes', t.scenes], ['style', t.style], ['text', t.text], ['versions', t.versions], ['qa', t.qa]] as Array<[Tab, string]>).map(([k, label]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cx('h-10 flex-none rounded-full px-4 text-sm font-bold', tab === k ? 'bg-ink text-night' : 'bg-surface text-muted ring-1 ring-line')}>
                  {label}{k === 'qa' && project.qa.filter((q) => !q.fixed && q.severity === 'error').length ? ' •' : ''}
                </button>
              ))}
            </div>
            {tab === 'scenes' && <ScenesTab project={project} reel={reel} selected={selected} onSelect={seekScene} onChange={save} />}
            {tab === 'style' && <StyleTab project={project} onChange={save} onReplan={() => regenerate(true)} />}
            {tab === 'text' && <TextTab project={project} onChange={save} />}
            {tab === 'versions' && <VersionsTab project={project} onChange={save} />}
            {tab === 'qa' && <QATab project={project} reel={reel} onChange={save} />}
          </div>
        )}
      </div>
    </div>
  );
};
