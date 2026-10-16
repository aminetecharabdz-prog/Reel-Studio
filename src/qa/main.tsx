/**
 * QA stills page (dev only): renders ONE frame of a demo or a local-planner video at full resolution.
 * Query: ?demo=<id>|&script=<text>&style=<id>&aspect=9:16. Playwright drives `window.__qa.frame(n)` and screenshots.
 */
import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Thumbnail } from '@remotion/player';
import { RassamVideo, buildCtx } from '@/engine/Composition';
import { estimateTiming } from '@/engine/estimate';
import { ASPECTS, DIMS, type Aspect, type VideoInput } from '@/engine/types';
import { demoById } from '@/demos';
import { demoInput } from '@/demos/types';
import { loadStyle } from '@/styles/registry';
import type { StyleId } from '@/styles/catalog';

declare global {
  interface Window {
    __qa?: { ready: boolean; frames: number; fps: number; input: VideoInput; frame: (n: number) => Promise<void>; info: () => unknown };
  }
}

const q = new URLSearchParams(location.search);
const aspect = (ASPECTS as readonly string[]).includes(q.get('aspect') ?? '') ? (q.get('aspect') as Aspect) : '9:16';

const makeInput = async (): Promise<VideoInput> => {
  const demo = q.get('demo');
  if (demo) {
    const d = demoById(demo);
    if (!d) throw new Error(`no demo ${demo}`);
    const style = await loadStyle(d.styleId);
    void style;
    return demoInput(d, aspect);
  }
  const styleId = (q.get('style') ?? 'product') as StyleId;
  const style = await loadStyle(styleId);
  const script = q.get('script') ?? '';
  const timing = estimateTiming(script, { wps: 2.3, gap: 0.6 });
  const product = q.get('product') ? JSON.parse(q.get('product')!) : null;
  const plan = style.localPlan({ timing, goal: product ? 'ad' : 'explainer', aspect, topic: q.get('topic') ?? '', product, brandName: q.get('brand') ?? '', seed: Number(q.get('seed') ?? 1) });
  const { DEMOS } = await import('@/demos');
  void DEMOS;
  return { styleId, plan, timing, aspect, assets: {}, audio: { voice: null, music: null, musicVolume: 0.3, ducking: true, sfx: true, sfxIntensity: 0.7 }, captions: null, brand: null, endCard: false, product, digits: 'western', accent: null, talking: null };
};

const App = () => {
  const [input, setInput] = useState<VideoInput | null>(null);
  const [frame, setFrame] = useState(0);
  const [err, setErr] = useState('');
  useEffect(() => {
    makeInput().then(setInput, (e: unknown) => setErr(String(e)));
  }, []);
  const ctx = useMemo(() => (input ? buildCtx(input) : null), [input]);
  useEffect(() => {
    if (!input || !ctx) return;
    window.__qa = {
      ready: true,
      frames: ctx.durationInFrames,
      fps: ctx.fps,
      input,
      frame: (n) =>
        new Promise((res) => {
          setFrame(n);
          setTimeout(res, 50);
        }),
      info: () => ({ plan: input.plan, timing: input.timing }),
    };
  }, [input, ctx]);
  if (err) return <pre style={{ color: '#f66', fontSize: 24 }}>{err}</pre>;
  if (!input || !ctx) return null;
  const { w, h } = DIMS[input.aspect];
  return (
    <div id="stage" style={{ width: w, height: h }}>
      <Thumbnail component={RassamVideo} inputProps={{ input }} durationInFrames={ctx.durationInFrames} fps={ctx.fps} compositionWidth={w} compositionHeight={h} frameToDisplay={frame} style={{ width: w, height: h }} />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
