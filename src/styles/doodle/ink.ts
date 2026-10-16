/**
 * doodle ink: hand-drawn, variable-width brown outlines computed once per shape (no SVG displacement filters — the
 * exporter drops them, STYLE.md §8). A shape is an SVG path (absolute M/L/C/Q/Z subset) sampled into points; the ink
 * line is a filled ribbon whose width follows a seeded "pressure" sine (thin at stroke ends).
 */

export type P = [number, number];

const num = /-?\d*\.?\d+(?:e-?\d+)?/gi;

/** sample an SVG path (absolute M L H V C Q Z, plus A approximated by L) into polylines */
export const samplePath = (d: string, step = 6): Array<{ pts: P[]; closed: boolean }> => {
  const out: Array<{ pts: P[]; closed: boolean }> = [];
  const toks = d.match(/[MLHVCQZAmlhvcqza]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let cur: P = [0, 0];
  let start: P = [0, 0];
  let poly: P[] = [];
  let cmd = 'M';
  const n = () => Number(toks[i++]);
  const push = (p: P) => poly.push(p);
  const flush = (closed: boolean) => {
    if (poly.length > 1) out.push({ pts: poly, closed });
    poly = [];
  };
  while (i < toks.length) {
    const t = toks[i]!;
    if (/[A-Za-z]/.test(t)) {
      cmd = t;
      i++;
      if (cmd === 'Z' || cmd === 'z') {
        flush(true);
        cur = start;
        continue;
      }
    }
    switch (cmd) {
      case 'M': {
        flush(false);
        cur = [n(), n()];
        start = cur;
        push(cur);
        cmd = 'L';
        break;
      }
      case 'L': {
        const p: P = [n(), n()];
        const L = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
        const k = Math.max(1, Math.ceil(L / step));
        for (let j = 1; j <= k; j++) push([cur[0] + ((p[0] - cur[0]) * j) / k, cur[1] + ((p[1] - cur[1]) * j) / k]);
        cur = p;
        break;
      }
      case 'H': {
        const p: P = [n(), cur[1]];
        push(p);
        cur = p;
        break;
      }
      case 'V': {
        const p: P = [cur[0], n()];
        push(p);
        cur = p;
        break;
      }
      case 'Q': {
        const c: P = [n(), n()];
        const p: P = [n(), n()];
        const L = Math.hypot(c[0] - cur[0], c[1] - cur[1]) + Math.hypot(p[0] - c[0], p[1] - c[1]);
        const k = Math.max(2, Math.ceil(L / step));
        for (let j = 1; j <= k; j++) {
          const s = j / k;
          const a = (1 - s) * (1 - s);
          const b = 2 * (1 - s) * s;
          const e = s * s;
          push([a * cur[0] + b * c[0] + e * p[0], a * cur[1] + b * c[1] + e * p[1]]);
        }
        cur = p;
        break;
      }
      case 'C': {
        const c1: P = [n(), n()];
        const c2: P = [n(), n()];
        const p: P = [n(), n()];
        const L = Math.hypot(c1[0] - cur[0], c1[1] - cur[1]) + Math.hypot(c2[0] - c1[0], c2[1] - c1[1]) + Math.hypot(p[0] - c2[0], p[1] - c2[1]);
        const k = Math.max(3, Math.ceil(L / step));
        for (let j = 1; j <= k; j++) {
          const s = j / k;
          const u = 1 - s;
          push([u * u * u * cur[0] + 3 * u * u * s * c1[0] + 3 * u * s * s * c2[0] + s * s * s * p[0], u * u * u * cur[1] + 3 * u * u * s * c1[1] + 3 * u * s * s * c2[1] + s * s * s * p[1]]);
        }
        cur = p;
        break;
      }
      default:
        i++;
    }
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
