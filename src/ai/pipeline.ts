/** Project → transcript → AI plan → generated images. Every step degrades gracefully without keys (demo mode). */
import type { Plan, Src, Transcript } from '@/engine/schema';
import { getSettings } from '@/data/settings';
import { cacheGet, cacheSet, getAsset, hash, putAsset, putProject } from '@/data/db';
import type { Project } from '@/data/project';
import { directWithClaude, AIError } from './claude';
import { localDirector } from './local';
import { generateImage } from './gemini';
import { cutout } from './cutout';
import { audioDuration, estimateTranscript, scribe, tts } from './speech';

export type Step = 'listen' | 'voice' | 'direct' | 'repair' | 'images' | 'done';
export type Progress = (s: { step: Step; detail?: string; ratio?: number }) => void;

export const transcribe = async (p: Project, on: Progress): Promise<{ transcript: Transcript; voiceAsset?: string }> => {
  const s = getSettings();
  const lang = s.defaults.language;
  const mediaId = p.mode === 'talking' ? p.videoAsset : p.voiceAsset;
  if (mediaId) {
    const a = await getAsset(mediaId);
    if (!a) throw new AIError('invalid', 'الملف الصوتي غير موجود');
    on({ step: 'listen' });
    if (s.keys.elevenlabs) {
      const ck = `stt:${mediaId}`;
      const hit = await cacheGet<Transcript>(ck);
      if (hit) return { transcript: hit };
      const t = await scribe(s.keys.elevenlabs, a.blob, lang, p.id);
      await cacheSet(ck, t);
      return { transcript: t };
    }
    if (!p.script.trim()) throw new AIError('key', 'بدون مفتاح ElevenLabs اكتب نص الكلام في خانة النص حتى نزامن الكلمات');
    return { transcript: estimateTranscript(p.script, await audioDuration(a.blob), lang) };
  }
  if (!p.script.trim()) throw new AIError('invalid', 'اكتب النص أو ارفع تسجيلا صوتيا');
  if (s.keys.elevenlabs) {
    on({ step: 'voice' });
    const { audio, transcript } = await tts(s.keys.elevenlabs, s.voiceId, p.script, p.id);
    const id = await putAsset(audio, 'voice.mp3');
    return { transcript, voiceAsset: id };
  }
  return { transcript: estimateTranscript(p.script, undefined, lang) };
};

const forEachSrc = (plan: Plan, fn: (s: Src) => void) => {
  for (const sc of plan.scenes) {
    if (sc.bg.image) fn(sc.bg.image);
    for (const l of sc.layers) if (l.type === 'image') fn(l.src);
  }
};

export const makeImages = async (p: Project, plan: Plan, on: Progress) => {
  const s = getSettings();
  const aspect = p.options.aspect;
  // user media cut-outs
  for (const [i, m] of p.media.entries()) {
    let needs = false;
    forEachSrc(plan, (src) => { if (src.kind === 'user' && src.index === i && src.cutout) needs = true; });
    if (!needs) continue;
    const ck = `cut:${m.assetId}`;
    let id = await cacheGet<string>(ck);
    if (!id) {
      const a = await getAsset(m.assetId);
      if (!a) continue;
      id = await putAsset(await cutout(a.blob).catch(() => a.blob), 'cutout.png');
      await cacheSet(ck, id);
    }
    forEachSrc(plan, (src) => { if (src.kind === 'user' && src.index === i && src.cutout) src.assetId = id!; });
  }
  // generated images
  const jobs: Src[] = [];
  forEachSrc(plan, (src) => { if (src.kind === 'generate' && src.prompt && !src.assetId) jobs.push(src); });
  const canGen = !!s.keys.gemini && s.imageQuality !== 'off';
  const todo = canGen ? jobs.slice(0, s.maxImages) : [];
  let done = 0;
  for (const src of todo) {
    on({ step: 'images', ratio: done / todo.length, detail: `${done + 1}/${todo.length}` });
    const key = await hash(`${src.prompt}|${src.cutout ? 'cut' : 'full'}|${aspect}`);
    let id: string | null = p.images[key] ?? (await cacheGet<string>(`img:${key}`));
    if (id && !(await getAsset(id))) id = null;
    if (!id) {
      try {
        const g = await generateImage({ key: s.keys.gemini, model: s.geminiModel, prompt: src.prompt!, aspect: src.cutout ? '1:1' : aspect, eco: s.imageQuality === 'eco', projectId: p.id });
        const blob = src.cutout ? await cutout(g.blob).catch(() => g.blob) : g.blob;
        id = await putAsset(blob, 'gen.png');
        await cacheSet(`img:${key}`, id);
        p.cost += g.usd;
      } catch (e) {
        if (e instanceof AIError && (e.code === 'key' || e.code === 'quota')) throw e;
        id = null;
      }
    }
    if (id) {
      p.images[key] = id;
      src.assetId = id;
    }
    done++;
  }
  // drop image layers that ended without a picture (bg falls back to its colour treatment)
  for (const sc of plan.scenes) {
    sc.layers = sc.layers.filter((l) => l.type !== 'image' || l.src.kind !== 'generate' || !!l.src.assetId);
    if (sc.bg.image?.kind === 'generate' && !sc.bg.image.assetId) {
      sc.bg.image = undefined;
      if (sc.bg.kind === 'photo' || sc.bg.kind === 'blur-photo') sc.bg.kind = sc.bg.tone === 'light' ? 'paper' : 'spotlight';
    }
  }
};

export const direct = async (p: Project, on: Progress, restyle?: string): Promise<Plan> => {
  const s = getSettings();
  const t = p.transcript!;
  const brand = s.brand.enabled ? { name: s.brand.name, colors: s.brand.colors, font: s.brand.font } : null;
  const cta = p.options.cta || (s.brand.enabled ? s.brand.cta : '');
  if (!s.keys.claude) return localDirector(t, { mode: p.mode, seed: restyle ? `${Date.now()}` : undefined, media: p.media.length, brandColors: brand?.colors, cta });
  on({ step: 'direct' });
  const { plan, usd } = await directWithClaude({
    key: s.keys.claude,
    model: s.claudeModel,
    effort: s.effort,
    transcript: t,
    projectId: p.id,
    onStatus: (x) => on({ step: x === 'repair' ? 'repair' : 'direct' }),
    brief: {
      mode: p.mode,
      words: t.words.map((w) => ({ id: w.id, text: w.text, startMs: w.startMs })),
      imagesAvailable: !!s.keys.gemini && s.imageQuality !== 'off',
      userMedia: p.media.map((m, index) => ({ index, label: m.label || (p.mode === 'product' ? 'product photo' : 'photo') })),
      brand,
      notes: p.notes,
      product: p.product,
      cta,
      restyle,
    },
  });
  p.cost += usd;
  return plan;
};

/** Full run. Saves the project after each step so a reload resumes. */
export const runProject = async (p: Project, on: Progress, opts: { restyle?: string; keepTranscript?: boolean } = {}) => {
  if (!p.transcript || !opts.keepTranscript) {
    const { transcript, voiceAsset } = await transcribe(p, on);
    p.transcript = transcript;
    if (voiceAsset) p.voiceAsset = voiceAsset;
    await putProject(p);
  }
  const plan = await direct(p, on, opts.restyle);
  await makeImages(p, plan, on);
  if (p.plan) p.history = [p.plan, ...p.history].slice(0, 6);
  p.plan = plan;
  p.status = 'ready';
  p.error = undefined;
  await putProject(p);
  on({ step: 'done' });
  return p;
};
