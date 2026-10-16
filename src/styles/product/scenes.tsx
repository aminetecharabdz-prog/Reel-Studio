/** product style scene vocabulary. Each scene renders inside its own <Sequence>, so frames are scene-local. */
import { AbsoluteFill, Img } from 'remotion';
import { E, clamp01, keys, mix, prog, sec, useScene as useSceneBase } from '@/engine/scene';
import { detectDir, measure } from '@/engine/measure';
import { glow } from '@/engine/paint';
import { ACCENTS, T, type AccentId } from './tokens';
import { FAMILY, Grad, KLine, Mark, NeonFrame, Stage, W_BOLD, fitSize, type LWord } from './parts';
import { Icon } from '@/art/icons';
import type { ProductPlan, ProductScene } from './schema';

type Of<K extends ProductScene['kind']> = Extract<ProductScene, { kind: K }>;
export type SceneProps<K extends ProductScene['kind']> = { s: Of<K>; from: number; dur: number; plan: ProductPlan };

const useScene = useSceneBase;
const lineSize = (vertical: boolean, u: number) => (vertical ? 84 : 66) * u;

/* ───────────────────────── words: giant word → line ───────────────────────── */
export const WordsView = ({ s, from, dur, plan }: SceneProps<'words'>) => {
  const { at, H, u, vertical } = useScene(from);
  const rows: LWord[][] = s.rows.map((r) => r.map((w) => ({ t: w.t, f: at(w.at), em: w.em })));
  return (
    <AbsoluteFill>
      <Stage theme={s.theme} />
      <KLine rows={rows} size={lineSize(vertical, u) * (s.echo ? 1.5 : 1)} giant={s.giant} theme={s.theme} accent={plan.accent} exitAt={dur} y={H * (vertical ? 0.42 : 0.4)} echo={s.echo} />
    </AbsoluteFill>
  );
};

/* ───────────────────────── punch: one giant word at a time ───────────────────────── */
export const PunchView = ({ s, from, dur, plan }: SceneProps<'punch'>) => {
  const { f, at, W, H, u, fps, vertical } = useScene(from);
  const ws = s.words.map((w) => ({ ...w, f: at(w.at) }));
  return (
    <AbsoluteFill>
      <Stage theme="dark" />
      {ws.map((w, i) => {
        const end = ws[i + 1]?.f ?? dur;
        if (f < w.f - sec(0.1, fps) || f > end + 2) return null;
        const k = prog(f, w.f - sec(0.08, fps), sec(0.35, fps), E.out);
        const out = prog(f, end - sec(0.22, fps), sec(0.22, fps), E.in);
        const size = Math.min(fitSize(w.t, W * (vertical ? 0.74 : 0.42)), H * 0.2, 300 * u);
        const color = w.em === 'accent' || w.em === 'grad' ? ACCENTS[plan.accent].a : T.text;
        return (
          <AbsoluteFill key={i} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div dir="rtl" style={{ position: 'absolute', top: H * 0.4, transform: `translateY(-50%) scale(${mix(k, 1.12, 1) * mix(out, 1, 0.94)})`, fontFamily: T.font, fontWeight: W_BOLD, fontSize: size, lineHeight: 1.4, opacity: k * (1 - out), filter: `blur(${(1 - k) * 22 * u + out * 16 * u}px)`, whiteSpace: 'nowrap' }}>
              {w.em === 'grad' ? <Grad grad={ACCENTS[plan.accent].grad}>{w.t}</Grad> : <span style={{ color }}>{w.t}</span>}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────────────────── prompt: neon box, typing, send ───────────────────────── */
const wrap = (text: string, maxW: number, size: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(next, FAMILY, 500, size) > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
};

export const PromptView = ({ s, from, dur, plan }: SceneProps<'prompt'>) => {
  const { f, at, end, range, W, H, u, fps, vertical } = useScene(from);
  const bw = vertical ? W * 0.9 : W * 0.66;
  const pad = 34 * u;
  const btn = (vertical ? 92 : 76) * u;
  const innerW = bw - pad * 3 - btn;
  let size = (vertical ? 50 : 40) * u;
  let lines = wrap(s.text, innerW, size);
  const maxLines = vertical ? 3 : 1;
  while (lines.length > maxLines && size > 26 * u) {
    size *= 0.92;
    lines = wrap(s.text, innerW, size);
  }
  if (!vertical && lines.length > 1) {
    size = Math.max(24 * u, (size * innerW) / measure(s.text, FAMILY, 500, size));
    lines = [s.text];
  }
  const lh = size * 1.55;
  const bh = Math.max(vertical ? 150 * u : 116 * u, lines.length * lh + pad * 1.6);
  const t0 = at(s.typeFrom);
  const t1 = Math.max(t0 + sec(0.6, fps), end(s.typeTo, t0));
  const draw = prog(f, 0, sec(0.9, fps), E.inOut);
  // typing is WORD by word (never letters): word j of the prompt appears on its spoken word
  const spoken = range(s.typeFrom, s.typeTo);
  const lineWords = lines.map((l) => l.split(' '));
  const nWords = lineWords.reduce((a, l) => a + l.length, 0);
  const wordAt = (j: number) => {
    if (!spoken.length) return t0 + ((t1 - t0) * j) / Math.max(1, nWords);
    const k = nWords <= 1 ? 0 : Math.round((j * (spoken.length - 1)) / (nWords - 1));
    return spoken[Math.min(spoken.length - 1, k)]!.s;
  };
  const shown = Array.from({ length: nWords }, (_, j) => f >= wordAt(j) - 1).filter(Boolean).length;
  const tdir = detectDir(s.text, 'rtl');
  const send = s.send ? at(s.send) : t1 + sec(0.5, fps);
  const press = prog(f, send - sec(0.06, fps), sec(0.12, fps), E.out) * (1 - prog(f, send + sec(0.1, fps), sec(0.2, fps), E.out));
  const flash = prog(f, send, sec(0.25, fps), E.out) * (1 - prog(f, send + sec(0.3, fps), sec(0.8, fps), E.inOut));
  const cursorK = prog(f, send - sec(0.7, fps), sec(0.6, fps), E.inOut);
  const zoom = keys(f, [[0, vertical ? 1.5 : 1.9], [t0, vertical ? 1.5 : 1.9], [t1, 1], [dur, 0.96]], E.sine);
  const exit = prog(f, dur - sec(0.4, fps), sec(0.4, fps), E.in);
  const cx = W / 2, cy = H * (vertical ? 0.44 : 0.5);
  const originX = cx + bw / 2 - pad; // start of the line (RTL: the right edge)
  return (
    <AbsoluteFill>
      <Stage theme="dark" warm={flash} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${originX}px ${cy}px`, opacity: 1 - exit, filter: exit > 0.01 ? `blur(${exit * 12 * u}px)` : undefined }}>
        <div style={{ position: 'absolute', left: cx - bw / 2, top: cy - bh / 2, width: bw, height: bh, borderRadius: bh / 2 > 80 * u ? 44 * u : bh / 2, background: 'rgba(14,12,24,0.72)' }}>
          <NeonFrame w={bw} h={bh} r={Math.min(bh / 2, vertical && lines.length > 1 ? 44 * u : bh / 2)} draw={draw} accent={plan.accent} strokeW={3 * u} glow={1 + flash * 1.5} />
          <div dir={tdir} style={{ position: 'absolute', [tdir === 'rtl' ? 'right' : 'left']: tdir === 'rtl' ? pad : pad * 1.6 + btn, top: (bh - lines.length * lh) / 2, width: innerW, fontFamily: T.font, fontWeight: 500, fontSize: size, lineHeight: `${lh}px`, color: T.text }}>
            {lineWords.map((lw, i) => {
              const before = lineWords.slice(0, i).reduce((x, l) => x + l.length, 0);
              const vis = Math.max(0, Math.min(lw.length, shown - before));
              const visW = vis ? measure(lw.slice(0, vis).join(' '), FAMILY, 500, size) : 0;
              const caretHere = shown >= nWords ? i === lineWords.length - 1 : shown >= before && shown < before + lw.length;
              const blink = Math.floor(f / (fps * 0.5)) % 2 === 0;
              return (
                <div key={i} style={{ position: 'relative', whiteSpace: 'nowrap', height: lh }}>
                  {lw.map((wd, j) => {
                    const on = before + j < shown;
                    const k = on ? prog(f, wordAt(before + j) - 1, sec(0.12, fps), E.out) : 0;
                    return (
                      <span key={j} style={{ opacity: k, filter: k < 1 ? `blur(${(1 - k) * 6 * u}px)` : undefined }}>
                        {wd}
                        {j < lw.length - 1 ? ' ' : ''}
                      </span>
                    );
                  })}
                  {caretHere && f >= t0 - sec(0.4, fps) && (shown < nWords || blink) ? <span style={{ position: 'absolute', top: lh * 0.2, [tdir === 'rtl' ? 'right' : 'left']: visW + (vis ? 8 : 0) * u, width: 4 * u, height: lh * 0.6, background: ACCENTS[plan.accent].a, borderRadius: 2 }} /> : null}
                </div>
              );
            })}
          </div>
          {/* send button (RTL: at the end of the line, on the left) */}
          <div style={{ position: 'absolute', left: pad * 0.7, top: bh / 2 - btn / 2, width: btn, height: btn, borderRadius: btn / 2, background: ACCENTS[plan.accent].grad, opacity: prog(f, t1 - sec(0.4, fps), sec(0.4, fps)), transform: `scale(${1 - press * 0.12})`, boxShadow: `0 0 ${(20 + flash * 60) * u}px ${ACCENTS[plan.accent].b}`, display: 'grid', placeItems: 'center' }}>
            <svg width={btn * 0.42} height={btn * 0.42} viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M11 6l-6 6 6 6" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* mouse cursor */}
          {cursorK > 0 ? (
            <svg width={52 * u} height={52 * u} viewBox="0 0 24 24" style={{ position: 'absolute', left: mix(cursorK, -W * 0.08, pad * 0.7 + btn * 0.55), top: mix(cursorK, bh + H * 0.12, bh / 2 + btn * 0.05), transform: `scale(${1 - press * 0.15})`, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.5))' }}>
              <path d="M4 2.5l15 9-6.6 1.4 3.8 7-2.6 1.4-3.8-7L4.6 19z" fill={T.violetLight} stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" />
            </svg>
          ) : null}
        </div>
      </AbsoluteFill>
      {flash > 0 ? <div style={{ position: 'absolute', left: cx - bw / 2 + pad + btn / 2 - W * 0.9, top: cy - W * 0.9, width: W * 1.8, height: W * 1.8, background: glow(`rgba(255,138,61,${0.35 * flash}), rgba(217,70,239,${0.12 * flash}) 40%, rgba(0,0,0,0) 100%`) }} /> : null}
    </AbsoluteFill>
  );
};

/* ───────────────────────── logo: mark pops, name opens from behind it ───────────────────────── */
export const LogoView = ({ s, from, dur, plan }: SceneProps<'logo'>) => {
  const { f, at, W, H, u, fps, vertical } = useScene(from);
  const t = at(s.at);
  const pop = prog(f, t - sec(0.12, fps), sec(0.45, fps), E.outBack);
  const open = prog(f, t + sec(0.25, fps), sec(0.6, fps), E.inOut);
  const tag = prog(f, t + sec(0.7, fps), sec(0.5, fps), E.out);
  const exit = prog(f, dur - sec(0.35, fps), sec(0.35, fps), E.in);
  const name = plan.brand.name;
  const dir = detectDir(name, 'rtl');
  const size = Math.min((vertical ? 140 : 92) * u, fitSize(name, W * (vertical ? 0.62 : 0.4)));
  const nameW = measure(name, FAMILY, W_BOLD, size) + 30 * u;
  const parts = name.split(' ');
  const ghost = name.toUpperCase();
  const ghostSize = Math.min(fitSize(ghost, W * 1.1), H * 0.32);
  return (
    <AbsoluteFill>
      <Stage theme="dark" />
      {s.ghost ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: H * 0.42, transform: `translateY(-50%) scale(${mix(prog(f, 0, dur, E.sine), 1.02, 1.08)})`, textAlign: 'center', fontFamily: T.font, fontWeight: 800, fontSize: ghostSize, color: 'rgba(255,255,255,0.045)', whiteSpace: 'nowrap', lineHeight: 1.3, opacity: prog(f, 0, sec(0.6, fps)) }}>{ghost}</div>
      ) : null}
      <AbsoluteFill style={{ opacity: 1 - exit, filter: exit > 0.01 ? `blur(${exit * 14 * u}px)` : undefined }}>
        <div dir={dir} style={{ position: 'absolute', top: H * 0.42, left: 0, right: 0, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ transform: `scale(${pop})`, opacity: clamp01(pop * 1.5), filter: `blur(${(1 - clamp01(pop)) * 10 * u}px)`, flex: 'none' }}>
            <Mark size={size * 1.15} accent={plan.accent} letter={plan.brand.mark} />
          </div>
          <div style={{ maxWidth: nameW * open, overflow: 'hidden', flex: 'none' }}>
            <div style={{ width: nameW, paddingInlineStart: 26 * u, fontFamily: T.font, fontWeight: W_BOLD, fontSize: size, lineHeight: 1.4, whiteSpace: 'nowrap', color: T.text, opacity: open }}>
              {parts.length > 1 ? (
                <>
                  {parts.slice(0, -1).join(' ')} <span style={{ color: ACCENTS[plan.accent].a }}>{parts[parts.length - 1]}</span>
                </>
              ) : (
                name
              )}
            </div>
          </div>
        </div>
        {s.tagline ? (
          <div dir="rtl" style={{ position: 'absolute', top: H * 0.42 + size * 1.05, left: 0, right: 0, textAlign: 'center', fontFamily: T.font, fontWeight: 300, fontSize: (vertical ? 52 : 34) * u, color: T.grey, opacity: tag, transform: `translateY(${(1 - tag) * 16 * u}px)`, lineHeight: 1.5 }}>
            {s.tagline}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────────────────── showcase: tilted window with a glowing edge ───────────────────────── */
export const ShowcaseView = ({ s, from, dur, plan }: SceneProps<'showcase'>) => {
  const { f, at, W, H, u, fps, vertical, asset } = useScene(from);
  const acc = ACCENTS[plan.accent];
  const wide = W > H * 1.2;
  const ww = vertical ? W * 0.86 : wide ? W * 0.8 : W * 0.84;
  const wh = vertical ? H * 0.58 : wide ? H * 0.74 : H * 0.6;
  const enter = prog(f, 0, sec(0.9, fps), E.out);
  const rx = keys(f, [[0, 26], [sec(1, fps), 16], [dur, 9]], E.sine);
  const ry = keys(f, [[0, vertical ? -22 : -26], [sec(1, fps), -14], [dur, vertical ? -4 : -6]], E.sine);
  const rz = keys(f, [[0, 4], [dur, 1]], E.sine);
  const z = keys(f, [[0, -380 * u], [sec(1, fps), -60 * u], [dur, 30 * u]], E.sine);
  const exit = prog(f, dur - sec(0.35, fps), sec(0.35, fps), E.in);
  const photo = asset(s.photo) ?? undefined;
  const title = s.title ?? plan.brand.name;
  const fs = ww / (vertical ? 640 : wide ? 1300 : 900);
  const stepK = s.steps.map((st) => prog(f, at(st.at) - sec(0.6, fps), sec(0.6, fps), E.inOut));
  const active = Math.max(0, stepK.filter((k) => k > 0).length - 1);
  const nav = s.steps.length >= 2 ? s.steps.map((st) => st.t) : ['الرئيسية', title.split(' ')[0] ?? 'المنتج', 'الطلبات', 'الإعدادات'];
  return (
    <AbsoluteFill>
      <Stage theme="dark" lift={0.06} />
      {/* one self-contained 3D transform (perspective() inside the transform) so the exporter draws it like the preview */}
      <AbsoluteFill style={{ opacity: enter * (1 - exit) }}>
        <div style={{ position: 'absolute', left: W / 2 - ww / 2, top: H * (vertical ? 0.43 : 0.47) - wh / 2, width: ww, height: wh, transform: `perspective(${1800 * u}px) translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` }}>
          {/* neon rim glow: layered box-shadows (exporter-safe) + crisp gradient border */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 36 * u, boxShadow: `0 0 ${36 * u}px ${10 * u}px rgba(217,70,239,0.45), ${-30 * u}px ${-20 * u}px ${60 * u}px rgba(255,138,61,0.35), ${30 * u}px ${30 * u}px ${70 * u}px rgba(47,91,255,0.45)` }} />
          <div style={{ position: 'absolute', inset: -2 * u, borderRadius: 36 * u, background: `linear-gradient(135deg, ${T.orangeLight}, ${T.pink} 35%, ${acc.b} 70%, ${T.blue})` }} />
          <div dir="rtl" style={{ position: 'absolute', inset: 0, borderRadius: 34 * u, background: 'linear-gradient(180deg, #121022 0%, #0B0A14 100%)', overflow: 'hidden', fontFamily: T.font, color: T.text }}>
            {/* title bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 84 * fs, boxSizing: 'border-box', padding: `0 ${30 * fs}px`, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 * fs }}>
                <Mark size={40 * fs} accent={plan.accent} letter={plan.brand.mark} glow={0} />
                <span style={{ fontWeight: 700, fontSize: 28 * fs }}>{plan.brand.name}</span>
              </div>
              <div dir="ltr" style={{ display: 'flex', gap: 10 * fs }}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((col) => <span key={col} style={{ width: 16 * fs, height: 16 * fs, borderRadius: 99, background: col, opacity: 0.85 }} />)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', height: `calc(100% - ${84 * fs}px)` }}>
              {!vertical ? (
                <div style={{ width: '19%', flex: 'none', borderInlineEnd: '1px solid rgba(255,255,255,0.06)', padding: `${22 * fs}px ${16 * fs}px`, display: 'flex', flexDirection: 'column', gap: 10 * fs }}>
                  {nav.slice(0, 5).map((n, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 * fs, padding: `${10 * fs}px ${12 * fs}px`, borderRadius: 12 * fs, background: i === active ? 'rgba(168,139,255,0.16)' : 'transparent', color: i === active ? T.text : T.grey, fontSize: 18 * fs, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <span style={{ width: 9 * fs, height: 9 * fs, borderRadius: 9, background: i === active ? acc.a : 'rgba(255,255,255,0.18)', flex: 'none' }} />
                      {n}
                    </div>
                  ))}
                </div>
              ) : null}
              <div style={{ flex: 1, minWidth: 0, padding: `${22 * fs}px ${26 * fs}px`, display: 'flex', flexDirection: 'column', gap: 18 * fs }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 * fs, padding: `${12 * fs}px ${18 * fs}px`, borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,139,255,0.22)', fontSize: 20 * fs, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <span style={{ width: 10 * fs, height: 10 * fs, borderRadius: 9, background: acc.a, boxShadow: `0 0 ${10 * fs}px ${acc.a}`, flex: 'none' }} />
                  {title}
                </div>
                {s.steps.length ? (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${vertical ? 2 : Math.min(4, s.steps.length)}, 1fr)`, gap: 12 * fs }}>
                    {s.steps.map((st, i) => {
                      const k = stepK[i]!;
                      const done = k >= 1;
                      const pop = prog(f, at(st.at), sec(0.3, fps), E.outBack);
                      return (
                        <div key={i} style={{ borderRadius: 16 * fs, background: i === active ? 'rgba(168,139,255,0.08)' : 'rgba(255,255,255,0.035)', border: `1px solid ${i === active ? 'rgba(168,139,255,0.35)' : 'rgba(255,255,255,0.07)'}`, padding: `${12 * fs}px ${14 * fs}px` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 * fs }}>
                            <span style={{ fontSize: 22 * fs, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.t}</span>
                            <span style={{ width: 24 * fs, height: 24 * fs, borderRadius: 99, flex: 'none', display: 'grid', placeItems: 'center', background: done ? '#34D399' : 'rgba(255,255,255,0.08)', transform: `scale(${done ? pop : 0.85})` }}>
                              {done ? <svg width={15 * fs} height={15 * fs} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
                            </span>
                          </div>
                          <div style={{ fontSize: 14 * fs, color: T.grey, marginTop: 4 * fs }}>{done ? 'مكتمل' : k > 0 ? `${Math.round(k * 100)}%` : 'في الانتظار'}</div>
                          <div style={{ marginTop: 8 * fs, height: 5 * fs, borderRadius: 9, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                            <div style={{ width: `${k * 100}%`, height: '100%', background: done ? '#34D399' : '#8B6CFF' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 14 * fs }}>
                  <div style={{ position: 'relative', flex: 1.7, minWidth: 0, borderRadius: 20 * fs, overflow: 'hidden', background: 'linear-gradient(0deg, rgba(108,59,255,0.55) 0%, rgba(47,91,255,0.18) 40%, rgba(11,10,20,1) 85%)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <PreviewArt f={f} fps={fps} photo={photo} accent={plan.accent} u={fs} name={plan.brand.name} />
                  </div>
                  {!vertical ? (
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 10 * fs }}>
                      {(['sparkles', 'chart', 'heart', 'star', 'bolt', 'gem'] as const).map((ic, i) => {
                        const k = prog(f, sec(0.5 + i * 0.08, fps), sec(0.4, fps), E.out);
                        const light = i % 3 === 1;
                        return (
                          <div key={ic} style={{ borderRadius: 12 * fs, background: light ? '#EEE9FF' : i % 3 === 2 ? 'linear-gradient(160deg,#1E2A5A,#121022)' : 'linear-gradient(160deg,#2A1E4A,#121022)', border: '1px solid rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', opacity: k, transform: `scale(${mix(k, 0.9, 1)})` }}>
                            <Icon id={ic} size={34 * fs} color={light ? acc.b : acc.a} width={1.8} />
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
                {/* timeline with a moving playhead */}
                <div style={{ position: 'relative', height: 26 * fs, borderRadius: 8 * fs, background: 'rgba(255,255,255,0.04)', display: 'flex', gap: 4 * fs, padding: 4 * fs, flex: 'none', marginBottom: vertical ? 70 * fs : 0 }}>
                  {[0.22, 0.14, 0.3, 0.18, 0.16].map((wd, i) => (
                    <div key={i} style={{ width: `${wd * 100}%`, borderRadius: 5 * fs, background: i % 2 ? 'rgba(168,139,255,0.35)' : 'rgba(47,91,255,0.35)' }} />
                  ))}
                  <div style={{ position: 'absolute', top: -4 * fs, bottom: -4 * fs, right: `${clamp01(f / Math.max(1, dur)) * 100}%`, width: 2 * fs, background: T.orangeLight, boxShadow: `0 0 ${8 * fs}px ${T.orangeLight}` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* chips + price float in front of the window (2D, always readable) */}
      <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: vertical ? H * 0.765 : H * 0.83, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 18 * u, padding: `0 ${40 * u}px`, opacity: 1 - exit }}>
        {s.price ? <Chip k={prog(f, at(s.price.at) - sec(0.05, fps), sec(0.45, fps), E.outBack)} big accent={plan.accent} u={u} vertical={vertical}>
          {s.price.old ? <span style={{ textDecoration: 'line-through', opacity: 0.55, fontWeight: 400, marginInlineEnd: 14 * u, fontSize: '0.7em' }}>{s.price.old}</span> : null}
          {s.price.t}
        </Chip> : null}
        {s.chips.map((ch, i) => (
          <Chip key={i} k={prog(f, at(ch.at) - sec(0.05, fps), sec(0.45, fps), E.outBack)} accent={plan.accent} u={u} vertical={vertical} icon={ch.icon} draw={prog(f, at(ch.at), sec(0.6, fps), E.inOut)}>
            {ch.t}
          </Chip>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Chip = ({ k, children, accent, u, vertical, big, icon, draw = 1 }: { k: number; children: React.ReactNode; accent: AccentId; u: number; vertical: boolean; big?: boolean; icon?: Parameters<typeof Icon>[0]['id']; draw?: number }) => {
  const fs = (vertical ? (big ? 54 : 38) : big ? 44 : 30) * u;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 * u, padding: `${(big ? 16 : 14) * u}px ${(big ? 34 : 26) * u}px`, borderRadius: 999, background: big ? ACCENTS[accent].grad : 'rgba(20,18,34,0.82)', border: big ? 'none' : `1.5px solid rgba(168,139,255,0.45)`, boxShadow: big ? `0 0 ${40 * u}px ${ACCENTS[accent].b}aa` : `0 0 ${24 * u}px rgba(108,59,255,0.35)`, color: '#fff', fontFamily: T.font, fontWeight: big ? 700 : 500, fontSize: fs, lineHeight: 1.35, whiteSpace: 'nowrap', transform: `scale(${clamp01(k) * 0.98 + 0.02}) translateY(${(1 - clamp01(k)) * 30 * u}px)`, opacity: clamp01(k * 1.4) }}>
      {icon ? <Icon id={icon} size={fs * 1.05} color={ACCENTS[accent].a} draw={draw} width={2} /> : null}
      <span>{children}</span>
    </div>
  );
};

/** Inside the window: the user's product photo on a glowing turntable, or a live "app preview" (ring + bars). */
const PreviewArt = ({ f, fps, photo, accent, u, name }: { f: number; fps: number; photo?: string; accent: AccentId; u: number; name: string }) => {
  const acc = ACCENTS[accent];
  const spin = (f / fps) * 18;
  if (photo) {
    const float = Math.sin(f / 22) * 8 * u;
    return (
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: 'absolute', width: `${62 + i * 18}%`, aspectRatio: '1', borderRadius: '50%', border: `1.5px solid rgba(168,139,255,${0.32 - i * 0.09})`, transform: `rotate(${spin * (i % 2 ? -1 : 1)}deg) scaleY(0.32)`, bottom: '4%' }} />
        ))}
        <Img src={photo} style={{ position: 'relative', maxWidth: '78%', maxHeight: '82%', objectFit: 'contain', transform: `translateY(${float}px)`, filter: `drop-shadow(0 ${30 * u}px ${40 * u}px rgba(0,0,0,0.6)) drop-shadow(0 0 ${30 * u}px ${acc.b}66)` }} />
      </AbsoluteFill>
    );
  }
  const k = clamp01(f / (fps * 2.5));
  const pct = Math.round(mix(E.out(k), 0, 94));
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 18 * u }}>
      <svg width={220 * u} height={220 * u} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none" />
        <circle cx="50" cy="50" r="42" stroke={acc.a} strokeWidth="7" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pct / 100} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', fontFamily: T.font, fontWeight: 700, fontSize: 64 * u, color: '#fff', direction: 'ltr' }}>
        {pct}
        <span style={{ fontSize: 30 * u, color: acc.a }}>%</span>
      </div>
      <div style={{ position: 'absolute', bottom: 18 * u, fontFamily: T.font, fontSize: 20 * u, color: T.grey }}>{name}</div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── capsule (light): words roll inside a pill, rings grow ───────────────────────── */
export const CapsuleView = ({ s, from, dur, plan }: SceneProps<'capsule'>) => {
  const { f, at, W, H, u, fps, vertical } = useScene(from);
  const acc = ACCENTS[plan.accent];
  const items = s.items.map((it) => ({ ...it, f: at(it.at) }));
  let idx = 0;
  items.forEach((it, i) => {
    if (f >= it.f - sec(0.1, fps)) idx = i;
  });
  const roll = items.reduce((a, it, i) => (i === 0 ? a : a + prog(f, it.f - sec(0.12, fps), sec(0.38, fps), E.inOut)), 0);
  const appear = prog(f, (items[0]?.f ?? 0) - sec(0.15, fps), sec(0.45, fps), E.outBack);
  const cw = (vertical ? 0.62 : 0.3) * W;
  const ch = (vertical ? 150 : 120) * u;
  const cy = H * (vertical ? 0.56 : 0.6);
  const titleRows: LWord[][] = [s.title.map((w) => ({ t: w.t, f: at(w.at), em: w.em }))];
  const rings = 1 + Math.round(roll * 1.0);
  const fsz = (vertical ? 64 : 50) * u;
  const exit = prog(f, dur - sec(0.3, fps), sec(0.3, fps), E.in);
  return (
    <AbsoluteFill>
      <Stage theme="light" />
      <KLine rows={titleRows} size={(vertical ? 66 : 50) * u} giant={titleRows[0]!.length > 1} theme="light" accent={plan.accent} exitAt={dur + sec(1, fps)} y={H * (vertical ? 0.3 : 0.27)} />
      <AbsoluteFill style={{ opacity: 1 - exit }}>
        {[3, 2, 1].map((r) => {
          const on = prog(f, (items[r]?.f ?? items[items.length - 1]!.f + 1e5) - sec(0.12, fps), sec(0.5, fps), E.outBack);
          const vis = r < rings + 1 ? on : 0;
          const grow = (34 + r * 30) * u * vis;
          return <div key={r} style={{ position: 'absolute', left: W / 2 - cw / 2 - grow, top: cy - ch / 2 - grow, width: cw + grow * 2, height: ch + grow * 2, borderRadius: 999, background: `rgba(${r === 1 ? '124,92,255,0.42' : r === 2 ? '150,125,255,0.22' : '168,139,255,0.12'})`, opacity: vis }} />;
        })}
        <div style={{ position: 'absolute', left: W / 2 - cw / 2, top: cy - ch / 2, width: cw, height: ch, borderRadius: 999, background: '#FFFFFF', border: `${3 * u}px solid ${acc.a}`, boxShadow: `0 ${12 * u}px ${40 * u}px rgba(108,59,255,0.25)`, overflow: 'hidden', transform: `scale(${appear})` }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: -roll * ch }}>
            {items.map((it, i) => (
              <div key={i} dir={detectDir(it.t, 'ltr')} style={{ height: ch, display: 'grid', placeItems: 'center', fontFamily: T.font, fontWeight: 700, fontSize: Math.min(fsz, fitSize(it.t, cw * 0.82)), color: i === idx ? acc.b : T.greyLight, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
                {it.t}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────────────────── cards: feature cards floating in depth, camera advances ───────────────────────── */
export const CardsView = ({ s, from, dur, plan }: SceneProps<'cards'>) => {
  const { f, at, W, H, u, fps, vertical } = useScene(from);
  const acc = ACCENTS[plan.accent];
  const n = s.cards.length;
  const camZ = keys(f, [[0, -200 * u], [dur, 380 * u]], E.sine);
  const camRy = keys(f, [[0, 8], [dur, -6]], E.sine);
  const titleRows: LWord[][] = s.title.length ? [s.title.map((w) => ({ t: w.t, f: at(w.at), em: w.em }))] : [];
  const cw = (vertical ? 0.4 : 0.22) * W;
  const chh = cw * 0.72;
  const exit = prog(f, dur - sec(0.35, fps), sec(0.35, fps), E.in);
  return (
    <AbsoluteFill>
      <Stage theme="dark" lift={0.05} />
      {titleRows.length ? <KLine rows={titleRows} size={(vertical ? 70 : 54) * u} giant={false} theme="dark" accent={plan.accent} exitAt={dur} y={H * (vertical ? 0.17 : 0.15)} /> : null}
      <AbsoluteFill style={{ opacity: 1 - exit }}>
        <div style={{ position: 'absolute', left: W / 2, top: H * (vertical ? 0.56 : 0.6) }}>
          {s.cards.map((cd, i) => {
            const k = prog(f, at(cd.at) - sec(0.15, fps), sec(0.55, fps), E.out);
            const cols = vertical ? 2 : 3;
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = (col - (Math.min(cols, n) - 1) / 2) * cw * (vertical ? 1.08 : 1.12) + (row % 2 ? cw * (vertical ? 0.1 : 0.3) : 0);
            const y = (row - (Math.ceil(n / cols) - 1) / 2) * chh * 1.2;
            const zz = -row * 160 * u + (col % 2 ? 60 * u : -40 * u);
            const light = i % 3 === 1;
            return (
              <div key={i} dir="rtl" style={{ position: 'absolute', left: -cw / 2, top: -chh / 2, width: cw, height: chh, transform: `perspective(${1400 * u}px) translateZ(${camZ}px) rotateY(${camRy}deg) translate3d(${x}px, ${y}px, ${zz + (1 - k) * -500 * u}px) rotateY(${(col - 1) * -10}deg)`, opacity: k, borderRadius: 26 * u, padding: 26 * u, boxSizing: 'border-box', background: light ? '#F4F2FF' : 'linear-gradient(160deg, #1A1730 0%, #0F0D1C 100%)', border: light ? 'none' : '1.5px solid rgba(168,139,255,0.25)', boxShadow: `0 ${20 * u}px ${50 * u}px rgba(0,0,0,0.55), 0 0 ${30 * u}px ${acc.b}33`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: T.font }}>
                <Icon id={cd.icon} size={chh * 0.38} color={light ? acc.b : acc.a} draw={prog(f, at(cd.at), sec(0.8, fps), E.inOut)} width={1.9} />
                <div style={{ fontWeight: 700, fontSize: Math.min((vertical ? 44 : 34) * u, fitSize(cd.t, cw - 52 * u)), color: light ? T.textDark : T.text, lineHeight: 1.35, whiteSpace: 'nowrap' }}>{cd.t}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────────────────── orb (light): steps pass over a glass orb, then a rolling list ───────────────────────── */
export const OrbView = ({ s, from, dur, plan }: SceneProps<'orb'>) => {
  const { f, at, W, H, u, fps, vertical } = useScene(from);
  const acc = ACCENTS[plan.accent];
  const steps = s.steps.map((st) => ({ ...st, f: at(st.at) }));
  const listStart = s.list.length ? at(s.list[0]!.at) - sec(0.3, fps) : dur + 1;
  const pos = steps.reduce((a, st, i) => (i === 0 ? a : a + prog(f, st.f - sec(0.15, fps), sec(0.4, fps), E.inOut)), 0);
  const orbR = (vertical ? 120 : 92) * u;
  const cy = H * (vertical ? 0.45 : 0.5);
  const gap = (vertical ? 330 : 300) * u;
  const appear = prog(f, 0, sec(0.6, fps), E.outBack);
  const orbOut = prog(f, listStart, sec(0.4, fps), E.in);
  const fsz = (vertical ? 52 : 42) * u;
  const row = (white: boolean) => (
    <div dir="rtl" style={{ position: 'absolute', top: cy, left: 0, right: 0, height: 0 }}>
      {steps.map((st, i) => {
        const x = W / 2 + (i - pos) * -gap; // RTL: later steps sit to the left and slide right into the orb
        const d = Math.abs(i - pos);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: 0, transform: 'translate(-50%, -50%)', fontFamily: T.font, fontWeight: white ? 700 : 500, fontSize: fsz, color: white ? '#FFFFFF' : T.textDark, opacity: white ? 1 : Math.max(0.12, 1 - d * 0.35), whiteSpace: 'nowrap', lineHeight: 1.4 }}>
            {st.t}
          </div>
        );
      })}
    </div>
  );
  return (
    <AbsoluteFill>
      <Stage theme="light" />
      <AbsoluteFill style={{ opacity: 1 - orbOut }}>
        {[2.6, 1.9, 1.35].map((r, i) => (
          <div key={i} style={{ position: 'absolute', left: W / 2 - orbR * r, top: cy - orbR * r, width: orbR * r * 2, height: orbR * r * 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(168,139,255,${0.05 + i * 0.05}) 60%, rgba(168,139,255,0) 100%)`, transform: `scale(${appear})` }} />
        ))}
        {row(false)}
        <div style={{ position: 'absolute', left: W / 2 - orbR, top: cy - orbR, width: orbR * 2, height: orbR * 2, borderRadius: '50%', transform: `scale(${appear})`, background: `radial-gradient(circle, #B49CFF 0%, ${acc.b} 40%, #3A1FB0 72%)`, boxShadow: `0 ${18 * u}px ${50 * u}px rgba(108,59,255,0.45), inset 0 0 ${30 * u}px rgba(255,255,255,0.25)` }} />
        <div style={{ position: 'absolute', inset: 0, clipPath: `circle(${orbR * appear}px at ${W / 2}px ${cy}px)` }}>{row(true)}</div>
        <div style={{ position: 'absolute', left: W / 2 - orbR * 0.55, top: cy - orbR * 0.75, width: orbR * 0.6, height: orbR * 0.32, borderRadius: '50%', background: glow('rgba(255,255,255,0.55), rgba(255,255,255,0)'), transform: `scale(${appear})` }} />
      </AbsoluteFill>
      {s.list.length ? <ListRoller items={s.list.map((l) => ({ t: l.t, f: at(l.at) }))} f={f} fps={fps} W={W} H={H} u={u} vertical={vertical} accent={plan.accent} start={listStart} /> : null}
    </AbsoluteFill>
  );
};

const ListRoller = ({ items, f, fps, W, H, u, vertical, accent, start }: { items: Array<{ t: string; f: number }>; f: number; fps: number; W: number; H: number; u: number; vertical: boolean; accent: AccentId; start: number }) => {
  const pos = items.reduce((a, it, i) => (i === 0 ? a : a + prog(f, it.f - sec(0.12, fps), sec(0.35, fps), E.inOut)), 0);
  const on = prog(f, start, sec(0.4, fps), E.out);
  const step = (vertical ? 120 : 90) * u;
  const fsz = (vertical ? 64 : 50) * u;
  return (
    <AbsoluteFill style={{ opacity: on }}>
      {items.map((it, i) => {
        const d = i - pos;
        const ad = Math.abs(d);
        if (ad > 2.2) return null;
        const big = Math.max(0, 1 - ad);
        return (
          <div key={i} dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: H * 0.45 + d * step, transform: `translateY(-50%) scale(${0.62 + 0.38 * big})`, textAlign: 'center', fontFamily: T.font, fontWeight: 700, fontSize: Math.min(fsz, fitSize(it.t, W * 0.8)), lineHeight: 1.4, opacity: Math.max(0.12, 1 - ad * 0.7), filter: ad > 0.3 ? `blur(${Math.min(3, ad * 2) * u}px)` : undefined, whiteSpace: 'nowrap' }}>
            {big > 0.5 ? <Grad grad={ACCENTS[accent].grad}>{it.t}</Grad> : <span style={{ color: T.greyLight }}>{it.t}</span>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────────────────── end: glass spheres orbit the mark, join, lockup ───────────────────────── */
export const EndView = ({ s, from, plan }: SceneProps<'end'>) => {
  const { f, at, W, H, u, fps, vertical } = useScene(from);
  const t = at(s.at);
  const join = prog(f, t - sec(0.5, fps), sec(0.5, fps), E.in);
  const lock = prog(f, t, sec(0.6, fps), E.inOut);
  const tag = prog(f, t + sec(0.5, fps), sec(0.5, fps), E.out);
  const cta = prog(f, t + sec(0.85, fps), sec(0.5, fps), E.outBack);
  const cy = H * (vertical ? 0.42 : 0.44);
  const mk = (vertical ? 190 : 120) * u;
  const name = plan.brand.name;
  const size = Math.min((vertical ? 128 : 80) * u, fitSize(name, W * (vertical ? 0.6 : 0.36)));
  const nameW = measure(name, FAMILY, W_BOLD, size) + 26 * u;
  const lockMk = mix(lock, mk, size * 1.1);
  const dir = detectDir(name, 'rtl');
  const parts = name.split(' ');
  return (
    <AbsoluteFill>
      <Stage theme="dark" />
      {/* orbits */}
      {[1, 1.55, 2.2].map((r, i) => (
        <div key={i} style={{ position: 'absolute', left: W / 2 - mk * r, top: cy - mk * r, width: mk * r * 2, height: mk * r * 2, borderRadius: '50%', border: `1px solid rgba(168,139,255,${0.16 - i * 0.04})`, opacity: 1 - lock }} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const r = mk * (1 + (i % 3) * 0.6) * (1 - join);
        const a = (f / fps) * (0.9 + i * 0.13) * (i % 2 ? -1 : 1) + i * 1.3;
        const sz = (14 + (i % 3) * 8) * u * (1 - join * 0.6);
        return <div key={i} style={{ position: 'absolute', left: W / 2 + Math.cos(a) * r - sz, top: cy + Math.sin(a) * r * 0.92 - sz, width: sz * 2, height: sz * 2, borderRadius: '50%', background: 'radial-gradient(circle, #F1EBFF 0%, #A88BFF 45%, #4B2BD0 100%)', boxShadow: `0 0 ${16 * u}px rgba(168,139,255,0.6)`, opacity: 1 - lock }} />;
      })}
      <div dir={dir} style={{ position: 'absolute', top: cy, left: 0, right: 0, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ flex: 'none', transform: `scale(${1 + 0.08 * Math.sin(f / 10) * (1 - lock)})` }}>
          <Mark size={lockMk} accent={plan.accent} letter={plan.brand.mark} glow={1.4 - lock * 0.6} />
        </div>
        <div style={{ maxWidth: nameW * lock, overflow: 'hidden', flex: 'none' }}>
          <div style={{ width: nameW, paddingInlineStart: 22 * u, fontFamily: T.font, fontWeight: W_BOLD, fontSize: size, lineHeight: 1.4, whiteSpace: 'nowrap', color: T.text }}>
            {parts.length > 1 ? (
              <>
                {parts.slice(0, -1).join(' ')} <span style={{ color: ACCENTS[plan.accent].a }}>{parts[parts.length - 1]}</span>
              </>
            ) : (
              name
            )}
          </div>
        </div>
      </div>
      <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: cy + size * 0.95, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * u, fontFamily: T.font }}>
        {s.line ? <div style={{ fontSize: (vertical ? 56 : 34) * u, color: T.text, opacity: tag, transform: `translateY(${(1 - tag) * 14 * u}px)`, lineHeight: 1.5 }}>{s.line}</div> : null}
        {s.cta ? (
          <div style={{ padding: `${16 * u}px ${40 * u}px`, borderRadius: 999, background: ACCENTS[plan.accent].grad, color: '#fff', fontWeight: 700, fontSize: (vertical ? 58 : 36) * u, transform: `scale(${clamp01(cta) * 0.98 + 0.02})`, opacity: clamp01(cta * 1.5), boxShadow: `0 0 ${40 * u}px ${ACCENTS[plan.accent].b}99`, lineHeight: 1.4 }}>{s.cta}</div>
        ) : null}
        {s.handle ? <div dir="ltr" style={{ fontSize: (vertical ? 42 : 26) * u, color: T.grey, opacity: tag, fontFamily: '"IBM Plex Mono", monospace', unicodeBidi: 'isolate' }}>{s.handle}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
