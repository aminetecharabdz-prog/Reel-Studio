import { Fragment, type CSSProperties } from 'react';
import { useCurrentFrame } from 'remotion';
import type { CLayer } from '../compile';
import type { TextL } from '../schema';
import { detectDir, groupRuns, toDigits } from '../text';
import { alpha, onColor, useTheme } from './theme';
import { clamp01, enter, exitP, popSpring } from './anim';
import { measure } from './measure';

const SERIF_K = 1.3;
const SIZE: Record<TextL['size'], number> = { xs: 44, s: 64, m: 92, l: 128, xl: 172, xxl: 230, mega: 310 };

export const TextLayerView = ({ l }: { l: CLayer & TextL }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const { W, H, u } = t;
  const feel = t.style.motion;
  const base = t.font(l.role);
  const serif = t.font('serif');
  const color = t.color(l.color);
  const accent = t.color('accent');
  const words = l.words ?? [];
  const lines = words.map((ln) => ln.map((w) => ({ ...w, t: toDigits(w.t, t.digits) })));

  // box (clamped to the safe area)
  const sx0 = t.safe.x0 * W, sx1 = t.safe.x1 * W;
  const boxW = Math.min(l.w * W, sx1 - sx0);
  const cx = Math.max(sx0 + boxW / 2, Math.min(sx1 - boxW / 2, l.x * W));
  // font size: preset, shrunk until every AI line fits the box width
  let size = SIZE[l.size] * u;
  const wordW = (w: { t: string; em?: string }, s: number) => {
    const isSerif = w.em === 'serif';
    const f = isSerif ? serif : base;
    const k = w.em === 'big' ? 1.4 : isSerif ? SERIF_K : 1;
    return measure(w.t, f.family, f.weight, s * k, isSerif ? f.italic : base.italic) + (w.em === 'box' || w.em === 'highlight' ? s * 0.56 : 0);
  };
  const anyEm = lines.some((ln) => ln.some((w) => w.em && w.em !== 'ghost'));
  const ls = lines.map((ln) => (l.hier !== false && anyEm && lines.length > 1 && !ln.some((w) => w.em && w.em !== 'ghost') ? 0.5 : 1));
  for (let guard = 0; guard < 30; guard++) {
    const widest = Math.max(...lines.map((ln, li) => ln.reduce((a, w, i) => a + wordW(w, size * ls[li]!) + (i ? size * ls[li]! * 0.26 : 0), 0)));
    const tall = ls.reduce((a, k) => a + k, 0) * size * 1.42;
    if (widest <= boxW && tall <= H * 0.62) break;
    size *= 0.94;
  }
  const lh = 1.28;
  const lineH = (li: number) => { const ln = lines[li]!; const has = (e: string) => ln.some((w) => w.em === e); return size * ls[li]! * lh * (has('big') ? 1.45 : has('serif') ? 1.42 : has('box') || has('highlight') ? 1.16 : 1) * (ls[li]! < 1 ? 1.12 : 1); };
  const totalH = lines.reduce((a, _, li) => a + lineH(li), 0);
  const cy = Math.max(t.safe.y0 * H + totalH / 2, Math.min(t.safe.y1 * H - totalH / 2, l.y * H));
  const out = exitP(frame, l.outF, t.fps);
  if (out <= 0) return null;

  const sizeBase = size;
  const wordView = (w: { t: string; em?: string; inF: number }, key: string, dir: 'rtl' | 'ltr', k: number) => {
    const size = sizeBase * k;
    const p = enter(frame, w.inF, feel, t.fps);
    const pc = clamp01(p);
    if (frame < w.inF && l.anim !== 'fade') return <span key={key} style={{ display: 'inline-block', opacity: 0 }}>{w.t}</span>;
    const isSerif = w.em === 'serif';
    const f = isSerif ? serif : base;
    const st: CSSProperties = {
      display: 'inline-block',
      fontFamily: f.family,
      fontWeight: f.weight,
      fontStyle: (isSerif ? serif.italic : base.italic) ? 'italic' : 'normal',
      fontSize: size * (w.em === 'big' ? 1.4 : isSerif ? SERIF_K : 1),
      color,
      lineHeight: lh,
      letterSpacing: dir === 'ltr' && l.tracking ? `${l.tracking}em` : undefined,
      position: 'relative',
    };
    switch (w.em) {
      case 'accent':
      case 'big':
      case 'serif': st.color = accent; if (t.tone === 'dark') st.textShadow = `0 0 ${size * 0.22}px ${alpha(accent, 0.55)}`; break;
      case 'outline': if (dir === 'rtl') { st.color = alpha(color, 0.42); break; } st.color = 'rgba(0,0,0,0)'; st.WebkitTextStroke = `${Math.max(2, size * 0.035)}px ${color}`; break;
      case 'ghost': st.color = alpha(color.length === 7 ? color : '#FFFFFF', 0.38); break;
      case 'glow': st.color = accent; st.textShadow = `0 0 ${size * 0.18}px ${alpha(accent, 0.9)}, 0 0 ${size * 0.5}px ${alpha(accent, 0.55)}`; break;
      case 'highlight': st.color = onColor(accent); st.backgroundImage = `linear-gradient(${accent}, ${accent})`; st.backgroundSize = `${clamp01((frame - w.inF - 3) / 8) * 100}% 100%`; st.backgroundRepeat = 'no-repeat'; st.backgroundPosition = dir === 'rtl' ? 'right center' : 'left center'; st.padding = `0 ${size * 0.18}px`; st.margin = `0 ${size * 0.1}px`; st.borderRadius = size * 0.14; break;
      case 'box': st.color = t.color('paper') === '#0B0B0F' ? '#FFFFFF' : onColor(color); st.backgroundColor = color; st.padding = `0 ${size * 0.18}px`; st.margin = `0 ${size * 0.1}px`; st.borderRadius = size * 0.12; break;
      default: break;
    }
    let tr = '';
    let op = 1;
    let filter: string | undefined;
    switch (l.anim) {
      case 'rise': tr = `translateY(${(1 - p) * size * 0.6}px)`; op = clamp01(p * 1.6); break;
      case 'pop': { const s = popSpring(frame, w.inF, t.fps); tr = `scale(${0.2 + 0.8 * s})`; op = clamp01(s * 2); break; }
      case 'blur': op = pc; filter = `blur(${(1 - pc) * size * 0.25}px)`; tr = `scale(${1.08 - 0.08 * pc})`; break;
      case 'mask': tr = `translateY(${(1 - pc) * size * 1.05}px)`; break;
      case 'type': op = frame >= w.inF ? 1 : 0; break;
      case 'slide': tr = `translateX(${(1 - p) * size * (dir === 'rtl' ? 0.9 : -0.9)}px)`; op = clamp01(p * 1.5); break;
      case 'zoom': tr = `scale(${1.8 - 0.8 * p})`; op = pc; filter = `blur(${(1 - pc) * 10 * u}px)`; break;
      case 'stamp': { const s = popSpring(frame, w.inF, t.fps); tr = `scale(${2.2 - 1.2 * s}) rotate(${(1 - s) * -8}deg)`; op = clamp01(s * 3); break; }
      case 'wave': tr = `translateY(${(1 - p) * size * 0.5 + Math.sin((frame - w.inF) / 7) * size * 0.04}px)`; op = clamp01(p * 1.6); break;
      default: op = pc;
    }
    const inner = (
      <span key={key} style={{ ...st, transform: tr || undefined, opacity: op, filter }}>
        {w.t}
        {w.em === 'strike' && <span style={{ position: 'absolute', left: '-4%', top: '52%', height: Math.max(3, size * 0.07), width: `${clamp01((frame - w.inF - 4) / 8) * 108}%`, backgroundColor: accent, borderRadius: 4 }} />}
        {w.em === 'underline' && <span style={{ position: 'absolute', [dir === 'rtl' ? 'right' : 'left']: 0, bottom: size * 0.06, height: Math.max(3, size * 0.08), width: `${clamp01((frame - w.inF - 3) / 9) * 100}%`, backgroundColor: accent, borderRadius: 6 }} />}
      </span>
    );
    return l.anim === 'mask' ? <span key={key} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingTop: size * 0.12 }}>{inner}</span> : inner;
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - boxW / 2,
        top: cy - totalH / 2,
        width: boxW,
        textAlign: l.align === 'center' ? 'center' : undefined,
        transform: `rotate(${l.rotate}deg)`,
        opacity: out * l.opacity,
        filter: out < 1 ? `blur(${(1 - out) * 12 * u}px)` : undefined,
      }}
    >
      {lines.map((ln, li) => {
        const dir = detectDir(ln.map((w) => w.t).join(' '));
        const align = l.align === 'center' ? 'center' : (l.align === 'start') === (dir === 'rtl') ? 'right' : 'left';
        return (
          <div key={li} dir={dir} style={{ whiteSpace: 'nowrap', textAlign: align, fontFamily: base.family, fontWeight: base.weight, fontSize: size * ls[li]!, lineHeight: lh, height: lineH(li) }}>
            {groupRuns(ln.map((w) => w.t)).map((run, ri, runs) => {
              const inner = run.idx.map((k, kk) => (
                <Fragment key={k}>
                  {wordView(ln[k]!, `${li}-${k}`, run.dir, ls[li]!)}
                  {kk < run.idx.length - 1 ? ' ' : ''}
                </Fragment>
              ));
              return (
                <Fragment key={ri}>
                  {run.dir !== dir ? <span dir={run.dir} style={{ unicodeBidi: 'isolate' }}>{inner}</span> : inner}
                  {ri < runs.length - 1 ? ' ' : ''}
                </Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
