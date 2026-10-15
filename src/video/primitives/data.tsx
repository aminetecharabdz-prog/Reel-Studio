
import { withAlpha, mix } from '@/lib/color/contrast';
import { formatNumber, toDigits } from '@/lib/text/digits';
import { Card, Headline, IconBadge, Stage, Sub, usePrim } from './kit';
import { FitText } from '../Text';
import { Icon } from '../Icon';
import { clamp01 } from '../motion';
import { ALGERIA, CITIES, project } from './algeria';

const num = (P: ReturnType<typeof usePrim>, v: number, d = 0) => formatNumber(v, d, P.t.digits);

export const BarChart = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, itemStart, stage, t, at } = P;
  const items = (c.items ?? []).slice(0, 6);
  const max = Math.max(1, ...items.map((i) => i.value ?? 0));
  const chartH = stage.h * 0.5;
  const barW = Math.min(150 * u, (stage.w * 0.9) / Math.max(1, items.length) - 24 * u);
  const top = items.reduce((b, it, i) => ((it.value ?? 0) > (items[b]?.value ?? 0) ? i : b), 0);
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.6} maxLines={2} align="center" />
      <div style={{ height: 40 * u }} />
      <div dir="rtl" style={{ display: 'flex', alignItems: 'flex-end', gap: 24 * u, height: chartH, borderBottom: `${4 * u}px solid ${col.line}` }}>
        {items.map((it, i) => {
          const s = itemStart(i, it, items.length);
          const p = clamp01(m.enter(frame, s, m.base * 1.4));
          const h = ((it.value ?? 0) / max) * (chartH - 90 * u) * p;
          const hl = i === top;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: barW }}>
              <div dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: 46 * u, color: hl ? col.accent : col.text, opacity: p, marginBottom: 10 * u }}>{num(P, (it.value ?? 0) * p)}{c.unit ?? ''}</div>
              <div style={{ width: barW, height: Math.max(2, h), borderRadius: `${t.radius(0.5)}px ${t.radius(0.5)}px 0 0`, backgroundImage: `linear-gradient(180deg, ${hl ? col.accent : col.primary}, ${mix(hl ? col.accent : col.primary, col.bg[0]!, 0.35)})` }} />
            </div>
          );
        })}
      </div>
      <div dir="rtl" style={{ display: 'flex', gap: 24 * u, marginTop: 16 * u }}>
        {items.map((it, i) => (
          <div key={i} style={{ width: barW, opacity: m.enterC(frame, itemStart(i, it, items.length)) }}>
            <FitText text={it.text} role="body" maxWidth={barW + 20 * u} maxSize={36 * u} maxLines={2} color={col.muted} weight={600} />
          </div>
        ))}
      </div>
    </Stage>
  );
};

export const LineChart = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, t, at } = P;
  const items = (c.items ?? []).slice(0, 8);
  const vals = items.map((i) => i.value ?? 0);
  const max = Math.max(1, ...vals), min = Math.min(0, ...vals);
  const W = stage.w * 0.94, H = stage.h * 0.45;
  const pts = vals.map((v, i) => [(i / Math.max(1, vals.length - 1)) * W, H - ((v - min) / (max - min)) * H * 0.9] as const);
  const start = at(c.valueAt ?? c.headlineAt, 6);
  const p = clamp01((frame - start) / (m.base * 3));
  const path = pts.map((q, i) => `${i ? 'L' : 'M'} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  const len = pts.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - pts[i - 1]![0], q[1] - pts[i - 1]![1]) : 0), 0);
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.6} maxLines={2} align="center" />
      <div style={{ height: 40 * u }} />
      <svg width={W} height={H + 20 * u} style={{ overflow: 'visible' }}>
        {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke={col.line} strokeWidth={2 * u} />)}
        <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill={withAlpha(col.primary, 0.14 * p)} />
        <path d={path} fill="none" stroke={col.primary} strokeWidth={10 * u} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
        {pts.map((q, i) => {
          const show = p >= i / Math.max(1, pts.length - 1);
          return show ? <circle key={i} cx={q[0]} cy={q[1]} r={(i === pts.length - 1 ? 18 : 11) * u} fill={i === pts.length - 1 ? col.accent : col.surface} stroke={col.primary} strokeWidth={5 * u} /> : null;
        })}
      </svg>
      <div dir="ltr" style={{ display: 'flex', justifyContent: 'space-between', width: W, marginTop: 10 * u }}>
        {items.map((it, i) => <div key={i} style={{ fontFamily: t.fonts.body, fontSize: 32 * u, color: col.muted }}>{toDigits(it.text, t.digits)}</div>)}
      </div>
    </Stage>
  );
};

const Arc = ({ size, stroke, p, color, track, startAngle = -90, sweep = 360 }: { size: number; stroke: number; p: number; color: string; track: string; startAngle?: number; sweep?: number }) => {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const a0 = (startAngle * Math.PI) / 180;
  const arcPath = (frac: number) => {
    const a1 = a0 + (sweep * frac * Math.PI) / 180;
    const large = sweep * frac > 180 ? 1 : 0;
    return `M ${cx + r * Math.cos(a0)} ${cx + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cx + r * Math.sin(a1)}`;
  };
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }}>
      <path d={arcPath(0.9999)} fill="none" stroke={track} strokeWidth={stroke} strokeLinecap="round" />
      {p > 0.001 && <path d={arcPath(Math.min(0.9999, p))} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />}
    </svg>
  );
};

export const DonutChart = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, t, at } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const pct = Math.max(0, Math.min(100, c.value ?? 50));
  const p = clamp01((frame - start) / (m.base * 2.4));
  const e = 1 - Math.pow(1 - p, 3);
  const size = Math.min(stage.w * 0.72, stage.h * 0.55);
  return (
    <Stage>
      <div style={{ position: 'relative', width: size, height: size, transform: `scale(${0.7 + 0.3 * m.enterC(frame, start - 4)})` }}>
        <Arc size={size} stroke={size * 0.16} p={(pct / 100) * e} color={col.primary} track={withAlpha(col.text, 0.1)} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 900, color: col.text, fontSize: size * 0.26, lineHeight: 1 }}>{num(P, pct * e)}%</div>
        </div>
      </div>
      <div style={{ height: 40 * u }} />
      <Headline text={c.headline} start={start + 6} size={0.6} maxLines={2} align="center" />
    </Stage>
  );
};

export const ProgressRing = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, t, at } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const pct = Math.max(0, Math.min(100, c.value ?? 75));
  const p = clamp01((frame - start) / (m.base * 2.4));
  const e = 1 - Math.pow(1 - p, 3);
  if (P.scene.variant % 2 === 1) {
    const w = stage.w * 0.92;
    return (
      <Stage>
        <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.68} maxLines={2} align="center" />
        <div style={{ height: 50 * u }} />
        <div style={{ width: w, height: 70 * u, borderRadius: 35 * u, backgroundColor: withAlpha(col.text, 0.1), overflow: 'hidden', direction: 'rtl' }}>
          <div style={{ width: `${pct * e}%`, height: '100%', borderRadius: 35 * u, backgroundImage: `linear-gradient(270deg, ${col.primary}, ${col.accent})` }} />
        </div>
        <div dir="ltr" style={{ marginTop: 20 * u, fontFamily: t.fonts.display, fontWeight: 900, fontSize: 110 * u, color: col.primary }}>{num(P, pct * e)}%</div>
      </Stage>
    );
  }
  const size = Math.min(stage.w * 0.66, stage.h * 0.5);
  return (
    <Stage>
      <div style={{ position: 'relative', width: size, height: size }}>
        <Arc size={size} stroke={size * 0.07} p={(pct / 100) * e} color={col.accent} track={withAlpha(col.text, 0.1)} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 * u }}>
          <Icon id={c.icon ?? 'target'} size={size * 0.3} />
          <div dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 900, color: col.text, fontSize: size * 0.18 }}>{num(P, pct * e)}%</div>
        </div>
      </div>
      <div style={{ height: 36 * u }} />
      <Headline text={c.headline} start={start + 6} size={0.6} maxLines={2} align="center" />
    </Stage>
  );
};

export const Versus = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, itemStart, stage, t, at } = P;
  const [a, b] = [c.items?.[0] ?? { text: '' }, c.items?.[1] ?? { text: '' }];
  const colW = stage.w * 0.44;
  const sa = itemStart(0, a, 2), sb = itemStart(1, b, 2);
  const tone = (x: typeof a, fallback: 'good' | 'bad') => (x.tone ?? fallback) === 'good' ? col.good : x.tone === 'neutral' ? col.primary : col.bad;
  const side = (x: typeof a, s: number, fb: 'good' | 'bad', from: number) => {
    const p = m.enter(frame, s);
    return (
      <div style={{ width: colW, opacity: clamp01(p * 1.5), transform: `translateX(${(1 - p) * from * u}px)` }}>
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * u, borderTop: `${12 * u}px solid ${tone(x, fb)}`, padding: 30 * u }}>
          <IconBadge id={x.icon ?? ((x.tone ?? fb) === 'good' ? 'check' : 'cross')} size={150 * u} color={tone(x, fb)} bg={withAlpha(tone(x, fb), 0.15)} />
          <FitText text={x.text} role="body" weight={700} maxWidth={colW - 60 * u} maxSize={56 * u} maxLines={3} />
          {x.value !== undefined && <div dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 900, fontSize: 80 * u, color: tone(x, fb) }}>{num(P, x.value)}{c.unit ?? ''}</div>}
        </Card>
      </div>
    );
  };
  const vs = m.enter(frame, Math.min(sa, sb) + 4);
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.6} maxLines={2} align="center" />
      <div style={{ height: 36 * u }} />
      <div dir="rtl" style={{ display: 'flex', alignItems: 'center', gap: stage.w * 0.04, position: 'relative' }}>
        {side(a, sa, 'bad', 140)}
        {side(b, sb, 'good', -140)}
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 110 * u, height: 110 * u, marginLeft: -55 * u, marginTop: -55 * u, borderRadius: 55 * u, backgroundColor: col.accent, color: col.textOnAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display, fontWeight: 900, fontSize: 44 * u, transform: `scale(${vs}) rotate(${(1 - vs) * 90}deg)` }}>VS</div>
      </div>
    </Stage>
  );
};

export const Timeline = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, itemStart, stage, t, at } = P;
  const items = (c.items ?? []).slice(0, 5);
  const rowH = Math.min(190 * u, (stage.h * 0.8) / Math.max(1, items.length));
  const lineP = clamp01((frame - 2) / Math.max(20, P.dur * 0.6));
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.58} maxLines={2} />
      <div style={{ height: 30 * u }} />
      <div dir="rtl" style={{ position: 'relative', width: stage.w * 0.94 }}>
        <div style={{ position: 'absolute', right: 34 * u, top: 20 * u, width: 6 * u, height: (items.length - 1) * rowH * lineP, backgroundColor: col.primary, borderRadius: 3 * u }} />
        {items.map((it, i) => {
          const s = itemStart(i, it, items.length);
          const p = m.enter(frame, s);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 30 * u, height: rowH, opacity: clamp01(p * 1.4), transform: `translateX(${(1 - p) * 60 * u}px)` }}>
              <div style={{ width: 74 * u, height: 74 * u, flex: 'none', borderRadius: 37 * u, backgroundColor: frame >= s ? col.accent : col.surface, border: `${6 * u}px solid ${col.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {it.icon && <Icon id={it.icon} size={38 * u} color={col.textOnAccent} />}
              </div>
              <div>
                {it.value !== undefined && <div dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: 40 * u, color: col.primary, textAlign: 'right' }}>{toDigits(String(it.value), t.digits)}{c.unit ? ` ${c.unit}` : ''}</div>}
                <FitText text={it.text} role="body" weight={700} maxWidth={stage.w * 0.94 - 140 * u} maxSize={56 * u} maxLines={2} align="start" />
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

export const Steps = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, itemStart, stage, t, at } = P;
  const items = (c.items ?? []).slice(0, 4);
  const cardW = stage.w * 0.94;
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.58} maxLines={2} />
      <div style={{ height: 30 * u }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 * u }}>
        {items.map((it, i) => {
          const s = itemStart(i, it, items.length);
          const p = m.enter(frame, s);
          const done = i < items.length - 1 && frame >= itemStart(i + 1, items[i + 1]!, items.length);
          return (
            <div key={i} dir="rtl" style={{ width: cardW, display: 'flex', alignItems: 'center', gap: 26 * u, padding: `${22 * u}px ${28 * u}px`, borderRadius: t.radius(0.8), backgroundColor: done ? withAlpha(col.primary, 0.18) : col.surface, boxShadow: t.shadow(0.5), opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 50 * u}px) scale(${0.9 + 0.1 * clamp01(p)})` }}>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 900, fontSize: 96 * u, color: done ? col.muted : col.accent, lineHeight: 1, width: 90 * u, textAlign: 'center' }}>{toDigits(String(i + 1), t.digits)}</div>
              <FitText text={it.text} role="body" weight={700} maxWidth={cardW - 190 * u} maxSize={58 * u} maxLines={2} align="start" />
              {it.icon && <div style={{ marginInlineStart: 'auto' }}><Icon id={it.icon} size={72 * u} /></div>}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

export const Checklist = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, itemStart, stage, at } = P;
  const items = (c.items ?? []).slice(0, 5);
  const w = stage.w * 0.94;
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.6} maxLines={2} />
      <div style={{ height: 30 * u }} />
      <Card style={{ width: w, display: 'flex', flexDirection: 'column', gap: 26 * u }}>
        {items.map((it, i) => {
          const s = itemStart(i, it, items.length);
          const p = m.enterC(frame, s);
          const tick = clamp01((frame - s - 4) / 8);
          const bad = it.tone === 'bad';
          const k = bad ? col.bad : col.good;
          return (
            <div key={i} dir="rtl" style={{ display: 'flex', alignItems: 'center', gap: 24 * u, opacity: 0.35 + 0.65 * p }}>
              <div style={{ width: 70 * u, height: 70 * u, flex: 'none', borderRadius: 16 * u, border: `${5 * u}px solid ${k}`, backgroundColor: tick > 0 ? k : 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.2 * Math.sin(tick * Math.PI)})` }}>
                {tick > 0 && (
                  <svg width={44 * u} height={44 * u} viewBox="0 0 24 24">
                    {bad ? <path d="M6 6 L18 18 M18 6 L6 18" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeDasharray={34} strokeDashoffset={34 * (1 - tick)} /> : <path d="M4 12.5 L10 18 L20 6" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={26} strokeDashoffset={26 * (1 - tick)} />}
                  </svg>
                )}
              </div>
              <FitText text={it.text} role="body" weight={700} maxWidth={w - 170 * u} maxSize={56 * u} maxLines={2} align="start" color={bad && tick > 0 ? col.muted : col.text} style={{ textDecoration: bad && tick > 0.9 ? 'line-through' : undefined }} />
            </div>
          );
        })}
      </Card>
    </Stage>
  );
};

export const Rating = () => {
  const P = usePrim();
  const { content: c, frame, u, c: col, at, stage, t } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const r = c.rating ?? 5;
  const star = Math.min(150 * u, stage.w / 6);
  return (
    <Stage>
      <div dir="ltr" style={{ display: 'flex', gap: 16 * u }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const s = start + i * 4;
          const p = clamp01((frame - s) / 8);
          const fill = Math.max(0, Math.min(1, r - i));
          return (
            <div key={i} style={{ position: 'relative', width: star, height: star, transform: `scale(${0.5 + 0.5 * p + 0.15 * Math.sin(p * Math.PI)})`, opacity: clamp01(p * 2) }}>
              <svg width={star} height={star} viewBox="0 0 24 24" style={{ position: 'absolute' }}><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2 6.1 20.5l1.4-6.6-5-4.5 6.6-.7z" fill={withAlpha(col.text, 0.15)} /></svg>
              <div style={{ position: 'absolute', left: 0, top: 0, width: star * fill, height: star, overflow: 'hidden' }}>
                <svg width={star} height={star} viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2 6.1 20.5l1.4-6.6-5-4.5 6.6-.7z" fill="#FFC531" /></svg>
              </div>
            </div>
          );
        })}
      </div>
      <div dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 900, fontSize: 120 * u, color: col.text, marginTop: 20 * u }}>{toDigits(r.toFixed(1), t.digits)}</div>
      <Headline text={c.headline} start={start + 10} size={0.55} maxLines={2} align="center" />
      <Sub text={c.sub} start={start + 18} />
    </Stage>
  );
};

export const AlgeriaMap = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, at, stage, t } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const w = Math.min(stage.w * 0.9, stage.h * 0.62);
  const h = w * 0.92;
  const pts = ALGERIA.map(([lo, la]) => project(lo, la, w, h));
  const d = pts.map((q, i) => `${i ? 'L' : 'M'} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ') + ' Z';
  const draw = clamp01((frame - 2) / 24);
  const total = c.wilayas ?? c.value ?? 58;
  const count = Math.round(total * clamp01((frame - start) / (m.base * 3)));
  return (
    <Stage>
      <div style={{ position: 'relative', width: w, height: h }}>
        <svg width={w} height={h} style={{ position: 'absolute', overflow: 'visible' }}>
          <path d={d} fill={withAlpha(col.primary, 0.18 * draw)} stroke={col.primary} strokeWidth={6 * u} strokeLinejoin="round" strokeDasharray={4000 * u} strokeDashoffset={4000 * u * (1 - draw)} />
        </svg>
        {CITIES.map((city, i) => {
          const [x, y] = project(city.lon, city.lat, w, h);
          const s = start + i * 2;
          const p = clamp01((frame - s) / 6);
          const ring = clamp01((frame - s) / 20);
          return (
            <div key={city.name} style={{ position: 'absolute', left: x - 14 * u, top: y - 14 * u, width: 28 * u, height: 28 * u }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `${3 * u}px solid ${col.accent}`, transform: `scale(${1 + ring * 1.6})`, opacity: (1 - ring) * 0.8 }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: col.accent, transform: `scale(${p})` }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 * u, marginTop: 16 * u }} dir="rtl">
        <span dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 900, fontSize: 130 * u, color: col.accent, lineHeight: 1 }}>{toDigits(String(count), t.digits)}</span>
        <span style={{ fontFamily: t.fonts.display, fontWeight: t.fonts.displayWeight, fontSize: 70 * u, color: col.text }}>{c.unit ?? 'ولاية'}</span>
      </div>
      <Sub text={c.headline} start={start + 10} />
    </Stage>
  );
};

/** 10×10 (or 5×4) people grid filling to a percentage — "70% من الناس". */
export const IconArray = () => {
  const P = usePrim();
  const { content: c, frame, u, c: col, at, stage, t } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const pct = Math.max(0, Math.min(100, c.value ?? 70));
  const cols = 10, rows = P.scene.variant % 2 ? 5 : 10;
  const total = cols * rows;
  const on = Math.round((pct / 100) * total);
  const cell = Math.min((stage.w * 0.9) / cols, (stage.h * 0.5) / rows);
  return (
    <Stage>
      <div dir="ltr" style={{ display: 'flex', alignItems: 'baseline', gap: 10 * u }}>
        <span style={{ fontFamily: t.fonts.display, fontWeight: 900, fontSize: 150 * u, color: col.accent, lineHeight: 1.05 }}>{toDigits(String(Math.round(pct * clamp01((frame - start) / 20))), t.digits)}%</span>
      </div>
      <div dir="rtl" style={{ display: 'flex', flexWrap: 'wrap', width: cell * cols, marginTop: 24 * u }}>
        {Array.from({ length: total }, (_, i) => {
          const lit = i < on && frame >= start + Math.floor((i / Math.max(1, on)) * 22);
          const p = clamp01((frame - 2 - i * 0.25) / 6);
          return (
            <div key={i} style={{ width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `scale(${lit ? 1.08 : 0.92})` }}>
              <svg width={cell * 0.78} height={cell * 0.78} viewBox="0 0 24 24"><circle cx="12" cy="6.5" r="4" fill={lit ? col.accent : withAlpha(col.text, 0.18)} /><path d="M4 22c0-5 3.6-8.5 8-8.5s8 3.5 8 8.5z" fill={lit ? col.accent : withAlpha(col.text, 0.18)} /></svg>
            </div>
          );
        })}
      </div>
      <div style={{ height: 26 * u }} />
      <Headline text={c.headline} start={start + 6} size={0.55} maxLines={2} align="center" />
    </Stage>
  );
};

