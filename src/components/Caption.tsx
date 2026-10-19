import { useCurrentFrame } from "remotion";
import { caption, captionStyle, textEnter } from "../brand";

/** Brand caption: lower third, white, bold, max two lines, fades in with a small slide. */
export const Caption: React.FC<{ text: string; startFrame?: number }> = ({ text, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: caption.zone.top, bottom: 160, left: 90, right: 90, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div lang="ar" style={{ ...captionStyle, fontSize: 72, lineHeight: 1.4, ...textEnter(frame, startFrame) }}>
        {text}
      </div>
    </div>
  );
};
