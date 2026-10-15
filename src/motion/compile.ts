/**
 * Motion compiler: MotionPlan + transcript → frame-accurate CompiledMotion. Deterministic, no AI.
 * All ms→frame conversion goes through lib/timing/frames (SPEC §6).
 */
import type { Transcript, Word } from '@/lib/schema/transcript';
import type { AssetSrc, Layer, MotionPlan, MotionScene } from '@/lib/schema/motion';
import type { CutRange, StyleSettings } from '@/lib/schema/project';
import { ASPECTS } from '@/lib/schema/project';
import { msToFrame, anticipationFrames } from '@/lib/timing/frames';
import { applyCuts } from '@/lib/timing/cuts';
import { cutMsBefore } from '@/lib/timing/compiler';
import { groupCaptionLines } from '@/lib/timing/captions';
import type { CaptionLine, SfxEvent, SfxKind, VideoSegment } from '@/lib/timing/types';

export type CWord = { t: string; em?: string; inF: number; spoken: boolean };
export type CLayer = Layer & { inF: number; outF: number | null; cwords?: CWord[][]; itemF?: number[]; url?: string | null };
export type CScene = Omit<MotionScene, 'layers'> & { index: number; startF: number; duration: number; layers: CLayer[]; bgUrl: string | null; isEnd: boolean };

export type CompiledMotion = {
  kind: 'motion';
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  plan: MotionPlan;
  scenes: CScene[];
  captions: CaptionLine[];
  voice: { src: string; volume: number } | null;
  video: VideoSegment[];
  music: { src: string; gain: number[]; baseVolume: number } | null;
  sfx: SfxEvent[];
  digits: 'western' | 'eastern';
  safeZone: StyleSettings['safeZone'];
  mode: 'A' | 'B' | 'C';
};

export type MotionCompileInput = {
  plan: MotionPlan;
  transcript: Transcript;
  cuts?: CutRange[];
  mode: 'A' | 'B' | 'C';
  style: StyleSettings;
  media: { voiceSrc?: string | null; videoSrc?: string | null; musicSrc?: string | null };
  resolve: (src: AssetSrc) => string | null;
  sfxSrc?: (kind: SfxKind, palette: string) => string | null;
};

export const compileMotion = (input: MotionCompileInput): CompiledMotion => {
  const { plan, style } = input;
  const fps = style.fps;
  const [width, height] = ASPECTS[style.aspect];
  const { transcript, segments } = input.mode === 'C' ? applyCuts(input.transcript, input.cuts ?? []) : { transcript: input.transcript, segments: null };
  const words = transcript.words;
  const idx = new Map(words.map((w, i) => [w.id, i]));
  const f = (ms: number) => msToFrame(ms, fps);
  const lead = anticipationFrames(fps);

  // snap scene boundaries to surviving words (mode C cuts remove fillers)
  const orig = input.transcript.words;
  const oIdx = new Map(orig.map((w, i) => [w.id, i]));
  const snap = (id: string, dir: 1 | -1): string | null => {
    let i = oIdx.get(id);
    if (i === undefined) return null;
    while (i >= 0 && i < orig.length) {
      if (idx.has(orig[i]!.id)) return orig[i]!.id;
      i += dir;
    }
    return null;
  };
  const scenes0 = plan.scenes
    .map((s) => ({ ...s, from: snap(s.from, 1) ?? '', to: snap(s.to, -1) ?? '' }))
    .filter((s) => idx.has(s.from) && idx.has(s.to) && idx.get(s.from)! <= idx.get(s.to)!)
    .sort((a, b) => idx.get(a.from)! - idx.get(b.from)!);
  // contiguous: a scene ends where the next starts; the first starts at 0
  const speechEnd = f(transcript.durationMs);
  const tail = Math.round(0.4 * fps);
  const ec = style.endCard;
  const endOn = !!ec.enabled && !!(ec.cta || ec.handle || ec.phone || ec.website);
  const endF = endOn ? Math.round(ec.seconds * fps) : 0;
  const contentEnd = speechEnd + tail;
  const durationInFrames = contentEnd + endF;
  const starts = scenes0.map((s, i) => (i === 0 ? 0 : f(cutMsBefore(words[idx.get(s.from)! - 1], words[idx.get(s.from)!]!))));

  const scenes: CScene[] = scenes0.map((s, i) => {
    const startF = starts[i]!;
    const endFrame = i + 1 < scenes0.length ? starts[i + 1]! : contentEnd;
    const duration = Math.max(1, endFrame - startF);
    const rel = (id: string | undefined, fallback: number) => {
      if (!id || !idx.has(id)) return fallback;
      return Math.max(0, f(words[idx.get(id)!]!.startMs) - startF - lead);
    };
    const layers: CLayer[] = s.layers.map((l, li) => {
      const inF = rel(l.at, Math.min(4 + li * 3, Math.round(duration * 0.3)));
      const outF = l.exitAt && idx.has(l.exitAt) ? Math.max(inF + 4, rel(l.exitAt, duration) + lead - 2) : null;
      const out: CLayer = { ...l, inF, outF, url: l.type === 'image' ? input.resolve(l.src) : undefined };
      if (l.type === 'text') {
        let prev = inF;
        let stag = 0;
        out.cwords = l.lines.map((line) =>
          line.map((w) => {
            const spoken = !!w.at && idx.has(w.at);
            const at = spoken ? Math.max(prev, rel(w.at, prev)) : prev + (stag++ === 0 ? 0 : 3);
            prev = at;
            return { t: w.t, em: w.em, inF: at, spoken };
          }),
        );
        // a text layer must not appear before its first word lands, and never stays empty for long
        const first = out.cwords[0]?.[0]?.inF ?? inF;
        out.inF = Math.min(inF, first);
      }
      if (l.type === 'ui') out.itemF = l.items.map((it, k) => (it.at ? rel(it.at, inF + 6 + k * 8) : inF + 6 + k * 8));
      return out;
    });
    return { ...s, index: i, startF, duration, layers, bgUrl: s.bg.image ? input.resolve(s.bg.image) : null, isEnd: false };
  });

  if (endOn) {
    const p = plan.style.palette;
    scenes.push({
      id: 'end', index: scenes.length, from: '', to: '', intent: 'end card', startF: contentEnd, duration: endF, isEnd: true, bgUrl: null,
      bg: { kind: 'dark', grid: false, vignette: true, lightLeak: false, glow: 'accent' }, camera: { move: 'push', amount: 0.3 }, transition: 'fade', speaker: 'hidden',
      layers: [
        ...(ec.cta ? [{ id: 'cta', type: 'text', x: 0.5, y: 0.4, w: 0.84, rotate: 0, lines: [[{ t: ec.cta, em: 'accent' as const }]], font: 'display', size: 'xl', color: 'inkOnDark', align: 'center', anim: 'word-pop', inF: 2, outF: null, cwords: [[{ t: ec.cta, em: 'accent', inF: 2, spoken: false }]] } as unknown as CLayer] : []),
        ...[ec.handle, ec.phone, ec.website].filter(Boolean).map((v, k) => ({ id: `c${k}`, type: 'ui', kind: 'button', title: v!, sub: '', items: [], x: 0.5, y: 0.56 + k * 0.09, w: 0.72, rotate: 0, color: 'accent', anim: 'pop', inF: 8 + k * 5, outF: null } as unknown as CLayer)),
      ],
    });
    void p;
  }

  // captions (optional in this style: the kinetic text usually IS the speech)
  const capOn = plan.style.captions !== 'none' && style.captions.enabled;
  const hardBreaks = new Set(scenes0.slice(1).map((s) => s.from));
  const groups = capOn ? groupCaptionLines(words, { wordsPerLine: style.captions.wordsPerLine, maxChars: 26, pauseBreakMs: 450, hardBreaksBefore: hardBreaks }) : [];
  const captions: CaptionLine[] = groups.map((g, gi) => ({
    id: `cap-${gi}`,
    from: Math.max(0, f(g[0]!.startMs) - 2),
    to: f(g[g.length - 1]!.endMs) + 4,
    keywordId: null,
    words: g.map((w: Word, wi) => ({ id: w.id, text: w.text, start: f(w.startMs), end: g[wi + 1] ? f(g[wi + 1]!.startMs) : f(w.endMs), keyword: false })),
  }));
  captions.forEach((c, i) => {
    const n = captions[i + 1];
    if (n && c.to > n.from) c.to = n.from;
  });

  // SFX on visual events: whoosh on transitions, pop on image entrances, tick on counters
  const sfx: SfxEvent[] = [];
  if (style.sfx.enabled && plan.style.sfx !== 'none' && input.sfxSrc) {
    const add = (frame: number, kind: SfxKind, vol: number) => {
      const src = input.sfxSrc!(kind, plan.style.sfx);
      if (!src || frame < 0 || frame >= durationInFrames || sfx.some((e) => Math.abs(e.frame - frame) < 7)) return;
      sfx.push({ frame, kind, src, volume: vol * style.sfx.intensity });
    };
    for (const s of scenes) {
      if (s.transition !== 'cut' && s.index > 0) add(s.startF - 2, s.transition === 'zoom' || s.transition === 'whip' ? 'swipe' : 'whoosh', 0.3);
      for (const l of s.layers) {
        if (l.type === 'image' && l.inF > 0) add(s.startF + l.inF, 'pop', 0.22);
        if (l.type === 'counter') add(s.startF + l.inF, 'tick', 0.2);
        if (l.type === 'ui' && (l.kind === 'price' || l.kind === 'button')) add(s.startF + l.inF + 4, 'ding', 0.25);
      }
    }
    sfx.sort((a, b) => a.frame - b.frame);
  }

  // music with ducking under speech (−12 dB, 150 ms look-ahead attack, 400 ms release)
  let music: CompiledMotion['music'] = null;
  if (input.media.musicSrc) {
    const speaking = new Uint8Array(durationInFrames);
    const look = Math.round(0.15 * fps);
    for (const w of words) for (let k = Math.max(0, f(w.startMs) - look); k < Math.min(durationInFrames, f(w.endMs) + Math.round(0.25 * fps)); k++) speaking[k] = 1;
    const duck = Math.pow(10, -12 / 20);
    const up = 1 - Math.exp(-1 / (0.4 * fps));
    const down = 1 - Math.exp(-1 / (0.15 * fps));
    let g = speaking[0] ? duck : 1;
    const gain: number[] = [];
    for (let k = 0; k < durationInFrames; k++) {
      const target = speaking[k] ? duck : 1;
      g += (target - g) * (target < g ? down : up);
      const fade = Math.min(1, (k + 1) / Math.round(0.5 * fps), (durationInFrames - k) / Math.round(1.5 * fps));
      gain.push(Math.round(g * fade * 1000) / 1000);
    }
    music = { src: input.media.musicSrc, gain, baseVolume: style.music.volume * 0.5 };
  }

  const video: VideoSegment[] =
    input.mode === 'C' && input.media.videoSrc && segments
      ? segments.map((s) => ({ src: input.media.videoSrc!, from: f(s.outStartMs), duration: Math.max(1, f(s.outStartMs + (s.srcEndMs - s.srcStartMs)) - f(s.outStartMs)), trimBefore: f(s.srcStartMs) }))
      : [];

  return {
    kind: 'motion',
    fps,
    width,
    height,
    durationInFrames,
    plan,
    scenes,
    captions,
    voice: input.mode !== 'C' && input.media.voiceSrc ? { src: input.media.voiceSrc, volume: 1 } : null,
    video,
    music,
    sfx,
    digits: style.digits,
    safeZone: style.safeZone,
    mode: input.mode,
  };
};
