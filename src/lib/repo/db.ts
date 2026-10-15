/**
 * Local persistence (phases 0–4) in IndexedDB, behind the Repo interface so it can move to
 * Supabase in phase 5 (SPEC §2.1, §9).
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Project } from '../schema/project';
import { ProjectSchema } from '../schema/project';

export type AssetKind = 'audio' | 'video' | 'image' | 'font' | 'logo' | 'render' | 'generated-image';
export type Asset = { id: string; projectId: string | null; kind: AssetKind; name: string; mime: string; size: number; hash?: string; blob: Blob; createdAt: number; meta?: Record<string, unknown> };
export type CacheEntry = { key: string; value: unknown; createdAt: number };
export type Fingerprint = { id: string; projectId: string; createdAt: number; mood: string; easing: string; hue: number; sequence: string[] };
export type LedgerEntry = { id: string; at: number; projectId: string | null; provider: string; model: string; op: string; units: number; unitLabel: string; usd: number };

interface StudioDB extends DBSchema {
  projects: { key: string; value: Project; indexes: { updatedAt: number } };
  assets: { key: string; value: Asset; indexes: { projectId: string; hash: string } };
  cache: { key: string; value: CacheEntry };
  fingerprints: { key: string; value: Fingerprint; indexes: { createdAt: number } };
  ledger: { key: string; value: LedgerEntry; indexes: { at: number; projectId: string } };
  settings: { key: string; value: { key: string; value: unknown } };
}

export interface Repo {
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  saveProject(p: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  putAsset(a: Asset): Promise<void>;
  getAsset(id: string): Promise<Asset | undefined>;
  findAssetByHash(hash: string): Promise<Asset | undefined>;
  cacheGet<T>(key: string): Promise<T | undefined>;
  cacheSet(key: string, value: unknown): Promise<void>;
  addFingerprint(f: Fingerprint): Promise<void>;
  recentFingerprints(n: number): Promise<Fingerprint[]>;
  addLedger(e: LedgerEntry): Promise<void>;
  ledger(): Promise<LedgerEntry[]>;
  getSetting<T>(key: string): Promise<T | undefined>;
  setSetting(key: string, value: unknown): Promise<void>;
}

let dbp: Promise<IDBPDatabase<StudioDB>> | null = null;
const db = () =>
  (dbp ??= openDB<StudioDB>('nabra-studio', 1, {
    upgrade(d) {
      const p = d.createObjectStore('projects', { keyPath: 'id' });
      p.createIndex('updatedAt', 'updatedAt');
      const a = d.createObjectStore('assets', { keyPath: 'id' });
      a.createIndex('projectId', 'projectId');
      a.createIndex('hash', 'hash');
      d.createObjectStore('cache', { keyPath: 'key' });
      d.createObjectStore('fingerprints', { keyPath: 'id' }).createIndex('createdAt', 'createdAt');
      const l = d.createObjectStore('ledger', { keyPath: 'id' });
      l.createIndex('at', 'at');
      l.createIndex('projectId', 'projectId');
      d.createObjectStore('settings', { keyPath: 'key' });
    },
  }));

export const idbRepo: Repo = {
  async listProjects() {
    const all = await (await db()).getAll('projects');
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  },
  async getProject(id) {
    const p = await (await db()).get('projects', id);
    if (!p) return undefined;
    const parsed = ProjectSchema.safeParse(p);
    return parsed.success ? parsed.data : p;
  },
  async saveProject(p) {
    await (await db()).put('projects', { ...p, updatedAt: Date.now() });
  },
  async deleteProject(id) {
    const d = await db();
    const tx = d.transaction(['projects', 'assets'], 'readwrite');
    await tx.objectStore('projects').delete(id);
    const keys = await tx.objectStore('assets').index('projectId').getAllKeys(id);
    for (const k of keys) await tx.objectStore('assets').delete(k);
    await tx.done;
  },
  async putAsset(a) {
    await (await db()).put('assets', a);
  },
  async getAsset(id) {
    return (await db()).get('assets', id);
  },
  async findAssetByHash(hash) {
    return (await db()).getFromIndex('assets', 'hash', hash);
  },
  async cacheGet<T>(key: string) {
    return ((await (await db()).get('cache', key))?.value as T) ?? undefined;
  },
  async cacheSet(key, value) {
    await (await db()).put('cache', { key, value, createdAt: Date.now() });
  },
  async addFingerprint(f) {
    await (await db()).put('fingerprints', f);
  },
  async recentFingerprints(n) {
    const all = await (await db()).getAllFromIndex('fingerprints', 'createdAt');
    return all.slice(-n).reverse();
  },
  async addLedger(e) {
    await (await db()).put('ledger', e);
  },
  async ledger() {
    return (await db()).getAllFromIndex('ledger', 'at');
  },
  async getSetting<T>(key: string) {
    return ((await (await db()).get('settings', key))?.value as T) ?? undefined;
  },
  async setSetting(key, value) {
    await (await db()).put('settings', { key, value });
  },
};

export const repo: Repo = idbRepo;
