/**
 * doodle ink: hand-drawn, variable-width brown outlines computed once per shape (no SVG displacement filters — the
 * exporter drops them, STYLE.md §8). A shape is an SVG path (absolute M/L/C/Q/Z subset) sampled into points; the ink
 * line is a filled ribbon whose width follows a seeded "pressure" sine (thin at stroke ends).
 */

export type P = [number, number];

const num = /-?\d*\.?\d+(?:e-?\d+)?/gi;

/** sample an SVG path (M L H V C S Q T A Z, absolute and relative) into polylines */
export const samplePath = (d: string, step = 6): Array<{ pts: P[]; closed: boolean }> => {
  const out: Array<{ pts: P[]; closed: boolean }> = [];
  const toks = d.match(/[MLHVCSQTAZmlhvcsqtaz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let cur: P = [0, 0];
  let start: P = [0, 0];
  let lastCtrl: P | null = null;
  let poly: P[] = [];
  let cmd = 'M';
  const n = () => Number(toks[i++]);
  const push = (p: P) => poly.push(p);
  const flush = (closed: boolean) => {
    if (poly.length > 1) out.push({ pts: poly, closed });
    poly = [];
  };
  const line = (p: P) => {
    const L = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
    const k = Math.max(1, Math.ceil(L / step));
    for (let j = 1; j <= k; j++) push([cur[0] + ((p[0] - cur[0]) * j) / k, cur[1] + ((p[1] - cur[1]) * j) / k]);
    cur = p;
  };
  const cubic = (c1: P, c2: P, p: P) => {
    const L = Math.hypot(c1[0] - cur[0], c1[1] - cur[1]) + Math.hypot(c2[0] - c1[0], c2[1] - c1[1]) + Math.hypot(p[0] - c2[0], p[1] - c2[1]);
    const k = Math.max(3, Math.ceil(L / step));
    for (let j = 1; j <= k; j++) {
      const s = j / k;
      const u = 1 - s;
      push([u * u * u * cur[0] + 3 * u * u * s * c1[0] + 3 * u * s * s * c2[0] + s * s * s * p[0], u * u * u * cur[1] + 3 * u * u * s * c1[1] + 3 * u * s * s * c2[1] + s * s * s * p[1]]);
    }
    lastCtrl = c2;
    cur = p;
  };
  const quad = (c: P, p: P) => {
    const L = Math.hypot(c[0] - cur[0], c[1] - cur[1]) + Math.hypot(p[0] - c[0], p[1] - c[1]);
    const k = Math.max(2, Math.ceil(L / step));
    for (let j = 1; j <= k; j++) {
      const s = j / k;
      push([(1 - s) * (1 - s) * cur[0] + 2 * (1 - s) * s * c[0] + s * s * p[0], (1 - s) * (1 - s) * cur[1] + 2 * (1 - s) * s * c[1] + s * s * p[1]]);
    }
    lastCtrl = c;
    cur = p;
  };
  const arc = (rx: number, ry: number, rot: number, large: number, sweep: number, p: P) => {
    // SVG endpoint → centre parameterisation (F.6.5)
    if (!rx || !ry) return line(p);
    const phi = (rot * Math.PI) / 180;
    const cs = Math.cos(phi);
    const sn = Math.sin(phi);
    const dx = (cur[0] - p[0]) / 2;
    const dy = (cur[1] - p[1]) / 2;
    const x1 = cs * dx + sn * dy;
    const y1 = -sn * dx + cs * dy;
    let Rx = Math.abs(rx);
    let Ry = Math.abs(ry);
    const lam = (x1 * x1) / (Rx * Rx) + (y1 * y1) / (Ry * Ry);
    if (lam > 1) {
      Rx *= Math.sqrt(lam);
      Ry *= Math.sqrt(lam);
    }
    const num2 = Rx * Rx * Ry * Ry - Rx * Rx * y1 * y1 - Ry * Ry * x1 * x1;
    const den = Rx * Rx * y1 * y1 + Ry * Ry * x1 * x1;
    let co = Math.sqrt(Math.max(0, num2 / den));
    if (large === sweep) co = -co;
    const cx1 = (co * Rx * y1) / Ry;
    const cy1 = (-co * Ry * x1) / Rx;
    const cx = cs * cx1 - sn * cy1 + (cur[0] + p[0]) / 2;
    const cy = sn * cx1 + cs * cy1 + (cur[1] + p[1]) / 2;
    const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    const t1 = ang(1, 0, (x1 - cx1) / Rx, (y1 - cy1) / Ry);
    let dt = ang((x1 - cx1) / Rx, (y1 - cy1) / Ry, (-x1 - cx1) / Rx, (-y1 - cy1) / Ry);
    if (!sweep && dt > 0) dt -= Math.PI * 2;
    if (sweep && dt < 0) dt += Math.PI * 2;
    const k = Math.max(4, Math.ceil((Math.abs(dt) * Math.max(Rx, Ry)) / step));
    for (let j = 1; j <= k; j++) {
      const a = t1 + (dt * j) / k;
      push([cx + Rx * Math.cos(a) * cs - Ry * Math.sin(a) * sn, cy + Rx * Math.cos(a) * sn + Ry * Math.sin(a) * cs]);
    }
    cur = p;
  };
  while (i < toks.length) {
    const t = toks[i]!;
    if (/[A-Za-z]/.test(t)) {
      cmd = t;
      i++;
      if (cmd === 'Z' || cmd === 'z') {
        if (poly.length && (cur[0] !== start[0] || cur[1] !== start[1])) line(start);
        flush(true);
        cur = start;
        continue;
      }
    }
    const rel = cmd === cmd.toLowerCase();
    const o = (x: number, y: number): P => (rel ? [cur[0] + x, cur[1] + y] : [x, y]);
    switch (cmd.toUpperCase()) {
      case 'M': {
        flush(false);
        cur = o(n(), n());
        start = cur;
        push(cur);
        cmd = rel ? 'l' : 'L';
        break;
      }
      case 'L':
        line(o(n(), n()));
        break;
      case 'H': {
        const x = n();
        line([rel ? cur[0] + x : x, cur[1]]);
        break;
      }
      case 'V': {
        const y = n();
        line([cur[0], rel ? cur[1] + y : y]);
        break;
      }
      case 'C': {
        const c1 = o(n(), n());
        const c2 = o(n(), n());
        cubic(c1, c2, o(n(), n()));
        break;
      }
      case 'S': {
        const c1: P = lastCtrl ? [2 * cur[0] - lastCtrl[0], 2 * cur[1] - lastCtrl[1]] : cur;
        const c2 = o(n(), n());
        cubic(c1, c2, o(n(), n()));
        break;
      }
      case 'Q': {
        const c = o(n(), n());
        quad(c, o(n(), n()));
        break;
      }
      case 'T': {
        const c: P = lastCtrl ? [2 * cur[0] - lastCtrl[0], 2 * cur[1] - lastCtrl[1]] : cur;
        quad(c, o(n(), n()));
        break;
      }
      case 'A': {
        const rx = n();
        const ry = n();
        const rot = n();
        const large = n();
        const sweep = n();
        arc(rx, ry, rot, large, sweep, o(n(), n()));
        break;
      }
      default:
        i++;
    }
    if (!'CSQT'.includes(cmd.toUpperCase())) lastCtrl = null;
  }
  flush(false);
  return out;
};

const f1 = (x: number) => Math.round(x * 10) / 10;

/** a variable-width ribbon around a polyline (closed: a ring) as a path for fill-rule nonzero */
export const ribbon = (pts: P[], closed: boolean, w: number, seed = 0) => {
  const n = pts.length;
  if (n < 2) return '';
  const left: P[] = [];
  const right: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)]!;
    const b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)]!;
    let nx = -(b[1] - a[1]);
    let ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    nx /= l;
    ny /= l;
    const t = i / (n - 1);
    const press = 0.5 + 0.35 * Math.sin(i * 0.21 + seed) + 0.15 * Math.sin(i * 0.07 + seed * 2);
    const taper = closed ? 1 : Math.min(1, Math.sin(Math.PI * t) * 1.6 + 0.15);
    const hw = (w / 2) * (0.65 + 0.7 * press) * taper;
    left.push([pts[i]![0] + nx * hw, pts[i]![1] + ny * hw]);
    right.push([pts[i]![0] - nx * hw, pts[i]![1] - ny * hw]);
  }
  const fmt = (p: P) => `${f1(p[0])} ${f1(p[1])}`;
  if (closed) return `M${left.map(fmt).join('L')}Z M${right.reverse().map(fmt).join('L')}Z`;
  return `M${left.map(fmt).join('L')}L${right.reverse().map(fmt).join('L')}Z`;
};

const memo = new Map<string, string>();
/** the ink outline of an SVG path, memoised (shape + width + seed) */
export const inkOf = (d: string, w = 4.5, seed = 1) => {
  const key = `${w}|${seed}|${d}`;
  const hit = memo.get(key);
  if (hit) return hit;
  const out = samplePath(d)
    .map((s, k) => ribbon(s.pts, s.closed, w, seed + k * 1.7))
    .join(' ');
  memo.set(key, out);
  return out;
};

/** helpers to build shape paths */
export const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx + rx} ${cy} C${cx + rx} ${cy + ry * 0.552} ${cx + rx * 0.552} ${cy + ry} ${cx} ${cy + ry} C${cx - rx * 0.552} ${cy + ry} ${cx - rx} ${cy + ry * 0.552} ${cx - rx} ${cy} C${cx - rx} ${cy - ry * 0.552} ${cx - rx * 0.552} ${cy - ry} ${cx} ${cy - ry} C${cx + rx * 0.552} ${cy - ry} ${cx + rx} ${cy - ry * 0.552} ${cx + rx} ${cy} Z`;
export const rrect = (x: number, y: number, w: number, h: number, r: number) => {
  const q = Math.min(r, w / 2, h / 2);
  return `M${x + q} ${y} L${x + w - q} ${y} Q${x + w} ${y} ${x + w} ${y + q} L${x + w} ${y + h - q} Q${x + w} ${y + h} ${x + w - q} ${y + h} L${x + q} ${y + h} Q${x} ${y + h} ${x} ${y + h - q} L${x} ${y + q} Q${x} ${y} ${x + q} ${y} Z`;
};
export const numbersIn = (d: string) => (d.match(num) ?? []).length;
