import { AbsoluteFill } from "remotion";
import { colors } from "./brand";
import { Caption } from "./components/Caption";
import { GlassCard } from "./components/GlassCard";

/** Glass card with a single brand caption. 3 seconds. */
export const CardCaption: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.midnight }}>
      <GlassCard />
      <Caption text="قرار واحد، مرة واحدة" startFrame={15} />
    </AbsoluteFill>
  );
};
