import { z } from 'zod';

export const WordSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
  confidence: z.number().min(0).max(1).default(1),
});
export type Word = z.infer<typeof WordSchema>;

export const TranscriptSchema = z
  .object({
    language: z.enum(['ar', 'fr', 'en', 'mixed']).default('ar'),
    words: z.array(WordSchema).min(1),
    durationMs: z.number().positive(),
    source: z.enum(['demo', 'elevenlabs', 'whisper', 'openai', 'mock', 'tts', 'manual']).default('manual'),
  })
  .superRefine((t, ctx) => {
    const ids = new Set<string>();
    let prevStart = -1;
    t.words.forEach((w, i) => {
      if (ids.has(w.id)) ctx.addIssue({ code: 'custom', message: `duplicate word id ${w.id}`, path: ['words', i] });
      ids.add(w.id);
      if (w.endMs < w.startMs) ctx.addIssue({ code: 'custom', message: `word ${w.id} ends before it starts`, path: ['words', i] });
      if (w.startMs < prevStart) ctx.addIssue({ code: 'custom', message: `word ${w.id} out of order`, path: ['words', i] });
      prevStart = w.startMs;
    });
  });
export type Transcript = z.infer<typeof TranscriptSchema>;
