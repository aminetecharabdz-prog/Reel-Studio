/**
 * Studio orchestration: media resolution, transcription, generation (DNA + plan + assets + QA),
 * compile to a CompiledReel. Each stage saves its output so a reloaded tab resumes (SPEC §4).
 */
import type { Project } from './schema/project';
import { PlanSchema, type ImageRef, type Plan } from './schema/plan';
import { DesignDNASchema, type DesignDNA } from './schema/dna';
import { TranscriptSchema, type Transcript } from './schema/transcript';
import { repo } from './repo/db';
import { getKeys, type Keys } from './providers/keys';
import { compileReel } from './timing/compiler';
import type { CompiledReel } from './timing/types';
import { designDNA, finalizeDNA } from './design/artDirector';
import { paletteFromImage } from './media';
import { detectTopic } from './design/topics';
import { planLocally, replanScene } from './director/localDirector';
import { sceneSignature } from './director/hero';
import { pickMusic, publicUrl, sfxSrc } from './audio/library';
import { checkPlan, checkReel, autoFixPlan } from './qa/checks';
import { DEMO_REV, demoImages, demoSeed } from './demos';
import { claudeDirector } from './providers/claude';
import { cachedImage, imageGenerator } from './providers/images';
import { elevenScribe } from './providers/elevenlabs';
import { openaiWhisper } from './providers/openai';
import { browserWhisper } from './providers/whisperBrowser';
import { hexToRgb, rgbToHsl } from './color/contrast';
import { uid } from './util/rng';
import { applyCuts } from './timing/cuts';

const urlCache = new Map<string, string>();
export const assetUrl = async (id: string | undefined): Promise<string | null> => {
  if (!id) return null;
  const hit = urlCache.get(id);
  if (hit) return hit;
  const a = await repo.getAsset(id);
  if (!a) return null;
  const u = URL.createObjectURL(a.blob);
  urlCache.set(id, u);
  return u;
};

export type MediaUrls = { voiceSrc: string | null; videoSrc: string | null; logoSrc: string | null; musicSrc: string | null; images: Map<string, string>; imageRefs: ImageRef[] };

/** User images in order (product photos / extra media), as refs the director can point to. */
export const projectImageRefs = (p: Project): ImageRef[] => {
  if (p.demo) return demoImages(p.demo).map((src) => ({ src: publicUrl(src) }));
  return p.media.extra.map((e) => ({ assetId: e.assetId }));
};

export const resolveMedia = async (p: Project): Promise<MediaUrls> => {
  const images = new Map<string, string>();
  const ids = new Set<string>();
  for (const e of p.media.extra) ids.add(e.assetId);
  for (const s of p.plan?.scenes ?? []) {
    if (s.content.image?.assetId) ids.add(s.content.image.assetId);
    if (s.content.hero?.image?.assetId) ids.add(s.content.hero.image.assetId);
    for (const im of s.content.images ?? []) if (im.assetId) ids.add(im.assetId);
  }
  if (p.brand.logoAssetId) ids.add(p.brand.logoAssetId);
  for (const id of ids) {
    const u = await assetUrl(id);
    if (u) images.set(id, u);
  }
  const musicUpload = p.style.music.trackId === 'upload' ? await assetUrl(p.style.music.assetId) : null;
  return {
    voiceSrc: p.media.publicAudio ? publicUrl(p.media.publicAudio) : await assetUrl(p.media.voiceAssetId),
    videoSrc: p.media.publicVideo ? publicUrl(p.media.publicVideo) : await assetUrl(p.media.videoAssetId),
    logoSrc: (await assetUrl(p.brand.logoAssetId)) ?? null,
    musicSrc: musicUpload ?? (p.dna ? pickMusic(p.dna, p.style.music.trackId) : null),
    images,
    imageRefs: projectImageRefs(p),
  };
};

/** Demo art/scene direction authored by Claude and stored as a fixture (QUALITY_BAR: demos are Claude-quality). */
export const loadDemoDirection = async (demo: string): Promise<{ dna: DesignDNA; plan: Plan } | null> => {
  try {
    const res = await fetch(publicUrl(`demo/${demo}.direction.json`));
    if (!res.ok) return null;
    const json = (await res.json()) as { dna: unknown; plan: unknown };
    const plan = PlanSchema.parse(json.plan);
    for (const sc of plan.scenes) {
      const im = sc.content.hero?.image;
      if (im?.src && !/^(https?:|blob:|data:)/.test(im.src)) im.src = publicUrl(im.src);
    }
    return { dna: finalizeDNA(DesignDNASchema.parse(json.dna)), plan };
  } catch (e) {
    console.warn('demo direction unavailable', e);
    return null;
  }
};

export const loadDemoTranscript = async (demo: string): Promise<Transcript> => {
  const res = await fetch(publicUrl(`demo/${demo}.transcript.json`));
  return TranscriptSchema.parse(await res.json());
};

export const compileProject = (p: Project, m: MediaUrls, opts: { showSafeZone?: boolean; aspect?: Project['style']['aspect'] } = {}): CompiledReel | null => {
  if (!p.transcript || !p.dna || !p.plan) return null;
  const style = opts.aspect ? { ...p.style, aspect: opts.aspect } : p.style;
  const reel = compileReel({
    mode: p.mode,
    transcript: p.transcript,
    cuts: p.cuts,
    dna: p.dna,
    plan: p.plan,
    style,
    media: { voiceSrc: m.voiceSrc, videoSrc: m.videoSrc, musicSrc: m.musicSrc, logoSrc: m.logoSrc },
    resolveImage: (r) => (r.src ? { src: r.src } : r.assetId && m.images.get(r.assetId) ? { src: m.images.get(r.assetId)! } : null),
    sfxSrc,
    showSafeZone: opts.showSafeZone,
  });
  // the end card shows the brand logo when there is one
  if (m.logoSrc) for (const s of reel.scenes) if (s.isEndCard) s.images = [{ src: m.logoSrc }];
  return reel;
};

export type Stage = 'transcribe' | 'plan' | 'design' | 'assets' | 'qa' | 'done';

/** Transcribe the project's voice/video with the configured provider. */
export const transcribeProject = async (p: Project, onMsg?: (m: string) => void): Promise<Transcript> => {
  if (p.demo) return loadDemoTranscript(p.demo);
  const keys = await getKeys();
  const id = p.media.voiceAssetId ?? p.media.videoAssetId;
  const asset = id ? await repo.getAsset(id) : undefined;
  if (!asset) throw new Error('ارفع ملف الصوت أو الفيديو أولاً');
  const durationMs = Number(asset.meta?.durationMs ?? 0) || undefined;
  const opts = { vocabulary: p.media.vocabulary, durationMs, projectId: p.id };
  if (keys.sttProvider !== 'openai' && keys.elevenlabs) {
    try {
      return await elevenScribe(keys.elevenlabs).transcribe(asset.blob, opts);
    } catch (e) {
      // a blocked browser call (CORS/network) surfaces as TypeError: fall back instead of failing
      if (!(e instanceof TypeError)) throw e;
      onMsg?.('تعذّر الاتصال بـ ElevenLabs من المتصفح — نجرّب بديلًا…');
    }
  }
  if (keys.openai) return openaiWhisper(keys.openai).transcribe(asset.blob, opts);
  return browserWhisper(onMsg).transcribe(asset.blob, opts);
};

const avoidFrom = async () => (await repo.recentFingerprints(10)).map((f) => ({ mood: f.mood, easing: f.easing, sequence: f.sequence, hue: f.hue }));

/** Generate Design DNA + scene plan (Claude when a key is present, else the local directors), resolve assets, run QA + auto-fix. */
export const generateProject = async (p: Project, onStage: (s: Stage, note?: string) => void, opts: { newLook?: boolean } = {}): Promise<Project> => {
  if (!p.transcript) throw new Error('no transcript');
  const keys: Keys = await getKeys();
  const text = `${p.media.idea} ${p.transcript.words.map((w) => w.text).join(' ')}`;
  const { topic } = detectTopic(text, p.business);
  const recent = await avoidFrom();
  const seed = opts.newLook || !p.demo ? Math.floor(Math.random() * 1e6) : demoSeed(p.demo);
  const imageRefs = projectImageRefs(p);
  const refAsset = p.style.referenceAssetId ? await repo.getAsset(p.style.referenceAssetId) : undefined;
  let dna: DesignDNA;
  let plan: Plan;
  // mode C: plan on what remains after the cuts (fillers never become on-screen text); word ids are unchanged
  const planTranscript = p.mode === 'C' ? applyCuts(p.transcript, p.cuts).transcript : p.transcript;
  onStage('design');
  const fixture = p.demo && !opts.newLook ? await loadDemoDirection(p.demo) : null;
  if (fixture) {
    onStage('plan', 'Claude');
    dna = fixture.dna;
    plan = fixture.plan;
  } else if (keys.anthropic) {
    onStage('plan', 'Claude');
    const res = await claudeDirector(keys.anthropic, p.brand, imageRefs).direct({
      transcript: planTranscript,
      mode: p.mode,
      topicHint: topic,
      idea: p.media.idea,
      business: p.business,
      visualStyle: p.style.visualStyle,
      artDirection: p.style.artDirection,
      pacing: p.style.pacing,
      brandColors: p.brand.enabled ? p.brand.colors : [],
      product: p.product ? { name: p.product.name, price: p.product.price, oldPrice: p.product.oldPrice, currency: p.product.currency, offer: p.product.offer, deliveryWilayas: p.product.deliveryWilayas, cod: p.product.cod, phone: p.product.phone } : undefined,
      userImages: imageRefs.map((_, i) => ({ index: i, note: p.media.extra[i]?.note ?? '' })),
      avoid: recent.map(({ mood, easing, sequence }) => ({ mood, easing, sequence })),
      seed,
      projectId: p.id,
      referenceImage: refAsset ? { base64: await blobToB64(refAsset.blob), mime: refAsset.mime || 'image/jpeg' } : undefined,
      imageGen: !!imageGenerator(keys),
      speakerFootage: p.mode === 'A' && !!p.media.videoAssetId,
    });
    dna = res.dna;
    plan = res.plan;
  } else {
    dna = designDNA({
      topic,
      seed,
      visualStyle: p.style.visualStyle === 'auto' ? undefined : p.style.visualStyle,
      artDirection: p.style.artDirection,
      brand: p.brand,
      avoid: recent.length && !p.demo ? { moods: recent.map((r) => r.mood), easings: recent.slice(0, 2).map((r) => r.easing), hues: recent.map((r) => r.hue) } : undefined,
    });
    // reference image without AI: take its palette (brand colours still win)
    if (refAsset && !p.brand.enabled) {
      try {
        const cols = await paletteFromImage(refAsset.blob);
        if (cols.length >= 2) dna = finalizeDNA(dna, { enabled: true, colors: cols.slice(0, 2) });
      } catch {
        /* keep the topic palette */
      }
    }
    onStage('plan');
    plan = planLocally({ transcript: planTranscript, dna, mode: p.mode, pacing: p.style.pacing, seed, product: p.product, images: imageRefs, speakerFootage: p.mode === 'A' && !!p.media.videoAssetId, recentSequences: p.demo ? [] : recent.map((r) => r.sequence) });
  }
  // keep scenes the user locked: they replace whatever the new plan put over the same words
  const locked = (p.plan?.scenes ?? []).filter((s) => s.locked);
  if (locked.length) {
    const order = new Map(p.transcript.words.map((w, i) => [w.id, i]));
    const range = (s: { from: string; to: string }) => [order.get(s.from) ?? -1, order.get(s.to) ?? -1] as const;
    let scenes = plan.scenes.filter((s) => !locked.some((l) => { const [a, b] = range(l); const [c, d] = range(s); return c <= b && d >= a; }));
    scenes = [...scenes, ...locked].sort((x, y) => range(x)[0] - range(y)[0]).map((s, i) => ({ ...s, id: s.locked ? s.id : `s${i}` }));
    plan = { ...plan, scenes };
  }
  // assets: generate images the plan asked for (cached by prompt hash)
  onStage('assets');
  const gen = imageGenerator(keys);
  // consistency (QUALITY_BAR): every generated image gets the same references — the user's product photos,
  // else a style sheet generated once per video (character + palette + illustration style)
  let refs: Blob[] = [];
  const wanted = plan.scenes.some((s) => [s.content.image, s.content.hero?.image].some((im) => im?.prompt && !im.assetId && !im.src));
  if (gen && wanted) {
    const userBlobs = (await Promise.all(p.media.extra.slice(0, 3).map((e) => repo.getAsset(e.assetId)))).filter(Boolean).map((a) => a!.blob);
    refs = userBlobs;
    if (!refs.length) {
      try {
        const sheetId = await cachedImage(gen, `Style reference sheet for a short vertical video about: ${p.media.idea || topic}. ${dna.illustrationStyle}. Colour palette ${[...dna.palette.bg, dna.palette.primary, dna.palette.accent].join(', ')}. If people appear: one consistent friendly Algerian character, front and three-quarter views. Clean background.`, '1:1', p.id);
        const sheet = await repo.getAsset(sheetId);
        if (sheet) refs = [sheet.blob];
      } catch (e) {
        console.warn('style sheet failed', e);
      }
    }
  }
  for (const s of plan.scenes) {
    for (const im of [s.content.image, s.content.hero?.image]) {
    if (im?.prompt && !im.assetId && !im.src) {
      if (gen) {
        try {
          im.assetId = await cachedImage(gen, `${im.prompt}. Style: ${dna.illustrationStyle}. Keep the same character / product and style as the reference images.`, p.style.aspect === '1:1' ? '1:1' : '4:5', p.id, refs);
        } catch (e) {
          console.warn('image generation failed', e);
        }
      }
    }
    }
  }
  // QA: deterministic checks + auto-fix (max 2 passes)
  onStage('qa');
  let issues = checkPlan(plan, planTranscript, p.mode);
  const fixedAll = [] as Project['qa'];
  for (let pass = 0; pass < 2 && issues.some((i) => i.severity === 'error' || ['anchors', 'repetition', 'bg-variety', 'headline-long'].includes(i.check)); pass++) {
    const r = autoFixPlan(plan, planTranscript, issues);
    plan = r.plan;
    fixedAll.push(...r.fixed);
    issues = checkPlan(plan, planTranscript, p.mode);
  }
  const next: Project = { ...p, dna, plan, stage: 'ready', demoRev: p.demo ? DEMO_REV : p.demoRev };
  const media = await resolveMedia(next);
  const reel = compileProject(next, media);
  const reelIssues = reel ? checkReel(reel, p.transcript) : [];
  next.qa = [...fixedAll, ...issues, ...reelIssues];
  next.versions = [...p.versions, { id: uid('v_'), createdAt: Date.now(), label: keys.anthropic ? 'Claude' : 'محلي', dna, plan }].slice(-12);
  await repo.saveProject(next);
  const [h] = rgbToHsl(hexToRgb(dna.palette.primary));
  await repo.addFingerprint({ id: uid('f_'), projectId: p.id, createdAt: Date.now(), mood: dna.mood, easing: dna.motionLanguage.easing, hue: Math.round(h), sequence: plan.scenes.map(sceneSignature) });
  onStage('done');
  return next;
};

/** Regenerate one scene only (local director; keeps all other scenes and timing). */
export const regenerateScene = async (p: Project, sceneId: string): Promise<Project> => {
  if (!p.transcript || !p.dna || !p.plan) return p;
  const plan = replanScene({ transcript: p.transcript, dna: p.dna, mode: p.mode, pacing: p.style.pacing, seed: Date.now() % 1e6, product: p.product, images: projectImageRefs(p) }, p.plan, sceneId, Date.now() % 1e6);
  const next = { ...p, plan };
  await repo.saveProject(next);
  return next;
};

const blobToB64 = async (b: Blob) => {
  const buf = new Uint8Array(await b.arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
};
