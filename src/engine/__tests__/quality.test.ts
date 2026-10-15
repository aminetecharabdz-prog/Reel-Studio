/** Regression checks for the owner's QUALITY_BAR (docs/QUALITY_BAR.md): empty scenes, repeated backgrounds,
 * reused hero art, topic-literal visuals, and mixed-direction text in UI cards. */
import { describe, expect, it } from 'vitest';
import { compile } from '@/engine/compile';
import { autofix, checkReel, heroArea, HERO_MIN } from '@/engine/qa';
import { conceptFor, visualFor } from '@/engine/concepts';
import { containerDir, detectDir } from '@/engine/text';
import { localDirector, localStyle } from '@/ai/local';
import { estimateTranscript } from '@/ai/speech';
import type { Layer, Plan, Scene } from '@/engine/schema';

const tr = estimateTranscript('المحتوى بلا جمهور غير ضجيج. الجمهور هو الرأس مال. ابدا اليوم.');
const ids = tr.words.map((w) => w.id);
const text = (id: string, from: number, to: number, y = 0.46): Layer => ({
  id, type: 'text', lines: [tr.words.slice(from, to).map((w) => ({ t: w.text, at: w.id }))], x: 0.5, y, w: 0.86, rotate: 0, opacity: 1,
  role: 'display', size: 'xxl', color: 'ink', align: 'center', anim: 'rise', tracking: 0, hier: true,
});
const scene = (id: string, from: number, to: number, bg: Scene['bg'], layers: Layer[]): Scene => ({
  id, from: ids[from]!, to: ids[to - 1]!, intent: '', bg, camera: { move: 'push', amount: 0.4 }, transition: 'cut', layers,
});
const DARK: Scene['bg'] = { kind: 'spotlight', tone: 'dark', grid: false, vignette: true, leak: false };
const plan = (scenes: Scene[]): Plan => ({ v: 1, style: localStyle('t'), scenes, hooks: [], author: 'local' });
const C = (p: Plan, mode: 'content' | 'product' | 'talking' = 'content') =>
  compile({ plan: p, transcript: tr, mode, aspect: '9:16', fps: 30, resolve: () => 'x.webp' });

describe('quality bar', () => {
  it('a text-only scene is flagged as empty, and autofix gives it a topic-literal hero', () => {
    const c = C(plan([scene('s0', 0, 4, DARK, [text('t', 0, 4)])]));
    expect(checkReel(c).map((i) => i.code)).toContain('no-hero');
    autofix(c);
    expect(heroArea(c, c.scenes[0]!)).toBeGreaterThanOrEqual(HERO_MIN);
    const img = c.scenes[0]!.layers.find((l) => l.type === 'image')!;
    expect(img.type === 'image' && img.src.name).toBeTruthy();
    // the text moved to the top third, above the hero
    expect(c.scenes[0]!.layers.find((l) => l.type === 'text')!.y).toBeLessThan(0.4);
  });

  it('a small object is not a hero; a big one is', () => {
    const img = (w: number): Layer => ({ id: 'i', type: 'image', src: { kind: 'library', name: 'obj/eye' }, x: 0.5, y: 0.6, w, rotate: 0, opacity: 1, anim: 'pop', idle: 'float', shadow: true, frame: 'none', fit: 'contain', depth: 0.5, flipX: false });
    const small = C(plan([scene('s0', 0, 4, DARK, [img(0.5), text('t', 0, 4, 0.25)])]));
    expect(heroArea(small, small.scenes[0]!)).toBeLessThan(HERO_MIN);
    const photo = C(plan([scene('s0', 0, 4, { ...DARK, kind: 'photo', image: { kind: 'library', name: 'bg/water' } }, [text('t', 0, 4)])]));
    expect(heroArea(photo, photo.scenes[0]!)).toBe(1);
  });

  it('flags the same background twice in a row and fewer than 3 treatments', () => {
    const hero: Layer = { id: 'h', type: 'image', src: { kind: 'sticker', name: 'trophy' }, x: 0.5, y: 0.64, w: 0.95, rotate: 0, opacity: 1, anim: 'pop', idle: 'float', shadow: true, frame: 'none', fit: 'contain', depth: 0.5, flipX: false };
    const p = plan([0, 1, 2, 3].map((k) => scene(`s${k}`, k * 2, k * 2 + 2, DARK, [{ ...hero, id: `h${k}`, src: { kind: 'sticker', name: ['trophy', 'rocket', 'bell', 'star'][k]! } }, text(`t${k}`, k * 2, k * 2 + 2, 0.25)])));
    const codes = checkReel(C(p)).map((i) => i.code);
    expect(codes).toContain('bg-repeat');
    expect(codes).toContain('bg-variety');
  });

  it('flags the same cut-out reused as hero across scenes (except the product in product ads)', () => {
    const eye: Layer = { id: 'e', type: 'image', src: { kind: 'library', name: 'obj/eye' }, x: 0.5, y: 0.64, w: 1.3, rotate: 0, opacity: 1, anim: 'pop', idle: 'float', shadow: true, frame: 'none', fit: 'contain', depth: 0.5, flipX: false };
    const p = plan([scene('s0', 0, 4, DARK, [eye, text('a', 0, 4, 0.25)]), scene('s1', 4, 8, { ...DARK, kind: 'paper', tone: 'light' }, [{ ...eye, id: 'e2' }, text('b', 4, 8, 0.25)])]);
    expect(checkReel(C(p)).map((i) => i.code)).toContain('hero-reuse');
    expect(checkReel(C(p, 'product')).map((i) => i.code)).not.toContain('hero-reuse');
  });

  it('text covered by a picture is flagged, and autofix moves the picture out of the way', () => {
    const big: Layer = { id: 'p', type: 'image', src: { kind: 'sticker', name: 'bell' }, x: 0.5, y: 0.3, w: 0.8, rotate: 0, opacity: 1, anim: 'pop', idle: 'float', shadow: true, frame: 'none', fit: 'contain', depth: 0.5, flipX: false };
    const c = C(plan([scene('s0', 0, 4, DARK, [big, text('t', 0, 4, 0.28)])]));
    expect(checkReel(c).map((i) => i.code)).toContain('collision');
    expect(autofix(c).map((i) => i.code)).not.toContain('collision');
  });

  it('concept lexicon maps Darija/Arabic/French words to literal visuals', () => {
    expect(conceptFor('السكرول')).toBe('obj/iphone');
    expect(conceptFor('التوصيل')).toBe('3d/delivery-truck');
    expect(conceptFor('الاستراتيجية')).toBe('obj/chess-king');
    expect(conceptFor('يشوفوكش')).toBe('obj/magnifying-glass');
    expect(conceptFor('livraison')).toBe('3d/delivery-truck');
    expect(conceptFor('سنين')).not.toBe('3d/tooth');
    expect(visualFor(['بدّل', 'la', 'brosse'])).toBe('obj/toothpaste');
  });

  it('local director (no key): every scene has a hero, backgrounds vary, no QA issue', () => {
    const t = estimateTranscript('عندك فكرة قوية ومنتوج مليح. بصح الناس ما يشوفوكش. المحتوى بلا جمهور غير ضجيج. الجمهور هو الرأس مال الحقيقي. كل فيديو لازم يوقف السكرول في 3 ثواني. ابدا اليوم.');
    for (const seed of ['a', 'b', 'c']) {
      const p = localDirector(t, { mode: 'content', seed });
      const c = compile({ plan: p, transcript: t, mode: 'content', aspect: '9:16', fps: 30, resolve: () => 'x.webp' });
      c.scenes.filter((s) => !s.isEnd).forEach((s) => expect(heroArea(c, s), `${seed}/${s.id}`).toBeGreaterThanOrEqual(HERO_MIN));
      expect(autofix(c)).toEqual([]);
      c.scenes.filter((s) => !s.isEnd).forEach((s) => expect(heroArea(c, s), `${seed}/${s.id} after autofix`).toBeGreaterThanOrEqual(HERO_MIN));
    }
  });

  it('UI cards: a Latin handle does not flip an Arabic card; each run keeps its own direction', () => {
    expect(containerDir('motiq.studio', '+1 250 متابع جديد هذا الأسبوع')).toBe('rtl');
    expect(detectDir('+1 250 متابع جديد', 'rtl')).toBe('rtl');
    expect(detectDir('motiq.studio', 'rtl')).toBe('ltr');
    expect(containerDir('Order now', 'free delivery')).toBe('ltr');
    // a wrapped line that starts with French inside an Arabic layer stays RTL (owner: "reversed Arabic/French order")
    expect(containerDir('la brosse تاعك')).toBe('rtl');
    expect(containerDir('كلاسيك، acier inoxydable')).toBe('rtl');
  });
});
