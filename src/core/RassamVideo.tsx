import { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { Audio } from '@remotion/media';
import { VideoProvider, makeCtx } from './context';
import type { Compiled } from './types';
import { getStyle } from '@/styles/registry';

/** The one Remotion composition: dispatches to the style engine and plays voice + music. */
export const RassamVideo = ({ c }: { c: Compiled }) => {
  const ctx = useMemo(() => makeCtx(c), [c]);
  const style = getStyle(c.styleId);
  const V = style.Video as React.FC<{ plan: unknown }>;
  return (
    <VideoProvider value={ctx}>
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        <V plan={c.plan} />
        {c.voice ? <Audio src={c.voice} /> : null}
        {c.music ? <Audio src={c.music} loop volume={(f) => c.musicVolume * (c.voice ? 0.35 : 0.8) * Math.min(1, f / (c.fps * 0.6), Math.max(0, (c.durationInFrames - f) / (c.fps * 1.2)))} /> : null}
      </AbsoluteFill>
    </VideoProvider>
  );
};

export const prepareVideo = async (c: Compiled) => {
  await getStyle(c.styleId).loadFonts();
  await document.fonts.ready;
};
