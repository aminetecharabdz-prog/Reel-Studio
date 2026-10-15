import { forwardRef, useEffect, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import type { CompiledReel } from '@/lib/timing/types';
import { Reel, prepareReel } from '@/video/Reel';
import { cx, Pulse } from './ui';

type Props = { reel: CompiledReel | null; autoPlay?: boolean; loop?: boolean; muted?: boolean; controls?: boolean; className?: string; rounded?: boolean; clickToPlay?: boolean };

/** Remotion Player with fonts prepared before mount (so text is measured with the real font). */
export const ReelPlayer = forwardRef<PlayerRef, Props>(({ reel, autoPlay, loop = true, muted, controls = true, className, rounded = true, clickToPlay = true }, ref) => {
  const [ready, setReady] = useState<CompiledReel | null>(null);
  useEffect(() => {
    let alive = true;
    if (!reel) return;
    prepareReel(reel).then(() => alive && setReady(reel));
    return () => {
      alive = false;
    };
  }, [reel]);
  const r = ready && reel ? reel : null;
  const ratio = reel ? reel.width / reel.height : 9 / 16;
  return (
    <div dir="ltr" className={cx('relative w-full overflow-hidden bg-black', rounded && 'rounded-[24px]', className)} style={{ aspectRatio: String(ratio) }}>
      {r ? (
        <Player
          ref={ref}
          component={Reel}
          inputProps={{ reel: r }}
          durationInFrames={r.durationInFrames}
          compositionWidth={r.width}
          compositionHeight={r.height}
          fps={r.fps}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          initiallyMuted={muted}
          clickToPlay={clickToPlay}
          showVolumeControls
          allowFullscreen
          acknowledgeRemotionLicense
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-raised text-muted">
          <Pulse />
          <span className="text-sm">تحضير المعاينة…</span>
        </div>
      )}
    </div>
  );
});
ReelPlayer.displayName = 'ReelPlayer';
