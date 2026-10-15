import type { Word } from '../schema/transcript';
import { isStopword, normalizeAr } from '../text/keywords';
import type { BeatType } from './primitiveMeta';

export type Beat = { id: string; words: Word[]; type: BeatType; startMs: number; endMs: number };

export const PACING: Record<'fast' | 'normal' | 'calm', [number, number]> = { fast: [1200, 2200], normal: [2000, 3200], calm: [3000, 4800] };

const SENTENCE_END = /[.!?؟…]$/;
const CLAUSE_END = /[،,;؛:]$/;

/** Resolve "auto" pacing from speech rate. */
export const resolvePacing = (words: Word[], pacing: 'auto' | 'fast' | 'normal' | 'calm') => {
  if (pacing !== 'auto') return pacing;
  const dur = (words[words.length - 1]!.endMs - words[0]!.startMs) / 1000;
  const rate = words.length / Math.max(1, dur);
  return rate > 2.6 ? 'fast' : rate < 1.7 ? 'calm' : 'normal';
};

/** Split speech into beats (one idea each), then fit them to the pacing window (SPEC §4, motion-director §1). */
export const segmentBeats = (words: Word[], pacing: 'fast' | 'normal' | 'calm'): Word[][] => {
  const [minMs, maxMs] = PACING[pacing];
  // 1) sentences / strong pauses
  const sentences: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const gap = next ? next.startMs - w.endMs : 9999;
    if (SENTENCE_END.test(w.text) || gap >= 450 || (CLAUSE_END.test(w.text) && gap >= 220 && cur.length >= 3)) {
      sentences.push(cur);
      cur = [];
    }
  });
  if (cur.length) sentences.push(cur);
  const dur = (b: Word[]) => b[b.length - 1]!.endMs - b[0]!.startMs;
  // 2) split long ones at clause marks / biggest internal pause
  const split = (b: Word[]): Word[][] => {
    if (dur(b) <= maxMs * 1.25 || b.length < 4) return [b];
    let best = -1;
    let bestScore = -1;
    for (let i = 1; i < b.length - 1; i++) {
      const left = b.slice(0, i + 1);
      const right = b.slice(i + 1);
      if (right.length < 2 || left.length < 2) continue;
      const gap = b[i + 1]!.startMs - b[i]!.endMs;
      const balance = 1 - Math.abs(dur(left) - dur(right)) / dur(b);
      const score = gap / 100 + (CLAUSE_END.test(b[i]!.text) ? 3 : 0) + balance * 2 + (/^(و|ثم|بصح|لخاطر|حتى|باش)/.test(normalizeAr(b[i + 1]!.text)) ? 1.2 : 0) - (/\d/.test(b[i]!.text) ? 4 : 0) - (isStopword(b[i]!.text) ? 3 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    if (best < 0) return [b];
    return [...split(b.slice(0, best + 1)), ...split(b.slice(best + 1))];
  };
  let beats = sentences.flatMap(split);
  // 3) merge very short beats into a neighbour (prefer the next one if it is a continuation)
  const merged: Word[][] = [];
  for (const b of beats) {
    const last = merged[merged.length - 1];
    if (last && (dur(b) < minMs * 0.55 || b.length <= 1) && dur(last) + dur(b) <= maxMs * 1.35 && !SENTENCE_END.test(last[last.length - 1]!.text)) {
      last.push(...b);
    } else if (last && dur(last) < minMs * 0.5 && dur(last) + dur(b) <= maxMs * 1.4) {
      last.push(...b);
    } else merged.push([...b]);
  }
  beats = merged;
  return beats;
};

const has = (b: Word[], re: RegExp) =>
  b.some((w) => {
    const n = normalizeAr(w.text);
    return re.test(n) || re.test(n.replace(/^(و|ف|ب)(?=..)/, '')) || re.test(w.text.toLowerCase());
  });

/** Classify a beat by its words (Darija / Arabic / French cues). */
export const classifyBeat = (b: Word[], index: number, total: number): BeatType => {
  const text = b.map((w) => w.text).join(' ');
  if (has(b, /^(اطلب|اتصل|ابعث|ابعثلنا|كونطاكتينا|تابعني|تابعونا|ابوني|اشترك|commande|commandez|abonne|اضغط|ادخل|زور)/) && index >= total - 2) return 'cta';
  if (has(b, /^(دج|da|دينار|السعر|prix|livraison|ليفريزون|التوصيل|توصيل|ولايه|الاستلام|الخلاص|promo|تخفيض|عرض|stock|الستوك)$/) || /\d+\s*(دج|DA|da)/.test(text)) return 'offer';
  if (index === 0) return 'hook';
  if (has(b, /^(اولا|ثانيا|ثالثا|رابعا|الاولي|الثانيه|الثالثه|الرابعه|premier|deuxieme|troisieme|etape|مرحله|المرحله)/)) return 'list';
  if (has(b, /^(عوض|بلاصه|افضل|compar|vs|contre)$/) || (has(b, /^ماشي$/) && has(b, /^(بصح|لكن)$/)) || (has(b, /^خير$/) && has(b, /^من$/))) return 'comparison';
  if (has(b, /^(حذاري|خطر|مشكل|مشكله|يوجع|وجع|غلطه|ضرر|يطيح|السبب|التسوس|attention|probleme|danger)/)) return 'problem';
  if (/\d/.test(text)) return 'fact';
  if (has(b, /^(كيفاش|comment|يخدم|يدير|الدوره|خطوه)/)) return 'process';
  if (has(b, /^(الحل|منتوج|produit|الحامل|حامل|هاذا|جديد)/)) return 'product';
  if (has(b, /^(حسيت|نحب|فرحان|ابتسامتك|تستاهل|راحه|احساس|قلب)/)) return 'emotion';
  return 'statement';
};

export const buildBeats = (words: Word[], pacing: 'auto' | 'fast' | 'normal' | 'calm'): Beat[] => {
  const p = resolvePacing(words, pacing);
  const raw = segmentBeats(words, p);
  return raw.map((b, i) => ({ id: `b${i}`, words: b, type: classifyBeat(b, i, raw.length), startMs: b[0]!.startMs, endMs: b[b.length - 1]!.endMs }));
};
