/** Claude writes a short reel script (voice-over) from a brief — structured output via a tool, Zod-validated. */
import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { client, AIError } from './claude';
import { logCost } from '@/data/db';
import { modelPrice } from '@/data/settings';

const Out = z.object({ script: z.string().min(10).max(1500), hooks: z.array(z.string()).max(3).default([]) });

const RULES = `You write voice-over scripts for vertical reels (20–45 s, 50–110 words). Rules:
- Language: the requested one. For Algerian Darija write natural Darija in Arabic letters (French words allowed as people speak).
- Structure: hook in the first sentence (question, bold claim, number, pain, curiosity or direct callout) → problem/desire → solution/product → 2–3 concrete benefits → offer (only facts given) → one clear CTA.
- Never invent prices, guarantees, reviews or medical claims. Short sentences, spoken rhythm, punctuation for pauses.
Return the result ONLY by calling the write_script tool.`;

export const writeScript = async (o: { key: string; model: string; brief: string; language: string; mode: string }) => {
  const tool = { name: 'write_script', description: 'Return the script and 3 alternative hooks.', input_schema: z.toJSONSchema(Out, { target: 'draft-7', io: 'input' }) as Anthropic.Tool.InputSchema };
  try {
    const r = await client(o.key).messages.create({
      model: o.model,
      max_tokens: 4000,
      system: RULES,
      tools: [tool],
      tool_choice: { type: 'auto' },
      messages: [{ role: 'user', content: `Language: ${o.language === 'ar-dz' ? 'Algerian Darija' : o.language}\nVideo type: ${o.mode}\nBrief: ${o.brief}\nCall write_script now.` }],
    } as Anthropic.MessageCreateParamsNonStreaming);
    const p = modelPrice(o.model);
    await logCost({ provider: 'claude', what: 'script', usd: (r.usage.input_tokens * p.inUsd + r.usage.output_tokens * p.outUsd) / 1e6 });
    const call = r.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    const parsed = Out.safeParse(call?.input);
    if (!parsed.success) throw new AIError('invalid', 'تعذّر كتابة النص، أعد المحاولة');
    return parsed.data;
  } catch (e) {
    if (e instanceof AIError) throw e;
    const err = e as { status?: number; message?: string };
    if (err.status === 401) throw new AIError('key', 'مفتاح Claude غير صالح');
    throw new AIError('network', err.message ?? 'network');
  }
};
