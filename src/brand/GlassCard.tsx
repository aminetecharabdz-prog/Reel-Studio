import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { brand } from "./brand";
import { GlassPanel } from "./GlassPanel";
import { textEnter } from "./motion";

export type GlassCardProps = {
  title: string;
  subtitle?: string;
  /** Frame at which the text starts its brand entrance. */
  startFrame?: number;
  width?: number;
  blurPx?: number;
  style?: CSSProperties;
};

/** Reusable frosted-glass card with a title and optional subtitle. */
export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  subtitle,
  startFrame = 0,
  width = 800,
  blurPx,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <GlassPanel
      blurPx={blurPx}
      style={{
        width,
        padding: "72px 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        textAlign: "center",
        color: brand.colors.white,
        fontFamily: brand.font.family,
        ...style,
      }}
    >
      <div
        dir="auto"
        style={{
          fontSize: 76,
          fontWeight: brand.font.weights.extraBold,
          lineHeight: 1.15,
          ...textEnter(frame, startFrame),
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          dir="auto"
          style={{
            fontSize: 44,
            fontWeight: brand.font.weights.regular,
            lineHeight: 1.3,
            ...textEnter(frame, startFrame + brand.motion.textEnterFrames / 2),
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </GlassPanel>
  );
};
