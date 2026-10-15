import { forwardRef, useEffect, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { Reel, prepare } from '@/engine/render/Reel';
import type { Compiled } from '@/engine/compile';
import { cx } from './kit';

type Props = { c: Compiled; className?: string; autoPlay?: boolean; loop?: boolean; controls?: boolean; muted?: boolean; rounded?: boolean };

/** Remotion Player in an LTR island (the player breaks inside RTL), sized by its container width. */
export const ReelPlayer = forwardRef<PlayerRef, Props>(({ c, className, autoPlay, loop = true, controls = true, muted, rounded = true }, ref) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    setReady(false);
    prepare(c).finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [c]);
  return (
    <div dir="ltr" className={cx('relative w-full overflow-hidden bg-black', rounded && 'rounded-[22px]', className)} style={{ aspectRatio: `${c.width} / ${c.height}` }}>
      {ready ? (
        <Player
          ref={ref}
          component={Reel}
          inputProps={{ c }}
          durationInFrames={c.durationInFrames}
          fps={c.fps}
          compositionWidth={c.width}
          compositionHeight={c.height}
          style={{ width: '100%', height: '100%' }}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          initiallyMuted={muted}
          clickToPlay
          spaceKeyToPlayOrPause
          acknowledgeRemotionLicense
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex h-8 items-end gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="w-1.5 rounded-full grad-bg" style={{ height: 32, animation: `bar .9s ${i * 0.12}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
ReelPlayer.displayName = 'ReelPlayer';
