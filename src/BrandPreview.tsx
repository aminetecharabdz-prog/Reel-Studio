import { AbsoluteFill, useCurrentFrame } from "remotion";
import { arabicStack, caption, captionStyle, colors, glassStyle, latinStack, textEnter } from "./brand";

/** Live preview of the brand page: colours, fonts, glass card and a caption. */
export const BrandPreview: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.midnight }}>
      <div style={{ position: "absolute", top: 240, left: 90, right: 90, display: "flex", gap: 40 }}>
        <div style={{ flex: 1, height: 220, borderRadius: 24, backgroundColor: colors.coral }} />
        <div style={{ flex: 1, height: 220, borderRadius: 24, backgroundColor: colors.midnight, border: `2px solid ${colors.white}` }} />
      </div>
      <div style={{ position: "absolute", top: 560, left: 90, right: 90, padding: 60, ...glassStyle, ...textEnter(frame, 0) }}>
        <div style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 80, color: colors.white, direction: "rtl", textAlign: "center" }}>
          زجاج مضبّب خفيف
        </div>
        <div style={{ fontFamily: latinStack, fontSize: 52, color: colors.white, textAlign: "center", marginTop: 20 }}>
          Glassmorphism
        </div>
      </div>
      <div style={{ position: "absolute", top: caption.zone.top, bottom: 160, left: 90, right: 90, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ ...captionStyle, fontSize: 72, lineHeight: 1.4, ...textEnter(frame, 20) }}>
          فكرة واحدة في كل مرة، بنص أبيض وعريض
        </div>
      </div>
    </AbsoluteFill>
  );
};
