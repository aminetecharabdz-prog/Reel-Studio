import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { TranscriptSchema, type Transcript } from '../schema/transcript';
import { designDNA } from '../design/artDirector';
import { detectTopic, type Topic } from '../design/topics';
import { planLocally } from '../director/localDirector';
import { checkPlan, autoFixPlan } from '../qa/checks';
import { toPlan } from '../providers/claude';
import { contrast } from '../color/contrast';
import { applyCuts } from '../timing/cuts';

const load = (id: string) => TranscriptSchema.parse(JSON.parse(readFileSync(`public/demo/${id}.transcript.json`, 'utf8')));
const jaccard = (a: string[], b: string[]) => {
  const A = new Set(a), B = new Set(b);
  return [...A].filter((x) => B.has(x)).length / new Set([...a, ...b]).size;
};

describe('Phase 2: 10 consecutive videos show no repeated look', () => {
  it('different topics + anti-repetition → distinct palettes, motion and primitive sequences', () => {
    const sources: Array<[string, Topic]> = [['dentist', 'dental'], ['engine', 'automotive'], ['phone-holder', 'product'], ['dentist', 'medical'], ['engine', 'tech'], ['phone-holder', 'fashion'], ['dentist', 'beauty'], ['engine', 'sport'], ['phone-holder', 'food'], ['dentist', 'education']];
    const history: Array<{ seq: string[]; hue: string; easing: string; mood: string }> = [];
    sources.forEach(([id, topic], i) => {
      const t = load(id);
      const recent = history.slice(-10);
      const dna = designDNA({ topic, seed: 1000 + i * 7919, avoid: { moods: recent.map((r) => r.mood), easings: recent.slice(-1).map((r) => r.easing), hues: [] } });
      const plan = planLocally({ transcript: t, dna, mode: 'A', pacing: 'auto', seed: 1000 + i * 7919, recentSequences: recent.map((r) => r.seq) });
      const seq = plan.scenes.map((s) => s.primitive);
      for (const h of history.filter((x) => x.seq.length && x.hue !== '')) {
        // looks never repeat: either the palette or the primitive sequence differs strongly
        expect(h.hue === dna.palette.primary && jaccard(h.seq, seq) >= 0.4).toBe(false);
      }
      const prev = history[history.length - 1];
      if (prev) expect(prev.hue).not.toBe(dna.palette.primary);
      history.push({ seq, hue: dna.palette.primary, easing: dna.motionLanguage.easing, mood: dna.mood });
    });
    expect(new Set(history.map((h) => h.hue)).size).toBe(10);
  });

  it('every generated palette keeps text readable (≥ 4.5:1)', () => {
    for (let i = 0; i < 40; i++) {
      const topics: Topic[] = ['dental', 'automotive', 'product', 'food', 'kids', 'tech', 'beauty', 'general'];
      const dna = designDNA({ topic: topics[i % topics.length]!, seed: i * 104729 });
      for (const bg of [...dna.palette.bg, dna.palette.surface]) expect(contrast(dna.palette.text, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(dna.palette.textOnAccent, dna.palette.accent)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('Phase 2: QA catches seeded errors', () => {
  const t: Transcript = load('dentist');
  const dna = designDNA({ topic: detectTopic(t.words.map((w) => w.text).join(' ')).topic, seed: 5 });
  const good = planLocally({ transcript: t, dna, mode: 'A', pacing: 'auto', seed: 5 });
  it('a valid plan has no errors', () => {
    expect(checkPlan(good, t, 'A').filter((i) => i.severity === 'error')).toEqual([]);
  });
  it('detects missing content, gaps, bad anchors, repetition — and fixes them', () => {
    const bad = structuredClone(good);
    bad.scenes[1]!.primitive = 'big-number';
    bad.scenes[1]!.content = { headline: 'x' }; // big number without a value
    bad.scenes.splice(3, 1); // coverage gap
    bad.scenes[4]!.content.headlineAt = 'w-unknown';
    bad.scenes[6]!.primitive = bad.scenes[5]!.primitive;
    bad.scenes[6]!.variant = bad.scenes[5]!.variant;
    const issues = checkPlan(bad, t, 'A');
    const kinds = new Set(issues.map((i) => i.check));
    expect(kinds.has('content')).toBe(true);
    expect(kinds.has('coverage')).toBe(true);
    expect(kinds.has('anchors')).toBe(true);
    expect(kinds.has('repetition')).toBe(true);
    const fixed = autoFixPlan(bad, t, issues).plan;
    expect(checkPlan(fixed, t, 'A').filter((i) => i.severity === 'error')).toEqual([]);
  });
});

describe('Claude director output → internal plan', () => {
  it('maps nullable strict-tool output and validates it', () => {
    const t = load('phone-holder');
    const scene = (from: string, to: string, primitive: string, extra: Record<string, unknown> = {}) => ({
      from, to, primitive, variant: 1, transition: 'zoom', emphasis: [from], headline: 'راك تسوق', headlineAt: from, sub: null, kicker: null, items: [],
      value: null, valueFrom: null, valueAt: null, unit: null, prefix: null, icon: 'car', icons: [], price: null, oldPrice: null, wilayas: null, rating: null,
      imagePrompt: null, userImage: null, speaker: null, zoomOn: [], bgIndex: 0, ...extra,
    });
    const plan = toPlan([scene('w0', 'w5', 'question-hook'), scene('w6', 'w52', 'product-hero', { userImage: 0, price: 1500 })], ['h1', 'h2'], [{ src: 'demo/phone-holder.svg' }]);
    expect(plan.scenes[1]!.content.image).toEqual({ src: 'demo/phone-holder.svg' });
    expect(plan.scenes[0]!.content.sub).toBeUndefined();
    expect(checkPlan(plan, t, 'B').filter((i) => i.severity === 'error')).toEqual([]);
  });
});

describe('Mode C cuts', () => {
  it('removes fillers and silences, keeps ids, shortens the timeline', () => {
    const t = load('dentist');
    const cut = applyCuts(t, [{ startMs: 6000, endMs: 7000, kind: 'silence', enabled: true }, { startMs: t.words[3]!.startMs, endMs: t.words[3]!.endMs, kind: 'filler', enabled: true }]);
    expect(cut.transcript.words.find((w) => w.id === 'w3')).toBeUndefined();
    expect(cut.transcript.durationMs).toBeLessThan(t.durationMs - 1000);
    expect(cut.segments.length).toBeGreaterThanOrEqual(2);
  });
});
