/**
 * Word-synced captions (talking-head / voice-over videos). One line at a time, the spoken word lit with the keyword
 * colour. Arabic words are never split; RTL line; line-height ≥ 1.35; stays inside the platform-safe area.
 */
import { AbsoluteFill } from 'remotion';
import { prog, ease } from './anim';
import { useT, useVideo } from './context';

export const Captions = () => {
  const { input, T, W, H, u, portrait } = useVideo();
  const t = useT();
  const c = input.captions;
  if (!c) return null;
  const line = T.lines.find((l) => t >= l.start - 0.1 && t <= l.end + 0.35);
  if (!line) return null;
  const size = { s: 44, m: 56, l: 70 }[c.size] * u;
  const k = prog(t, line.start - 0.1, line.start + 0.12, ease.outCubic);
  const out = prog(t, line.end + 0.2, line.end + 0.35, ease.inCubic);
  const top = c.position === 'top' ? H * (portrait ? 0.14 : 0.08) : c.position === 'middle' ? H * 0.5 - size : H * (portrait ? 0.72 : 0.8);
  const key = c.keywordColor || '#FFB45C';
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top,
          left: W * 0.08,
          right: W * 0.08,
          display: 'flex',
          justifyContent: 'center',
          opacity: k * (1 - out),
          transform: `translateY(${(1 - k) * 16 * u}px)`,
        }}
      >
        <div
          style={{
            fontFamily: 'Readex Pro, IBM Plex Sans Arabic, sans-serif',
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.4,
            color: '#fff',
            textAlign: 'center',
            padding: `${0.18 * size}px ${0.4 * size}px`,
            borderRadius: 0.3 * size,
            background: 'rgba(0,0,0,0.55)',
            maxWidth: '100%',
          }}
        >
          {line.words.map((w, i) => {
            const on = t >= w.start && t < (line.words[i + 1]?.start ?? line.end + 0.35);
            return (
              <span key={w.id} style={{ color: on ? key : '#fff', unicodeBidi: 'isolate' }}>
                {w.w}
                {i < line.words.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
