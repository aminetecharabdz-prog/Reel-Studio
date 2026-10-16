import { Sequence } from 'remotion';
import { Audio } from '@remotion/media';
import { publicUrl } from '@/engine/assets';
import { useVideo } from './context';

export const SFX = ['whoosh-soft', 'whoosh-hard', 'pop-soft', 'pop-punchy', 'tick', 'ding', 'impact', 'swipe', 'click', 'riser', 'mech-clunk'] as const;
export type SfxId = (typeof SFX)[number];
/** where the audible peak sits inside each file (s) so the peak lands on the visual event */
const PEAK: Partial<Record<SfxId, number>> = { 'whoosh-soft': 0.18, 'whoosh-hard': 0.14, riser: 1.6, impact: 0.02, swipe: 0.1 };

/** A sound on a visual event (frame relative to the current Sequence). */
export const Sfx = ({ at, id, volume = 0.5 }: { at: number; id: SfxId; volume?: number }) => {
  const { c } = useVideo();
  if (!c.sfx) return null;
  const from = Math.max(0, at - Math.round((PEAK[id] ?? 0) * c.fps));
  return (
    <Sequence from={from} durationInFrames={Math.round(c.fps * 2.5)} layout="none">
      <Audio src={publicUrl(`audio/sfx/${id}.mp3`)} volume={volume} />
    </Sequence>
  );
};
