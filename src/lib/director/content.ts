import type { Word } from '../schema/transcript';
import type { Item } from '../schema/plan';
import { cleanWord, isStopword, normalizeAr, salience } from '../text/keywords';
import { findIconConcept } from '../design/icons';

export type NumberHit = { value: number; unit?: string; wordId: string; index: number; isPercent: boolean; isPrice: boolean; isWilaya: boolean };

const UNIT_WORDS: Array<[RegExp, string]> = [
  [/^(دج|da|دينار|dinars?)$/i, 'دج'],
  [/^(ولايه|ولايات|wilayas?)$/i, 'ولاية'],
  [/^(km|كيلومتر|كلم)$/i, 'km'],
  [/^(دقيقه|دقايق|دقائق|minutes?)$/i, 'دقيقة'],
  [/^(شهر|شهور|اشهر|mois)$/i, 'شهور'],
  [/^(مره|مرات|fois)$/i, 'مرات'],
  [/^(دوره|tours?)$/i, 'دورة'],
  [/^(درجه|degres?)$/i, '°'],
  [/^(ساعه|ساعات|heures?)$/i, 'ساعة'],
  [/^(يوم|ايام|jours?)$/i, 'أيام'],
];

/** Find numbers spoken in the beat (digits as an STT engine returns them) with their unit. */
export const findNumbers = (words: Word[]): NumberHit[] => {
  const out: NumberHit[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i]!;
    let raw = w.text.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    // "10 000" can come as two tokens
    const next = words[i + 1];
    if (/^\d{1,3}$/.test(cleanWord(raw)) && next && /^\d{3}[^\d]*$/.test(cleanWord(next.text))) raw = cleanWord(raw) + cleanWord(next.text);
    const m = /(\d+(?:[.,]\d+)?)/.exec(raw.replace(/\s/g, ''));
    if (!m) continue;
    const value = parseFloat(m[1]!.replace(',', '.'));
    const isPercent = /%/.test(raw) || /^(بالميه|فالميه|pourcent)$/.test(normalizeAr(next?.text ?? ''));
    let unit: string | undefined = isPercent ? '%' : /°/.test(raw) ? '°' : /km/i.test(raw) ? 'km' : undefined;
    const after = [words[i + 1], words[i + 2]].filter(Boolean).map((x) => normalizeAr(x!.text));
    if (!unit) for (const a of after) { const hit = UNIT_WORDS.find(([re]) => re.test(a)); if (hit) { unit = hit[1]; break; } }
    out.push({ value, unit, wordId: w.id, index: i, isPercent, isPrice: unit === 'دج', isWilaya: unit === 'ولاية' });
  }
  return out;
};

const FILLER = /^(يعني|راني|راك|راه|ني|هاه|ايه|euh|bon|donc|alors|اوكي|ok)$/;
const LEAD = /^(و|ثم|بصح|اولا|ثانيا|ثالثا|رابعا|الاولي|الثانيه|الثالثه|الرابعه|هاذا|هذا|كي)$/;

/** Distil 1–5 words of on-screen text from what was said (never invents words). */
export const distill = (words: Word[], maxWords = 4): { text: string; firstId?: string } => {
  const ws = words.filter((w) => !FILLER.test(normalizeAr(w.text)));
  if (ws.length === 0) return { text: '' };
  const clean = (list: Word[]) => list.map((w, i) => (i === list.length - 1 && !/[؟?!]$/.test(w.text) ? cleanWord(w.text) || w.text : w.text.replace(/[،,;؛:.]$/, ''))).join(' ');
  if (ws.length <= maxWords) {
    const trimmed = ws.filter((w, i) => !(i === 0 && LEAD.test(normalizeAr(cleanWord(w.text))) && ws.length > 2));
    return { text: clean(trimmed), firstId: trimmed.find((w) => !isStopword(w.text))?.id ?? trimmed[0]?.id };
  }
  let best = { s: -1, a: 0, b: 0 };
  for (let a = 0; a < ws.length; a++) {
    for (let len = 2; len <= maxWords && a + len <= ws.length; len++) {
      const win = ws.slice(a, a + len);
      if (isStopword(win[0]!.text) && !/\d/.test(win[0]!.text)) continue;
      if (isStopword(win[win.length - 1]!.text) && !/\d/.test(win[win.length - 1]!.text)) continue;
      if (LEAD.test(normalizeAr(cleanWord(win[0]!.text)))) continue;
      let s = win.reduce((n, w) => n + salience(w.text), 0) / Math.sqrt(len) + len * 0.15;
      // don't let a window cross a clause boundary
      if (win.slice(0, -1).some((w) => /[،,.؟?!؛;:]$/.test(w.text))) s -= 2;
      if (s > best.s) best = { s, a, b: a + len };
    }
  }
  const win = ws.slice(best.a, best.b);
  return { text: clean(win), firstId: win.find((w) => !isStopword(w.text))?.id ?? win[0]?.id };
};

/** Split a beat into list items at commas / "و" joins; each item anchored to its first content word. */
export const itemsFrom = (words: Word[], max = 4): Item[] => {
  const parts: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const startsJoin = /^و[^ا]/.test(w.text) && cur.length >= 2 && i > 0;
    if (startsJoin) { parts.push(cur); cur = []; }
    cur.push(w);
    if (/[،,؛;]$/.test(w.text)) { parts.push(cur); cur = []; }
  });
  if (cur.length) parts.push(cur);
  const seen = new Set<string>();
  return parts
    .filter((p) => p.some((w) => !isStopword(w.text)))
    .filter((p) => {
      const key = p.map((w) => normalizeAr(w.text)).join(' ');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, max)
    .map((p) => {
      const d = distill(p, 3);
      return { text: d.text, at: d.firstId, icon: findIconConcept(p.map((w) => w.text).join(' ')) ?? undefined };
    })
    .filter((it) => it.text.length > 0);
};

/** Top salient words (for emphasis motion). */
export const emphasisWords = (words: Word[], n = 2) =>
  [...words].map((w) => ({ w, s: salience(w.text) })).filter((x) => x.s >= 1.5).sort((a, b) => b.s - a.s).slice(0, n).map((x) => x.w.id);

export const beatText = (words: Word[]) => words.map((w) => w.text).join(' ');
export const iconFor = (words: Word[], fallback = 'sparkle') => findIconConcept(beatText(words)) ?? fallback;
export const iconsFor = (words: Word[], max = 6) => {
  const out: string[] = [];
  for (const w of words) {
    const c = findIconConcept(w.text);
    if (c && !out.includes(c)) out.push(c);
    if (out.length >= max) break;
  }
  return out;
};
