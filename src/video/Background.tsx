import { AbsoluteFill, Img } from 'remotion';
import { withAlpha, mix } from '@/lib/color/contrast';
import { useTheme } from './theme';
import { random } from 'remotion';

const patternSvg = (kind: string, color: string, size: number) => {
  const s = size;
  const shapes: Record<string, string> = {
    dots: `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.07}" fill="${color}"/>`,
    grid: `<path d="M ${s} 0 L 0 0 0 ${s}" fill="none" stroke="${color}" stroke-width="${s * 0.025}"/>`,
    diagonal: `<path d="M0 ${s} L ${s} 0" stroke="${color}" stroke-width="${s * 0.05}"/>`,
    waves: `<path d="M0 ${s / 2} Q ${s / 4} ${s * 0.3} ${s / 2} ${s / 2} T ${s} ${s / 2}" fill="none" stroke="${color}" stroke-width="${s * 0.04}"/>`,
    plus: `<path d="M${s / 2} ${s * 0.38} V ${s * 0.62} M ${s * 0.38} ${s / 2} H ${s * 0.62}" stroke="${color}" stroke-width="${s * 0.04}" stroke-linecap="round"/>`,
    rings: `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.22}" fill="none" stroke="${color}" stroke-width="${s * 0.03}"/>`,
  };
  return shapes[kind] ?? shapes.dots!;
};

/** Per-scene background from the Design DNA. `absFrame` keeps drift continuous across scenes. */
export const Background = ({ index, absFrame, image }: { index: number; absFrame: number; image?: string | null }) => {
  const t = useTheme();
  const { W, H, u, dna } = t;
  const bg = t.c.bg;
  const b0 = bg[index % bg.length]!;
  const b1 = bg[(index + 1) % bg.length]!;
  const angle = Number(dna.background.params.angle ?? 160);
  const density = Number(dna.background.params.density ?? 0.6);
  const drift = absFrame / t.fps;
  const kind = dna.background.kind === 'photo-blur' && !image ? 'mesh' : dna.background.kind;
  const seed = dna.seed;

  const base = <AbsoluteFill style={{ backgroundColor: b0 }} />;
  let layer: React.ReactNode = null;
  switch (kind) {
    case 'gradient':
      layer = <AbsoluteFill style={{ backgroundImage: `linear-gradient(${angle + Math.sin(drift * 0.4) * 8}deg, ${b0} 0%, ${b1} 100%)` }} />;
      break;
    case 'mesh': {
      const blobs = [0, 1, 2].map((i) => {
        const col = i === 2 ? withAlpha(t.c.primary, t.isDark ? 0.35 : 0.22) : withAlpha(bg[(index + i + 1) % bg.length]!, 0.9);
        const r = (0.55 + 0.25 * random(`${seed}-r${i}`)) * Math.max(W, H);
        const cx = W * (0.15 + 0.7 * random(`${seed}-x${i}-${index}`)) + Math.sin(drift * 0.5 + i * 2) * 60 * u;
        const cy = H * (0.1 + 0.8 * random(`${seed}-y${i}-${index}`)) + Math.cos(drift * 0.4 + i) * 80 * u;
        return (
          <div key={i} style={{ position: 'absolute', left: cx - r / 2, top: cy - r / 2, width: r, height: r, borderRadius: '50%', backgroundColor: col, filter: `blur(${140 * u}px)` }} />
        );
      });
      layer = <AbsoluteFill style={{ overflow: 'hidden' }}>{blobs}</AbsoluteFill>;
      break;
    }
    case 'pattern': {
      const size = Math.round((70 + 60 * (1 - density)) * u);
      const col = withAlpha(t.c.text, t.isDark ? 0.09 : 0.08);
      const off = (drift * 14 * u) % size;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W + size * 2}" height="${H + size * 2}"><defs><pattern id="p" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${patternSvg(String(dna.background.params.pattern ?? 'dots'), col, size)}</pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`;
      layer = (
        <>
          <AbsoluteFill style={{ backgroundImage: `linear-gradient(${angle}deg, ${b0}, ${mix(b0, b1, 0.6)})` }} />
          <Img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} style={{ position: 'absolute', left: -size + off, top: -size + off, width: W + size * 2, height: H + size * 2 }} />
        </>
      );
      break;
    }
    case 'grain':
      layer = <AbsoluteFill style={{ backgroundImage: `linear-gradient(${angle}deg, ${b0} 10%, ${b1} 100%)` }} />;
      break;
    case '3d-room': {
      const horizon = H * 0.62;
      const floor = mix(b0, t.isDark ? '#000000' : '#ffffff', 0.25);
      const lines = Array.from({ length: 13 }, (_, i) => {
        const x = (i / 12) * W * 3 - W;
        return `<line x1="${W / 2}" y1="${horizon}" x2="${x}" y2="${H}" stroke="${withAlpha(t.c.text, 0.07)}" stroke-width="${2 * u}"/>`;
      }).join('');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${lines}</svg>`;
      layer = (
        <>
          <AbsoluteFill style={{ backgroundImage: `linear-gradient(180deg, ${b1} 0%, ${b0} 62%, ${floor} 62.2%, ${mix(floor, b0, 0.5)} 100%)` }} />
          <Img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />
        </>
      );
      break;
    }
    case 'photo-blur':
      layer = (
        <>
          <Img src={image!} style={{ position: 'absolute', left: -W * 0.1, top: -H * 0.1, width: W * 1.2, height: H * 1.2, objectFit: 'cover', filter: `blur(${50 * u}px) brightness(${t.isDark ? 0.45 : 1.1}) saturate(1.2)`, transform: `scale(${1.05 + 0.03 * Math.sin(drift * 0.3)})` }} />
          <AbsoluteFill style={{ backgroundColor: withAlpha(b0, 0.55) }} />
        </>
      );
      break;
    default:
      break;
  }
  return (
    <AbsoluteFill>
      {base}
      {layer}
      {/* soft top/bottom vignette for depth (linear only — radial gradients are not supported by the web renderer) */}
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(180deg, ${withAlpha(t.isDark ? '#000000' : b0, t.isDark ? 0.28 : 0)} 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, ${withAlpha(t.isDark ? '#000000' : mix(b0, t.c.primary, 0.08), t.isDark ? 0.32 : 0.35)} 100%)` }} />
    </AbsoluteFill>
  );
};

/** Film grain overlay (deterministic SVG turbulence; seed changes every 2 frames for subtle life). */
export const Grain = ({ amount, frame }: { amount: number; frame: number }) => {
  const t = useTheme();
  if (amount <= 0.02) return null;
  const seed = Math.floor(frame / 2) % 8;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="960"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 ${(amount * 0.35).toFixed(3)} 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  return <Img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} style={{ position: 'absolute', left: 0, top: 0, width: t.W, height: t.H }} />;
};

/**
 * Per-scene background treatment layered over the DNA background (QUALITY_BAR §MUST 4): the same palette,
 * different composition — spotlight, colour panel, sun-rays, room, blueprint grid, duotone diagonal.
 * Linear gradients / solid shapes / inline SVG only (web-renderer subset).
 */
export const Treatment = ({ kind, absFrame, seed }: { kind: string; absFrame: number; seed: number }) => {
  const t = useTheme();
  const { W, H, u } = t;
  const p = t.c.primary;
  const a = t.c.accent;
  const b0 = t.c.bg[0]!;
  const drift = absFrame / t.fps;
  switch (kind) {
    case 'spotlight': {
      const cx = W / 2 + Math.sin(drift * 0.3) * 30 * u;
      const cy = H * 0.36;
      return (
        <AbsoluteFill>
          {[1.25, 1.0, 0.78, 0.58].map((k, i) => (
            <div key={i} style={{ position: 'absolute', left: cx - (W * k) / 2, top: cy - (W * k) / 2, width: W * k, height: W * k, borderRadius: '50%', backgroundColor: t.isDark ? withAlpha(mix(p, '#FFFFFF', 0.3), 0.07 + i * 0.03) : withAlpha('#FFFFFF', 0.16 + i * 0.1) }} />
          ))}
          <div style={{ position: 'absolute', left: 0, top: H * 0.66, width: W, height: H * 0.34, backgroundImage: `linear-gradient(180deg, ${withAlpha(mix(b0, p, 0.25), 0)} 0%, ${withAlpha(mix(b0, p, t.isDark ? 0.18 : 0.14), 1)} 30%)` }} />
        </AbsoluteFill>
      );
    }
    case 'split': {
      const y = H * (0.5 + 0.015 * Math.sin(drift * 0.6));
      const col = t.isDark ? mix(b0, p, 0.22) : mix(b0, p, 0.16);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><path d="M0 ${y} C ${W * 0.3} ${y - 90 * u} ${W * 0.7} ${y + 90 * u} ${W} ${y - 20 * u} L ${W} ${H} L 0 ${H} Z" fill="${col}"/><path d="M0 ${y} C ${W * 0.3} ${y - 90 * u} ${W * 0.7} ${y + 90 * u} ${W} ${y - 20 * u}" stroke="${withAlpha(a, 0.8)}" stroke-width="${8 * u}" fill="none"/></svg>`;
      return <Img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />;
    }
    case 'rays': {
      const n = 18;
      const cx = W / 2;
      const cy = H * 0.38;
      const R = H * 1.2;
      const rot = drift * 6 + (seed % 30);
      let d = '';
      for (let i = 0; i < n; i++) {
        const a0 = ((i * 2) / (n * 2)) * Math.PI * 2;
        const a1 = ((i * 2 + 1) / (n * 2)) * Math.PI * 2;
        d += `M${cx} ${cy} L${cx + Math.cos(a0) * R} ${cy + Math.sin(a0) * R} L${cx + Math.cos(a1) * R} ${cy + Math.sin(a1) * R} Z `;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><path d="${d}" fill="${withAlpha(t.isDark ? mix(p, '#FFFFFF', 0.2) : p, t.isDark ? 0.1 : 0.08)}" transform="rotate(${rot.toFixed(2)} ${cx} ${cy})"/></svg>`;
      return <Img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />;
    }
    case 'room': {
      const horizon = H * 0.64;
      const wall = t.isDark ? mix(b0, p, 0.12) : mix(b0, '#FFFFFF', 0.35);
      const floor = t.isDark ? mix(b0, '#000000', 0.25) : mix(b0, p, 0.14);
      const lines = Array.from({ length: 9 }, (_, i) => `<line x1="${W / 2}" y1="${horizon - H * 0.1}" x2="${(i / 8) * W * 2.4 - W * 0.7}" y2="${H}" stroke="${withAlpha(t.c.text, 0.06)}" stroke-width="${3 * u}"/>`).join('');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${horizon}" fill="${wall}"/><rect y="${horizon}" width="${W}" height="${H - horizon}" fill="${floor}"/><rect x="${W * 0.62}" y="${H * 0.1}" width="${W * 0.26}" height="${H * 0.2}" rx="${16 * u}" fill="${withAlpha(a, 0.16)}"/><rect x="${W * 0.1}" y="${H * 0.14}" width="${W * 0.18}" height="${H * 0.12}" rx="${12 * u}" fill="${withAlpha(p, 0.12)}"/>${lines}</svg>`;
      return <Img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />;
    }
    case 'grid': {
      const s = 90 * u;
      const off = (drift * 10 * u) % s;
      const col = withAlpha(t.isDark ? mix(p, '#FFFFFF', 0.4) : p, t.isDark ? 0.14 : 0.1);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W + s}" height="${H + s}"><defs><pattern id="g" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><path d="M ${s} 0 L 0 0 0 ${s}" fill="none" stroke="${col}" stroke-width="${2 * u}"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
      return <Img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} style={{ position: 'absolute', left: -off, top: -off, width: W + s, height: H + s }} />;
    }
    case 'duotone':
      return <AbsoluteFill style={{ backgroundImage: `linear-gradient(${155 + Math.sin(drift * 0.3) * 4}deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 54%, ${withAlpha(t.isDark ? mix(p, b0, 0.5) : mix(b0, p, 0.22), 1)} 54.2%, ${withAlpha(t.isDark ? mix(a, b0, 0.6) : mix(b0, a, 0.22), 1)} 100%)` }} />;
    case 'deep':
      return <AbsoluteFill style={{ backgroundImage: `linear-gradient(180deg, ${withAlpha(mix(b0, p, 0.18), 1)} 0%, ${withAlpha(mix(b0, a, 0.12), 1)} 100%)` }} />;
    default:
      return null;
  }
};
