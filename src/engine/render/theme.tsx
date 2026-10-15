import { createContext, useContext } from 'react';
import type { ColorRole, Style } from '../schema';
import { stackOf } from '../fonts';

export type Tone = 'light' | 'dark' | 'accent';
export type Theme = {
  W: number;
  H: number;
  u: number; // 1px at 1080 short side
  fps: number;
  style: Style;
  tone: Tone;
  digits: 'western' | 'eastern';
  font: (role: 'display' | 'serif' | 'body' | 'impact') => { family: string; weight: number; italic: boolean };
  color: (role: ColorRole) => string;
  safe: { x0: number; x1: number; y0: number; y1: number };
};

const hexLum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
export const contrast = (a: string, b: string) => {
  const x = hexLum(a), y = hexLum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
export const onColor = (bg: string) => (contrast('#FFFFFF', bg) >= contrast('#0B0B0F', bg) ? '#FFFFFF' : '#0B0B0F');
export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export const mixHex = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) + (((B >> s) & 255) - ((A >> s) & 255)) * t);
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')}`;
};

export const bgColorFor = (style: Style, tone: Tone, explicit?: string) => explicit ?? (tone === 'light' ? style.palette.paper : tone === 'accent' ? style.palette.accent : style.palette.dark);

export const makeTheme = (o: { W: number; H: number; fps: number; style: Style; tone: Tone; bg: string; digits: 'western' | 'eastern' }): Theme => {
  const p = o.style.palette;
  const main = contrast(p.ink, o.bg) >= 4.5 ? p.ink : contrast(p.paper, o.bg) >= 4.5 ? p.paper : onColor(o.bg);
  const muted = mixHex(main, o.bg, 0.45);
  const ensure = (c: string) => (contrast(c, o.bg) >= 3 ? c : main);
  return {
    W: o.W,
    H: o.H,
    u: Math.min(o.W, o.H) / 1080,
    fps: o.fps,
    style: o.style,
    tone: o.tone,
    digits: o.digits,
    font: (role) => {
      const f = o.style.fonts[role];
      return { family: stackOf(f), weight: f.weight, italic: f.italic };
    },
    color: (role) => {
      switch (role) {
        case 'ink': return main;
        case 'paper': return hexLum(main) < 0.3 ? p.paper : p.dark; // contrasts with the main text (boxes, chips)
        case 'accent': return ensure(p.accent);
        case 'accent2': return ensure(p.accent2);
        case 'muted': return muted;
        case 'white': return '#FFFFFF';
        case 'black': return '#0B0B0F';
      }
    },
    safe: o.W > o.H ? { x0: 0.05, x1: 0.95, y0: 0.08, y1: 0.9 } : { x0: 0.07, x1: 0.9, y0: 0.1, y1: 0.8 },
  };
};

const Ctx = createContext<Theme | null>(null);
export const ThemeProvider = Ctx.Provider;
export const useTheme = () => {
  const t = useContext(Ctx);
  if (!t) throw new Error('theme missing');
  return t;
};
