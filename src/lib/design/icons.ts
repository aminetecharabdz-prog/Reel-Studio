import data from '@/generated/icons.json';
import { normalizeAr } from '../text/keywords';

type IconBody = { body: string; w?: number; h?: number };
type IconData = { sets: Record<string, { width: number; height: number; icons: Record<string, IconBody> }>; concepts: Record<string, string[]> };
const D = data as IconData;

export const ICON_SETS = ['ph', 'tabler', 'solar', 'fluent-emoji-flat'] as const;
export type IconSet = (typeof ICON_SETS)[number];
export const ICON_CONCEPTS = Object.keys(D.concepts);

export type ResolvedIcon = { body: string; width: number; height: number; set: IconSet; multicolor: boolean };

/** Resolve "concept" or "set:concept" to SVG data, preferring the DNA's icon set, falling back to any set. */
export const getIcon = (id: string | undefined, preferred: IconSet = 'ph'): ResolvedIcon | null => {
  if (!id) return null;
  const [maybeSet, maybeName] = id.includes(':') ? (id.split(':') as [string, string]) : [preferred, id];
  const name = maybeName ?? id;
  const order = [maybeSet, preferred, ...ICON_SETS].filter((s, i, a) => a.indexOf(s) === i) as IconSet[];
  for (const set of order) {
    const s = D.sets[set];
    const ic = s?.icons[name];
    if (s && ic) return { body: ic.body, width: ic.w ?? s.width, height: ic.h ?? s.height, set, multicolor: set === 'fluent-emoji-flat' };
  }
  return null;
};

const INDEX: Array<[string, string]> = Object.entries(D.concepts).flatMap(([c, ks]) => ks.map((k) => [normalizeAr(k), c] as [string, string]));

/** Find the best icon concept for a word or phrase (Darija/Arabic/French/English keywords). */
export const findIconConcept = (text: string): string | null => {
  const words = text.split(/\s+/).map(normalizeAr).filter((w) => w.length >= 2);
  let best: string | null = null;
  let bestScore = 0;
  for (const w of words) {
    const stripped = w.replace(/^(ال|وال|بال|لل|و|ب|ل)/, '');
    for (const [k, c] of INDEX) {
      if (k.length < 2) continue;
      let s = 0;
      if (w === k || stripped === k) s = 3;
      else if (k.length >= 3 && (stripped.startsWith(k) || w.startsWith(k))) s = 2;
      else if (k.length >= 4 && stripped.includes(k)) s = 1;
      if (s > bestScore) { bestScore = s; best = c; }
    }
  }
  return best;
};

export const iconSvgMarkup = (ic: ResolvedIcon, color: string) =>
  ic.multicolor ? ic.body : ic.body.replaceAll('currentColor', color);
