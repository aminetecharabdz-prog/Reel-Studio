import { Img, random } from 'remotion';
import { withAlpha, mix } from '@/lib/color/contrast';
import { formatNumber } from '@/lib/text/digits';
import { isStopword } from '@/lib/text/keywords';
import { Card, Headline, IconBadge, Stage, Sub, usePrim } from './kit';
import { FitText, Word } from '../Text';
import { Icon } from '../Icon';
import { clamp01 } from '../motion';

export const IconBurst = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.headlineAt ?? c.items?.[0]?.at, 2);
  const p = m.enter(frame, start);
  const size = Math.min(stage.w * 0.42, stage.h * 0.32);
  const sats = (c.icons ?? (c.items ?? []).map((i) => i.icon ?? 'sparkle')).slice(0, 8);
  const n = Math.max(6, sats.length);
  const burst = clamp01((frame - start) / 18);
  return (
    <Stage>
      <div style={{ position: 'relative', width: stage.w, height: size * 2.3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + random(`${t.dna.seed}-b${i}`) * 0.4;
          const r = size * (0.85 + 0.25 * burst) + Math.sin(frame / 10 + i) * 8 * u;
          const ic = sats[i % Math.max(1, sats.length)] ?? 'sparkle';
          const s = 36 + 26 * random(`${t.dna.seed}-s${i}`);
          return (
            <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(${Math.cos(a) * r * burst - s * u / 2}px, ${Math.sin(a) * r * burst - s * u / 2}px) rotate(${(1 - burst) * 120}deg)`, opacity: burst < 1 ? burst : 1 }}>
              <Icon id={ic} size={s * u * 1.4} color={i % 2 ? col.accent : col.primary} />
            </div>
          );
        })}
        <div style={{ transform: `scale(${p})`, opacity: clamp01(p * 2) }}>
          <IconBadge id={c.icon ?? sats[0]} size={size} bg={col.primary} color={col.textOnPrimary} />
        </div>
      </div>
      <Headline text={c.headline} start={start + 6} size={0.76} maxLines={2} align="center" />
      <Sub text={c.sub} start={start + 16} />
    </Stage>
  );
};

export const IconGrid = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, itemStart, stage, at, t } = P;
  const items = (c.items ?? []).slice(0, 6);
  const cols = items.length <= 4 ? 2 : 3;
  const gap = 24 * u;
  const cell = (stage.w * 0.96 - gap * (cols - 1)) / cols;
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.76} maxLines={2} align="center" />
      <div style={{ height: 34 * u }} />
      <div dir="rtl" style={{ display: 'flex', flexWrap: 'wrap', gap, width: stage.w * 0.96, justifyContent: 'center' }}>
        {items.map((it, i) => {
          const s = itemStart(i, it, items.length);
          const p = m.enter(frame, s);
          const lit = frame >= s;
          return (
            <div key={i} style={{ width: cell, padding: 24 * u, borderRadius: t.radius(1), backgroundColor: lit ? col.surface : withAlpha(col.surface, 0.5), boxShadow: lit ? t.shadow(0.7) : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * u, transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp01(p * 1.5) }}>
              <IconBadge id={it.icon} size={cell * 0.42} />
              <FitText text={it.text} role="body" weight={700} maxWidth={cell - 48 * u} maxSize={46 * u} maxLines={2} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/** Composed illustration: a hero (multicolour emoji) on a ground shape with orbiting props. */
export const IllustrationScene = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t, itemStart } = P;
  const props = (c.items ?? []).slice(0, 4);
  const size = Math.min(stage.w * 0.55, stage.h * 0.42);
  const start = at(c.headlineAt, 2);
  const p = m.enter(frame, 0);
  const bob = Math.sin(frame / 12) * 10 * u;
  const spots = [[-0.62, -0.3], [0.62, -0.25], [-0.55, 0.42], [0.58, 0.45]] as const;
  return (
    <Stage>
      <div style={{ position: 'relative', width: size * 2.1, height: size * 1.55 }}>
        <div style={{ position: 'absolute', left: size * 0.25, top: size * 0.12, width: size * 1.6, height: size * 1.25, borderRadius: `${size * 0.7}px ${size * 0.55}px ${size * 0.75}px ${size * 0.5}px`, backgroundImage: `linear-gradient(150deg, ${withAlpha(col.primary, 0.32)}, ${withAlpha(col.accent, 0.26)})`, transform: `scale(${0.6 + 0.4 * clamp01(p)}) rotate(${frame * 0.15}deg)` }} />
        <div style={{ position: 'absolute', left: size * 0.55, top: size * 0.25 + bob, transform: `scale(${p})` }}>
          <Icon id={c.icon ?? 'sparkle'} size={size} />
        </div>
        {props.map((it, i) => {
          const s = itemStart(i, it, props.length);
          const q = m.enter(frame, s);
          const [dx, dy] = spots[i]!;
          return (
            <div key={i} style={{ position: 'absolute', left: size * 1.05 + dx * size * 1.05 - 70 * u, top: size * 0.75 + dy * size - 70 * u + Math.sin(frame / 15 + i) * 8 * u, transform: `scale(${q})`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 140 * u, height: 140 * u, borderRadius: 70 * u, backgroundColor: col.surface, boxShadow: t.shadow(0.6), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon id={it.icon ?? 'sparkle'} size={90 * u} />
              </div>
            </div>
          );
        })}
      </div>
      <Headline text={c.headline} start={start} size={0.76} maxLines={2} align="center" />
      <Sub text={c.sub} start={start + 12} />
    </Stage>
  );
};

export const StickerPop = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t, itemStart } = P;
  const stickers = [{ text: c.headline ?? '', icon: c.icon, at: c.headlineAt }, ...(c.items ?? [])].slice(0, 3);
  const rots = [-6, 5, -3];
  return (
    <Stage>
      {stickers.map((st, i) => {
        const s = i === 0 ? at(st.at, 2) : itemStart(i - 1, st, stickers.length);
        const p = m.enter(frame, s);
        const bg = [col.accent, col.primary, col.surface][i]!;
        const fg = [col.textOnAccent, col.textOnPrimary, col.text][i]!;
        return (
          <div key={i} style={{ transform: `rotate(${rots[i]}deg) scale(${p})`, opacity: clamp01(p * 2), margin: `${14 * u}px 0`, alignSelf: i === 1 ? 'flex-start' : i === 2 ? 'flex-end' : 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 * u, backgroundColor: bg, color: fg, padding: `${18 * u}px ${36 * u}px`, borderRadius: t.radius(0.6) + 20 * u, border: `${8 * u}px solid #ffffff`, boxShadow: t.shadow(1) }}>
              {st.icon && <Icon id={st.icon} size={(i === 0 ? 96 : 70) * u} color={fg} />}
              <FitText text={st.text} maxWidth={stage.w * 0.72} maxSize={(i === 0 ? 100 : 64) * u} maxLines={2} color={fg} />
            </div>
          </div>
        );
      })}
    </Stage>
  );
};

export const CalloutArrows = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, itemStart } = P;
  const items = (c.items ?? []).slice(0, 4);
  const size = Math.min(stage.w * 0.5, stage.h * 0.38);
  const cx = stage.w / 2, cy = stage.h * 0.45;
  const spots = [[-1, -0.9], [1, -0.55], [-1, 0.55], [1, 0.95]] as const;
  return (
    <Stage style={{ alignItems: 'stretch' }}>
      <div style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2, transform: `scale(${m.enter(frame, 0)})` }}>
        {P.scene.images[0]?.src ? <Img src={P.scene.images[0].src} style={{ width: size, height: size, objectFit: 'contain' }} /> : <IconBadge id={c.icon ?? 'sparkle'} size={size} />}
      </div>
      <svg width={stage.w} height={stage.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {items.map((it, i) => {
          const [sx, sy] = spots[i]!;
          const s = itemStart(i, it, items.length);
          const d = clamp01((frame - s) / 10);
          const x1 = cx + sx * size * 0.42, y1 = cy + sy * size * 0.35;
          const x2 = cx + sx * stage.w * 0.3, y2 = cy + sy * size * 0.75;
          return d > 0 ? <g key={i}><line x1={x1} y1={y1} x2={x1 + (x2 - x1) * d} y2={y1 + (y2 - y1) * d} stroke={col.accent} strokeWidth={5 * u} strokeLinecap="round" /><circle cx={x1} cy={y1} r={10 * u} fill={col.accent} /></g> : null;
        })}
      </svg>
      {items.map((it, i) => {
        const [sx, sy] = spots[i]!;
        const s = itemStart(i, it, items.length);
        const p = m.enter(frame, s + 6);
        const x2 = cx + sx * stage.w * 0.3, y2 = cy + sy * size * 0.75;
        const bw = stage.w * 0.4;
        return (
          <div key={i} style={{ position: 'absolute', left: Math.max(0, Math.min(stage.w - bw, x2 - bw / 2)), top: y2 + (sy < 0 ? -110 * u : 10 * u), width: bw, opacity: clamp01(p * 1.5), transform: `scale(${0.7 + 0.3 * clamp01(p)})` }}>
            <Card pad={0.45} style={{ textAlign: 'center' }}>
              <FitText text={it.text} role="body" weight={700} maxWidth={bw - 34 * u} maxSize={44 * u} maxLines={2} />
            </Card>
          </div>
        );
      })}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: stage.w }}>
        <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.76} maxLines={2} align="center" />
      </div>
    </Stage>
  );
};

/** Hand-drawn circle stroke drawing around the keyword when it is spoken. */
export const HighlighterCircle = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t, matchWord } = P;
  const words = (c.headline ?? '').split(/\s+/).filter(Boolean);
  const kwIdx = Math.max(0, words.findIndex((w) => !isStopword(w) && w.length >= 3));
  const kwStart = at(matchWord(words[kwIdx] ?? '') ?? c.headlineAt, 10);
  const start = P.lead(at(c.headlineAt, 2));
  const d = clamp01((frame - kwStart) / 12);
  return (
    <Stage>
      <FitText
        text={c.headline ?? ''}
        maxWidth={stage.w}
        maxSize={130 * u * t.dna.typography.scale}
        maxLines={3}
        align={P.align}
        renderWord={(w, i) => {
          const p = m.enterC(frame, start + i * m.stagger);
          return (
            <span style={{ display: 'inline-block', position: 'relative', opacity: p }}>
              <Word text={w} style={{ color: i === kwIdx ? col.accent : col.text }} />
              {i === kwIdx && (
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ position: 'absolute', left: '-14%', top: '-18%', width: '128%', height: '136%', overflow: 'visible' }}>
                  <path d="M 50 4 C 85 2 99 14 97 27 C 95 42 70 48 47 47 C 20 46 3 38 3 25 C 3 12 20 5 55 6" fill="none" stroke={col.accent} strokeWidth={3} strokeLinecap="round" strokeDasharray={260} strokeDashoffset={260 * (1 - d)} vectorEffect="non-scaling-stroke" style={{ strokeWidth: 7 * u }} />
                </svg>
              )}
            </span>
          );
        }}
      />
      <div style={{ height: 30 * u }} />
      <Sub text={c.sub} start={kwStart + 10} />
    </Stage>
  );
};

/** Morphing blob (border-radius keyframes) carrying an icon — the "idea" visual. */
export const ShapeMorph = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at } = P;
  const start = at(c.headlineAt, 2);
  const size = Math.min(stage.w * 0.62, stage.h * 0.45);
  const k = frame / 30;
  const r = (o: number) => 38 + 14 * Math.sin(k * 1.3 + o);
  const p = m.enter(frame, 0);
  return (
    <Stage>
      <div style={{ width: size, height: size, borderRadius: `${r(0)}% ${100 - r(1)}% ${r(2)}% ${100 - r(3)}% / ${r(4)}% ${r(5)}% ${100 - r(6)}% ${100 - r(7)}%`, backgroundImage: `linear-gradient(${frame * 2}deg, ${col.primary}, ${col.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p}) rotate(${frame * 0.4}deg)`, boxShadow: P.t.shadow(1) }}>
        <div style={{ transform: `rotate(${-frame * 0.4}deg)` }}>
          <Icon id={c.icon ?? 'idea'} size={size * 0.45} color={col.textOnPrimary} />
        </div>
      </div>
      <div style={{ height: 40 * u }} />
      <Headline text={c.headline} start={start} size={0.7} maxLines={2} align="center" />
      <Sub text={c.sub} start={start + 12} />
    </Stage>
  );
};

export const Gauge = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const max = Math.max(1, (c.items?.[0]?.value ?? 0) || (c.value ?? 100) * 1.25);
  const val = c.value ?? 75;
  const p = clamp01((frame - start) / (m.base * 2.2));
  const e = p < 1 ? 1 - Math.pow(1 - p, 3) : 1;
  const wobble = p >= 1 ? Math.sin((frame - start) / 3) * 1.2 * Math.exp(-(frame - start - m.base * 2.2) / 12) : 0;
  const frac = (val / max) * e;
  const size = Math.min(stage.w * 0.88, stage.h * 0.6);
  const ang = -180 + 180 * frac + wobble;
  const ticks = Array.from({ length: 11 }, (_, i) => i / 10);
  return (
    <Stage>
      <div style={{ position: 'relative', width: size, height: size * 0.62 }}>
        <svg width={size} height={size * 0.62} viewBox="0 0 200 124" style={{ overflow: 'visible' }}>
          <defs><linearGradient id={`g-${P.scene.id}`} x1="0" x2="1"><stop offset="0" stopColor={col.good} /><stop offset="0.6" stopColor={col.accent} /><stop offset="1" stopColor={col.bad} /></linearGradient></defs>
          <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={withAlpha(col.text, 0.1)} strokeWidth={16} strokeLinecap="round" />
          <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={`url(#g-${P.scene.id})`} strokeWidth={16} strokeLinecap="round" strokeDasharray={252} strokeDashoffset={252 * (1 - frac)} />
          {ticks.map((k) => {
            const a = Math.PI * (1 - k);
            return <line key={k} x1={100 + Math.cos(a) * 62} y1={110 - Math.sin(a) * 62} x2={100 + Math.cos(a) * 70} y2={110 - Math.sin(a) * 70} stroke={col.muted} strokeWidth={2} />;
          })}
          <g transform={`rotate(${ang + 90} 100 110)`}><path d="M 97 110 L 100 40 L 103 110 Z" fill={col.text} /></g>
          <circle cx="100" cy="110" r="9" fill={col.accent} />
        </svg>
      </div>
      <div dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 900, fontSize: 120 * u, color: col.text, lineHeight: 1.1 }}>{formatNumber(val * e, c.decimals ?? 0, t.digits)}<span style={{ fontSize: 60 * u, color: col.muted }}> {c.unit ?? ''}</span></div>
      <Headline text={c.headline} start={start + 8} size={0.76} maxLines={2} align="center" />
    </Stage>
  );
};

/** Do / Don't cards — ✓ and ✗ with items appearing on their words. */
export const DoDont = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t, itemStart } = P;
  const items = (c.items ?? []).slice(0, 4);
  const goods = items.filter((i) => i.tone !== 'bad');
  const bads = items.filter((i) => i.tone === 'bad');
  const colW = stage.w * 0.47;
  const column = (list: typeof items, good: boolean) => (
    <div style={{ width: colW, display: 'flex', flexDirection: 'column', gap: 18 * u }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 * u, padding: `${12 * u}px`, borderRadius: t.radius(0.6) + 10 * u, backgroundColor: good ? col.good : col.bad, color: '#fff', fontFamily: t.fonts.display, fontWeight: 800, fontSize: 52 * u }}>
        <Icon id={good ? 'check' : 'cross'} size={56 * u} color="#fff" />
        {good ? 'ديرها' : 'ماديرهاش'}
      </div>
      {list.map((it) => {
        const i = items.indexOf(it);
        const s = itemStart(i, it, items.length);
        const p = m.enter(frame, s);
        return (
          <div key={i} style={{ opacity: clamp01(p * 1.5), transform: `translateY(${(1 - p) * 40 * u}px)` }}>
            <Card pad={0.55} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * u, borderBottom: `${8 * u}px solid ${good ? col.good : col.bad}` }}>
              <Icon id={it.icon ?? (good ? 'thumbsup' : 'warning')} size={100 * u} />
              <FitText text={it.text} role="body" weight={700} maxWidth={colW - 50 * u} maxSize={44 * u} maxLines={3} />
            </Card>
          </div>
        );
      })}
    </div>
  );
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.76} maxLines={2} align="center" />
      <div style={{ height: 28 * u }} />
      <div dir="rtl" style={{ display: 'flex', gap: stage.w * 0.06, alignItems: 'flex-start' }}>
        {column(goods, true)}
        {column(bads, false)}
      </div>
    </Stage>
  );
};

export const WarningAlert = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.headlineAt, 2);
  const p = m.enter(frame, 0, 8);
  const shake = frame < 18 ? Math.sin(frame * 2.6) * (18 - frame) * 0.9 * u : 0;
  const flash = Math.max(0, 1 - frame / 8);
  const red = mix(col.bad, '#ff2b2b', 0.4);
  return (
    <Stage>
      <div style={{ position: 'absolute', inset: -stage.y, backgroundColor: withAlpha(red, 0.35 * flash) }} />
      <div style={{ transform: `translateX(${shake}px) scale(${0.5 + 0.5 * p})`, opacity: clamp01(p * 2), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 260 * u, height: 260 * u, borderRadius: t.radius(0.5) + 40 * u, backgroundColor: red, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${80 * u}px ${withAlpha(red, 0.6)}`, transform: `scale(${1 + 0.05 * Math.sin(frame / 4)})` }}>
          <Icon id={c.icon ?? 'warning'} size={170 * u} color="#ffffff" />
        </div>
      </div>
      <div style={{ height: 40 * u }} />
      <Headline text={c.headline} start={start} size={0.8} maxLines={3} color={t.isDark ? '#FFFFFF' : undefined} align="center" />
      <Sub text={c.sub} start={start + 12} />
    </Stage>
  );
};

