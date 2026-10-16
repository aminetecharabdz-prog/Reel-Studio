/**
 * The Rassam composition: one style's scenes + soundtrack (voice, music with ducking, SFX on visual events)
 * + optional captions + optional brand end card. Pure function of the frame.
 */
import { useMemo } from 'react';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { getLoadedStyle } from '@/styles/registry';
import { Captions } from './Captions';
import { EndCard, END_CARD_SECONDS } from './EndCard';
import { VideoProvider } from './context';
import { TalkingLayout } from './Talking';
import sfxManifest from './sfx-manifest.json';
import { FPS, TimingIndex, toFrame } from './timing';
import { DIMS, type SfxEvent, type VideoCtx, type VideoInput } from './types';

const EASTERN = '٠١٢٣٤٥٦٧٨٩';

export const buildCtx = (input: VideoInput): VideoCtx => {
  const style = getLoadedStyle(input.styleId);
  const T = new TimingIndex(input.timing, FPS);
  const { w: W, h: H } = DIMS[input.aspect];
  const contentEnd = input.timing.duration + (style?.tailSeconds ?? 1);
  const total = contentEnd + (input.endCard && input.brand ? END_CARD_SECONDS : 0);
  return {
    input,
    T,
    W,
    H,
    u: Math.min(W, H) / 1080,
    portrait: H > W,
    fps: FPS,
    durationInFrames: Math.max(1, Math.ceil(total * FPS)),
    contentEnd,
    asset: (id) => (id ? (input.assets[id] ?? (/^(https?:|blob:|data:|\.\/|\/)/.test(id) ? id : null)) : null),
    num: (s) => (input.digits === 'eastern' ? String(s).replace(/[0-9]/g, (d) => EASTERN[Number(d)]!) : String(s)),
  };
};

export const durationOf = (input: VideoInput) => buildCtx(input).durationInFrames;

const SFX_BASE = 'audio/sfx/';
const Sfx = ({ events, intensity }: { events: SfxEvent[]; intensity: number }) => (
  <>
    {events.map((e, i) => {
      const m = (sfxManifest as Record<string, { dur: number; peak: number }>)[e.name];
      if (!m) return null;
      const from = toFrame(Math.max(0, e.at - m.peak));
      return (
        <Sequence key={`${e.name}-${i}`} from={from} durationInFrames={Math.max(2, toFrame(m.dur) + 2)} name={`sfx ${e.name}`} layout="none">
          <Audio src={staticFile(`${SFX_BASE}${e.name}.mp3`)} volume={(e.vol ?? 0.6) * (0.4 + intensity * 0.9)} />
        </Sequence>
      );
    })}
  </>
);

const Music = ({ ctx }: { ctx: VideoCtx }) => {
  const { input, T } = ctx;
  const a = input.audio;
  const voiced = !!a.voice;
  const base = a.musicVolume * (voiced ? 0.45 : 1);
  const endFrame = ctx.durationInFrames;
  // ducking under spoken words (only when there is a voice)
  const spans = useMemo(() => (voiced && a.ducking ? T.lines.map((l) => [toFrame(l.start - 0.15), toFrame(l.end + 0.25)] as const) : []), [voiced, a.ducking, T]);
  if (!a.music) return null;
  return (
    <Audio
      src={a.music.startsWith('audio/') ? staticFile(a.music) : a.music}
      volume={(f) => {
        const fadeIn = Math.min(1, f / 15);
        const fadeOut = Math.min(1, Math.max(0, (endFrame - f) / 45));
        const duck = spans.some(([s, e]) => f >= s && f <= e) ? 0.35 : 1;
        return base * fadeIn * fadeOut * duck;
      }}
    />
  );
};

export const RassamVideo = ({ input }: { input: VideoInput }) => {
  const ctx = useMemo(() => buildCtx(input), [input]);
  const style = getLoadedStyle(input.styleId);
  const sfx = useMemo(() => (style && input.audio.sfx ? style.sfx(input.plan as never, ctx) : []), [style, input, ctx]);
  if (!style) return <AbsoluteFill style={{ background: '#000', color: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>…</AbsoluteFill>;
  const { Video } = style;
  const contentFrames = toFrame(ctx.contentEnd);
  return (
    <VideoProvider value={ctx}>
      <AbsoluteFill style={{ background: '#000', direction: 'rtl' }}>
        <Sequence durationInFrames={contentFrames} name="scenes">
          {input.talking ? <TalkingLayout style={style} plan={input.plan as never}>{() => <Video plan={input.plan as never} />}</TalkingLayout> : <Video plan={input.plan as never} />}
        </Sequence>
        {input.captions && !input.talking && <Captions />}
        {input.endCard && input.brand && (
          <Sequence from={contentFrames} name="end card">
            <EndCard />
          </Sequence>
        )}
        {input.audio.voice && <Audio src={ctx.asset(input.audio.voice) ?? input.audio.voice} />}
        <Music ctx={ctx} />
        <Sfx events={sfx} intensity={input.audio.sfxIntensity} />
      </AbsoluteFill>
    </VideoProvider>
  );
};

/** helper for previews of a frame outside the Player */
export const useFrameSeconds = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
