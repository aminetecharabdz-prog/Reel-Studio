/**
 * QUALITY_BAR.md regression checks (owner rejected the first demo: empty scenes, generic visuals,
 * reversed Arabic/French order, same background everywhere, headline repeating the caption).
 * The DOM-level checks (hero area ≥ 35 % of the frame, no overflow) run in tests/visual.spec.ts.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { TranscriptSchema } from '../schema/transcript';
import { PlanSchema, type Plan } from '../schema/plan';
import { DesignDNASchema } from '../schema/dna';
import { finalizeDNA, designDNA } from '../design/artDirector';
import { detectTopic } from '../design/topics';
import { planLocally } from '../director/localDirector';
import { checkPlan, headlineEchoes } from '../qa/checks';
import { sceneSignature } from '../director/hero';
import { ART3D, findArt } from '../design/art3d';
import { ILLUSTRATIONS } from '../../video/illustrations';
import { groupWordRuns, splitRuns } from '../text/bidi';
import { contrast } from '../color/contrast';

const load = (id: string) => TranscriptSchema.parse(JSON.parse(readFileSync(`public/demo/${id}.transcript.json`, 'utf8')));
const direction = (id: string) => {
  const j = JSON.parse(readFileSync(`public/demo/${id}.direction.json`, 'utf8'));
  return { dna: finalizeDNA(DesignDNASchema.parse(j.dna)), plan: PlanSchema.parse(j.plan) };
};
const ARTS = new Set<string>(ART3D);
const labelWords = (h: string) => h.split(/\s+/).filter((w) => /[\p{L}]{2,}/u.test(w) && !/^\d/.test(w));

const assertQuality = (plan: Plan, id: string, mode: 'A' | 'B') => {
  const t = load(id);
  const errors = checkPlan(plan, t, mode).filter((i) => i.severity === 'error' || ['bg-variety', 'headline-long', 'repetition'].includes(i.check));
  expect(errors).toEqual([]);
  // ≥ 3 background treatments per video
  expect(new Set(plan.scenes.map((s) => s.bg ?? 'dna')).size).toBeGreaterThanOrEqual(3);
  for (const [i, s] of plan.scenes.entries()) {
    // every scene has a hero visual that exists
    expect(s.primitive, `${id} scene ${i}`).toBe('hero-scene');
    const h = s.content.hero!;
    expect(h.art || h.illus || h.image, `${id} scene ${i} hero`).toBeTruthy();
    if (h.art) expect(ARTS.has(h.art), `${id} art ${h.art}`).toBe(true);
    if (h.art2) expect(ARTS.has(h.art2), `${id} art ${h.art2}`).toBe(true);
    for (const p of h.props ?? []) expect(ARTS.has(p), `${id} prop ${p}`).toBe(true);
    if (h.badge?.art) expect(ARTS.has(h.badge.art), `${id} badge ${h.badge.art}`).toBe(true);
    if (h.illus) expect(ILLUSTRATIONS[h.illus], `${id} illus ${h.illus}`).toBeTruthy();
    // headline = 1–3 key words, never the caption sentence
    const hl = s.content.headline ?? '';
    expect(labelWords(hl).length, `${id} scene ${i} headline “${hl}”`).toBeLessThanOrEqual(3);
    const order = new Map(t.words.map((w, k) => [w.id, k]));
    const spoken = t.words.slice(order.get(s.from)!, order.get(s.to)! + 1).map((w) => w.text);
    expect(headlineEchoes(hl, spoken)).toBe(false);
    // never two identical compositions in a row
    if (i > 0) expect(sceneSignature(s) === sceneSignature(plan.scenes[i - 1]!) && s.variant === plan.scenes[i - 1]!.variant).toBe(false);
  }
};

describe('QUALITY_BAR — demo directions (authored fixtures)', () => {
  for (const [id, mode] of [['dentist', 'A'], ['engine', 'A'], ['phone-holder', 'B']] as const) {
    it(`${id}: every scene has a valid topic-literal hero, short labels, ≥3 backgrounds`, () => {
      const { dna, plan } = direction(id);
      assertQuality(plan, id, mode);
      for (const s of plan.scenes) expect(s.content.hero?.note, `${id} ${s.id}: director must say what the viewer sees`).toBeTruthy();
      for (const bg of [...dna.palette.bg, dna.palette.surface]) expect(contrast(dna.palette.text, bg)).toBeGreaterThanOrEqual(4.5);
    });
  }
  it('the three demos have different colour stories', () => {
    const hues = ['dentist', 'engine', 'phone-holder'].map((id) => direction(id).dna.palette.bg[0]);
    expect(new Set(hues).size).toBe(3);
  });
});

describe('QUALITY_BAR — local director (no AI key) meets the same MUSTs', () => {
  for (const [id, mode] of [['dentist', 'A'], ['engine', 'A'], ['phone-holder', 'B']] as const) {
    it(`${id}`, () => {
      const t = load(id);
      const dna = designDNA({ topic: detectTopic(t.words.map((w) => w.text).join(' ')).topic, seed: 77 });
      const plan = planLocally({ transcript: t, dna, mode, pacing: 'auto', seed: 77, images: mode === 'B' ? [{ src: 'demo/phone-holder.svg' }] : [] });
      assertQuality(plan, id, mode);
    });
  }
  it('topic words map to literal 3D objects', () => {
    expect(findArt('سنانك')).toBe('tooth');
    expect(findArt('la brosse')).toBe('toothbrush');
    expect(findArt('السكر')).toBe('candy');
    expect(findArt("l'huile")).toBe('droplet');
    expect(findArt('التوصيل')).toBe('delivery-truck');
    expect(findArt('المغناطيسي')).toBe('magnet');
  });
});

describe('QUALITY_BAR §6 — mixed Arabic/French order', () => {
  it('a French phrase inside Arabic is one LTR run in spoken order', () => {
    for (const [text, latin] of [['استعمل le fil dentaire', 'le fil dentaire'], ['بدّل la brosse تاعك', 'la brosse'], ["بدّل l'huile كل 10 000 km", "l'huile"]] as const) {
      const runs = splitRuns(text);
      expect(runs.map((r) => r.dir)[0]).toBe('rtl');
      expect(runs.find((r) => r.dir === 'ltr')!.text.trim().startsWith(latin)).toBe(true);
      const groups = groupWordRuns(text.split(' '));
      const ltr = groups.find((g) => g.dir === 'ltr')!;
      expect(ltr.indices.map((k) => text.split(' ')[k]).join(' ').startsWith(latin)).toBe(true);
    }
  });
});
