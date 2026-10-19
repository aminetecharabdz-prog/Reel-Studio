import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "./brand";
import { textEnter } from "./motion";

/** Brand caption: lower third, white, bold, at most two lines, gradual entrance. */
export const Caption: React.FC<{ text: string; startFrame?: number }> = ({
  text,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fontSize, lineHeight, maxLines, maxWidthRatio } = brand.caption;
  return (
    // Centered inside the lower third of the frame.
    <AbsoluteFill style={{ top: "66.667%", height: "33.333%", justifyContent: "center", alignItems: "center" }}>
      <div
        dir="auto"
        style={{
          width: `${maxWidthRatio * 100}%`,
          textAlign: "center",
          color: brand.caption.color,
          fontFamily: brand.font.family,
          fontWeight: brand.caption.fontWeight,
          fontSize,
          lineHeight,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: maxLines,
          overflow: "hidden",
        }}
      >
        <span style={{ display: "inline-block", ...textEnter(frame, startFrame) }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};
