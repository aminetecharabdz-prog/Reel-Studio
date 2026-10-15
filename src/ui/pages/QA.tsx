import { useEffect, useState } from 'react';
import { Thumbnail } from '@remotion/player';
import { useRoute } from '../router';
import { ensureDemo } from '../useProject';
import { compileProject, resolveMedia } from '@/lib/studio';
import type { CompiledReel } from '@/lib/timing/types';
import { Reel, prepareReel } from '@/video/Reel';
import type { DemoId } from '@/lib/demos';
import { PRIMITIVE_AR } from '@/lib/director/primitiveNames';

/** Contact sheet for visual QA (video-qa skill): one still per scene at its hero frame. #/qa?demo=dentist&at=0.9 */
export const QAPage = () => {
  const { query } = useRoute();
  const demo = (query.get('demo') ?? 'dentist') as DemoId;
  const at = Number(query.get('at') ?? '1.0');
  const aspect = query.get('aspect') as '9:16' | '1:1' | '16:9' | '4:5' | null;
  const [reel, setReel] = useState<CompiledReel | null>(null);
  useEffect(() => {
    (async () => {
      const p = await ensureDemo(demo);
      const r = compileProject(p, await resolveMedia(p), { aspect: aspect ?? undefined });
      if (r) {
        await prepareReel(r);
        setReel(r);
      }
    })();
  }, [demo, aspect]);
  if (!reel) return <div className="p-6">loading…</div>;
  const frames = reel.scenes.map((s) => ({ s, f: Math.min(reel.durationInFrames - 1, s.from + Math.min(s.duration - 1, Math.round(reel.fps * at))) }));
  return (
    <div dir="ltr" className="grid gap-3 bg-black p-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }} data-testid="qa-sheet">
      {frames.map(({ s, f }) => (
        <div key={s.id} className="text-[11px] text-white">
          <div style={{ aspectRatio: `${reel.width}/${reel.height}` }} className="overflow-hidden">
            <Thumbnail component={Reel} inputProps={{ reel }} compositionWidth={reel.width} compositionHeight={reel.height} frameToDisplay={f} durationInFrames={reel.durationInFrames} fps={reel.fps} style={{ width: '100%' }} />
          </div>
          <div dir="rtl">{s.index + 1}. {PRIMITIVE_AR[s.primitive]} · {(f / reel.fps).toFixed(1)}s · {s.words.map((w) => w.text).join(' ').slice(0, 50)}</div>
        </div>
      ))}
    </div>
  );
};
