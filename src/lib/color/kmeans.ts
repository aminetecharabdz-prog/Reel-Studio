import { type RGB, rgbToHex, rgbToHsl } from './contrast';

/** k-means palette extraction from raw RGBA pixels (logo → palette, SPEC §3 step 1). Deterministic init. */
export const extractPalette = (data: Uint8ClampedArray, k = 5): string[] => {
  const px: RGB[] = [];
  for (let i = 0; i < data.length; i += 16) {
    if ((data[i + 3] ?? 0) < 128) continue;
    px.push([data[i]!, data[i + 1]!, data[i + 2]!]);
  }
  if (px.length === 0) return [];
  const step = Math.max(1, Math.floor(px.length / k));
  let centers: RGB[] = Array.from({ length: Math.min(k, px.length) }, (_, i) => [...px[i * step]!] as RGB);
  for (let iter = 0; iter < 12; iter++) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (const p of px) {
      let best = 0, bd = Infinity;
      centers.forEach((c, ci) => {
        const d = (c[0] - p[0]) ** 2 + (c[1] - p[1]) ** 2 + (c[2] - p[2]) ** 2;
        if (d < bd) { bd = d; best = ci; }
      });
      const s = sums[best]!;
      s[0]! += p[0]; s[1]! += p[1]; s[2]! += p[2]; s[3]! += 1;
    }
    centers = sums.map((s, i) => (s[3]! ? [s[0]! / s[3]!, s[1]! / s[3]!, s[2]! / s[3]!] : centers[i]!) as RGB);
  }
  // order by saturation (most brand-like first), drop near-duplicates
  const out: string[] = [];
  centers
    .map((c) => ({ c, s: rgbToHsl(c)[1] }))
    .sort((a, b) => b.s - a.s)
    .forEach(({ c }) => {
      const hex = rgbToHex(c);
      if (!out.some((o) => o === hex)) out.push(hex);
    });
  return out;
};
