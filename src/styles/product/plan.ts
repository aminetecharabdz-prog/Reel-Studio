/**
 * product — the no-key planner. Reads only the words (and the product facts for ads) and writes a plan in the
 * style's vocabulary following STYLE.md §12a: open on a hero word, a neon prompt bar, a 3D product window,
 * 2–4 dark ↔ light flips per minute, never two 3D scenes back to back, finish on the orbit finale.
 */
import { random } from 'remotion';
import { TimingIndex, norm, type Word } from '@/engine/timing';
import { chunk, clean, iconFor, isContrast, isNumberish, isQuestion, isStop, keyIndex, listItems } from '@/engine/lexicon';
import type { PlanInput } from '@/engine/types';
import { ICONS, type IconId } from './icons';
import { ProductPlanSchema, type KWord, type ProductPlan, type ProductScene } from './schema';

const cut = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trim()}…`);
const t28 = (w: Word) => cut(clean(w.w) || w.w, 28);
const icon = (s: string, fb: IconId): IconId => {
  const id = iconFor(s, fb);
  return (id in ICONS ? id : fb) as IconId;
};

/** a line of words → kinetic rows (≤ 5 per row, ≤ 2 rows) with ONE gradient key word */
const rowsOf = (ws: Word[]): KWord[][] => {
  const k = keyIndex(ws.map((w) => clean(w.w)));
  const kws: KWord[] = ws.map((w, i) => ({ t: t28(w), at: w.id, ...(i === k ? { em: 'grad' as const } : {}) }));
  return kws.length <= 5 ? [kws] : chunk(kws, 5).slice(0, 2);
};

type Seg = { words: Word[]; text: string; li: number; first: boolean; last: boolean };

export const productLocalPlan = (input: PlanInput): ProductPlan => {
  const T = new TimingIndex(input.timing);
  const rnd = (k: string) => random(`${input.seed}-${k}`);
  const product = input.product && input.product.name ? input.product : null;
  const brandName = cut((input.brandName || product?.name || input.topic || 'رسّام').trim(), 28);
  const brandKey = norm(brandName).split(' ')[0] ?? '';

  // segments: script lines, long lines split into ≤ 8-word phrases
  const segs: Seg[] = [];
  T.lines.forEach((l, li) => {
    const parts = chunk(l.words, 8);
    parts.forEach((p, pi) =>
      segs.push({ words: p, text: p.map((w) => w.w).join(' '), li, first: li === 0 && pi === 0, last: li === T.lines.length - 1 && pi === parts.length - 1 }),
    );
  });

  const scenes: ProductScene[] = [];
  const used = { prompt: false, logo: false, showcase: false, capsule: false, cards: false, orb: false, echo: false };
  let lastWasLight = false;
  let since3d = 9;
  let sinceLight = 0;
  const theme = (): 'dark' | 'light' => {
    // a dark ↔ light flip every 3–4 scenes (2–4 per minute)
    if (!lastWasLight && sinceLight >= 3 + Math.floor(rnd(`light${scenes.length}`) * 2)) return 'light';
    return 'dark';
  };
  const push = (s: ProductScene, light = false, is3d = false) => {
    scenes.push(s);
    lastWasLight = light;
    sinceLight = light ? 0 : sinceLight + 1;
    since3d = is3d ? 0 : since3d + 1;
  };

  segs.forEach((g, gi) => {
    const ws = g.words;
    const w0 = ws[0]!;
    const strs = ws.map((w) => clean(w.w));
    const nums = ws.filter((w) => isNumberish(w.w));
    const items = listItems(ws.map((w) => w.w));
    const hasBrand = !!brandKey && strs.some((s) => norm(s).includes(brandKey));

    if (g.first) {
      if (ws.length <= 2) push({ kind: 'punch', from: w0.id, words: ws.map((w, i) => ({ t: t28(w), at: w.id, ...(i === ws.length - 1 ? { em: 'grad' as const } : {}) })) });
      else push({ kind: 'words', from: w0.id, theme: 'dark', giant: true, echo: false, rows: rowsOf(ws) });
      return;
    }
    if (g.last && segs.length > 2) {
      const brandWord = ws.find((w) => brandKey && norm(w.w).includes(brandKey));
      const contact = product?.whatsapp || product?.phone || '';
      push({
        kind: 'end',
        from: w0.id,
        at: (brandWord ?? ws[Math.min(ws.length - 1, 1)]!).id,
        line: cut(g.text, 60),
        ...(product ? { cta: 'اطلب الآن' } : {}),
        ...(contact ? { handle: cut(contact, 40) } : {}),
      });
      return;
    }
    // 1) the brand is named → logo reveal
    if (hasBrand && !used.logo) {
      used.logo = true;
      const bw = ws.find((w) => norm(w.w).includes(brandKey)) ?? w0;
      push({ kind: 'logo', from: w0.id, at: bw.id, ghost: true, ...(product?.offer ? { tagline: cut(product.offer, 60) } : input.topic ? { tagline: cut(input.topic, 60) } : {}) });
      return;
    }
    // 2) product ads: the product window with the photo, price and offer chips
    if (product && !used.showcase && since3d >= 2 && (gi >= 1 || nums.length)) {
      used.showcase = true;
      const priceW = nums[0] ?? ws[ws.length - 1]!;
      const chipWords = ws.filter((w) => w.id !== priceW.id && !isStop(w.w)).slice(0, 3);
      const chipTexts = [product.offer, product.delivery58 ? 'توصيل لـ 58 ولاية' : '', product.cod ? 'الدفع عند الاستلام' : ''].filter(Boolean).slice(0, chipWords.length);
      push(
        {
          kind: 'showcase',
          from: w0.id,
          title: cut(product.name, 60),
          ...(product.photos[0] ? { photo: product.photos[0] } : {}),
          steps: [],
          chips: chipTexts.map((t, i) => ({ t: cut(t, 30), at: chipWords[i]!.id, icon: icon(t, 'check') })),
          ...(product.price ? { price: { t: cut(product.price, 24), at: priceW.id, ...(product.oldPrice ? { old: cut(product.oldPrice, 24) } : {}) } } : {}),
        },
        false,
        true,
      );
      return;
    }
    // 3) a question / request → typed into the neon prompt bar
    if (!used.prompt && (isQuestion(g.text) || (gi >= 2 && ws.length >= 4 && rnd(`p${gi}`) < 0.35)) && ws.length >= 3) {
      used.prompt = true;
      let k = ws.length - 1;
      while (k > 0 && ws.slice(0, k + 1).map((w) => w.w).join(' ').length > 105) k--;
      push({ kind: 'prompt', from: w0.id, text: ws.slice(0, k + 1).map((w) => w.w).join(' '), typeFrom: w0.id, typeTo: ws[k]!.id, send: ws[k]!.id });
      return;
    }
    // 4) two or more numbers → light capsule (before → after)
    if (nums.length >= 2 && !used.capsule) {
      used.capsule = true;
      const firstNum = ws.indexOf(nums[0]!);
      const title = ws.slice(0, Math.max(1, Math.min(4, firstNum)));
      const its = nums.slice(0, 4).map((n) => {
        const j = ws.indexOf(n);
        const unit = ws[j + 1] && !isNumberish(ws[j + 1]!.w) && !isStop(ws[j + 1]!.w) ? ` ${clean(ws[j + 1]!.w)}` : '';
        return { t: cut(`${clean(n.w)}${unit}`, 40), at: n.id };
      });
      push({ kind: 'capsule', from: w0.id, title: title.map((w, i) => ({ t: t28(w), at: w.id, ...(i === title.length - 1 ? { em: 'grad' as const } : {}) })), items: its }, true);
      return;
    }
    // 5) an enumeration → flying cards (dark, 3D) or the glass orb (light)
    if (items.length >= 3) {
      const useCards = !used.cards && since3d >= 2 && (used.orb || rnd(`c${gi}`) < 0.6);
      if (useCards) {
        used.cards = true;
        const title = ws.slice(0, Math.min(3, items[0]!)).filter((w) => !isStop(w.w));
        push(
          {
            kind: 'cards',
            from: w0.id,
            title: title.map((w) => ({ t: t28(w), at: w.id })),
            cards: items.map((i) => ({ t: t28(ws[i]!), at: ws[i]!.id, icon: icon(ws[i]!.w, (['sparkles', 'star', 'bolt', 'heart', 'check', 'gem', 'rocket'] as IconId[])[i % 7]!) })),
          },
          false,
          true,
        );
        return;
      }
      if (!used.orb && items.length <= 6) {
        used.orb = true;
        push({ kind: 'orb', from: w0.id, steps: items.map((i) => ({ t: cut(clean(ws[i]!.w), 40), at: ws[i]!.id })), list: [] }, true);
        return;
      }
    }
    // 6) no product window yet in a content video → the app window completes the line's key ideas as steps
    if (!product && !used.showcase && since3d >= 2 && gi >= 2 && ws.filter((w) => !isStop(w.w)).length >= 3) {
      used.showcase = true;
      const steps = ws.filter((w) => !isStop(w.w) && !isNumberish(w.w)).slice(-4);
      push({ kind: 'showcase', from: w0.id, title: cut(input.topic || g.text, 60), steps: steps.map((w) => ({ t: cut(clean(w.w), 40), at: w.id })), chips: [] }, false, true);
      return;
    }
    // 7) very short lines hit as punch words
    if (ws.length <= 3) {
      push({ kind: 'punch', from: w0.id, words: ws.map((w, i) => ({ t: t28(w), at: w.id, ...(i === ws.length - 1 && !isStop(w.w) ? { em: 'grad' as const } : {}) })) });
      return;
    }
    // 8) the kinetic line; contrast words or the rhythm flip to the light world; one echo statement
    const light = isContrast(ws[0]!.w) || theme() === 'light';
    const echo = !light && !used.echo && ws.length <= 6 && gi >= 2;
    if (echo) used.echo = true;
    push({ kind: 'words', from: w0.id, theme: light ? 'light' : 'dark', giant: !echo, echo, rows: rowsOf(ws) }, light);
  });

  // a one-line script still ends on the brand
  if (scenes.length < 2) {
    const lastW = T.words[T.words.length - 1]!;
    scenes.push({ kind: 'end', from: lastW.id, at: lastW.id, line: cut(T.lines[T.lines.length - 1]!.text, 60) });
  }
  const plan = ProductPlanSchema.parse({
    style: 'product',
    brand: { name: brandName, mark: [...brandName.replace(/^ال/, '')][0] ?? 'ر' },
    accent: (['violet', 'violet', 'orange', 'blue', 'pink'] as const)[Math.floor(rnd('accent') * 5)]!,
    scenes,
  });
  return plan;
};
