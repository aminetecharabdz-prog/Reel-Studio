import { Img, interpolate } from 'remotion';
import type { CSSProperties } from 'react';
import { withAlpha, mix } from '@/lib/color/contrast';
import { formatNumber } from '@/lib/text/digits';
import { Chip, Headline, IllustrationFallback, Stage, Sub, usePrim } from './kit';
import { FitText } from '../Text';
import { Icon } from '../Icon';
import { clamp01 } from '../motion';

const useImg = (i = 0) => {
  const P = usePrim();
  return P.scene.images[i]?.src ?? null;
};

const Pic = ({ src, w, h, style, icon }: { src: string | null; w: number; h: number; style?: CSSProperties; icon?: string }) =>
  src ? <Img src={src} style={{ width: w, height: h, objectFit: 'cover', display: 'block', ...style }} /> : <div style={{ width: w, height: h, overflow: 'hidden', ...style }}><IllustrationFallback icon={icon} size={Math.min(w, h)} box={{ x: 0, y: 0, w, h }} /></div>;

export const ImageCard = () => {
  const P = usePrim();
  const { content: c, frame, m, u, stage, t, at } = P;
  const src = useImg();
  const start = at(c.headlineAt, 2);
  const p = m.enter(frame, 0);
  const size = Math.min(stage.w * 0.86, stage.h * 0.58);
  const v = P.scene.variant % 4;
  const clip = ['circle(50% at 50% 50%)', 'none', 'none', 'none'][v]!;
  const radius = v === 2 ? `${size / 2}px ${size / 2}px ${t.radius(0.6)}px ${t.radius(0.6)}px` : v === 3 ? t.radius(1) : t.radius(1.2);
  return (
    <Stage>
      <div style={{ transform: `scale(${0.75 + 0.25 * p}) rotate(${v === 3 ? -4 + 4 * (1 - clamp01(p)) : 0}deg)`, opacity: clamp01(p * 1.6), boxShadow: t.shadow(1.2), borderRadius: v === 0 ? size / 2 : radius, overflow: 'hidden', border: v === 3 ? `${14 * u}px solid #ffffff` : undefined }}>
        <Pic src={src} w={size} h={v === 2 ? size * 1.2 : size} icon={c.icon} style={{ clipPath: clip, transform: `scale(${1.08 - 0.08 * clamp01(frame / P.dur)})` }} />
      </div>
      <div style={{ height: 36 * u }} />
      <Headline text={c.headline} start={start} size={0.76} maxLines={2} />
      <Sub text={c.sub} start={start + 12} />
    </Stage>
  );
};

export const KenBurns = () => {
  const P = usePrim();
  const { content: c, frame, u, c: col, t, at, stage } = P;
  const src = useImg();
  const p = frame / Math.max(1, P.dur);
  const dirn = P.scene.variant % 2 ? -1 : 1;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Pic src={src} w={t.W} h={t.H} icon={c.icon} style={{ transform: `scale(${1.08 + 0.12 * p}) translateX(${dirn * 40 * u * p}px)` }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: t.H * 0.6, backgroundImage: `linear-gradient(0deg, ${withAlpha('#000000', 0.78)}, rgba(0,0,0,0))` }} />
      <div style={{ position: 'absolute', left: stage.x, width: stage.w, top: stage.y + stage.h * 0.55 }}>
        <Headline text={c.headline} start={at(c.headlineAt, 6)} size={0.8} maxLines={3} color="#FFFFFF" width={stage.w} />
        <div style={{ color: mix('#ffffff', col.accent, 0.3) }}><Sub text={c.sub} start={at(c.headlineAt, 6) + 12} color="#F1F1F1" /></div>
      </div>
    </>
  );
};

export const PhoneMockup = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, t, at } = P;
  const src = useImg();
  const p = m.enter(frame, 0);
  const h = Math.min(stage.h * 0.82, stage.w * 1.5);
  const w = h * 0.49;
  const tilt = interpolate(frame, [0, P.dur], [-6, 4]);
  return (
    <Stage>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 * u, flexDirection: t.orientation === 'landscape' ? 'row' : 'column' }}>
        <div style={{ width: w, height: h, borderRadius: w * 0.16, backgroundColor: '#0E0E12', padding: w * 0.045, boxShadow: t.shadow(1.4), transform: `translateY(${(1 - p) * 300 * u}px) rotate(${tilt}deg)` }}>
          <div style={{ width: '100%', height: '100%', borderRadius: w * 0.12, overflow: 'hidden', backgroundColor: col.surface, position: 'relative' }}>
            {src ? <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 * u, backgroundImage: `linear-gradient(160deg, ${col.primary}, ${col.accent})` }}>
                <Icon id={c.icon ?? 'phone'} size={w * 0.4} color={col.textOnPrimary} />
                {(c.items ?? []).slice(0, 3).map((_it, i) => (
                  <div key={i} style={{ width: w * 0.7, height: 34 * u, borderRadius: 17 * u, backgroundColor: withAlpha('#ffffff', 0.25), opacity: m.enterC(frame, 10 + i * 5) }} />
                ))}
              </div>
            )}
            <div style={{ position: 'absolute', top: w * 0.03, left: '50%', marginLeft: -w * 0.15, width: w * 0.3, height: w * 0.07, borderRadius: w * 0.04, backgroundColor: '#0E0E12' }} />
          </div>
        </div>
        <div style={{ maxWidth: t.orientation === 'landscape' ? stage.w * 0.45 : stage.w }}>
          <Headline text={c.headline} start={at(c.headlineAt, 8)} size={0.76} maxLines={2} width={t.orientation === 'landscape' ? stage.w * 0.45 : stage.w} />
        </div>
      </div>
    </Stage>
  );
};

export const LaptopMockup = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, at } = P;
  const src = useImg();
  const w = stage.w * 0.96;
  const h = w * 0.62;
  const open = clamp01(m.enter(frame, 0, m.base * 1.5));
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 4)} size={0.76} maxLines={2} align="center" />
      <div style={{ height: 40 * u }} />
      <div style={{ width: w * 0.86, height: h * 0.86, borderRadius: 24 * u, backgroundColor: '#111', padding: 18 * u, transform: `scaleY(${0.15 + 0.85 * open})`, transformOrigin: 'bottom' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 10 * u, overflow: 'hidden', backgroundImage: `linear-gradient(135deg, ${col.primary}, ${col.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {src ? <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon id={c.icon ?? 'laptop'} size={h * 0.35} color={col.textOnPrimary} />}
        </div>
      </div>
      <div style={{ width: w, height: 30 * u, borderRadius: `0 0 ${30 * u}px ${30 * u}px`, backgroundImage: 'linear-gradient(180deg, #d9d9de, #9a9aa2)' }} />
      <Sub text={c.sub} start={at(c.headlineAt, 4) + 14} />
    </Stage>
  );
};

/** Before/after with a sliding divider (moves right→left for Arabic reading order). */
export const BeforeAfter = () => {
  const P = usePrim();
  const { content: c, frame, u, c: col, stage, t, at, itemStart } = P;
  const a = useImg(0), b = useImg(1);
  const items = c.items ?? [];
  const sb = itemStart(1, items[1] ?? { text: '' }, 2);
  const w = stage.w * 0.94, h = Math.min(stage.h * 0.62, w * 1.15);
  const pos = interpolate(frame, [sb - 6, sb + 18], [1, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const side = (src: string | null, label: string, tone: string, icon: string) => (
    <div style={{ position: 'absolute', inset: 0 }}>
      {src ? <Img src={src} style={{ width: w, height: h, objectFit: 'cover' }} /> : <div style={{ width: w, height: h, backgroundImage: `linear-gradient(160deg, ${mix(tone, col.bg[0]!, 0.55)}, ${mix(tone, col.bg[0]!, 0.85)})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon id={icon} size={h * 0.35} /></div>}
      <div style={{ position: 'absolute', bottom: 24 * u, right: 24 * u, left: 24 * u, display: 'flex', justifyContent: 'center' }}><Chip text={label} bg={tone} color="#fff" /></div>
    </div>
  );
  return (
    <Stage>
      <Headline text={c.headline} start={at(c.headlineAt, 2)} size={0.76} maxLines={2} align="center" />
      <div style={{ height: 30 * u }} />
      <div style={{ position: 'relative', width: w, height: h, borderRadius: t.radius(1), overflow: 'hidden', boxShadow: t.shadow(1) }}>
        {side(a, items[0]?.text ?? 'قبل', col.bad, items[0]?.icon ?? 'sad')}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: w * (1 - pos), overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: w, height: h }}>{side(b, items[1]?.text ?? 'بعد', col.good, items[1]?.icon ?? 'smile')}</div>
        </div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: w * (1 - pos) - 4 * u, width: 8 * u, backgroundColor: '#fff' }} />
        <div style={{ position: 'absolute', top: h / 2 - 40 * u, left: w * (1 - pos) - 40 * u, width: 80 * u, height: 80 * u, borderRadius: 40 * u, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadow(0.5) }}>
          <svg width={44 * u} height={44 * u} viewBox="0 0 24 24"><path d="M9 6 L3 12 L9 18 M15 6 L21 12 L15 18" fill="none" stroke="#222" strokeWidth={2.4} strokeLinecap="round" /></svg>
        </div>
      </div>
    </Stage>
  );
};

export const Collage = () => {
  const P = usePrim();
  const { content: c, frame, m, u, stage, t, at, c: col } = P;
  const imgs = P.scene.images.length ? P.scene.images : [null, null, null];
  const n = Math.min(4, Math.max(3, imgs.length));
  const size = Math.min(stage.w * 0.5, stage.h * 0.36);
  const spots = [[-0.22, -0.18, -8], [0.2, -0.12, 6], [-0.1, 0.18, 4], [0.22, 0.22, -5]] as const;
  return (
    <Stage>
      <div style={{ position: 'relative', width: stage.w, height: stage.h * 0.72 }}>
        {Array.from({ length: n }, (_, i) => {
          const [dx, dy, rot] = spots[i]!;
          const p = m.enter(frame, 2 + i * m.stagger * 2);
          const src = imgs[i]?.src ?? null;
          return (
            <div key={i} style={{ position: 'absolute', left: stage.w / 2 + dx * stage.w - size / 2, top: stage.h * 0.36 + dy * stage.h - size / 2, transform: `rotate(${rot * clamp01(p)}deg) scale(${0.4 + 0.6 * p})`, opacity: clamp01(p * 2), backgroundColor: '#fff', padding: 12 * u, boxShadow: t.shadow(1) }}>
              <Pic src={src} w={size} h={size} icon={(c.icons ?? [])[i] ?? c.icon} />
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', bottom: 0, width: stage.w }}>
        <Headline text={c.headline} start={at(c.headlineAt, 10)} size={0.76} maxLines={2} align="center" color={col.text} />
      </div>
    </Stage>
  );
};

export const PolaroidStack = () => {
  const P = usePrim();
  const { content: c, frame, m, u, stage, t, at } = P;
  const items = (c.items ?? [{ text: c.headline ?? '' }]).slice(0, 3);
  const w = Math.min(stage.w * 0.66, stage.h * 0.48);
  return (
    <Stage>
      <div style={{ position: 'relative', width: w + 60 * u, height: w * 1.25 + 60 * u }}>
        {items.map((it, i) => {
          const s = P.itemStart(i, it, items.length);
          const p = m.enter(frame, s);
          const rot = [-7, 5, -2][i]!;
          const src = P.scene.images[i]?.src ?? null;
          return (
            <div key={i} style={{ position: 'absolute', left: 30 * u, top: 30 * u, width: w, backgroundColor: '#FDFDFB', padding: `${18 * u}px ${18 * u}px ${80 * u}px`, boxShadow: t.shadow(1), transform: `translateY(${(1 - p) * -600 * u}px) rotate(${rot}deg)`, opacity: clamp01(p * 3) }}>
              <Pic src={src} w={w - 36 * u} h={w - 36 * u} icon={it.icon ?? c.icon} />
              <div style={{ position: 'absolute', bottom: 14 * u, left: 18 * u, right: 18 * u }}>
                <FitText text={it.text} role="body" maxWidth={w - 36 * u} maxSize={44 * u} maxLines={1} color="#222" weight={700} />
              </div>
            </div>
          );
        })}
      </div>
      <Sub text={c.sub} start={at(c.headlineAt, 20)} />
    </Stage>
  );
};

/** Product hero: floating product with floor shadow + glow, fake turntable by scaleX, price chip. */
export const ProductHero = () => {
  const P = usePrim();
  const { content: c, frame, m, u, c: col, stage, t, at } = P;
  const src = useImg();
  const p = m.enter(frame, 0, m.base * 1.4);
  const size = Math.min(stage.w * 0.86, stage.h * 0.6);
  const float = Math.sin(frame / 14) * 14 * u;
  const turn = P.scene.variant % 2 === 1 ? 0.88 + 0.12 * Math.cos(frame / 22) : 1;
  const start = at(c.headlineAt, 6);
  return (
    <Stage>
      <div style={{ position: 'relative', width: size, height: size * 1.08 }}>
        <div style={{ position: 'absolute', left: size * 0.1, top: size * 0.05, width: size * 0.8, height: size * 0.8, borderRadius: '50%', backgroundColor: withAlpha(col.primary, 0.35), filter: `blur(${70 * u}px)`, opacity: clamp01(p) }} />
        <div style={{ position: 'absolute', left: size * 0.2, bottom: 0, width: size * 0.6, height: size * 0.08, borderRadius: '50%', backgroundColor: withAlpha('#000000', 0.35), filter: `blur(${14 * u}px)`, transform: `scaleX(${1 - float / (120 * u)})` }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, transform: `translateY(${(1 - p) * 200 * u + float}px) scaleX(${turn}) scale(${0.7 + 0.3 * clamp01(p)})`, opacity: clamp01(p * 2) }}>
          {src ? <Img src={src} style={{ width: size, height: size, objectFit: 'contain' }} /> : <IllustrationFallback icon={c.icon ?? 'box'} size={size} />}
        </div>
      </div>
      <Headline text={c.headline} start={start} size={0.7} maxLines={2} align="center" />
      {c.price !== undefined && (
        <div style={{ marginTop: 18 * u, opacity: m.enterC(frame, start + 10), transform: `scale(${m.enter(frame, start + 10)})` }}>
          <Chip text={`${formatNumber(c.price, 0, t.digits)} ${c.currency ?? 'دج'}`} size={56 * u} />
        </div>
      )}
      <Sub text={c.sub} start={start + 14} />
    </Stage>
  );
};
