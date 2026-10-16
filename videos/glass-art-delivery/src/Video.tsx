// The whole video: voice + music bed + SFX, then one <Sequence> per scene.
// Scene starts/ends come from the script (cutBefore / line ends), never from typed-in seconds.
import React from 'react';
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile } from 'remotion';
import { TIMING, cutBefore, line, toFrame, word, DURATION_FRAMES } from './timing';
import { Captions, clock } from './ui';
import { Hook } from './scenes/Hook';
import { Fear } from './scenes/Fear';
import { Steps } from './scenes/Promise';
import { Packing } from './scenes/Packing';
import { Arrive } from './scenes/Arrive';
import { EndCard } from './scenes/EndCard';
import { useCurrentFrame } from 'remotion';

type Scene = { id: string; from: number; to: number; C: React.FC<{ from: number }> };
const END = line('هكا توصلك').end + 0.3;
const SCENES: Scene[] = [
  { id: 'hook', from: 0, to: cutBefore('وإذا تكسرت'), C: Hook },
  { id: 'fear', from: cutBefore('وإذا تكسرت'), to: cutBefore('وهذا اللي نديروه', 0.15), C: Fear },
  { id: 'promise', from: cutBefore('وهذا اللي نديروه', 0.15), to: cutBefore('أول حاجة'), C: Steps },
  { id: 'packing', from: cutBefore('أول حاجة'), to: cutBefore('هكا توصلك'), C: Packing },
  { id: 'arrive', from: cutBefore('هكا توصلك'), to: END, C: Arrive },
  { id: 'end', from: END, to: DURATION_FRAMES / 30, C: EndCard },
];

// Sound events, each anchored to a word or a scene cut. peak = seconds into the file where it hits.
const w = (l: string, q: string) => word(l, q).start;
const SFX: { at: number; src: string; vol: number; peak?: number }[] = [
  { at: 0.05, src: 'shimmer', vol: 0.35 },
  { at: line('وتوصلك').start, src: 'swish', vol: 0.35, peak: 0.3 },
  { at: w('وتوصلك', '69'), src: 'hit', vol: 0.45 },
  { at: cutBefore('وإذا تكسرت'), src: 'whoosh', vol: 0.35, peak: 0.2 },
  { at: w('وإذا تكسرت', 'تكسرت') + 0.12, src: 'glass', vol: 0.8 },
  { at: w('وإذا تكسرت', 'تكسرت') + 0.12, src: 'impact', vol: 0.4 },
  { at: w('هذا هو الخوف', 'الخوف'), src: 'drop', vol: 0.4 },
  { at: cutBefore('وهذا اللي نديروه', 0.15), src: 'swish', vol: 0.35, peak: 0.45 },
  ...[1, 2, 3, 4, 5].map((i) => ({ at: line("وهذا اللي نديروه").words[i].start, src: 'pop', vol: 0.3 })),
  ...[2, 3, 4, 5].map((i) => ({ at: line('أول حاجة').words[i].start + 0.05, src: 'blip', vol: 0.3 })),
  ...[0, 1, 2, 3].map((i) => {
    const l = line('بعدها نحطوا');
    const a = l.words[1].start + ((l.end - l.words[1].start) * i) / 4;
    return { at: a + 0.05, src: 'click', vol: 0.45 };
  }),
  { at: line('وتغليف كامل').start, src: 'swish', vol: 0.35, peak: 0.3 },
  ...Array.from({ length: 8 }, (_, i) => {
    const l = line('اللي كامل تحبوا');
    const a = l.words[2].start - 0.1;
    return { at: a + ((l.end - a) * i) / 8, src: 'pop', vol: 0.5 };
  }),
  { at: line('ونزيدوا كذلك').start + 0.3, src: 'whoosh', vol: 0.35, peak: 0.2 },
  { at: line('ونزيدوا كذلك').start + 1.35, src: 'hit', vol: 0.45 },
  { at: w('ونزيدوا كذلك', 'مقوى'), src: 'pop', vol: 0.35 },
  { at: line('ونزيدوا كذلك').words[5].start, src: 'swish', vol: 0.25, peak: 0.3 },
  { at: line('وقبل ما نسكروه').words[2].start - 0.1, src: 'tape', vol: 0.5 },
  { at: w('وقبل ما نسكروه', 'نهزوه'), src: 'whoosh', vol: 0.3, peak: 0.1 },
  { at: w('وقبل ما نسكروه', 'نهزوه') + 0.35, src: 'whoosh', vol: 0.25, peak: 0.1 },
  { at: line('باش نتأكدوا').words[1].start, src: 'shimmer', vol: 0.3 },
  { at: w('باش نتأكدوا', 'تتحركش'), src: 'blip', vol: 0.4 },
  { at: cutBefore('هكا توصلك'), src: 'swell', vol: 0.3, peak: 1.0 },
  { at: w('هكا توصلك', 'سليمة'), src: 'shimmer', vol: 0.3 },
  { at: END, src: 'hit', vol: 0.4 },
  { at: END + 0.8, src: 'pop', vol: 0.3 },
  { at: END + 0.95, src: 'pop', vol: 0.3 },
  { at: END + 1.3, src: 'click', vol: 0.4 },
];

const CaptionLayer: React.FC = () => {
  const t = clock(0, useCurrentFrame());
  return t < END ? <Captions t={t} /> : null;
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    {TIMING.audio ? <Html5Audio src={staticFile(TIMING.audio)} /> : null}
    <Html5Audio
      src={staticFile('music.wav')}
      volume={(f) => interpolate(f, [0, 15, toFrame(END) - 10, toFrame(END) + 10, DURATION_FRAMES - 25, DURATION_FRAMES], [0, 0.11, 0.11, 0.32, 0.32, 0], { extrapolateRight: 'clamp' })}
    />
    {SFX.map((s, i) => {
      const f = Math.max(0, toFrame(s.at - (s.peak ?? 0)));
      return (
        <Sequence key={`sfx${i}`} from={f} durationInFrames={75} layout="none">
          <Html5Audio src={staticFile(`sfx/${s.src}.wav`)} volume={s.vol} />
        </Sequence>
      );
    })}
    {SCENES.map((s) => (
      <Sequence key={s.id} name={s.id} from={toFrame(s.from)} durationInFrames={Math.max(1, toFrame(s.to) - toFrame(s.from))} premountFor={30}>
        <s.C from={toFrame(s.from) / 30} />
      </Sequence>
    ))}
    <CaptionLayer />
  </AbsoluteFill>
);
