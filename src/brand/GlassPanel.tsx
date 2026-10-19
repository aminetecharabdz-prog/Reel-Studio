import type { CSSProperties, ReactNode } from "react";
import { brand } from "./brand";

/** Light frosted-glass surface from the design page: blurred backdrop, light translucent fill, thin light border. */
export const GlassPanel: React.FC<{
  children?: ReactNode;
  style?: CSSProperties;
  /** Override the brand blur (e.g. 0 to compare with/without frosting). */
  blurPx?: number;
}> = ({ children, style, blurPx = brand.glass.blurPx }) => (
  <div
    style={{
      background: brand.glass.fill,
      border: `2px solid ${brand.glass.border}`,
      borderRadius: brand.glass.radiusPx,
      backdropFilter: `blur(${blurPx}px)`,
      WebkitBackdropFilter: `blur(${blurPx}px)`,
      ...style,
    }}
  >
    {children}
  </div>
);
