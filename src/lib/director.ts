/** The AI art director: Claude plans the video in the chosen style's vocabulary (word ids only), then we repair it. */
import { z } from 'zod';
import { TimingIndex, type Timing } from '@/engine/timing';
import type { PlanInput, StyleModule } from '@/engine/types';
import { claudeTool } from './providers/claude';

export const claudePlan = async (style: StyleModule<never>, input: PlanInput) => {
  const T = new TimingIndex(input.timing);
  const transcript = T.lines.map((l) => l.words.map((w) => `${w.id}:${w.w}`).join(' ')).join('\n');
  const plan = await claudeTool({
    op: `plan:${style.meta.id}`,
    system: style.director.system,
    user: [
      `Aspect ${input.aspect}. Goal: ${input.goal}. Topic: ${input.topic || '-'}. Brand: ${input.brandName || '-'}.`,
      input.product ? `Product facts (use exactly): ${JSON.stringify(input.product)}` : '',
      `Transcript (one script line per row, word ids before each word):\n${transcript}`,
      'Plan the whole video now with the tool.',
    ].join('\n\n'),
    toolName: 'plan',
    toolDescription: 'The full scene plan for this video.',
    inputSchema: style.director.toolSchema,
    schema: style.schema as unknown as z.ZodType<unknown>,
    maxTokens: 12000,
  });
  return style.sanitize(plan as never, T);
};

export const timingText = (t: Timing) => t.lines.map((l) => l.text).join('\n');
