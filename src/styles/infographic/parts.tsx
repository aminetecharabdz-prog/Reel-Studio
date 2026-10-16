/** infographic building blocks: bloom, glass sphere (SVG, exporter-safe), rolling counter, text lines, symbols. */
import type { CSSProperties, ReactNode } from 'react';
import { CAT, C, grad, type Cat } from './tokens';

let gid = 0;
const uidFor = (p: string) => `${p}${++gid}`;

/** the soft blue bloom (centred radial, follows the active object) */
export const Bloom = ({ x, y, r, teal = 0, k = 1 }: { x: number; y: number; r: number; teal?: number; k?: number }) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      opacity: k,
      background: `radial-gradient(circle, rgba(${Math.round(10 + teal * 1)},${Math.round(61 - teal * 3)},${Math.round(145 - teal * 60)},0.62) 0%, rgba(3,18,30,0.55) 32%, rgba(1,4,7,0.2) 52%, rgba(0,0,0,0) 70%)`,
    }}
  />
);

/** a glossy glass sphere: body gradient + inner reflection + specular + rim light */
export const Glass = ({ x, y, r, cat = 'cyan', dim = 0, opacity = 1 }: { x: number; y: number; r: number; cat?: Cat; dim?: number; opacity?: number }) => {
  const id = uidFor('gl');
  const c = CAT[cat];
  return (
    <svg width={r * 2.6} height={r * 2.6} viewBox="-130 -130 260 260" style={{ position: 'absolute', left: x - r * 1.3, top: y - r * 1.3, overflow: 'visible', opacity }}>
      <defs>
        <radialGradient id={`${id}b`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor={c[0]} />
          <stop offset="0.55" stopColor={c[1]} />
          <stop offset="1" stopColor={c[2]} />
        </radialGradient>
        <radialGradient id={`${id}g`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor={c[1]} stopOpacity={0.45} />
          <stop offset="1" stopColor={c[1]} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}s`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity={0.75} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={128} fill={`url(#${id}g)`} />
      <circle r={100} fill={`url(#${id}b)`} />
      <ellipse cx={18} cy={34} rx={56} ry={38} fill="#fff" opacity={0.12} />
      <ellipse cx={-38} cy={-46} rx={40} ry={26} fill={`url(#${id}s)`} transform="rotate(-30 -38 -46)" />
      <circle r={99} fill="none" stroke="#C9F4FF" strokeOpacity={0.5} strokeWidth={2.4} />
      {dim > 0 && <circle r={101} fill="#000" opacity={dim * 0.72} />}
    </svg>
  );
};

/** gradient text with padding so glyphs/glow are never clipped */
export const GradText = ({ cat, children, style }: { cat: Cat; children: ReactNode; style?: CSSProperties }) => (
  <span style={{ backgroundImage: grad(cat), WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', padding: '0.12em 0.06em', margin: '-0.12em -0.06em', display: 'inline-block', ...style }}>{children}</span>
);

/** mechanical rolling counter (Latin digits, small %), p = 0..1 progress of the roll */
export const Counter = ({ value, decimals = 0, unit = '', p, size, cat = 'cyan', glow = 0.45 }: { value: number; decimals?: number; unit?: string; p: number; size: number; cat?: Cat; glow?: number }) => {
  const str = Math.abs(value).toFixed(decimals);
  const neg = value < 0;
  const chars = [...str];
  const nd = chars.filter((ch) => /\d/.test(ch)).length;
  let j = -1;
  const h = size * 1.08;
  const moving = p > 0.02 && p < 0.92;
  return (
    <div dir="ltr" style={{ display: 'inline-flex', alignItems: 'baseline', fontFamily: C.font, fontWeight: 700, fontSize: size, lineHeight: 1, fontVariantNumeric: 'tabular-nums', filter: `drop-shadow(0 0 ${size * 0.13}px ${CAT[cat][1]}${Math.round(glow * 255).toString(16).padStart(2, '0')})`, unicodeBidi: 'isolate' }}>
      {neg && <GradText cat={cat}>−</GradText>}
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) return <GradText key={i} cat={cat}>{ch}</GradText>;
        j++;
        const d = Number(ch);
        const turns = j; // the rightmost digits spin the most
        const pos = Math.max(0, Math.min(1, p)) * (turns * 10 + d) + (nd - 1 - j) * 0;
        const lo = Math.floor(pos);
        const frac = pos - lo;
        return (
          // rolling without a clipping mask (the exporter ignores overflow on text): the leaving digit slides up and
          // fades, the arriving one rises into place
          <span key={i} style={{ position: 'relative', display: 'inline-block', height: h, width: '0.62em', filter: moving ? `blur(${size * 0.012}px)` : undefined }}>
            <GradText cat={cat} style={{ position: 'absolute', left: 0, right: 0, top: -frac * h * 0.6, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - frac }}>{lo % 10}</GradText>
            {frac > 0.001 && <GradText cat={cat} style={{ position: 'absolute', left: 0, right: 0, top: (1 - frac) * h * 0.6, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: frac }}>{(lo + 1) % 10}</GradText>}
          </span>
        );
      })}
      {unit && (
        <span style={{ fontSize: unit === '%' ? size * 0.45 : size * 0.36, marginInlineStart: size * 0.04, opacity: Math.min(1, p * 4) }}>
          <GradText cat={cat}>{unit}</GradText>
        </span>
      )}
    </div>
  );
};

/** a text line entering from below with blur (easeOutExpo), leaving with blur */
export const lineStyle = (k: number, out: number, u: number): CSSProperties => ({
  opacity: k * (1 - out),
  transform: `translateY(${(1 - k) * 22 * u}px)`,
  filter: k < 1 || out > 0 ? `blur(${(1 - k) * 8 * u + out * 6 * u}px)` : undefined,
});

/** filled symbol glyphs (24×24) for the spotlight beat */
export const SYMBOLS: Record<string, string> = {
  drop: 'M12 2.5C12 2.5 5 10.2 5 14.6A7 7 0 0 0 19 14.6C19 10.2 12 2.5 12 2.5Z',
  coin: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z',
  person: 'M12 3a4 4 0 1 1 0 8a4 4 0 0 1 0-8ZM4 21c.8-4.6 4-7 8-7s7.2 2.4 8 7Z',
  leaf: 'M5 19C4 11 9 4.5 20 4C20.4 14.8 14 20 5 19Z',
  house: 'M12 3L21 10.5V21H3V10.5Z',
  bolt: 'M13.5 2L5 13.5H11L10 22L19 10H13Z',
  heart: 'M12 21S3 15.5 3 9.2A4.7 4.7 0 0 1 12 6.6A4.7 4.7 0 0 1 21 9.2C21 15.5 12 21 12 21Z',
  star: 'M12 2.8L14.8 8.6L21.2 9.4L16.5 13.8L17.7 20.1L12 17L6.3 20.1L7.5 13.8L2.8 9.4L9.2 8.6Z',
  phone: 'M7 2H17A2 2 0 0 1 19 4V20A2 2 0 0 1 17 22H7A2 2 0 0 1 5 20V4A2 2 0 0 1 7 2Z',
  car: 'M3 16V12.5L5.5 7H18.5L21 12.5V16Z',
  box: 'M12 2.8L20.5 7.2V16.8L12 21.2L3.5 16.8V7.2Z',
  clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z',
  tooth: 'M7 3.5C4.5 3.5 3.5 5.7 3.8 8C4.2 11 5.3 12.5 5.8 15.5C6.2 18 6.8 20.5 8 20.5C9.5 20.5 9.5 16 12 16S14.5 20.5 16 20.5C17.2 20.5 17.8 18 18.2 15.5C18.7 12.5 19.8 11 20.2 8C20.5 5.7 19.5 3.5 17 3.5C15 3.5 14 4.7 12 4.7S9 3.5 7 3.5Z',
};
const ALIAS: Record<string, string> = { money: 'coin', tag: 'coin', card: 'coin', gem: 'star', user: 'person', headset: 'person', home: 'house', pin: 'house', truck: 'box', cart: 'box', gift: 'box', food: 'heart', cup: 'drop', chart: 'bolt', rocket: 'bolt', fire: 'bolt', calendar: 'clock', sparkles: 'star', check: 'star', shield: 'star', globe: 'coin', camera: 'phone', chat: 'phone', book: 'box', dumbbell: 'bolt', lock: 'box' };
export const symbolFor = (icon: string) => SYMBOLS[icon] ?? SYMBOLS[ALIAS[icon] ?? 'star']!;

export const Symbol = ({ icon, x, y, size, k = 1 }: { icon: string; x: number; y: number; size: number; k?: number }) => {
  const id = uidFor('sy');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', opacity: k, transform: `scale(${0.85 + 0.15 * k})` }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={CAT.cyan[0]} />
          <stop offset="0.55" stopColor={CAT.cyan[1]} />
          <stop offset="1" stopColor={CAT.cyan[2]} />
        </linearGradient>
      </defs>
      <path d={symbolFor(icon)} fill={`url(#${id})`} />
      <path d={symbolFor(icon)} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={0.35} strokeLinecap="round" transform="translate(12 12) scale(0.8) translate(-12 -12)" />
    </svg>
  );
};
