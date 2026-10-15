import { useMemo } from 'react';
import type { Project } from '@/lib/schema/project';
import type { CompiledReel } from '@/lib/timing/types';
import { ReelPlayer } from './ReelPlayer';

/** Live, animated caption preview using the real caption renderer on the project's own words. */
export const CaptionSample = ({ project, reel }: { project: Project; reel: CompiledReel | null }) => {
  const mini = useMemo<CompiledReel | null>(() => {
    if (!reel || !project.transcript) return null;
    const line = reel.captions.find((c) => c.words.length >= 3) ?? reel.captions[0];
    if (!line) return null;
    const off = line.from;
    const shifted = { ...line, from: 0, to: line.to - off + 10, words: line.words.map((w) => ({ ...w, start: w.start - off, end: w.end - off })) };
    const dur = Math.max(45, shifted.to + 10);
    const settings = { ...reel.captionSettings, position: 0.5 };
    return { ...reel, width: 1080, height: 600, durationInFrames: dur, scenes: [], captions: [shifted], captionSettings: settings, voice: null, music: null, sfx: [], video: [], showSafeZone: false, safeZone: 'none' };
  }, [project, reel]);
  return <ReelPlayer reel={mini} autoPlay loop muted controls={false} clickToPlay={false} />;
};
