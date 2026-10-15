import type { Transcript } from './schema/transcript';
import type { CutRange } from './schema/project';
import { silenceRanges } from './audio/analyze';
import { normalizeAr } from './text/keywords';

const FILLERS = /^(euh|euhh|heu|hmm|mmm|ممم|اممم|آآ|ااا|يعني|بون|bon|ben|eh|ah)$/;

/** Mode C: propose silence + filler + repeated-word cuts (user can toggle each). */
export const proposeCuts = (t: Transcript, voiced: Array<[number, number]>, minSilenceMs = 350): CutRange[] => {
  const cuts: CutRange[] = silenceRanges(voiced, t.durationMs, minSilenceMs).map((r) => ({ ...r, kind: 'silence' as const, enabled: true, label: `صمت ${((r.endMs - r.startMs) / 1000).toFixed(1)} ث` }));
  t.words.forEach((w, i) => {
    const n = normalizeAr(w.text);
    const prev = t.words[i - 1];
    if (FILLERS.test(n)) cuts.push({ startMs: w.startMs, endMs: w.endMs, kind: 'filler', enabled: true, label: `«${w.text}»` });
    else if (prev && normalizeAr(prev.text) === n && n.length > 1) cuts.push({ startMs: prev.startMs, endMs: prev.endMs, kind: 'filler', enabled: true, label: `تكرار «${w.text}»` });
  });
  return cuts.sort((a, b) => a.startMs - b.startMs);
};
