/**
 * Hero compositions (QUALITY_BAR): every scene gets a large, topic-literal hero visual (≥ 35 % of the frame,
 * measured by the `data-hero` box), layered depth (backdrop → hero → props/badges → label), a 1–3 word label
 * that never repeats the caption, an entrance, an emphasis pulse, an idle loop and a slow camera push.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Img } from 'remotion';
import { mix, withAlpha } from '@/lib/color/contrast';
import { art3dPath, findArt, isArt3D } from '@/lib/design/art3d';
import { publicUrl } from '@/lib/audio/library';
import type { Hero } from '@/lib/schema/plan';
import { formatNumber } from '@/lib/text/digits';
import { renderIllustration, ILLUSTRATIONS } from '../illustrations';
import { Chip, Headline, usePrim } from './kit';
import { Icon } from '../Icon';
import { clamp01 } from '../motion';
import type { Theme } from '../theme';

/** A 3D object (or an Iconify concept as a last resort). */
export const Art = ({ id, size, style }: { id?: string; size: number; style?: CSSProperties }) => {
  if (id && isArt3D(id)) return <Img src={publicUrl(art3dPath(id))} style={{ width: size, height: size, objectFit: 'contain', display: 'block', ...style }} />;
  return <Icon id={id ?? 'sparkle'} size={size} style={style} />;
};

/** Animated vector illustration (src/video/illustrations). */
export const Illustration = ({ id, params, size, uid, frame, fps, dur, t }: { id: string; params?: Hero['illusParams']; size: number; uid: string; frame: number; fps: number; dur: number; t: Theme }) => {
  const markup = renderIllustration(id, { f: frame, fps, dur, uid: uid.replace(/[^a-zA-Z0-9]/g, ''), c: { primary: t.c.primary, accent: t.c.accent, text: t.c.text, bg: t.c.bg[0]!, good: t.c.good, bad: t.c.bad }, p: params ?? {} });
  if (!markup) return null;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width={size} height={size} style={{ display: 'block', overflow: 'visible' }} dangerouslySetInnerHTML={{ __html: markup }} />;
};

const Backdrop = ({ kind, w, h, p, frame, t }: { kind: NonNullable<Hero['backdrop']>; w: number; h: number; p: number; frame: number; t: Theme }) => {
  if (kind === 'none') return null;
  const c = t.c;
  const d = Math.min(w, h) * 0.94;
  const soft = t.isDark ? withAlpha(c.primary, 0.32) : mix(c.bg[0]!, c.primary, 0.22);
  const soft2 = t.isDark ? withAlpha(c.accent, 0.26) : mix(c.bg[0]!, c.accent, 0.3);
  const sc = 0.55 + 0.45 * clamp01(p);
  const base: CSSProperties = { position: 'absolute', left: (w - d) / 2, top: (h - d) / 2, width: d, height: d, transform: `scale(${sc}) rotate(${frame * 0.08}deg)` };
  switch (kind) {
    case 'disc':
      return (
        <>
          <div style={{ ...base, borderRadius: '50%', backgroundImage: `linear-gradient(160deg, ${soft2}, ${soft})` }} />
          <div style={{ ...base, left: (w - d * 0.74) / 2, top: (h - d * 0.74) / 2, width: d * 0.74, height: d * 0.74, borderRadius: '50%', backgroundColor: withAlpha('#FFFFFF', t.isDark ? 0.06 : 0.35) }} />
        </>
      );
    case 'blob':
      return <div style={{ ...base, borderRadius: '58% 42% 55% 45% / 46% 58% 42% 54%', backgroundImage: `linear-gradient(140deg, ${soft}, ${soft2})` }} />;
    case 'arch':
      return <div style={{ position: 'absolute', left: w * 0.1, top: h * 0.06, width: w * 0.8, height: h * 0.9, borderRadius: `${w * 0.4}px ${w * 0.4}px ${t.radius(1)}px ${t.radius(1)}px`, backgroundImage: `linear-gradient(180deg, ${soft2}, ${soft})`, transform: `scaleY(${sc})`, transformOrigin: 'bottom' }} />;
    case 'ring':
      return (
        <>
          {[1, 0.78, 0.56].map((k, i) => (
            <div key={i} style={{ ...base, left: (w - d * k) / 2, top: (h - d * k) / 2, width: d * k, height: d * k, borderRadius: '50%', border: `${(10 - i * 2) * t.u}px solid ${withAlpha(i % 2 ? c.accent : c.primary, t.isDark ? 0.4 : 0.3)}`, transform: `scale(${sc * (1 + 0.02 * Math.sin(frame / 10 + i))})` }} />
          ))}
          <div style={{ ...base, left: (w - d * 0.5) / 2, top: (h - d * 0.5) / 2, width: d * 0.5, height: d * 0.5, borderRadius: '50%', backgroundColor: soft }} />
        </>
      );
    default:
      return <div style={{ position: 'absolute', left: w * 0.03, top: h * 0.03, width: w * 0.94, height: h * 0.94, borderRadius: t.radius(1.2) + 24 * t.u, backgroundImage: `linear-gradient(160deg, ${t.isDark ? mix(c.surface, '#FFFFFF', 0.06) : '#FFFFFF'}, ${t.isDark ? c.surface : mix('#FFFFFF', c.primary, 0.08)})`, boxShadow: t.shadow(1.2), transform: `scale(${sc})` }} />;
  }
};

/** Red forbidden sign / green check / cross / hand-drawn circle over the hero, drawn on its word. */
const Mark = ({ kind, size, p, t }: { kind: NonNullable<Hero['mark']>; size: number; p: number; t: Theme }) => {
  if (p <= 0) return null;
  const red = '#E5203F';
  const k = clamp01(p);
  if (kind === 'check' || kind === 'warning') {
    const id = kind === 'check' ? 'check-mark-button' : 'warning';
    return (
      <div style={{ position: 'absolute', right: -size * 0.02, bottom: size * 0.04, width: size * 0.34, height: size * 0.34, borderRadius: '50%', backgroundColor: '#FFFFFF', boxShadow: t.shadow(1), display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p}) rotate(${(1 - k) * -40}deg)` }}>
        <Art id={id} size={size * 0.26} />
      </div>
    );
  }
  const L = 3.2 * size;
  const sw = size * 0.075;
  let d = '';
  if (kind === 'forbidden') d = `M${size * 0.5} ${size * 0.04} A${size * 0.46} ${size * 0.46} 0 1 1 ${size * 0.4999} ${size * 0.04} M${size * 0.18} ${size * 0.18} L${size * 0.82} ${size * 0.82}`;
  else if (kind === 'cross') d = `M${size * 0.18} ${size * 0.18} L${size * 0.82} ${size * 0.82} M${size * 0.82} ${size * 0.18} L${size * 0.18} ${size * 0.82}`;
  else d = `M${size * 0.5} ${size * 0.06} C${size * 0.95} ${size * 0.04} ${size * 1.0} ${size * 0.62} ${size * 0.62} ${size * 0.92} C${size * 0.3} ${size * 1.04} ${size * -0.02} ${size * 0.72} ${size * 0.06} ${size * 0.4} C${size * 0.12} ${size * 0.16} ${size * 0.34} ${size * 0.04} ${size * 0.56} ${size * 0.1}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={sw * 1.5} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - k)} opacity={0.9} />
      <path d={d} fill="none" stroke={red} strokeWidth={sw} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - k)} />
    </svg>
  );
};

/** Positions for floating props around the hero (fractions of the hero box), RTL-neutral. */
const SPOTS: Array<[number, number]> = [[0.1, 0.12], [0.88, 0.16], [0.08, 0.78], [0.9, 0.74], [0.5, 0.02]];

export const HeroScene = () => {
  const P = usePrim();
  const { scene, frame, t, m, at, u, c: col, stage, content: c, dur, emphasis } = P;
  const hero: Hero = c.hero ?? {};
  const layout = hero.layout ?? 'center';
  const fps = t.fps;
  // hero art: explicit → derived from the spoken words → generic
  const spoken = scene.words.map((w) => w.text).join(' ');
  const art = hero.art ?? (hero.illus || scene.heroImage ? undefined : findArt(spoken) ?? c.icon ?? 'sparkles');
  const hasLabel = !!(c.headline || c.kicker);
  const labelTop = scene.variant % 2 === 1; // label above the hero on odd variants
  const labelH = hasLabel ? Math.min(stage.h * 0.23, 280 * u) : 0;
  // the hero box spans the full frame width (QUALITY_BAR: hero ≥ 35 % of the frame)
  const boxW = t.W;
  const boxLeft = -stage.x;
  const boxH = stage.h - labelH;
  const S = Math.min(boxW * 0.9, boxH);
  const boxTop = labelTop ? labelH : 0;
  // motion
  const pIn = m.enter(frame, 0, Math.max(8, m.base));
  const heroP = m.enter(frame, 2, Math.max(8, m.base + 2));
  const push = 1 + 0.06 * clamp01(frame / Math.max(1, dur)); // camera push-in
  const bob = Math.sin((frame / fps) * Math.PI * 0.9) * 10 * u;
  const tilt = Math.sin((frame / fps) * Math.PI * 0.6) * 2;
  const pulse = 1 + 0.07 * emphasis;
  const markP = hero.mark ? m.enter(frame, at(hero.markAt, Math.round(fps * 0.6))) : 0;
  const framedIllus = !!(hero.illus && ILLUSTRATIONS[hero.illus]?.framed);
  const backdrop = framedIllus ? 'none' : hero.backdrop ?? (hero.illus ? 'card' : (['disc', 'blob', 'ring', 'arch'] as const)[(scene.index + t.dna.seed) % 4]!);
  const props = (hero.props ?? []).slice(0, 4);
  // the label lands early as one unit (never a half-built phrase) and pulses when its word is spoken
  const labelAnchor = at(c.headlineAt, 4);
  const labelStart = Math.min(labelAnchor, Math.round(fps * 0.4));
  const labelPulse = 1 + 0.08 * m.pulse(frame, labelAnchor);

  let main: ReactNode;
  const heroStyle = (s: number): CSSProperties => ({ transform: `translateY(${(1 - clamp01(heroP)) * 140 * u + bob}px) scale(${(0.4 + 0.6 * heroP) * pulse * s}) rotate(${tilt}deg)`, opacity: clamp01(heroP * 2) });
  if (scene.heroImage && hero.cutout) {
    // product cut-out: an object on the backdrop, slow turntable sway
    main = (
      <div style={{ ...heroStyle(1), transform: `${heroStyle(1).transform} rotate(${Math.sin((frame / fps) * 1.2) * 4}deg)` }}>
        <Img src={scene.heroImage.src} style={{ width: S * 0.82, height: S * 0.82, objectFit: 'contain', display: 'block' }} />
      </div>
    );
  } else if (scene.heroImage) {
    // user / generated photo: big rounded frame with Ken Burns
    const kb = 1.08 + 0.08 * clamp01(frame / Math.max(1, dur));
    main = (
      <div style={{ width: boxW * 0.92, height: boxH * 0.94, borderRadius: t.radius(1.2) + 30 * u, overflow: 'hidden', boxShadow: t.shadow(1.6), border: `${10 * u}px solid #FFFFFF`, ...heroStyle(1), transform: `translateY(${(1 - clamp01(heroP)) * 140 * u}px) scale(${(0.6 + 0.4 * heroP) * pulse})` }}>
        <Img src={scene.heroImage.src} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})` }} />
      </div>
    );
  } else if (hero.illus && ILLUSTRATIONS[hero.illus]) {
    const framed = ILLUSTRATIONS[hero.illus]!.framed;
    const isz = framed ? Math.min(boxW * 0.84, boxH * 0.96) : S * 0.98;
    main = (
      <div style={{ ...heroStyle(1), ...(framed ? { width: isz, height: isz, borderRadius: t.radius(1.2) + 34 * u, overflow: 'hidden', boxShadow: t.shadow(1.6), border: `${9 * u}px solid ${t.isDark ? '#2A2F38' : '#FFFFFF'}` } : {}) }}>
        <Illustration id={hero.illus} params={hero.illusParams} size={isz} uid={`${scene.id}i`} frame={frame} fps={fps} dur={dur} t={t} />
      </div>
    );
  } else if (layout === 'pair') {
    const s2 = Math.min(boxW * 0.46, boxH * 0.8);
    main = (
      <div style={{ display: 'flex', alignItems: 'center', gap: boxW * 0.04 }}>
        {[art, hero.art2 ?? art].map((a, i) => {
          const q = m.enter(frame, i === 0 ? 2 : at(hero.markAt, 10));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - clamp01(q)) * 120 * u + Math.sin(frame / 14 + i * 2) * 10 * u}px) scale(${(0.4 + 0.6 * q) * pulse}) rotate(${(i ? 6 : -6) + tilt}deg)`, opacity: clamp01(q * 2) }}>
              <Art id={a} size={s2} />
            </div>
          );
        })}
      </div>
    );
  } else if (layout === 'count') {
    const nAll = Math.max(1, hero.count ?? 3);
    const hi = Math.min(nAll, hero.highlight ?? nAll);
    const cols = nAll <= 3 ? nAll : nAll <= 4 ? 2 : nAll <= 6 ? 3 : nAll <= 9 ? 3 : 4;
    const rows = Math.ceil(nAll / cols);
    const cell = Math.min((boxW * 0.94) / cols, (boxH * 0.9) / rows);
    main = (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gridAutoRows: `${cell}px`, direction: 'rtl' }}>
        {Array.from({ length: nAll }, (_, i) => {
          const q = m.enter(frame, 2 + i * Math.max(2, m.stagger + 2));
          const isHi = i < hi;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${(0.3 + 0.7 * q) * (isHi ? pulse : 0.92)}) translateY(${Math.sin(frame / 12 + i) * 6 * u}px)`, opacity: clamp01(q * 2) * (isHi ? 1 : 0.55) }}>
              <Art id={isHi ? art : hero.art2 ?? art} size={cell * 0.86} />
            </div>
          );
        })}
      </div>
    );
  } else if (layout === 'orbit') {
    const ring = (hero.props?.length ? hero.props : [art, art, art]).slice(0, 6);
    const R = S * 0.38;
    main = (
      <div style={{ position: 'relative', width: S, height: S }}>
        <div style={{ position: 'absolute', left: S * 0.27, top: S * 0.27, ...heroStyle(1) }}>
          <Art id={art} size={S * 0.46} />
        </div>
        {ring.map((a, i) => {
          const q = m.enter(frame, 6 + i * 3);
          const ang = (i / ring.length) * Math.PI * 2 + (frame / fps) * 0.5;
          return (
            <div key={i} style={{ position: 'absolute', left: S / 2 + Math.cos(ang) * R * q - S * 0.1, top: S / 2 + Math.sin(ang) * R * q - S * 0.1, opacity: clamp01(q * 2) }}>
              <Art id={a} size={S * 0.2} />
            </div>
          );
        })}
      </div>
    );
  } else {
    const k = layout === 'side' ? 0.72 : 0.8;
    main = (
      <div style={{ position: 'relative', ...heroStyle(1) }}>
        <Art id={art} size={S * k} />
      </div>
    );
  }

  const markSize = S * 0.84;
  return (
    <div style={{ position: 'absolute', left: stage.x, top: stage.y, width: stage.w, height: stage.h, transform: `scale(${push})` }}>
      {/* hero box: backdrop + hero + mark + props (measured by QA as the hero area) */}
      <div data-hero="1" style={{ position: 'absolute', left: boxLeft, top: boxTop, width: boxW, height: boxH }}>
        <Backdrop kind={backdrop} w={boxW} h={boxH} p={pIn} frame={frame} t={t} />
        {/* floor shadow */}
        {!scene.heroImage && layout !== 'count' && (
          <div style={{ position: 'absolute', left: boxW * 0.28, top: boxH * 0.86, width: boxW * 0.44, height: boxH * 0.05, borderRadius: '50%', backgroundColor: withAlpha('#000000', t.isDark ? 0.35 : 0.12), transform: `scaleX(${0.8 + 0.2 * Math.cos((frame / fps) * Math.PI * 0.9)})`, opacity: clamp01(heroP) }} />
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{main}</div>
        {hero.mark && (
          <div style={{ position: 'absolute', left: (boxW - markSize) / 2, top: (boxH - markSize) / 2, width: markSize, height: markSize }}>
            <Mark kind={hero.mark} size={markSize} p={markP} t={t} />
          </div>
        )}
        {props.map((a, i) => {
          const q = m.enter(frame, 8 + i * 5 + (layout === 'orbit' ? 999 : 0));
          const [fx, fy] = SPOTS[(i + scene.index) % SPOTS.length]!;
          const ps = S * (i % 2 ? 0.2 : 0.24);
          const par = (1 - push) * 200 * u * (i % 2 ? 1 : -1); // parallax against the push
          return (
            <div key={i} style={{ position: 'absolute', left: fx * boxW - ps / 2 + par, top: fy * boxH - ps / 2 + Math.sin(frame / 11 + i * 1.7) * 12 * u, transform: `scale(${q}) rotate(${Math.sin(frame / 20 + i) * 8}deg)`, opacity: clamp01(q * 2) }}>
              <Art id={a} size={ps} />
            </div>
          );
        })}
        {hero.badge && (hero.badge.art || hero.badge.text) && <Badge badge={hero.badge} boxW={boxW} boxH={boxH} />}
        {c.price !== undefined && <PriceSticker boxW={boxW} boxH={boxH} />}
      </div>
      {hasLabel && (
        <div style={{ position: 'absolute', left: 0, top: labelTop ? 0 : boxH, width: stage.w, height: labelH, display: 'flex', flexDirection: labelTop ? 'column-reverse' : 'column', alignItems: 'center', justifyContent: 'center', gap: 14 * u }}>
          {c.kicker && (
            <div style={{ transform: `scale(${m.enter(frame, labelStart + 6)})` }}>
              <Chip text={c.kicker} size={46 * u} bg={col.accent} color={col.textOnAccent} />
            </div>
          )}
          <div style={{ transform: `scale(${labelPulse})` }}>
            <Headline text={c.headline} start={labelStart} size={0.78} maxLines={2} align="center" width={stage.w * 0.96} maxHeight={labelH - (c.kicker ? 86 * u : 10 * u)} perWord={false} />
          </div>
        </div>
      )}
    </div>
  );
};

const Badge = ({ badge, boxW, boxH }: { badge: NonNullable<Hero['badge']>; boxW: number; boxH: number }) => {
  const P = usePrim();
  const { frame, m, at, u, t, c: col } = P;
  const q = m.enter(frame, at(badge.at, 10));
  const s = Math.min(boxW, boxH) * 0.24;
  return (
    <div style={{ position: 'absolute', left: boxW * 0.04, top: boxH * 0.02, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * u, transform: `scale(${q}) rotate(${(1 - clamp01(q)) * -30 + Math.sin(frame / 16) * 3}deg)`, opacity: clamp01(q * 2) }}>
      {badge.art && (
        <div style={{ width: s, height: s, borderRadius: '50%', backgroundColor: t.isDark ? col.surface : '#FFFFFF', boxShadow: t.shadow(1), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `${6 * u}px solid ${col.accent}` }}>
          <Art id={badge.art} size={s * 0.66} />
        </div>
      )}
      {badge.text && <Chip text={badge.text} size={40 * u} bg={col.primary} color={col.textOnPrimary} />}
    </div>
  );
};

/** Starburst price sticker on the hero: old price (struck) first, then the new price lands on its word. */
const PriceSticker = ({ boxW, boxH }: { boxW: number; boxH: number }) => {
  const P = usePrim();
  const { frame, m, at, u, t, content: c, matchWord } = P;
  const s = Math.min(boxW, boxH) * 0.46;
  const cur = c.currency ?? 'دج';
  const oldAt = c.oldPrice !== undefined ? at(matchWord(String(c.oldPrice)), 4) : 0;
  const newAt = at(c.valueAt ?? matchWord(String(c.price)), oldAt + Math.round(t.fps * 1.2));
  const qOld = m.enter(frame, oldAt);
  const qNew = m.enter(frame, newAt);
  const showNew = frame >= newAt;
  const n = 14;
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? s * 0.42 : s * 0.5;
    d += `${i ? 'L' : 'M'}${(s / 2 + Math.cos(a) * r).toFixed(1)} ${(s / 2 + Math.sin(a) * r).toFixed(1)}`;
  }
  const fmt = (v: number) => formatNumber(v, 0, t.digits);
  return (
    <div style={{ position: 'absolute', right: boxW * 0.07, bottom: boxH * 0.02, width: s, height: s, transform: `scale(${showNew ? 0.6 + 0.4 * qNew : 0.5 + 0.5 * qOld}) rotate(${-8 + Math.sin(frame / 14) * 3}deg)`, opacity: clamp01(qOld * 2) }}>
      <svg width={s} height={s} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={d + 'Z'} fill={showNew ? t.c.primary : t.c.accent} stroke="#FFFFFF" strokeWidth={8 * u} strokeLinejoin="round" />
      </svg>
      <div dir="rtl" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: showNew ? t.c.textOnPrimary : t.c.textOnAccent, fontFamily: t.fonts.display, fontWeight: t.fonts.displayWeight, lineHeight: 1.05 }}>
        {showNew && c.oldPrice !== undefined && (
          <span dir="ltr" style={{ fontSize: s * 0.13, textDecoration: 'line-through', opacity: 0.85, unicodeBidi: 'isolate' }}>{fmt(c.oldPrice)}</span>
        )}
        <span dir="ltr" style={{ fontSize: s * 0.25, unicodeBidi: 'isolate' }}>{fmt(showNew ? c.price ?? 0 : c.oldPrice ?? c.price ?? 0)}</span>
        <span style={{ fontSize: s * 0.12 }}>{cur}</span>
      </div>
    </div>
  );
};
