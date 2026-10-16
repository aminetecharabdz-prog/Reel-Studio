// Sound effects, each on a visual event (no music, as in the reference).
import React from 'react';
import { Html5Audio, Sequence, staticFile } from 'remotion';
import { toFrame } from '../timing';
import { B } from '../beats';

const fx: Array<[number, string, number]> = [
  [B.q1.start - 0.3, 'swell', 0.45],
  [B.q2Five.start, 'blip', 0.4],
  ...B.days.flatMap((d): Array<[number, string, number]> => [
    [d.start - 0.1, 'whoosh', 0.35],
    [d.start + 1.1, 'tick', 0.4],
  ]),
  ...B.facts.map((f): [number, string, number] => [f.start, 'pop', 0.3]),
  ...B.blinks.map((b): [number, string, number] => [b, 'drop', 0.35]),
  [B.halluc, 'shimmer', 0.4],
  [B.dream, 'glitch', 0.3],
  [B.psych, 'impact', 0.45],
  [B.psych + 0.1, 'glitch', 0.35],
  [B.good.start, 'swish', 0.35],
  [B.end.start - 0.3, 'swell', 0.4],
  [B.end.start + 0.6, 'hit', 0.3],
];

export const Sounds: React.FC = () => (
  <>
    {fx.map(([at, name, volume], i) => (
      <Sequence key={i} from={Math.max(0, toFrame(at))} durationInFrames={60} layout="none">
        <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
      </Sequence>
    ))}
  </>
);
