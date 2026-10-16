/**
 * infographic — the no-key planner. This style is about REAL numbers from the script (STYLE.md §10): each line with
 * figures becomes a data beat (grid for one %, bar → ring for a split, versus/compare for amounts, timeline for
 * years); lines without figures become headlines over a glass object; the last beat carries the source line.
 */
import { TimingIndex, norm, type Word } from '@/engine/timing';
import { clean, iconFor, isStop, keyIndex } from '@/engine/lexicon';
import type { PlanInput } from '@/engine/types';
import { InfographicPlanSchema, type Beat, type InfographicPlan } from './schema';

const cut = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trim()}…`);
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const toLatin = (s: string) => s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
const PCT = /^(بالمي[ةه]|بالمئ[ةه]|بالمائ[ةه]|في المية|pourcent|percent|%)$/;

export type Fig = { value: number; decimals: number; unit: string; word: Word; idx: number; year: boolean };

/** the numbers in a line, with their unit (% when written or said) */
export const figures = (ws: Word[]): Fig[] => {
  const out: Fig[] = [];
  ws.forEach((w, i) => {
    const raw = toLatin(w.w).replace(/[٫,]/g, '.');
    const m = /(\d+(?:\.\d+)?)/.exec(raw);
    if (!m) return;
    const value = Number(m[1]);
    if (!Number.isFinite(value)) return;
    const next = ws[i + 1] ? clean(ws[i + 1]!.w) : '';
    const pct = /%|٪/.test(w.w) || PCT.test(norm(next)) || PCT.test(next);
    const year = !pct && Number.isInteger(value) && value >= 1900 && value <= 2100;
    const unitWord = !pct && !year && next && !isStop(next) && !/\d/.test(next) && next.length <= 8 ? next : '';
    out.push({ value, decimals: m[1]!.includes('.') ? Math.min(2, m[1]!.split('.')[1]!.length) : 0, unit: pct ? '%' : unitWord === 'دينار' || unitWord === 'دج' ? ' دج' : '', word: w, idx: i, year });
  });
  return out;
};

const content = (ws: Word[]) => ws.filter((w) => !isStop(w.w) && !/\d/.test(w.w) && !PCT.test(norm(clean(w.w))));
const words = (ws: Word[], n: number) =>
  content(ws)
    .slice(0, n)
    .map((w) => clean(w.w))
    .join(' ');

export const infographicLocalPlan = (input: PlanInput): InfographicPlan => {
  const T = new TimingIndex(input.timing);
  const beats: Beat[] = [];
  const lines = T.lines;
  const srcLine = lines.findIndex((l) => /(^|\s)(المصدر|حسب|وفق|source|selon|according)/i.test(l.text));
  let gridUsed = 0;
  lines.forEach((l, li) => {
    if (li === srcLine) return;
    const ws = l.words;
    const w0 = ws[0]!;
    const figs = figures(ws);
    let pcts = figs.filter((f) => f.unit === '%');
    const years = figs.filter((f) => f.year);
    let plain = figs.filter((f) => f.unit !== '%' && !f.year);
    // «45 بالمية، 30 و 25»: the % said once covers the other shares of the same whole
    if (pcts.length >= 1 && plain.length >= 1 && plain.every((f) => f.value <= 100) && [...pcts, ...plain].reduce((a, f) => a + f.value, 0) <= 100.5) {
      pcts = [...pcts, ...plain.map((f) => ({ ...f, unit: '%' }))].sort((a, b) => a.idx - b.idx);
      plain = [];
    }
    const prev = beats[beats.length - 1];
    const before = (f: Fig) => cut(words(ws.slice(0, f.idx), 5), 60);
    const after = (f: Fig) => cut(words(ws.slice(f.idx + 1), 6), 60);
    /** a share's name: the words since the previous figure, else the words right after it */
    const nameOf = (f: Fig, list: Fig[]) => {
      const k = list.indexOf(f);
      const lo = k > 0 ? list[k - 1]!.idx + 1 : 0;
      return cut(words(ws.slice(lo, f.idx), 2) || words(ws.slice(f.idx + 1, f.idx + 4), 2) || before(f), 36);
    };
    if (years.length >= 2) {
      beats.push({ kind: 'timeline', from: w0.id, at: years[1]!.word.id, fromYear: years[0]!.value, toYear: years[1]!.value, eyebrow: cut(words(ws.slice(0, years[0]!.idx), 4), 60), label: cut(words(ws.slice(years[1]!.idx + 1), 5) || words(ws.slice(years[0]!.idx + 1, years[1]!.idx), 4), 60) });
      return;
    }
    if (pcts.length >= 2 && pcts.reduce((a, f) => a + f.value, 0) <= 100.5) {
      const segments = pcts.slice(0, 4).map((f) => ({ label: nameOf(f, pcts), value: f.value, at: f.word.id }));
      const rest = 100 - segments.reduce((a, s) => a + s.value, 0);
      if (rest > 0.5 && segments.length < 4) segments.push({ label: 'الباقي', value: Math.round(rest * 10) / 10, at: pcts[pcts.length - 1]!.word.id });
      const title = cut(words(ws.slice(0, pcts[0]!.idx), 5) === segments[0]!.label ? '' : words(ws.slice(0, pcts[0]!.idx), 5), 60);
      if (prev?.kind === 'bar' && segments.length >= 2) beats.push({ kind: 'ring', from: w0.id, title, eyebrow: '', segments, unit: '%' });
      else beats.push({ kind: 'bar', from: w0.id, title, eyebrow: '', segments, unit: '%' });
      return;
    }
    if (pcts.length === 1) {
      const f = pcts[0]!;
      const num = { value: f.value, decimals: f.decimals, unit: '%', at: f.word.id };
      if (f.value <= 100 && gridUsed < 2 && prev?.kind !== 'grid') {
        gridUsed++;
        beats.push({ kind: 'grid', from: w0.id, num, eyebrow: before(f), label: after(f), rest: f.value < 100 ? 'الباقي' : '' });
      } else beats.push({ kind: 'stat', from: w0.id, num, visual: li === 0 ? 'globe' : 'sphere', eyebrow: before(f), label: after(f) });
      return;
    }
    if (plain.length >= 2) {
      const items = plain.slice(0, 4).map((f) => ({ label: nameOf(f, plain), value: f.value, at: f.word.id }));
      const unit = plain[0]!.unit;
      if (items.length === 2) beats.push({ kind: 'versus', from: w0.id, title: cut(words(ws.slice(0, plain[0]!.idx), 5), 60), eyebrow: '', a: items[0]!, b: items[1]!, unit });
      else beats.push({ kind: 'compare', from: w0.id, title: cut(words(ws.slice(0, plain[0]!.idx), 5), 60), eyebrow: '', items: [...items].sort((a, b) => b.value - a.value), unit });
      return;
    }
    if (plain.length === 1 || years.length === 1) {
      const f = (plain[0] ?? years[0])!;
      const num = { value: f.value, decimals: f.decimals, unit: f.unit, at: f.word.id };
      const icon = iconFor(l.text, '');
      if (icon && prev?.kind !== 'symbol') beats.push({ kind: 'symbol', from: w0.id, icon, num, eyebrow: before(f), label: after(f), equation: '' });
      else beats.push({ kind: 'stat', from: w0.id, num, visual: li === 0 ? 'globe' : prev?.kind === 'stat' ? 'none' : 'sphere', eyebrow: before(f), label: after(f) });
      return;
    }
    // no figure: a headline, the key word in cyan
    const k = keyIndex(ws.map((w) => clean(w.w)));
    beats.push({ kind: 'headline', from: w0.id, text: cut(l.text.replace(/[.،,]$/, ''), 90), key: cut(clean(ws[k]!.w), 30), eyebrow: '' });
  });
  const srcText = srcLine >= 0 ? cut(lines[srcLine]!.text.replace(/^(المصدر|source)\s*[:：]?\s*/i, ''), 90) : '';
  const lastWord = srcLine >= 0 ? lines[srcLine]!.words[0]! : null;
  if (lastWord) beats.push({ kind: 'source', from: lastWord.id, title: '', source: srcText });
  // keep scenes in time order (the source line may sit anywhere)
  beats.sort((a, b) => T.indexOf(a.from) - T.indexOf(b.from));
  return InfographicPlanSchema.parse({ style: 'infographic', beats: beats.length ? beats : [{ kind: 'headline', from: T.words[0]!.id, text: cut(lines[0]!.text, 90), key: '', eyebrow: '' }] });
};
