import type { CSSProperties } from 'react';
import { getIcon, iconSvgMarkup, type IconSet } from '@/lib/design/icons';
import { useTheme } from './theme';

/** Iconify icon rendered as inline SVG (captured natively by the web renderer). Colour baked in. */
export const Icon = ({ id, size, color, style }: { id?: string; size: number; color?: string; style?: CSSProperties }) => {
  const t = useTheme();
  const ic = getIcon(id, t.dna.iconSet as IconSet) ?? getIcon('sparkle', t.dna.iconSet as IconSet);
  if (!ic) return null;
  const col = color ?? t.c.primary;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${ic.width} ${ic.height}`}
      width={size}
      height={size}
      style={{ color: col, display: 'block', overflow: 'visible', ...style }}
      dangerouslySetInnerHTML={{ __html: iconSvgMarkup(ic, col) }}
    />
  );
};
