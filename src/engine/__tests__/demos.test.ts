import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DemoSchema } from '@/app/demos';
import { compile } from '@/engine/compile';

const dir = 'public/demo';
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

describe('demo fixtures', () => {
  for (const f of files) {
    it(`${f} parses and compiles`, () => {
      const r = DemoSchema.safeParse(JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
      if (!r.success) throw new Error(r.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'));
      const c = compile({ plan: r.data.plan, transcript: r.data.transcript, mode: r.data.mode, aspect: '9:16', fps: 30, resolve: () => 'x' });
      expect(c.scenes.length).toBe(r.data.plan.scenes.length);
      // every scene starts after the previous and every layer enters inside its scene
      c.scenes.forEach((s, i) => {
        if (i) expect(s.startF).toBeGreaterThan(c.scenes[i - 1]!.startF);
        s.layers.forEach((l) => expect(l.inF).toBeLessThan(s.duration));
      });
    });
  }
});
