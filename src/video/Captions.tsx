import { useCurrentFrame } from 'remotion';
import type { CSSProperties } from 'react';
import type { CaptionLine } from '@/lib/timing/types';
import type { CaptionSettings } from '@/lib/schema/plan';
import { layoutText } from '@/lib/text/layout';
import { detectDir } from '@/lib/text/bidi';
import { toDigits } from '@/lib/text/digits';
import { contrast, mix, textOn, withAlpha } from '@/lib/color/contrast';
import { useTheme } from './theme';
import { measureWidth } from './Text';
import { clamp01 } from './motion';

/** Is a word active at this frame? Active from its start frame until the next word starts (drift 0 f). */
export const isActive = (frame: number, w: { start: number; end: number }) => frame >= w.start && frame < Math.max(w.end, w.start + 1);

const CaptionLineView = ({ line, s }: { line: CaptionLine; s: CaptionSettings }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const band = t.captionBand!;
  const { u } = t;
  const family = t.fonts.captions;
  const weight = t.fonts.captionWeight;
  const size = s.sizePx * u;
  const text = line.words.map((w) => toDigits(w.text, t.digits)).join(' ');
  const padX = ['pill', 'block', 'gradient'].includes(s.style) ? 36 * u : 0;
  const lay = layoutText(text, { maxWidth: band.w - padX * 2, maxSize: size, minSize: 42 * u, maxLines: 2, measure: (x, sz) => measureWidth(x, family, weight, sz) });
  const fs = lay.fontSize;
  const dir = detectDir(text);

  const inP = clamp01((frame - line.from) / 6);
  const anim: CSSProperties =
    s.animation === 'pop'
      ? { transform: `scale(${0.86 + 0.14 * inP})`, opacity: inP }
      : s.animation === 'slide'
        ? { transform: `translateY(${(1 - inP) * 24 * u}px)`, opacity: inP }
        : s.animation === 'fade'
          ? { opacity: inP }
          : {};

  const base = s.color ?? t.c.text;
  const active = s.activeColor ?? t.c.accent;
  const stroke = withAlpha(t.isDark ? '#000000' : '#000000', t.isDark ? 0.55 : 0.35);
  const shadow = `0 ${3 * u}px ${12 * u}px ${withAlpha('#000000', 0.45)}`;
  const bgCol = s.background ?? (s.style === 'block' ? t.c.primary : withAlpha(t.isDark ? '#000000' : '#111111', 0.62));
  const onBg = s.style === 'block' ? textOn(bgCol.startsWith('#') ? bgCol : t.c.primary) : '#FFFFFF';

  let idx = 0;
  const lines = lay.lines.map((ln) => ln.map(() => line.words[idx++]!));

  const wordStyle = (w: CaptionLine['words'][number]): CSSProperties => {
    const on = isActive(frame, w);
    const past = frame >= w.end;
    const kw = w.keyword;
    const st: CSSProperties = { display: 'inline-block', padding: `0 ${0.08 * fs}px`, borderRadius: 0.18 * fs };
    switch (s.style) {
      case 'karaoke':
        return { ...st, color: on ? active : past ? base : withAlpha(base, 0.55), textShadow: shadow, transform: on ? 'scale(1.08)' : undefined };
      case 'word-pop': {
        const p = on ? clamp01((frame - w.start) / 4) : 0;
        return { ...st, color: kw ? active : base, textShadow: shadow, transform: `scale(${on ? 1 + 0.16 * Math.sin(p * Math.PI * 0.5) : 1})`, opacity: frame < w.start ? 0.35 : 1 };
      }
      case 'outline':
        return { ...st, color: on || kw ? active : 'rgba(0,0,0,0)', WebkitTextStroke: `${Math.max(2, fs * 0.045)}px ${on || kw ? active : base}`, paintOrder: 'stroke fill' };
      case 'gradient':
        return on
          ? { ...st, color: textOn(t.c.primary), backgroundImage: `linear-gradient(90deg, ${t.c.primary}, ${t.c.accent})` }
          : { ...st, color: onBg };
      case 'boxed-keyword':
        return kw
          ? { ...st, color: t.c.textOnAccent, backgroundColor: t.c.accent }
          : { ...st, color: on ? (contrast(active, '#000000') > 5 ? active : base) : base, textShadow: shadow };
      case 'pill':
        return { ...st, color: on ? (contrast(active, '#111111') >= 4.5 ? active : mix(active, '#ffffff', 0.5)) : onBg };
      case 'block':
        return { ...st, color: onBg, opacity: frame < w.start ? 0.6 : 1, textDecoration: on ? 'underline' : undefined, textDecorationThickness: on ? `${0.08 * fs}px` : undefined };
      default:
        return { ...st, color: on ? active : base, textShadow: shadow };
    }
  };

  const boxed = s.style === 'pill' || s.style === 'block' || s.style === 'gradient';
  return (
    <div style={{ position: 'absolute', left: band.x, top: band.y, width: band.w, height: band.h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        dir={dir}
        style={{
          fontFamily: family,
          fontWeight: weight,
          fontSize: fs,
          lineHeight: dir === 'rtl' ? 1.42 : 1.2,
          textAlign: 'center',
          padding: boxed ? `${0.18 * fs}px ${padX}px` : 0,
          borderRadius: boxed ? (s.style === 'pill' ? fs : t.radius(0.6) + 8 * u) : 0,
          backgroundColor: boxed && s.style !== 'gradient' ? bgCol : boxed ? withAlpha('#000000', 0.6) : undefined,
          ...(s.style === 'karaoke' || s.style === 'word-pop' || s.style === 'minimal' ? { WebkitTextStroke: `${Math.max(1, fs * 0.02)}px ${stroke}`, paintOrder: 'stroke fill' } : {}),
          ...anim,
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ whiteSpace: 'nowrap' }}>
            {ln.map((w, k) => {
              const txt = toDigits(w.text, t.digits);
              const latin = /[A-Za-z0-9]/.test(txt) && !/[؀-ۿ]/.test(txt);
              return (
                <span key={w.id}>
                  <span data-word-id={w.id} dir={latin ? 'ltr' : undefined} style={{ ...wordStyle(w), unicodeBidi: latin ? 'isolate' : undefined }}>
                    {txt}
                  </span>
                  {k < ln.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Caption layer: shows the one line whose window contains the current frame. */
export const Captions = ({ lines, settings }: { lines: CaptionLine[]; settings: CaptionSettings }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  if (!settings.enabled || !t.captionBand) return null;
  const line = lines.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  return <CaptionLineView key={line.id} line={line} s={settings} />;
};
