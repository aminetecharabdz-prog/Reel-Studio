import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { z } from 'zod';

/** Everything the user makes stays in this browser (IndexedDB). */
export const BrandKitSchema = z.object({
  name: z.string().default(''),
  logo: z.string().nullable().default(null), // data URL
  colors: z.array(z.string()).default(['#FF7A1A', '#0A141B']),
  font: z.enum(['Alexandria', 'IBM Plex Sans Arabic', 'Readex Pro', 'Noto Kufi Arabic', 'Changa', 'El Messiri']).default('Alexandria'),
  handles: z.object({ instagram: z.string().default(''), tiktok: z.string().default(''), facebook: z.string().default(''), phone: z.string().default(''), whatsapp: z.string().default('') }).default({ instagram: '', tiktok: '', facebook: '', phone: '', whatsapp: '' }),
  endCard: z.object({ enabled: z.boolean().default(true), line: z.string().default('') }).default({ enabled: true, line: '' }),
});
export type BrandKit = z.infer<typeof BrandKitSchema>;

export type ProjectRecord = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  styleId: string;
  goal: string;
  aspect: string;
  /** small JPEG data URL */
  cover: string | null;
  /** the full project document (wizard state, plan, transcript) — validated by the studio */
  doc: unknown;
};

type LedgerRow = { id?: number; at: number; provider: string; op: string; usd: number; note?: string };

interface RassamDB extends DBSchema {
  projects: { key: string; value: ProjectRecord; indexes: { updatedAt: number } };
  assets: { key: string; value: { id: string; blob: Blob; type: string; name: string; at: number } };
  cache: { key: string; value: { key: string; value: unknown; at: number } };
  ledger: { key: number; value: LedgerRow };
  kv: { key: string; value: unknown };
}

let dbp: Promise<IDBPDatabase<RassamDB>> | null = null;
export const db = () =>
  (dbp ??= openDB<RassamDB>('rassam', 1, {
    upgrade(d) {
      const p = d.createObjectStore('projects', { keyPath: 'id' });
      p.createIndex('updatedAt', 'updatedAt');
      d.createObjectStore('assets', { keyPath: 'id' });
      d.createObjectStore('cache', { keyPath: 'key' });
      d.createObjectStore('ledger', { keyPath: 'id', autoIncrement: true });
      d.createObjectStore('kv');
    },
  }));

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${performance.now().toString(36).replace('.', '')}`);

export const listProjects = async () => (await (await db()).getAllFromIndex('projects', 'updatedAt')).reverse();
export const getProject = async (id: string) => (await db()).get('projects', id);
export const saveProject = async (p: ProjectRecord) => (await db()).put('projects', { ...p, updatedAt: Date.now() });
export const deleteProject = async (id: string) => (await db()).delete('projects', id);
export const duplicateProject = async (id: string) => {
  const p = await getProject(id);
  if (!p) return;
  const copy = { ...structuredClone(p), id: uid(), name: `${p.name} (نسخة)`, createdAt: Date.now() };
  await saveProject(copy);
  return copy;
};

export const getBrandKit = async (): Promise<BrandKit> => BrandKitSchema.parse(((await (await db()).get('kv', 'brandKit')) as object | undefined) ?? {});
export const saveBrandKit = async (b: BrandKit) => (await db()).put('kv', BrandKitSchema.parse(b), 'brandKit');

export const logCost = async (row: Omit<LedgerRow, 'id' | 'at'>) => (await db()).add('ledger', { ...row, at: Date.now() });
export const ledgerTotal = async () => (await (await db()).getAll('ledger')).reduce((a, r) => a + r.usd, 0);

export const clearAllData = async () => {
  const d = await db();
  await Promise.all((['projects', 'assets', 'cache', 'ledger', 'kv'] as const).map((s) => d.clear(s)));
};

export const exportAllData = async () => {
  const d = await db();
  return { version: 1, exportedAt: new Date().toISOString(), projects: await d.getAll('projects'), brandKit: await d.get('kv', 'brandKit') ?? null };
};
