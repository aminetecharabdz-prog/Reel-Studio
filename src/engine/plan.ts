/** Style-agnostic plan utilities: word-id repair, scene ordering, editable texts (ported from the wip engine). */

const ANCHOR_KEYS = new Set(['from', 'at', 'typeFrom', 'typeTo', 'send', 'until']);
const TEXT_KEYS: Record<string, string> = { t: 'نص', text: 'نص', title: 'عنوان', tagline: 'شعار', line: 'سطر', cta: 'زر', handle: 'حساب', label: 'تسمية', old: 'السعر القديم', name: 'الاسم', eyebrow: 'سطر صغير', source: 'المصدر', equation: 'معادلة', rest: 'الباقي' };

const idx = (id: string) => Number(id.slice(1));
type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);

/**
 * Repairs a plan in place against the transcript: unknown word ids snap to the nearest real word, scenes are sorted
 * by start word, two scenes never start on the same word, and anchors inside a scene stay inside its window.
 */
export const repairAnchors = <P>(plan: P, wordIds: string[]): { plan: P; issues: string[] } => {
  const issues: string[] = [];
  const p = structuredClone(plan) as unknown as { scenes?: Obj[] };
  const nums = wordIds.map(idx).sort((a, b) => a - b);
  const valid = new Set(wordIds);
  const last = nums[nums.length - 1] ?? 0;
  const snap = (id: string) => {
    if (valid.has(id)) return id;
    const n = Number.isFinite(idx(id)) ? idx(id) : 0;
    const best = nums.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a), nums[0] ?? 0);
    issues.push(`unknown word ${id} → w${best}`);
    return `w${best}`;
  };
  const walk = (o: unknown, lo: number, hi: number) => {
    if (Array.isArray(o)) return o.forEach((x) => walk(x, lo, hi));
    if (!isObj(o)) return;
    for (const [k, v] of Object.entries(o)) {
      if (ANCHOR_KEYS.has(k) && typeof v === 'string' && /^w\d+$/.test(v)) {
        let n = idx(snap(v));
        if (k !== 'from' && (n < lo || n > hi)) {
          const c = Math.min(hi, Math.max(lo, n));
          issues.push(`${k} ${v} outside its scene → w${c}`);
          n = c;
        }
        o[k] = `w${n}`;
      } else if (v && typeof v === 'object') walk(v, lo, hi);
    }
  };
  const scenes = p.scenes ?? [];
  scenes.forEach((s) => {
    if (typeof s.from === 'string') s.from = snap(s.from);
  });
  scenes.sort((a, b) => idx(String(a.from)) - idx(String(b.from)));
  if (scenes[0]) scenes[0].from = `w${nums[0] ?? 0}`;
  for (let i = 1; i < scenes.length; i++) {
    const prev = idx(String(scenes[i - 1]!.from));
    if (idx(String(scenes[i]!.from)) <= prev) {
      const next = nums.find((n) => n > prev);
      if (next === undefined) {
        issues.push(`scene ${i + 1} dropped (no words left)`);
        scenes.splice(i, 1);
        i--;
        continue;
      }
      issues.push(`scene ${i + 1} start moved to w${next}`);
      scenes[i]!.from = `w${next}`;
    }
  }
  scenes.forEach((s, i) => {
    const lo = idx(String(s.from));
    const hi = i + 1 < scenes.length ? idx(String(scenes[i + 1]!.from)) - 1 : last;
    walk(s, lo, Math.max(lo, hi));
  });
  return { plan: p as unknown as P, issues };
};

export type EditableText = { scene: number; path: string; label: string; value: string };

/** every user-visible string in the plan with a JSON path (for the scene editor) */
export const listTexts = (plan: unknown): EditableText[] => {
  const out: EditableText[] = [];
  const walk = (o: unknown, path: string, scene: number) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${path}.${i}`, scene));
    if (!isObj(o)) return;
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'string' && TEXT_KEYS[k] && v.trim()) out.push({ scene, path: `${path}.${k}`, label: TEXT_KEYS[k]!, value: v });
      else if (v && typeof v === 'object') walk(v, `${path}.${k}`, scene);
    }
  };
  const scenes = (plan as { scenes?: unknown[] }).scenes ?? [];
  scenes.forEach((s, i) => walk(s, `scenes.${i}`, i));
  return out;
};

export const setAtPath = <P>(plan: P, path: string, value: string): P => {
  const p = structuredClone(plan) as unknown as Obj;
  const keys = path.split('.');
  let o: unknown = p;
  for (const k of keys.slice(0, -1)) o = Array.isArray(o) ? o[Number(k)] : isObj(o) ? o[k] : undefined;
  const lastKey = keys[keys.length - 1]!;
  if (Array.isArray(o)) o[Number(lastKey)] = value;
  else if (isObj(o)) o[lastKey] = value;
  return p as unknown as P;
};
