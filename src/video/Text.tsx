import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { measureText } from '@remotion/layout-utils';
import { layoutText } from '@/lib/text/layout';
import { detectDir, groupWordRuns, splitRuns, trimRun } from '@/lib/text/bidi';
import { toDigits } from '@/lib/text/digits';
import { useTheme } from './theme';

export type TextRole = 'display' | 'body' | 'captions';

export const useFontFor = (role: TextRole) => {
  const t = useTheme();
  const family = role === 'display' ? t.fonts.display : role === 'captions' ? t.fonts.captions : t.fonts.body;
  const weight = role === 'display' ? t.fonts.displayWeight : role === 'captions' ? t.fonts.captionWeight : t.fonts.bodyWeight;
  return { family, weight };
};

const measureCache = new Map<string, number>();
export const measureWidth = (text: string, fontFamily: string, fontWeight: number, fontSize: number) => {
  const key = `${fontFamily}|${fontWeight}|${fontSize}|${text}`;
  const hit = measureCache.get(key);
  if (hit !== undefined) return hit;
  const w = measureText({ text, fontFamily, fontSize, fontWeight, validateFontIsLoaded: false }).width;
  measureCache.set(key, w);
  return w;
};
export const clearMeasureCache = () => measureCache.clear();

/** Renders one string with bidi isolates per run: Arabic runs RTL, Latin/number runs LTR (SPEC §7). */
export const BidiLine = ({ text, style }: { text: string; style?: CSSProperties }) => {
  const runs = splitRuns(text);
  return (
    <>
      {runs.map((r, i) => {
        const { core, space } = trimRun(r.text);
        if (r.dir === 'neutral') return <Fragment key={i}>{r.text}</Fragment>;
        return (
          <Fragment key={i}>
            <span dir={r.dir} style={{ unicodeBidi: 'isolate', ...style }}>
              {core}
            </span>
            {space}
          </Fragment>
        );
      })}
    </>
  );
};

export type FitTextProps = {
  text: string;
  role?: TextRole;
  maxWidth: number;
  maxSize: number;
  minSize?: number;
  maxLines?: number;
  color?: string;
  weight?: number;
  align?: 'start' | 'center' | 'end';
  lineHeight?: number;
  style?: CSSProperties;
  /** wrap each word (whole word — never per-letter for Arabic) */
  renderWord?: (word: string, index: number, line: number) => ReactNode;
};

/**
 * Text that is measured with the real font and wrapped into explicit lines, shrinking until it
 * fits `maxLines` × `maxWidth` (so it can never overflow). Arabic line-height ≥ 1.35.
 */
export const FitText = ({ text, role = 'display', maxWidth, maxSize, minSize, maxLines = 3, color, weight, align = 'center', lineHeight, style, renderWord }: FitTextProps) => {
  const t = useTheme();
  const font = useFontFor(role);
  const fw = weight ?? font.weight;
  const shown = toDigits(text, t.digits);
  const res = layoutText(shown, {
    maxWidth,
    maxSize,
    minSize: minSize ?? Math.max(36 * t.u, maxSize * 0.4),
    maxLines,
    measure: (s, size) => measureWidth(s, font.family, fw, size),
  });
  const dir = detectDir(shown);
  const lh = lineHeight ?? (dir === 'rtl' ? 1.38 : 1.15);
  const base: number[] = [];
  res.lines.reduce((n, ln) => (base.push(n), n + ln.length), 0);
  return (
    <div
      dir={dir}
      data-fit-overflow={res.overflow ? '1' : undefined}
      style={{
        fontFamily: font.family,
        fontWeight: fw,
        fontSize: res.fontSize,
        lineHeight: lh,
        color: color ?? t.c.text,
        textAlign: align === 'center' ? 'center' : align === 'start' ? (dir === 'rtl' ? 'right' : 'left') : dir === 'rtl' ? 'left' : 'right',
        width: maxWidth,
        ...style,
      }}
    >
      {res.lines.map((ln, li) => (
        <div key={li} style={{ whiteSpace: 'nowrap', paddingTop: dir === 'rtl' ? res.fontSize * 0.04 : 0 }}>
          {renderWord
            ? groupWordRuns(ln).map((run, ri, runs) => {
                const inner = run.indices.map((k, kk) => {
                  const idx = base[li]! + k;
                  return (
                    <Fragment key={k}>
                      {renderWord(ln[k]!, idx, li)}
                      {kk < run.indices.length - 1 ? ' ' : ''}
                    </Fragment>
                  );
                });
                return (
                  <Fragment key={ri}>
                    {run.dir !== dir ? <span dir={run.dir} style={{ unicodeBidi: 'isolate' }}>{inner}</span> : inner}
                    {ri < runs.length - 1 ? ' ' : ''}
                  </Fragment>
                );
              })
            : <BidiLine text={ln.join(' ')} />}
        </div>
      ))}
    </div>
  );
};

/** A word span that keeps bidi isolation for Latin/number words. */
export const Word = ({ text, style }: { text: string; style?: CSSProperties }) => {
  const dir = /[A-Za-z0-9]/.test(text) && !/[؀-ۿ]/.test(text) ? 'ltr' : undefined;
  return (
    <span dir={dir} style={{ display: 'inline-block', unicodeBidi: dir ? 'isolate' : undefined, ...style }}>
      {text}
    </span>
  );
};
