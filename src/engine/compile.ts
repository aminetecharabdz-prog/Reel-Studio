/** Plan + transcript → frame-accurate compiled video (deterministic, no AI). */
import type { Layer, Plan, Scene, Src, Transcript } from './schema';
import { applyCuts, cutBefore, LEAD, msToFrame, phrases, type Cut } from './timing';

export type CWord = { t: string; em?: string; inF: number };
export type CLayer = Layer & { inF: number; outF: number | null; words?: CWord[][]; itemF?: number[]; url?: string | null };
export type CScene = Omit<Scene, 'layers'> & { index: number; startF: number; duration: number; layers: CLayer[]; bgUrl: string | null; isEnd?: boolean };
export type CCaption = { from: number; to: number; words: Array<{ id: string; text: string; start: number; end: number }> };
export type Sfx = { frame: number; src: string; volume: number };
export type VSeg = { src: string; from: number; duration: number; trimBefore: number };

export type Compiled = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  plan: Plan;
  scenes: CScene[];
  captions: CCaption[];
  voice: string | null;
  video: VSeg[];
  music: { src: string; gain: number[]; volume: number } | null;
  sfx: Sfx[];
  digits: 'western' | 'eastern';
  mode: 'content' | 'product' | 'talking';
  safe: boolean;
};

export type EndCard = { enabled: boolean; cta: string; handle: string; phone: string; seconds: number };
export type CompileOpts = {
  plan: Plan;
  transcript: Transcript;
  cuts?: Cut[];
  mode: Compiled['mode'];
  aspect: '9:16' | '4:5' | '1:1' | '16:9';
  fps: 30 | 60;
  voice?: string | null;
  video?: string | null;
  music?: string | null;
  musicVolume?: number;
  sfx?: { on: boolean; intensity: number; src: (k: 'whoosh' | 'pop' | 'tick' | 'ding' | 'impact', palette: string) => string | null };
  endCard?: EndCard;
  digits?: 'western' | 'eastern';
  captionsOn?: boolean;
  resolve: (s: Src) => string | null;
  showSafe?: boolean;
};

const DIMS = { '9:16': [1080, 1920], '4:5': [1080, 1350], '1:1': [1080, 1080], '16:9': [1920, 1080] } as const;

export const compile = (o: CompileOpts): Compiled => {
  const fps = o.fps;
  const [width, height] = DIMS[o.aspect];
  const { transcript, segments } = o.mode === 'talking' ? applyCuts(o.transcript, o.cuts ?? []) : { transcript: o.transcript, segments: null };
  const words = transcript.words;
  const idx = new Map(words.map((w, i) => [w.id, i]));
  const F = (ms: number) => msToFrame(ms, fps);
  const lead = LEAD(fps);

  const orig = o.transcript.words;
  const oIdx = new Map(orig.map((w, i) => [w.id, i]));
  const snap = (id: string, dir: 1 | -1): string => {
    let i = oIdx.get(id);
    if (i === undefined) return '';
    while (i >= 0 && i < orig.length) {
      if (idx.has(orig[i]!.id)) return orig[i]!.id;
      i += dir;
    }
    return '';
  };
  const src = o.plan.scenes
    .map((s) => ({ ...s, from: snap(s.from, 1), to: snap(s.to, -1) }))
    .filter((s) => idx.has(s.from) && idx.has(s.to) && idx.get(s.from)! <= idx.get(s.to)!)
    .sort((a, b) => idx.get(a.from)! - idx.get(b.from)!);
  const speechEnd = F(transcript.durationMs);
  const contentEnd = speechEnd + Math.round(0.35 * fps);
  const ec = o.endCard;
  const endOn = !!ec?.enabled && !!(ec.cta || ec.handle || ec.phone);
  const endF = endOn ? Math.round(ec!.seconds * fps) : 0;
  const durationInFrames = Math.max(fps, contentEnd + endF);
  const starts = src.map((s, i) => (i === 0 ? 0 : F(cutBefore(words[idx.get(s.from)! - 1], words[idx.get(s.from)!]!))));

  const scenes: CScene[] = src.map((s, i) => {
    const startF = starts[i]!;
    const duration = Math.max(1, (i + 1 < src.length ? starts[i + 1]! : contentEnd) - startF);
    const rel = (id: string | undefined, fb: number) => (id && idx.has(id) ? Math.max(0, F(words[idx.get(id)!]!.startMs) - startF - lead) : fb);
    const layers: CLayer[] = s.layers.map((l, li) => {
      const inF = rel(l.at, Math.min(2 + li * 3, Math.round(duration * 0.25)));
      const outF = l.exitAt && idx.has(l.exitAt) ? Math.max(inF + 6, rel(l.exitAt, duration) + lead - 2) : null;
      const out: CLayer = { ...l, inF, outF };
      if (l.type === 'image') out.url = o.resolve(l.src);
      if (l.type === 'text') {
        let prev = inF;
        let first = true;
        out.words = l.lines.map((line) =>
          line.map((w) => {
            const at = w.at && idx.has(w.at) ? Math.max(first ? 0 : prev, rel(w.at, prev)) : first ? prev : prev + 2;
            first = false;
            prev = at;
            return { t: w.t, em: w.em, inF: at };
          }),
        );
        out.inF = Math.min(inF, out.words[0]?.[0]?.inF ?? inF);
      }
      if (l.type === 'ui') out.itemF = l.items.map((it, k) => rel(it.at, inF + 8 + k * 7));
      return out;
    });
    return { ...s, index: i, startF, duration, layers, bgUrl: s.bg.image ? o.resolve(s.bg.image) : null };
  });

  if (endOn && ec) {
    const items = [ec.handle, ec.phone].filter(Boolean);
    scenes.push({
      id: 'end', from: '', to: '', intent: 'end card', index: scenes.length, startF: contentEnd, duration: endF, bgUrl: null, isEnd: true,
      bg: { kind: 'spotlight', tone: 'dark', grid: false, vignette: true, leak: true, glow: 'accent' }, camera: { move: 'push', amount: 0.25 }, transition: 'fade',
      layers: [
        { id: 'end-cta', type: 'text', x: 0.5, y: 0.42, w: 0.86, rotate: 0, opacity: 1, lines: [ec.cta.split(/\s+/).map((t, k) => ({ t, em: k === ec.cta.split(/\s+/).length - 1 ? ('accent' as const) : undefined }))], role: 'display', size: 'xl', color: 'ink', align: 'center', anim: 'pop', tracking: 0, hier: false, inF: 2, outF: null, words: [ec.cta.split(/\s+/).map((t, k, a) => ({ t, em: k === a.length - 1 ? 'accent' : undefined, inF: 2 + k * 3 }))] },
        ...items.map((v, k) => ({ id: `end-${k}`, type: 'ui' as const, kind: 'button' as const, title: v, sub: '', items: [], x: 0.5, y: 0.58 + k * 0.085, w: 0.7, rotate: 0, opacity: 1, color: 'accent' as const, anim: 'pop' as const, inF: 10 + k * 5, outF: null })),
      ],
    });
  }

  const captions: CCaption[] = [];
  if (o.captionsOn && o.plan.style.captions !== 'none') {
    for (const g of phrases(words, 4, 420)) {
      captions.push({ from: Math.max(0, F(g[0]!.startMs) - 2), to: F(g[g.length - 1]!.endMs) + 4, words: g.map((w, k) => ({ id: w.id, text: w.text, start: F(w.startMs), end: g[k + 1] ? F(g[k + 1]!.startMs) : F(w.endMs) })) });
    }
    captions.forEach((c, i) => {
      const n = captions[i + 1];
      if (n && c.to > n.from) c.to = n.from;
    });
  }

  const sfx: Sfx[] = [];
  if (o.sfx?.on && o.plan.style.sfx !== 'none') {
    const add = (frame: number, k: 'whoosh' | 'pop' | 'tick' | 'ding' | 'impact', v: number) => {
      const s = o.sfx!.src(k, o.plan.style.sfx);
      if (!s || frame < 0 || frame >= durationInFrames || sfx.some((e) => Math.abs(e.frame - frame) < 8)) return;
      sfx.push({ frame, src: s, volume: v * o.sfx!.intensity });
    };
    for (const s of scenes) {
      if (s.index > 0 && s.transition !== 'cut') add(s.startF - 3, 'whoosh', 0.28);
      if (s.index === 0) add(2, 'impact', 0.3);
      for (const l of s.layers) {
        if (l.type === 'image' && l.inF > 1) add(s.startF + l.inF, 'pop', 0.2);
        if (l.type === 'counter') add(s.startF + l.inF, 'tick', 0.18);
        if (l.type === 'ui' && (l.kind === 'price' || l.kind === 'button')) add(s.startF + l.inF + 5, 'ding', 0.22);
      }
    }
    sfx.sort((a, b) => a.frame - b.frame);
  }

  let music: Compiled['music'] = null;
  if (o.music) {
    const speak = new Uint8Array(durationInFrames);
    for (const w of words) for (let k = Math.max(0, F(w.startMs) - Math.round(0.15 * fps)); k < Math.min(durationInFrames, F(w.endMs) + Math.round(0.25 * fps)); k++) speak[k] = 1;
    const duck = Math.pow(10, -12 / 20);
    const up = 1 - Math.exp(-1 / (0.4 * fps)), down = 1 - Math.exp(-1 / (0.15 * fps));
    let g = speak[0] ? duck : 1;
    const gain: number[] = [];
    for (let k = 0; k < durationInFrames; k++) {
      const tgt = speak[k] ? duck : 1;
      g += (tgt - g) * (tgt < g ? down : up);
      gain.push(Math.round(g * Math.min(1, (k + 1) / (0.4 * fps), (durationInFrames - k) / (1.5 * fps)) * 1000) / 1000);
    }
    music = { src: o.music, gain, volume: (o.musicVolume ?? 0.5) * 0.55 };
  }

  const video: VSeg[] = o.mode === 'talking' && o.video && segments ? segments.map((s) => ({ src: o.video!, from: F(s.outStartMs), duration: Math.max(1, F(s.outStartMs + s.srcEndMs - s.srcStartMs) - F(s.outStartMs)), trimBefore: F(s.srcStartMs) })) : [];

  return { fps, width, height, durationInFrames, plan: o.plan, scenes, captions, voice: o.mode !== 'talking' ? o.voice ?? null : null, video, music, sfx, digits: o.digits ?? 'western', mode: o.mode, safe: !!o.showSafe };
};
