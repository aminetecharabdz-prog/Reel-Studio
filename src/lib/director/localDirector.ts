/**
 * Local Scene Director (no AI key needed). Turns beats into a word-anchored scene plan using
 * the primitive library + Design DNA, with variety and anti-repetition rules (SPEC §5.3).
 * The Claude director (claude.ts) produces the same Plan schema.
 */
import type { Transcript } from '../schema/transcript';
import type { DesignDNA, TransitionId } from '../schema/dna';
import type { ImageRef, Plan, PrimitiveId, Scene, SceneContent } from '../schema/plan';
import { PlanSchema } from '../schema/plan';
import type { ProductInfo } from '../schema/project';
import { rng, type Rng } from '../util/rng';
import { buildBeats, classifyBeat, type Beat } from './beats';
import { beatText, distill, emphasisWords, findNumbers, iconFor, iconsFor, itemsFrom } from './content';
import { PRIMITIVE_META } from './primitiveMeta';
import { isStopword, normalizeAr } from '../text/keywords';

const UNIT_WORD = /^(دج|da|دينار|ولايه|ولايات|km|كيلومتر|دقيقه|دقايق|شهر|شهور|مره|مرات|دوره|درجه|ساعه|يوم|ايام)$/;

export type DirectorInput = {
  transcript: Transcript;
  dna: DesignDNA;
  mode: 'A' | 'B' | 'C';
  pacing: 'auto' | 'fast' | 'normal' | 'calm';
  seed: number;
  product?: ProductInfo;
  images?: ImageRef[]; // user media (product photos etc.)
  recentSequences?: string[][]; // primitive sequences of the user's last videos
};

type Cand = { id: PrimitiveId; w: number; make: () => SceneContent | null };

const ORDINALS: Record<string, number> = { اولا: 1, الاولي: 1, ثانيا: 2, الثانيه: 2, ثالثا: 3, الثالثه: 3, رابعا: 4, الرابعه: 4 };

const contentCandidates = (b: Beat, input: DirectorInput, _r: Rng, imgIdx: { i: number }): Cand[] => {
  const words = b.words;
  const text = beatText(words);
  const nums = findNumbers(words);
  const pct = nums.find((n) => n.isPercent);
  const prices = nums.filter((n) => n.isPrice);
  const wil = nums.find((n) => n.isWilaya);
  const num = nums.find((n) => !n.isPrice && !n.isWilaya);
  const head = distill(words, 4);
  const short = distill(words, 3);
  const items = itemsFrom(words.filter((w) => !ORDINALS[normalizeAr(w.text)]), 4);
  const icon = iconFor(words);
  const icons = iconsFor(words);
  const isQuestion = /[؟?]/.test(text);
  const ord = words.map((w) => ORDINALS[normalizeAr(w.text)]).find(Boolean);
  const img = input.images?.length ? input.images[imgIdx.i % input.images.length] : undefined;
  const base: SceneContent = { headline: head.text, headlineAt: head.firstId };
  const restAfterNumber = (n: typeof num) => {
    if (!n) return head.text;
    let after = words.slice(n.index + 1).filter((w) => !/^(بالميه|فالميه|%)$/.test(normalizeAr(w.text)));
    // the unit word is shown next to the number, not repeated in the label
    if (n.unit && after[0] && UNIT_WORD.test(normalizeAr(after[0].text))) after = after.slice(1);
    if (after.length >= 1 && after.some((w) => !isStopword(w.text))) return distill(after, 4).text;
    const before = words.slice(0, n.index).filter((w) => !isStopword(w.text));
    return distill(before.length ? words.slice(0, n.index) : words, 4).text;
  };
  const c: Cand[] = [];
  const add = (id: PrimitiveId, w: number, make: () => SceneContent | null) => c.push({ id, w, make });

  switch (b.type) {
    case 'hook':
      if (pct) add('icon-array', 6, () => ({ value: pct.value, valueAt: pct.wordId, headline: restAfterNumber(pct), headlineAt: head.firstId }));
      if (pct) add('donut-chart', 3, () => ({ value: pct.value, valueAt: pct.wordId, headline: restAfterNumber(pct) }));
      if (isQuestion) add('question-hook', 2.5, () => ({ ...base, headline: distill(words, 5).text, icon }));
      add('word-build', 1.5, () => ({ ...base, headline: distill(words, 4).text }));
      add('kinetic-headline', 1.2, () => ({ ...base, headline: distill(words, 5).text }));
      add('icon-burst', 1, () => ({ ...base, icon, icons }));
      add('title-card', 0.8, () => ({ ...base, icon }));
      break;
    case 'problem':
      add('warning-alert', 2, () => ({ ...base, icon: icon === 'sparkle' ? 'warning' : icon }));
      add('illustration-scene', 1.6, () => ({ ...base, icon, items: items.slice(0, 3).map((it) => ({ ...it, icon: it.icon ?? 'warning' })) }));
      add('highlighter-circle', 1.4, () => base);
      add('sticker-pop', 1, () => ({ ...base, icon }));
      add('kinetic-headline', 0.8, () => base);
      break;
    case 'fact':
      if (pct) {
        add('donut-chart', 2, () => ({ value: pct.value, valueAt: pct.wordId, headline: restAfterNumber(pct) }));
        add('progress-ring', 1.5, () => ({ value: pct.value, valueAt: pct.wordId, headline: restAfterNumber(pct), icon }));
        add('icon-array', 1.5, () => ({ value: pct.value, valueAt: pct.wordId, headline: restAfterNumber(pct) }));
      }
      if (num && (num.unit === 'km' || /دوره|سرعه|km|تمشي/.test(normalizeAr(text)))) add('gauge', 2.5, () => ({ value: num.value, valueAt: num.wordId, unit: num.unit === 'km' ? 'km' : num.unit ?? '', headline: restAfterNumber(num) }));
      if (num) add('big-number', 2, () => ({ value: num.value, valueAt: num.wordId, unit: num.unit && num.unit !== '%' ? ` ${num.unit}` : num.unit ?? '', headline: restAfterNumber(num) }));
      if (num && num.value < 100000) add('split-flap', 1, () => ({ value: num.value, valueAt: num.wordId, unit: num.unit === '%' ? '%' : '', headline: restAfterNumber(num) }));
      if (nums.length >= 2) add('timeline', 1, () => ({ headline: short.text, items: nums.slice(0, 4).map((n) => ({ text: distill(words.slice(n.index + 1, n.index + 3), 2).text || String(n.value), value: n.value, at: n.wordId })) }));
      add('highlight-sweep', 0.6, () => base);
      break;
    case 'list':
      if (ord) add('chapter-divider', 4, () => ({ value: ord, headline: distill(words.slice(1), 4).text || head.text, headlineAt: words[1]?.id ?? head.firstId }));
      if (items.length >= 3) {
        add('checklist', 1.6, () => ({ headline: short.text, items: items.map((it) => ({ ...it, tone: 'good' as const })) }));
        add('stacked-list', 1.6, () => ({ items }));
        add('steps', 1.2, () => ({ items }));
        if (items.length >= 3) add('icon-grid', 1.2, () => ({ items }));
      }
      add('illustration-scene', 1.4, () => ({ ...base, headline: distill(words.slice(ord ? 1 : 0), 4).text, icon, items: icons.slice(1, 4).map((ic) => ({ text: '', icon: ic })) }));
      add('icon-burst', 1, () => ({ ...base, headline: distill(words.slice(ord ? 1 : 0), 4).text, icon, icons }));
      if (num) add('big-number', 1.4, () => ({ value: num.value, valueAt: num.wordId, unit: num.unit && num.unit !== '%' ? ` ${num.unit}` : '', headline: restAfterNumber(num) }));
      break;
    case 'comparison': {
      const halves = items.length >= 2 ? items.slice(0, 2) : [{ text: distill(words.slice(0, Math.ceil(words.length / 2)), 3).text, at: words[0]!.id }, { text: distill(words.slice(Math.ceil(words.length / 2)), 3).text, at: words[Math.ceil(words.length / 2)]!.id }];
      add('versus', 2, () => ({ headline: '', items: [{ ...halves[0]!, tone: 'bad' }, { ...halves[1]!, tone: 'good' }] }));
      add('do-dont', 1.6, () => ({ items: [{ ...halves[1]!, tone: 'good' }, { ...halves[0]!, tone: 'bad' }] }));
      add('before-after', 1, () => ({ headline: short.text, items: [{ ...halves[0]!, icon: 'sad' }, { ...halves[1]!, icon: 'smile' }] }));
      break;
    }
    case 'process':
      if (items.length >= 2) add('steps', 1.6, () => ({ items }));
      if (items.length >= 2) add('timeline', 1.2, () => ({ items }));
      add('callout-arrows', 1.2, () => ({ headline: short.text, icon, items: items.length >= 2 ? items.slice(0, 3) : [{ text: short.text, at: short.firstId }] }));
      add('illustration-scene', 1.4, () => ({ ...base, icon, items: icons.slice(1, 4).map((ic) => ({ text: '', icon: ic })) }));
      add('typewriter', 1, () => ({ headline: distill(words, 7).text }));
      add('shape-morph', 1, () => ({ ...base, icon }));
      break;
    case 'product':
      if (img) add('product-hero', input.mode === 'B' ? 3 : 1.2, () => { imgIdx.i++; return { ...base, image: img, headline: input.product?.name || head.text }; });
      if (img && items.length >= 2) add('feature-callouts', input.mode === 'B' ? 2.2 : 1, () => ({ image: img, items, headline: '' }));
      add('illustration-scene', 1.2, () => ({ ...base, icon, items: icons.slice(1, 4).map((ic) => ({ text: '', icon: ic })) }));
      add('phone-mockup', 0.8, () => ({ ...base, icon, image: img }));
      add('icon-burst', 1, () => ({ ...base, icon, icons }));
      break;
    case 'offer':
      if (prices.length >= 1) add('price-tag', 4, () => {
        const p = prices[prices.length - 1]!;
        const old = prices.length >= 2 ? prices[0]! : undefined;
        return { price: p.value, oldPrice: old?.value, currency: input.product?.currency || 'دج', valueAt: p.wordId, headline: '', headlineAt: words[0]!.id };
      });
      if (wil) add('delivery-badge', 3, () => ({ wilayas: wil.value, valueAt: wil.wordId, headline: 'توصيل', unit: 'ولاية' }));
      if (wil) add('algeria-map', 2.4, () => ({ wilayas: wil.value, valueAt: wil.wordId, headline: distill(words, 4).text, unit: 'ولاية' }));
      if (/الاستلام|الخلاص|cash|كاش/.test(normalizeAr(text))) add('cod-badge', wil ? 1.2 : 3, () => ({ headline: 'الدفع عند الاستلام' }));
      if (/stock|الستوك|محدود|يكمل/.test(text.toLowerCase())) add('urgency', 2, () => ({ headline: distill(words, 4).text, value: 25 }));
      add('offer-ribbon', 0.8, () => ({ kicker: 'عرض خاص', headline: head.text }));
      add('sticker-pop', 0.8, () => ({ ...base, icon }));
      break;
    case 'emotion':
      add('shape-morph', 1.4, () => ({ ...base, icon: icon === 'sparkle' ? 'heart' : icon }));
      add('sticker-pop', 1.2, () => ({ ...base, icon }));
      add('kinetic-headline', 1.2, () => base);
      add('quote-card', 0.8, () => ({ headline: distill(words, 7).text }));
      if (img) add('image-card', 1, () => ({ ...base, image: img }));
      break;
    case 'cta': {
      const phone = input.product?.phone;
      add('cta', 4, () => ({ headline: distill(words, 3).text, headlineAt: head.firstId, icon: input.mode === 'B' ? 'cart' : icon === 'sparkle' ? 'thumbsup' : icon, phone: phone || undefined }));
      add('sticker-pop', 0.6, () => ({ ...base, icon }));
      break;
    }
    default:
      add('kinetic-headline', 1.4, () => base);
      add('highlight-sweep', 1.2, () => base);
      add('highlighter-circle', 1, () => base);
      add('illustration-scene', 1.2, () => ({ ...base, icon, items: icons.slice(1, 4).map((ic) => ({ text: '', icon: ic })) }));
      add('icon-burst', 1, () => ({ ...base, icon, icons }));
      add('word-build', 0.8, () => ({ ...base, headline: distill(words, 3).text }));
      add('typewriter', 0.6, () => ({ headline: distill(words, 6).text }));
      if (items.length >= 3) add('icon-grid', 1, () => ({ items }));
  }
  // mode restrictions
  return c.filter((x) => !PRIMITIVE_META[x.id].modes || PRIMITIVE_META[x.id].modes!.includes(input.mode) || (x.id === 'product-hero' && !!img));
};

/** C mode: graphics that work as light overlays on full-frame footage */
const OVERLAY_OK: PrimitiveId[] = ['kinetic-headline', 'sticker-pop', 'big-number', 'highlight-sweep', 'word-build', 'icon-burst', 'question-hook', 'warning-alert', 'cta', 'split-flap', 'highlighter-circle', 'price-tag', 'cod-badge', 'delivery-badge'];

const jaccard = (a: string[], b: string[]) => {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / Math.max(1, new Set([...a, ...b]).size);
};

export const planLocally = (input: DirectorInput): Plan => {
  for (let attempt = 0; attempt < 4; attempt++) {
    const plan = planOnce({ ...input, seed: input.seed + attempt * 7919 });
    const seq = plan.scenes.map((s) => s.primitive);
    const tooSimilar = (input.recentSequences ?? []).some((r) => jaccard(seq, r) >= 0.4 && r.length > 2);
    if (!tooSimilar || attempt === 3) return plan;
  }
  throw new Error('unreachable');
};

const planOnce = (input: DirectorInput): Plan => {
  const r = rng(input.seed);
  const beats = buildBeats(input.transcript.words, input.pacing);
  const used = new Map<string, number>();
  const scenes: Scene[] = [];
  const imgIdx = { i: 0 };
  let bg = 0;
  const transitions = input.dna.motionLanguage.transitionFamily;
  beats.forEach((b, i) => {
    let cands = contentCandidates(b, input, r, imgIdx);
    const prev = scenes[scenes.length - 1];
    const prevSpeaker = prev?.speaker;
    let speaker: Scene['speaker'];
    if (input.mode === 'C') {
      const rich = ['list', 'process', 'comparison', 'fact', 'product'].includes(b.type);
      speaker = rich && prevSpeaker !== 'split-top' ? 'split-top' : b.type === 'cta' ? 'full' : r.chance(0.15) && prevSpeaker !== 'pip' ? 'pip' : 'full';
      if (speaker === 'full') cands = cands.filter((cd) => OVERLAY_OK.includes(cd.id));
      if (cands.length === 0) cands = [{ id: 'kinetic-headline', w: 1, make: () => ({ headline: distill(b.words, 4).text, headlineAt: distill(b.words, 4).firstId }) }];
    }
    // weights: penalise repetition (no identical primitive twice in a row, ≤3 uses)
    const scored = cands
      .map((cd) => {
        const n = used.get(cd.id) ?? 0;
        let w = cd.w * (0.6 + r.next() * 0.8);
        if (prev?.primitive === cd.id) w *= 0.02;
        if (n >= 3) w *= 0.01;
        w /= 1 + n * 0.9;
        return { cd, w };
      })
      .sort((a, b2) => b2.w - a.w);
    let chosen: SceneContent | null = null;
    let pid: PrimitiveId = 'kinetic-headline';
    for (const s of scored) {
      const content = s.cd.make();
      if (content && (content.headline || content.items?.length || content.value !== undefined || content.price !== undefined || content.image || content.wilayas !== undefined)) {
        chosen = content;
        pid = s.cd.id;
        break;
      }
    }
    if (!chosen) chosen = { headline: distill(b.words, 4).text, headlineAt: b.words[0]!.id };
    used.set(pid, (used.get(pid) ?? 0) + 1);
    if (b.type === 'problem' || b.type === 'offer' || (i > 0 && r.chance(0.3))) bg = (bg + 1) % 3;
    let variant = r.int(0, 2);
    if (prev && prev.primitive === pid && prev.variant === variant) variant = (variant + 1) % 3;
    const transition: TransitionId = i === 0 ? 'cut' : r.chance(0.18) ? 'cut' : r.pick(transitions);
    const emph = emphasisWords(b.words, b.type === 'hook' ? 2 : 1);
    scenes.push({
      id: `s${i}`,
      from: b.words[0]!.id,
      to: b.words[b.words.length - 1]!.id,
      primitive: pid,
      variant,
      content: chosen,
      emphasis: emph,
      transition,
      bgIndex: bg,
      speaker,
      zoomOn: input.mode === 'C' ? emph.slice(0, 1) : [],
      locked: false,
    });
  });
  return PlanSchema.parse({ scenes, notes: `local-director seed ${input.seed}` });
};

/** Regenerate a single scene with a different primitive (editor "regenerate this scene"). */
export const replanScene = (input: DirectorInput, plan: Plan, sceneId: string, seed: number): Plan => {
  const idx = plan.scenes.findIndex((s) => s.id === sceneId);
  if (idx < 0) return plan;
  const s = plan.scenes[idx]!;
  const words = input.transcript.words;
  const a = words.findIndex((w) => w.id === s.from);
  const bIdx = words.findIndex((w) => w.id === s.to);
  const beatWords = words.slice(a, bIdx + 1);
  const r = rng(seed);
  const beat: Beat = { id: 'x', words: beatWords, type: 'statement', startMs: beatWords[0]!.startMs, endMs: beatWords[beatWords.length - 1]!.endMs };
  beat.type = classifyBeat(beatWords, idx, plan.scenes.length);
  const cands = contentCandidates(beat, input, r, { i: idx }).filter((c) => c.id !== s.primitive && c.id !== plan.scenes[idx - 1]?.primitive && c.id !== plan.scenes[idx + 1]?.primitive);
  const generic: PrimitiveId[] = ['kinetic-headline', 'highlight-sweep', 'icon-burst', 'shape-morph', 'highlighter-circle', 'word-build'];
  const pick = cands.length ? r.pick(cands) : { id: r.pick(generic.filter((g) => g !== s.primitive)), make: () => ({ headline: distill(beatWords, 4).text, headlineAt: distill(beatWords, 4).firstId, icon: iconFor(beatWords) }) };
  const content = pick.make() ?? s.content;
  const next = structuredClone(plan);
  next.scenes[idx] = { ...s, primitive: pick.id, content, variant: r.int(0, 2) };
  return PlanSchema.parse(next);
};

