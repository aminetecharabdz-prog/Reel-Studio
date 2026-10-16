/**
 * whiteboard — one board, one continuous shot. A hand-less marker draws each object with pressure-varying strokes,
 * hatches it, writes its label right → left; the camera leans in to each part and pulls back to reveal the whole
 * living diagram (sun spins and blinks, rain falls, arrows flow). Pure function of the frame.
 */
import type { ReactNode } from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { useVideo } from '@/engine/context';
import { clamp, ease, lerp, prog, springAt } from '@/engine/anim';
import { measure } from '@/engine/measure';
import { ribbon, samplePath, type P } from '@/art/ink';
import type { TimingIndex } from '@/engine/timing';
import { drawWindows, layoutBoard, targetOf, type Board } from './layout';
import { propDef } from './props';
import type { WbItem, WhiteboardPlan } from './schema';
import { B, CHAR_S, MARKERS, type Marker } from './tokens';

type Track = { t0: number; t1: number; pts: P[]; color: Marker };
type Stroke = { pts: P[]; w: number; color: string; t0: number; t1: number; closed: boolean; key: string; dash?: boolean; spin?: { x: number; y: number; t: number } };
type Hatch = { region: P[]; color: string; t0: number; t1: number; key: string; box: [number, number, number, number] };
type Text = { text: string; x: number; y: number; size: number; color: string; t0: number; t1: number; align: 'center' | 'right'; weight?: number };
type Pop = { x: number; y: number; r: number; t: number; kind: 'star' | 'face' | 'cross' | 'check'; color?: string };

const lengthOf = (pts: P[]) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1]![0], p[1] - pts[i - 1]![1]) : 0), 0);
const prefix = (pts: P[], k: number): P[] => {
  if (k >= 1) return pts;
  if (k <= 0) return pts.slice(0, 1);
  const L = lengthOf(pts) * k;
  let acc = 0;
  const out: P[] = [pts[0]!];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
    if (acc + d >= L) {
      const r = (L - acc) / (d || 1);
      out.push([lerp(pts[i - 1]![0], pts[i]![0], r), lerp(pts[i - 1]![1], pts[i]![1], r)]);
      return out;
    }
    acc += d;
    out.push(pts[i]!);
  }
  return out;
};
const pointAt = (pts: P[], k: number): P => {
  const p = prefix(pts, k);
  return p[p.length - 1]!;
};

const fullCache = new WeakMap<object, Map<string, string>>();
const ribbonCached = (plan: object, key: string, pts: P[], closed: boolean, w: number) => {
  let m = fullCache.get(plan);
  if (!m) fullCache.set(plan, (m = new Map()));
  const hit = m.get(key);
  if (hit) return hit;
  const d = ribbon(pts, closed, w, key.length);
  m.set(key, d);
  return d;
};

/** prop strokes placed in world coords (centre cx, cy; size = box px) */
const placeProp = (id: string, cx: number, cy: number, size: number) => {
  const def = propDef(id);
  const k = size / 100;
  const tf = (pts: P[]): P[] => pts.map(([x, y]) => [cx + x * k, cy + y * k]);
  return {
    strokes: def.strokes.flatMap((d) => samplePath(d, 2).map((s) => ({ pts: tf(s.pts), closed: s.closed }))),
    hatch: def.hatch.flatMap((d) => samplePath(d, 2).map((s) => tf(s.pts))),
    face: def.face ? ([cx + def.face[0] * k, cy + def.face[1] * k] as P) : null,
    living: def.living,
  };
};

/** compile the plan into timed strokes, hatches, texts, pops and the marker's track */
const compile = (plan: WhiteboardPlan, T: TimingIndex, Bd: Board) => {
  const { u } = Bd;
  const wins = drawWindows(plan, T);
  const strokes: Stroke[] = [];
  const hatches: Hatch[] = [];
  const texts: Text[] = [];
  const pops: Pop[] = [];
  const tracks: Track[] = [];
  const living: Array<{ kind: string; x: number; y: number; size: number; t: number; color: string }> = [];
  const objCentre: Record<number, { x: number; y: number; size: number; labelY: number; labelW: number }> = {};

  // title (written right → left), red underline, two stars
  const tt0 = T.byId(plan.title.from).start - 0.1;
  const tt1 = Math.max(T.byId(plan.title.to).end, tt0 + plan.title.text.length * CHAR_S);
  const tSize = Math.min(Bd.title.size, (Bd.title.size * Bd.title.maxW) / Math.max(1, measure(plan.title.text, 'Marhey', 700, Bd.title.size)));
  const tw = measure(plan.title.text, 'Marhey', 700, tSize);
  texts.push({ text: plan.title.text, x: Bd.title.x, y: Bd.title.y, size: tSize, color: MARKERS.ink.stroke, t0: tt0, t1: tt1, align: 'center' });
  tracks.push({ t0: tt0, t1: tt1, pts: [[Bd.title.x + tw / 2, Bd.title.y + tSize * 0.9], [Bd.title.x - tw / 2, Bd.title.y + tSize * 0.9]], color: 'ink' });
  const ul: P[] = Array.from({ length: 40 }, (_, i) => {
    const x = Bd.title.x + tw * 0.48 - (i / 39) * tw * 0.96;
    return [x, Bd.title.y + tSize * 1.55 + Math.sin((i / 39) * Math.PI) * 12 * u];
  });
  strokes.push({ pts: ul, w: 9 * u, color: MARKERS.red.stroke, t0: tt1 + 0.1, t1: tt1 + 0.7, closed: false, key: 'ul' });
  tracks.push({ t0: tt1 + 0.1, t1: tt1 + 0.7, pts: ul, color: 'red' });
  pops.push({ x: Bd.title.x + tw / 2 + 30 * u, y: Bd.title.y + 10 * u, r: 18 * u, t: tt1 + 0.75, kind: 'star' });
  pops.push({ x: Bd.title.x - tw / 2 - 30 * u, y: Bd.title.y + 10 * u, r: 18 * u, t: tt1 + 0.85, kind: 'star' });

  const addProp = (key: string, id: string, x: number, y: number, size: number, color: Marker, t0: number, t1: number, hatchWin: { t0: number; t1: number } | null, face: boolean) => {
    const pr = placeProp(id, x, y, size);
    const total = pr.strokes.reduce((a, s) => a + lengthOf(s.pts), 0) || 1;
    let acc = 0;
    pr.strokes.forEach((s, k) => {
      const L = lengthOf(s.pts);
      const a = t0 + ((t1 - t0) * acc) / total;
      acc += L;
      const b = t0 + ((t1 - t0) * acc) / total;
      strokes.push({ pts: s.pts, w: (size > 120 * u ? 7 : 5.5) * u, color: MARKERS[color].stroke, t0: a, t1: b, closed: s.closed, key: `${key}s${k}`, ...(pr.living === 'spin' && k > 0 ? { spin: { x, y, t: t1 + 0.6 } } : {}) });
      tracks.push({ t0: a, t1: b, pts: s.pts, color });
    });
    if (hatchWin)
      pr.hatch.forEach((region, k) => {
        const xs = region.map((p) => p[0]);
        const ys = region.map((p) => p[1]);
        hatches.push({ region, color: MARKERS[color].hatch, t0: hatchWin.t0, t1: hatchWin.t1, key: `${key}h${k}`, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] });
        const bx = [Math.max(...xs), Math.min(...ys)] as P;
        tracks.push({ t0: hatchWin.t0, t1: hatchWin.t1, pts: [bx, [Math.min(...xs), Math.max(...ys)]], color });
      });
    if (face && pr.face) pops.push({ x: pr.face[0], y: pr.face[1], r: size * 0.12, t: (hatchWin?.t1 ?? t1) + 0.05, kind: 'face' });
    if (pr.living) living.push({ kind: pr.living, x, y, size, t: (hatchWin?.t1 ?? t1) + 0.2, color: MARKERS[color].stroke });
  };

  const addLabel = (text: string, x: number, y: number, size: number, color: Marker, win: { t0: number; t1: number }) => {
    if (!text) return 0;
    const w = measure(text, 'Marhey', 700, size);
    texts.push({ text, x, y, size, color: MARKERS[color].stroke, t0: win.t0, t1: win.t1, align: 'center' });
    tracks.push({ t0: win.t0, t1: win.t1, pts: [[x + w / 2, y + size * 0.95], [x - w / 2, y + size * 0.95]], color });
    return w;
  };

  plan.items.forEach((it, i) => {
    const pl = Bd.placed[i]!;
    const w = wins[i]!;
    const bx = pl.box.x + pl.box.w / 2;
    const by = pl.box.y + pl.box.h / 2 - pl.size * 0.08;
    switch (it.kind) {
      case 'object': {
        addProp(`o${i}`, it.prop, bx, by, pl.size, it.color, w.outline.t0, w.outline.t1, w.hatch, it.face);
        const lw = addLabel(it.label, bx, by + pl.size * 0.56, pl.label!.size, it.color, w.label);
        objCentre[i] = { x: bx, y: by, size: pl.size, labelY: by + pl.size * 0.56, labelW: lw };
        break;
      }
      case 'count': {
        const s = pl.size * 0.7;
        const n = it.n;
        const span = Math.min(pl.box.w * 0.9, n * s * 1.05);
        for (let k = 0; k < n; k++) {
          const x = bx + span / 2 - (k + 0.5) * (span / n);
          const t0 = w.outline.t0 + k * 0.12;
          addProp(`c${i}-${k}`, it.prop, x, by, s * 0.9, it.color, t0, t0 + 0.16, { t0: t0 + 0.16, t1: t0 + 0.3 }, false);
        }
        addLabel(it.label, bx, by + s * 0.7, pl.label!.size, it.color, w.label);
        objCentre[i] = { x: bx, y: by, size: span, labelY: by + s * 0.7, labelW: 0 };
        break;
      }
      case 'contrast': {
        const s = pl.size;
        const xa = bx + pl.box.w * 0.22;
        const xb = bx - pl.box.w * 0.22;
        const mid = (w.outline.t0 + w.outline.t1) / 2;
        addProp(`ka${i}`, it.a.prop, xa, by, s, 'ink', w.outline.t0, mid, null, false);
        addProp(`kb${i}`, it.b.prop, xb, by, s, 'ink', mid, w.outline.t1, null, false);
        addLabel(it.a.label, xa, by + s * 0.6, 38 * u, 'red', { t0: w.label.t0, t1: w.label.t0 + it.a.label.length * CHAR_S });
        addLabel(it.b.label, xb, by + s * 0.6, 38 * u, 'green', { t0: w.label.t0 + 0.5, t1: w.label.t0 + 0.5 + it.b.label.length * CHAR_S });
        addProp(`kx${i}`, 'cross', xa + s * 0.45, by - s * 0.4, s * 0.35, 'red', w.hatch.t0, w.hatch.t0 + 0.3, null, false);
        addProp(`kc${i}`, 'check', xb + s * 0.45, by - s * 0.4, s * 0.35, 'green', w.hatch.t0 + 0.35, w.hatch.t0 + 0.65, null, false);
        objCentre[i] = { x: bx, y: by, size: pl.box.w * 0.8, labelY: by + s * 0.6, labelW: 0 };
        break;
      }
      case 'number': {
        const tg = targetOf(plan, i);
        const c = tg >= 0 ? objCentre[tg] : null;
        const size = 96 * u;
        const nw0 = measure(it.value, 'Marhey', 700, size);
        const x = Math.max(nw0 / 2 + 40 * u, Math.min(Bd.W - nw0 / 2 - 40 * u, bx));
        const y = by - size * 0.7;
        texts.push({ text: it.value, x, y, size, color: MARKERS[it.color].stroke, t0: w.outline.t0, t1: w.outline.t0 + Math.max(0.3, it.value.length * CHAR_S * 1.5), align: 'center' });
        const nw = measure(it.value, 'Marhey', 700, size);
        tracks.push({ t0: w.outline.t0, t1: w.outline.t0 + 0.4, pts: [[x + nw / 2, y + size], [x - nw / 2, y + size]], color: it.color });
        if (c) {
          const arr: P[] = Array.from({ length: 20 }, (_, k) => {
            const s = k / 19;
            const ex = c.x + (x > c.x ? c.size * 0.55 : -c.size * 0.55);
            return [lerp(x + (x > c.x ? -nw / 2 : nw / 2), ex, s), lerp(y + size * 0.7, c.y, s) - Math.sin(s * Math.PI) * 40 * u];
          });
          strokes.push({ pts: arr, w: 6 * u, color: MARKERS[it.color].stroke, t0: w.hatch.t0, t1: w.hatch.t0 + 0.45, closed: false, key: `n${i}` });
          tracks.push({ t0: w.hatch.t0, t1: w.hatch.t0 + 0.45, pts: arr, color: it.color });
        }
        if (it.label) addLabel(it.label, x, y + size * 1.15, 34 * u, it.color, w.label);
        objCentre[i] = { x, y: y + size / 2, size: size * 2, labelY: y + size, labelW: nw };
        break;
      }
      case 'arrow': {
        const A = objCentre[it.a];
        const Bc = objCentre[it.b];
        if (!A || !Bc) break;
        const dx = Bc.x - A.x;
        const dy = Bc.y - A.y;
        const L = Math.hypot(dx, dy) || 1;
        const pa: P = [A.x + (dx / L) * A.size * 0.62, A.y + (dy / L) * A.size * 0.62];
        const pb: P = [Bc.x - (dx / L) * Bc.size * 0.62, Bc.y - (dy / L) * Bc.size * 0.62];
        const nx = -dy / L;
        const ny = dx / L;
        const pts: P[] = Array.from({ length: 32 }, (_, k) => {
          const s = k / 31;
          const wave = Math.sin(s * Math.PI * 4) * 7 * u;
          const sag = Math.sin(s * Math.PI) * 40 * u;
          return [lerp(pa[0], pb[0], s) + nx * (sag + wave), lerp(pa[1], pb[1], s) + ny * (sag + wave)];
        });
        strokes.push({ pts, w: 9 * u, color: MARKERS[it.color].stroke, t0: w.outline.t0, t1: w.outline.t1, closed: false, key: `a${i}`, dash: true });
        tracks.push({ t0: w.outline.t0, t1: w.outline.t1, pts, color: it.color });
        const end = pts[pts.length - 1]!;
        const prev = pts[pts.length - 4]!;
        const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
        const head: P[] = [
          [end[0] + Math.cos(ang + 2.5) * 28 * u, end[1] + Math.sin(ang + 2.5) * 28 * u],
          end,
          [end[0] + Math.cos(ang - 2.5) * 28 * u, end[1] + Math.sin(ang - 2.5) * 28 * u],
        ];
        strokes.push({ pts: head, w: 9 * u, color: MARKERS[it.color].stroke, t0: w.outline.t1, t1: w.outline.t1 + 0.12, closed: false, key: `ah${i}` });
        const mid = pts[16]!;
        addLabel(it.label, mid[0] + nx * 50 * u, mid[1] + ny * 50 * u - 20 * u, 40 * u, it.color, w.label);
        break;
      }
      case 'band': {
        const b = Bd.band;
        const top: P[] = Array.from({ length: 60 }, (_, k) => [b.x + b.w - (k / 59) * b.w, b.y + (it.wavy ? Math.sin((k / 59) * Math.PI * 10) * 8 * u : 0)]);
        strokes.push({ pts: top, w: 8 * u, color: MARKERS[it.color].stroke, t0: w.outline.t0, t1: w.outline.t1, closed: false, key: `b${i}` });
        tracks.push({ t0: w.outline.t0, t1: w.outline.t1, pts: top, color: it.color });
        const region: P[] = [...top, [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]];
        hatches.push({ region, color: MARKERS[it.color].hatch, t0: w.hatch.t0, t1: w.hatch.t1 + 0.4, key: `bh${i}`, box: [b.x, b.y - 10 * u, b.x + b.w, b.y + b.h] });
        tracks.push({ t0: w.hatch.t0, t1: w.hatch.t1 + 0.4, pts: [[b.x + b.w, b.y], [b.x, b.y + b.h]], color: it.color });
        addLabel(it.label, b.x + b.w * 0.85, b.y + b.h + 8 * u, 44 * u, it.color, w.label);
        if (it.wavy) living.push({ kind: 'wave', x: b.x + b.w / 2, y: b.y, size: b.w, t: w.hatch.t1, color: MARKERS[it.color].stroke });
        break;
      }
      case 'emphasis': {
        const c = objCentre[it.target];
        if (!c) break;
        const lw = Math.max(c.labelW, c.size * 0.6);
        const line: P[] = Array.from({ length: 24 }, (_, k) => [c.x + lw / 2 - (k / 23) * lw, c.labelY + 56 * u + Math.sin((k / 23) * Math.PI) * 6 * u]);
        strokes.push({ pts: line, w: 7 * u, color: MARKERS.red.stroke, t0: w.outline.t0, t1: w.outline.t0 + 0.5, closed: false, key: `e${i}` });
        tracks.push({ t0: w.outline.t0, t1: w.outline.t0 + 0.5, pts: line, color: 'red' });
        pops.push({ x: c.x + lw / 2 + 22 * u, y: c.labelY + 20 * u, r: 14 * u, t: w.outline.t0 + 0.55, kind: 'star' });
        pops.push({ x: c.x - lw / 2 - 22 * u, y: c.labelY + 20 * u, r: 14 * u, t: w.outline.t0 + 0.65, kind: 'star' });
        break;
      }
      case 'note': {
        const y = Bd.band.y + Bd.band.h + 60 * u;
        const nw = addLabel(it.text, Bd.W / 2, Math.min(Bd.H - 130 * u, y), 46 * u, 'ink', { t0: w.outline.t0, t1: w.outline.t0 + it.text.length * CHAR_S });
        const yy = Math.min(Bd.H - 130 * u, y) + 64 * u;
        const ln: P[] = [[Bd.W / 2 + nw / 2, yy], [Bd.W / 2 - nw / 2, yy]];
        const t0 = w.outline.t0 + it.text.length * CHAR_S + 0.1;
        strokes.push({ pts: ln, w: 7 * u, color: MARKERS.green.stroke, t0, t1: t0 + 0.4, closed: false, key: `nt${i}` });
        tracks.push({ t0, t1: t0 + 0.4, pts: ln, color: 'green' });
        pops.push({ x: Bd.W / 2 + nw / 2 + 30 * u, y: Math.min(Bd.H - 130 * u, y) + 10 * u, r: 16 * u, t: t0 + 0.45, kind: 'star' });
        break;
      }
      default:
        break;
    }
  });
  return { strokes, hatches, texts, pops, tracks, living, objCentre, wins, titleW: tw + 120 * u };
};

const cache = new WeakMap<object, Map<string, ReturnType<typeof compile>>>();
const compiled = (plan: WhiteboardPlan, T: TimingIndex, Bd: Board) => {
  let m = cache.get(plan);
  if (!m) cache.set(plan, (m = new Map()));
  const key = `${Bd.W}x${Bd.H}|${T.duration}`;
  let c = m.get(key);
  if (!c) m.set(key, (c = compile(plan, T, Bd)));
  return c;
};

/* ───────────────────────────── camera ───────────────────────────── */

type Cam = { t0: number; t1: number; x: number; y: number; z: number };
const cameraKeys = (plan: WhiteboardPlan, T: TimingIndex, Bd: Board, oc: ReturnType<typeof compile>['objCentre'], titleW = 0): Cam[] => {
  const port = Bd.H > Bd.W * 1.2;
  const close = port ? 1.3 : 1.38;
  const keys: Cam[] = [{ t0: 0, t1: 0.001, x: Bd.title.x, y: Bd.title.y + Bd.title.size, z: Math.max(1, Math.min(1.45, (Bd.W * 0.84) / Math.max(1, titleW))) }];
  plan.items.forEach((it, i) => {
    const s = T.byId(it.from).start;
    let x = Bd.W / 2;
    let y = Bd.H / 2;
    let z = close;
    const c = oc[i];
    if (it.kind === 'reveal' || it.kind === 'journey') z = 1;
    else if (it.kind === 'arrow' && oc[it.a] && oc[it.b]) {
      x = (oc[it.a]!.x + oc[it.b]!.x) / 2;
      y = (oc[it.a]!.y + oc[it.b]!.y) / 2;
      const span = Math.max(Math.abs(oc[it.a]!.x - oc[it.b]!.x) + oc[it.a]!.size * 1.6, (Math.abs(oc[it.a]!.y - oc[it.b]!.y) + oc[it.a]!.size * 1.6) * (Bd.W / Bd.H));
      z = Math.max(1, Math.min(close, Bd.W / span));
    } else if (it.kind === 'band' || it.kind === 'note') {
      x = Bd.W / 2;
      y = Bd.band.y + Bd.band.h / 2;
      z = 1.15;
    } else if (it.kind === 'emphasis' && oc[it.target]) {
      x = oc[it.target]!.x;
      y = oc[it.target]!.labelY;
    } else if (c) {
      x = c.x - Bd.W * 0.04; // RTL lead room: the drawing sits slightly right of centre
      y = c.y + c.size * 0.15;
    }
    keys.push({ t0: s - 0.25, t1: s + 0.85, x, y, z });
  });
  return keys;
};

/* ───────────────────────────── render ───────────────────────────── */

const Marker = ({ x, y, color, lift, u }: { x: number; y: number; color: Marker; lift: number; u: number }) => {
  const c = MARKERS[color].stroke;
  const L = 230 * u;
  const T = 34 * u;
  return (
    <svg width={L * 1.4} height={L * 1.4} style={{ position: 'absolute', left: x, top: y, overflow: 'visible', transform: `scale(${1 + lift * 0.06})`, transformOrigin: '0 0' }}>
      <g transform={`rotate(35) translate(${8 * u + lift * 10 * u} ${10 * u + lift * 14 * u})`} opacity={0.2 - lift * 0.05}>
        <rect x={0} y={-T / 2} width={L} height={T} rx={T / 2} fill="#000" />
      </g>
      <g transform="rotate(35)">
        <path d={`M0 0 L${22 * u} ${-T * 0.32} L${22 * u} ${T * 0.32} Z`} fill="#1E2025" />
        <rect x={20 * u} y={-T / 2} width={L - 66 * u} height={T} rx={6 * u} fill="#FFFFFF" stroke="#C9CDD0" strokeWidth={1.5 * u} />
        <rect x={L * 0.42} y={-T / 2} width={L * 0.2} height={T} fill={c} opacity={0.85} />
        <rect x={L - 50 * u} y={-T / 2 - 2 * u} width={50 * u} height={T + 4 * u} rx={T / 2} fill={c} />
      </g>
    </svg>
  );
};

const Star = ({ x, y, r, k }: { x: number; y: number; r: number; k: number }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
  }).join(' ');
  return <polygon points={pts} fill="#FFD24A" stroke="#F28C12" strokeWidth={3} strokeLinejoin="round" transform={`rotate(${(1 - Math.min(1, k)) * -20} ${x} ${y}) translate(${x} ${y}) scale(${Math.max(0, k)}) translate(${-x} ${-y})`} />;
};

export const WhiteboardVideo = ({ plan }: { plan: WhiteboardPlan }) => {
  const frame = useCurrentFrame();
  const { T, W, H, fps, u } = useVideo();
  const t = frame / fps;
  const Bd = layoutBoard(plan, W, H);
  const C = compiled(plan, T, Bd);
  const keys = cameraKeys(plan, T, Bd, C.objCentre, C.titleW);
  let cx = keys[0]!.x;
  let cy = keys[0]!.y;
  let z = keys[0]!.z;
  keys.forEach((k) => {
    const p = prog(t, k.t0, k.t1, ease.inOutCubic);
    cx = lerp(cx, k.x, p);
    cy = lerp(cy, k.y, p);
    z = lerp(z, k.z, p);
  });
  cx = Math.max(W / (2 * z), Math.min(W - W / (2 * z), cx));
  cy = Math.max(H / (2 * z), Math.min(H - H / (2 * z), cy));
  const tx = W / 2 - cx * z;
  const ty = H / 2 - cy * z;

  // marker: on the active track, else travelling to the next, else resting near the last
  const active = C.tracks.filter((k) => t >= k.t0 && t <= k.t1).pop();
  let mk: { x: number; y: number; color: Marker; lift: number };
  if (active) {
    const p = pointAt(active.pts, prog(t, active.t0, active.t1, ease.inOutSine));
    mk = { x: p[0], y: p[1] + Math.sin(t * 40) * (active.pts.length === 2 ? 6 * u : 0), color: active.color, lift: 0 };
  } else {
    const past = C.tracks.filter((k) => k.t1 < t).sort((a, b) => a.t1 - b.t1).pop();
    const next = C.tracks.filter((k) => k.t0 > t).sort((a, b) => a.t0 - b.t0)[0];
    const from = past ? past.pts[past.pts.length - 1]! : ([W * 0.75, H * 0.5] as P);
    const restP: P = [from[0] + 40 * u, from[1] + 50 * u];
    if (next && next.t0 - t < 0.55) {
      const k = prog(t, next.t0 - 0.55, next.t0, ease.inOutCubic);
      const to = next.pts[0]!;
      mk = { x: lerp(restP[0], to[0], k), y: lerp(restP[1], to[1], k) - Math.sin(k * Math.PI) * 45 * u, color: k > 0.5 ? next.color : (past?.color ?? next.color), lift: Math.sin(k * Math.PI) };
    } else mk = { x: restP[0], y: restP[1], color: past?.color ?? 'ink', lift: 0.3 };
  }

  const strokeEls: ReactNode[] = [];
  C.strokes.forEach((s) => {
    if (t < s.t0) return;
    const k = prog(t, s.t0, s.t1, ease.inOutSine);
    const d = k >= 1 ? ribbonCached(plan, `${W}x${H}${s.key}`, s.pts, s.closed, s.w) : ribbon(prefix(s.pts, k), false, s.w, s.key.length);
    const rot = s.spin && t > s.spin.t ? ((t - s.spin.t) / 14) * 360 : 0;
    strokeEls.push(<path key={s.key} d={d} fill={s.color} fillRule="evenodd" transform={rot ? `rotate(${rot.toFixed(2)} ${s.spin!.x} ${s.spin!.y})` : undefined} />);
    if (s.dash && k >= 1) {
      const dd = `M${s.pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}`;
      strokeEls.push(<path key={`${s.key}d`} d={dd} fill="none" stroke="#FFFFFF" strokeWidth={2.5 * u} strokeDasharray={`${8 * u} ${10 * u}`} strokeDashoffset={-((t * 60 * u) % (18 * u))} strokeLinecap="round" />);
    }
  });
  const hatchEls = C.hatches.map((h) => {
    if (t < h.t0) return null;
    const k = prog(t, h.t0, h.t1, ease.inOutQuad);
    const [x0, y0, x1, y1] = h.box;
    const pitch = 18 * u;
    const dx = (y1 - y0) / Math.tan((60 * Math.PI) / 180);
    let d = '';
    let flip = false;
    for (let x = x0 - dx; x <= x1 + pitch; x += pitch) {
      d += flip ? `L${x.toFixed(1)} ${y1.toFixed(1)} L${(x + dx).toFixed(1)} ${y0.toFixed(1)} ` : `${d ? 'L' : 'M'}${(x + dx).toFixed(1)} ${y0.toFixed(1)} L${x.toFixed(1)} ${y1.toFixed(1)} `;
      flip = !flip;
    }
    const id = `wbh${h.key}`;
    return (
      <g key={h.key}>
        <defs>
          <clipPath id={id}>
            <path d={`M${h.region.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`} />
          </clipPath>
        </defs>
        <path d={d} clipPath={`url(#${id})`} fill="none" stroke={h.color} strokeOpacity={0.55} strokeWidth={14 * u} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      </g>
    );
  });
  const popEls = C.pops.map((p, i) => {
    if (t < p.t) return null;
    const k = springAt(t, p.t, { damping: 12, stiffness: 180 });
    if (p.kind === 'star') return <Star key={i} x={p.x} y={p.y} r={p.r} k={k} />;
    // a face: two dot eyes (blinking) + a smile
    const blink = (t + i) % 3.5 > 3.35;
    return (
      <g key={i} opacity={clamp(k)}>
        {[-1, 1].map((e) => (blink ? <rect key={e} x={p.x + e * p.r - p.r * 0.35} y={p.y - p.r * 0.5} width={p.r * 0.7} height={3 * u} fill={MARKERS.ink.stroke} /> : <circle key={e} cx={p.x + e * p.r} cy={p.y - p.r * 0.45} r={p.r * 0.32} fill={MARKERS.ink.stroke} />))}
        <path d={`M${p.x - p.r * 0.8} ${p.y + p.r * 0.2} Q${p.x} ${p.y + p.r * 1.1} ${p.x + p.r * 0.8} ${p.y + p.r * 0.2}`} fill="none" stroke={MARKERS.ink.stroke} strokeWidth={4 * u} strokeLinecap="round" />
      </g>
    );
  });
  const livingEls = C.living.map((l, i) => {
    if (t < l.t) return null;
    if (l.kind === 'rain')
      return (
        <g key={i}>
          {Array.from({ length: 5 }, (_, k) => {
            const ph = ((t * 1.6 + k * 0.23) % 1 + 1) % 1;
            const x = l.x - l.size * 0.32 + (k * l.size * 0.64) / 4;
            const y = l.y + l.size * 0.28 + ph * 40 * u;
            return <line key={k} x1={x} y1={y} x2={x - 6 * u} y2={y + 18 * u} stroke={l.color} strokeWidth={6 * u} strokeLinecap="round" opacity={1 - ph} />;
          })}
        </g>
      );
    return null;
  });

  // journey (mascot along the loop through the objects)
  const jIdx = plan.items.findIndex((x) => x.kind === 'journey');
  let journey: ReactNode = null;
  if (jIdx >= 0) {
    const it = plan.items[jIdx] as Extract<WbItem, { kind: 'journey' }>;
    const pts = Object.values(C.objCentre).map((c) => [c.x, c.y - c.size * 0.6] as P);
    if (pts.length >= 2) {
      const loop: P[] = [...pts, pts[0]!];
      const j0 = T.byId(it.at).start;
      const dots = prog(t, j0 - 0.2, j0 + 0.4, ease.linear);
      const m = prog(t, j0 + 0.4, j0 + 0.4 + loop.length * 0.75, ease.linear);
      const seg = Math.min(loop.length - 2, Math.floor(m * (loop.length - 1)));
      const sk = ease.inOutSine(m * (loop.length - 1) - seg);
      const a = loop[seg]!;
      const b = loop[seg + 1]!;
      const mx = lerp(a[0], b[0], sk);
      const my = lerp(a[1], b[1], sk) - Math.sin(sk * Math.PI) * 12 * u;
      const pr = placeProp(it.mascot, mx, my, 70 * u);
      journey = (
        <g>
          <path d={`M${loop.map((p) => `${p[0]} ${p[1]}`).join('L')}`} fill="none" stroke={MARKERS.blue.stroke} strokeOpacity={0.7} strokeWidth={4 * u} strokeDasharray={`0.1 ${14 * u}`} strokeLinecap="round" pathLength={undefined} opacity={dots} />
          {t > j0 + 0.4 && (
            <g>
              {pr.hatch.map((r, k) => (
                <path key={k} d={`M${r.map((p) => `${p[0]} ${p[1]}`).join('L')}Z`} fill={MARKERS.blue.hatch} opacity={0.4} />
              ))}
              {pr.strokes.map((s, k) => (
                <path key={k} d={ribbon(s.pts, s.closed, 5 * u, k)} fill={MARKERS.blue.stroke} fillRule="evenodd" />
              ))}
              {pr.face && (
                <g>
                  <circle cx={pr.face[0] - 8 * u} cy={pr.face[1] - 6 * u} r={3.5 * u} fill={MARKERS.ink.stroke} />
                  <circle cx={pr.face[0] + 8 * u} cy={pr.face[1] - 6 * u} r={3.5 * u} fill={MARKERS.ink.stroke} />
                  <path d={`M${pr.face[0] - 8 * u} ${pr.face[1] + 3 * u} Q${pr.face[0]} ${pr.face[1] + 11 * u} ${pr.face[0] + 8 * u} ${pr.face[1] + 3 * u}`} fill="none" stroke={MARKERS.ink.stroke} strokeWidth={3 * u} strokeLinecap="round" />
                </g>
              )}
            </g>
          )}
          {m >= 1 &&
            [0, 1, 2].map((k) => {
              const kk = springAt(t, j0 + 0.4 + loop.length * 0.75 + k * 0.1, { damping: 12, stiffness: 180 });
              return <Star key={k} x={mx + (k - 1) * 40 * u} y={my - 60 * u - (k % 2) * 20 * u} r={11 * u} k={kk} />;
            })}
        </g>
      );
    }
  }

  const ghosts = [0, 1, 2, 3, 4].map((i) => ({ x: random(`gx${i}`) * W * 0.7, y: (0.15 + i * 0.18) * H, w: (300 + random(`gw${i}`) * 400) * u, h: (60 + random(`gh${i}`) * 30) * u }));
  const bezel = 15 * u;
  return (
    <AbsoluteFill style={{ background: B.boardEdge, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: '0 0' }}>
        {/* the board itself (moves with the camera) */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, background: `radial-gradient(ellipse, ${B.boardCentre} 0%, ${B.boardCentre} 35%, ${B.boardEdge} 72%)` }} />
        <div style={{ position: 'absolute', left: W * 0.08, top: H * 0.06, width: 450 * u, height: 450 * u, background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)' }} />
        {ghosts.map((g, i) => (
          <div key={i} style={{ position: 'absolute', left: g.x, top: g.y, width: g.w, height: g.h, borderRadius: g.h, background: B.ghost, opacity: 0.6 }} />
        ))}
        <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          {hatchEls}
          {strokeEls}
          {livingEls}
          {popEls}
          {journey}
        </svg>
        {/* real text (letters join), written right → left with a moving clip */}
        {C.texts.map((tx2, i) => {
          if (t < tx2.t0) return null;
          const k = prog(t, tx2.t0, tx2.t1, ease.linear);
          const done = springAt(t, tx2.t1, { damping: 10, stiffness: 220, mass: 0.6 });
          const wob = tx2.t1 < t ? Math.sin(Math.min(1, (t - tx2.t1) / 0.25) * Math.PI * 2) * (1 - Math.min(1, (t - tx2.t1) / 0.25)) : 0;
          return (
            <div
              key={i}
              dir="rtl"
              style={{
                position: 'absolute',
                left: tx2.x - Bd.W,
                width: Bd.W * 2,
                top: tx2.y,
                textAlign: 'center',
                fontFamily: B.font,
                fontWeight: 700,
                fontSize: tx2.size,
                lineHeight: 1.35,
                color: tx2.color,
                whiteSpace: 'nowrap',
                transform: `rotate(${wob * 1.5}deg) scale(${1 + wob * 0.04 + 0 * done})`,
              }}
            >
              <span style={{ display: 'inline-block', clipPath: `inset(-20% 0 -30% ${(1 - k) * 100}%)` }}>{tx2.text}</span>
            </div>
          );
        })}
        <Marker x={mk.x} y={mk.y} color={mk.color} lift={mk.lift} u={u} />
      </AbsoluteFill>
      {/* fixed bezel */}
      <div style={{ position: 'absolute', inset: 0, border: `${bezel}px solid ${B.bezel}`, borderRadius: 0, boxShadow: `inset 0 0 0 ${2 * u}px ${B.bezelLine}`, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
