/** Brand end card (from «هوية علامتي»): logo, name, line, contact — on the brand's colours. */
import { AbsoluteFill, Img } from 'remotion';
import { blurIn, ease, prog, springAt } from './anim';
import { useT, useVideo } from './context';

export const END_CARD_SECONDS = 2.6;

export const EndCard = () => {
  const { input, contentEnd, u, num } = useVideo();
  const t = useT() + contentEnd; // Sequence starts at contentEnd
  const b = input.brand;
  if (!b) return null;
  const [c1 = '#FF7A1A', c2 = '#0A141B'] = b.colors;
  const s0 = contentEnd;
  const logoK = springAt(t, s0, { damping: 14, stiffness: 170 });
  const nameK = prog(t, s0 + 0.2, s0 + 0.55, ease.outCubic);
  const lineK = prog(t, s0 + 0.4, s0 + 0.75, ease.outCubic);
  const ctaK = prog(t, s0 + 0.6, s0 + 0.95, ease.outCubic);
  const contact = input.product?.whatsapp || b.phone || input.product?.phone;
  return (
    <AbsoluteFill style={{ background: c2, alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily: 'Alexandria, Readex Pro, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 * u }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * logoK})`, opacity: Math.min(1, logoK * 1.5) }}>
          {b.logo ? (
            <Img src={b.logo} style={{ width: 220 * u, height: 220 * u, objectFit: 'contain', borderRadius: 40 * u }} />
          ) : (
            <div style={{ width: 200 * u, height: 200 * u, borderRadius: 48 * u, background: c1, color: c2, display: 'grid', placeItems: 'center', fontSize: 110 * u, fontWeight: 800, lineHeight: 1.35 }}>{(b.name || 'ر').slice(0, 1)}</div>
          )}
        </div>
        <div style={{ ...blurIn(nameK, { blur: 14, y: 20 * u }), color: '#fff', fontSize: 92 * u, fontWeight: 800, lineHeight: 1.35 }}>{b.name}</div>
        {b.endLine && <div style={{ ...blurIn(lineK, { blur: 10, y: 14 * u }), color: 'rgba(255,255,255,0.72)', fontSize: 46 * u, lineHeight: 1.4 }}>{b.endLine}</div>}
        {contact && (
          <div style={{ ...blurIn(ctaK, { blur: 10, y: 14 * u }), background: c1, color: c2, borderRadius: 999, padding: `${18 * u}px ${44 * u}px`, fontSize: 48 * u, fontWeight: 800, direction: 'ltr', fontFamily: 'Space Grotesk, sans-serif' }}>
            {num(contact)}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
