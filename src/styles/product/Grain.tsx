import { AbsoluteFill, useCurrentFrame } from 'remotion';

/** very light film grain (reference: barely visible, opacity ≈ 0.05, soft-light) */
export const Grain = ({ opacity = 0.05 }: { opacity?: number }) => {
  const f = useCurrentFrame();
  const seed = f % 7;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'soft-light', opacity }}>
      <svg width="100%" height="100%">
        <filter id={`gr${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#gr${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
