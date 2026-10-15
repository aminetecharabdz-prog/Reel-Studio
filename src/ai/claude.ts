/** Claude as motion director: transcript → scene graph via a tool call, Zod-validated with one repair round. */
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { PlanSchema, type Plan, type Transcript } from '@/engine/schema';
import { DIRECTOR_RULES, briefText, type DirectorBrief } from './prompt';
import { sanitizePlan } from './sanitize';
import { cacheGet, cacheSet, hash, logCost } from '@/data/db';
import { modelPrice } from '@/data/settings';

export class AIError extends Error {
  constructor(public code: 'key' | 'network' | 'refusal' | 'invalid' | 'quota', msg: string) {
    super(msg);
  }
}

const planJsonSchema = () => {
  const s = z.toJSONSchema(PlanSchema.omit({ author: true, v: true }), { target: 'draft-7', io: 'input' }) as Record<string, unknown>;
  delete s.$schema;
  return s;
};

export const client = (key: string) => new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 2 });

const cost = (model: string, u: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number | null; cache_creation_input_tokens?: number | null }) => {
  const p = modelPrice(model);
  return (u.input_tokens * p.inUsd + (u.cache_creation_input_tokens ?? 0) * p.inUsd * 1.25 + (u.cache_read_input_tokens ?? 0) * p.inUsd * 0.1 + u.output_tokens * p.outUsd) / 1e6;
};

export type DirectOpts = { key: string; model: string; effort: 'low' | 'medium' | 'high'; brief: DirectorBrief; transcript: Transcript; projectId?: string; onStatus?: (s: string) => void; signal?: AbortSignal };

export const directWithClaude = async (o: DirectOpts): Promise<{ plan: Plan; usd: number; issues: string[] }> => {
  const user = briefText(o.brief);
  const ck = `dir:${o.model}:${await hash(DIRECTOR_RULES.length + user)}`;
  const hit = await cacheGet<Plan>(ck);
  if (hit && !o.brief.restyle) return { plan: hit, usd: 0, issues: [] };

  const c = client(o.key);
  const tool = { name: 'direct_video', description: 'Submit the complete motion-graphics plan (style DNA + scenes) for this video.', input_schema: planJsonSchema() as Anthropic.Tool.InputSchema };
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: `${user}\n\nDesign the video now and submit it by calling direct_video exactly once.` }];
  let usd = 0;
  let lastIssues: string[] = [];
  for (let round = 0; round < 2; round++) {
    o.onStatus?.(round ? 'repair' : 'direct');
    let msg: Anthropic.Message;
    try {
      const stream = c.messages.stream(
        {
          model: o.model,
          max_tokens: 32000,
          system: [{ type: 'text', text: DIRECTOR_RULES, cache_control: { type: 'ephemeral' } }],
          tools: [tool],
          tool_choice: { type: 'auto' },
          messages,
          ...(o.model.includes('haiku') ? {} : { output_config: { effort: o.effort } }),
        } as Anthropic.MessageStreamParams,
        { signal: o.signal },
      );
      msg = await stream.finalMessage();
    } catch (e) {
      const err = e as { status?: number; message?: string };
      if (err.status === 401 || err.status === 403) throw new AIError('key', 'مفتاح Claude غير صالح');
      if (err.status === 429 || err.status === 402) throw new AIError('quota', 'رصيد Claude انتهى أو كثرة الطلبات');
      throw new AIError('network', err.message ?? 'network');
    }
    const u = cost(o.model, msg.usage);
    usd += u;
    await logCost({ provider: 'claude', what: round ? 'director-repair' : 'director', usd: u, projectId: o.projectId, detail: `${msg.usage.input_tokens}+${msg.usage.output_tokens} tok` });
    if (msg.stop_reason === 'refusal') throw new AIError('refusal', 'Claude رفض هذا المحتوى');
    const call = msg.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === 'direct_video');
    if (!call) {
      lastIssues = ['no tool call'];
      messages.push({ role: 'assistant', content: msg.content }, { role: 'user', content: 'You must submit the plan by calling the direct_video tool.' });
      continue;
    }
    const { plan, issues } = sanitizePlan(call.input, o.transcript, 'claude');
    if (plan && plan.scenes.length >= Math.min(3, Math.ceil(o.transcript.words.length / 12))) {
      await cacheSet(ck, plan);
      return { plan, usd, issues };
    }
    lastIssues = issues;
    messages.push(
      { role: 'assistant', content: msg.content },
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: call.id, is_error: true, content: `The plan is invalid. Fix these problems and call direct_video again with the full corrected plan:\n${issues.slice(0, 20).join('\n')}` }] },
    );
  }
  throw new AIError('invalid', `plan invalid: ${lastIssues.slice(0, 3).join('; ')}`);
};

/** Quick key check (cheap). */
export const testClaudeKey = async (key: string, model: string) => {
  const r = await client(key).messages.create({ model, max_tokens: 16, messages: [{ role: 'user', content: 'ping' }] });
  return r.id.length > 0;
};
