/**
 * doodle — ONE continuous take through one inked world. The camera holds while a sentence is spoken and travels in
 * the pauses; characters walk (phase from distance), talk, gesture; every sentence gets one storytelling object; the
 * narration appears word by word at the top with one orange squiggled word per line.
 */
import type { CSSProperties } from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { useVideo } from '@/engine/context';
import { clamp, ease, lerp, prog, springAt } from '@/engine/anim';
import { keyIndex, clean } from '@/engine/lexicon';
import { measure, wrapWords } from '@/engine/measure';
import { Character, Cloud, Ink, Prop, Sun, type Look, type Pose } from './art';
import { ellipse } from './ink';
import { AccentWord, CardIcon, InkBox, QBadge, Thought, TINTS } from './overlays';
import type { DoodleBeat, DoodlePlan } from './schema';
import { GROUND, K } from './tokens';
import { CHAR_H, FEET, HORIZON, ZW, beatStarts, cameraKeys, placeProps, stagePositions, walks } from './world';

type Frame = { W: number; H: number; u: number; base: number; ax: number; feet: number; textBox: CSSProperties; textAlign: 'center' | 'right'; textW: number };

const frameFor = (W: number, H: number): Frame => {
  const u = Math.min(W, H) / 1080;
  if (W > H * 1.2) return { W, H, u, base: (H / 1920) * 1.67, ax: 0.42, feet: 0.84, textBox: { right: W * 0.04, top: H * 0.09, width: W * 0.42 }, textAlign: 'right', textW: W * 0.42 };
  if (H > W * 1.4) return { W, H, u, base: H / 1920, ax: 0.5, feet: 0.76, textBox: { left: 80 * u, right: 80 * u, top: H * 0.13 }, textAlign: 'center', textW: W - 160 * u };
  if (H > W * 1.1) return { W, H, u, base: (H / 1920) * 1.24, ax: 0.5, feet: 0.8, textBox: { left: 70 * u, right: 70 * u, top: H * 0.08 }, textAlign: 'center', textW: W - 140 * u };
  return { W, H, u, base: (H / 1920) * 1.42, ax: 0.5, feet: 0.85, textBox: { left: 60 * u, right: 60 * u, top: H * 0.06 }, textAlign: 'center', textW: W - 120 * u };
};

const lookOf = (plan: DoodlePlan, id: string): Look => {
  const c = plan.cast.find((x) => x.id === id) ?? plan.cast[0]!;
  return { kind: c.kind, outfit: c.outfit, color: c.color };
};

export const DoodleVideo = ({ plan }: { plan: DoodlePlan }) => {
  const frame = useCurrentFrame();
  const { T, W, H, fps, contentEnd } = useVideo();
  const t = frame / fps;
  const F = frameFor(W, H);
  const starts = beatStarts(plan, T);
  const positions = stagePositions(plan);
  const walkList = walks(plan, T, positions);
  const keys = cameraKeys(plan, T, positions, walkList);
  let bi = 0;
  starts.forEach((s, i) => {
    if (t >= s - 0.35) bi = i;
  });
  const beat = plan.beats[bi]!;
  // camera: hold, then ease to the next key inside its window
  let camX = keys[0]!.x;
  let zoom = keys[0]!.zoom;
  keys.forEach((k) => {
    const p = prog(t, k.t0, k.t1, k.sine ? ease.inOutSine : ease.inOutCubic);
    camX = lerp(camX, k.x, p);
    zoom = lerp(zoom, k.zoom, p);
  });
  // handheld drift ±4 px, ±0.15° at ~0.2 Hz
  const hx = Math.sin(t * 1.25) * 4 * F.u;
  const hr = Math.sin(t * 0.9 + 1) * 0.15;
  const sc = zoom * F.base;
  const sx = (wx: number) => (wx - camX) * sc + F.ax * W;
  const sy = (wy: number) => (wy - FEET) * sc + F.feet * H;
  const horizonY = sy(HORIZON);
  const dusk = prog(t, contentEnd * 0.82, contentEnd, ease.linear);
  const mixC = (a: string, b: string, k: number) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i]!, k))).join(',')})`;
  };
  const props = placeProps(plan);
  const worldEnd = plan.zones.length * ZW;

  // cast state now
  const castNow = plan.cast
    .map((c) => {
      const first = positions.findIndex((p) => p[c.id] !== undefined);
      if (first < 0 || t < Math.max(0, starts[first]! - 0.6)) return null;
      const ws = walkList.filter((w) => w.id === c.id);
      let x = positions[first]![c.id]!;
      let moving = 0;
      let dir = 0;
      let dist = 0;
      ws.forEach((w) => {
        if (t >= w.t0) {
          const k = prog(t, w.t0, w.t1, ease.inOutSine);
          x = lerp(w.x0, w.x1, k);
          dist += Math.abs(w.x1 - w.x0) * k;
          if (k > 0 && k < 1) {
            moving = 1;
            dir = Math.sign(w.x1 - w.x0);
          }
        }
      });
      return { c, x, moving, dir, dist };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  const focusId = beat.cast[0];
  const focus = castNow.find((x) => x.c.id === focusId) ?? castNow[0];
  const at = beat.at ? T.byId(beat.at).start : starts[bi]!;
  const pop = springAt(t, at - 0.05, { damping: 12, stiffness: 180, mass: 0.6 });
  const beatEnd = bi + 1 < plan.beats.length ? starts[bi + 1]! - 0.35 : contentEnd;
  const out = prog(t, beatEnd - 0.4, beatEnd, ease.inCubic);
  const objK = Math.min(1, pop) * (1 - out);

  const headY = (x: { c: { kind: string } }) => sy(FEET - CHAR_H * (x.c.kind === 'kid' ? 0.66 : 1) - 20);
  const lineOfBeat = beat.text;

  return (
    <AbsoluteFill style={{ background: K.skyTop, overflow: 'hidden' }}>
      {/* sky */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${mixC(K.skyTop, K.skyDuskTop, dusk)} 0%, ${mixC(K.skyHorizon, K.skyDuskHorizon, dusk)} ${Math.max(5, (horizonY / H) * 100)}%, ${mixC(K.skyHorizon, K.skyDuskHorizon, dusk)} 100%)` }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${hx} 0) rotate(${hr} ${W / 2} ${H / 2})`}>
          {/* sun & hero cloud (parallax 0.3) */}
          <g transform={`translate(${(worldEnd * 0.15 - camX) * sc * 0.3 + W * 0.25} ${horizonY - 20 * sc}) scale(${sc})`}>
            <Sun />
          </g>
          <g transform={`translate(${(ZW * 0.6 - camX) * sc * 0.3 + W * 0.55} ${Math.max(H * 0.36, horizonY - 520 * sc)}) scale(${sc * 0.9})`}>
            <Cloud seed={4} />
          </g>
          {/* ground: zones blend along x */}
          <defs>
            <linearGradient id="dg" gradientUnits="userSpaceOnUse" x1={sx(0)} y1={0} x2={sx(worldEnd)} y2={0}>
              {plan.zones.map((z, i) => (
                <stop key={i} offset={(i + 0.5) / plan.zones.length} stopColor={GROUND[z.ground]} />
              ))}
            </linearGradient>
            <linearGradient id="dshade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={K.grassShade} stopOpacity={0} />
              <stop offset="1" stopColor={K.grassShade} stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <rect x={-50} y={horizonY} width={W + 100} height={H - horizonY + 50} fill="url(#dg)" />
          <rect x={-50} y={sy(1700)} width={W + 100} height={H} fill="url(#dshade)" />
          <Ink d={`M${-50} ${horizonY} ${Array.from({ length: 14 }, (_, i) => `Q${(i + 0.5) * (W / 12) - 50} ${horizonY - 10 * sc} ${(i + 1) * (W / 12) - 50} ${horizonY}`).join(' ')}`} w={3} seed={9} />
          {/* back props */}
          {props
            .filter((p) => p.back && Math.abs(sx(p.x) - W / 2) < W * 0.9)
            .map((p, i) => (
              <g key={`b${i}`} transform={`translate(${sx(p.x)} ${sy(p.y)}) scale(${sc * p.s})`}>
                <Prop kind={p.kind} seed={p.seed} />
              </g>
            ))}
          {/* water channels pass BEHIND the feet */}
          {plan.zones.map((z, i) =>
            z.water ? (
              <g key={`w${i}`}>
                <rect x={sx(i * ZW)} y={sy(1335)} width={ZW * sc} height={44 * sc} fill={K.water} />
                {Array.from({ length: 8 }, (_, j) => (
                  <rect key={j} x={sx(i * ZW + ((j * ZW) / 8 + t * 60) % ZW)} y={sy(1352)} width={50 * sc} height={5 * sc} rx={2} fill="#EAF6F8" />
                ))}
                <Ink d={`M${sx(i * ZW)} ${sy(1335)} L${sx((i + 1) * ZW)} ${sy(1335)} M${sx(i * ZW)} ${sy(1379)} L${sx((i + 1) * ZW)} ${sy(1379)}`} w={3.5} seed={i + 40} />
              </g>
            ) : null,
          )}
          {/* characters, sorted by foot y (all on the same line here: by x for stable layering) */}
          {castNow.map(({ c, x, moving, dir, dist }, k) => {
            const isFocus = c.id === focusId;
            const speaking = isFocus && (beat.kind === 'speak' || beat.kind === 'introduce') ? T.words.some((w) => t >= w.start && t <= w.end && w.start >= starts[bi]! && t < beatEnd) : false;
            const gestureUp = isFocus && (beat.kind === 'gesture' || beat.kind === 'nameTag' || beat.kind === 'reveal') ? prog(t, at - 0.1, at + 0.25, ease.outBack) * (1 - prog(t, beatEnd - 0.5, beatEnd - 0.15, ease.inOutCubic)) : 0;
            const facing = moving ? dir : focus && c.id !== focus.c.id ? Math.sign(focus.x - x) || -1 : -0.35;
            const blinkSeed = Math.floor((t + k * 1.3) / 4);
            const pose: Pose = {
              walk: moving ? (dist / (0.55 * CHAR_H)) * Math.PI : 0,
              face: facing,
              armN: 8 + gestureUp * 110,
              armF: 6,
              talk: speaking ? 0.5 + 0.5 * Math.sin(t * 16) : 0,
              breath: 0.5 + 0.5 * Math.sin(t * 2.5 + k),
              tilt: isFocus && beat.kind === 'question' ? 8 * prog(t, at, at + 0.3, ease.outCubic) : 0,
              blink: (t + k * 1.3) % 4 > 3.85 + random(`bl${blinkSeed}`) * 0.1,
            };
            return (
              <g key={c.id} transform={`translate(${sx(x)} ${sy(FEET)}) scale(${sc})`}>
                <Character look={lookOf(plan, c.id)} pose={pose} seed={k * 40 + 7} />
              </g>
            );
          })}
          {/* front props (stones, sprouts, goods) */}
          {props
            .filter((p) => !p.back && Math.abs(sx(p.x) - W / 2) < W * 0.9)
            .map((p, i) => (
              <g key={`f${i}`} transform={`translate(${sx(p.x)} ${sy(p.y)}) scale(${sc * p.s})`}>
                <Prop kind={p.kind} seed={p.seed} />
              </g>
            ))}
          {/* weather */}
          {beat.kind === 'weather' && beat.weather === 'rain' &&
            Array.from({ length: 60 }, (_, i) => {
              const rx = random(`rx${i}`) * W;
              const ry = ((random(`ry${i}`) * H * 0.6 + t * 900 * F.u) % (H * 0.6)) + H * 0.25;
              return <rect key={i} x={rx + (ry - H * 0.25) * 0.14} y={ry} width={3 * F.u} height={18 * F.u} rx={1.5} fill={K.rain} opacity={objK} transform={`rotate(8 ${rx} ${ry})`} />;
            })}
          {(beat.kind === 'establish' || beat.kind === 'reveal' || beat.kind === 'closing' || (beat.kind === 'weather' && beat.weather === 'sparkles')) &&
            Array.from({ length: 7 }, (_, i) => {
              const a = (i / 7) * Math.PI * 2;
              const cx = (focus ? sx(focus.x) : W / 2) + Math.cos(a) * 220 * sc;
              const cy = sy(FEET - 200) + Math.sin(a) * 160 * sc;
              const tw = 0.6 + 0.4 * Math.abs(Math.sin(t * 3 + i));
              const r = (14 + (i % 3) * 4) * F.u * tw;
              const d = `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z`;
              return (
                <g key={i} opacity={clamp(objK * 1.2)}>
                  <path d={d} fill={K.sunHalo} />
                  <Ink d={d} w={2.5} seed={i} />
                </g>
              );
            })}
          {beat.kind === 'weather' && beat.weather === 'sun' && (
            <g opacity={objK}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2 + t * 0.2;
                const cx = W * 0.25;
                const cy = horizonY - 20 * sc;
                return <Ink key={i} d={`M${cx + Math.cos(a) * 170 * sc} ${cy + Math.sin(a) * 170 * sc} L${cx + Math.cos(a) * 230 * sc} ${cy + Math.sin(a) * 230 * sc}`} w={4} seed={i} />;
              })}
            </g>
          )}
          {/* ground shadow ellipse for props? (kept on characters only) */}
          <path d={ellipse(-100, -100, 1, 1)} fill="none" />
        </g>
      </svg>

      {/* storytelling objects (screen space) */}
      {focus && objK > 0.001 && <BeatObject beat={beat} plan={plan} F={F} x={sx(focus.x)} headY={headY(focus)} topY={Math.min(...castNow.map(headY))} k={objK} t={t} T={T} text={lineOfBeat} />}
      {beat.kind === 'quote' && (
        <AbsoluteFill style={{ background: `rgba(255,255,255,${0.7 * objK})` }}>
          <QuoteCard text={beat.text} F={F} k={objK} t={t} />
        </AbsoluteFill>
      )}
      <Caption plan={plan} F={F} t={t} />
      {/* paper grain (static, warm) */}
      <AbsoluteFill style={{ background: 'linear-gradient(0deg, rgba(120,90,60,0.035), rgba(120,90,60,0.02))', pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

/* ───────────────────────────── objects ───────────────────────────── */

const BeatObject = ({ beat, plan, F, x, headY, topY, k, t, T, text }: { beat: DoodleBeat; plan: DoodlePlan; F: Frame; x: number; headY: number; topY: number; k: number; t: number; T: ReturnType<typeof useVideo>['T']; text: string }) => {
  const u = F.u;
  const fs = 44 * u;
  const scaleIn = (origin: string): CSSProperties => ({ transform: `scale(${0.6 + 0.4 * Math.min(1.06, k)})`, transformOrigin: origin, opacity: clamp(k * 1.4) });
  switch (beat.kind) {
    case 'speak': {
      const words = (text || '').split(' ');
      const maxW = Math.min(F.W * 0.86, 820 * u);
      const lines = wrapWords(text, maxW - 56 * u, 'Readex Pro', 700, fs);
      const w = Math.min(maxW, Math.max(...lines.map((l) => measure(l, 'Readex Pro', 700, fs))) + 64 * u);
      const h = lines.length * fs * 1.35 + 36 * u;
      const left = Math.max(30 * u, Math.min(F.W - w - 30 * u, x - w / 2));
      const top = Math.min(headY, topY) - h - 70 * u;
      const ki = keyIndex(words.map(clean));
      return (
        <div style={{ position: 'absolute', left, top, ...scaleIn(`${x - left}px ${h + 28}px`) }}>
          <InkBox w={w} h={h} r={48 * u} tail="down" tailX={x - left}>
            <div dir="rtl" style={{ fontFamily: K.font, fontWeight: 700, fontSize: fs, color: K.text, lineHeight: 1.35, textAlign: 'center', padding: `0 ${28 * u}px` }}>
              {words.map((wd, i) => (
                <span key={i} style={{ color: i === ki ? K.accent : K.text }}>
                  {wd}
                  {i < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </div>
          </InkBox>
        </div>
      );
    }
    case 'think': {
      const w = 300 * u;
      const h = 210 * u;
      return (
        <div style={{ position: 'absolute', left: x - w * 0.15, top: headY - h - 110 * u, ...scaleIn('20% 120%') }}>
          <Thought w={w} h={h}>
            <CardIcon id={beat.icon || 'sparkles'} size={110 * u} tint={TINTS[0]!} />
          </Thought>
        </div>
      );
    }
    case 'question':
      return (
        <div style={{ position: 'absolute', left: x - 40 * u, top: headY - 120 * u, ...scaleIn('50% 100%'), transform: `scale(${Math.min(1.15, 0.2 + k)}) rotate(${Math.sin(t * 10) * 8 * Math.max(0, 1 - (k - 1) * 4)}deg)` }}>
          <QBadge size={80 * u} />
        </div>
      );
    case 'nameTag':
    case 'introduce': {
      const name = text || plan.cast.find((c) => c.id === beat.cast[0])?.name || '';
      if (!name) return null;
      const tfs = 42 * u;
      const w = Math.max(210 * u, measure(name, 'Readex Pro', 700, tfs) + 56 * u);
      const h = 76 * u;
      const left = x - 80 * u - w;
      return (
        <div style={{ position: 'absolute', left: Math.max(24 * u, left), top: headY + 90 * u, ...scaleIn('100% 50%') }}>
          <InkBox w={w} h={h} r={14 * u} glow>
            <span dir="rtl" style={{ fontFamily: K.font, fontWeight: 700, fontSize: tfs, color: K.accent, lineHeight: 1.2 }}>{name}</span>
          </InkBox>
        </div>
      );
    }
    case 'cards': {
      const n = beat.items.length;
      if (!n) return null;
      const cw = Math.min(240 * u, (F.W - 48 * u - (n - 1) * 24 * u) / n);
      const ch = cw * 0.96;
      const total = n * cw + (n - 1) * 24 * u;
      const top = F.H * (F.W > F.H ? 0.36 : 0.36);
      return (
        <>
          {beat.items.map((it, i) => {
            const kk = springAt(t, T.byId(it.at).start - 0.05, { damping: 12, stiffness: 180, mass: 0.6 });
            const active = t >= T.byId(it.at).start && (i === n - 1 || t < T.byId(beat.items[i + 1]!.at).start);
            // RTL: first item on the right
            const left = F.W / 2 + total / 2 - (i + 1) * cw - i * 24 * u;
            return kk > 0.001 ? (
              <div key={i} style={{ position: 'absolute', left, top, transform: `scale(${0.6 + 0.4 * Math.min(1.06, kk)})`, transformOrigin: '50% 110%', opacity: clamp(kk * 1.4) * (1 - prog(t, T.byId(it.at).start + 99, 1e9)) * (k > 0 ? Math.max(0.0, k) : 0) }}>
                <InkBox w={cw} h={ch} r={22 * u} tail="down" glow={active}>
                  <CardIcon id={it.icon} size={cw * 0.42} tint={TINTS[i % 4]!} />
                  <span dir="rtl" style={{ fontFamily: K.font, fontWeight: 700, fontSize: Math.min(34 * u, (cw * 0.86) / Math.max(3, it.t.length * 0.55)), color: K.text, lineHeight: 1.3, marginTop: 10 * u, textAlign: 'center' }}>
                    {it.t}
                  </span>
                </InkBox>
              </div>
            ) : null;
          })}
        </>
      );
    }
    case 'closing': {
      if (!text) return null;
      const tfs = 34 * u;
      const w = measure(text, 'Readex Pro', 700, tfs) + 70 * u;
      return (
        <div style={{ position: 'absolute', left: F.W / 2 - w / 2, top: F.H * (F.W > F.H ? 0.32 : 0.3), ...scaleIn('50% 50%') }}>
          <InkBox w={w} h={70 * u} r={35 * u}>
            <span dir="rtl" style={{ fontFamily: K.font, fontWeight: 700, fontSize: tfs, color: K.text }}>{text}</span>
          </InkBox>
        </div>
      );
    }
    default:
      return null;
  }
};

const QuoteCard = ({ text, F, k, t }: { text: string; F: Frame; k: number; t: number }) => {
  const u = F.u;
  const fs = 70 * u;
  const w = Math.min(F.W * 0.86, 900 * u);
  const lines = wrapWords(text, w - 120 * u, 'Readex Pro', 700, fs);
  const h = Math.max(360 * u, lines.length * fs * 1.45 + 140 * u);
  const words = text.split(' ');
  const ki = keyIndex(words.map(clean));
  return (
    <div style={{ position: 'absolute', left: F.W / 2 - w / 2, top: F.H * 0.5 - h / 2, transform: `scale(${0.9 + 0.1 * k})`, opacity: k }}>
      <InkBox w={w} h={h} r={36 * u}>
        <div dir="rtl" style={{ fontFamily: K.font, fontWeight: 700, fontSize: fs, color: K.text, lineHeight: 1.45, textAlign: 'center', padding: `0 ${60 * u}px` }}>
          {words.map((wd, i) => (
            <span key={i}>
              {i === ki ? (
                <AccentWord draw={k} t={t} u={u}>
                  {wd}
                </AccentWord>
              ) : (
                wd
              )}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
      </InkBox>
    </div>
  );
};

/* ───────────────────────────── narration caption ───────────────────────────── */

const Caption = ({ plan, F, t }: { plan: DoodlePlan; F: Frame; t: number }) => {
  const { T } = useVideo();
  const li = T.lines.findIndex((l, i) => t >= l.start - 0.1 && (i === T.lines.length - 1 || t < T.lines[i + 1]!.start - 0.05));
  if (li < 0) return null;
  const line = T.lines[li]!;
  const next = T.lines[li + 1];
  const out = next ? prog(t, next.start - 0.35, next.start - 0.05, ease.inQuad) : 0;
  const accentId = plan.accents[li] ?? line.words[keyIndex(line.words.map((w) => clean(w.w)))]!.id;
  let fs = 64 * F.u;
  while (wrapWords(line.text, F.textW, 'Readex Pro', 700, fs).length > 2 && fs > 40 * F.u) fs *= 0.92;
  const sub = plan.subtitles[li];
  const subK = prog(t, line.end, line.end + 0.3, ease.outQuad);
  return (
    <div dir="rtl" style={{ position: 'absolute', ...F.textBox, textAlign: F.textAlign, fontFamily: K.font, opacity: 1 - out }}>
      {plan.series && <div style={{ fontWeight: 600, fontSize: 24 * F.u, color: K.text, marginBottom: 14 * F.u, opacity: 0.85 }}>{plan.series}</div>}
      <div style={{ fontWeight: 700, fontSize: fs, color: K.text, lineHeight: 1.4 }}>
        {line.words.map((w, i) => {
          const k = prog(t, w.start - 0.02, w.start + 0.23, ease.outCubic);
          const isAccent = w.id === accentId;
          return (
            <span key={w.id} style={{ display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 10 * F.u}px)`, filter: k < 1 ? `blur(${(1 - k) * 4 * F.u}px)` : undefined, marginInlineEnd: i < line.words.length - 1 ? fs * 0.26 : 0 }}>
              {isAccent ? (
                <AccentWord draw={prog(t, w.start + 0.15, w.start + 0.5, ease.inOutSine)} t={t} u={F.u}>
                  {w.w}
                </AccentWord>
              ) : (
                w.w
              )}
            </span>
          );
        })}
      </div>
      {sub && <div dir="auto" style={{ marginTop: 14 * F.u, fontWeight: 600, fontSize: 24 * F.u, color: K.subtitle, opacity: subK, transform: `translateY(${(1 - subK) * 6 * F.u}px)`, lineHeight: 1.35 }}>{sub}</div>}
    </div>
  );
};
