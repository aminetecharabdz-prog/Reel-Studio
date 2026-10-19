import { Easing, interpolate } from "remotion";
import { brand } from "./brand";

/** Brand text entrance: gradual fade-in with a small slide into place. Nothing pops out. */
export const textEnter = (frame: number, startFrame = 0) => {
  const progress = interpolate(
    frame,
    [startFrame, startFrame + brand.motion.textEnterFrames],
    [0, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * brand.motion.textSlidePx}px)`,
  };
};
