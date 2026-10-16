/**
 * plotter — the no-key planner: pen title from the first line, then per sentence a hero stack (claim + key word in
 * orange), node flow (steps / lists), prompt input (questions / quotes / instructions), graph card (growth/speed),
 * schematic (a concrete object; the product photo for ads), paper form (before → after), film strip (video/result),
 * karaoke for plain explanations, ≤ 2 slams per minute on peak words, arc outro last.
 */
import { TimingIndex, norm, type Word } from '@/engine/timing';
import { chunk, clean, iconFor, isQuestion, isStop, keyIndex, listSegments } from '@/engine/lexicon';
import type { PlanInput } from '@/engine/types';
import { PlotterPlanSchema, type PlotterPlan, type PlotterScene } from './schema';

const cut = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trim()}…`);
const has = (s: string, re: RegExp) => re.test(norm(s));
const kws = (ws: Word[]) => {
  const k = keyIndex(ws.map((w) => clean(w.w)));
  return ws.map((w, i) => ({ t: cut(w.w, 28), at: w.id, key: i === k }));
};

const GROWTH = /(اسرع|سريع|نمو|يزيد|تزيد|زياده|اكثر|ضعف|مرات|يكبر|تكبر|growth|faster|plus|increase|%)/;
const BEFORE_AFTER = /(بدل|عوض|قبل|بعد|الان|دابا|before|after|instead|avant|apres)/;
const VIDEO = /(فيديو|مقطع|ريلز|فيلم|video|reel|film)/;
const PEAK = /(هنا|الحل|السر|المفاجاه|بزاف|مستحيل|صدق|ابدا|never|secret)/;

export const plotterLocalPlan = (input: PlanInput): PlotterPlan => {
  const T = new TimingIndex(input.timing);
  const lines = T.lines;
  const scenes: PlotterScene[] = [];
  let slams = 0;
  let lastSlam = -9;
  let usedPaper = false;
  let usedSchem = false;
  const product = input.product?.name ? input.product : null;
  lines.forEach((l, li) => {
    const ws = l.words;
    const w0 = ws[0]!;
    const text = l.text;
    const last = li === lines.length - 1 && lines.length > 2;
    if (li === 0) {
      scenes.push({ kind: 'penTitle', from: w0.id, words: kws(ws.slice(0, 8)) });
      return;
    }
    if (last) {
      const content = ws.filter((w) => !isStop(w.w));
      const a = content[0] ?? w0;
      const b = content[Math.max(0, content.length - 2)] ?? ws[ws.length - 1]!;
      const end = content[content.length - 1] ?? ws[ws.length - 1]!;
      scenes.push({ kind: 'arcOutro', from: w0.id, a: { t: cut(clean(a.w), 28), at: a.id, key: false }, b: { t: cut(clean(b.w), 28), at: b.id, key: false }, end: { t: cut(product?.name ?? clean(end.w), 28), at: end.id, key: true } });
      return;
    }
    // peak word → slam (≤ 2 per minute, never two in a row)
    const peak = ws.find((w) => PEAK.test(norm(w.w)));
    if (peak && ws.length <= 4 && slams < Math.max(1, Math.round(T.duration / 30)) && li - lastSlam > 2) {
      slams++;
      lastSlam = li;
      scenes.push({ kind: 'slam', from: w0.id, word: { t: cut(ws.map((w) => w.w).join(' '), 28), at: peak.id, key: true }, counter: '' });
      return;
    }
    const segs = listSegments(ws.map((w) => w.w));
    if (segs.length >= 2) {
      scenes.push({ kind: 'nodeFlow', from: w0.id, title: cut(ws.slice(0, segs[0]!.i).filter((w) => !isStop(w.w)).map((w) => w.w).join(' '), 60), nodes: segs.slice(0, 5).map((s) => ({ t: cut(s.label, 28), at: ws[s.i]!.id, key: false })) });
      return;
    }
    if (!usedPaper && has(text, BEFORE_AFTER) && ws.length >= 4) {
      usedPaper = true;
      const i0 = ws.findIndex((w) => BEFORE_AFTER.test(norm(w.w)));
      // «بدل X ... Y»: X is the old row; «X بدل Y»: Y is the old row
      const rest = i0 === 0 ? ws.slice(1) : ws;
      const mid = i0 === 0 ? Math.max(1, Math.ceil(rest.length / 2)) : Math.max(1, i0);
      const oldWs = i0 === 0 ? rest.slice(0, mid) : ws.slice(i0 + 1);
      const newWs = i0 === 0 ? rest.slice(mid) : ws.slice(0, mid);
      scenes.push({ kind: 'paperForm', from: w0.id, title: cut(input.topic || 'استمارة التغيير', 40), oldRow: { t: cut(oldWs.map((w) => w.w).join(' '), 28), at: oldWs[0]!.id, key: false }, newRow: { t: cut(newWs.map((w) => w.w).join(' '), 28), at: newWs[0]!.id, key: true }, stamp: 'معتمد' });
      return;
    }
    if (isQuestion(text) || /«|"/.test(text)) {
      scenes.push({ kind: 'promptInput', from: w0.id, words: kws(ws.slice(0, 16)), table: [] });
      return;
    }
    if (has(text, VIDEO)) {
      scenes.push({ kind: 'filmStrip', from: w0.id, words: kws(ws.slice(0, 10)) });
      return;
    }
    if (has(text, GROWTH)) {
      scenes.push({ kind: 'graphCard', from: w0.id, words: kws(ws.slice(0, 10)), formula: 'easeInOutCubic(t)' });
      return;
    }
    const icon = iconFor(text, '');
    if ((icon || product) && !usedSchem) {
      usedSchem = true;
      const kw = ws[keyIndex(ws.map((w) => clean(w.w)))]!;
      scenes.push({ kind: 'schematic', from: w0.id, prop: icon || 'box', label: cut(product?.name ?? clean(kw.w), 24), at: kw.id, ...(product?.photos[0] ? { photo: product.photos[0] } : {}), dims: '', words: kws(ws.slice(0, 10)) });
      return;
    }
    if (ws.length <= 5) {
      const k = Math.max(0, ws.length - 2);
      scenes.push({ kind: 'heroStack', from: w0.id, kicker: kws(ws.slice(0, k)).map((x) => ({ ...x, key: false })), hero: kws(ws.slice(k)).map((x, i, a) => ({ ...x, key: i === a.length - 1 })), prop: '' });
      return;
    }
    chunk(ws, 14).forEach((part) => scenes.push({ kind: 'karaoke', from: part[0]!.id, words: kws(part) }));
  });
  return PlotterPlanSchema.parse({ style: 'plotter', scenes });
};
