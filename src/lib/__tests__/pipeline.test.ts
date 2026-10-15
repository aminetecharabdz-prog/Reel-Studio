import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { TranscriptSchema } from '../schema/transcript';
import { StyleSettingsSchema } from '../schema/project';
import { designDNA } from '../design/artDirector';
import { detectTopic } from '../design/topics';
import { planLocally } from '../director/localDirector';
import { sceneSignature } from '../director/hero';
import { compileReel } from '../timing/compiler';
import { msToFrame } from '../timing/frames';

const load = (id: string) => TranscriptSchema.parse(JSON.parse(readFileSync(`public/demo/${id}.transcript.json`, 'utf8')));

describe.each(['dentist', 'engine', 'phone-holder'])('pipeline %s', (id) => {
  const t = load(id);
  const text = t.words.map((w) => w.text).join(' ');
  const { topic } = detectTopic(text);
  const dna = designDNA({ topic, seed: 1234 });
  const plan = planLocally({ transcript: t, dna, mode: id === 'phone-holder' ? 'B' : 'A', pacing: 'auto', seed: 1234 });
  const style = StyleSettingsSchema.parse({});
  const reel = compileReel({ mode: 'A', transcript: t, dna, plan, style, media: { voiceSrc: 'x.mp3' } });

  it('detects topic and prints plan', () => {
    console.log(id, topic, dna.mood, dna.typography.display.family, dna.motionLanguage.easing, dna.background.kind);
    for (const s of plan.scenes) console.log(' ', s.primitive, '|', s.content.headline ?? '', s.content.value ?? '', (s.content.items ?? []).map((i) => i.text).join(' / '));
    expect(plan.scenes.length).toBeGreaterThan(5);
  });
  it('scenes are contiguous, ≥12 frames, cut on word boundaries', () => {
    for (let i = 0; i < reel.scenes.length; i++) {
      const s = reel.scenes[i]!;
      expect(s.duration).toBeGreaterThanOrEqual(12);
      const n = reel.scenes[i + 1];
      if (n) expect(s.from + s.duration).toBe(n.from);
    }
  });
  it('every word is captioned exactly once with 0-frame drift', () => {
    const capWords = reel.captions.flatMap((c) => c.words);
    expect(capWords.map((w) => w.id)).toEqual(t.words.map((w) => w.id));
    for (const w of capWords) {
      const src = t.words.find((x) => x.id === w.id)!;
      expect(Math.abs(w.start - msToFrame(src.startMs, 30))).toBeLessThanOrEqual(1);
    }
  });
  it('no primitive twice in a row and ≤3 uses', () => {
    const seq = plan.scenes.map(sceneSignature);
    for (let i = 1; i < seq.length; i++) expect(seq[i]).not.toBe(seq[i - 1]);
    const counts = seq.reduce<Record<string, number>>((m, p) => ({ ...m, [p]: (m[p] ?? 0) + 1 }), {});
    expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(3);
  });
});
