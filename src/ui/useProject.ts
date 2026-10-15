import { useCallback, useEffect, useState } from 'react';
import type { Project } from '@/lib/schema/project';
import { repo } from '@/lib/repo/db';
import { DEMO_REV, demoProject, type DemoId } from '@/lib/demos';
import { generateProject, loadDemoTranscript, resolveMedia, compileProject, type MediaUrls } from '@/lib/studio';
import type { CompiledReel } from '@/lib/timing/types';
import { publicUrl } from '@/lib/audio/library';
import { analyzeBuffer, decodeAudio } from '@/lib/audio/analyze';
import { proposeCuts } from '@/lib/mode-c';

/** Create the demo project on first open (local director — no key needed). */
export const ensureDemo = async (id: DemoId): Promise<Project> => {
  const existing = await repo.getProject(`demo-${id}`);
  if (existing?.plan && existing.dna && existing.transcript && existing.demoRev === DEMO_REV) return existing;
  let p = existing ?? demoProject(id);
  if (!p.transcript) p = { ...p, transcript: await loadDemoTranscript(id) };
  if (p.mode === 'C' && p.cuts.length === 0 && p.media.publicVideo && p.transcript) {
    // propose silence/filler cuts from the demo footage's audio, like for an upload
    try {
      const blob = await (await fetch(publicUrl(p.media.publicVideo))).blob();
      const info = analyzeBuffer(await decodeAudio(blob));
      p = { ...p, cuts: proposeCuts(p.transcript, info.voiced) };
    } catch (e) {
      console.warn('cut detection unavailable', e);
    }
  }
  await repo.saveProject(p);
  return generateProject(p, () => undefined);
};

export const useProject = (id: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!id) return;
    (async () => {
      try {
        const p = id.startsWith('demo-') ? await ensureDemo(id.slice(5) as DemoId) : await repo.getProject(id);
        if (!alive) return;
        if (p) setProject(p);
        else setError('المشروع غير موجود');
      } catch (e) {
        if (alive) setError(String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);
  const save = useCallback(async (next: Project) => {
    setProject(next);
    await repo.saveProject(next);
  }, []);
  return { project, setProject, save, error };
};

/** Compiled reel for a project (recomputed when the project changes). */
export const useReel = (project: Project | null, opts: { showSafeZone?: boolean } = {}) => {
  const [media, setMedia] = useState<MediaUrls | null>(null);
  const [reel, setReel] = useState<CompiledReel | null>(null);
  useEffect(() => {
    let alive = true;
    if (!project) return;
    resolveMedia(project).then((m) => alive && setMedia(m));
    return () => {
      alive = false;
    };
  }, [project]);
  useEffect(() => {
    if (!project || !media) return;
    try {
      setReel(compileProject(project, media, opts));
    } catch (e) {
      console.error(e);
      setReel(null);
    }
  }, [project, media, opts.showSafeZone]); // eslint-disable-line react-hooks/exhaustive-deps
  return { reel, media };
};
