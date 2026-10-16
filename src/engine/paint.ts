/**
 * Paint helpers that render the SAME in the browser preview and in the in-browser exporter (@remotion/web-renderer
 * only draws centred `radial-gradient(ellipse|circle, …)`; `closest-side` and `at x y` are not supported).
 */
const splitTop = (s: string) => s.split(/,(?![^(]*\))/).map((x) => x.trim()).filter(Boolean);

/**
 * `radial-gradient(closest-side, <stops>)` re-expressed as a centred farthest-corner ellipse: every stop position is
 * scaled by 1/√2, so the gradient reaches its last stop exactly at the box edge (no visible edges).
 */
export const glow = (stops: string) => {
  const parts = splitTop(stops);
  const n = parts.length;
  const out = parts.map((p, i) => {
    const m = /^(.*?)(?:\s+(-?[\d.]+)%)?$/.exec(p)!;
    const color = m[1]!.trim();
    const pos = m[2] !== undefined ? Number(m[2]) : n === 1 ? 0 : (i / (n - 1)) * 100;
    return `${color} ${(pos / Math.SQRT2).toFixed(2)}%`;
  });
  return `radial-gradient(ellipse, ${out.join(', ')})`;
};
