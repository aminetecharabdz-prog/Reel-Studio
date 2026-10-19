import { useCurrentFrame } from "remotion";
import { arabicStack, colors, glassStyle, latinStack, textEnter } from "../brand";

/** The brand glass card ("زجاج مضبّب خفيف" / Glassmorphism). */
export const GlassCard: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 560, left: 90, right: 90, padding: 60, ...glassStyle, ...textEnter(frame, 0) }}>
      <div style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 80, color: colors.white, direction: "rtl", textAlign: "center" }}>
        زجاج مضبّب خفيف
      </div>
      <div style={{ fontFamily: latinStack, fontSize: 52, color: colors.white, textAlign: "center", marginTop: 20 }}>
        Glassmorphism
      </div>
    </div>
  );
};
