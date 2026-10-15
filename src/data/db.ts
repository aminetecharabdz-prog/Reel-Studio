/** IndexedDB: projects, binary assets (audio/video/images/fonts), AI result cache, cost ledger. */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Project } from './project';

type Asset = { id: string; blob: Blob; mime: string; name: string; createdAt: number };
type CacheRow = { key: string; value: unknown; createdAt: number };
export type LedgerRow = { id?: number; at: number; provider: 'claude' | 'gemini' | 'elevenlabs'; what: string; usd: number; projectId?: string; detail?: string };

interface MotiqDB extends DBSchema {
  projects: { key: string; value: Project; indexes: { updatedAt: number } };
  assets: { key: string; value: Asset };
  cache: { key: string; value: CacheRow };
  ledger: { key: number; value: LedgerRow; indexes: { at: number } };
}

let dbp: Promise<IDBPDatabase<MotiqDB>> | null = null;
export const db = () =>
  (dbp ??= openDB<MotiqDB>('motiq', 1, {
    upgrade(d) {
      d.createObjectStore('projects', { keyPath: 'id' }).createIndex('updatedAt', 'updatedAt');
      d.createObjectStore('assets', { keyPath: 'id' });
      d.createObjectStore('cache', { keyPath: 'key' });
      d.createObjectStore('ledger', { keyPath: 'id', autoIncrement: true }).createIndex('at', 'at');
    },
  }));

export const uid = (p = '') => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// projects
export const listProjects = async () => (await (await db()).getAllFromIndex('projects', 'updatedAt')).reverse();
export const getProject = async (id: string) => (await db()).get('projects', id);
export const putProject = async (p: Project) => {
  await (await db()).put('projects', { ...p, updatedAt: Date.now() });
};
export const deleteProject = async (id: string) => (await db()).delete('projects', id);

// assets
const urls = new Map<string, string>();
export const putAsset = async (blob: Blob, name = 'file', id = uid('a_')) => {
  await (await db()).put('assets', { id, blob, mime: blob.type, name, createdAt: Date.now() });
  return id;
};
export const getAsset = async (id: string) => (await db()).get('assets', id);
/** Object URL for an asset (memoised); call loadAssetUrls first for sync lookup inside the renderer. */
export const assetUrl = (id: string) => urls.get(id) ?? null;
export const loadAssetUrls = async (ids: Iterable<string>) => {
  const d = await db();
  for (const id of ids) {
    if (urls.has(id)) continue;
    const a = await d.get('assets', id);
    if (a) urls.set(id, URL.createObjectURL(a.blob));
  }
};

// cache by content hash
export const hash = async (s: string) => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('').slice(0, 32);
};
export const cacheGet = async <T>(key: string) => ((await (await db()).get('cache', key))?.value as T | undefined) ?? null;
export const cacheSet = async (key: string, value: unknown) => {
  await (await db()).put('cache', { key, value, createdAt: Date.now() });
};

// cost ledger
export const logCost = async (r: Omit<LedgerRow, 'id' | 'at'>) => {
  try {
    await (await db()).add('ledger', { ...r, at: Date.now() });
  } catch {
    /* ledger is best-effort */
  }
};
export const ledger = async () => (await (await db()).getAllFromIndex('ledger', 'at')).reverse();
