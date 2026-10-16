/** plotter building blocks: graph-paper canvas, spark pen, micro-annotations, dashed guides, schematic props. */
import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, random } from 'remotion';
import { samplePath, type P } from '@/art/ink';
import { ICONS } from '@/art/icons';
import { Q } from './tokens';

/** near-black canvas with a 64 px graph-paper grid (offset = camera glide) and a radial vignette */
export const Canvas = ({ W, H, u, ox = 0, oy = 0, floor = false }: { W: number; H: number; u: number; ox?: number; oy?: number; floor?: boolean }) => {
  const cell = 64 * u;
  const x0 = -((ox % cell) + cell) % cell;
  const y0 = -((oy % cell) + cell) % cell;
  const vs: ReactNode[] = [];
  for (let x = x0, i = Math.floor(ox / cell); x < W + cell; x += cell, i++) vs.push(<line key={`v${i}`} x1={x} y1={0} x2={x} y2={H} stroke={i % 4 === 0 ? Q.grid4 : Q.grid} strokeWidth={1} />);
  for (let y = y0, i = Math.floor(oy / cell); y < H + cell; y += cell, i++) vs.push(<line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} stroke={i % 4 === 0 ? Q.grid4 : Q.grid} strokeWidth={1} />);
  return (
    <AbsoluteFill style={{ background: Q.ink }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
        {vs}
      </svg>
      {floor && <Floor W={W} H={H} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)' }} />
    </AbsoluteFill>
  );
};

/** perspective floor grid receding to a vanishing point at ~35 % height */
export const Floor = ({ W, H }: { W: number; H: number }) => {
  const vy = H * 0.35;
  const lines: ReactNode[] = [];
  for (let i = -8; i <= 8; i++) lines.push(<line key={`r${i}`} x1={W / 2} y1={vy} x2={W / 2 + i * W * 0.16} y2={H} stroke={Q.rule} strokeWidth={1} />);
  for (let k = 1; k < 10; k++) {
    const y = vy + (H - vy) * Math.pow(k / 10, 1.8);
    lines.push(<line key={`f${k}`} x1={0} y1={y} x2={W} y2={y} stroke={Q.rule} strokeWidth={1} opacity={k / 10} />);
  }
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="pfloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={1} />
          <stop offset="0.4" stopColor="#000" stopOpacity={0} />
        </linearGradient>
      </defs>
      {lines}
      <rect x={0} y={vy - 2} width={W} height={(H - vy) * 0.4} fill="url(#pfloor)" />
    </svg>
  );
};

/** the pen spark: white core, yellow inner glow, orange halo, flickering seeded spark lines */
export const Spark = ({ x, y, f, u, k = 1 }: { x: number; y: number; f: number; u: number; k?: number }) => {
  const seed = Math.floor(f / 2);
  const pulse = 1 + 0.12 * Math.sin(f * 0.63);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: k }}>
      <div style={{ position: 'absolute', left: -90 * u * pulse, top: -90 * u * pulse, width: 180 * u * pulse, height: 180 * u * pulse, background: 'radial-gradient(circle, rgba(240,74,20,0.35) 0%, rgba(240,74,20,0) 70%)' }} />
      <div style={{ position: 'absolute', left: -26 * u, top: -26 * u, width: 52 * u, height: 52 * u, background: 'radial-gradient(circle, rgba(255,204,84,0.9) 0%, rgba(255,204,84,0) 70%)' }} />
      <svg width={60 * u} height={60 * u} viewBox="-30 -30 60 60" style={{ position: 'absolute', left: -30 * u, top: -30 * u, overflow: 'visible' }}>
        {Array.from({ length: 5 }, (_, i) => {
          const a = random(`spa${seed}-${i}`) * Math.PI * 2;
          const l = 8 + random(`spl${seed}-${i}`) * 10;
          return <line key={i} x1={Math.cos(a) * 4} y1={Math.sin(a) * 4} x2={Math.cos(a) * (4 + l)} y2={Math.sin(a) * (4 + l)} stroke={Q.hot2} strokeWidth={1.5} strokeLinecap="round" />;
        })}
        <circle r={3} fill={Q.core} />
      </svg>
    </div>
  );
};

/** mono micro-annotations scattered in the margins (coordinates, ids, ratios), seeded per scene */
export const Annotations = ({ W, H, u, seed, k = 1 }: { W: number; H: number; u: number; seed: string; k?: number }) => {
  const labels = ['(640, 300)', '×14', 't = 0.42', 'ID 2041', 'h 240', 'w 1.5', '0.97', 'Δ 64', 'fps 30', '↳ 03'];
  const spots: Array<[number, number]> = [
    [0.05, 0.08],
    [0.78, 0.07],
    [0.06, 0.9],
    [0.8, 0.92],
    [0.4, 0.06],
    [0.62, 0.94],
  ];
  return (
    <>
      {spots.map(([x, y], i) => (
        <div key={i} style={{ position: 'absolute', left: x * W, top: y * H, fontFamily: Q.mono, fontSize: 16 * u, color: i === 2 ? Q.dim : Q.muted, letterSpacing: '0.04em', opacity: k, direction: 'ltr' }}>
          {labels[Math.floor(random(`${seed}an${i}`) * labels.length)]}
        </div>
      ))}
      {[
        [45, 45],
        [W - 45 * u, 45],
        [45, H - 45 * u],
        [W - 45 * u, H - 45 * u],
      ].map(([x, y], i) => (
        <svg key={`r${i}`} width={30 * u} height={30 * u} style={{ position: 'absolute', left: x! - (i % 2 ? 30 * u : 0), top: y! - (i > 1 ? 30 * u : 0), opacity: 0.8 * k }}>
          <path d={i === 0 ? `M0 ${30 * u} L0 0 L${30 * u} 0` : i === 1 ? `M0 0 L${30 * u} 0 L${30 * u} ${30 * u}` : i === 2 ? `M0 0 L0 ${30 * u} L${30 * u} ${30 * u}` : `M0 ${30 * u} L${30 * u} ${30 * u} L${30 * u} 0`} stroke={Q.rule} strokeWidth={1.5} fill="none" />
        </svg>
      ))}
    </>
  );
};

/** dashed guide box with a hollow handle and an easing label, like a design tool */
export const Guide = ({ box, u, label, k }: { box: { x: number; y: number; w: number; h: number }; u: number; label: string; k: number }) => (
  <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, opacity: k }}>
    <svg width={box.w} height={box.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <rect x={0} y={0} width={box.w} height={box.h} fill="none" stroke={Q.rule} strokeWidth={1.5} strokeDasharray={`${6 * u} ${6 * u}`} />
      <circle cx={box.w} cy={0} r={7 * u} fill={Q.ink} stroke={Q.dim} strokeWidth={1.5} />
    </svg>
    <div style={{ position: 'absolute', left: 0, top: -26 * u, fontFamily: Q.mono, fontSize: 15 * u, color: Q.muted, direction: 'ltr' }}>{label}</div>
  </div>
);

export const glowText = (orange: boolean): CSSProperties =>
  orange ? { color: Q.signal, textShadow: `0 0 28px rgba(240,74,20,.55), 0 0 70px rgba(240,74,20,.25)` } : { color: Q.white, textShadow: '0 0 18px rgba(255,255,255,.35)' };

/** an icon as a technical schematic: polylines in a 100 box (draw progress k), centre crosshair */
export const schematicPaths = (id: string) => {
  const ic = (ICONS as Record<string, readonly string[]>)[id] ?? ICONS.box;
  return ic.flatMap((d) => samplePath(d, 0.3).map((s) => s.pts.map(([x, y]) => [(x * 100) / 24 - 50, (y * 100) / 24 - 50] as P)));
};

export const polyLen = (pts: P[]) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1]![0], p[1] - pts[i - 1]![1]) : 0), 0);
