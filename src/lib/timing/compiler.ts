/**
 * Plan compiler: transcript + Design DNA + scene plan → frame-accurate CompiledReel.
 * Deterministic, no AI. All ms→frame conversions go through ./frames (SPEC §6).
 */
import type { Transcript, Word } from '../schema/transcript';
import type { DesignDNA } from '../schema/dna';
import type { ImageRef, Plan, Scene } from '../schema/plan';
import type { CutRange, StyleSettings } from '../schema/project';
import { ASPECTS } from '../schema/project';
import { msToFrame } from './frames';
import { applyCuts } from './cuts';
import { groupCaptionLines, pickLineKeyword } from './captions';
import type { CaptionLine, CompiledReel, CompiledScene, FrameWord, ResolvedImage, SfxEvent, SfxKind, VideoSegment } from './types';

export type CompileInput = {
  mode: 'A' | 'B' | 'C';
  transcript: Transcript;
  cuts?: CutRange[];
  dna: DesignDNA;
  plan: Plan;
  style: StyleSettings;
  media: { voiceSrc?: string | null; videoSrc?: string | null; musicSrc?: string | null; logoSrc?: string | null };
  resolveImage?: (ref: ImageRef) => ResolvedImage;
  sfxSrc?: (kind: SfxKind, palette: DesignDNA['sfxPalette']) => string | null;
  showSafeZone?: boolean;
};

/** Scene cut position for a scene starting at `first`: inside the pause before it, ≤150 ms ahead of the word. */
export const cutMsBefore = (prev: Word | undefined, first: Word): number => {
  if (!prev) return 0;
  return Math.max(prev.endMs, first.startMs - 150);
};

const SFX_BASE: Record<SfxKind, number> = { whoosh: 0.32, pop: 0.3, tick: 0.22, impact: 0.42, riser: 0.28, ding: 0.32, click: 0.25, swipe: 0.3 };

export const compileReel = (input: CompileInput): CompiledReel => {
  const { dna, plan, style } = input;
  const fps = style.fps;
  const [width, height] = ASPECTS[style.aspect];
  const { transcript, segments } = input.mode === 'C' ? applyCuts(input.transcript, input.cuts ?? []) : { transcript: input.transcript, segments: null };
  const words = transcript.words;
  const idx = new Map(words.map((w, i) => [w.id, i]));
  const f = (ms: number) => msToFrame(ms, fps);

  // ---- scenes: keep only scenes whose anchors survive cuts, in transcript order
  // mode C: words removed by cuts (fillers) snap scene boundaries to the nearest surviving word
  const orig = input.transcript.words;
  const oIdx = new Map(orig.map((w, i) => [w.id, i]));
  const snap = (id: string, dir: 1 | -1, limit: string): string | null => {
    let i = oIdx.get(id);
    const lim = oIdx.get(limit);
    if (i === undefined || lim === undefined) return null;
    while (i >= 0 && i < orig.length && (dir === 1 ? i <= lim : i >= lim)) {
      if (idx.has(orig[i]!.id)) return orig[i]!.id;
      i += dir;
    }
    return null;
  };
  const scenes = plan.scenes
    .map((s) => ({ ...s, from: snap(s.from, 1, s.to) ?? '', to: snap(s.to, -1, s.from) ?? '' }))
    .filter((s) => idx.has(s.from) && idx.has(s.to))
    .sort((a, b) => idx.get(a.from)! - idx.get(b.from)!);
  const speechEndFrame = f(transcript.durationMs);
  const endCardOn = !!style.endCard.enabled && (style.endCard.cta || style.endCard.handle || style.endCard.phone || style.endCard.website);
  const endCardFrames = endCardOn ? Math.round(style.endCard.seconds * fps) : 0;
  const tail = Math.round(0.35 * fps);
  const contentEnd = speechEndFrame + tail;
  const durationInFrames = contentEnd + endCardFrames;

  const starts = scenes.map((s, i) => (i === 0 ? 0 : f(cutMsBefore(words[idx.get(s.from)! - 1], words[idx.get(s.from)!]!))));

  const keywordForced = new Set(scenes.flatMap((s) => s.emphasis));
  const resolveImage = input.resolveImage ?? ((r: ImageRef) => (r.src ? { src: r.src } : null));

  const compiled: CompiledScene[] = scenes.map((s: Scene, i) => {
    const from = starts[i]!;
    const to = i + 1 < scenes.length ? starts[i + 1]! : contentEnd;
    const a = idx.get(s.from)!;
    const b = i + 1 < scenes.length ? idx.get(scenes[i + 1]!.from)! - 1 : words.length - 1;
    const sceneWords: FrameWord[] = words.slice(a, b + 1).map((w) => ({
      id: w.id,
      text: w.text,
      start: f(w.startMs) - from,
      end: f(w.endMs) - from,
      keyword: keywordForced.has(w.id),
    }));
    const anchors: CompiledScene['anchors'] = {};
    for (const w of sceneWords) anchors[w.id] = { start: w.start, end: w.end };
    const imgs: ResolvedImage[] = [];
    if (s.content.image) imgs.push(resolveImage(s.content.image));
    for (const im of s.content.images ?? []) imgs.push(resolveImage(im));
    return {
      id: s.id,
      index: i,
      from,
      duration: Math.max(1, to - from),
      primitive: s.primitive,
      variant: s.variant,
      content: s.content,
      anchors,
      words: sceneWords,
      emphasis: s.emphasis.filter((id) => anchors[id]).map((id) => anchors[id]!.start),
      transition: i === 0 ? 'cut' : s.transition,
      bgIndex: s.bgIndex,
      bg: s.bg ?? 'dna',
      heroImage: s.content.hero?.image ? resolveImage(s.content.hero.image) : null,
      images: imgs,
      speaker: s.speaker,
      zooms: [],
      isHook: i === 0,
      isEndCard: false,
    };
  });

  // ---- mode C punch-in zooms: never two within 1.5 s
  if (input.mode === 'C') {
    let lastZoom = -Infinity;
    for (const [i, s] of scenes.entries()) {
      const cs = compiled[i]!;
      for (const id of s.zoomOn) {
        const anc = cs.anchors[id];
        if (!anc) continue;
        const abs = cs.from + anc.start;
        if (abs - lastZoom < 1.5 * fps) continue;
        cs.zooms.push(anc.start);
        lastZoom = abs;
      }
    }
  }

  // end card hero: the product photo when there is one, else the video's most used 3D object (never an empty card)
  const endHero = (() => {
    const withImage = scenes.find((s) => s.content.hero?.image && s.content.hero.cutout);
    if (withImage) return { image: withImage.content.hero!.image, cutout: true };
    const counts = new Map<string, number>();
    for (const s of scenes) for (const a of [s.content.hero?.art, s.content.hero?.badge?.art, ...(s.content.hero?.props ?? [])]) if (a) counts.set(a, (counts.get(a) ?? 0) + 1);
    const best = [...counts.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
    return best ? { art: best } : undefined;
  })();
  if (endCardOn) {
    compiled.push({
      id: 'end-card',
      index: compiled.length,
      from: contentEnd,
      duration: endCardFrames,
      primitive: 'end-card',
      variant: dna.seed % 3,
      content: { headline: style.endCard.cta, handle: style.endCard.handle, phone: style.endCard.phone, url: style.endCard.website, hero: endHero },
      anchors: {},
      words: [],
      emphasis: [],
      transition: dna.motionLanguage.transitionFamily[0] ?? 'fade',
      bgIndex: 0,
      bg: 'spotlight',
      heroImage: endHero?.image ? resolveImage(endHero.image) : null,
      images: [],
      zooms: [],
      isHook: false,
      isEndCard: true,
    });
  }

  // ---- captions
  const cs = style.captions;
  const hardBreaks = new Set(scenes.slice(1).map((s) => s.from));
  const charsPerLine = Math.floor((width * 0.8) / (cs.sizePx * 0.52));
  const groups = groupCaptionLines(words, { wordsPerLine: cs.wordsPerLine, maxChars: charsPerLine, pauseBreakMs: 450, hardBreaksBefore: hardBreaks });
  const sceneOfFrame = (frame: number) => {
    let k = 0;
    for (let i = 0; i < compiled.length; i++) if (compiled[i]!.from <= frame) k = i;
    return compiled[k]!;
  };
  const captions: CaptionLine[] = groups.map((g, gi) => {
    const first = g[0]!;
    const last = g[g.length - 1]!;
    const firstFrame = f(first.startMs);
    const scene = sceneOfFrame(firstFrame);
    const kw = cs.emphasizeKeywords ? pickLineKeyword(g, keywordForced) : null;
    return {
      id: `cap-${gi}`,
      from: Math.max(scene.from, firstFrame - 2),
      to: f(last.endMs),
      keywordId: kw,
      words: g.map((w, wi) => {
        const next = g[wi + 1];
        return {
          id: w.id,
          text: w.text,
          start: f(w.startMs),
          // active word stays lit until the next word starts (no flicker in between)
          end: next ? f(next.startMs) : f(w.endMs),
          keyword: w.id === kw,
        };
      }),
    };
  });
  // hold up to 6 frames after the last word, never overlapping the next line or a scene cut
  captions.forEach((c, i) => {
    const next = captions[i + 1];
    const scene = sceneOfFrame(c.words[0]!.start);
    const sceneEnd = scene.from + scene.duration;
    const limit = Math.min(next ? next.from : durationInFrames, sceneEnd);
    c.to = Math.max(c.to, Math.min(c.to + 6, limit));
    if (c.to > limit) c.to = limit;
  });

  // ---- SFX on visual events
  const sfx: SfxEvent[] = [];
  if (style.sfx.enabled && style.sfx.intensity > 0 && input.sfxSrc) {
    const add = (frame: number, kind: SfxKind) => {
      const src = input.sfxSrc!(kind, dna.sfxPalette);
      if (!src || frame < 0 || frame >= durationInFrames) return;
      if (sfx.some((e) => Math.abs(e.frame - frame) < 6)) return;
      sfx.push({ frame, kind, src, volume: SFX_BASE[kind] * style.sfx.intensity });
    };
    for (const c of compiled) {
      if (c.transition !== 'cut') add(c.from - 2, c.transition === 'zoom' ? 'swipe' : 'whoosh');
      const firstAnchor = (id?: string) => (id && c.anchors[id] ? c.from + c.anchors[id]!.start : null);
      if (c.isHook) add(firstAnchor(c.content.headlineAt) ?? c.from + (c.emphasis[0] ?? 3), 'impact');
      switch (c.primitive) {
        case 'big-number':
        case 'progress-ring':
        case 'gauge':
        case 'icon-array':
          add(firstAnchor(c.content.valueAt) ?? c.from + 4, 'tick');
          break;
        case 'icon-burst':
        case 'icon-grid':
        case 'sticker-pop':
        case 'checklist':
        case 'do-dont':
        case 'feature-callouts':
          (c.content.items ?? []).slice(0, 3).forEach((it) => {
            const fr = firstAnchor(it.at);
            if (fr !== null) add(fr - 2, 'pop');
          });
          break;
        case 'price-tag':
        case 'cta':
        case 'end-card':
          add(c.from + 6, 'ding');
          break;
        case 'warning-alert':
          add(c.from + 3, 'impact');
          break;
        default:
          break;
      }
    }
    sfx.sort((a, b) => a.frame - b.frame);
  }

  // ---- music with ducking (−12 dB under speech, 150 ms attack w/ look-ahead, 400 ms release)
  let music: CompiledReel['music'] = null;
  if (input.media.musicSrc) {
    const speaking = new Uint8Array(durationInFrames);
    const look = Math.round(0.15 * fps);
    const bridge = 0.4 * 1000;
    let i = 0;
    while (i < words.length) {
      let j = i;
      while (j + 1 < words.length && words[j + 1]!.startMs - words[j]!.endMs < bridge) j++;
      const s0 = Math.max(0, f(words[i]!.startMs) - look);
      const s1 = Math.min(durationInFrames, f(words[j]!.endMs));
      for (let k = s0; k < s1; k++) speaking[k] = 1;
      i = j + 1;
    }
    const duck = Math.pow(10, -12 / 20);
    const up = 1 - Math.exp(-1 / (0.4 * fps));
    const down = 1 - Math.exp(-1 / (0.15 * fps));
    const gain: number[] = [];
    let g = speaking[0] ? duck : 1;
    const fadeIn = Math.round(0.5 * fps);
    const fadeOut = Math.round(1.5 * fps);
    for (let k = 0; k < durationInFrames; k++) {
      const target = speaking[k] ? duck : 1;
      g += (target - g) * (target < g ? down : up);
      const fade = Math.min(1, (k + 1) / fadeIn, (durationInFrames - k) / fadeOut);
      gain.push(Math.round(g * fade * 1000) / 1000);
    }
    music = { src: input.media.musicSrc, gain, baseVolume: style.music.volume * 0.55 };
  }

  const video: VideoSegment[] =
    input.mode === 'C' && input.media.videoSrc && segments
      ? segments.map((s) => ({ src: input.media.videoSrc!, from: f(s.outStartMs), duration: Math.max(1, f(s.outStartMs + (s.srcEndMs - s.srcStartMs)) - f(s.outStartMs)), trimBefore: f(s.srcStartMs) }))
      : input.mode === 'A' && input.media.videoSrc
        ? [{ src: input.media.videoSrc, from: 0, duration: speechEndFrame + tail, trimBefore: 0 }] // speaker-top layout: the footage plays continuously
        : [];
  const speakerFootage = video.length > 0;
  if (input.mode === 'A' && speakerFootage) for (const s of compiled) if (!s.isEndCard) s.speaker = s.speaker ?? 'split-top';

  return {
    fps,
    width,
    height,
    durationInFrames,
    mode: input.mode,
    dna,
    scenes: compiled,
    captions,
    captionSettings: cs,
    digits: style.digits,
    voice: input.mode !== 'C' && !speakerFootage && input.media.voiceSrc ? { src: input.media.voiceSrc, volume: 1 } : null,
    video,
    music,
    sfx,
    endCard: endCardOn ? style.endCard : null,
    brandLogo: input.media.logoSrc ?? null,
    safeZone: style.safeZone,
    showSafeZone: !!input.showSafeZone,
  };
};
