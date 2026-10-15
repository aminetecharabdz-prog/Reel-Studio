import type { Word } from '../schema/transcript';
import { normalizeAr } from '../text/keywords';

/**
 * Re-align an edited transcript to the original timings (SPEC §3 step 4): unchanged words keep
 * their exact times; replaced runs share the original run's time window proportionally to
 * character length; pure insertions borrow time from the neighbouring word.
 */
export const realign = (old: Word[], newText: string): Word[] => {
  const toks = newText.trim().split(/\s+/).filter(Boolean);
  const a = old.map((w) => normalizeAr(w.text));
  const b = toks.map((t) => normalizeAr(t));
  // LCS table
  const n = a.length, m = b.length;
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i]![j] = a[i] === b[j] ? L[i + 1]![j + 1]! + 1 : Math.max(L[i + 1]![j]!, L[i]![j + 1]!);
  type Op = { kind: 'keep'; i: number; j: number } | { kind: 'del'; i: number } | { kind: 'ins'; j: number };
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ kind: 'keep', i, j }); i++; j++; }
    else if (L[i + 1]![j]! >= L[i]![j + 1]!) ops.push({ kind: 'del', i: i++ });
    else ops.push({ kind: 'ins', j: j++ });
  }
  while (i < n) ops.push({ kind: 'del', i: i++ });
  while (j < m) ops.push({ kind: 'ins', j: j++ });

  const out: Array<{ id: string; text: string; startMs: number; endMs: number; confidence: number }> = [];
  const used = new Set<string>();
  const fresh = (base: string) => {
    let n = 1;
    while (used.has(`${base}_${n}`)) n++;
    used.add(`${base}_${n}`);
    return `${base}_${n}`;
  };
  let k = 0;
  while (k < ops.length) {
    const op = ops[k]!;
    if (op.kind === 'keep') {
      const w = old[op.i]!;
      used.add(w.id);
      out.push({ id: w.id, text: toks[op.j]!, startMs: w.startMs, endMs: w.endMs, confidence: w.confidence });
      k++;
      continue;
    }
    // gather a run of dels/ins
    const dels: number[] = [];
    const ins: number[] = [];
    while (k < ops.length && ops[k]!.kind !== 'keep') {
      const o = ops[k]!;
      if (o.kind === 'del') dels.push(o.i);
      else if (o.kind === 'ins') ins.push(o.j);
      k++;
    }
    if (ins.length === 0) continue; // pure deletion: time just disappears from the captions
    let start: number, end: number;
    if (dels.length) {
      start = old[dels[0]!]!.startMs;
      end = old[dels[dels.length - 1]!]!.endMs;
    } else {
      // insertion: borrow the second half of the previous word (or first half of the next)
      const prev = out[out.length - 1];
      if (prev) {
        const mid = Math.round((prev.startMs + prev.endMs) / 2);
        start = mid;
        end = prev.endMs;
        prev.endMs = mid;
      } else {
        const nextOld = old[0]!;
        start = nextOld.startMs;
        end = Math.round((nextOld.startMs + nextOld.endMs) / 2);
      }
    }
    const lens = ins.map((jj) => Math.max(1, toks[jj]!.length));
    const total = lens.reduce((x, y) => x + y, 0);
    let t = start;
    ins.forEach((jj, q) => {
      const d = ((end - start) * lens[q]!) / total;
      const reuse = dels[q] !== undefined ? old[dels[q]!]!.id : undefined;
      const id = reuse && !used.has(reuse) ? (used.add(reuse), reuse) : fresh(dels[0] !== undefined ? old[dels[0]!]!.id : out[out.length - 1]?.id ?? 'w');
      out.push({ id, text: toks[jj]!, startMs: Math.round(t), endMs: Math.round(t + d), confidence: 1 });
      t += d;
    });
  }
  // keep strictly ordered, non-overlapping
  for (let q = 1; q < out.length; q++) if (out[q]!.startMs < out[q - 1]!.startMs) out[q]!.startMs = out[q - 1]!.startMs;
  return out.map((w) => ({ id: w.id, text: w.text, startMs: w.startMs, endMs: Math.max(w.startMs + 1, w.endMs), confidence: w.confidence }));
};
