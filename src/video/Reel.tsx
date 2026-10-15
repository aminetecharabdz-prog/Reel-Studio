import { useEffect, useMemo, useState, type FC } from 'react';
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, useCurrentFrame } from 'remotion';
import { Audio, Video } from '@remotion/media';
import type { CompiledReel, CompiledScene } from '@/lib/timing/types';
import { ensureFonts } from '@/lib/design/fonts';
import { buildTheme, ThemeProvider, useTheme, type Box, type Theme } from './theme';
import { Background, Grain } from './Background';
import { Captions } from './Captions';
import { TransitionIn, transitionFrames } from './Transition';
import { PRIMITIVE_COMPONENTS } from './registry';
import { SceneProvider } from './primitives/kit';
import { clearMeasureCache } from './Text';
import { withAlpha } from '@/lib/color/contrast';

export type ReelProps = { reel: CompiledReel };

export const fontRefsOf = (reel: CompiledReel) => {
  const ty = reel.dna.typography;
  return [
    { id: ty.display.family, weight: ty.display.weight },
    { id: ty.body.family, weight: ty.body.weight },
    { id: ty.body.family, weight: 700 },
    { id: reel.captionSettings.font ?? ty.captions.family, weight: reel.captionSettings.weight ?? ty.captions.weight },
    ...(ty.latin ? [{ id: ty.latin, weight: ty.display.weight }] : []),
  ];
};

/** Load every font the reel uses (call before mounting a Player or starting a render). */
export const prepareReel = async (reel: CompiledReel) => {
  await ensureFonts(fontRefsOf(reel));
  clearMeasureCache();
};

/** Speaker box per layout (mode C). */
const speakerBox = (mode: CompiledScene['speaker'], t: Theme): Box & { radius: number } => {
  const { W, H, u } = t;
  switch (mode) {
    case 'split-top':
      return { x: 0, y: 0, w: W, h: H * 0.5, radius: 0 };
    case 'split-bottom':
      return { x: 0, y: H * 0.5, w: W, h: H * 0.5, radius: 0 };
    case 'pip':
      return { x: W - 360 * u - 40 * u, y: H * 0.13, w: 360 * u, h: 360 * u, radius: 180 * u };
    case 'hidden':
      return { x: W / 2, y: H / 2, w: 0, h: 0, radius: 0 };
    default:
      return { x: 0, y: 0, w: W, h: H, radius: 0 };
  }
};

/** Stage (graphics area) for a scene, given where the speaker is. */
const stageFor = (mode: CompiledScene['speaker'], t: Theme): Box => {
  const s = t.stage;
  switch (mode) {
    case 'full':
      return { x: s.x, y: s.y, w: s.w, h: Math.min(s.h, t.H * 0.3) }; // compact overlay at the top
    case 'split-top':
      return { x: s.x, y: t.H * 0.5 + 30 * t.u, w: s.w, h: Math.max(200 * t.u, (t.captionBand ? t.captionBand.y : t.H * 0.8) - t.H * 0.5 - 50 * t.u) };
    case 'split-bottom':
      return { x: s.x, y: s.y, w: s.w, h: t.H * 0.5 - s.y - 30 * t.u };
    default:
      return s;
  }
};

const SpeakerLayer = ({ reel }: { reel: CompiledReel }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  if (reel.video.length === 0) return null;
  const idx = reel.scenes.findLastIndex((s) => s.from <= frame);
  const cur = reel.scenes[Math.max(0, idx)]!;
  const prev = reel.scenes[Math.max(0, idx - 1)];
  const k = Math.min(1, (frame - cur.from) / 8);
  const a = speakerBox(prev && idx > 0 ? prev.speaker ?? 'full' : cur.speaker ?? 'full', t);
  const b = speakerBox(cur.speaker ?? 'full', t);
  const box = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w: a.w + (b.w - a.w) * k, h: a.h + (b.h - a.h) * k, radius: a.radius + (b.radius - a.radius) * k };
  // punch-in zoom 1.0 → 1.12 on emphasis words, eased back
  let zoom = 1;
  for (const z of cur.zooms) {
    const d = frame - (cur.from + z);
    if (d >= -2 && d < 45) zoom = Math.max(zoom, interpolate(d, [-2, 6, 30, 45], [1, 1.12, 1.12, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  }
  return (
    <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, overflow: 'hidden', borderRadius: box.radius, border: (cur.speaker === 'pip' && k > 0.5) ? `${6 * t.u}px solid ${t.c.accent}` : undefined }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})` }}>
        {reel.video.map((seg, i) => (
          <Sequence key={i} from={seg.from} durationInFrames={seg.duration} layout="none">
            <Video
              src={seg.src}
              trimBefore={seg.trimBefore}
              style={{ position: 'absolute', left: 0, top: 0, width: box.w, height: box.h, objectFit: 'cover' }}
              volume={(f) => Math.min(1, (f + 1) / 2, (seg.duration - f) / 2)}
            />
          </Sequence>
        ))}
      </div>
    </div>
  );
};

const SceneGraphics = ({ scene, reel }: { scene: CompiledScene; reel: CompiledReel }) => {
  const base = useTheme();
  const theme = useMemo(() => (reel.mode === 'C' ? { ...base, stage: stageFor(scene.speaker ?? 'full', base) } : base), [base, reel.mode, scene.speaker]);
  const Comp: FC = PRIMITIVE_COMPONENTS[scene.primitive];
  // mode C: graphics sit on a scrim when they overlay full-frame footage
  const scrim = reel.mode === 'C' && (scene.speaker ?? 'full') === 'full';
  return (
    <ThemeProvider value={theme}>
      {scrim && <div style={{ position: 'absolute', left: 0, top: 0, width: base.W, height: theme.stage.y + theme.stage.h + 60 * base.u, backgroundImage: `linear-gradient(180deg, ${withAlpha('#000000', 0.55)}, rgba(0,0,0,0))` }} />}
      <Comp />
    </ThemeProvider>
  );
};

const SceneBackground = ({ scene, reel }: { scene: CompiledScene; reel: CompiledReel }) => {
  const frame = useCurrentFrame();
  const bgImage = scene.images[0]?.src ?? reel.scenes.find((s) => s.images[0])?.images[0]?.src ?? null;
  return <Background index={scene.bgIndex} absFrame={scene.from + frame} image={bgImage} />;
};

export const Reel: FC<ReelProps> = ({ reel }) => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    prepareReel(reel)
      .catch(() => undefined)
      .finally(() => {
        if (!alive) return;
        setReady(true);
        continueRender(handle);
      });
    return () => {
      alive = false;
    };
  }, [reel, handle]);
  const theme = useMemo(() => buildTheme(reel), [reel]);
  const frame = useCurrentFrame();
  const scenes = reel.scenes;
  const hold = (i: number) => transitionFrames(scenes[i + 1]?.transition ?? 'cut', reel.fps);

  return (
    <ThemeProvider value={theme}>
      <AbsoluteFill style={{ backgroundColor: theme.c.bg[0], overflow: 'hidden' }}>
        {reel.mode !== 'C' ? (
          // modes A/B: each scene is a self-contained unit (background + graphics) so transitions cover the previous scene
          scenes.map((s, i) => (
            <Sequence key={`sc-${s.id}`} from={s.from} durationInFrames={s.duration + hold(i)} layout="none">
              <SceneProvider value={s}>
                <TransitionIn id={s.transition}>
                  <SceneBackground scene={s} reel={reel} />
                  {ready && <SceneGraphics scene={s} reel={reel} />}
                </TransitionIn>
              </SceneProvider>
            </Sequence>
          ))
        ) : (
          <>
            {/* mode C: backgrounds, then the continuous speaker footage, then overlays (cut at scene end, no ghosting) */}
            {scenes.map((s, i) => (
              <Sequence key={`bg-${s.id}`} from={s.from} durationInFrames={s.duration + hold(i)} layout="none">
                <SceneProvider value={s}>
                  <TransitionIn id={s.transition}>
                    <SceneBackground scene={s} reel={reel} />
                  </TransitionIn>
                </SceneProvider>
              </Sequence>
            ))}
            <SpeakerLayer reel={reel} />
            {ready &&
              scenes.map((s) => (
                <Sequence key={`fx-${s.id}`} from={s.from} durationInFrames={s.duration} layout="none">
                  <SceneProvider value={s}>
                    <TransitionIn id={s.transition}>
                      <SceneGraphics scene={s} reel={reel} />
                    </TransitionIn>
                  </SceneProvider>
                </Sequence>
              ))}
          </>
        )}
        <Grain amount={reel.dna.texture.grain} frame={frame} />
        {ready && <Captions lines={reel.captions} settings={reel.captionSettings} />}
        {reel.voice && <Audio src={reel.voice.src} volume={reel.voice.volume} />}
        {reel.music && (
          <Audio src={reel.music.src} loop volume={(f) => (reel.music!.gain[f] ?? 0) * reel.music!.baseVolume} />
        )}
        {reel.sfx.map((e, i) => (
          <Sequence key={`sfx-${i}`} from={e.frame} durationInFrames={Math.round(reel.fps * 2.5)} layout="none">
            <Audio src={e.src} volume={e.volume} />
          </Sequence>
        ))}
        {reel.showSafeZone && <SafeZoneOverlay />}
      </AbsoluteFill>
    </ThemeProvider>
  );
};

const SafeZoneOverlay = () => {
  const t = useTheme();
  const s = t.stage;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, top: 0, width: t.W, height: s.y, backgroundColor: 'rgba(255,0,80,0.18)' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: t.W - s.x - s.w, height: t.H, backgroundColor: 'rgba(255,0,80,0.12)' }} />
      {t.captionBand && <div style={{ position: 'absolute', left: t.captionBand.x, top: t.captionBand.y, width: t.captionBand.w, height: t.captionBand.h, border: '4px dashed rgba(60,227,180,0.8)' }} />}
    </AbsoluteFill>
  );
};
