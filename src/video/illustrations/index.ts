/**
 * Topic-literal vector illustrations (QUALITY_BAR §MUST 2–3): rich, layered, animated SVG scenes
 * built from code. Pure functions → SVG markup for a 1000×1000 viewBox, so they render identically
 * in the Player, the web renderer and a plain browser (scripts/preview-illustrations.mjs).
 * Animation comes only from the frame passed in (deterministic, no Math.random / Date).
 *
 * Dependency-free on purpose (no imports) so Node can load it directly for previews.
 */

export type IllusParams = Record<string, string | number | boolean>;
export type IllusCtx = {
  f: number; // frame relative to the scene start
  fps: number;
  dur: number; // scene length in frames
  uid: string; // unique id prefix for gradients/clips in this DOM
  c: { primary: string; accent: string; text: string; bg: string; good: string; bad: string };
  p: IllusParams;
};
export type IllusFn = (x: IllusCtx) => string;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const rnd = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const n = (v: number) => Math.round(v * 10) / 10;
/** entrance progress 0→1 over `len` seconds starting at `at` seconds */
const enter = (x: IllusCtx, at: number, len = 0.5) => easeOut((x.f / x.fps - at) / len);

const lg = (id: string, stops: Array<[number, string, number?]>, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`)
    .join('')}</linearGradient>`;

const sparkle = (cx: number, cy: number, r: number, col: string, op = 1) =>
  `<path d="M${n(cx)} ${n(cy - r)} Q${n(cx + r * 0.16)} ${n(cy - r * 0.16)} ${n(cx + r)} ${n(cy)} Q${n(cx + r * 0.16)} ${n(cy + r * 0.16)} ${n(cx)} ${n(cy + r)} Q${n(cx - r * 0.16)} ${n(cy + r * 0.16)} ${n(cx - r)} ${n(cy)} Q${n(cx - r * 0.16)} ${n(cy - r * 0.16)} ${n(cx)} ${n(cy - r)}Z" fill="${col}" opacity="${n(op)}"/>`;

const snowflake = (cx: number, cy: number, r: number, col: string, rot: number) => {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + rot;
    const ex = cx + Math.cos(a) * r;
    const ey = cy + Math.sin(a) * r;
    d += `M${n(cx)} ${n(cy)}L${n(ex)} ${n(ey)}`;
    const bx = cx + Math.cos(a) * r * 0.6;
    const by = cy + Math.sin(a) * r * 0.6;
    for (const s of [-1, 1]) d += `M${n(bx)} ${n(by)}L${n(bx + Math.cos(a + s * 0.8) * r * 0.3)} ${n(by + Math.sin(a + s * 0.8) * r * 0.3)}`;
  }
  return `<path d="${d}" stroke="${col}" stroke-width="${n(r * 0.14)}" stroke-linecap="round" fill="none"/>`;
};

// ───────────────────────────── Tooth cross-section ─────────────────────────────
const TOOTH =
  'M318 590 C268 470 250 300 320 205 C350 165 400 150 440 172 C470 188 530 188 560 172 C600 150 650 165 680 205 C750 300 732 470 682 590 C676 700 668 820 636 912 C620 958 582 962 570 918 C556 860 548 760 520 700 C512 684 488 684 480 700 C452 760 444 860 430 918 C418 962 380 958 364 912 C332 820 324 700 318 590Z';
const CROWN =
  'M318 590 C268 470 250 300 320 205 C350 165 400 150 440 172 C470 188 530 188 560 172 C600 150 650 165 680 205 C750 300 732 470 682 590 C600 612 400 612 318 590Z';
const DENTIN_CROWN =
  'M352 584 C312 470 300 320 352 240 C376 206 412 196 444 214 C474 230 526 230 556 214 C588 196 624 206 648 240 C700 320 688 470 648 584 C580 600 420 600 352 584Z';
const PULP =
  'M420 330 C420 290 450 282 470 300 C486 314 514 314 530 300 C550 282 580 290 580 330 C582 420 566 520 556 600 C548 690 562 800 586 890 C590 906 578 912 572 898 C540 820 520 720 512 650 C508 630 492 630 488 650 C480 720 460 820 428 898 C422 912 410 906 414 890 C438 800 452 690 444 600 C434 520 418 420 420 330Z';

const toothCross: IllusFn = (x) => {
  const { uid, f, fps } = x;
  const hl = String(x.p.highlight ?? 'none');
  const t = f / fps;
  const g = `${uid}t`;
  let defs =
    lg(`${g}en`, [[0, '#FFFFFF'], [0.55, '#EEF4FA'], [1, '#D3DEEA']], 0, 0, 1, 1) +
    lg(`${g}de`, [[0, '#FBEFD2'], [1, '#E9CF9C']]) +
    lg(`${g}pu`, [[0, '#FF6B7D'], [1, '#C81E3C']]) +
    lg(`${g}gu`, [[0, '#F7A1AE'], [1, '#D9566E']]) +
    lg(`${g}bo`, [[0, '#F4E6D4'], [1, '#E4CFB4']]) +
    `<clipPath id="${g}cl"><path d="${CROWN}"/></clipPath>`;
  let s = '';
  // bone + gum behind the roots
  s += `<path d="M90 640 C200 600 300 640 330 600 L670 600 C700 640 800 600 910 640 L910 1000 L90 1000Z" fill="url(#${g}bo)"/>`;
  // tooth body (root dentin + cementum outline)
  s += `<path d="${TOOTH}" fill="url(#${g}de)" stroke="#C9A877" stroke-width="8"/>`;
  s += `<path d="${CROWN}" fill="url(#${g}en)" stroke="#B9C8D8" stroke-width="6"/>`;
  s += `<path d="${DENTIN_CROWN}" fill="url(#${g}de)" opacity="0.92"/>`;
  // pulp (+ pain glow)
  const pain = hl === 'pulp' || hl === 'cold' || hl === 'cavity';
  const pulse = pain ? 0.5 + 0.5 * Math.sin(t * 7) : 0;
  if (pain) s += `<path d="${PULP}" fill="none" stroke="#FF3355" stroke-width="${n(30 + 26 * pulse)}" stroke-opacity="${n(0.18 + 0.2 * pulse)}" stroke-linejoin="round"/>`;
  s += `<path d="${PULP}" fill="url(#${g}pu)"/>`;
  // nerve threads in the pulp
  s += `<path d="M500 330 C496 420 506 520 500 640 M470 360 C466 440 470 520 460 640 M530 360 C534 440 530 520 540 640" stroke="#FFD1D8" stroke-width="5" fill="none" opacity="0.55"/>`;
  // enamel shine
  s += `<g clip-path="url(#${g}cl)"><path d="M300 260 C330 210 380 190 420 200 C380 240 350 330 345 420 C320 380 300 320 300 260Z" fill="#FFFFFF" opacity="0.85"/>`;
  if (hl === 'clean' || hl === 'shine') {
    const sx = -200 + ((t * 420) % 1400);
    s += `<rect x="${n(sx)}" y="100" width="120" height="700" fill="#FFFFFF" opacity="0.55" transform="rotate(20 ${n(sx)} 400)"/>`;
  }
  s += `</g>`;
  // gum line in front of the root tops
  s += `<path d="M90 650 C200 610 290 640 330 610 C360 660 380 700 372 760 L90 760Z" fill="url(#${g}gu)"/>`;
  s += `<path d="M910 650 C800 610 710 640 670 610 C640 660 620 700 628 760 L910 760Z" fill="url(#${g}gu)"/>`;
  s += `<path d="M90 740 L372 740 C380 800 420 830 500 836 C580 830 620 800 628 740 L910 740 L910 1000 L90 1000Z" fill="url(#${g}gu)" opacity="0.92"/>`;
  // highlight effects
  if (hl === 'crack' || hl === 'cracks') {
    const p = clamp01(t / 1.1);
    const crack = 'M560 178 L548 232 L572 268 L546 318 L566 356 L540 410';
    const crack2 = 'M402 176 L418 230 L398 262 L420 300';
    s += `<path d="${crack}" stroke="#D11F3A" stroke-width="12" fill="none" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="320" stroke-dashoffset="${n(320 * (1 - p))}"/>`;
    s += `<path d="${crack2}" stroke="#D11F3A" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="160" stroke-dashoffset="${n(160 * (1 - clamp01((t - 0.4) / 0.8)))}"/>`;
    const ring = easeOut((t - 0.9) / 0.5);
    if (ring > 0) s += `<circle cx="540" cy="300" r="${n(150 * (0.7 + 0.3 * ring))}" fill="none" stroke="#E5203F" stroke-width="14" opacity="${n(ring)}" stroke-dasharray="${n(950 * ring)} 950"/>`;
  }
  if (hl === 'cavity') {
    const p = easeOut(t / 1.2);
    s += `<path d="M600 212 C640 222 660 262 646 300 C632 336 590 340 572 312 C556 286 566 236 600 212Z" fill="#5B3A1E" opacity="${n(0.25 + 0.75 * p)}" transform="translate(${n(608 * (1 - p))} ${n(276 * (1 - p))}) scale(${n(p)})"/>`;
  }
  if (hl === 'cold') {
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.9 + i / 3) % 1;
      const y = 60 + i * 70;
      const xx = 60 + ph * 260;
      s += `<path d="M${n(xx)} ${n(y + 80)} q30 -26 60 0 t60 0 t60 0" stroke="#4FB4FF" stroke-width="16" fill="none" stroke-linecap="round" opacity="${n(Math.sin(ph * Math.PI))}"/>`;
    }
    s += snowflake(170, 150, 70, '#4FB4FF', t * 0.6);
    s += snowflake(840, 210, 46, '#7CC8FF', -t * 0.5);
  }
  if (hl === 'clean' || hl === 'shine') {
    for (let i = 0; i < 4; i++) {
      const tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7);
      s += sparkle([240, 770, 820, 190][i]!, [180, 140, 420, 470][i]!, 30 + 18 * tw, '#FFFFFF', 0.6 + 0.4 * tw);
    }
  }
  return `<defs>${defs}</defs>${s}`;
};

// ───────────────────────────── Row of teeth ─────────────────────────────
const toothShape = (cx: number, top: number, w: number, h: number, upper: boolean) => {
  const l = cx - w / 2;
  const r = cx + w / 2;
  if (upper)
    return `M${n(l)} ${n(top)} L${n(r)} ${n(top)} L${n(r - w * 0.04)} ${n(top + h * 0.8)} C${n(r - w * 0.06)} ${n(top + h)} ${n(l + w * 0.06)} ${n(top + h)} ${n(l + w * 0.04)} ${n(top + h * 0.8)}Z`;
  return `M${n(l + w * 0.04)} ${n(top + h * 0.2)} C${n(l + w * 0.06)} ${n(top)} ${n(r - w * 0.06)} ${n(top)} ${n(r - w * 0.04)} ${n(top + h * 0.2)} L${n(r)} ${n(top + h)} L${n(l)} ${n(top + h)}Z`;
};

const teethRow: IllusFn = (x) => {
  const { uid, f, fps } = x;
  const t = f / fps;
  const g = `${uid}r`;
  const plaque = !!x.p.plaque;
  const floss = !!x.p.floss;
  const clean = !!x.p.clean || !!x.p.sparkle;
  const badIdx = typeof x.p.bad === 'number' ? x.p.bad : -1;
  const defs =
    lg(`${g}t`, [[0, '#FFFFFF'], [0.7, '#F1F5FA'], [1, '#D8E2EE']], 0, 0, 0, 1) +
    lg(`${g}g`, [[0, '#F59AAA'], [1, '#D8546D']]) +
    lg(`${g}m`, [[0, '#7A1C30'], [1, '#4A0E1C']]);
  let s = '';
  // mouth interior
  s += `<path d="M110 430 C300 360 700 360 890 430 L890 640 C700 720 300 720 110 640Z" fill="url(#${g}m)"/>`;
  // gums
  s += `<path d="M80 250 C300 170 700 170 920 250 L920 440 C700 380 300 380 80 440Z" fill="url(#${g}g)"/>`;
  s += `<path d="M80 760 C300 830 700 830 920 760 L920 600 C700 680 300 680 80 600Z" fill="url(#${g}g)"/>`;
  const widths = [84, 94, 106, 122, 122, 106, 94, 84];
  const total = widths.reduce((a, b) => a + b, 0) + 7 * 6;
  let cx = 500 - total / 2;
  const centers: number[] = [];
  widths.forEach((w, i) => {
    const c = cx + w / 2;
    centers.push(c);
    const arc = Math.pow((c - 500) / 400, 2) * 60;
    const hU = (i === 3 || i === 4 ? 230 : i === 2 || i === 5 ? 210 : 190) - arc;
    const topU = 330 + arc;
    const fillBad = i === badIdx ? '#F6E9C8' : `url(#${g}t)`;
    s += `<path d="${toothShape(c, topU, w, hU, true)}" fill="${fillBad}" stroke="#C7D3E0" stroke-width="5"/>`;
    s += `<path d="M${n(c - w * 0.3)} ${n(topU + 30)} q${n(w * 0.08)} ${n(hU * 0.3)} 0 ${n(hU * 0.55)}" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.9"/>`;
    const hL = hU * 0.78;
    const topL = 690 - arc * 0.6 - hL;
    s += `<path d="${toothShape(c, topL + 10, w * 0.92, hL, false)}" fill="url(#${g}t)" stroke="#C7D3E0" stroke-width="5"/>`;
    cx += w + 6;
  });
  // plaque between teeth, cleaned by the floss
  const cleanP = floss ? clamp01((t - 0.6) / 1.4) : clean ? 1 : 0;
  if (plaque) {
    for (let i = 0; i < centers.length - 1; i++) {
      const gx = (centers[i]! + centers[i + 1]!) / 2;
      const arc = Math.pow((gx - 500) / 420, 2) * 50;
      const gone = floss && i === 3 ? cleanP : floss ? clamp01(cleanP * 1.4 - Math.abs(i - 3) * 0.25) : cleanP;
      s += `<ellipse cx="${n(gx)}" cy="${n(372 + arc)}" rx="22" ry="34" fill="#D9B44A" opacity="${n(0.85 * (1 - gone))}"/>`;
      s += `<ellipse cx="${n(gx)}" cy="${n(540 + arc)}" rx="14" ry="20" fill="#C99A36" opacity="${n(0.75 * (1 - gone))}"/>`;
    }
  }
  if (floss) {
    const gx = (centers[3]! + centers[4]!) / 2;
    const dy = Math.sin(t * 6) * 40 * clamp01(t / 0.4);
    const yy = 420 + dy;
    s += `<path d="M${n(gx - 300)} 40 L${n(gx)} ${n(yy)} L${n(gx + 300)} 40" stroke="#FFFFFF" stroke-width="9" fill="none" stroke-linejoin="round"/>`;
    s += `<path d="M${n(gx - 300)} 40 L${n(gx)} ${n(yy)} L${n(gx + 300)} 40" stroke="${x.c.accent}" stroke-width="3" fill="none" stroke-dasharray="14 10" opacity="0.6"/>`;
  }
  if (badIdx >= 0 && badIdx < centers.length) {
    const ring = easeOut((t - 0.3) / 0.6);
    s += `<circle cx="${n(centers[badIdx]!)}" cy="440" r="${n(150 * (0.8 + 0.2 * ring))}" fill="none" stroke="#E5203F" stroke-width="14" opacity="${n(ring)}" stroke-dasharray="${n(950 * ring)} 950"/>`;
  }
  if (clean || cleanP >= 1) {
    for (let i = 0; i < 5; i++) {
      const tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.3);
      s += sparkle([180, 360, 520, 690, 840][i]!, [130, 110, 140, 105, 150][i]!, 22 + 16 * tw, '#FFFFFF', (0.5 + 0.5 * tw) * clamp01(cleanP * 1.2));
    }
  }
  return `<defs>${defs}</defs>${s}`;
};

// ───────────────────────────── Engine cylinder (4-stroke) ─────────────────────────────
const engine: IllusFn = (x) => {
  const { uid, f, fps } = x;
  const t = f / fps;
  const g = `${uid}e`;
  const mode = String(x.p.stroke ?? 'cycle');
  const stroke = mode === 'cycle' ? 0 : Math.max(1, Math.min(4, Number(mode) || 1));
  // crank angle: one stroke = π. Single stroke loops every 1.6 s (0.95 s motion + hold); cycle runs continuously.
  let theta: number;
  let phase: number; // 1..4
  if (stroke === 0) {
    const rps = Number(x.p.speed ?? 0.9);
    theta = t * rps * Math.PI * 2;
    phase = (Math.floor(theta / Math.PI) % 4) + 1;
  } else {
    const loop = 1.6;
    const lt = t % loop;
    theta = (stroke - 1) * Math.PI + Math.PI * ease(lt / 0.95);
    phase = stroke;
  }
  const local = (theta % Math.PI) / Math.PI; // progress inside the current stroke
  const cxk = 500;
  const cyk = 840;
  const r = 92;
  const L = 330;
  const pinY = cyk - (r * Math.cos(theta) + Math.sqrt(L * L - Math.pow(r * Math.sin(theta), 2)));
  const pinX = cxk;
  const crankX = cxk + r * Math.sin(theta);
  const crankY = cyk - r * Math.cos(theta);
  const top = pinY - 66; // piston crown
  const defs =
    lg(`${g}blk`, [[0, '#59606B'], [0.5, '#3B414A'], [1, '#2A2E35']], 0, 0, 1, 0) +
    lg(`${g}bore`, [[0, '#1A1D22'], [0.5, '#2B3038'], [1, '#1A1D22']], 0, 0, 1, 0) +
    lg(`${g}pis`, [[0, '#8E98A6'], [0.35, '#E6EBF1'], [0.65, '#C3CBD5'], [1, '#7B8592']], 0, 0, 1, 0) +
    lg(`${g}rod`, [[0, '#7C8693'], [0.5, '#D5DCE4'], [1, '#6C7581']], 0, 0, 1, 0) +
    lg(`${g}fire`, [[0, '#FFF3B0'], [0.4, '#FFB22E'], [1, '#FF4D1A']]) +
    lg(`${g}mix`, [[0, '#BFE6FF'], [1, '#7FC6F5']]) +
    lg(`${g}hot`, [[0, '#FFD08A'], [1, '#FF9A4A']]) +
    lg(`${g}smoke`, [[0, '#A9AFB8'], [1, '#6E747D']]);
  let s = '';
  // crankcase
  s += `<path d="M270 700 L730 700 L760 760 C780 940 660 990 500 990 C340 990 220 940 240 760Z" fill="#2A2E35" stroke="#59606B" stroke-width="6"/>`;
  // cylinder block with cooling fins
  s += `<rect x="250" y="210" width="500" height="500" rx="18" fill="url(#${g}blk)"/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="226" y="${250 + i * 70}" width="548" height="22" rx="11" fill="#4B525C"/>`;
  s += `<rect x="342" y="236" width="316" height="474" fill="url(#${g}bore)"/>`;
  // head + ports
  s += `<path d="M230 120 L770 120 L790 236 L210 236Z" fill="#4B525C" stroke="#6B737E" stroke-width="5"/>`;
  s += `<path d="M40 150 L330 150 C370 150 392 186 400 236 L360 236 C352 210 340 196 320 196 L40 196Z" fill="#232830"/>`;
  s += `<path d="M960 150 L670 150 C630 150 608 186 600 236 L640 236 C648 210 660 196 680 196 L960 196Z" fill="#232830"/>`;
  // chamber contents
  const chamberH = Math.max(0, top - 236);
  if (phase === 1) {
    s += `<rect x="342" y="236" width="316" height="${n(chamberH)}" fill="url(#${g}mix)" opacity="0.85"/>`;
    for (let i = 0; i < 14; i++) {
      const k = (t * 1.2 + i / 14) % 1;
      const px = 60 + k * 340 + (k > 0.85 ? (k - 0.85) * 400 : 0);
      const py = 173 + Math.sin(i * 2.1 + t * 4) * 12 + (k > 0.85 ? (k - 0.85) * 600 : 0);
      s += `<circle cx="${n(px)}" cy="${n(Math.min(py, top - 12))}" r="${i % 3 === 0 ? 10 : 7}" fill="${i % 3 === 0 ? '#FFC93C' : '#E8F6FF'}" opacity="0.95"/>`;
    }
    for (let i = 0; i < 10; i++) {
      const px = 360 + rnd(i) * 280;
      const py = 250 + rnd(i + 9) * Math.max(10, chamberH - 30);
      s += `<circle cx="${n(px)}" cy="${n(py)}" r="${i % 3 === 0 ? 9 : 6}" fill="${i % 3 === 0 ? '#FFC93C' : '#FFFFFF'}" opacity="0.9"/>`;
    }
  } else if (phase === 2) {
    s += `<rect x="342" y="236" width="316" height="${n(chamberH)}" fill="url(#${g}hot)" opacity="${n(0.55 + 0.4 * local)}"/>`;
    for (let i = 0; i < 18; i++) {
      const px = 360 + rnd(i * 3) * 280;
      const py = 248 + rnd(i * 5 + 1) * Math.max(8, chamberH - 24);
      s += `<circle cx="${n(px)}" cy="${n(py)}" r="6" fill="${i % 3 === 0 ? '#FFC93C' : '#FFF4E0'}"/>`;
    }
  } else if (phase === 3) {
    const flash = clamp01(1 - local * 1.6);
    s += `<rect x="342" y="236" width="316" height="${n(chamberH)}" fill="url(#${g}fire)"/>`;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + t * 2;
      const rr = 50 + 90 * local;
      s += `<path d="M500 250 L${n(500 + Math.cos(a) * rr)} ${n(260 + Math.abs(Math.sin(a)) * rr)}" stroke="#FFF7C2" stroke-width="10" stroke-linecap="round" opacity="${n(0.4 + 0.6 * flash)}"/>`;
    }
    s += sparkle(500, 248, 70 + 60 * flash, '#FFFDE8', 0.5 + 0.5 * flash);
  } else {
    s += `<rect x="342" y="236" width="316" height="${n(chamberH)}" fill="url(#${g}smoke)" opacity="${n(0.75 - 0.4 * local)}"/>`;
    for (let i = 0; i < 7; i++) {
      const k = (t * 0.9 + i / 7) % 1;
      const px = 610 + k * 330;
      const py = 175 - k * 60 + Math.sin(i + t * 3) * 10;
      s += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(22 + k * 30)}" fill="#9AA1AB" opacity="${n(0.8 * (1 - k))}"/>`;
    }
  }
  // valves (intake left opens on stroke 1, exhaust right on stroke 4)
  const lift = (open: boolean) => (open ? 34 * Math.sin(local * Math.PI) : 0);
  const li = lift(phase === 1);
  const le = lift(phase === 4);
  s += `<rect x="392" y="${n(80 + li)}" width="16" height="140" fill="#B9C1CC"/><path d="M360 ${n(224 + li)} L440 ${n(224 + li)} L420 ${n(238 + li)} L380 ${n(238 + li)}Z" fill="#D5DCE4" stroke="#8C95A1" stroke-width="3"/>`;
  s += `<rect x="592" y="${n(80 + le)}" width="16" height="140" fill="#B9C1CC"/><path d="M560 ${n(224 + le)} L640 ${n(224 + le)} L620 ${n(238 + le)} L580 ${n(238 + le)}Z" fill="#D5DCE4" stroke="#8C95A1" stroke-width="3"/>`;
  // spark plug
  s += `<rect x="480" y="40" width="40" height="80" rx="8" fill="#F2F4F7"/><rect x="472" y="112" width="56" height="44" fill="#8E98A6"/><rect x="492" y="156" width="16" height="72" fill="#C3CBD5"/>`;
  if (phase === 3 && local < 0.35) s += sparkle(500, 236, 46, '#FFE14D', 1);
  // connecting rod + crank
  const ang = (Math.atan2(crankX - pinX, crankY - pinY) * 180) / Math.PI;
  const len = Math.hypot(crankX - pinX, crankY - pinY);
  s += `<g transform="translate(${n(pinX)} ${n(pinY)}) rotate(${n(-ang)})"><rect x="-26" y="0" width="52" height="${n(len)}" rx="24" fill="url(#${g}rod)"/></g>`;
  s += `<circle cx="${cxk}" cy="${cyk}" r="122" fill="#454C56"/>`;
  const cwA = theta + Math.PI;
  s += `<path d="M${n(cxk + Math.cos(cwA - 1.2 - Math.PI / 2) * 118)} ${n(cyk + Math.sin(cwA - 1.2 - Math.PI / 2) * 118)} A118 118 0 0 1 ${n(cxk + Math.cos(cwA + 1.2 - Math.PI / 2) * 118)} ${n(cyk + Math.sin(cwA + 1.2 - Math.PI / 2) * 118)}Z" fill="#6C7581" transform="rotate(0)"/>`;
  s += `<circle cx="${cxk}" cy="${cyk}" r="30" fill="#C3CBD5"/>`;
  s += `<circle cx="${n(crankX)}" cy="${n(crankY)}" r="30" fill="#E6EBF1" stroke="#8C95A1" stroke-width="5"/>`;
  // piston
  s += `<rect x="346" y="${n(top)}" width="308" height="132" rx="10" fill="url(#${g}pis)"/>`;
  for (let i = 0; i < 3; i++) s += `<rect x="346" y="${n(top + 16 + i * 18)}" width="308" height="7" fill="#5E6773"/>`;
  s += `<circle cx="${pinX}" cy="${n(pinY)}" r="22" fill="#9AA4B1" stroke="#5E6773" stroke-width="5"/>`;
  // direction arrow beside the cylinder (accent)
  const down = phase === 1 || phase === 3;
  const ay = down ? 420 : 560;
  const op = 0.35 + 0.65 * Math.sin(local * Math.PI);
  s += `<path d="M860 ${ay} L860 ${down ? ay + 150 : ay - 150} M820 ${down ? ay + 100 : ay - 100} L860 ${down ? ay + 150 : ay - 150} L900 ${down ? ay + 100 : ay - 100}" stroke="${x.c.accent}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${n(op)}"/>`;
  return `<defs>${defs}</defs>${s}`;
};

// ───────────────────────────── Car interior + phone holder ─────────────────────────────
const phoneMarkup = (g: string, w: number, h: number, t: number) => {
  const route = `M${n(w * 0.32)} ${n(h * 0.95)} C${n(w * 0.3)} ${n(h * 0.7)} ${n(w * 0.7)} ${n(h * 0.62)} ${n(w * 0.6)} ${n(h * 0.4)} S${n(w * 0.45)} ${n(h * 0.12)} ${n(w * 0.55)} 0`;
  return (
    `<rect x="${n(-w / 2)}" y="${n(-h / 2)}" width="${w}" height="${h}" rx="${n(w * 0.16)}" fill="#14161B" stroke="#3B3F47" stroke-width="5"/>` +
    `<g transform="translate(${n(-w / 2 + 10)} ${n(-h / 2 + 10)})"><rect width="${w - 20}" height="${h - 20}" rx="${n(w * 0.12)}" fill="url(#${g}scr)"/>` +
    `<path d="M0 ${n(h * 0.3)} C${n(w * 0.3)} ${n(h * 0.26)} ${n(w * 0.6)} ${n(h * 0.36)} ${w - 20} ${n(h * 0.3)} M0 ${n(h * 0.62)} C${n(w * 0.3)} ${n(h * 0.58)} ${n(w * 0.6)} ${n(h * 0.68)} ${w - 20} ${n(h * 0.6)}" stroke="#2E5C8A" stroke-width="12" fill="none"/>` +
    `<path d="${route}" stroke="#2EE6B6" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${n(h * 1.6)}" stroke-dashoffset="${n(h * 1.6 * (1 - clamp01(t / 1.5)))}"/>` +
    `<circle cx="${n(w * 0.6)}" cy="${n(h * 0.4)}" r="${n(w * 0.07)}" fill="#FF3D71" stroke="#FFFFFF" stroke-width="5"/></g>` +
    `<rect x="${n(-w * 0.18)}" y="${n(-h / 2 + 18)}" width="${n(w * 0.36)}" height="14" rx="7" fill="#000000"/>`
  );
};

const carDash: IllusFn = (x) => {
  const { uid, f, fps } = x;
  const t = f / fps;
  const g = `${uid}c`;
  const phone = String(x.p.phone ?? 'mounted');
  const bumpy = !!x.p.bumpy;
  const shake = bumpy ? Math.sin(t * 31) * 7 + Math.sin(t * 17) * 5 : Math.sin(t * 9) * 1.5;
  const defs =
    lg(`${g}sky`, [[0, '#7EC8F2'], [1, '#D7EEF9']]) +
    lg(`${g}road`, [[0, '#6C7178'], [1, '#3A3E44']]) +
    lg(`${g}dash`, [[0, '#33373F'], [1, '#121418']]) +
    lg(`${g}scr`, [[0, '#13314F'], [1, '#0B1C30']]) +
    lg(`${g}puck`, [[0, '#4A4F58'], [1, '#14161B']], 0, 0, 1, 1) +
    lg(`${g}hill`, [[0, '#8CCB7E'], [1, '#5FA45A']]);
  let s = `<g transform="translate(0 ${n(shake)})">`;
  // windshield view
  s += `<rect x="-20" y="-20" width="1040" height="600" fill="url(#${g}sky)"/>`;
  s += `<path d="M-20 360 C200 300 320 330 500 320 C700 300 820 340 1020 330 L1020 600 L-20 600Z" fill="url(#${g}hill)"/>`;
  s += `<path d="M440 330 L560 330 L1000 600 L0 600Z" fill="url(#${g}road)"/>`;
  for (let i = 0; i < 6; i++) {
    const k = (i / 6 + t * 0.9) % 1;
    const y1 = 335 + k * k * 280;
    const y2 = y1 + 8 + k * 50;
    const w1 = 3 + k * 16;
    s += `<path d="M${n(500 - w1 / 2)} ${n(y1)} L${n(500 + w1 / 2)} ${n(y1)} L${n(500 + w1)} ${n(y2)} L${n(500 - w1)} ${n(y2)}Z" fill="#F4F1E8"/>`;
  }
  if (bumpy) for (let i = 0; i < 4; i++) s += `<ellipse cx="${n(380 + i * 90 + ((t * 120) % 60))}" cy="${n(470 + (i % 2) * 40)}" rx="${18 + i * 4}" ry="7" fill="#2A2D31"/>`;
  // A-pillars + roof frame
  s += `<path d="M-20 -20 L1020 -20 L1020 60 C700 30 300 30 -20 60Z" fill="#1A1C21"/>`;
  s += `<path d="M-20 40 L110 40 L250 560 L-20 560Z" fill="#1E2026"/><path d="M1020 40 L890 40 L750 560 L1020 560Z" fill="#1E2026"/>`;
  // dashboard
  s += `<path d="M-20 520 C200 470 800 470 1020 520 L1020 1020 L-20 1020Z" fill="url(#${g}dash)"/>`;
  s += `<path d="M-20 530 C200 482 800 482 1020 530" stroke="#4A4F58" stroke-width="6" fill="none"/>`;
  // steering wheel (left-hand drive)
  s += `<circle cx="190" cy="930" r="250" fill="none" stroke="#0B0C0F" stroke-width="56"/><circle cx="190" cy="930" r="250" fill="none" stroke="#2C3036" stroke-width="10" stroke-dasharray="60 30"/>`;
  s += `<path d="M190 930 L-40 860 M190 930 L420 860" stroke="#0B0C0F" stroke-width="46"/><circle cx="190" cy="930" r="78" fill="#202329"/>`;
  // AC vent
  s += `<rect x="520" y="760" width="300" height="130" rx="34" fill="#0B0C0F" stroke="#3B3F47" stroke-width="6"/>`;
  for (let i = 0; i < 4; i++) s += `<rect x="540" y="${780 + i * 26}" width="260" height="10" rx="5" fill="#33373F"/>`;
  const mx = 670;
  const my = 700;
  // magnetic holder (clip + ball + puck)
  s += `<rect x="652" y="740" width="36" height="70" rx="8" fill="#1E2026"/><circle cx="${mx}" cy="738" r="24" fill="#2C3036"/>`;
  s += `<circle cx="${mx}" cy="${my}" r="62" fill="url(#${g}puck)" stroke="#9AA1AB" stroke-width="6"/><circle cx="${mx}" cy="${my}" r="34" fill="none" stroke="#5E6672" stroke-width="3"/>`;
  // phone
  const pw = 230;
  const ph = 440;
  if (phone === 'mounted' || phone === 'rotate' || phone === 'snap') {
    let rot = 0;
    let dx = 0;
    let dy = 0;
    if (phone === 'rotate') rot = 360 * ease((t - 0.3) / 2.2);
    if (phone === 'snap') {
      const k = easeOut((t - 0.1) / 0.6);
      dx = (1 - k) * 260;
      dy = (1 - k) * -200;
      rot = (1 - k) * 25;
      if (k > 0.95 && t < 1.4) {
        const fl = clamp01((1.4 - t) / 0.6);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          s += `<path d="M${n(mx + Math.cos(a) * 150)} ${n(my - 60 + Math.sin(a) * 250)} L${n(mx + Math.cos(a) * 200)} ${n(my - 60 + Math.sin(a) * 320)}" stroke="${x.c.accent}" stroke-width="12" stroke-linecap="round" opacity="${n(fl)}"/>`;
        }
      }
    }
    s += `<g transform="translate(${n(mx + dx)} ${n(my - 70 + dy)}) rotate(${n(rot)})">${phoneMarkup(g, pw, ph, t)}</g>`;
    if (phone === 'rotate') s += `<path d="M${mx - 210} ${my - 330} A 300 300 0 0 1 ${mx + 210} ${my - 330}" stroke="${x.c.accent}" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.9"/><path d="M${mx + 180} ${my - 380} L${mx + 214} ${my - 328} L${mx + 150} ${my - 318}" stroke="${x.c.accent}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (phone === 'falling') {
    const k = (t % 1.8) / 1.8;
    const fall = ease(k / 0.8);
    const py = my - 70 + fall * 420;
    const rot = fall * 110;
    s += `<g transform="translate(${n(mx - fall * 160)} ${n(py)}) rotate(${n(-rot)})" opacity="${n(1 - clamp01((k - 0.85) / 0.15))}">${phoneMarkup(g, pw, ph, t)}</g>`;
    for (let i = 0; i < 3; i++) s += `<path d="M${n(mx + 160 + i * 34 - fall * 160)} ${n(py - 200 - i * 40)} l0 -90" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="${n(0.7 * fall)}"/>`;
  }
  s += `</g>`;
  return `<defs>${defs}</defs>${s}`;
};

// ───────────────────────────── Tachometer / speedometer ─────────────────────────────
const gaugeDial: IllusFn = (x) => {
  const { uid, f, fps } = x;
  const t = f / fps;
  const g = `${uid}d`;
  const max = Number(x.p.max ?? 8);
  const value = Number(x.p.value ?? 3);
  const unit = String(x.p.unit ?? 'x1000 rpm');
  const v = value * easeOut((t - 0.2) / 1.1) + (t > 1.3 ? Math.sin(t * 9) * max * 0.006 : 0);
  const a0 = -225;
  const a1 = 45;
  const ang = (val: number) => ((a0 + ((a1 - a0) * val) / max) * Math.PI) / 180;
  const defs = lg(`${g}face`, [[0, '#262A31'], [1, '#0E1013']]) + lg(`${g}rim`, [[0, '#C9D0D9'], [1, '#5F6773']], 0, 0, 1, 1);
  let s = `<circle cx="500" cy="520" r="430" fill="url(#${g}rim)"/><circle cx="500" cy="520" r="400" fill="url(#${g}face)"/>`;
  // red zone
  const rz0 = ang(max * 0.8);
  const rz1 = ang(max);
  s += `<path d="M${n(500 + Math.cos(rz0) * 360)} ${n(520 + Math.sin(rz0) * 360)} A360 360 0 0 1 ${n(500 + Math.cos(rz1) * 360)} ${n(520 + Math.sin(rz1) * 360)}" stroke="#E5203F" stroke-width="34" fill="none"/>`;
  // active arc
  const va = ang(Math.max(0.01, v));
  const large = va - ang(0) > Math.PI ? 1 : 0;
  s += `<path d="M${n(500 + Math.cos(ang(0)) * 360)} ${n(520 + Math.sin(ang(0)) * 360)} A360 360 0 ${large} 1 ${n(500 + Math.cos(va) * 360)} ${n(520 + Math.sin(va) * 360)}" stroke="${x.c.accent}" stroke-width="34" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i <= max * 2; i++) {
    const a = ang(i / 2);
    const major = i % 2 === 0;
    const r1 = major ? 300 : 320;
    s += `<path d="M${n(500 + Math.cos(a) * r1)} ${n(520 + Math.sin(a) * r1)} L${n(500 + Math.cos(a) * 345)} ${n(520 + Math.sin(a) * 345)}" stroke="#E9EDF2" stroke-width="${major ? 10 : 5}" stroke-linecap="round"/>`;
    if (major) s += `<text x="${n(500 + Math.cos(a) * 250)}" y="${n(520 + Math.sin(a) * 250 + 18)}" font-size="54" font-family="Arial, sans-serif" font-weight="700" fill="#E9EDF2" text-anchor="middle">${i / 2}</text>`;
  }
  s += `<text x="500" y="760" font-size="40" font-family="Arial, sans-serif" fill="#9AA4B1" text-anchor="middle">${unit}</text>`;
  const na = ang(v);
  s += `<path d="M${n(500 - Math.cos(na) * 40)} ${n(520 - Math.sin(na) * 40)} L${n(500 + Math.cos(na) * 330)} ${n(520 + Math.sin(na) * 330)}" stroke="#FF4D2E" stroke-width="16" stroke-linecap="round"/>`;
  s += `<circle cx="500" cy="520" r="46" fill="#3B414A" stroke="#C9D0D9" stroke-width="8"/>`;
  return `<defs>${defs}</defs>${s}`;
};

export const ILLUSTRATIONS: Record<string, { fn: IllusFn; note: string; params: string }> = {
  'tooth-cross': { fn: toothCross, note: 'tooth cross-section: enamel, dentin, pulp, roots, gum', params: 'highlight: none|pulp|crack|cavity|cold|clean' },
  'teeth-row': { fn: teethRow, note: 'front view of upper + lower teeth in the gums', params: 'plaque, floss, clean (booleans); bad: tooth index 0-7 circled red' },
  'engine-cylinder': { fn: engine, note: '4-stroke engine cross-section: piston, rod, crank, valves, spark plug', params: 'stroke: 1|2|3|4|cycle; speed (rev/s for cycle)' },
  'car-dash': { fn: carDash, note: 'car interior: windshield + road, dashboard, AC vent with magnetic phone holder', params: 'phone: mounted|falling|rotate|snap|none; bumpy (boolean)' },
  'gauge-dial': { fn: gaugeDial, note: 'tachometer / speedometer dial with needle', params: 'value, max, unit' },
};
export type IllustrationId = keyof typeof ILLUSTRATIONS;
export const ILLUSTRATION_IDS = Object.keys(ILLUSTRATIONS);

export const renderIllustration = (id: string, ctx: IllusCtx): string | null => {
  const it = ILLUSTRATIONS[id];
  return it ? it.fn(ctx) : null;
};
