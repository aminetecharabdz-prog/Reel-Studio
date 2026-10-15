import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react';
import { AbsoluteFill, Sequence, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { Audio, Video } from '@remotion/media';
import type { CScene, Compiled } from '../compile';
import type { Scene } from '../schema';
import { ensureFonts } from '../fonts';
import { bgColorFor, makeTheme, ThemeProvider, useTheme, alpha, onColor } from './theme';
import { Background, Grain } from './Background';
import { TextLayerView } from './TextLayer';
import { ImageLayerView } from './ImageLayer';
import { ShapeLayerView } from './ShapeLayer';
import { CounterLayerView } from './CounterLayer';
import { UILayerView } from './UILayer';
import { clamp01 } from './anim';
import { clearMeasure } from './measure';
import { detectDir, groupRuns, toDigits } from '../text';

export const fontsOf = (c: Compiled) => Object.values(c.plan.style.fonts);
export const prepare = async (c: Compiled) => {
  await ensureFonts(fontsOf(c));
  clearMeasure();
};

const TR_FRAMES: Record<Scene['transition'], number> = { cut: 0, flash: 7, whip: 9, zoom: 12, fade: 12, 'slide-up': 12, glitch: 8, iris: 14, blur: 12, wipe: 12, shutter: 12 };
export const trFrames = (id: Scene['transition'], fps: number) => Math.round((TR_FRAMES[id] * fps) / 30);

const TransitionIn = ({ id, children }: { id: Scene['transition']; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const n = trFrames(id, t.fps);
  if (!n || frame >= n) return <AbsoluteFill>{children}</AbsoluteFill>;
  const r = clamp01(frame / n);
  const p = 1 - Math.pow(1 - r, 3);
  const { W, H, u } = t;
  let style: React.CSSProperties = {};
  let over: ReactNode = null;
  switch (id) {
    case 'flash': over = <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: 1 - r }} />; break;
    case 'whip': style = { transform: `translateX(${(1 - p) * -W * 1.1}px)`, filter: `blur(${(1 - p) * 40 * u}px)` }; break;
    case 'zoom': style = { transform: `scale(${1.5 - 0.5 * p})`, opacity: p, filter: `blur(${(1 - p) * 16 * u}px)` }; break;
    case 'fade': style = { opacity: p }; break;
    case 'slide-up': style = { transform: `translateY(${(1 - p) * H}px)` }; break;
    case 'glitch': style = { transform: `translateX(${Math.sin(frame * 9) * (1 - r) * 40 * u}px)`, filter: `hue-rotate(${(1 - r) * 90}deg) saturate(${1 + (1 - r) * 2})` }; over = r < 0.6 ? <AbsoluteFill style={{ backgroundColor: alpha(t.style.palette.accent, 0.25 * (1 - r)) }} /> : null; break;
    case 'iris': style = { clipPath: `circle(${p * 78}% at 50% 50%)` }; break;
    case 'blur': style = { opacity: p, filter: `blur(${(1 - p) * 30 * u}px)` }; break;
    case 'wipe': style = { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` }; break;
    case 'shutter': style = { clipPath: `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0)` }; break;
  }
  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
      {children}
      {over}
    </AbsoluteFill>
  );
};

/** Camera move over the whole scene composition (and parallax offsets for images). */
const useCamera = (s: CScene) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const k = clamp01(frame / Math.max(1, s.duration));
  const a = s.camera.amount;
  const e = 1 - Math.pow(1 - k, 2);
  const W = t.W;
  let scale = 1, x = 0, y = 0, rot = 0;
  switch (s.camera.move) {
    case 'push': scale = 1 + 0.12 * a * e; break;
    case 'pull': scale = 1 + 0.12 * a * (1 - e); break;
    case 'pan-left': x = -W * 0.06 * a * e; scale = 1.06; break;
    case 'pan-right': x = W * 0.06 * a * e; scale = 1.06; break;
    case 'rise': y = -W * 0.05 * a * e; scale = 1.04; break;
    case 'drift': x = Math.sin(frame / 40) * W * 0.012 * a; y = Math.cos(frame / 50) * W * 0.012 * a; scale = 1.03; break;
    case 'shake': { const d = Math.max(0, 1 - frame / 14); x = Math.sin(frame * 3.1) * 16 * t.u * d; y = Math.cos(frame * 2.3) * 12 * t.u * d; scale = 1 + 0.05 * a * e; break; }
    case 'tilt': rot = (-1.5 + 3 * e) * a; scale = 1.05; break;
    case 'punch': scale = 1 + 0.1 * a * Math.max(0, 1 - frame / 10) + 0.04 * a * e; break;
    default: break;
  }
  return { style: { transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rot}deg)` }, dx: x * 0.6, dy: y * 0.6 };
};

const SceneLayers = ({ s }: { s: CScene }) => {
  const cam = useCamera(s);
  return (
    <AbsoluteFill style={cam.style}>
      {s.layers.map((l) => {
        switch (l.type) {
          case 'text': return <TextLayerView key={l.id} l={l} />;
          case 'image': return <ImageLayerView key={l.id} l={l} cam={cam} />;
          case 'shape': return <ShapeLayerView key={l.id} l={l} />;
          case 'counter': return <CounterLayerView key={l.id} l={l} />;
          case 'ui': return <UILayerView key={l.id} l={l} />;
          default: return null;
        }
      })}
    </AbsoluteFill>
  );
};

const SceneView = ({ s, c, ready, showBg }: { s: CScene; c: Compiled; ready: boolean; showBg: boolean }) => {
  const frame = useCurrentFrame();
  const base = bgColorFor(c.plan.style, s.bg.tone, s.bg.color);
  const theme = useMemo(() => makeTheme({ W: c.width, H: c.height, fps: c.fps, style: c.plan.style, tone: s.bg.tone, bg: base, digits: c.digits }), [c, s.bg.tone, base]);
  return (
    <ThemeProvider value={theme}>
      <TransitionIn id={s.transition}>
        {showBg && <Background bg={s.bg} base={base} url={s.bgUrl} abs={s.startF + frame} seed={s.id} />}
        {ready && <SceneLayers s={s} />}
      </TransitionIn>
    </ThemeProvider>
  );
};

/** Talking-head footage, continuous across scenes; layout per scene (full / top / bottom / pip / hidden). */
const Speaker = ({ c }: { c: Compiled }) => {
  const frame = useCurrentFrame();
  if (!c.video.length) return null;
  const { width: W, height: H } = c;
  const u = Math.min(W, H) / 1080;
  const i = c.scenes.findLastIndex((s) => s.startF <= frame);
  const cur = c.scenes[Math.max(0, i)]!;
  const prev = c.scenes[Math.max(0, i - 1)]!;
  const box = (m: Scene['speaker']) => (m === 'top' ? [0, 0, W, H * 0.52, 0] : m === 'bottom' ? [0, H * 0.48, W, H * 0.52, 0] : m === 'pip' ? [W - 380 * u, H * 0.12, 320 * u, 320 * u, 160 * u] : m === 'hidden' ? [W / 2, H / 2, 0, 0, 0] : [0, 0, W, H, 0]);
  const a = box(prev.speaker ?? 'full'), b = box(cur.speaker ?? 'full');
  const k = i > 0 ? clamp01((frame - cur.startF) / 9) : 1;
  const v = b.map((x, j) => a[j]! + (x - a[j]!) * k) as [number, number, number, number, number];
  const zoom = 1 + 0.08 * Math.max(0, 1 - (frame - cur.startF) / 20);
  return (
    <div style={{ position: 'absolute', left: v[0], top: v[1], width: v[2], height: v[3], borderRadius: v[4], overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})` }}>
        {c.video.map((seg, j) => (
          <Sequence key={j} from={seg.from} durationInFrames={seg.duration} layout="none">
            <Video src={seg.src} trimBefore={seg.trimBefore} objectFit="cover" style={{ position: 'absolute', left: 0, top: 0, width: v[2], height: v[3] }} volume={(f) => Math.min(1, (f + 1) / 2, (seg.duration - f) / 2)} />
          </Sequence>
        ))}
      </div>
    </div>
  );
};

const Captions = ({ c }: { c: Compiled }) => {
  const frame = useCurrentFrame();
  const line = c.captions.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  const u = Math.min(c.width, c.height) / 1080;
  const st = c.plan.style;
  const f = st.fonts.display;
  const words = line.words.map((w) => toDigits(w.text, c.digits));
  const dir = detectDir(words.join(' '));
  const boxed = st.captions === 'boxed';
  return (
    <div dir={dir} style={{ position: 'absolute', left: c.width * 0.08, width: c.width * 0.84, top: c.height * 0.74, textAlign: 'center', fontFamily: `"${f.lat}", "${f.ar}", sans-serif`, fontWeight: 800, fontSize: 62 * u, lineHeight: 1.5 }}>
      {groupRuns(words).map((run, ri) => (
        <span key={ri} dir={run.dir} style={{ unicodeBidi: 'isolate' }}>
          {run.idx.map((k) => {
            const w = line.words[k]!;
            const on = frame >= w.start && frame < Math.max(w.end, w.start + 1);
            const bg = on ? st.palette.accent : boxed ? alpha('#000000', 0.72) : 'rgba(0,0,0,0)';
            return <span key={k} style={{ display: 'inline-block', margin: `0 ${6 * u}px`, padding: boxed || on ? `0 ${14 * u}px` : 0, borderRadius: 14 * u, backgroundColor: bg, color: on ? onColor(st.palette.accent) : '#FFFFFF', WebkitTextStroke: boxed || on ? undefined : `${8 * u}px rgba(0,0,0,0.85)`, paintOrder: 'stroke fill', transform: on && st.captions === 'pop' ? 'scale(1.1)' : undefined }}>{words[k]}</span>;
          })}{' '}
        </span>
      ))}
    </div>
  );
};

export const Reel: FC<{ c: Compiled }> = ({ c }) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    prepare(c).catch(() => undefined).finally(() => {
      if (!alive) return;
      setReady(true);
      continueRender(h);
    });
    return () => {
      alive = false;
    };
  }, [c, h]);
  const frame = useCurrentFrame();
  const theme0 = useMemo(() => makeTheme({ W: c.width, H: c.height, fps: c.fps, style: c.plan.style, tone: 'dark', bg: c.plan.style.palette.dark, digits: c.digits }), [c]);
  const talking = c.mode === 'talking' && c.video.length > 0;
  const hold = (i: number) => trFrames(c.scenes[i + 1]?.transition ?? 'cut', c.fps);
  return (
    <ThemeProvider value={theme0}>
      <AbsoluteFill style={{ backgroundColor: c.plan.style.palette.dark, overflow: 'hidden' }}>
        {!talking
          ? c.scenes.map((s, i) => (
              <Sequence key={s.id + i} from={s.startF} durationInFrames={s.duration + hold(i)} layout="none">
                <SceneView s={s} c={c} ready={ready} showBg />
              </Sequence>
            ))
          : (
            <>
              {c.scenes.map((s, i) => (
                <Sequence key={`b${s.id}${i}`} from={s.startF} durationInFrames={s.duration + hold(i)} layout="none">
                  <SceneView s={{ ...s, layers: [] }} c={c} ready={false} showBg />
                </Sequence>
              ))}
              <Speaker c={c} />
              {c.scenes.map((s, i) => (
                <Sequence key={`l${s.id}${i}`} from={s.startF} durationInFrames={s.duration} layout="none">
                  <SceneView s={s} c={c} ready={ready} showBg={false} />
                </Sequence>
              ))}
            </>
          )}
        <Grain amount={c.plan.style.grain} frame={frame} />
        {ready && c.captions.length > 0 && <Captions c={c} />}
        {c.voice && <Audio src={c.voice} />}
        {c.music && <Audio src={c.music.src} loop volume={(f) => (c.music!.gain[f] ?? 0) * c.music!.volume} />}
        {c.sfx.map((e, i) => (
          <Sequence key={`s${i}`} from={e.frame} durationInFrames={Math.round(c.fps * 2)} layout="none">
            <Audio src={e.src} volume={e.volume} />
          </Sequence>
        ))}
        {c.safe && <SafeOverlay c={c} />}
      </AbsoluteFill>
    </ThemeProvider>
  );
};

const SafeOverlay = ({ c }: { c: Compiled }) => (
  <AbsoluteFill>
    <div style={{ position: 'absolute', left: 0, top: 0, width: c.width, height: c.height * 0.1, backgroundColor: 'rgba(255,0,80,0.2)' }} />
    <div style={{ position: 'absolute', left: 0, bottom: 0, width: c.width, height: c.height * 0.2, backgroundColor: 'rgba(255,0,80,0.2)' }} />
    <div style={{ position: 'absolute', right: 0, top: 0, width: c.width * 0.1, height: c.height, backgroundColor: 'rgba(255,0,80,0.14)' }} />
  </AbsoluteFill>
);
