import { AbsoluteFill, Img, random } from 'remotion';
import type { Scene } from '../schema';
import { alpha, mixHex, useTheme } from './theme';

const svgUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
const spots = new Map<string, string>();
const softSpot = (col: string, a: number) => {
  const k = `${col}${a.toFixed(3)}`;
  let v = spots.get(k);
  if (!v) {
    v = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g"><stop offset="0" stop-color="${col}" stop-opacity="${a}"/><stop offset=".35" stop-color="${col}" stop-opacity="${a * 0.62}"/><stop offset=".7" stop-color="${col}" stop-opacity="${a * 0.18}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g)"/></svg>`);
    spots.set(k, v);
  }
  return v;
};

/** Scene background: base treatment + optional grid, light leak, glow, vignette. Linear gradients and blurred
 *  shapes only (the web renderer has no radial gradients / blend modes). `abs` keeps drift continuous. */
export const Background = ({ bg, base, url, abs, seed }: { bg: Scene['bg']; base: string; url: string | null; abs: number; seed: string }) => {
  const t = useTheme();
  const { W, H, u } = t;
  const c2 = bg.color2 ?? mixHex(base, t.tone === 'light' ? '#000000' : '#FFFFFF', t.tone === 'light' ? 0.05 : 0.06);
  const time = abs / t.fps;
  const glowCol = bg.glow ? t.color(bg.glow) : t.style.palette.accent;
  const layers: React.ReactNode[] = [];
  const light = t.tone === 'light';
  const R = Math.max(W, H);
  // soft light pool (blurred circle; the web renderer has no radial gradients)
  const pool = (key: string, cx: number, cy: number, r: number, col: string, a: number, blur = 140) => {
    // soft radial light as an SVG image (CSS blur filters are not supported by the in-browser exporter)
    const R2 = r / 2 + blur * u * 0.8;
    return <Img key={key} src={softSpot(col, Math.min(1, a))} style={{ position: 'absolute', left: cx - R2, top: cy - R2, width: R2 * 2, height: R2 * 2 }} />;
  };
  const drift = Math.sin(time * 0.35) * 24 * u;
  switch (bg.kind) {
    case 'gradient':
      layers.push(<AbsoluteFill key="g" style={{ backgroundImage: `linear-gradient(175deg, ${mixHex(base, '#FFFFFF', 0.08)}, ${base} 50%, ${mixHex(base, '#000000', 0.18)})` }} />);
      break;
    case 'spotlight':
      layers.push(pool('s', W / 2 + drift, H * 0.42, R * 0.75, light ? '#FFFFFF' : '#FFFFFF', light ? 0.7 : 0.075, 170));
      break;
    case 'paper':
    case 'solid':
      if (bg.kind === 'paper') layers.push(pool('p', W / 2, H * 0.45, R * 0.8, '#FFFFFF', light ? 0.55 : 0.05, 180));
      break;
    case 'split':
      layers.push(<AbsoluteFill key="sp" style={{ backgroundColor: c2, clipPath: 'polygon(0 62%, 100% 50%, 100% 100%, 0 100%)' }} />);
      break;
    case 'rays':
      for (let k = 0; k < 5; k++) {
        const a = -24 + k * 12 + Math.sin(time * 0.3 + k) * 2;
        layers.push(<div key={`r${k}`} style={{ position: 'absolute', left: W * 0.5 - 70 * u, top: -H * 0.15, width: 220 * u, height: H * 1.4, backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0), ${alpha('#FFFFFF', light ? 0.32 : 0.05)}, rgba(255,255,255,0))`, WebkitMaskImage: 'linear-gradient(180deg, #000, transparent 85%)', maskImage: 'linear-gradient(180deg, #000, transparent 85%)', transformOrigin: 'top center', transform: `rotate(${a}deg)` }} />);
      }
      break;
    case 'photo':
    case 'blur-photo':
      if (url) {
        const z = 1.08 + 0.06 * Math.min(1, time / 6);
        layers.push(<Img key="ph" src={url} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, objectFit: 'cover', transform: `scale(${z})`, filter: bg.kind === 'blur-photo' ? `blur(${36 * u}px) brightness(0.55)` : light ? 'contrast(1.04)' : 'contrast(1.12) saturate(0.9) brightness(0.82)' }} />);
        layers.push(<AbsoluteFill key="dim" style={{ backgroundColor: alpha('#000000', bg.kind === 'blur-photo' ? 0.5 : light ? 0 : 0.22) }} />);
        layers.push(<AbsoluteFill key="scrim" style={{ backgroundImage: `linear-gradient(180deg, ${alpha('#000000', 0.3)}, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, ${alpha('#000000', 0.6)})` }} />);
      }
      break;
    case 'noise-dark':
      layers.push(pool('nd', W / 2, -H * 0.05, R * 0.7, '#FFFFFF', 0.06, 160));
      break;
    default:
      break;
  }
  if (bg.grid) {
    const s = Math.round(64 * u);
    const lineCol = alpha(light ? '#000000' : '#FFFFFF', light ? 0.045 : 0.04);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><pattern id="g" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><path d="M ${s} 0 L 0 0 0 ${s}" fill="none" stroke="${lineCol}" stroke-width="${Math.max(1, 1.5 * u)}"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
    layers.push(<Img key="grid" src={svgUrl(svg)} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />);
  }
  if (bg.leak) {
    // a subtle film light sweeping across one edge (neutral warm, never a coloured blob wash)
    const side = random(`${seed}-side`) > 0.5 ? 1 : -1;
    const x = W / 2 + side * (W * 0.62 + Math.sin(time * 0.7) * 40 * u);
    const lc = bg.glow ? glowCol : '#FFE8D0';
    layers.push(pool('lk', x, H * (0.3 + 0.4 * random(`${seed}-ly`)), W * 0.8, lc, (bg.glow ? 0.42 : light ? 0.35 : 0.1) + 0.06 * Math.sin(time * 1.4), 130));
  }
  if (bg.glow && bg.kind !== 'rays') {
    layers.push(pool('gl', W / 2, H * 0.44, W * 0.62, glowCol, light ? 0.1 : 0.13, 150));
  }
  const vig = bg.vignette;
  return (
    <AbsoluteFill style={{ backgroundColor: base, overflow: 'hidden' }}>
      {layers}
      {vig && (
        <>
          <AbsoluteFill style={{ backgroundImage: `linear-gradient(180deg, ${alpha('#000000', t.tone === 'light' ? 0.035 : 0.5)} 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 72%, ${alpha('#000000', t.tone === 'light' ? 0.05 : 0.6)} 100%)` }} />
          <AbsoluteFill style={{ backgroundImage: `linear-gradient(90deg, ${alpha('#000000', t.tone === 'light' ? 0.025 : 0.4)} 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 84%, ${alpha('#000000', t.tone === 'light' ? 0.025 : 0.4)} 100%)` }} />
        </>
      )}
    </AbsoluteFill>
  );
};

export const Grain = ({ amount, frame }: { amount: number; frame: number }) => {
  const t = useTheme();
  if (amount < 0.03) return null;
  const sd = Math.floor(frame / 2) % 6;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="960"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="${sd}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 ${(amount * 0.42).toFixed(3)} 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  return <Img src={svgUrl(svg)} style={{ position: 'absolute', left: 0, top: 0, width: t.W, height: t.H }} />;
};
