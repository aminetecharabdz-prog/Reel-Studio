// The moon: a sphere of light dots (orthographic projection, slowly turning) with a night-side shadow.
import React from 'react';
import { random } from 'remotion';

type P = { lat: number; lon: number };
// Dotted "maria": points on a lat/lon lattice kept where a fixed pseudo-noise field is high.
const POINTS: P[] = (() => {
  const out: P[] = [];
  const blobs = Array.from({ length: 9 }, (_, i) => ({
    lat: (random(`mlat${i}`) - 0.5) * 2.2,
    lon: random(`mlon${i}`) * Math.PI * 2,
    r: 0.25 + random(`mr${i}`) * 0.35,
  }));
  for (let la = -78; la <= 78; la += 4.2) {
    const lat = (la * Math.PI) / 180;
    const step = 4.2 / Math.max(0.2, Math.cos(lat));
    for (let lo = 0; lo < 360; lo += step) {
      const lon = (lo * Math.PI) / 180;
      const hit = blobs.some((b) => {
        const d = Math.acos(Math.min(1, Math.sin(lat) * Math.sin(b.lat) + Math.cos(lat) * Math.cos(b.lat) * Math.cos(lon - b.lon)));
        return d < b.r;
      });
      if (hit) out.push({ lat, lon });
    }
  }
  return out;
})();

export const Moon: React.FC<{ r: number; spin: number; opacity: number }> = ({ r, spin, opacity }) => {
  const tilt = 0.35;
  const dots = POINTS.map((p, i) => {
    const lon = p.lon + spin;
    let x = Math.cos(p.lat) * Math.sin(lon);
    let y = -Math.sin(p.lat);
    let z = Math.cos(p.lat) * Math.cos(lon);
    const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
    z = y * Math.sin(tilt) + z * Math.cos(tilt);
    y = y2;
    if (z <= 0.02) return null;
    return <circle key={i} cx={x * r} cy={y * r} r={r * 0.011 * (0.5 + z * 0.7)} fill="#E6F6FF" opacity={0.25 + z * 0.7} />;
  });
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id="moonBody" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#8CCBFF" />
          <stop offset="45%" stopColor="#3D6FE0" />
          <stop offset="100%" stopColor="#0B1B52" />
        </radialGradient>
        <radialGradient id="moonNight" cx="85%" cy="80%" r="90%">
          <stop offset="0%" stopColor="#000" stopOpacity={0.85} />
          <stop offset="55%" stopColor="#000" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#5B9BFF" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#5B9BFF" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * 1.35} fill="url(#moonHalo)" />
      <circle r={r} fill="url(#moonBody)" />
      {dots}
      <circle r={r} fill="url(#moonNight)" />
      <circle r={r} fill="none" stroke="#9FD8FF" strokeOpacity={0.7} strokeWidth={3} />
    </g>
  );
};
