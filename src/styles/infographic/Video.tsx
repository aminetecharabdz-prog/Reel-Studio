/**
 * infographic — ONE continuous shot. Each beat owns a visual; on a beat change the previous visual dissolves into
 * 100 glossy units that fly (diagonal stagger) into the next visual's shape, which then resolves — never a cut.
 * Bar → ring bends instead. Numbers roll like mechanical counters and settle on their spoken word.
 */
import type { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useVideo } from '@/engine/context';
import { clamp, ease, lerp, prog } from '@/engine/anim';
import type { TimingIndex } from '@/engine/timing';
import { barBox, bloomAt, compareCentres, layoutFor, samples, type Layout } from './geometry';
import { Bloom, Counter, Glass, GradText, Symbol, lineStyle } from './parts';
import type { Beat, InfographicPlan } from './schema';
import { C, CAT, CAT_ORDER, D, grad, type Cat } from './tokens';

export const CUT_LEAD = 0.25;

type Ctx = { t: number; L: Layout; T: TimingIndex; start: number; end: number; num: (s: string) => string };
const at = (T: TimingIndex, id: string) => T.byId(id).start;
const rollP = (c: Ctx, id: string) => {
  const w = at(c.T, id);
  const s = Math.max(c.start + 0.15, w - 0.75);
  return prog(c.t, s, s + D.counter, ease.outCubic);
};

/** the visual a beat shows (source keeps the previous beat's visual) */
const visualBeat = (beats: Beat[], i: number): Beat => {
  for (let j = i; j >= 0; j--) if (beats[j]!.kind !== 'source') return beats[j]!;
  return beats[i]!;
};

/* ───────────────────────────── visuals ───────────────────────────── */

const dec = (v: number) => Math.min(2, (String(v).split('.')[1] ?? '').length);
const fmt = (v: number, unit: string) => `${v.toFixed(dec(v))}${unit}`;

const GridVis = ({ b, c, a }: { b: Extract<Beat, { kind: 'grid' }>; c: Ctx; a: number }) => {
  const pts = samples(b, c.L);
  const lit = prog(c.t, at(c.T, b.num.at) - 0.2, at(c.T, b.num.at) + 0.6, ease.outCubic);
  const hotN = Math.round(Math.max(0, Math.min(100, b.num.value)));
  return (
    <>
      {pts.map((p, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        const on = i < hotN ? clamp(lit * 1.6 - (row + col) * 0.03) : 0;
        return <Glass key={i} x={p.x} y={p.y} r={p.r} cat={on > 0.5 ? 'cyan' : 'blue'} dim={on > 0.5 ? 0 : hotN < 100 && lit > 0 ? 0.35 * lit : 0} opacity={a} />;
      })}
    </>
  );
};

const BarVis = ({ b, c, a, unit }: { b: Extract<Beat, { kind: 'bar' }>; c: Ctx; a: number; unit: string }) => {
  const B = barBox(c.L);
  const total = b.segments.reduce((s, x) => s + x.value, 0) || 1;
  const grow = prog(c.t, c.start + 0.1, c.start + 0.8, ease.outCubic);
  const shown = b.segments.map((s) => prog(c.t, at(c.T, s.at) - 0.3, at(c.T, s.at) + 0.5, ease.outCubic));
  const focus = shown.reduce((f, k, i) => (k > 0.5 ? i : f), 0);
  // segments laid right → left (RTL); a segment's width opens when it is named
  const weights = b.segments.map((s, i) => (i === 0 ? s.value * Math.max(shown[0]!, 0.0001) + (total - s.value) * (1 - shown[0]!) : s.value * shown[i]!));
  const wsum = weights.reduce((x, y) => x + y, 0) || 1;
  let x = B.x + B.w;
  const segs = b.segments.map((s, i) => {
    const w = (weights[i]! / wsum) * B.w * grow;
    const seg = { s, i, x: x - w, w };
    x -= w;
    return seg;
  });
  const lab = (c.L.mode === 'split' ? 46 : 52) * c.L.u;
  // label centres under their segments, pushed apart (right → left) so they never collide
  const minGap = (c.L.mode === 'split' ? 230 : 250) * c.L.u;
  const labelX: number[] = [];
  segs.forEach(({ x: sx, w }, i) => {
    const want = sx + w / 2;
    const prevX = labelX[i - 1];
    labelX.push(Math.min(B.x + B.w - 120 * c.L.u, prevX === undefined ? want : Math.min(want, prevX - minGap)));
  });
  const over = (labelX[labelX.length - 1] ?? 0) - (B.x + 120 * c.L.u);
  if (over < 0) for (let k = 0; k < labelX.length; k++) labelX[k] = labelX[k]! - over * (k / Math.max(1, labelX.length - 1));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      <div style={{ position: 'absolute', left: B.x, top: B.y, width: B.w, height: B.h, borderRadius: B.h, background: '#0B0F14', overflow: 'hidden' }}>
        {segs.map(({ i, x: sx, w }) => {
          const cat: Cat = i === focus ? 'cyan' : (CAT_ORDER[(i + 1) % 4] ?? 'blue');
          return (
            <div key={i} style={{ position: 'absolute', left: sx - B.x, top: 0, width: Math.max(0, w - 2 * c.L.u), height: B.h, background: grad(cat), opacity: i === focus ? 1 : 0.78 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: B.h / 3, background: 'linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))' }} />
            </div>
          );
        })}
      </div>
      {segs.map(({ s, i }) =>
        shown[i]! > 0 ? (
          <div key={i} dir="rtl" style={{ position: 'absolute', top: B.y + B.h + 26 * c.L.u, left: labelX[i]! - 180 * c.L.u, width: 360 * c.L.u, textAlign: 'center', ...lineStyle(shown[i]!, 0, c.L.u) }}>
            <Counter value={s.value} decimals={dec(s.value)} unit={unit} p={rollP(c, s.at)} size={lab} cat={i === focus ? 'cyan' : 'muted'} glow={i === focus ? 0.45 : 0.15} />
            <div style={{ fontFamily: C.font, fontWeight: 500, fontSize: 26 * c.L.u, color: i === focus ? C.text : C.text2, lineHeight: 1.4, marginTop: 4 * c.L.u }}>{s.label}</div>
          </div>
        ) : null,
      )}
    </div>
  );
};

const RingVis = ({ b, c, a, bend }: { b: Extract<Beat, { kind: 'ring' }>; c: Ctx; a: number; bend: number }) => {
  const { L } = c;
  const R = L.S * 0.42;
  const sw = L.S * 0.12;
  const total = b.segments.reduce((s, x) => s + x.value, 0) || 1;
  const shown = b.segments.map((s, i) => prog(c.t, Math.max(c.start + 0.5 + i * 0.06, at(c.T, s.at) - 0.4), Math.max(c.start + 1.3 + i * 0.06, at(c.T, s.at) + 0.4), ease.outCubic));
  const focus = shown.reduce((f, k, i) => (k > 0.5 ? i : f), 0);
  const circ = 2 * Math.PI * R;
  let acc = 0;
  // bar → ring: an arc of constant length whose radius shrinks from very large to R
  if (bend < 1) {
    const B = barBox(L);
    const len = B.w;
    const rr = R * Math.exp((1 - bend) * Math.log(40));
    const ang = Math.min(Math.PI * 2 * 0.999, len / rr);
    const cxA = lerp(B.x + B.w / 2, L.cx, bend);
    const cyA = lerp(B.y + B.h / 2, L.cy, bend) + rr;
    const p0 = { x: cxA + Math.sin(ang / 2) * rr, y: cyA - Math.cos(ang / 2) * rr };
    const p1 = { x: cxA - Math.sin(ang / 2) * rr, y: cyA - Math.cos(ang / 2) * rr };
    return (
      <svg width={L.W} height={L.H} style={{ position: 'absolute', inset: 0, opacity: a }}>
        <defs>
          <linearGradient id="igbend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={CAT.cyan[0]} />
            <stop offset="1" stopColor={CAT.cyan[2]} />
          </linearGradient>
        </defs>
        <path d={`M ${p0.x} ${p0.y} A ${rr} ${rr} 0 ${ang > Math.PI ? 1 : 0} 0 ${p1.x} ${p1.y}`} fill="none" stroke="url(#igbend)" strokeWidth={lerp(B.h, sw, bend)} strokeLinecap="round" />
      </svg>
    );
  }
  const fp = rollP(c, b.segments[focus]!.at);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      <svg width={L.W} height={L.H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {b.segments.map((_, i) => {
            const cat: Cat = i === focus ? 'cyan' : 'muted';
            return (
              <linearGradient key={i} id={`igr${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={CAT[cat][0]} />
                <stop offset="1" stopColor={CAT[cat][2]} />
              </linearGradient>
            );
          })}
        </defs>
        <circle cx={L.cx} cy={L.cy} r={R} fill="none" stroke="#0B141C" strokeWidth={sw} />
        {b.segments.map((s, i) => {
          const frac = s.value / total;
          const len = frac * circ * shown[i]!;
          const off = acc;
          acc += frac * circ;
          return (
            <g key={i}>
              {i === focus && <circle cx={L.cx} cy={L.cy} r={R} fill="none" stroke={CAT.cyan[1]} strokeOpacity={0.3} strokeWidth={sw * 1.4} strokeDasharray={`${len} ${circ}`} strokeDashoffset={-off} transform={`rotate(-90 ${L.cx} ${L.cy})`} />}
              <circle cx={L.cx} cy={L.cy} r={R} fill="none" stroke={`url(#igr${i})`} strokeWidth={sw} strokeDasharray={`${Math.max(0, len - 3 * L.u)} ${circ}`} strokeDashoffset={-off} transform={`rotate(-90 ${L.cx} ${L.cy})`} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: L.cx - R, top: L.cy - R, width: R * 2, height: R * 2, display: 'grid', placeItems: 'center' }}>
        <Counter value={b.segments[focus]!.value} decimals={dec(b.segments[focus]!.value)} unit={b.unit} p={fp} size={R * 0.42} />
      </div>
      <Legend b={b} c={c} focus={focus} shown={shown} />
    </div>
  );
};

const Legend = ({ b, c, focus, shown }: { b: Extract<Beat, { kind: 'ring' }>; c: Ctx; focus: number; shown: number[] }) => {
  const { L } = c;
  const split = L.mode === 'split';
  const fs = (split ? 30 : 34) * L.u;
  const box = split ? { right: L.W - L.tx, top: L.H * 0.42, width: L.tw * 0.9 } : { right: L.W * 0.08, top: L.cy + L.S * 0.6, width: L.W * 0.84 };
  return (
    <div dir="rtl" style={{ position: 'absolute', ...box, fontFamily: C.font }}>
      {b.segments.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 * L.u, height: 76 * L.u, borderBottom: `${1.5 * L.u}px solid ${C.hair}`, opacity: Math.max(0.15, shown[i]!) * (i === focus ? 1 : 0.6) }}>
          <span style={{ width: 12 * L.u, height: 12 * L.u, borderRadius: 99, background: i === focus ? CAT.cyan[1] : CAT.muted[1], flex: 'none' }} />
          <span style={{ flex: 1, fontWeight: 500, fontSize: fs, color: i === focus ? C.text : C.text2, lineHeight: 1.4 }}>{s.label}</span>
          <span dir="ltr" style={{ fontWeight: 700, fontSize: fs, color: i === focus ? CAT.cyan[1] : C.text2, fontVariantNumeric: 'tabular-nums' }}>{c.num(fmt(s.value, b.unit))}</span>
        </div>
      ))}
    </div>
  );
};

const CompareVis = ({ b, c, a }: { b: Extract<Beat, { kind: 'compare' }>; c: Ctx; a: number }) => {
  const cs = compareCentres(b.items.map((x) => x.value), c.L);
  const vertical = cs.length > 1 && Math.abs(cs[0]!.x - cs[1]!.x) < 1;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      {cs.map((p, i) => {
        const s = b.items[i]!;
        const k = prog(c.t, Math.max(c.start + 0.3 + i * 0.2, at(c.T, s.at) - 0.3), Math.max(c.start + 0.75 + i * 0.2, at(c.T, s.at) + 0.15), ease.outBack);
        const prev = cs[i - 1];
        const px = prev ? lerp(prev.x, p.x, Math.min(1, k)) : p.x;
        const py = prev ? lerp(prev.y, p.y, Math.min(1, k)) : p.y;
        return (
          <div key={i}>
            {prev && k > 0.3 && (
              <div style={{ position: 'absolute', left: vertical ? p.x - 15 * c.L.u : (prev.x - prev.r + p.x + p.r) / 2 - 15 * c.L.u, top: vertical ? (prev.y + prev.r + p.y - p.r) / 2 - 15 * c.L.u : p.y - 15 * c.L.u, color: C.text2, fontSize: 40 * c.L.u, lineHeight: 1, opacity: clamp((k - 0.3) * 2), fontFamily: C.font }}>{vertical ? '↓' : '←'}</div>
            )}
            <Glass x={px} y={py} r={p.r * Math.max(0, k)} cat={i === b.items.length - 1 ? 'cyan' : CAT_ORDER[(i + 1) % 4]} />
            {k > 0.2 && (
              <div dir="rtl" style={{ position: 'absolute', ...(vertical ? { left: p.x + p.r + 30 * c.L.u, top: p.y - 40 * c.L.u, textAlign: 'right' as const } : { left: p.x - 150 * c.L.u, top: p.y + Math.max(p.r, 40 * c.L.u) + 22 * c.L.u, width: 300 * c.L.u, textAlign: 'center' as const }), fontFamily: C.font, ...lineStyle(clamp(k), 0, c.L.u) }}>
                <Counter value={s.value} decimals={dec(s.value)} unit={b.unit} p={rollP(c, s.at)} size={(c.L.mode === 'split' ? 44 : 56) * c.L.u} cat={i === b.items.length - 1 ? 'cyan' : 'ice'} glow={0.3} />
                <div style={{ fontWeight: 500, fontSize: (c.L.mode === 'split' ? 26 : 32) * c.L.u, color: C.text2, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const VersusVis = ({ b, c, a }: { b: Extract<Beat, { kind: 'versus' }>; c: Ctx; a: number }) => {
  const B = barBox(c.L);
  const max = Math.max(b.a.value, b.b.value, 1e-9);
  const rows = [b.a, b.b];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      {rows.map((s, i) => {
        const y = B.y + B.h / 2 + (i - 0.5) * B.h * 2.6;
        const k = prog(c.t, Math.max(c.start + 0.2, at(c.T, s.at) - 0.4), Math.max(c.start + 1.0, at(c.T, s.at) + 0.5), ease.outCubic);
        const w = (B.w * 0.72 * s.value) / max;
        const cat: Cat = i === 1 ? 'cyan' : 'blue';
        return (
          <div key={i} dir="rtl" style={{ position: 'absolute', right: c.L.W - (B.x + B.w), top: y - B.h * 0.45, width: B.w, height: B.h * 0.9, display: 'flex', alignItems: 'center', gap: 20 * c.L.u }}>
            <div style={{ width: Math.max(B.h * 0.9, w * k), height: B.h * 0.9, borderRadius: B.h, background: grad(cat, 90), flex: 'none' }} />
            <div style={{ fontFamily: C.font, display: 'flex', flexDirection: 'column', opacity: k }}>
              <Counter value={s.value} decimals={dec(s.value)} unit={b.unit} p={rollP(c, s.at)} size={(c.L.mode === 'split' ? 46 : 60) * c.L.u} cat={cat} glow={0.3} />
              <span style={{ fontWeight: 500, fontSize: (c.L.mode === 'split' ? 24 : 30) * c.L.u, color: C.text2, lineHeight: 1.4 }}>{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TimelineVis = ({ b, c, a }: { b: Extract<Beat, { kind: 'timeline' }>; c: Ctx; a: number }) => {
  const { L } = c;
  const x0 = L.W * 0.12;
  const x1 = L.W * 0.88;
  const y = L.mode === 'split' ? L.H * 0.6 : L.cy;
  const p = prog(c.t, c.start + 0.3, at(c.T, b.at) + 0.2, ease.inOutCubic);
  const year = Math.round(lerp(b.fromYear, b.toYear, p));
  const ticks = 10;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      <div style={{ position: 'absolute', left: x0, width: x1 - x0, top: y - 1.5 * L.u, height: 3 * L.u, background: '#13202B' }} />
      <div style={{ position: 'absolute', left: x1 - (x1 - x0) * p, width: (x1 - x0) * p, top: y - 2 * L.u, height: 4 * L.u, background: grad('cyan', 90), boxShadow: `0 0 ${18 * L.u}px ${CAT.cyan[1]}` }} />
      {Array.from({ length: ticks + 1 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: x1 - ((x1 - x0) * i) / ticks - 1, top: y - 14 * L.u, width: 2 * L.u, height: 28 * L.u, background: i / ticks <= p ? CAT.cyan[1] : '#1F2C38' }} />
      ))}
      <div style={{ position: 'absolute', left: x1 - (x1 - x0) * p - 160 * L.u, width: 320 * L.u, top: y - 150 * L.u, textAlign: 'center' }}>
        <span dir="ltr" style={{ fontFamily: C.font, fontWeight: 700, fontSize: 96 * L.u, fontVariantNumeric: 'tabular-nums' }}>
          <GradText cat="cyan">{c.num(String(year))}</GradText>
        </span>
      </div>
    </div>
  );
};

const Globe = ({ c, a, rise }: { c: Ctx; a: number; rise: number }) => {
  const { L } = c;
  const R = L.S * 0.62;
  const cy = L.cy + (1 - rise) * L.H * 0.5;
  const rot = c.t * 0.25;
  const dots: ReactNode[] = [];
  for (let i = 0; i < 420; i++) {
    const yy = 1 - (i / 419) * 2;
    const rad = Math.sqrt(1 - yy * yy);
    const th = i * 2.399963 + rot;
    const z = Math.sin(th) * rad;
    if (z < 0) continue;
    // fake continents: keep dots where a smooth noise is positive
    const land = Math.sin(th * 2.1 + yy * 3.3) + Math.cos(th * 1.3 - yy * 4.1) > 0.35;
    if (!land) continue;
    dots.push(<circle key={i} cx={L.cx + Math.cos(th) * rad * R} cy={cy + yy * R} r={(2.2 + z * 1.6) * L.u} fill="#BFE4FF" opacity={0.35 + 0.55 * z} />);
  }
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      <Glass x={L.cx} y={cy} r={R} cat="blue" />
      <svg width={L.W} height={L.H} style={{ position: 'absolute', inset: 0 }}>
        {dots}
      </svg>
    </div>
  );
};

const VisualOf = ({ b, c, a, prev }: { b: Beat; c: Ctx; a: number; prev?: Beat }) => {
  const { L } = c;
  switch (b.kind) {
    case 'grid':
      return <GridVis b={b} c={c} a={a} />;
    case 'bar':
      return <BarVis b={b} c={c} a={a} unit={b.unit} />;
    case 'ring':
      return <RingVis b={b} c={c} a={a} bend={prev?.kind === 'bar' ? prog(c.t, c.start, c.start + D.morph, ease.inOutCubic) : 1} />;
    case 'compare':
      return <CompareVis b={b} c={c} a={a} />;
    case 'versus':
      return <VersusVis b={b} c={c} a={a} />;
    case 'timeline':
      return <TimelineVis b={b} c={c} a={a} />;
    case 'globe':
      return <Globe c={c} a={a} rise={prog(c.t, c.start, c.start + 0.8, ease.outCubic)} />;
    case 'sphere':
      return <Glass x={L.cx} y={L.cy} r={L.S * 0.34} cat="cyan" opacity={a} />;
    case 'symbol': {
      const k = prog(c.t, c.start + 0.2, c.start + 0.8, ease.outCubic);
      return (
        <div style={{ position: 'absolute', inset: 0, opacity: a }}>
          {[0.47, 0.29].map((r, i) => (
            <div key={i} style={{ position: 'absolute', left: L.cx - L.S * r, top: L.cy - L.S * r, width: L.S * r * 2, height: L.S * r * 2, borderRadius: '50%', background: `rgba(14,42,64,${i ? 0.5 : 0.35})`, transform: `scale(${0.9 + 0.1 * k})` }} />
          ))}
          <div style={{ position: 'absolute', left: L.cx - L.S * 0.16, top: L.cy + L.S * 0.2, width: L.S * 0.32, height: L.S * 0.05, borderRadius: '50%', border: `${1.5 * L.u}px solid rgba(100,210,255,0.4)` }} />
          <Symbol icon={b.icon} x={L.cx} y={L.cy - L.S * 0.02} size={L.S * 0.3} k={k} />
        </div>
      );
    }
    case 'stat':
      if (b.visual === 'sphere') return <Glass x={L.cx} y={L.cy} r={L.S * 0.3} cat="cyan" opacity={a} />;
      if (b.visual === 'globe') return <Globe c={c} a={a} rise={prog(c.t, c.start, c.start + 0.8, ease.outCubic)} />;
      return null;
    case 'headline':
      return <Glass x={L.cx} y={L.cy} r={L.S * 0.2} cat="cyan" opacity={a * 0.9} />;
    default:
      return null;
  }
};

/** the 100-unit bridge between two visuals */
const Particles = ({ from, to, k, L }: { from: Beat; to: Beat; k: number; L: Layout }) => {
  const A = samples(from, L);
  const B = samples(to, L);
  return (
    <>
      {A.map((p, i) => {
        const q = B[i]!;
        const row = Math.floor(i / 10);
        const col = i % 10;
        const d = (row + col) * 0.025;
        const kk = ease.outBack(clamp((k - d) / Math.max(0.2, 1 - 0.45)));
        const x = lerp(p.x, q.x, kk);
        const y = lerp(p.y, q.y, kk) - Math.sin(Math.PI * clamp(kk)) * 40 * L.u;
        const r = lerp(p.r, q.r, clamp(kk));
        return <Glass key={i} x={x} y={y} r={Math.max(2, r)} cat={q.hot ? 'cyan' : 'blue'} />;
      })}
    </>
  );
};

/* ───────────────────────────── text ───────────────────────────── */

const Lines = ({ items, c, k0, out, align, style }: { items: Array<ReactNode | null>; c: Ctx; k0: number; out: number; align: 'right' | 'center'; style: React.CSSProperties }) => (
  <div dir="rtl" style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-start' : 'center', textAlign: align, gap: 10 * c.L.u, fontFamily: C.font, ...style }}>
    {items.filter(Boolean).map((n, i) => (
      <div key={i} style={lineStyle(prog(c.t, k0 + i * D.stagger, k0 + i * D.stagger + D.textIn, ease.outExpo), out, c.L.u)}>
        {n}
      </div>
    ))}
  </div>
);

const Eyebrow = ({ s, c }: { s: string; c: Ctx }) => (s ? <span style={{ fontWeight: 300, fontSize: (c.L.mode === 'split' ? 30 : 34) * c.L.u, color: C.text2, lineHeight: 1.4 }}>{s}</span> : null);
const Label = ({ s, c, active = true }: { s: string; c: Ctx; active?: boolean }) => (s ? <span style={{ fontWeight: 500, fontSize: (c.L.mode === 'split' ? 33 : 38) * c.L.u, color: active ? C.text : C.text2, lineHeight: 1.4 }}>{s}</span> : null);
const Headline = ({ s, c, keyWord = '' }: { s: string; c: Ctx; keyWord?: string }) => {
  const size = (c.L.mode === 'split' ? 68 : 72) * c.L.u;
  if (!keyWord || !s.includes(keyWord)) return <span style={{ fontWeight: 700, fontSize: size, color: C.text, lineHeight: 1.4 }}>{s}</span>;
  const [a, b] = [s.slice(0, s.indexOf(keyWord)), s.slice(s.indexOf(keyWord) + keyWord.length)];
  return (
    <span style={{ fontWeight: 700, fontSize: size, color: C.text, lineHeight: 1.4 }}>
      {a}
      <span style={{ color: CAT.cyan[1] }}>{keyWord}</span>
      {b}
    </span>
  );
};

const TextOf = ({ b, c, out, beats, i }: { b: Beat; c: Ctx; out: number; beats: Beat[]; i: number }) => {
  const { L } = c;
  const k0 = c.start + 0.12;
  const split = L.mode === 'split';
  const hero = (split ? 158 : L.mode === 'stack' ? 190 : 150) * L.u;
  const colStyle: React.CSSProperties = split ? { right: L.W - L.tx, top: 0, bottom: 0, width: L.tw, justifyContent: 'center' } : { left: L.W * 0.06, right: L.W * 0.06, top: L.ny - hero * 0.15 };
  const topStyle: React.CSSProperties = { right: L.W - L.tx, top: split ? L.H * 0.13 : L.ty, width: L.tw };
  const numNode = (n: { value: number; decimals: number; unit: string; at: string }, size = hero, cat: Cat = 'cyan') => <Counter value={n.value} decimals={n.decimals} unit={n.unit} p={rollP(c, n.at)} size={size} cat={cat} />;
  switch (b.kind) {
    case 'stat': {
      if (b.visual === 'none') return <Lines c={c} k0={k0} out={out} align="center" items={[<Eyebrow key="e" s={b.eyebrow} c={c} />, numNode(b.num, (split ? 190 : 210) * L.u), <Label key="l" s={b.label} c={c} />]} style={{ left: L.W * 0.06, right: L.W * 0.06, top: 0, bottom: 0, justifyContent: 'center' }} />;
      return <Lines c={c} k0={k0} out={out} align={split ? 'right' : 'center'} items={[<Eyebrow key="e" s={b.eyebrow} c={c} />, numNode(b.num), <Label key="l" s={b.label} c={c} />]} style={colStyle} />;
    }
    case 'globe':
    case 'sphere':
    case 'symbol':
      return (
        <>
          {b.kind === 'symbol' && b.equation && <Lines c={c} k0={k0 + 0.5} out={out} align={split ? 'right' : 'center'} items={[<span key="q" style={{ fontWeight: 700, fontSize: 45 * L.u, color: C.text, lineHeight: 1.4 }}>{b.equation}</span>]} style={split ? { right: L.W - L.tx, bottom: L.H * 0.14, width: L.tw } : { left: L.W * 0.06, right: L.W * 0.06, top: L.ty }} />}
          <Lines c={c} k0={k0} out={out} align={split ? 'right' : 'center'} items={[<Eyebrow key="e" s={b.eyebrow} c={c} />, b.num ? numNode(b.num) : null, <Label key="l" s={b.label} c={c} />]} style={b.kind === 'globe' && !split ? { left: L.W * 0.06, right: L.W * 0.06, top: L.ty } : colStyle} />
        </>
      );
    case 'grid': {
      const rest = Math.round((100 - b.num.value) * 10) / 10;
      const restNum = { value: rest, decimals: rest % 1 ? 1 : 0, unit: b.num.unit, at: b.num.at };
      const items = split
        ? [<Eyebrow key="e" s={b.eyebrow} c={c} />, numNode(b.num, hero * 0.75), <Label key="l" s={b.label} c={c} />, b.rest ? <span key="g" style={{ display: 'block', height: 20 * L.u }} /> : null, b.rest ? <Eyebrow key="e2" s={b.rest} c={c} /> : null, b.rest ? numNode(restNum, hero * 0.5, 'blue') : null]
        : [<Eyebrow key="e" s={b.eyebrow} c={c} />, numNode(b.num, hero * 0.8), <Label key="l" s={b.label} c={c} />];
      return <Lines c={c} k0={k0} out={out} align={split ? 'right' : 'center'} items={items} style={colStyle} />;
    }
    case 'bar':
    case 'ring':
    case 'compare':
    case 'versus':
      return <Lines c={c} k0={k0} out={out} align={split || L.mode === 'stack' ? 'right' : 'center'} items={[<Eyebrow key="e" s={b.eyebrow} c={c} />, b.title ? <Headline key="h" s={b.title} c={c} /> : null]} style={b.kind === 'ring' && split ? { right: L.W - L.tx, top: L.H * 0.16, width: L.tw } : topStyle} />;
    case 'timeline':
      return <Lines c={c} k0={k0} out={out} align={split ? 'right' : 'right'} items={[<Eyebrow key="e" s={b.eyebrow} c={c} />, <Label key="l" s={b.label} c={c} />]} style={topStyle} />;
    case 'headline':
      return <Lines c={c} k0={k0} out={out} align={split ? 'right' : 'center'} items={[<Eyebrow key="e" s={b.eyebrow} c={c} />, <Headline key="h" s={b.text} keyWord={b.key} c={c} />]} style={split ? colStyle : { left: L.W * 0.06, right: L.W * 0.06, top: L.ny - 40 * L.u }} />;
    case 'source': {
      const pv = visualBeat(beats, i);
      return (
        <>
          {pv.kind !== 'source' && i > 0 && <TextOf b={beats[i - 1]!} c={{ ...c, start: c.start - 5 }} out={0} beats={beats} i={i - 1} />}
          <Lines c={c} k0={k0 + 0.2} out={out} align="center" items={[<span key="s" style={{ fontWeight: 300, fontSize: (split ? 22 : 30) * L.u, color: C.text2, opacity: 0.85, lineHeight: 1.4 }}>{b.source ? `المصدر: ${b.source}` : b.title}</span>]} style={L.mode === 'stack' ? { left: L.W * 0.06, right: L.W * 0.06, top: L.ty * 0.6 } : { left: L.W * 0.06, right: L.W * 0.06, bottom: L.H * 0.06 }} />
        </>
      );
    }
  }
};

/* ───────────────────────────── the shot ───────────────────────────── */

export const InfographicVideo = ({ plan }: { plan: InfographicPlan }) => {
  const frame = useCurrentFrame();
  const { T, W, H, fps, contentEnd, num } = useVideo();
  const t = frame / fps;
  const L = layoutFor(W, H);
  const beats = plan.beats;
  const wins = T.windows(beats.map((b) => b.from), contentEnd, CUT_LEAD);
  let i = 0;
  wins.forEach((w, j) => {
    if (t >= w.from) i = j;
  });
  const b = beats[i]!;
  const vb = visualBeat(beats, i);
  const start = wins[i]!.from;
  const end = wins[i]!.to;
  const c: Ctx = { t, L, T, start, end, num };
  const prev = i > 0 ? visualBeat(beats, i - 1) : null;
  const same = (a: Beat, b2: Beat) => a === b2 || (a.kind === b2.kind && ['headline', 'sphere'].includes(a.kind)) || (a.kind === 'stat' && b2.kind === 'stat' && a.visual === b2.visual);
  const sameVisual = !!prev && same(prev, vb);
  const mk = prev && !sameVisual ? prog(t, start, start + D.morph, ease.inOutCubic) : 1;
  const bend = prev?.kind === 'bar' && vb.kind === 'ring';
  const usesBridge = prev && !sameVisual && !bend && mk < 1;
  // bloom glides to the active object
  const bp = bloomAt(vb, L);
  const bq = prev ? bloomAt(prev, L) : bp;
  const bx = lerp(bq.x, bp.x, mk);
  const by = lerp(bq.y, bp.y, mk);
  const teal = ['bar', 'ring', 'symbol', 'versus', 'timeline'].includes(vb.kind) ? 1 : 0;
  const first = i === 0 ? prog(t, 0, 0.6, ease.outCubic) : 1;
  const textOut = prog(t, end - D.textOut, end, ease.outQuad);
  const camera = 1 + 0.03 * prog(t, start, end, ease.inOutSine);
  return (
    <AbsoluteFill style={{ background: C.black, direction: 'rtl', overflow: 'hidden' }}>
      <Bloom x={bx} y={by} r={Math.max(W, H) * 0.55} teal={teal} />
      <AbsoluteFill style={{ transform: `scale(${camera})`, transformOrigin: `${bx}px ${by}px` }}>
        {usesBridge && prev && <VisualOf b={prev} c={{ ...c, start: wins[i - 1]!.from, end: start }} a={1 - clamp(mk * 4)} />}
        {usesBridge && prev && <Particles from={prev} to={vb} k={mk} L={L} />}
        <AbsoluteFill style={{ opacity: first * (usesBridge ? clamp((mk - 0.7) / 0.3) : 1), transform: i === 0 ? `scale(${0.92 + 0.08 * first})` : undefined }}>
          <VisualOf b={vb} c={{ ...c, start: vb === b ? start : wins[beats.indexOf(vb)]!.from }} a={1} prev={prev ?? undefined} />
        </AbsoluteFill>
      </AbsoluteFill>
      <TextOf b={b} c={c} out={i === beats.length - 1 ? 0 : textOut} beats={beats} i={i} />
    </AbsoluteFill>
  );
};
