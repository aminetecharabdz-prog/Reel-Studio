import { AbsoluteFill } from "remotion";
import { brand, Caption, GlassPanel } from "./brand";

/** Visual check of the brand kit — not a real video. */
export const BrandCheck: React.FC = () => (
  <AbsoluteFill style={{ background: brand.colors.slate, alignItems: "center", justifyContent: "center" }}>
    <GlassPanel style={{ width: 760, height: 760, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 220, height: 220, borderRadius: 32, background: brand.colors.yellow }} />
    </GlassPanel>
    <Caption text="Montserrat Caption — two lines max, white and bold" />
  </AbsoluteFill>
);
