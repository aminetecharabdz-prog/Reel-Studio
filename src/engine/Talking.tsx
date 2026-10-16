/**
 * «الظهور بالصورة» — talking-head mode for every style. The user's own video stays the star; the style's scenes are
 * drawn around them on the spoken words:
 *  - split: speaker on top, the style panel below (most beats)
 *  - cutaway: the style full screen on key ideas (the style lists its cutaway beats)
 *  - speaker: full speaker with a punch-in zoom on the beat's first word
 * Hard cuts land in the pause before each scene's first word (same clock as the style).
 */
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Audio, Video } from '@remotion/media';
import type { ReactNode } from 'react';
import { VideoProvider, useVideo } from './context';
import { Captions } from './Captions';
import { ease, prog } from './anim';
import type { StyleModule, VideoCtx } from './types';

type Mode = 'split' | 'cutaway' | 'speaker';

export const talkingModes = (style: StyleModule<never>, plan: never): Array<{ at: string; mode: Mode }> => {
  const cut = new Set(style.cutaways ?? []);
  let k = 0;
  return style.scenes(plan).map((s, i) => {
    if (cut.has(s.beat) && i > 0) return { at: s.at, mode: 'cutaway' as const };
    k++;
    return { at: s.at, mode: (i === 0 ? 'speaker' : k % 3 === 0 ? 'speaker' : 'split') as Mode };
  });
};

export const TalkingLayout = ({ style, plan, children }: { style: StyleModule<never>; plan: never; children: (ctx: VideoCtx) => ReactNode }) => {
  const ctx = useVideo();
  const frame = useCurrentFrame();
  const t = frame / ctx.fps;
  const { T, W, H, input } = ctx;
  const modes = talkingModes(style, plan);
  const wins = T.windows(modes.map((m) => m.at), ctx.contentEnd, 0.1);
  let idx = 0;
  wins.forEach((w, i) => {
    if (t >= w.from) idx = i;
  });
  const mode = modes[idx]?.mode ?? 'speaker';
  const from = wins[idx]?.from ?? 0;
  const firstWord = modes[idx] ? T.byId(modes[idx]!.at).start : 0;
  // punch-in: 1.0 → 1.12 on the beat's first word, eased; alternates zoom origin for variety
  const punch = mode === 'speaker' ? 1 + 0.12 * prog(t, firstWord - 0.05, firstWord + 0.35, ease.outCubic) : 1;
  const src = ctx.asset(input.talking?.video) ?? '';
  const portrait = H > W;
  const split = mode === 'split';
  const speakerH = split ? (portrait ? H * 0.56 : H) : H;
  const speakerW = split && !portrait ? W * 0.5 : W;
  const panel = split ? (portrait ? { x: 0, y: speakerH, w: W, h: H - speakerH } : { x: 0, y: 0, w: W - speakerW, h: H }) : { x: 0, y: 0, w: W, h: H };
  const panelCtx: VideoCtx = { ...ctx, W: panel.w, H: panel.h, u: Math.min(panel.w, panel.h) / 1080, portrait: panel.h > panel.w };
  void from;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {mode !== 'cutaway' && src && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: speakerW, height: speakerH, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, transform: `scale(${punch})`, transformOrigin: `50% ${idx % 2 ? 35 : 45}%` }}>
            <Video src={src} muted style={{ width: '100%', height: '100%' }} objectFit="cover" />
          </div>
        </div>
      )}
      {/* the speaker's voice is one continuous track, whatever the layout */}
      {src && <Audio src={src} />}
      {mode !== 'speaker' && (
        <div style={{ position: 'absolute', left: panel.x, top: panel.y, width: panel.w, height: panel.h, overflow: 'hidden' }}>
          <VideoProvider value={panelCtx}>{children(panelCtx)}</VideoProvider>
        </div>
      )}
      {/* captions sit on the speaker (the style already writes the words in its own panel / cutaway) */}
      {mode !== 'cutaway' && input.captions && <Captions box={{ top: 0, height: speakerH }} />}
      {split && portrait && <div style={{ position: 'absolute', left: 0, right: 0, top: speakerH - 2, height: 4, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))' }} />}
    </AbsoluteFill>
  );
};
