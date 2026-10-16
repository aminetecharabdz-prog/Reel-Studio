/** A real preview rendered by our engine (demo projects), loaded only when visible. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { RassamVideo, buildCtx } from '@/engine/Composition';
import { DIMS, type Aspect } from '@/engine/types';
import { demosOf } from '@/demos';
import { demoInput } from '@/demos/types';
import type { StyleId } from '@/styles/catalog';
import { loadStyle } from '@/styles/registry';

const useVisible = <T extends Element>() => {
  const ref = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setVis(true);
    const io = new IntersectionObserver(([e]) => setVis(!!e?.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, vis] as const;
};

export const DemoPlayer = ({ styleId, demo = 0, aspect = '9:16', controls = false, sound = false, className = '' }: { styleId: StyleId; demo?: number; aspect?: Aspect; controls?: boolean; sound?: boolean; className?: string }) => {
  const [ref, vis] = useVisible<HTMLDivElement>();
  const [ok, setOk] = useState(false);
  const d = demosOf(styleId)[demo];
  useEffect(() => {
    if (!vis || ok || !d) return;
    loadStyle(styleId).then(() => setOk(true), () => undefined);
  }, [vis, ok, d, styleId]);
  const input = useMemo(() => (d && ok ? demoInput(d, aspect, { audio: { voice: null, music: null, musicVolume: 0, ducking: true, sfx: sound, sfxIntensity: 0.7 } }) : null), [d, ok, aspect, sound]);
  const { w, h } = DIMS[aspect];
  return (
    <div ref={ref} dir="ltr" className={className} style={{ aspectRatio: `${w}/${h}`, background: '#05050A' }}>
      {input && vis && (
        <Player
          component={RassamVideo}
          inputProps={{ input }}
          durationInFrames={buildCtx(input).durationInFrames}
          fps={30}
          compositionWidth={w}
          compositionHeight={h}
          style={{ width: '100%', height: '100%' }}
          autoPlay={!controls}
          loop
          controls={controls}
          initiallyMuted={!sound}
          clickToPlay={controls}
          acknowledgeRemotionLicense
        />
      )}
    </div>
  );
};
