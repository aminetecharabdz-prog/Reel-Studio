/**
 * doodle illustration library — everything drawn in code with the same brown variable-width ink and flat pastel fills
 * (STYLE.md §2, §12b). Props are authored in local units with the origin at their ground point (y up = negative).
 */
import type { ReactNode } from 'react';
import { random } from 'remotion';
import { ellipse, inkOf, rrect } from '@/art/ink';
import { K } from './tokens';

export const Ink = ({ d, w = 4.5, seed = 1, color = K.ink, opacity = 1 }: { d: string; w?: number; seed?: number; color?: string; opacity?: number }) => <path d={inkOf(d, w, seed)} fill={color} fillRule="evenodd" opacity={opacity} />;

/** a filled shape with its ink outline */
export const Shape = ({ d, fill, w = 4.5, seed = 1, ink = true }: { d: string; fill: string; w?: number; seed?: number; ink?: boolean }) => (
  <>
    <path d={d} fill={fill} />
    {ink && <Ink d={d} w={w} seed={seed} />}
  </>
);

/* ───────────────────────────── characters ───────────────────────────── */

export type Look = {
  kind: 'man' | 'woman' | 'kid' | 'elder';
  outfit: 'robe' | 'casual';
  color: keyof typeof K.robe;
  /** headwear derived from kind/outfit unless given */
  head?: 'turban' | 'kufi' | 'hijab' | 'cap' | 'hair';
};

export type Pose = {
  /** walk phase in radians (0 = standing) */
  walk: number;
  /** −1 (facing left) … 1 (facing right) */
  face: number;
  /** near arm angle (degrees from hanging), far arm angle */
  armN: number;
  armF: number;
  /** mouth open 0..1 (speech) */
  talk: number;
  /** breathing 0..1 */
  breath: number;
  /** head tilt (degrees) */
  tilt: number;
  blink: boolean;
};

const hatch = (seed: number, x0: number, x1: number, y0: number, y1: number, n: number) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + random(`${seed}hx${i}`) * (x1 - x0);
    const y = y0 + random(`${seed}hy${i}`) * (y1 - y0);
    const l = 10 + random(`${seed}hl${i}`) * 16;
    d += `M${x.toFixed(1)} ${y.toFixed(1)}L${(x + l * 0.35).toFixed(1)} ${(y + l).toFixed(1)}`;
  }
  return d;
};

export const Character = ({ look, pose, seed = 1 }: { look: Look; pose: Pose; seed?: number }) => {
  const s = look.kind === 'kid' ? 0.66 : 1;
  const robe = K.robe[look.color];
  const head = look.head ?? (look.kind === 'woman' ? 'hijab' : look.outfit === 'casual' ? (look.kind === 'kid' ? 'hair' : 'cap') : look.kind === 'elder' ? 'turban' : 'kufi');
  const beard = (look.kind === 'man' || look.kind === 'elder') && look.outfit === 'robe';
  const f = pose.face;
  const legA = Math.sin(pose.walk) * 22;
  const bob = Math.abs(Math.sin(pose.walk)) * -6;
  const by = bob - pose.breath * 2;
  const armSwing = Math.sin(pose.walk) * 15;
  const skin = K.skin;
  const hemW = look.outfit === 'robe' ? 62 : 48;
  const nearX = 40 * (f >= 0 ? 1 : -1);
  const arm = (side: 1 | -1, ang: number, near: boolean) => {
    const sx = side * 40 + f * 4;
    const d = rrect(-13, 0, 26, 92, 13);
    return (
      <g transform={`translate(${sx} ${-188 + by}) rotate(${side * -ang + (near ? armSwing : -armSwing)})`} opacity={near ? 1 : 0.96}>
        <Shape d={d} fill={look.outfit === 'robe' ? robe.fill : robe.top} seed={seed + (near ? 3 : 4)} />
        <Shape d={ellipse(0, 96, 13, 13)} fill={skin} seed={seed + 5} />
      </g>
    );
  };
  const body =
    look.outfit === 'robe'
      ? `M-44 ${-198 + by} Q0 ${-212 + by} 44 ${-198 + by} L${hemW} ${-26} Q0 ${-14} ${-hemW} ${-26} Z`
      : `M-42 ${-198 + by} Q0 ${-210 + by} 42 ${-198 + by} L46 ${-104 + by} Q0 ${-96 + by} -46 ${-104 + by} Z`;
  const pants = `M-42 ${-108 + by} L42 ${-108 + by} L40 ${-30} L4 ${-30} L0 ${-70 + by} L-4 ${-30} L-40 ${-30} Z`;
  const hx = f * 7;
  const hy = -262 + by;
  return (
    <g transform={`scale(${s}) scale(1 ${1 + pose.breath * 0.01})`}>
      {/* soft ground shadow (ink 12 %) */}
      <path d={ellipse(0, 0, 58, 10)} fill={K.ink} opacity={0.12} />
      {/* far arm behind the body */}
      {arm(f >= 0 ? -1 : 1, pose.armF, false)}
      {/* legs */}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 16} ${-62}) rotate(${side * legA})`}>
          <Shape d={rrect(-11, 0, 22, 58, 10)} fill={look.outfit === 'robe' ? K.skin : robe.bottom} seed={seed + 7 + side} />
          <Shape d={ellipse(side * 4 + f * 6, 60, 17, 8)} fill={K.shoe} seed={seed + 9 + side} />
        </g>
      ))}
      {look.outfit === 'casual' && <Shape d={pants} fill={robe.bottom} seed={seed + 11} />}
      <Shape d={body} fill={look.outfit === 'robe' ? robe.fill : robe.top} seed={seed + 12} />
      {look.outfit === 'robe' && <Ink d={hatch(seed, -38, 38, -190, -40, 14)} w={1.6} color={robe.hatch} opacity={0.55} seed={seed + 13} />}
      {look.outfit === 'robe' && robe.belt && <Shape d={rrect(-46, -132 + by, 92, 12, 5)} fill={robe.belt} seed={seed + 14} />}
      {/* head */}
      <g transform={`rotate(${pose.tilt} 0 ${hy + 40})`}>
        {head === 'hijab' && <Shape d={`M${hx - 66} ${hy + 70} Q${hx - 72} ${hy - 70} ${hx} ${hy - 68} Q${hx + 72} ${hy - 70} ${hx + 66} ${hy + 70} Z`} fill={K.hijab[look.color] ?? '#5D7FB0'} seed={seed + 15} />}
        <Shape d={ellipse(hx, hy, 50, 54)} fill={skin} seed={seed + 16} />
        {beard && <Shape d={`M${hx - 47} ${hy + 4} Q${hx - 44} ${hy + 72} ${hx} ${hy + 76} Q${hx + 44} ${hy + 72} ${hx + 47} ${hy + 4} Q${hx + 30} ${hy + 30} ${hx} ${hy + 26} Q${hx - 30} ${hy + 30} ${hx - 47} ${hy + 4} Z`} fill={look.kind === 'elder' ? '#E9E4DC' : K.beard} seed={seed + 17} />}
        {/* face: closed happy eyes (or a blink), big smile with teeth */}
        {[-1, 1].map((e) => (
          <Ink key={e} d={pose.blink ? `M${hx + e * 18 + f * 12 - 8} ${hy - 8} L${hx + e * 18 + f * 12 + 8} ${hy - 8}` : `M${hx + e * 18 + f * 12 - 9} ${hy - 6} Q${hx + e * 18 + f * 12} ${hy - 16} ${hx + e * 18 + f * 12 + 9} ${hy - 6}`} w={4} seed={seed + 18 + e} />
        ))}
        <Shape d={`M${hx + f * 10 - 22} ${hy + 12} Q${hx + f * 10} ${hy + 14 + 26 * (0.65 + 0.35 * pose.talk)} ${hx + f * 10 + 22} ${hy + 12} Z`} fill={K.mouth} w={3.5} seed={seed + 20} />
        <path d={`M${hx + f * 10 - 17} ${hy + 14} L${hx + f * 10 + 17} ${hy + 14} L${hx + f * 10 + 14} ${hy + 20} L${hx + f * 10 - 14} ${hy + 20} Z`} fill="#FFFFFF" />
        <path d={ellipse(hx + f * 26 + 24, hy + 6, 7, 5)} fill="#E89A7A" opacity={0.5} />
        {head === 'kufi' && <Shape d={`M${hx - 42} ${hy - 28} Q${hx} ${hy - 78} ${hx + 42} ${hy - 28} Z`} fill="#FFFFFF" seed={seed + 21} />}
        {head === 'turban' && (
          <>
            <Shape d={ellipse(hx, hy - 40, 52, 26)} fill={K.turban} seed={seed + 22} />
            <Ink d={`M${hx - 44} ${hy - 44} Q${hx} ${hy - 30} ${hx + 44} ${hy - 48}`} w={2.5} seed={seed + 23} />
          </>
        )}
        {head === 'cap' && <Shape d={`M${hx - 48} ${hy - 22} Q${hx} ${hy - 82} ${hx + 48} ${hy - 22} L${hx + 48 + f * 30} ${hy - 18} Z`} fill={robe.bottom} seed={seed + 24} />}
        {head === 'hair' && <Shape d={`M${hx - 50} ${hy - 6} Q${hx - 50} ${hy - 62} ${hx} ${hy - 58} Q${hx + 52} ${hy - 62} ${hx + 50} ${hy - 6} Q${hx + 20} ${hy - 30} ${hx - 50} ${hy - 6} Z`} fill={K.beard} seed={seed + 25} />}
      </g>
      {/* near arm in front */}
      {arm(f >= 0 ? 1 : -1, pose.armN, true)}
      {void nearX}
    </g>
  );
};

/* ───────────────────────────── world props ───────────────────────────── */

const Palm = ({ seed }: { seed: number }) => {
  const trunk = 'M-10 0 Q-4 -150 18 -300 L32 -298 Q12 -150 12 0 Z';
  const fr = [-150, -110, -60, -20, 30, 70, 120].map((a, i) => {
    const r = (a * Math.PI) / 180;
    const x = 25 + Math.cos(r - Math.PI / 2) * 150;
    const y = -300 + Math.sin(r - Math.PI / 2) * 60 + 30;
    return `M25 -300 Q${(25 + x) / 2 + (i % 2 ? 15 : -15)} ${-340 + (i % 3) * 8} ${x} ${y} Q${(25 + x) / 2} ${-310} 25 -300 Z`;
  });
  return (
    <>
      <Shape d={trunk} fill={K.trunk} seed={seed} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Ink key={i} d={`M${-6 + i * 4} ${-40 - i * 45} L${12 + i * 4} ${-44 - i * 45}`} w={2.5} seed={seed + i} />
      ))}
      {fr.map((d, i) => (
        <Shape key={i} d={d} fill={i % 2 ? K.leaf : K.leafDark} seed={seed + 10 + i} />
      ))}
    </>
  );
};

const Bush = ({ seed, w = 110 }: { seed: number; w?: number }) => <Shape d={`M${-w / 2} 0 Q${-w / 2 - 10} ${-w * 0.45} ${-w / 4} ${-w * 0.42} Q${-w / 8} ${-w * 0.75} ${w / 8} ${-w * 0.55} Q${w / 2} ${-w * 0.7} ${w / 2} 0 Z`} fill={K.leaf} seed={seed} />;
const Stone = ({ seed, w = 70 }: { seed: number; w?: number }) => (
  <>
    <Shape d={`M${-w / 2} 0 Q${-w / 2} ${-w * 0.42} 0 ${-w * 0.45} Q${w / 2} ${-w * 0.42} ${w / 2} 0 Z`} fill={K.stone} seed={seed} />
    <path d={ellipse(-w * 0.12, -w * 0.28, w * 0.14, w * 0.06)} fill={K.stoneHi} />
  </>
);
const Sprout = ({ seed }: { seed: number }) => (
  <>
    <Ink d="M0 0 Q2 -22 0 -40" w={3} seed={seed} />
    <Shape d="M0 -30 Q-24 -46 -26 -26 Q-10 -20 0 -30 Z" fill={K.leaf} w={3} seed={seed + 1} />
    <Shape d="M0 -36 Q22 -54 26 -32 Q12 -26 0 -36 Z" fill={K.leaf} w={3} seed={seed + 2} />
  </>
);
const House = ({ seed, w = 260 }: { seed: number; w?: number }) => (
  <>
    <Shape d={rrect(-w / 2, -w * 0.82, w, w * 0.82, 6)} fill="#FBF6EC" seed={seed} />
    <Shape d={`M${-w * 0.12} 0 L${-w * 0.12} ${-w * 0.3} Q0 ${-w * 0.45} ${w * 0.12} ${-w * 0.3} L${w * 0.12} 0 Z`} fill="#3E6DB0" seed={seed + 1} />
    <Shape d={rrect(-w * 0.38, -w * 0.62, w * 0.16, w * 0.16, 4)} fill="#7FB8D8" seed={seed + 2} />
    <Shape d={rrect(w * 0.22, -w * 0.62, w * 0.16, w * 0.16, 4)} fill="#7FB8D8" seed={seed + 3} />
    <Shape d={rrect(-w / 2 - 8, -w * 0.86, w + 16, 14, 4)} fill={K.wallCap} seed={seed + 4} />
  </>
);
const Stall = ({ seed, w = 300 }: { seed: number; w?: number }) => (
  <>
    <Shape d={rrect(-w / 2, -w * 0.38, w, w * 0.38, 6)} fill="#C98A52" seed={seed} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Shape key={i} d={`M${-w / 2 + (i * w) / 6} ${-w * 0.95} L${-w / 2 + ((i + 1) * w) / 6} ${-w * 0.95} L${-w / 2 + ((i + 1) * w) / 6} ${-w * 0.78} Q${-w / 2 + ((i + 0.5) * w) / 6} ${-w * 0.7} ${-w / 2 + (i * w) / 6} ${-w * 0.78} Z`} fill={i % 2 ? '#FFFFFF' : K.accentSoft} seed={seed + i} />
    ))}
    <Ink d={`M${-w / 2 + 8} ${-w * 0.95} L${-w / 2 + 8} ${-w * 0.38} M${w / 2 - 8} ${-w * 0.95} L${w / 2 - 8} ${-w * 0.38}`} w={5} seed={seed + 9} />
    {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
      <Shape key={i} d={ellipse(x * w, -w * 0.44, w * 0.07, w * 0.06)} fill={['#E8B23A', '#D06643', '#5DAA5A', '#F28C3B'][i]!} seed={seed + 20 + i} />
    ))}
  </>
);
const Wall = ({ seed, w = 420 }: { seed: number; w?: number }) => (
  <>
    <Shape d={rrect(-w / 2, -150, w, 150, 2)} fill={K.wall} seed={seed} />
    {Array.from({ length: 5 }, (_, r) => (
      <Ink key={r} d={`M${-w / 2} ${-30 * (r + 1)} L${w / 2} ${-30 * (r + 1)}`} w={2} seed={seed + r} opacity={0.6} />
    ))}
    {Array.from({ length: Math.floor(w / 60) * 5 }, (_, i) => {
      const r = i % 5;
      const c = Math.floor(i / 5);
      const x = -w / 2 + c * 60 + (r % 2 ? 30 : 0);
      return x > -w / 2 + 4 && x < w / 2 - 4 ? <Ink key={`v${i}`} d={`M${x} ${-30 * r} L${x} ${-30 * (r + 1)}`} w={2} seed={seed + i} opacity={0.6} /> : null;
    })}
    <Shape d={rrect(-w / 2 - 6, -164, w + 12, 18, 4)} fill={K.wallCap} seed={seed + 40} />
  </>
);
const Coins = ({ seed }: { seed: number }) => (
  <>
    {[[-30, 0], [0, 0], [30, 0], [-15, -22], [15, -22], [0, -44]].map(([x, y], i) => (
      <Shape key={i} d={ellipse(x!, y! - 14, 18, 14)} fill="#F2C14E" seed={seed + i} w={3.5} />
    ))}
  </>
);
const Pile = ({ seed, color = '#A5582F' }: { seed: number; color?: string }) => (
  <>
    {[0, 1, 2, 3].flatMap((row) =>
      Array.from({ length: 4 - row }, (_, i) => <Shape key={`${row}-${i}`} d={ellipse(-((3 - row) * 22) / 2 + i * 22, -14 - row * 19, 12, 11)} fill={color} w={2.8} seed={seed + row * 5 + i} />),
    )}
  </>
);
const BoxProp = ({ seed }: { seed: number }) => (
  <>
    <Shape d="M-60 0 L-60 -90 L60 -90 L60 0 Z" fill="#D9A866" seed={seed} />
    <Shape d="M-60 -90 L-40 -112 L80 -112 L60 -90 Z" fill="#E8BE82" seed={seed + 1} />
    <Shape d="M60 0 L80 -22 L80 -112 L60 -90 Z" fill="#C08F52" seed={seed + 2} />
    <Ink d="M-10 -90 L-10 -40 M10 -90 L10 -40" w={3} seed={seed + 3} />
  </>
);
const Scooter = ({ seed }: { seed: number }) => (
  <>
    <Shape d={ellipse(-70, -32, 32, 32)} fill="#4A4F5A" seed={seed} />
    <Shape d={ellipse(80, -32, 32, 32)} fill="#4A4F5A" seed={seed + 1} />
    <Shape d="M-80 -60 Q-60 -110 0 -100 L60 -100 L90 -60 Q20 -40 -80 -60 Z" fill="#D06643" seed={seed + 2} />
    <Shape d={rrect(-110, -170, 80, 70, 8)} fill="#E8B23A" seed={seed + 3} />
    <Ink d="M70 -100 L60 -170 L40 -175" w={6} seed={seed + 4} />
  </>
);
const Tree = ({ seed }: { seed: number }) => (
  <>
    <Shape d="M-14 0 Q-8 -80 -10 -150 L10 -150 Q8 -80 14 0 Z" fill={K.trunk} seed={seed} />
    <Shape d="M-100 -150 Q-120 -260 -20 -270 Q20 -330 80 -270 Q140 -230 100 -150 Q0 -120 -100 -150 Z" fill={K.leaf} seed={seed + 1} />
  </>
);
const Car = ({ seed }: { seed: number }) => (
  <>
    <Shape d="M-150 -40 L-150 -90 Q-120 -100 -90 -100 L-60 -150 L60 -150 L100 -100 Q150 -98 150 -70 L150 -40 Z" fill="#5D8FC9" seed={seed} />
    <Shape d="M-50 -140 L50 -140 L80 -104 L-80 -104 Z" fill="#CFE8F5" seed={seed + 1} />
    <Shape d={ellipse(-90, -36, 30, 30)} fill="#3B3F48" seed={seed + 2} />
    <Shape d={ellipse(90, -36, 30, 30)} fill="#3B3F48" seed={seed + 3} />
  </>
);
const Mountain = ({ seed }: { seed: number }) => <Shape d="M-300 0 L-120 -220 L-40 -150 L60 -260 L300 0 Z" fill="#D8C9A8" seed={seed} w={3.5} />;

export const PROP_KINDS = ['palm', 'bush', 'stone', 'sprout', 'house', 'stall', 'wall', 'coins', 'pile', 'box', 'scooter', 'tree', 'car', 'mountain'] as const;
export type PropKind = (typeof PROP_KINDS)[number];

export const Prop = ({ kind, seed }: { kind: PropKind; seed: number }): ReactNode => {
  switch (kind) {
    case 'palm':
      return <Palm seed={seed} />;
    case 'bush':
      return <Bush seed={seed} />;
    case 'stone':
      return <Stone seed={seed} w={50 + random(`st${seed}`) * 50} />;
    case 'sprout':
      return <Sprout seed={seed} />;
    case 'house':
      return <House seed={seed} />;
    case 'stall':
      return <Stall seed={seed} />;
    case 'wall':
      return <Wall seed={seed} />;
    case 'coins':
      return <Coins seed={seed} />;
    case 'pile':
      return <Pile seed={seed} />;
    case 'box':
      return <BoxProp seed={seed} />;
    case 'scooter':
      return <Scooter seed={seed} />;
    case 'tree':
      return <Tree seed={seed} />;
    case 'car':
      return <Car seed={seed} />;
    case 'mountain':
      return <Mountain seed={seed} />;
  }
};

/** the hero cloud (with warm glow) */
export const Cloud = ({ seed }: { seed: number }) => (
  <>
    <path d={ellipse(0, -40, 190, 90)} fill={K.cloudGlow} opacity={0.5} />
    <Shape d="M-150 0 Q-190 -10 -170 -50 Q-160 -95 -100 -80 Q-80 -140 -10 -120 Q40 -170 90 -110 Q160 -120 160 -60 Q200 -30 160 0 Z" fill={K.cloud} seed={seed} />
  </>
);
export const Sun = () => (
  <>
    <circle r={150} fill={K.sunHalo} opacity={0.5} />
    <circle r={95} fill={K.sun} />
  </>
);
