import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import type { CompiledScene } from '@/lib/timing/types';
import { isStopword, normalizeAr } from '@/lib/text/keywords';
import { anticipationFrames } from '@/lib/timing/frames';
import { withAlpha } from '@/lib/color/contrast';
import { useTheme, type Box } from '../theme';
import { makeMotion, type Motion } from '../motion';
import { Icon } from '../Icon';
import { FitText, type FitTextProps } from '../Text';

export type PrimitiveProps = { scene: CompiledScene };

const SceneCtx = createContext<CompiledScene | null>(null);
export const SceneProvider = SceneCtx.Provider;

/** Everything a primitive needs: frame, theme, motion, stage box and word-anchored timing. */
export const usePrim = () => {
  const scene = useContext(SceneCtx);
  if (!scene) throw new Error('SceneProvider missing');
  const frame = useCurrentFrame();
  const t = useTheme();
  const m: Motion = makeMotion(t.dna, t.fps);
  const lead = anticipationFrames(t.fps);
  const words = scene.words;
  /** entrance start for an element anchored to word `id` (3–6 f before the word, SPEC §6) */
  const at = (id: string | undefined, fallback: number) => {
    const a = id ? scene.anchors[id] : undefined;
    return a ? Math.max(0, a.start - lead) : fallback;
  };
  /** find the spoken word that matches a piece of on-screen text, to anchor it */
  const matchWord = (text: string): string | undefined => {
    const targets = text.split(/\s+/).map(normalizeAr).filter((x) => x.length >= 2);
    for (const tg of targets) {
      const hit = words.find((w) => {
        const n = normalizeAr(w.text);
        return n === tg || (tg.length >= 3 && (n.endsWith(tg) || n.startsWith(tg) || tg.endsWith(n) && n.length >= 3));
      });
      if (hit) return hit.id;
    }
    return undefined;
  };
  /** item i: anchored if it has `at`, else matched by text, else staggered across the first part of the scene */
  const itemStart = (i: number, item: { at?: string; text?: string }, n: number) => {
    const fallback = Math.round(6 + i * Math.max(m.stagger * 3, Math.min(18, (scene.duration * 0.5) / Math.max(1, n))));
    return at(item.at ?? (item.text ? matchWord(item.text) : undefined), fallback);
  };
  const emphasis = scene.emphasis.reduce((p, e) => Math.max(p, m.pulse(frame, e)), 0);
  const align: 'center' | 'start' = ['asymmetric', 'editorial-grid'].includes(t.dna.layoutGrammar) && scene.variant !== 1 ? 'start' : 'center';
  /** a text-led scene never starts empty: late anchors still show the scene's text from the start */
  const leadIn = (s: number) => (s > Math.round(t.fps * 0.5) ? 3 : s);
  return { scene, frame, t, m, at, lead: leadIn, matchWord, itemStart, emphasis, stage: t.stage, u: t.u, c: t.c, align, content: scene.content, dur: scene.duration };
};

/** Absolutely positioned stage with slow secondary motion so the frame is never static > 2 s. */
export const Stage = ({ children, style, drift = true }: { children: ReactNode; style?: CSSProperties; drift?: boolean }) => {
  const { stage, frame, dur, emphasis, align } = usePrim();
  const p = Math.min(1, frame / Math.max(1, dur));
  const s = (drift ? 1 + 0.035 * p : 1) * (1 + 0.04 * emphasis);
  return (
    <div
      style={{
        position: 'absolute',
        left: stage.x,
        top: stage.y,
        width: stage.w,
        height: stage.h,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        justifyContent: 'center',
        transform: `scale(${s})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Card = ({ children, style, color, pad = 1 }: { children: ReactNode; style?: CSSProperties; color?: string; pad?: number }) => {
  const t = useTheme();
  return (
    <div
      style={{
        backgroundColor: color ?? t.c.surface,
        borderRadius: t.radius(1),
        boxShadow: t.shadow(1),
        padding: 36 * t.u * pad,
        border: t.dna.texture.shadows === 'hard' ? `${3 * t.u}px solid ${t.c.text}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const IconBadge = ({ id, size, bg, color, shape = 'round', style }: { id?: string; size: number; bg?: string; color?: string; shape?: 'round' | 'square' | 'none'; style?: CSSProperties }) => {
  const t = useTheme();
  if (shape === 'none') return <Icon id={id} size={size} color={color} style={style} />;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: shape === 'round' ? size / 2 : Math.min(size * 0.3, t.radius(0.8) + 6 * t.u),
        backgroundColor: bg ?? withAlpha(t.c.primary, t.isDark ? 0.22 : 0.14),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Icon id={id} size={size * 0.58} color={color} />
    </div>
  );
};

export const Chip = ({ text, bg, color, size, style }: { text: string; bg?: string; color?: string; size?: number; style?: CSSProperties }) => {
  const t = useTheme();
  const fs = size ?? 40 * t.u;
  return (
    <div
      dir="auto"
      style={{
        display: 'inline-block',
        backgroundColor: bg ?? t.c.accent,
        color: color ?? t.c.textOnAccent,
        fontFamily: t.fonts.body,
        fontWeight: 700,
        fontSize: fs,
        lineHeight: 1.35,
        padding: `${fs * 0.22}px ${fs * 0.7}px`,
        borderRadius: Math.min(fs, t.radius(0.6) + fs * 0.3),
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Display headline with DNA-driven entrance; words appear when they're spoken if they match the speech. */
export const Headline = ({
  text,
  start,
  size = 1,
  maxLines = 3,
  color,
  width,
  role = 'display',
  perWord = true,
  style,
  align,
  maxHeight,
}: { text?: string; start: number; size?: number; maxLines?: number; color?: string; width?: number; role?: FitTextProps['role']; perWord?: boolean; style?: CSSProperties; align?: 'center' | 'start'; maxHeight?: number }) => {
  const P = usePrim();
  if (!text) return null;
  const { t, m, frame, stage, matchWord, at } = P;
  const maxSize = 178 * t.u * t.dna.typography.scale * (0.3 + 0.7 * size);
  const al = align ?? P.align;
  const dirSign = /[\u0600-\u06FF]/.test(text) ? 1 : -1; // RTL text slides in from the right
  // per-word start: on its spoken word when it matches (non-stopwords), else after the previous word
  const ws = text.trim().split(/\s+/);
  const starts: number[] = [];
  ws.forEach((w, i) => {
    const anchored = perWord && !isStopword(w) ? matchWord(w) : undefined;
    const prev = i === 0 ? start : starts[i - 1]! + m.stagger;
    starts.push(anchored ? Math.max(i === 0 ? 0 : starts[i - 1]!, Math.min(at(anchored, prev), start + 60)) : perWord ? prev : start);
  });
  // never leave the screen empty: if the first word is spoken late, it enters with the scene
  if (starts[0]! > Math.round(t.fps * 0.5)) {
    // show the opening words up to (and including) the first real content word
    const k = ws.findIndex((w) => w.replace(/[^\p{L}]/gu, '').length >= 3 && !isStopword(w));
    for (let i = 0; i <= Math.max(0, k); i++) starts[i] = Math.min(starts[i]!, 3 + i * m.stagger);
  }
  return (
    <FitText
      text={text}
      role={role}
      maxWidth={width ?? stage.w}
      maxSize={maxSize}
      maxLines={maxLines}
      maxHeight={maxHeight ?? stage.h * 0.6 * (0.5 + 0.5 * size)}
      color={color}
      align={al}
      style={style}
      renderWord={(w, i) => {
        const p = m.enter(frame, starts[i] ?? start);
        const v = P.scene.variant % 3;
        const tr = v === 0 ? `translateY(${(1 - p) * 60 * t.u}px)` : v === 1 ? `scale(${0.3 + 0.7 * p})` : `translateX(${(1 - p) * 90 * t.u * dirSign}px)`;
        return (
          <span dir={/^[A-Za-z0-9%.,:+\-/]+$/.test(w) ? 'ltr' : undefined} style={{ display: 'inline-block', opacity: Math.min(1, Math.max(0, p * 1.6)), transform: tr, unicodeBidi: 'isolate' }}>
            {w}
          </span>
        );
      }}
    />
  );
};

export const Sub = ({ text, start, width, color, size = 1, maxLines = 3 }: { text?: string; start: number; width?: number; color?: string; size?: number; maxLines?: number }) => {
  const P = usePrim();
  if (!text) return null;
  const p = P.m.enterC(P.frame, start);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 20 * P.u}px)` }}>
      <FitText text={text} role="body" maxWidth={width ?? P.stage.w * 0.92} maxSize={54 * P.u * size} maxLines={maxLines} color={color ?? P.c.muted} align={P.align} />
    </div>
  );
};

/** placeholder illustration when an image is missing: icon composition on a soft shape */
export const IllustrationFallback = ({ icon, size, box }: { icon?: string; size: number; box?: Box }) => {
  const t = useTheme();
  return (
    <div
      style={{
        width: box?.w ?? size,
        height: box?.h ?? size,
        borderRadius: t.radius(1.2),
        backgroundImage: `linear-gradient(140deg, ${withAlpha(t.c.primary, 0.35)}, ${withAlpha(t.c.accent, 0.35)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon id={icon ?? 'sparkle'} size={size * 0.5} color={t.c.text} />
    </div>
  );
};
