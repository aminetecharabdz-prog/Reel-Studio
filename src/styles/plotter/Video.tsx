/**
 * plotter — spark-pen blueprint. Dark graph-paper canvas that glides between beats; a glowing pen spark draws
 * underlines, connectors, schematics and outlined titles; hard cuts only to orange "slam" frames and paper interludes.
 */
import type { ReactNode } from 'react';
import { AbsoluteFill, Img, Sequence } from 'remotion';
import { useVideo } from '@/engine/context';
import { E, clamp01, mix, prog, sec, useScene } from '@/engine/scene';
import { measure } from '@/engine/measure';
import { Annotations, Canvas, Guide, Spark, glowText, polyLen, schematicPaths } from './parts';
import type { PlotterPlan, PlotterScene } from './schema';
import { CUT_LEAD, Q } from './tokens';

type Of<K extends PlotterScene['kind']> = Extract<PlotterScene, { kind: K }>;
type SP<K extends PlotterScene['kind']> = { s: Of<K>; from: number; dur: number; idx: number };

const lay = (W: number, H: number) => {
  const land = W > H * 1.2;
  const port = H > W * 1.25;
  const u = Math.min(W, H) / 1080;
  if (land) return { land, port, u, text: { right: W * 0.17, top: H * 0.24, width: W * 0.5 }, dia: { cx: W * 0.28, cy: H * 0.56, w: W * 0.44, h: H * 0.5 }, hero: 270 * u, line: 60 * u };
  if (port) return { land, port, u, text: { right: 80 * u, top: H * 0.13, width: W - 160 * u }, dia: { cx: W * 0.5, cy: H * 0.64, w: W - 160 * u, h: H * 0.36 }, hero: 0.24 * W, line: 62 * u };
  return { land, port, u, text: { right: 60 * u, top: H * 0.08, width: W * 0.8 }, dia: { cx: W * 0.42, cy: H * 0.66, w: W * 0.7, h: H * 0.42 }, hero: 220 * u, line: 54 * u };
};

/** the canvas glides from the previous beat's position (one continuous technical sheet) */
const useGlide = (from: number, idx: number) => {
  const sc = useScene(from);
  const g = prog(sc.f, 0, sec(0.55, sc.fps), E.inOut);
  const dir = idx % 2 ? 1 : -1;
  const port = sc.H > sc.W * 1.25;
  // vertical videos scroll mostly vertically (a tall technical sheet), wide ones pan sideways
  const dx = (port ? 0.18 : 0.36) * sc.W;
  const dy = (port ? 0.22 : 0.12) * sc.H;
  const ox = idx * dx + (1 - g) * -dx;
  const oy = (idx % 3) * dy + (1 - g) * -dy * dir;
  return { ...sc, g, ox, oy, shift: (1 - g) * dx, shiftY: (1 - g) * dy * dir };
};

const Dark = ({ from, idx, floor, children }: { from: number; idx: number; floor?: boolean; children: ReactNode }) => {
  const { W, H, u, ox, oy, shift, shiftY, f, dur } = { ...useGlide(from, idx), dur: 0 };
  void dur;
  return (
    <AbsoluteFill>
      <Canvas W={W} H={H} u={u} ox={ox} oy={oy} floor={floor} />
      <AbsoluteFill style={{ transform: `translate(${shift}px, ${shiftY}px)` }}>{children}</AbsoluteFill>
      <Annotations W={W} H={H} u={u} seed={`a${idx}`} k={prog(f, 0, 9)} />
    </AbsoluteFill>
  );
};

/** words appearing on their spoken times (fade + rise + blur), RTL, one key word orange */
const HeroWords = ({ words, at, f, size, u, font = Q.hero, weight = 900, align = 'right' }: { words: Array<{ t: string; at: string; key: boolean }>; at: (id: string) => number; f: number; size: number; u: number; font?: string; weight?: number; align?: 'right' | 'center' }) => (
  <div dir="rtl" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: align === 'right' ? 'flex-start' : 'center', columnGap: size * 0.22, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.35 }}>
    {words.map((w, i) => {
      const k = prog(f, at(w.at) - 2, 10, E.out);
      return (
        <span key={i} style={{ ...glowText(w.key), opacity: k, transform: `translateY(${(1 - k) * 24 * u}px)`, filter: k < 1 ? `blur(${(1 - k) * 6 * u}px)` : undefined, whiteSpace: 'nowrap' }}>
          {w.t}
        </span>
      );
    })}
  </div>
);

/* ───────────────────────────── scenes ───────────────────────────── */

const PenTitle = ({ s, from, idx }: SP<'penTitle'>) => {
  const { f, at, end, W, H, u, fps } = useScene(from);
  const L = lay(W, H);
  const text = s.words.map((w) => w.t).join(' ');
  const size = Math.min(L.port ? 130 * u : 150 * u, (W * 0.84 * 140 * u) / Math.max(1, measure(text, 'Alexandria', 200, 140 * u)));
  const tw = measure(text, 'Alexandria', 200, size);
  const t0 = at(s.words[0]!.at) - 3;
  const t1 = Math.max(t0 + sec(1.2, fps), end(s.words[s.words.length - 1]!.at));
  const k = prog(f, t0, t1 - t0, E.linear);
  const fill = prog(f, t1, sec(0.5, fps), E.out);
  const cx = W / 2;
  const cy = H * (L.port ? 0.4 : 0.45);
  const right = cx + tw / 2;
  const tipX = right - k * tw;
  const ul = prog(f, t1, sec(0.6, fps), E.inOut);
  return (
    <Dark from={from} idx={idx}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id={`pt${idx}`}>
            <rect x={tipX} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        <text x={cx} y={cy} textAnchor="middle" direction="rtl" fontFamily="Alexandria" fontWeight={200} fontSize={size} fill="none" stroke={Q.bone} strokeWidth={3} clipPath={`url(#pt${idx})`}>
          {text}
        </text>
        <text x={cx} y={cy} textAnchor="middle" direction="rtl" fontFamily="Alexandria" fontWeight={200} fontSize={size} fill={Q.bone} opacity={fill * 0.9}>
          {text}
        </text>
        <line x1={right + tw * 0.06} y1={cy + size * 0.35} x2={right + tw * 0.06 - (tw * 1.12) * ul} y2={cy + size * 0.35} stroke={Q.bone} strokeWidth={2} />
      </svg>
      {k > 0 && k < 1 && <Spark x={tipX} y={cy - size * 0.3} f={f} u={u} />}
      {ul > 0 && <Spark x={right + tw * 0.06 - tw * 1.12 * ul} y={cy + size * 0.35} f={f} u={u} k={ul < 1 ? 1 : 0.8} />}
      <div style={{ position: 'absolute', left: cx - tw / 2, top: cy + size * 0.5, fontFamily: Q.mono, fontSize: 16 * u, color: Q.muted, direction: 'ltr', opacity: fill }}>stroke 3.0 · pen 01</div>
    </Dark>
  );
};

const HeroStack = ({ s, from, idx }: SP<'heroStack'>) => {
  const { f, at, W, H, u, fps } = useScene(from);
  const L = lay(W, H);
  const lastHero = s.hero[s.hero.length - 1]!;
  const heroText = s.hero.map((h) => h.t).join(' ');
  const size = Math.min(L.hero, (L.text.width * 0.98 * L.hero) / Math.max(1, measure(heroText, 'Alexandria', 900, L.hero)));
  const hw = measure(heroText, 'Alexandria', 900, size);
  const ulK = prog(f, at(lastHero.at) + sec(0.3, fps), sec(0.4, fps), E.inOut);
  const heroTop = L.text.top + (s.kicker.length ? 70 * u : 0);
  const ulY = heroTop + size * 1.32;
  const right = W - L.text.right;
  const ulW = hw * 1.1;
  return (
    <Dark from={from} idx={idx}>
      <div style={{ position: 'absolute', right: L.text.right, top: L.text.top, width: L.text.width }}>
        {s.kicker.length > 0 && <HeroWords words={s.kicker} at={at} f={f} size={44 * u} u={u} weight={700} />}
      </div>
      <div style={{ position: 'absolute', right: L.text.right, top: heroTop, width: L.text.width }}>
        <HeroWords words={s.hero} at={at} f={f} size={size} u={u} />
      </div>
      <Guide box={{ x: right - hw - 30 * u, y: heroTop - 10 * u, w: hw + 60 * u, h: size * 1.4 }} u={u} label="easeOutCubic" k={prog(f, at(s.hero[0]!.at), 8) * 0.9} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={right + ulW * 0.05} y1={ulY} x2={right + ulW * 0.05 - ulW * ulK} y2={ulY} stroke={s.hero.some((h) => h.key) ? Q.signal : Q.bone} strokeWidth={2} />
      </svg>
      {ulK > 0 && <Spark x={right + ulW * 0.05 - ulW * ulK} y={ulY} f={f} u={u} />}
      {s.prop && <Schematic id={s.prop} cx={L.dia.cx} cy={L.dia.cy + (L.port ? 60 * u : 0)} size={Math.min(L.dia.w, L.dia.h) * 0.62} k={prog(f, at(s.hero[0]!.at), sec(1.0, fps), E.inOut)} f={f} u={u} label="" />}
    </Dark>
  );
};

const Slam = ({ s, from }: SP<'slam'>) => {
  const { f, W, H, u } = useScene(from);
  const L = lay(W, H);
  const size = Math.min(L.port ? 0.42 * W : 500 * u, (W * 0.86 * 500 * u) / Math.max(1, measure(s.word.t, 'Alexandria', 900, 500 * u)));
  const k = prog(f, 0, 5, E.out);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse, ${Q.signal} 0%, ${Q.signal} 40%, ${Q.signalDeep} 100%)` }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div dir="rtl" style={{ fontFamily: Q.hero, fontWeight: 900, fontSize: size, color: '#0A0A0A', lineHeight: 1.35, transform: `scale(${mix(k, 1.06, 1)})`, whiteSpace: 'nowrap' }}>{s.word.t}</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 70 * u, bottom: 70 * u, fontFamily: Q.mono, color: '#0A0A0A', direction: 'ltr' }}>
        <div style={{ fontSize: 12 * u, opacity: 0.7 }}>LEVEL</div>
        <div style={{ fontSize: 36 * u, borderBottom: `2px solid #0A0A0A` }}>{s.counter || (0.5 + clamp01(f / 60) * 0.47).toFixed(2)}</div>
      </div>
    </AbsoluteFill>
  );
};

const NodeFlow = ({ s, from, idx }: SP<'nodeFlow'>) => {
  const { f, at, W, H, u, fps } = useScene(from);
  const L = lay(W, H);
  const n = s.nodes.length;
  const vertical = L.port;
  const bw = vertical ? Math.min(420 * u, W * 0.6) : Math.min(260 * u, (W * 0.84) / n - 60 * u);
  const bh = 100 * u;
  const pos = s.nodes.map((_, i) => {
    if (vertical) {
      const span = Math.min(H * 0.55, n * (bh + 70 * u));
      return { x: W / 2 - bw / 2, y: H * 0.36 + (i * span) / n };
    }
    const span = W * 0.84;
    const step = span / n;
    return { x: W * 0.92 - (i + 1) * step + (step - bw) / 2, y: H * 0.56 - bh / 2 };
  });
  let active = -1;
  s.nodes.forEach((nd, i) => {
    if (f >= at(nd.at) - 3) active = i;
  });
  return (
    <Dark from={from} idx={idx}>
      {s.title && (
        <div dir="rtl" style={{ position: 'absolute', right: L.text.right, top: vertical ? H * 0.12 : H * 0.18, width: L.text.width, fontFamily: Q.hero, fontWeight: 700, fontSize: 64 * u, color: Q.white, lineHeight: 1.35, opacity: prog(f, 0, 8) }}>
          {s.title}
        </div>
      )}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {s.nodes.map((nd, i) => {
          const k = prog(f, at(nd.at) - sec(0.25, fps), sec(0.4, fps), E.inOut);
          const p = pos[i]!;
          const per = 2 * (bw + bh);
          const next = pos[i + 1];
          const ck = next ? prog(f, at(s.nodes[i + 1]!.at) - sec(0.55, fps), sec(0.3, fps), E.inOut) : 0;
          const a = vertical ? { x: p.x + bw / 2, y: p.y + bh } : { x: p.x, y: p.y + bh / 2 };
          const b = next ? (vertical ? { x: next.x + bw / 2, y: next.y } : { x: next.x + bw, y: next.y + bh / 2 }) : a;
          return (
            <g key={i}>
              <rect x={p.x} y={p.y} width={bw} height={bh} fill={Q.ink2} fillOpacity={0.8 * k} stroke={i === active ? Q.bone : Q.rule} strokeWidth={1.5} strokeDasharray={per} strokeDashoffset={per * (1 - k)} />
              {i === active && k >= 1 && <path d={`M${p.x + bw - 16 * u} ${p.y} L${p.x + bw} ${p.y} L${p.x + bw} ${p.y + 16 * u}`} stroke={Q.signal} strokeWidth={2.5} fill="none" />}
              {next && <line x1={a.x} y1={a.y} x2={mix(ck, a.x, b.x)} y2={mix(ck, a.y, b.y)} stroke={Q.bone} strokeWidth={1.5} />}
              {next && ck >= 1 && <path d={vertical ? `M${b.x - 7 * u} ${b.y - 10 * u} L${b.x} ${b.y} L${b.x + 7 * u} ${b.y - 10 * u}` : `M${b.x + 10 * u} ${b.y - 7 * u} L${b.x} ${b.y} L${b.x + 10 * u} ${b.y + 7 * u}`} stroke={Q.bone} strokeWidth={1.5} fill="none" />}
            </g>
          );
        })}
      </svg>
      {s.nodes.map((nd, i) => {
        const p = pos[i]!;
        const k = prog(f, at(nd.at) + 2, 6);
        const next = pos[i + 1];
        const ck = next ? prog(f, at(s.nodes[i + 1]!.at) - sec(0.55, fps), sec(0.3, fps), E.inOut) : 0;
        return (
          <div key={i}>
            <div dir="rtl" style={{ position: 'absolute', left: p.x, top: p.y, width: bw, height: bh, display: 'grid', placeItems: 'center', fontFamily: Q.body, fontWeight: 600, fontSize: Math.min(34 * u, (bw * 0.85) / Math.max(2, nd.t.length * 0.55)), color: i === active ? Q.white : Q.dim, opacity: k, lineHeight: 1.35 }}>
              {nd.t}
            </div>
            <div style={{ position: 'absolute', left: p.x, top: p.y - 22 * u, fontFamily: Q.mono, fontSize: 14 * u, color: Q.muted, opacity: k, direction: 'ltr' }}>{`NODE ${String(i + 1).padStart(2, '0')}`}</div>
            {next && ck > 0 && ck < 1 && <Spark x={vertical ? p.x + bw / 2 : mix(ck, p.x, next.x + bw)} y={vertical ? mix(ck, p.y + bh, next.y) : p.y + bh / 2} f={f} u={u} />}
          </div>
        );
      })}
    </Dark>
  );
};

/** statement pre-laid dim; words light as spoken; token underline + mono id under each */
const Karaoke = ({ words, at, f, u, size, maxW, tokens = true }: { words: Array<{ t: string; at: string; key: boolean }>; at: (id: string) => number; f: number; u: number; size: number; maxW: number; tokens?: boolean }) => (
  <div dir="rtl" style={{ display: 'flex', flexWrap: 'wrap', columnGap: size * 0.28, rowGap: size * 0.5, maxWidth: maxW, fontFamily: Q.body, fontWeight: 500, fontSize: size, lineHeight: 1.45 }}>
    {words.map((w, i) => {
      const k = prog(f, at(w.at) - 1, 4, E.outQuad);
      return (
        <span key={i} style={{ position: 'relative', color: k > 0.5 ? (w.key ? Q.signal : Q.white) : Q.muted, opacity: k > 0.5 ? 1 : 0.35 + 0.65 * k, whiteSpace: 'nowrap', textShadow: k > 0.5 && w.key ? '0 0 28px rgba(240,74,20,.55)' : undefined }}>
          {w.t}
          {tokens && (
            <>
              <span style={{ position: 'absolute', right: 0, bottom: -4 * u, height: 3 * u, width: `${k * 100}%`, background: Q.signal }} />
              <span style={{ position: 'absolute', right: 0, bottom: -24 * u, fontFamily: Q.mono, fontSize: 14 * u, color: Q.muted, opacity: k, direction: 'ltr' }}>{(1847 + i * 389) % 20000}</span>
            </>
          )}
        </span>
      );
    })}
  </div>
);

const PromptInput = ({ s, from, idx }: SP<'promptInput'>) => {
  const { f, at, W, H, u } = useScene(from);
  const L = lay(W, H);
  const pw = L.port ? W - 120 * u : W * 0.72;
  const ph = L.port ? H * 0.32 : H * 0.34;
  const px = (W - pw) / 2;
  const py = L.port ? H * 0.3 : H * 0.26;
  const k = prog(f, 0, 12, E.out);
  const last = s.words[s.words.length - 1]!;
  const caretOn = Math.floor(f / 15) % 2 === 0;
  return (
    <Dark from={from} idx={idx} floor>
      <div style={{ position: 'absolute', left: px, top: py, width: pw, height: ph, border: `1.5px solid ${Q.bone}99`, background: 'rgba(13,12,12,0.8)', opacity: k }}>
        <div style={{ position: 'absolute', right: 24 * u, top: 18 * u, fontFamily: Q.mono, fontSize: 15 * u, color: Q.muted, direction: 'ltr' }}>INPUT · {s.words.length} tokens</div>
        <div style={{ position: 'absolute', right: 30 * u, top: 64 * u, left: 30 * u }}>
          <Karaoke words={s.words} at={at} f={f} u={u} size={L.line * (L.port ? 0.9 : 0.85)} maxW={pw - 60 * u} />
        </div>
        <div style={{ position: 'absolute', left: 24 * u, bottom: 18 * u, fontFamily: Q.mono, fontSize: 15 * u, color: Q.muted, direction: 'ltr' }}>{`ctx 200000 / ${String(s.words.filter((w) => f >= at(w.at)).length * 7).padStart(3, '0')}`}</div>
        {f >= at(last.at) && caretOn && <div style={{ position: 'absolute', left: 30 * u, bottom: 50 * u, width: 2 * u, height: 40 * u, background: Q.signal }} />}
      </div>
      {s.table.length > 0 && (
        <div style={{ position: 'absolute', left: px + 30 * u, top: py + ph + 30 * u, width: Math.min(520 * u, pw * 0.6), fontFamily: Q.mono, fontSize: 18 * u }}>
          {s.table.map((r, i) => {
            const on = i === 0 && f >= at(last.at);
            return (
              <div key={i} dir="ltr" style={{ display: 'flex', alignItems: 'center', gap: 14 * u, height: 34 * u, padding: `0 ${10 * u}px`, background: on ? 'rgba(240,74,20,0.85)' : 'transparent', color: on ? Q.ink : Q.dim, opacity: prog(f, at(s.words[0]!.at) + i * 4, 8) }}>
                <span style={{ width: 60 * u }}>{r.v.toFixed(2)}</span>
                <span style={{ width: 120 * u * r.v, height: 8 * u, background: on ? Q.ink : Q.rule }} />
                <span dir="rtl" style={{ fontFamily: Q.body, marginInlineStart: 'auto' }}>{r.t}</span>
              </div>
            );
          })}
        </div>
      )}
    </Dark>
  );
};

const KaraokeScene = ({ s, from, idx }: SP<'karaoke'>) => {
  const { f, at, W, H, u } = useScene(from);
  const L = lay(W, H);
  return (
    <Dark from={from} idx={idx}>
      <div style={{ position: 'absolute', right: L.text.right, top: L.port ? H * 0.3 : H * 0.36, width: L.text.width }}>
        <Karaoke words={s.words} at={at} f={f} u={u} size={L.line} maxW={L.text.width} />
      </div>
    </Dark>
  );
};

const GraphCard = ({ s, from, idx }: SP<'graphCard'>) => {
  const { f, at, W, H, u, fps } = useScene(from);
  const L = lay(W, H);
  const cw = L.port ? W - 200 * u : 520 * u;
  const ch = L.port ? 340 * u : 300 * u;
  const cx = L.port ? 100 * u : L.dia.cx - cw / 2;
  const cy = L.port ? H * 0.52 : L.dia.cy - ch / 2;
  const k = prog(f, at(s.words[0]!.at), sec(1.2, fps), E.inOut);
  const pts = Array.from({ length: 50 }, (_, i) => {
    const x = i / 49;
    const y = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    return [cx + 40 * u + x * (cw - 80 * u), cy + ch - 40 * u - y * (ch - 90 * u)] as [number, number];
  });
  const n = Math.max(1, Math.round(k * 49));
  const tip = pts[n]!;
  return (
    <Dark from={from} idx={idx}>
      <div style={{ position: 'absolute', right: L.text.right, top: L.port ? H * 0.14 : H * 0.3, width: L.port ? L.text.width : W * 0.42 }}>
        <Karaoke words={s.words} at={at} f={f} u={u} size={L.line} maxW={L.port ? L.text.width : W * 0.42} tokens={false} />
      </div>
      <div style={{ position: 'absolute', left: cx, top: cy, width: cw, height: ch, border: `1.5px solid ${Q.rule}`, background: 'rgba(13,12,12,0.8)', opacity: prog(f, 0, 10) }}>
        <div style={{ position: 'absolute', left: 14 * u, top: 10 * u, fontFamily: Q.mono, fontSize: 15 * u, color: Q.muted, direction: 'ltr' }}>{s.formula}</div>
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={cx + 40 * u} y1={cy + ch - 40 * u} x2={cx + cw - 30 * u} y2={cy + ch - 40 * u} stroke={Q.rule} strokeWidth={1.5} />
        <line x1={cx + 40 * u} y1={cy + ch - 40 * u} x2={cx + 40 * u} y2={cy + 30 * u} stroke={Q.rule} strokeWidth={1.5} />
        <polyline points={pts.slice(0, n + 1).map((p) => p.join(',')).join(' ')} fill="none" stroke={Q.bone} strokeWidth={2} />
        <circle cx={tip[0]} cy={tip[1]} r={6 * u} fill={Q.signal} />
      </svg>
      {k > 0 && k < 1 && <Spark x={tip[0]} y={tip[1]} f={f} u={u} />}
    </Dark>
  );
};

/** an icon as a schematic: outline drawn by the spark, crosshair, dimension lines, mono labels */
const Schematic = ({ id, cx, cy, size, k, f, u, label, photo }: { id: string; cx: number; cy: number; size: number; k: number; f: number; u: number; label: string; photo?: string | null }) => {
  const polys = schematicPaths(id);
  const total = polys.reduce((a, p) => a + polyLen(p), 0) || 1;
  const sc = size / 100;
  let acc = 0;
  let tip: [number, number] | null = null;
  const els = polys.map((p, i) => {
    const L = polyLen(p);
    const a = acc / total;
    acc += L;
    const b = acc / total;
    const kk = clamp01((k - a) / Math.max(1e-6, b - a));
    if (kk > 0 && kk < 1) {
      let s = 0;
      for (let j = 1; j < p.length; j++) {
        s += Math.hypot(p[j]![0] - p[j - 1]![0], p[j]![1] - p[j - 1]![1]);
        if (s >= kk * L) {
          tip = [cx + p[j]![0] * sc, cy + p[j]![1] * sc];
          break;
        }
      }
    }
    const d = `M${p.map(([x, y]) => `${(cx + x * sc).toFixed(1)} ${(cy + y * sc).toFixed(1)}`).join('L')}`;
    return <path key={i} d={d} fill="none" stroke={Q.bone} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - kk} strokeLinecap="round" strokeLinejoin="round" />;
  });
  const t = tip as [number, number] | null;
  const lab = prog(k, 0.9, 0.1);
  return (
    <>
      {photo && (
        <div style={{ position: 'absolute', left: cx - size * 0.42, top: cy - size * 0.42, width: size * 0.84, height: size * 0.84, opacity: prog(k, 0.6, 0.4), filter: 'grayscale(0.2) contrast(1.05)' }}>
          <Img src={photo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}
      <svg width={cx * 2 + size} height={cy * 2 + size} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {!photo && els}
        <line x1={cx - 15 * u} y1={cy} x2={cx + 15 * u} y2={cy} stroke={Q.signal} strokeWidth={1.5} opacity={lab} />
        <line x1={cx} y1={cy - 15 * u} x2={cx} y2={cy + 15 * u} stroke={Q.signal} strokeWidth={1.5} opacity={lab} />
        <g opacity={lab} stroke={Q.dim} strokeWidth={1}>
          <line x1={cx - size / 2} y1={cy + size * 0.6} x2={cx + size / 2} y2={cy + size * 0.6} />
          <line x1={cx - size / 2} y1={cy + size * 0.56} x2={cx - size / 2} y2={cy + size * 0.64} />
          <line x1={cx + size / 2} y1={cy + size * 0.56} x2={cx + size / 2} y2={cy + size * 0.64} />
          <line x1={cx + size * 0.6} y1={cy - size / 2} x2={cx + size * 0.6} y2={cy + size / 2} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: cx - 40 * u, top: cy + size * 0.64, fontFamily: Q.mono, fontSize: 15 * u, color: Q.dim, opacity: lab, direction: 'ltr' }}>{`w ${Math.round(size)}`}</div>
      <div style={{ position: 'absolute', left: cx + 18 * u, top: cy + 10 * u, fontFamily: Q.mono, fontSize: 15 * u, color: Q.signal, opacity: lab, direction: 'ltr' }}>{`(${Math.round(cx)}, ${Math.round(cy)})`}</div>
      {label && <div dir="rtl" style={{ position: 'absolute', left: cx - size, width: size * 2, top: cy + size * 0.72, textAlign: 'center', fontFamily: Q.body, fontWeight: 600, fontSize: 34 * u, color: Q.white, opacity: lab }}>{label}</div>}
      {t && <Spark x={t[0]} y={t[1]} f={f} u={u} />}
    </>
  );
};

const SchematicScene = ({ s, from, idx }: SP<'schematic'>) => {
  const { f, at, W, H, u, fps, asset } = useScene(from);
  const L = lay(W, H);
  const k = prog(f, at(s.at) - sec(0.3, fps), sec(1.1, fps), E.inOut);
  const size = Math.min(L.dia.w, L.dia.h) * (L.port ? 0.7 : 0.62);
  return (
    <Dark from={from} idx={idx}>
      {s.words.length > 0 && (
        <div style={{ position: 'absolute', right: L.text.right, top: L.text.top + (L.land ? 40 * u : 0), width: L.land ? W * 0.4 : L.text.width }}>
          <HeroWords words={s.words} at={at} f={f} size={L.port ? 72 * u : 80 * u} u={u} weight={800} />
        </div>
      )}
      <Schematic id={s.prop} cx={L.dia.cx} cy={L.dia.cy} size={size} k={k} f={f} u={u} label={s.label} photo={asset(s.photo)} />
    </Dark>
  );
};

const PaperForm = ({ s, from }: SP<'paperForm'>) => {
  const { f, at, W, H, u, fps } = useScene(from);
  const L = lay(W, H);
  const fs = (L.port ? 58 : 46) * u;
  const type = (id: string, txt: string) => clamp01((f - at(id) + 2) / Math.max(1, sec(txt.length * 0.07, fps)));
  const ko = type(s.oldRow.at, s.oldRow.t);
  const strike = prog(f, at(s.oldRow.at) + sec(s.oldRow.t.length * 0.07 + 0.2, fps), sec(0.45, fps), E.out);
  const kn = type(s.newRow.at, s.newRow.t);
  const stampT = at(s.newRow.at) + sec(s.newRow.t.length * 0.07 + 0.3, fps);
  const st = prog(f, stampT, sec(0.18, fps), E.outBack);
  const shake = f >= stampT + sec(0.18, fps) && f < stampT + sec(0.18, fps) + 1 ? 4 * u : 0;
  const rowY = (i: number) => H * (L.port ? 0.32 : 0.38) + i * (L.port ? 200 : 170) * u;
  const ow = measure(s.oldRow.t, 'IBM Plex Sans Arabic', 400, fs);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #D8D2C8, #C9C3B9)`, transform: `translateX(${shake}px)` }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        {Array.from({ length: Math.ceil(W / (40 * u)) }, (_, i) => (
          <line key={`v${i}`} x1={i * 40 * u} y1={0} x2={i * 40 * u} y2={H} stroke={Q.paperGrid} strokeWidth={1} />
        ))}
        {Array.from({ length: Math.ceil(H / (40 * u)) }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40 * u} x2={W} y2={i * 40 * u} stroke={Q.paperGrid} strokeWidth={1} />
        ))}
      </svg>
      <div dir="rtl" style={{ position: 'absolute', right: 0, left: L.port ? 0 : W * 0.08, top: H * (L.port ? 0.14 : 0.16), height: 100 * u, background: Q.paperInk, display: 'flex', alignItems: 'center', padding: `0 ${70 * u}px`, fontFamily: Q.hero, fontWeight: 800, fontSize: 60 * u, color: '#FFFFFF' }}>
        {s.title}
      </div>
      {[s.oldRow, s.newRow].map((r, i) => (
        <div key={i} dir="rtl" style={{ position: 'absolute', right: 90 * u, top: rowY(i), fontFamily: Q.body, fontSize: fs, color: Q.paperInk, lineHeight: 1.5 }}>
          <span style={{ fontFamily: Q.mono, color: Q.muted, marginInlineEnd: 20 * u }}>{i + 1}.</span>
          <span style={{ display: 'inline-block', clipPath: `inset(-20% 0 -20% ${(1 - (i ? kn : ko)) * 100}%)` }}>{r.t}</span>
          {i === 1 && kn > 0 && kn < 1 && Math.floor(f / 15) % 2 === 0 && <span style={{ display: 'inline-block', width: 3 * u, height: fs, background: Q.paperRed, verticalAlign: 'middle' }} />}
        </div>
      ))}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <path d={Array.from({ length: 20 }, (_, i) => `${i ? 'L' : 'M'}${W - 90 * u - 60 * u - (i / 19) * ow * strike} ${rowY(0) + fs * 0.85 + Math.sin(i * 1.3) * 4 * u}`).join(' ')} stroke={Q.paperRed} strokeWidth={15 * u} fill="none" strokeLinecap="round" opacity={strike > 0 ? 0.9 : 0} />
      </svg>
      {st > 0 && (
        <div style={{ position: 'absolute', left: L.port ? W * 0.18 : W * 0.16, top: rowY(1) + 60 * u, transform: `scale(${mix(Math.min(1, st), 1.35, 1)}) rotate(${mix(Math.min(1, st), -10, -4)}deg)`, opacity: Math.min(1, st) * 0.85, border: `${2 * u}px solid ${Q.stamp}`, outline: `${2 * u}px solid ${Q.stamp}`, outlineOffset: 6 * u, padding: `${10 * u}px ${30 * u}px`, fontFamily: Q.hero, fontWeight: 800, fontSize: 54 * u, color: Q.stamp }}>
          {s.stamp}
        </div>
      )}
    </AbsoluteFill>
  );
};

const FilmStrip = ({ s, from, idx }: SP<'filmStrip'>) => {
  const { f, at, W, H, u } = useScene(from);
  const L = lay(W, H);
  const sw = L.port ? W - 160 * u : W * 0.5;
  const sh = sw * 0.42;
  const sx = (W - sw) / 2;
  const sy = L.port ? H * 0.34 : H * 0.24;
  const scroll = (f * 4 * u) % (26 * u);
  return (
    <Dark from={from} idx={idx}>
      <div style={{ position: 'absolute', left: sx, top: sy, width: sw, height: sh, border: `1.5px solid ${Q.rule}`, background: 'rgba(13,12,12,0.85)', overflow: 'hidden' }}>
        {[0, 1].map((r) => (
          <div key={r} style={{ position: 'absolute', left: -scroll, right: 0, top: r ? sh - 20 * u : 6 * u, height: 14 * u, display: 'flex', gap: 12 * u }}>
            {Array.from({ length: Math.ceil(sw / (26 * u)) + 2 }, (_, i) => (
              <span key={i} style={{ width: 14 * u, height: 10 * u, flex: 'none', background: Q.rule, borderRadius: 2 * u }} />
            ))}
          </div>
        ))}
        <svg width={sw} height={sh} style={{ position: 'absolute', inset: 0 }}>
          <path d={`M${sw / 2 - 26 * u} ${sh / 2 - 34 * u} L${sw / 2 + 34 * u} ${sh / 2} L${sw / 2 - 26 * u} ${sh / 2 + 34 * u} Z`} fill={Q.signal} />
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: sy + sh + 50 * u, display: 'flex', justifyContent: 'center' }}>
        <HeroWords words={s.words} at={at} f={f} size={L.line * 1.1} u={u} weight={700} align="center" />
      </div>
    </Dark>
  );
};

const ArcOutro = ({ s, from, idx }: SP<'arcOutro'>) => {
  const { f, at, W, H, u, fps } = useScene(from);
  const L = lay(W, H);
  const ya = L.port ? H * 0.32 : H * 0.3;
  const ax = L.port ? W * 0.78 : W * 0.75;
  const bx = L.port ? W * 0.22 : W * 0.25;
  const k = prog(f, at(s.b.at) - sec(0.6, fps), sec(0.7, fps), E.inOut);
  const pts = Array.from({ length: 40 }, (_, i) => {
    const t = i / 39;
    return [mix(t, ax, bx), ya + 40 * u - Math.sin(t * Math.PI) * (L.port ? 180 : 140) * u] as [number, number];
  });
  const n = Math.max(1, Math.round(k * 39));
  const endK = prog(f, at(s.end.at) - 2, sec(0.4, fps), E.out);
  const endSize = Math.min(L.port ? 0.3 * W : 260 * u, (W * 0.8 * 260 * u) / Math.max(1, measure(s.end.t, 'Readex Pro', 700, 260 * u)));
  return (
    <Dark from={from} idx={idx}>
      {[
        [s.a, ax],
        [s.b, bx],
      ].map(([w, x], i) => {
        const ww = w as typeof s.a;
        return (
          <div key={i} dir="rtl" style={{ position: 'absolute', left: (x as number) - 200 * u, width: 400 * u, top: ya + 60 * u, textAlign: 'center', fontFamily: Q.hero, fontWeight: 700, fontSize: 52 * u, ...glowText(false), opacity: prog(f, at(ww.at) - 2, 8) }}>
            {ww.t}
          </div>
        );
      })}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <polyline points={pts.slice(0, n + 1).map((p) => p.join(',')).join(' ')} fill="none" stroke={Q.bone} strokeWidth={2} />
      </svg>
      {k > 0 && <Spark x={pts[n]![0]} y={pts[n]![1]} f={f} u={u} />}
      <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: L.port ? H * 0.5 : H * 0.52, textAlign: 'center', fontFamily: Q.end, fontWeight: 700, fontSize: endSize, lineHeight: 1.35, color: Q.signal, textShadow: '0 0 28px rgba(240,74,20,.55), 0 0 70px rgba(240,74,20,.25)', opacity: endK, transform: `translateY(${(1 - endK) * 24 * u}px)`, filter: endK < 1 ? `blur(${(1 - endK) * 6 * u}px)` : undefined }}>
        {s.end.t}
      </div>
    </Dark>
  );
};

const View = (p: { s: PlotterScene; from: number; dur: number; idx: number }) => {
  switch (p.s.kind) {
    case 'penTitle':
      return <PenTitle {...(p as SP<'penTitle'>)} />;
    case 'heroStack':
      return <HeroStack {...(p as SP<'heroStack'>)} />;
    case 'slam':
      return <Slam {...(p as SP<'slam'>)} />;
    case 'nodeFlow':
      return <NodeFlow {...(p as SP<'nodeFlow'>)} />;
    case 'promptInput':
      return <PromptInput {...(p as SP<'promptInput'>)} />;
    case 'karaoke':
      return <KaraokeScene {...(p as SP<'karaoke'>)} />;
    case 'graphCard':
      return <GraphCard {...(p as SP<'graphCard'>)} />;
    case 'schematic':
      return <SchematicScene {...(p as SP<'schematic'>)} />;
    case 'paperForm':
      return <PaperForm {...(p as SP<'paperForm'>)} />;
    case 'filmStrip':
      return <FilmStrip {...(p as SP<'filmStrip'>)} />;
    case 'arcOutro':
      return <ArcOutro {...(p as SP<'arcOutro'>)} />;
  }
};

export const PlotterVideo = ({ plan }: { plan: PlotterPlan }) => {
  const { T, contentEnd } = useVideo();
  const wins = T.windows(plan.scenes.map((s) => s.from), contentEnd, CUT_LEAD).map((w) => ({ from: T.toFrame(w.from), to: T.toFrame(w.to) }));
  let dark = 0;
  return (
    <AbsoluteFill style={{ background: Q.ink }}>
      {plan.scenes.map((s, i) => {
        const w = wins[i]!;
        const idx = s.kind === 'slam' || s.kind === 'paperForm' ? 0 : dark++;
        return (
          <Sequence key={i} from={w.from} durationInFrames={Math.max(1, w.to - w.from)} premountFor={10} name={`${i + 1}·${s.kind}`}>
            <View s={s} from={w.from} dur={w.to - w.from} idx={idx} />
          </Sequence>
        );
      })}
      {/* film grain: static monochrome noise */}
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: 0.06, mixBlendMode: 'screen' }}>
        <svg width="100%" height="100%">
          <filter id="pgrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#pgrain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
