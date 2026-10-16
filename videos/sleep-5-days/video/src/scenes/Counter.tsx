// A rolling odometer: every digit is a column of 0-9 that scrolls; lower digits spin more laps.
import React from 'react';
import { grad } from '../theme';

const Column: React.FC<{ from: number; to: number; laps: number; k: number; size: number; colors: readonly [string, string] }> = ({ from, to, laps, k, size, colors }) => {
  const dist = ((to - from + 10) % 10) + 10 * laps;
  const pos = (from + dist * k) % 10;
  const h = size * 1.1;
  return (
    <span style={{ display: 'inline-block', height: h, overflow: 'hidden', width: size * 0.6, textAlign: 'center' }}>
      <span style={{ display: 'block', transform: `translateY(${-pos * h}px)` }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
          <span key={i} style={{ display: 'block', height: h, lineHeight: `${h}px`, ...grad(colors[0], colors[1]) }}>{d}</span>
        ))}
      </span>
    </span>
  );
};

export const Counter: React.FC<{ from: number; to: number; k: number; size: number; colors: readonly [string, string] }> = ({ from, to, k, size, colors }) => {
  const t = String(to);
  const f = String(from).padStart(t.length, '0');
  return (
    <span dir="ltr" style={{ display: 'inline-flex', fontSize: size, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
      {t.split('').map((d, i) => {
        const padded = i < t.length - String(from).length;
        return (
          <span key={i} style={{ opacity: padded ? Math.min(1, k * 2) : 1 }}>
            <Column from={Number(f[i])} to={Number(d)} laps={i} k={k} size={size} colors={colors} />
          </span>
        );
      })}
    </span>
  );
};
