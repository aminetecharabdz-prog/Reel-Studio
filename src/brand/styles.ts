import type { CSSProperties } from "react";
import { Easing, interpolate } from "remotion";
import { caption, glass, motion } from "./tokens";
import { arabicStack } from "./fonts";

export const glassStyle: CSSProperties = {
  background: glass.background,
  border: glass.border,
  borderRadius: glass.radiusPx,
  boxShadow: glass.shadow,
  backdropFilter: `blur(${glass.blurPx}px)`,
  WebkitBackdropFilter: `blur(${glass.blurPx}px)`,
};

export const captionStyle: CSSProperties = {
  color: caption.color,
  fontFamily: arabicStack,
  fontWeight: caption.fontWeight,
  direction: "rtl",
  textAlign: "center",
  display: "-webkit-box",
  WebkitLineClamp: caption.maxLines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/** Gradual fade + small upward slide, starting at `startFrame`. */
export const textEnter = (frame: number, startFrame = 0): CSSProperties => {
  const t = interpolate(frame - startFrame, [0, motion.enterFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * motion.slideDistance}px)`,
  };
};
