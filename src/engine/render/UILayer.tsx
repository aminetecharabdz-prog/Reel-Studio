import { useCurrentFrame } from 'remotion';
import type { CLayer } from '../compile';
import type { UIL } from '../schema';
import { detectDir, fmtNum, toDigits } from '../text';
import { alpha, mixHex, onColor, useTheme } from './theme';
import { clamp01, enter, exitP, popSpring } from './anim';

/** UI pieces common in marketing reels: badge, price, button, notification, chat, checklist, progress, rating… */
export const UILayerView = ({ l }: { l: CLayer & UIL }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const { W, H, u, fps } = t;
  if (frame < l.inF) return null;
  const out = exitP(frame, l.outF, fps);
  if (out <= 0) return null;
  const s = popSpring(frame, l.inF, fps);
  const p = clamp01(enter(frame, l.inF, t.style.motion, fps));
  const body = t.font('body');
  const disp = t.font('display');
  const imp = t.font('impact');
  const acc = t.color(l.color);
  const onAcc = onColor(acc);
  const ink = t.color('ink');
  const card = t.tone === 'light' ? '#FFFFFF' : mixHex(t.style.palette.dark, '#FFFFFF', 0.08);
  const onCard = onColor(card);
  const w = l.w * W;
  const dir = detectDir(`${l.title} ${l.sub}`);
  const shadow = `0 ${24 * u}px ${60 * u}px ${alpha('#000000', t.tone === 'light' ? 0.18 : 0.5)}`;
  let el: React.ReactNode = null;
  const num = (v: number) => toDigits(fmtNum(v), t.digits);
  switch (l.kind) {
    case 'badge':
      el = <div dir={dir} style={{ display: 'inline-block', backgroundColor: acc, color: onAcc, fontFamily: disp.family, fontWeight: disp.weight, fontSize: 54 * u, padding: `${14 * u}px ${38 * u}px`, borderRadius: 999, boxShadow: shadow }}>{l.title}</div>;
      break;
    case 'button':
      el = <div dir={dir} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 * u, backgroundColor: acc, color: onAcc, fontFamily: disp.family, fontWeight: disp.weight, fontSize: 58 * u, padding: `${26 * u}px ${44 * u}px`, borderRadius: 999, boxShadow: `0 ${18 * u}px ${50 * u}px ${alpha(acc, 0.45)}`, transform: `scale(${1 + Math.sin((frame - l.inF) / 6) * 0.025})` }}>{l.title}<span style={{ fontFamily: 'sans-serif' }}>{dir === 'rtl' ? '←' : '→'}</span></div>;
      break;
    case 'price': {
      const strike = clamp01((frame - l.inF - 6) / 8);
      const slam = popSpring(frame, l.inF + 10, fps);
      el = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 * u }}>
          {l.oldValue !== undefined && (
            <div dir="rtl" style={{ position: 'relative', fontFamily: body.family, fontWeight: 700, fontSize: 96 * u, color: alpha(ink.length === 7 ? ink : '#FFFFFF', 0.6) }}>
              <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{num(l.oldValue)}</span> {l.sub || 'دج'}
              <span style={{ position: 'absolute', left: '-6%', top: '52%', height: 8 * u, width: `${strike * 112}%`, backgroundColor: t.style.palette.accent2, borderRadius: 4, transform: 'rotate(-7deg)' }} />
            </div>
          )}
          <div dir="rtl" style={{ backgroundColor: acc, color: onAcc, fontFamily: imp.family, fontWeight: imp.weight, fontSize: 220 * u, lineHeight: 1.05, padding: `${14 * u}px ${60 * u}px`, borderRadius: 30 * u, transform: `scale(${0.4 + 0.6 * slam}) rotate(${(1 - slam) * -10}deg)`, opacity: clamp01(slam * 2), boxShadow: shadow }}>
            <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{num(l.value ?? 0)}</span> <span style={{ fontSize: 90 * u }}>{l.sub || 'دج'}</span>
          </div>
        </div>
      );
      break;
    }
    case 'notification':
      el = (
        <div dir={dir} style={{ display: 'flex', gap: 22 * u, alignItems: 'center', backgroundColor: alpha(card, 0.94), color: onCard, borderRadius: 34 * u, padding: `${24 * u}px ${28 * u}px`, boxShadow: shadow, width: w }}>
          <div style={{ width: 116 * u, height: 116 * u, flex: 'none', borderRadius: 24 * u, backgroundImage: `linear-gradient(135deg, ${t.style.palette.accent}, ${t.style.palette.accent2})` }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: body.family, fontWeight: 700, fontSize: 50 * u }}>{l.title}</div>
            <div style={{ fontFamily: body.family, fontWeight: 400, fontSize: 40 * u, opacity: 0.75 }}>{l.sub}</div>
          </div>
        </div>
      );
      break;
    case 'chat':
      el = (
        <div dir={dir} style={{ display: 'flex', flexDirection: 'column', gap: 16 * u, width: w }}>
          {[l.title, ...l.items.map((i) => i.t)].filter(Boolean).map((m, k) => {
            const f0 = k === 0 ? l.inF : l.itemF?.[k - 1] ?? l.inF + k * 10;
            if (frame < f0) return null;
            const q = popSpring(frame, f0, fps);
            const me = k % 2 === 1;
            return <div key={k} style={{ alignSelf: me ? 'flex-start' : 'flex-end', maxWidth: '82%', backgroundColor: me ? acc : card, color: me ? onAcc : onCard, fontFamily: body.family, fontWeight: 600, fontSize: 42 * u, padding: `${18 * u}px ${28 * u}px`, borderRadius: 36 * u, transform: `scale(${q})`, transformOrigin: me ? 'left bottom' : 'right bottom', boxShadow: shadow }}>{m}</div>;
          })}
        </div>
      );
      break;
    case 'checklist':
      el = (
        <div dir={dir} style={{ display: 'flex', flexDirection: 'column', gap: 22 * u, width: w, backgroundColor: card, color: onCard, borderRadius: 36 * u, padding: 36 * u, boxShadow: shadow }}>
          {l.title && <div style={{ fontFamily: disp.family, fontWeight: disp.weight, fontSize: 54 * u }}>{l.title}</div>}
          {l.items.map((it, k) => {
            const f0 = l.itemF?.[k] ?? l.inF + k * 8;
            const on = clamp01((frame - f0) / 8);
            const good = it.good !== false;
            const col = good ? '#20C67A' : '#FF4D4D';
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 20 * u, opacity: 0.35 + 0.65 * on }}>
                <div style={{ width: 64 * u, height: 64 * u, flex: 'none', borderRadius: 18 * u, border: `${5 * u}px solid ${col}`, backgroundColor: on > 0 ? col : 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 40 * u, fontWeight: 900 }}>{on > 0 ? (good ? '✓' : '✕') : ''}</div>
                <div style={{ fontFamily: body.family, fontWeight: 700, fontSize: 44 * u, textDecoration: !good && on >= 1 ? 'line-through' : undefined }}>{it.t}</div>
              </div>
            );
          })}
        </div>
      );
      break;
    case 'progress': {
      const v = Math.max(0, Math.min(100, l.value ?? 70));
      const q = clamp01((frame - l.inF) / Math.round(0.9 * fps));
      el = (
        <div dir={dir} style={{ width: w }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: disp.family, fontWeight: disp.weight, fontSize: 48 * u, color: ink, marginBottom: 14 * u }}><span>{l.title}</span><span dir="ltr">{toDigits(String(Math.round(v * (1 - Math.pow(1 - q, 3)))), t.digits)}%</span></div>
          <div style={{ height: 40 * u, borderRadius: 999, backgroundColor: alpha(ink.length === 7 ? ink : '#FFFFFF', 0.14), overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${v * (1 - Math.pow(1 - q, 3))}%`, borderRadius: 999, backgroundImage: `linear-gradient(90deg, ${t.style.palette.accent2}, ${t.style.palette.accent})`, marginInlineStart: dir === 'rtl' ? 'auto' : 0 }} />
          </div>
        </div>
      );
      break;
    }
    case 'rating': {
      const r = l.value ?? 5;
      el = (
        <div dir="ltr" style={{ display: 'flex', gap: 14 * u, justifyContent: 'center' }}>
          {[0, 1, 2, 3, 4].map((i) => { const q = popSpring(frame, l.inF + i * 4, fps); return <svg key={i} width={110 * u} height={110 * u} viewBox="0 0 24 24" style={{ transform: `scale(${q})` }}><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2 6.1 20.5l1.4-6.6-5-4.5 6.6-.7z" fill={i < Math.round(r) ? '#FFC43D' : alpha('#FFFFFF', 0.2)} /></svg>; })}
        </div>
      );
      break;
    }
    case 'profile':
      el = (
        <div dir={dir} style={{ width: w, backgroundColor: card, color: onCard, borderRadius: 40 * u, padding: 34 * u, boxShadow: shadow, display: 'flex', gap: 26 * u, alignItems: 'center' }}>
          <div style={{ width: 130 * u, height: 130 * u, flex: 'none', borderRadius: '50%', backgroundImage: `linear-gradient(135deg, ${t.style.palette.accent}, ${t.style.palette.accent2})`, border: `${6 * u}px solid ${card}`, boxShadow: `0 0 0 ${5 * u}px ${t.style.palette.accent}` }} />
          <div>
            <div style={{ fontFamily: disp.family, fontWeight: disp.weight, fontSize: 50 * u }}>{l.title}</div>
            <div style={{ fontFamily: body.family, fontSize: 36 * u, opacity: 0.7 }}>{l.sub}</div>
          </div>
        </div>
      );
      break;
    case 'search': {
      const n = Math.floor(clamp01((frame - l.inF - 4) / Math.max(8, l.title.length * 1.6)) * l.title.length);
      el = <div dir={dir} style={{ width: w, backgroundColor: card, color: onCard, borderRadius: 999, padding: `${26 * u}px ${40 * u}px`, boxShadow: shadow, fontFamily: body.family, fontWeight: 600, fontSize: 46 * u, display: 'flex', alignItems: 'center', gap: 20 * u }}><span style={{ opacity: 0.6 }}>⌕</span>{l.title.slice(0, n)}<span style={{ width: 4 * u, height: 50 * u, backgroundColor: acc, opacity: Math.floor(frame / 8) % 2 }} /></div>;
      break;
    }
    case 'timer': {
      const secs = Math.max(0, Math.round((l.value ?? 10) - (frame - l.inF) / fps));
      el = <div dir="ltr" style={{ fontFamily: imp.family, fontWeight: imp.weight, fontSize: 180 * u, color: acc, letterSpacing: '0.02em' }}>{`00:${String(secs).padStart(2, '0')}`}</div>;
      break;
    }
    case 'stat':
      el = (
        <div dir={dir} style={{ textAlign: 'center' }}>
          <div dir="ltr" style={{ fontFamily: imp.family, fontWeight: imp.weight, fontSize: 200 * u, color: acc, lineHeight: 1 }}>{toDigits(fmtNum((l.value ?? 0) * clamp01((frame - l.inF) / 20)), t.digits)}{l.sub}</div>
          <div style={{ fontFamily: body.family, fontWeight: 700, fontSize: 48 * u, color: ink }}>{l.title}</div>
        </div>
      );
      break;
  }
  const tr = l.anim === 'slide-left' ? `translateX(${(1 - p) * -W * 0.7}px)` : l.anim === 'slide-right' ? `translateX(${(1 - p) * W * 0.7}px)` : l.anim === 'float' ? `translateY(${(1 - p) * 120 * u}px)` : l.anim === 'drop' ? `translateY(${(1 - s) * -H * 0.4}px)` : `scale(${0.5 + 0.5 * s})`;
  return (
    <div style={{ position: 'absolute', left: l.x * W - w / 2, top: l.y * H, width: w, display: 'flex', justifyContent: 'center', transform: `translateY(-50%) ${tr} rotate(${l.rotate}deg)`, opacity: out * l.opacity * clamp01(s * 2.5) }}>
      {el}
    </div>
  );
};
