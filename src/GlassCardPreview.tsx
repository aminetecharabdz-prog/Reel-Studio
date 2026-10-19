import { AbsoluteFill } from "remotion";
import { brand, GlassCard } from "./brand";

/**
 * Studio preview: the glass card over a gradient made only of the brand colors.
 * The yellow disc crosses the card edge so the frosting is visible
 * (sharp outside the card, blurred behind it).
 */
export const GlassCardPreview: React.FC<{ blurPx?: number }> = ({ blurPx }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(160deg, ${brand.colors.slate} 0%, ${brand.colors.slate} 45%, ${brand.colors.yellow} 140%)`,
    }}
  >
    <div
      style={{
        position: "absolute",
        width: 360,
        height: 360,
        borderRadius: "50%",
        left: 860,
        top: 560,
        background: `radial-gradient(circle at 35% 35%, ${brand.colors.yellow} 0%, ${brand.colors.yellow} 60%, ${brand.colors.slate} 100%)`,
      }}
    />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <GlassCard title="Glassmorphism" subtitle="Montserrat · #FFC107 · #1E293B" blurPx={blurPx} startFrame={10} width={880} />
    </AbsoluteFill>
  </AbsoluteFill>
);
