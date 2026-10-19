import { interpolate, useCurrentFrame } from "remotion";
import { caption, captionStyle, textEnter } from "../brand";

/** Bottom edge of the caption box: lower third, kept above the platform UI (bottom 20%). */
const CAPTION_BOTTOM = 1920 - 384;

/** Brand caption: lower third, white, bold, max two lines, fades in with a small slide. */
export const Caption: React.FC<{ text: string; startFrame?: number; fontSize?: number; exitAt?: number }> = ({
  text,
  startFrame = 0,
  fontSize = 72,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const exit = exitAt === undefined ? 1 : interpolate(frame, [exitAt - 6, exitAt], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = textEnter(frame, startFrame);
  return (
    <div style={{ position: "absolute", top: caption.zone.top, height: CAPTION_BOTTOM - caption.zone.top, left: 90, right: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div lang="ar" style={{ ...captionStyle, fontSize, lineHeight: 1.4, ...enter, opacity: Number(enter.opacity) * exit, textShadow: "0 4px 24px rgba(0,0,0,0.35)" }}>
        {text}
      </div>
    </div>
  );
};
