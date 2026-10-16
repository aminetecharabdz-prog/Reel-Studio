import { createContext, useContext, type ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import type { VideoCtx } from './types';

const Ctx = createContext<VideoCtx | null>(null);
export const VideoProvider = ({ value, children }: { value: VideoCtx; children: ReactNode }) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useVideo = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useVideo outside a Rassam composition');
  return v;
};

/** the seconds at which the current <Sequence> starts on the video clock */
const SceneStart = createContext(0);
export const SceneClock = ({ from, children }: { from: number; children: ReactNode }) => <SceneStart.Provider value={from}>{children}</SceneStart.Provider>;

/** the VIDEO clock in seconds (same numbers as the timing data), inside or outside a scene Sequence */
export const useT = () => {
  const frame = useCurrentFrame();
  const from = useContext(SceneStart);
  const { fps } = useVideo();
  return from + frame / fps;
};
