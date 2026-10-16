// Small line icons for the packing steps (stroke = currentColor).
import React from 'react';

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const IconLens: React.FC<{ s?: number }> = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" {...P} /><path d="M15 15l6 6" {...P} /></svg>
);
export const IconCorner: React.FC<{ s?: number }> = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M4 20V4h16" {...P} /><path d="M8 20V8h12" {...P} strokeDasharray="2 3" /></svg>
);
export const IconBubbles: React.FC<{ s?: number }> = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">{[[6, 6], [14, 6], [10, 13], [18, 13], [6, 19], [14, 19]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" {...P} />)}</svg>
);
export const IconBox: React.FC<{ s?: number }> = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M3 8l9-4 9 4v9l-9 4-9-4z" {...P} /><path d="M3 8l9 4 9-4M12 12v9" {...P} /></svg>
);
export const IconShake: React.FC<{ s?: number }> = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><rect x="7" y="6" width="10" height="12" rx="1.5" {...P} /><path d="M3 9c-1 2-1 4 0 6M21 9c1 2 1 4 0 6" {...P} /></svg>
);
