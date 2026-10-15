import { Img, interpolate } from 'remotion';
import { withAlpha } from '@/lib/color/contrast';
import { toDigits } from '@/lib/text/digits';
import { Chip, Headline, Stage, Sub, usePrim } from './kit';
import { FitText } from '../Text';
import { Icon } from '../Icon';
import { clamp01 } from '../motion';

export const TitleCard = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.headlineAt, 2);
  const line = clamp01((frame - 2) / 14);
  return (
    <Stage>
      {c.kicker && <div style={{ opacity: m.enterC(frame, 0), marginBottom: 30 * u }}><Chip text={c.kicker} bg={withAlpha(col.primary, 0.2)} color={col.primary} /></div>}
      <div style={{ width: stage.w * 0.5 * line, height: 10 * u, backgroundColor: col.accent, borderRadius: 5 * u, marginBottom: 34 * u, alignSelf: P.align === 'center' ? 'center' : 'flex-start' }} />
      <Headline text={c.headline} start={start} size={1.15} maxLines={3} />
      <div style={{ height: 30 * u }} />
      <Sub text={c.sub} start={start + 14} />
      {c.icon && <div style={{ marginTop: 40 * u, opacity: m.enterC(frame, start + 10), transform: `rotate(${interpolate(frame, [0, P.dur], [-6, 6])}deg)` }}><Icon id={c.icon} size={150 * u} /></div>}
      {t.dna.layoutGrammar === 'editorial-grid' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 * u, backgroundColor: col.line }} />}
    </Stage>
  );
};

/** "أولا / ثانيا…" chapter divider: giant number with a wipe. */
export const ChapterDivider = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.headlineAt, 2);
  const n = c.value ?? 1;
  const wipe = clamp01(m.enter(frame, 0, m.base * 1.2));
  return (
    <Stage>
      <div style={{ position: 'relative', overflow: 'hidden', width: stage.w, display: 'flex', justifyContent: 'center' }}>
        <div dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 900, fontSize: Math.min(520 * u, stage.h * 0.45), lineHeight: 1, color: 'rgba(0,0,0,0)', WebkitTextStroke: `${6 * u}px ${col.primary}`, transform: `translateY(${(1 - wipe) * 100}%)` }}>
          {toDigits(String(n).padStart(2, '0'), t.digits)}
        </div>
      </div>
      <div style={{ width: stage.w * 0.8 * wipe, height: 8 * u, backgroundColor: col.accent, margin: `${20 * u}px 0` }} />
      <Headline text={c.headline} start={start} size={0.9} maxLines={2} align="center" />
      <Sub text={c.sub} start={start + 12} />
    </Stage>
  );
};

export const CTA = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at, t } = P;
  const start = at(c.headlineAt, 2);
  const p = m.enter(frame, start);
  const pulse = 1 + 0.04 * Math.sin(frame / 5);
  const arrow = Math.abs(Math.sin(frame / 7)) * 24 * u;
  return (
    <Stage>
      <Headline text={c.sub ?? c.kicker} start={0} size={0.55} maxLines={2} align="center" color={col.muted} />
      <div style={{ height: 30 * u }} />
      <div style={{ transform: `scale(${(0.6 + 0.4 * p) * pulse})`, opacity: clamp01(p * 2), backgroundColor: col.accent, color: col.textOnAccent, borderRadius: t.radius(0.8) + 30 * u, padding: `${34 * u}px ${70 * u}px`, boxShadow: `0 ${20 * u}px ${60 * u}px ${withAlpha(col.accent, 0.5)}`, display: 'flex', alignItems: 'center', gap: 24 * u, maxWidth: stage.w }}>
        <Icon id={c.icon ?? 'cart'} size={90 * u} color={col.textOnAccent} />
        <FitText text={c.headline ?? ''} maxWidth={stage.w - 280 * u} maxSize={100 * u} maxLines={2} color={col.textOnAccent} />
      </div>
      {(c.phone || c.handle) && (
        <div dir="ltr" style={{ marginTop: 40 * u, fontFamily: t.fonts.display, fontWeight: 800, fontSize: 70 * u, color: col.text, opacity: m.enterC(frame, start + 10) }}>
          {toDigits(c.phone ?? c.handle ?? '', t.digits)}
        </div>
      )}
      <div style={{ marginTop: 30 * u, transform: `translateY(${arrow}px)` }}>
        <svg width={90 * u} height={90 * u} viewBox="0 0 24 24"><path d="M12 4 V20 M5 13 L12 20 L19 13" fill="none" stroke={col.primary} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </Stage>
  );
};

export const EndCard = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, t } = P;
  const logo = (P.scene.images[0]?.src ?? null);
  const rows = [
    c.handle ? { icon: 'camera', text: c.handle } : null,
    c.phone ? { icon: 'call', text: c.phone } : null,
    c.url ? { icon: 'globe', text: c.url } : null,
  ].filter(Boolean) as Array<{ icon: string; text: string }>;
  return (
    <Stage drift={false}>
      {logo && <Img src={logo} style={{ width: 220 * u, height: 220 * u, objectFit: 'contain', marginBottom: 30 * u, transform: `scale(${m.enter(frame, 0)})` }} />}
      {c.headline && <Headline text={c.headline} start={2} size={0.85} maxLines={2} align="center" />}
      <div style={{ height: 40 * u }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 * u, width: stage.w * 0.86 }}>
        {rows.map((r, i) => {
          const p = m.enter(frame, 8 + i * 5);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22 * u, backgroundColor: col.surface, borderRadius: t.radius(0.7) + 12 * u, padding: `${20 * u}px ${30 * u}px`, opacity: clamp01(p * 1.5), transform: `translateX(${(1 - p) * 80 * u}px)`, boxShadow: t.shadow(0.5) }}>
              <Icon id={r.icon} size={64 * u} />
              <div dir="ltr" style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 54 * u, color: col.text, flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>{toDigits(r.text, t.digits)}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

export const LogoSting = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at } = P;
  const logo = P.scene.images[0]?.src ?? null;
  const p = m.enter(frame, 0, m.base * 1.4);
  const ring = clamp01(frame / 24);
  return (
    <Stage drift={false}>
      <div style={{ position: 'relative', width: 420 * u, height: 420 * u, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `${6 * u}px solid ${i === 1 ? col.accent : col.primary}`, transform: `scale(${0.4 + ring * (0.7 + i * 0.25)})`, opacity: (1 - ring) * 0.9 }} />
        ))}
        <div style={{ transform: `scale(${p}) rotate(${(1 - clamp01(p)) * -30}deg)` }}>
          {logo ? <Img src={logo} style={{ width: 300 * u, height: 300 * u, objectFit: 'contain' }} /> : <Icon id={c.icon ?? 'star'} size={260 * u} />}
        </div>
      </div>
      <div style={{ height: 30 * u }} />
      <FitText text={c.headline ?? ''} maxWidth={stage.w} maxSize={110 * u} maxLines={2} />
      <Sub text={c.sub} start={at(c.headlineAt, 10)} />
    </Stage>
  );
};
