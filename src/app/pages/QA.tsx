/** Contact sheet for visual QA: #/qa?demo=content&per=3 renders frames of every scene (hero moments). */
import { useEffect, useMemo, useState } from 'react';
import { Thumbnail } from '@remotion/player';
import { Reel, prepare } from '@/engine/render/Reel';
import type { Compiled } from '@/engine/compile';
import { loadDemo } from '../demos';
import { build } from '../build';
import { localDirector } from '@/ai/local';

export const QA = ({ q }: { q: URLSearchParams }) => {
  const id = q.get('demo') ?? 'content';
  const per = Number(q.get('per') ?? 3);
  const [c, setC] = useState<Compiled | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadDemo(id).then(async (d) => {
      const plan = q.get('local') ? localDirector(d.transcript, { mode: d.mode, seed: q.get('local')! }) : d.plan;
      const comp = build({ plan, transcript: d.transcript, mode: d.mode, captions: q.get('captions') === '1', aspect: (q.get('aspect') as '9:16') ?? '9:16' });
      await prepare(comp);
      setC(comp);
      setTimeout(() => setReady(true), 1500);
    });
  }, [id, q]);
  const frames = useMemo(() => {
    if (!c) return [];
    const out: Array<{ f: number; label: string }> = [];
    for (const s of c.scenes) {
      for (let k = 0; k < per; k++) {
        const f = s.startF + Math.round(((k + 1) / (per + 0.4)) * s.duration);
        out.push({ f: Math.min(c.durationInFrames - 1, f), label: `${s.id} f${f}` });
      }
    }
    return out;
  }, [c, per]);
  if (!c) return <div style={{ color: '#fff' }}>loading</div>;
  const w = Number(q.get('w') ?? 260);
  return (
    <div dir="ltr" data-qa-ready={ready ? '1' : '0'} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 6, background: '#222', width: Number(q.get('cols') ?? per) * (w + 6) + 6 }}>
      {frames.map((x) => (
        <div key={x.label} style={{ width: w }}>
          <Thumbnail component={Reel} inputProps={{ c }} compositionWidth={c.width} compositionHeight={c.height} durationInFrames={c.durationInFrames} fps={c.fps} frameToDisplay={x.f} style={{ width: w, height: (w * c.height) / c.width }} />
          <div style={{ color: '#aaa', font: '11px monospace' }}>{x.label}</div>
        </div>
      ))}
    </div>
  );
};
