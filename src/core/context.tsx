import { createContext, useContext } from 'react';
import type { Compiled } from './types';
import { Timeline } from './timeline';

export type VideoCtx = { c: Compiled; tl: Timeline; W: number; H: number; u: number; vertical: boolean; square: boolean };
const Ctx = createContext<VideoCtx | null>(null);
export const VideoProvider = Ctx.Provider;
export const useVideo = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useVideo outside RassamVideo');
  return v;
};
export const makeCtx = (c: Compiled): VideoCtx => {
  const tl = new Timeline(c.transcript, c.fps, c.tailFrames);
  return { c, tl, W: c.width, H: c.height, u: Math.min(c.width, c.height) / 1080, vertical: c.height > c.width * 1.2, square: Math.abs(c.width - c.height) < 10 };
};
