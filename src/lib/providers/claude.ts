/**
 * Claude (BYOK, called from the owner's browser). Structured output through a forced tool call, validated with Zod,
 * cached by content hash in IndexedDB, every paid call logged in the cost ledger.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';
import { db, logCost } from '@/data/db';
import { getSettings } from '@/data/settings';

const PRICE: Record<string, [number, number]> = { 'claude-opus-5-5': [4, 20], 'claude-sonnet-5-5': [2, 10], 'claude-sonnet-5': [2, 10] };

export const hasClaude = () => !!getSettings().keys.anthropic.trim();

const hash = async (s: string) => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
};

export const claudeTool = async <T>(opts: { system: string; user: string; toolName: string; toolDescription: string; inputSchema: Record<string, unknown>; schema: z.ZodType<T>; op: string; maxTokens?: number }): Promise<T> => {
  const { keys, claudeModel } = getSettings();
  if (!keys.anthropic.trim()) throw new Error('أضف مفتاح Claude في الإعدادات');
  const model = claudeModel || 'claude-sonnet-5-5';
  const key = `claude:${await hash(JSON.stringify([model, opts.system, opts.user, opts.toolName]))}`;
  const d = await db();
  const cached = await d.get('cache', key);
  if (cached) {
    const ok = opts.schema.safeParse(cached.value);
    if (ok.success) return ok.data;
  }
  const client = new Anthropic({ apiKey: keys.anthropic.trim(), dangerouslyAllowBrowser: true });
  const res = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 8000,
    system: opts.system,
    tools: [{ name: opts.toolName, description: opts.toolDescription, input_schema: opts.inputSchema as Anthropic.Tool.InputSchema }],
    tool_choice: { type: 'tool', name: opts.toolName },
    messages: [{ role: 'user', content: opts.user }],
  });
  const [pin, pout] = PRICE[model] ?? [2, 10];
  await logCost({ provider: 'anthropic', op: opts.op, usd: (res.usage.input_tokens * pin + res.usage.output_tokens * pout) / 1e6, note: model });
  if (res.stop_reason === 'max_tokens') throw new Error('الرد طويل جدًا، جرّب سكريبت أقصر');
  const block = res.content.find((c) => c.type === 'tool_use');
  if (!block || block.type !== 'tool_use') throw new Error('لم يرجع Claude خطة');
  const parsed = opts.schema.safeParse(block.input);
  if (!parsed.success) throw new Error(`خطة غير صالحة: ${parsed.error.issues[0]?.message ?? ''}`);
  await d.put('cache', { key, value: parsed.data, at: Date.now() });
  return parsed.data;
};
