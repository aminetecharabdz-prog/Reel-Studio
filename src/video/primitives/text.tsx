import { interpolate } from 'remotion';
import { withAlpha } from '@/lib/color/contrast';
import { formatNumber, toDigits } from '@/lib/text/digits';
import { isStopword } from '@/lib/text/keywords';
import { Card, Chip, Headline, IconBadge, Stage, Sub, usePrim } from './kit';
import { FitText, Word } from '../Text';
import { Icon } from '../Icon';
import { clamp01 } from '../motion';

export const KineticHeadline = () => {
  const P = usePrim();
  const { content: c, at, u, c: col, frame, m } = P;
  const start = at(c.headlineAt, 3);
  const kp = m.enterC(frame, 0);
  return (
    <Stage>
      {c.kicker && <div style={{ opacity: kp, marginBottom: 28 * u }}><Chip text={c.kicker} /></div>}
      <Headline text={c.headline} start={start} size={1.05} color={c.colorTone === 'accent' ? col.accent : undefined} />
      <div style={{ height: 30 * u }} />
      <Sub text={c.sub} start={start + 14} />
    </Stage>
  );
};

/** Big stacked words that land exactly when they are spoken; earlier words dim. */
export const WordBuild = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, matchWord, at, stage, t } = P;
  const words = (c.headline ?? '').split(/\s+/).filter(Boolean).slice(0, 5);
  let last = 0;
  const starts = words.map((w, i) => {
    const id = isStopword(w) ? undefined : matchWord(w);
    const s = id ? at(id, last) : last + (i === 0 ? 2 : m.stagger * 3);
    last = Math.max(last, s);
    return last;
  });
  if (starts[0]! > Math.round(P.t.fps * 0.5)) starts[0] = 3;
  const per = Math.min(1, 3 / Math.max(1, words.length));
  const lineCap = stage.h / (words.length * 1.45);
  return (
    <Stage>
      {words.map((w, i) => {
        const p = m.enter(frame, starts[i]!);
        const isLast = i === words.findLastIndex((_, k) => starts[k]! <= frame);
        return (
          <div key={i} style={{ opacity: clamp01(p * 1.5) * (isLast ? 1 : 0.55), transform: `scale(${0.6 + 0.4 * p})`, lineHeight: 1.1 }}>
            <FitText text={w} maxWidth={stage.w} maxSize={Math.min(lineCap, (170 + 60 * per) * u * t.dna.typography.scale)} maxLines={1} color={i % 2 === 1 ? col.primary : col.text} align={P.align} />
          </div>
        );
      })}
    </Stage>
  );
};

/** Highlighter sweep behind the keyword (sweeps right→left for Arabic). */
export const HighlightSweep = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, at, stage, t } = P;
  const words = (c.headline ?? '').split(/\s+/).filter(Boolean);
  const kwIdx = Math.max(0, words.findIndex((w) => !isStopword(w) && w.length >= 3));
  const start = P.lead(at(c.headlineAt, 4));
  const sweep = clamp01((frame - start - 6) / 12);
  const rtl = /[؀-ۿ]/.test(c.headline ?? '');
  return (
    <Stage>
      <FitText
        text={c.headline ?? ''}
        maxWidth={stage.w}
        maxSize={140 * u * t.dna.typography.scale}
        maxLines={3}
        align={P.align}
        renderWord={(w, i) => {
          const p = m.enterC(frame, start + i * m.stagger);
          const isKw = i === kwIdx;
          return (
            <span
              style={{
                display: 'inline-block',
                opacity: p,
                transform: `translateY(${(1 - p) * 30 * u}px)`,
                padding: isKw ? `0 ${14 * u}px` : undefined,
                borderRadius: 10 * u,
                backgroundImage: isKw ? `linear-gradient(${col.accent}, ${col.accent})` : undefined,
                backgroundSize: isKw ? `${sweep * 100}% 100%` : undefined,
                backgroundPosition: rtl ? 'right center' : 'left center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <Word text={w} style={{ color: isKw && sweep > 0.55 ? col.textOnAccent : col.text }} />
            </span>
          );
        }}
      />
      <div style={{ height: 34 * u }} />
      <Sub text={c.sub} start={start + 20} />
    </Stage>
  );
};

export const BigNumber = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, at, stage, t } = P;
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const to = c.value ?? 0;
  const from = c.valueFrom ?? 0;
  const p = clamp01((frame - start) / Math.max(12, m.base * 2));
  const eased = 1 - Math.pow(1 - p, 3);
  const val = from + (to - from) * eased;
  const text = `${c.prefix ?? ''}${formatNumber(val, c.decimals ?? 0, t.digits)}${c.unit ?? ''}`;
  const finalText = `${c.prefix ?? ''}${formatNumber(to, c.decimals ?? 0, t.digits)}${c.unit ?? ''}`;
  const appear = m.enter(frame, start);
  const v = P.scene.variant % 3;
  return (
    <Stage>
      <div style={{ position: 'relative', transform: `scale(${0.5 + 0.5 * appear})`, opacity: clamp01(appear * 2) }}>
        {v === 1 && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 560 * u, height: 560 * u, marginLeft: -280 * u, marginTop: -280 * u, borderRadius: '50%', border: `${14 * u}px solid ${withAlpha(col.primary, 0.25)}` }} />
        )}
        <div dir="ltr" style={{ position: 'relative', fontFamily: t.fonts.display, fontWeight: t.fonts.displayWeight, color: v === 2 ? 'rgba(0,0,0,0)' : col.primary, WebkitTextStroke: v === 2 ? `${6 * u}px ${col.primary}` : undefined, lineHeight: 1, textAlign: 'center', fontSize: Math.min(330 * u, (stage.w / Math.max(3, finalText.length)) * 1.75) }}>
          {text}
        </div>
      </div>
      {v === 0 && <div style={{ width: 220 * u * clamp01((frame - start - 8) / 14), height: 12 * u, backgroundColor: col.accent, borderRadius: 6 * u, margin: `${26 * u}px 0` }} />}
      {v !== 0 && <div style={{ height: 40 * u }} />}
      <Headline text={c.headline} start={Math.min(start + 8, 4)} size={0.7} maxLines={2} align="center" />
      <div style={{ height: 18 * u }} />
      <Sub text={c.sub} start={start + 18} />
    </Stage>
  );
};

export const QuoteCard = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, at, stage } = P;
  const start = at(c.headlineAt, 2);
  const p = m.enter(frame, start);
  return (
    <Stage>
      <div style={{ transform: `translateY(${(1 - p) * 80 * u}px) rotate(${(1 - p) * -3}deg)`, opacity: clamp01(p * 1.5) }}>
        <Card style={{ width: stage.w * 0.92, position: 'relative', paddingTop: 80 * u }}>
          <div style={{ position: 'absolute', top: -60 * u, right: 40 * u, fontSize: 200 * u, lineHeight: 1, color: col.accent, fontFamily: 'Georgia, serif' }}>”</div>
          <FitText text={c.headline ?? ''} maxWidth={stage.w * 0.92 - 72 * u} maxSize={86 * u} maxLines={5} role="display" align="start" />
          {c.sub && <div style={{ marginTop: 24 * u, color: col.muted, fontFamily: P.t.fonts.body, fontSize: 40 * u }}>— {c.sub}</div>}
        </Card>
      </div>
    </Stage>
  );
};

/** Typewriter: whole words revealed in sync with speech (never per-letter — keeps Arabic joined). */
export const Typewriter = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, matchWord, at, stage, t } = P;
  const words = (c.headline ?? '').split(/\s+/).filter(Boolean);
  let last = 2;
  const starts0 = words.map((w) => {
    const id = isStopword(w) ? undefined : matchWord(w);
    last = id ? Math.max(last, at(id, last)) : last + Math.max(3, m.stagger * 2);
    return last;
  });
  const starts = starts0.map((s, i) => (i === 0 ? P.lead(s) : s));
  const shown = starts.filter((s) => s <= frame).length;
  const caretOn = Math.floor(frame / 8) % 2 === 0;
  return (
    <Stage>
      <Card style={{ width: stage.w * 0.94 }} color={t.isDark ? withAlpha('#000000', 0.35) : col.surface}>
        <div style={{ display: 'flex', gap: 12 * u, marginBottom: 24 * u, direction: 'ltr' }}>
          {[col.bad, col.accent, col.good].map((k, i) => <div key={i} style={{ width: 22 * u, height: 22 * u, borderRadius: 11 * u, backgroundColor: k }} />)}
        </div>
        <FitText
          text={c.headline ?? ''}
          maxWidth={stage.w * 0.94 - 72 * u}
          maxSize={92 * u}
          maxLines={5}
          role="display"
          align="start"
          renderWord={(w, i) => (
            <span style={{ display: 'inline-block', opacity: i < shown ? 1 : 0 }}>
              <Word text={w} />
              {i === shown - 1 && <span style={{ display: 'inline-block', width: 8 * u, height: '0.9em', marginInlineStart: 6 * u, verticalAlign: 'middle', backgroundColor: caretOn ? col.accent : 'rgba(0,0,0,0)' }} />}
            </span>
          )}
        />
      </Card>
    </Stage>
  );
};

/** Split-flap board for short words / numbers. Flip done with scaleY (no 3D perspective in web renderer). */
export const SplitFlap = () => {
  const P = usePrim();
  const { content: c, frame, u, c: col, at, stage, t } = P;
  const raw = c.value !== undefined ? `${c.prefix ?? ''}${formatNumber(c.value, c.decimals ?? 0, 'western')}${c.unit ?? ''}` : (c.headline ?? '').split(/\s+/)[0] ?? '';
  const chars = toDigits(raw, t.digits).replace(/\u202F/g, ' ').split('').slice(0, 9);
  const start = at(c.valueAt ?? c.headlineAt, 4);
  const tile = Math.min(150 * u, (stage.w - 20 * u * chars.length) / Math.max(1, chars.length));
  const isArabic = /[؀-ۿ]/.test(raw);
  return (
    <Stage>
      {isArabic ? (
        <Card style={{ padding: `${30 * u}px ${50 * u}px` }} color={t.isDark ? '#0D0D0F' : '#1B1B1F'}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: t.fonts.displayWeight, color: '#F5F5F5', fontSize: 150 * u, lineHeight: 1.3, transform: `scaleY(${clamp01((frame - start) / 6)})` }}>{raw}</div>
        </Card>
      ) : (
        <div dir="ltr" style={{ display: 'flex', gap: 14 * u }}>
          {chars.map((ch, i) => {
            const s = start + i * 3;
            const flips = Math.max(0, Math.min(6, Math.floor((frame - s) / 2)));
            const settled = frame - s >= 12;
            const glyph = settled ? ch : ch === ' ' ? ' ' : '0123456789#%'[(flips * 7 + i) % 12]!;
            const phase = settled ? 1 : ((frame - s) % 2) / 2 + 0.5;
            return (
              <div key={i} style={{ width: tile, height: tile * 1.35, borderRadius: 12 * u, backgroundColor: '#18181C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadow(0.6), position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: tile * 0.9, color: i === chars.length - 1 ? col.accent : '#F2F2F2', transform: `scaleY(${frame < s ? 0 : phase})` }}>{glyph}</div>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 3 * u, backgroundColor: '#000' }} />
              </div>
            );
          })}
        </div>
      )}
      <div style={{ height: 40 * u }} />
      <Headline text={c.value !== undefined ? c.headline : c.sub} start={start + 10} size={0.76} maxLines={2} align="center" />
    </Stage>
  );
};

export const StackedList = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, itemStart, stage, t, at } = P;
  const items = (c.items ?? []).slice(0, 5);
  const v = P.scene.variant % 3;
  const rowW = stage.w * (P.align === 'center' ? 0.94 : 1);
  return (
    <Stage>
      {c.headline && (
        <div style={{ marginBottom: 34 * u, width: rowW }}>
          <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.76} maxLines={2} width={rowW} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 * u, width: rowW }}>
        {items.map((it, i) => {
          const s = itemStart(i, it, items.length);
          const p = m.enter(frame, s);
          const active = frame >= s && (i === items.length - 1 || frame < itemStart(i + 1, items[i + 1]!, items.length));
          return (
            <div key={i} dir="rtl" style={{ display: 'flex', alignItems: 'center', gap: 26 * u, opacity: clamp01(p * 1.4), transform: `translateX(${(1 - p) * 120 * u}px)`, backgroundColor: v === 1 ? (active ? col.primary : col.surface) : 'rgba(0,0,0,0)', borderRadius: t.radius(0.7), padding: v === 1 ? `${18 * u}px ${26 * u}px` : 0, boxShadow: v === 1 ? t.shadow(0.6) : 'none' }}>
              {v === 2 ? (
                <div style={{ width: 92 * u, height: 92 * u, flex: 'none', borderRadius: 46 * u, backgroundColor: col.accent, color: col.textOnAccent, fontFamily: t.fonts.display, fontWeight: 800, fontSize: 54 * u, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{toDigits(String(i + 1), t.digits)}</div>
              ) : (
                <IconBadge id={it.icon ?? 'check'} size={92 * u} bg={v === 1 && active ? withAlpha('#ffffff', 0.25) : undefined} color={v === 1 && active ? col.textOnPrimary : undefined} />
              )}
              <FitText text={it.text} role="body" weight={700} maxWidth={rowW - 140 * u} maxSize={62 * u} maxLines={2} align="start" color={v === 1 && active ? col.textOnPrimary : col.text} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

export const QuestionHook = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, at, stage, t } = P;
  const start = at(c.headlineAt, 0);
  const punch = m.enter(frame, 0, 8);
  const shake = frame < 14 ? Math.sin(frame * 2.2) * (14 - frame) * 0.6 * u : 0;
  return (
    <Stage>
      <div style={{ position: 'absolute', top: stage.h * 0.02, left: '50%', marginLeft: -200 * u, width: 400 * u, height: 400 * u, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.18 * clamp01(punch), transform: `scale(${0.6 + 0.6 * punch}) rotate(${interpolate(frame, [0, 60], [-8, 6])}deg)` }}>
        <div style={{ fontFamily: t.fonts.display, fontSize: 520 * u, fontWeight: 900, color: col.accent, lineHeight: 1 }}>؟</div>
      </div>
      <div style={{ transform: `translateX(${shake}px) scale(${1.25 - 0.25 * clamp01(punch)})` }}>
        <Headline text={c.headline} start={start} size={1.1} />
      </div>
      <div style={{ height: 30 * u }} />
      {c.icon && <div style={{ opacity: m.enterC(frame, start + 10) }}><Icon id={c.icon} size={150 * u} /></div>}
      <Sub text={c.sub} start={start + 14} />
    </Stage>
  );
};
