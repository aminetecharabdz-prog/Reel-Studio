import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DemoSchema } from '@/app/demos';
import { compile } from '@/engine/compile';
import { checkReel } from '@/engine/qa';
import { localDirector } from '@/ai/local';
import { estimateTranscript } from '@/ai/speech';
import { LEAD, msToFrame } from '@/engine/timing';

const demos = readdirSync('public/demo').filter((f) => f.endsWith('.json')).map((f) => DemoSchema.parse(JSON.parse(readFileSync(`public/demo/${f}`, 'utf8'))));
const C = (plan: Parameters<typeof compile>[0]['plan'], transcript: Parameters<typeof compile>[0]['transcript'], mode: 'content' | 'product' | 'talking' = 'content') =>
  compile({ plan, transcript, mode, aspect: '9:16', fps: 30, resolve: () => 'x.webp', captionsOn: true });

describe('video QA', () => {
  for (const d of demos) {
    it(`${d.id}: no QA issues`, () => {
      expect(checkReel(C(d.plan, d.transcript, d.mode))).toEqual([]);
    });
    it(`${d.id}: anchored words appear ${4} frames before they are spoken (±1)`, () => {
      const c = C(d.plan, d.transcript, d.mode);
      const byId = new Map(d.transcript.words.map((w) => [w.id, w]));
      let n = 0;
      c.scenes.forEach((s, si) => s.layers.forEach((l, li) => {
        if (l.type !== 'text') return;
        const src = d.plan.scenes[si]!.layers[li]!;
        if (src.type !== 'text') return;
        src.lines.flat().forEach((w, k) => {
          const cw = l.words!.flat()[k]!;
          if (!w.at || n > 40) return;
          const expected = Math.max(0, msToFrame(byId.get(w.at)!.startMs, 30) - s.startF - LEAD(30));
          if (cw.inF > expected) expect(cw.inF - expected).toBeLessThanOrEqual(1);
          n++;
        });
      }));
      expect(n).toBeGreaterThan(5);
    });
  }
  it('captions cover every word exactly once', () => {
    const d = demos[0]!;
    const c = C({ ...d.plan, style: { ...d.plan.style, captions: 'clean' } }, d.transcript);
    expect(c.captions.flatMap((x) => x.words.map((w) => w.id))).toEqual(d.transcript.words.map((w) => w.id));
  });
  it('local director: two topics/seeds give different looks', () => {
    const t1 = estimateTranscript('واش تعرف بلي 80% من الناس يشريو من الريلز؟ المحتوى الملل ما يبيعش. جرّب اليوم.');
    const t2 = estimateTranscript('هذا العطر يدوم معاك نهار كامل. ريحة فخمة بسعر معقول. اطلب دروك والتوصيل لكل الولايات.');
    const a = localDirector(t1, { mode: 'content', seed: 'a' }), b = localDirector(t2, { mode: 'product', seed: 'b' });
    expect(a.style.palette.accent).not.toBe(b.style.palette.accent);
    for (const p of [a, b]) expect(checkReel(C(p, p === a ? t1 : t2))).toEqual([]);
  });
});
