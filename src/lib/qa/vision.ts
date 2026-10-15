/** Vision QA loop (SPEC §8.2): stills → Claude vision → targeted fixes → re-check (max 2 loops). */
import type { Project } from '../schema/project';
import type { CompiledReel } from '../timing/types';
import { renderStill } from '../render/export';
import { getKeys } from '../providers/keys';
import { claudeVisionQA } from '../providers/claude';
import { replanScene } from '../director/localDirector';
import { projectImageRefs, resolveMedia, compileProject } from '../studio';
import { repo } from '../repo/db';

const toB64 = async (b: Blob) => {
  const buf = new Uint8Array(await b.arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
};

export const runVisionQA = async (project: Project, reel0: CompiledReel, onMsg: (m: string) => void): Promise<Project> => {
  const keys = await getKeys();
  if (!keys.anthropic) throw new Error('الفحص البصري يحتاج مفتاح Claude (الإعدادات).');
  let p = project;
  let reel = reel0;
  const log: Project['qa'] = [];
  for (let loop = 0; loop < 2; loop++) {
    onMsg(`تصوير اللقطات (${loop + 1}/2)…`);
    const stills: Array<{ scene: number; png: string; said: string }> = [];
    for (const s of reel.scenes) {
      const frame = Math.min(reel.durationInFrames - 1, s.from + Math.min(s.duration - 1, Math.round(reel.fps * 0.9)));
      stills.push({ scene: s.index, png: await toB64(await renderStill(reel, frame, 0.3)), said: s.words.map((w) => w.text).join(' ') });
    }
    onMsg('Claude يفحص اللقطات…');
    const issues = await claudeVisionQA(keys.anthropic, stills, p.id);
    const errors = issues.filter((i) => i.severity === 'error');
    log.push(...issues.map((i) => ({ check: `vision:${i.kind}`, severity: i.severity, sceneId: reel.scenes[i.scene]?.id, message: `المشهد ${i.scene + 1}: ${i.message}`, fixed: false })));
    if (errors.length === 0 || !p.plan || !p.transcript || !p.dna) break;
    onMsg('إصلاح المشاهد…');
    let plan = p.plan;
    let dna = p.dna;
    for (const e of errors) {
      const s = plan.scenes[e.scene];
      if (!s || s.locked) continue;
      if (e.kind === 'meaning-mismatch' || e.kind === 'composition') plan = replanScene({ transcript: p.transcript, dna, mode: p.mode, pacing: p.style.pacing, seed: Date.now() % 1e6, product: p.product, images: projectImageRefs(p) }, plan, s.id, (Date.now() + e.scene) % 1e6);
      else if (e.kind === 'unreadable') plan = { ...plan, scenes: plan.scenes.map((x) => (x.id === s.id ? { ...x, variant: (x.variant + 1) % 3, content: { ...x.content, headline: x.content.headline?.split(/\s+/).slice(0, 3).join(' '), sub: undefined } } : x)) };
      else if (e.kind === 'arabic-shaping' || e.kind === 'reading-order') dna = { ...dna, typography: { ...dna.typography, latin: undefined, display: { family: 'cairo', weight: 800 } } };
      const lg = log.find((l) => l.sceneId === s.id && l.check === `vision:${e.kind}`);
      if (lg) lg.fixed = true;
    }
    p = { ...p, plan, dna };
    const media = await resolveMedia(p);
    reel = compileProject(p, media) ?? reel;
  }
  const next = { ...p, qa: [...p.qa.filter((q) => !q.check.startsWith('vision')), ...log] };
  await repo.saveProject(next);
  return next;
};
