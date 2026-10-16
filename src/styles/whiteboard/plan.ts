/**
 * whiteboard — the no-key planner: a title from the first line, then one drawing per sentence chosen from what the
 * sentence says (object with label, process arrow, list → objects, number callout, contrast ✗/✓, ground band,
 * summary journey, CTA note), always ending on the pull-back reveal. Colours carry meaning (STYLE.md §2).
 */
import { TimingIndex, norm, type Word } from '@/engine/timing';
import { clean, iconFor, isStop, keyIndex, listSegments } from '@/engine/lexicon';
import type { PlanInput } from '@/engine/types';
import { WhiteboardPlanSchema, type WbItem, type WhiteboardPlan } from './schema';

const cut = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trim()}…`);
const has = (s: string, re: RegExp) => re.test(norm(s));

const BESPOKE: Array<[RegExp, string]> = [
  [/شمس|حراره|سخون|soleil|sun|heat/, 'sun'],
  [/سحاب|غيم|مطر|شتا|nuage|cloud|rain/, 'cloud'],
  [/جبل|جبال|montagne|mountain/, 'mountain'],
  [/ماء|الما|قطره|ترطيب|eau|water|drop/, 'drop'],
  [/نبات|شجر|زرع|نمو|يكبر|plante|plant|grow/, 'plant'],
  [/شخص|زبون|انسان|واحد|personne|person|client/, 'person'],
  [/فلوس|دينار|دراهم|مال|سعر|argent|money|price/, 'coin'],
  [/فكره|ذكي|idée|idea/, 'bulb'],
];
const propFor = (text: string) => {
  for (const [re, id] of BESPOKE) if (re.test(norm(text))) return id;
  return iconFor(text, 'sparkles');
};
const colorFor = (text: string): 'ink' | 'blue' | 'red' | 'orange' | 'green' => {
  const n = norm(text);
  if (/ماء|بحر|مطر|سحاب|برد|هادئ|eau|water|calm|cool/.test(n)) return 'blue';
  if (/حر|سخون|خطر|تحذير|غالي|مشكل|danger|warning|problem|heat/.test(n)) return 'red';
  if (/شمس|طاقه|فلوس|مال|فرح|energy|money|joy/.test(n)) return 'orange';
  if (/نمو|نجاح|ربح|صحه|ارض|نبات|success|growth|health|green/.test(n)) return 'green';
  return 'ink';
};
const PROCESS = /(يتحول|يولي|تولي|يطلع|تطلع|يروح|يرجع|ينزل|يمشي|يوصل|ثم|بعدها|من بعد|يصبح|devient|monte|then|turns|becomes|rises)/;
const CONTRAST = /(بصح|لكن|ماشي|بدل|عوض|mais|instead|not|plutot)/;
const SUMMARY = /(وهكذا|هكذا|اذن|الخلاصه|في الاخير|donc|so |finally|ainsi)/;
const CTA = /(تابع|اشترك|حمل|اطلب|جرب|زور|abonne|follow|subscribe|order|try)/;
const BAND = /(الارض|ارض|البحر|بحر|التربه|sol|mer|sea|ground)/;

const keyWord = (ws: Word[]) => ws[keyIndex(ws.map((w) => clean(w.w)))]!;
const label = (ws: Word[]) => cut(clean(keyWord(ws).w), 24);

export const whiteboardLocalPlan = (input: PlanInput): WhiteboardPlan => {
  const T = new TimingIndex(input.timing);
  const lines = T.lines;
  const first = lines[0]!;
  const titleWords = first.words.slice(0, 6);
  const items: WbItem[] = [];
  const objIdx: number[] = [];
  let banded = false;
  const ROT = ['blue', 'green', 'orange', 'red'] as const;
  let rot = 0;
  const pick = (text: string) => {
    const c = colorFor(text);
    return c === 'ink' ? ROT[rot++ % ROT.length]! : c;
  };
  const propOf = (word: string, text: string) => {
    const a = propFor(word);
    return a !== 'sparkles' ? a : propFor(text);
  };
  const addObject = (ws: Word[], at: Word, text: string, face = false) => {
    items.push({ kind: 'object', from: ws[0]!.id, at: at.id, prop: propOf(at.w, text), label: cut(clean(at.w), 24), color: pick(`${at.w} ${text}`), face });
    objIdx.push(items.length - 1);
  };
  lines.forEach((l, li) => {
    if (li === 0) return;
    const ws = l.words;
    const text = l.text;
    const last = li === lines.length - 1;
    const segs = listSegments(ws.map((w) => w.w));
    const nums = ws.filter((w) => /\d/.test(w.w));
    if (last) {
      if (has(text, CTA)) items.push({ kind: 'note', from: ws[0]!.id, at: ws[0]!.id, text: cut(text, 36) });
      items.push({ kind: 'reveal', from: ws[0]!.id });
      return;
    }
    if (has(text, SUMMARY) && objIdx.length >= 3) {
      items.push({ kind: 'journey', from: ws[0]!.id, at: ws[Math.min(1, ws.length - 1)]!.id, mascot: items.some((x) => x.kind === 'object' && x.prop === 'drop') ? 'drop' : 'coin' });
      return;
    }
    if (!banded && has(text, BAND)) {
      banded = true;
      const at = ws.find((w) => BAND.test(norm(w.w))) ?? ws[0]!;
      items.push({ kind: 'band', from: ws[0]!.id, at: at.id, label: cut(clean(at.w), 24), color: has(text, /بحر|ماء|mer|sea|water/) ? 'blue' : 'green', wavy: has(text, /بحر|ماء|mer|sea|water/) });
      return;
    }
    if (has(text, CONTRAST)) {
      const k = ws.findIndex((w) => CONTRAST.test(norm(w.w)));
      const A = ws.slice(0, Math.max(1, k)).filter((w) => !isStop(w.w));
      const Bw = ws.slice(k + 1).filter((w) => !isStop(w.w));
      if (A.length && Bw.length) {
        const a = keyWord(A);
        const b = keyWord(Bw);
        items.push({ kind: 'contrast', from: ws[0]!.id, at: ws[Math.max(0, k)]!.id, a: { prop: propFor(A.map((w) => w.w).join(' ')), label: cut(clean(a.w), 24) }, b: { prop: propFor(Bw.map((w) => w.w).join(' ')), label: cut(clean(b.w), 24) } });
        return;
      }
    }
    if (segs.length >= 2) {
      segs.slice(0, 3).forEach((s, k) => {
        const at = ws[s.i]!;
        items.push({ kind: 'object', from: ws[0]!.id, at: at.id, prop: propFor(s.label), label: cut(s.label, 24), color: pick(s.label), face: false });
        objIdx.push(items.length - 1);
        if (k > 0) items.push({ kind: 'arrow', from: ws[0]!.id, at: at.id, a: objIdx[objIdx.length - 2]!, b: objIdx[objIdx.length - 1]!, label: '', color: 'green' });
      });
      return;
    }
    // a sentence: one new object (its key noun), an arrow from the previous one when it describes a process
    const kw = keyWord(ws);
    const isProcess = has(text, PROCESS) && objIdx.length >= 1;
    addObject(ws, kw, text, objIdx.length === 0 || ['sun', 'drop', 'coin', 'bulb'].includes(propFor(text)));
    if (isProcess) {
      const verb = ws.find((w) => PROCESS.test(norm(w.w))) ?? kw;
      items.push({ kind: 'arrow', from: ws[0]!.id, at: verb.id, a: objIdx[objIdx.length - 2]!, b: objIdx[objIdx.length - 1]!, label: cut(clean(verb.w), 24), color: colorFor(text) === 'ink' ? 'red' : colorFor(text) });
    }
    if (nums.length) items.push({ kind: 'number', from: ws[0]!.id, at: nums[0]!.id, value: cut(clean(nums[0]!.w), 12), label: '', color: 'orange' });
    else if (li === 2 && objIdx.length >= 1) items.push({ kind: 'emphasis', from: ws[0]!.id, at: kw.id, target: objIdx[objIdx.length - 1]! });
  });
  if (!items.some((x) => x.kind === 'reveal')) items.push({ kind: 'reveal', from: lines[lines.length - 1]!.words[0]!.id });
  return WhiteboardPlanSchema.parse({
    style: 'whiteboard',
    title: { text: cut(titleWords.map((w) => w.w).join(' '), 40), from: titleWords[0]!.id, to: titleWords[titleWords.length - 1]!.id },
    items,
  });
};

export { label as keyLabel };
