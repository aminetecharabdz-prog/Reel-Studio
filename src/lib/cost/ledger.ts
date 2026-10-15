import { repo, type LedgerEntry } from '../repo/db';
import { PRICES } from '../providers/config';
import { uid } from '../util/rng';

export const logCost = async (e: Omit<LedgerEntry, 'id' | 'at'>) => {
  await repo.addLedger({ ...e, id: uid('c_'), at: Date.now() });
};

export const claudeCost = (model: keyof typeof PRICES & string, usage: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number | null }) => {
  const p = (PRICES as unknown as Record<string, { in: number; out: number; cacheRead: number }>)[model];
  if (!p) return 0;
  return (usage.input_tokens ?? 0) * p.in + (usage.output_tokens ?? 0) * p.out + (usage.cache_read_input_tokens ?? 0) * p.cacheRead;
};

export const projectCost = (entries: LedgerEntry[], projectId: string) => entries.filter((e) => e.projectId === projectId).reduce((s, e) => s + e.usd, 0);
