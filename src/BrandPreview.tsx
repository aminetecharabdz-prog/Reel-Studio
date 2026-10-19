import { AbsoluteFill } from "remotion";
import { colors } from "./brand";
import { Caption } from "./components/Caption";
import { GlassCard } from "./components/GlassCard";

/** Live preview of the brand page: colours, fonts, glass card and a caption. */
export const BrandPreview: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.midnight }}>
      <div style={{ position: "absolute", top: 240, left: 90, right: 90, display: "flex", gap: 40 }}>
        <div style={{ flex: 1, height: 220, borderRadius: 24, backgroundColor: colors.coral }} />
        <div style={{ flex: 1, height: 220, borderRadius: 24, backgroundColor: colors.midnight, border: `2px solid ${colors.white}` }} />
      </div>
      <GlassCard />
      <Caption text="فكرة واحدة في كل مرة، بنص أبيض وعريض" startFrame={20} />
    </AbsoluteFill>
  );
};
