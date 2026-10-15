/** Make an AI plan safe: keep valid layers, drop unknown word ids, re-cover the transcript, validate with Zod. */
import { LayerSchema, PlanSchema, SceneSchema, StyleSchema, type Plan, type Transcript } from '@/engine/schema';
import { FONT } from '@/engine/fonts';

type AnyObj = Record<string, unknown>;
const isObj = (v: unknown): v is AnyObj => !!v && typeof v === 'object' && !Array.isArray(v);

export const sanitizePlan = (raw: unknown, tr: Transcript, author: Plan['author'] = 'claude'): { plan: Plan | null; issues: string[] } => {
  const issues: string[] = [];
  if (!isObj(raw)) return { plan: null, issues: ['plan is not an object'] };
  const ids = new Set(tr.words.map((w) => w.id));
  const order = new Map(tr.words.map((w, i) => [w.id, i]));
  const style = StyleSchema.safeParse(raw.style);
  if (!style.success) {
    issues.push(`style: ${style.error.issues.slice(0, 6).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    return { plan: null, issues };
  }
  const st = style.data;
  for (const [role, f] of Object.entries(st.fonts)) {
    if (!FONT.has(f.ar) || FONT.get(f.ar)!.script !== 'ar') { issues.push(`fonts.${role}.ar unknown → cairo`); f.ar = 'cairo'; }
    if (!FONT.has(f.lat) || FONT.get(f.lat)!.script !== 'lat') { issues.push(`fonts.${role}.lat unknown → inter`); f.lat = 'inter'; }
  }
  const scenesIn = Array.isArray(raw.scenes) ? raw.scenes : [];
  const scenes = [];
  for (const [si, s] of scenesIn.entries()) {
    if (!isObj(s)) continue;
    const layers = [];
    for (const l of Array.isArray(s.layers) ? s.layers : []) {
      if (!isObj(l)) continue;
      const fix = (o: AnyObj) => {
        for (const k of ['at', 'exitAt']) if (typeof o[k] === 'string' && !ids.has(o[k] as string)) delete o[k];
      };
      fix(l);
      if (Array.isArray(l.lines)) l.lines = (l.lines as unknown[]).map((ln) => (Array.isArray(ln) ? ln.filter(isObj).map((w) => (fix(w), w)) : ln));
      if (Array.isArray(l.items)) (l.items as unknown[]).filter(isObj).forEach(fix);
      const r = LayerSchema.safeParse(l);
      if (r.success) layers.push(r.data);
      else issues.push(`scene ${si} layer ${String(l.id ?? '?')}: ${r.error.issues.slice(0, 3).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    }
    const sc = SceneSchema.safeParse({ ...s, layers });
    if (sc.success) scenes.push(sc.data);
    else issues.push(`scene ${si}: ${sc.error.issues.slice(0, 4).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  }
  // order + coverage: snap from/to to known ids, make scenes contiguous
  const good = scenes.filter((s) => ids.has(s.from) || ids.has(s.to)).map((s) => ({ ...s, from: ids.has(s.from) ? s.from : s.to, to: ids.has(s.to) ? s.to : s.from }));
  good.sort((a, b) => order.get(a.from)! - order.get(b.from)!);
  if (!good.length) return { plan: null, issues: [...issues, 'no valid scenes'] };
  const W = tr.words;
  good[0]!.from = W[0]!.id;
  for (let i = 0; i < good.length; i++) {
    const nx = good[i + 1];
    const end = nx ? order.get(nx.from)! - 1 : W.length - 1;
    if (end < order.get(good[i]!.from)!) {
      issues.push(`scene ${good[i]!.id} overlaps; merged`);
      good.splice(i, 1);
      i = Math.max(-1, i - 2);
      continue;
    }
    good[i]!.to = W[end]!.id;
  }
  const p = PlanSchema.safeParse({ v: 1, style: st, scenes: good, hooks: Array.isArray(raw.hooks) ? (raw.hooks as unknown[]).filter((h) => typeof h === 'string').slice(0, 3) : [], author });
  if (!p.success) return { plan: null, issues: [...issues, ...p.error.issues.slice(0, 5).map((i) => `${i.path.join('.')} ${i.message}`)] };
  return { plan: p.data, issues };
};
