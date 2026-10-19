import type { CSSProperties, ReactNode } from "react";
import { brand } from "./brand";

/** Light frosted-glass surface from the design page. */
export const GlassPanel: React.FC<{ children?: ReactNode; style?: CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      background: brand.glass.fill,
      border: `2px solid ${brand.glass.border}`,
      borderRadius: brand.glass.radiusPx,
      backdropFilter: `blur(${brand.glass.blurPx}px)`,
      WebkitBackdropFilter: `blur(${brand.glass.blurPx}px)`,
      ...style,
    }}
  >
    {children}
  </div>
);
