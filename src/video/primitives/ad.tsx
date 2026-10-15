import { interpolate } from 'remotion';
import { withAlpha, mix } from '@/lib/color/contrast';
import { formatNumber, toDigits } from '@/lib/text/digits';
import { Card, Chip, Headline, IconBadge, IllustrationFallback, Stage, Sub, usePrim } from './kit';
import { FitText } from '../Text';
import { Icon } from '../Icon';
import { clamp01 } from '../motion';
import { Img } from 'remotion';

const money = (P: ReturnType<typeof usePrim>, v: number) => formatNumber(v, 0, P.t.digits);

/** Old price struck through, new price slams in (only prices the user gave). */
export const PriceTag = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const cur = c.currency ?? 'دج';
  const strike = clamp01((frame - start + 6) / 8);
  const slam = m.enter(frame, start + 8, 10);
  const shake = frame - start - 8 > 0 && frame - start - 8 < 10 ? Math.sin((frame - start) * 3) * 6 * u : 0;
  return (
    <Stage>
      {c.headline ? <Headline text={c.headline} start={at(c.headlineAt, 0)} size={0.76} maxLines={2} align="center" /> : <div style={{ opacity: m.enterC(frame, 2), transform: `rotate(-3deg) scale(${0.8 + 0.2 * m.enterC(frame, 2)})` }}><Chip text="السعر" size={64 * u} bg={col.text} color={col.bg[0]} /></div>}
      <div style={{ height: 30 * u }} />
      {c.oldPrice !== undefined && (
        <div style={{ position: 'relative', opacity: 0.75 }} dir="rtl">
          <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 90 * u, color: col.muted }}>
            <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{money(P, c.oldPrice)}</span> {cur}
          </span>
          <div style={{ position: 'absolute', top: '52%', right: '-4%', width: `${108 * strike}%`, height: 10 * u, backgroundColor: col.bad, borderRadius: 5 * u, transform: 'rotate(-8deg)' }} />
        </div>
      )}
      <div style={{ transform: `translateX(${shake}px) scale(${0.3 + 0.7 * slam}) rotate(${(1 - clamp01(slam)) * -12}deg)`, opacity: clamp01(slam * 2), marginTop: 20 * u }}>
        <div style={{ position: 'relative', backgroundColor: col.accent, color: col.textOnAccent, padding: `${30 * u}px ${70 * u}px ${30 * u}px ${90 * u}px`, clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 14% 100%, 0 50%)', boxShadow: t.shadow(1) }} dir="rtl">
          <span style={{ fontFamily: t.fonts.display, fontWeight: 900, fontSize: Math.min(190 * u, stage.w / 4.2), lineHeight: 1.1 }}>
            <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{money(P, c.price ?? c.value ?? 0)}</span>
          </span>
          <span style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: 70 * u, marginInlineStart: 18 * u }}>{cur}</span>
          <div style={{ position: 'absolute', left: 30 * u, top: '50%', width: 30 * u, height: 30 * u, marginTop: -15 * u, borderRadius: '50%', backgroundColor: col.bg[0] }} />
        </div>
      </div>
      {c.oldPrice !== undefined && c.price !== undefined && c.oldPrice > c.price && (
        <div style={{ marginTop: 30 * u, transform: `scale(${m.enter(frame, start + 18)})` }}>
          <Chip text={`-${Math.round(((c.oldPrice - c.price) / c.oldPrice) * 100)}%`} bg={col.bad} color="#fff" size={60 * u} />
        </div>
      )}
      <Sub text={c.sub} start={start + 20} />
    </Stage>
  );
};

export const DeliveryBadge = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const drive = interpolate(frame, [0, 22], [1, 0], { extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });
  const n = c.wilayas ?? c.value;
  return (
    <Stage>
      <div style={{ transform: `translateX(${drive * -stage.w}px)`, position: 'relative' }}>
        <IconBadge id="truck" size={280 * u} bg={col.primary} color={col.textOnPrimary} shape="square" />
        {[0, 1, 2].map((i) => <div key={i} style={{ position: 'absolute', right: -60 * u - i * 40 * u, top: 100 * u + i * 34 * u, width: (60 - i * 12) * u, height: 8 * u, borderRadius: 4 * u, backgroundColor: withAlpha(col.text, 0.3 * (1 - drive)) }} />)}
      </div>
      <div style={{ height: 36 * u }} />
      {n !== undefined ? (
        <div dir="rtl" style={{ display: 'flex', alignItems: 'baseline', gap: 18 * u, transform: `scale(${m.enter(frame, start)})` }}>
          <span style={{ fontFamily: t.fonts.display, fontWeight: t.fonts.displayWeight, fontSize: 90 * u, color: col.text }}>{c.headline ?? 'توصيل'}</span>
          <span dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 900, fontSize: 150 * u, color: col.accent }}>{toDigits(String(Math.round(n * clamp01((frame - start) / 16))), t.digits)}</span>
          <span style={{ fontFamily: t.fonts.display, fontWeight: t.fonts.displayWeight, fontSize: 90 * u, color: col.text }}>{c.unit ?? 'ولاية'}</span>
        </div>
      ) : (
        <Headline text={c.headline} start={start} size={0.8} maxLines={2} align="center" />
      )}
      <Sub text={c.sub} start={start + 12} />
    </Stage>
  );
};

export const CodBadge = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.headlineAt, 2);
  const stamp = m.enter(frame, start, 8);
  return (
    <Stage>
      <div style={{ transform: `scale(${2.2 - 1.2 * clamp01(stamp)}) rotate(-8deg)`, opacity: clamp01(stamp * 2), border: `${10 * u}px solid ${col.good}`, borderRadius: t.radius(0.5) + 24 * u, padding: `${30 * u}px ${46 * u}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * u, backgroundColor: withAlpha(col.good, 0.1) }}>
        <Icon id="cash" size={180 * u} color={col.good} />
        <FitText text={c.headline ?? 'الدفع عند الاستلام'} maxWidth={stage.w * 0.78} maxSize={96 * u} maxLines={2} color={col.good} />
      </div>
      <div style={{ height: 40 * u }} />
      <Sub text={c.sub} start={start + 12} />
    </Stage>
  );
};

/** Stock / urgency bar — only used when the speaker actually says it. */
export const Urgency = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const left = c.value ?? 20;
  const p = clamp01((frame - start) / 24);
  const w = stage.w * 0.9;
  const blink = Math.floor(frame / 10) % 2 === 0;
  return (
    <Stage>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 * u }}>
        <Icon id="timer" size={120 * u} color={col.bad} style={{ transform: `rotate(${Math.sin(frame / 3) * 10}deg)` }} />
        <FitText text={c.headline ?? 'الكمية محدودة'} maxWidth={w - 160 * u} maxSize={100 * u} maxLines={2} color={col.text} />
      </div>
      <div style={{ height: 40 * u }} />
      <div style={{ width: w, height: 56 * u, borderRadius: 28 * u, backgroundColor: withAlpha(col.text, 0.12), overflow: 'hidden', direction: 'rtl' }}>
        <div style={{ width: `${100 - (100 - left) * p}%`, height: '100%', backgroundImage: `linear-gradient(270deg, ${col.bad}, ${mix(col.bad, col.accent, 0.4)})`, borderRadius: 28 * u }} />
      </div>
      <div dir="rtl" style={{ marginTop: 18 * u, fontFamily: t.fonts.body, fontWeight: 700, fontSize: 50 * u, color: blink ? col.bad : col.text, opacity: m.enterC(frame, start + 10) }}>{c.sub ?? ''}</div>
    </Stage>
  );
};

export const OfferRibbon = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.headlineAt, 2);
  const p = clamp01(m.enter(frame, 0, m.base * 1.2));
  return (
    <Stage>
      <div style={{ position: 'absolute', left: -stage.x - 40 * u, top: stage.h * 0.12, width: t.W + 80 * u, transform: `rotate(-8deg) translateX(${(1 - p) * t.W}px)`, backgroundColor: col.accent, padding: `${26 * u}px 0`, boxShadow: t.shadow(1) }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 50 * u, fontFamily: t.fonts.display, fontWeight: 900, fontSize: 80 * u, color: col.textOnAccent, whiteSpace: 'nowrap' }}>
          {[0, 1, 2].map((i) => <span key={i}>{c.kicker ?? 'عرض خاص'}</span>)}
        </div>
      </div>
      <div style={{ height: stage.h * 0.25 }} />
      <Card style={{ width: stage.w * 0.9, textAlign: 'center' }}>
        <Headline text={c.headline} start={start} size={0.8} maxLines={3} align="center" width={stage.w * 0.9 - 72 * u} />
        <Sub text={c.sub} start={start + 12} width={stage.w * 0.9 - 72 * u} />
      </Card>
    </Stage>
  );
};

/** Product in the middle, feature labels pop on their words with leader lines. */
export const FeatureCallouts = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t, itemStart } = P;
  const items = (c.items ?? []).slice(0, 4);
  const src = P.scene.images[0]?.src ?? null;
  const size = Math.min(stage.w * 0.58, stage.h * 0.46);
  const cx = stage.w / 2, cy = stage.h * 0.46;
  const spots = [[1, -0.75], [-1, -0.3], [1, 0.3], [-1, 0.78]] as const;
  const float = Math.sin(frame / 15) * 10 * u;
  return (
    <Stage style={{ alignItems: 'stretch' }}>
      <div style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2 + float, transform: `scale(${m.enter(frame, 0)})` }}>
        {src ? <Img src={src} style={{ width: size, height: size, objectFit: 'contain' }} /> : <IllustrationFallback icon={c.icon ?? 'box'} size={size} />}
      </div>
      <svg width={stage.w} height={stage.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {items.map((it, i) => {
          const [sx, sy] = spots[i]!;
          const d = clamp01((frame - itemStart(i, it, items.length)) / 8);
          const x1 = cx + sx * size * 0.25, y1 = cy + sy * size * 0.3 + float;
          const x2 = cx + sx * stage.w * 0.3, y2 = cy + sy * size * 0.62;
          return d > 0 ? <g key={i}><circle cx={x1} cy={y1} r={12 * u} fill={col.accent} stroke="#fff" strokeWidth={4 * u} /><line x1={x1} y1={y1} x2={x1 + (x2 - x1) * d} y2={y1 + (y2 - y1) * d} stroke={col.accent} strokeWidth={5 * u} /></g> : null;
        })}
      </svg>
      {items.map((it, i) => {
        const [sx, sy] = spots[i]!;
        const p = m.enter(frame, itemStart(i, it, items.length) + 5);
        const bw = stage.w * 0.42;
        const x2 = cx + sx * stage.w * 0.3, y2 = cy + sy * size * 0.62;
        return (
          <div key={i} style={{ position: 'absolute', left: Math.max(0, Math.min(stage.w - bw, x2 - bw / 2)), top: y2 - 50 * u, width: bw, opacity: clamp01(p * 1.5), transform: `scale(${0.6 + 0.4 * clamp01(p)})` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 * u, backgroundColor: col.surface, borderRadius: t.radius(0.6) + 14 * u, padding: `${14 * u}px ${18 * u}px`, boxShadow: t.shadow(0.7), border: `${3 * u}px solid ${col.accent}` }} dir="rtl">
              <Icon id={it.icon ?? 'check'} size={56 * u} />
              <FitText text={it.text} role="body" weight={700} maxWidth={bw - 110 * u} maxSize={42 * u} maxLines={2} align="start" />
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: stage.w }}>
        <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.76} maxLines={1} align="center" />
      </div>
    </Stage>
  );
};
