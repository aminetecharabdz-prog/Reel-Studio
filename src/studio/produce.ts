/**
 * From the wizard document to a playable video: word timing (script estimate, or aligned to an uploaded voice),
 * style choice («اختيار تلقائي»), the plan (local planner or Claude), and the final VideoInput.
 */
import { estimateTiming, PACE_GAP, PACE_WPS } from '@/engine/estimate';
import type { Timing } from '@/engine/timing';
import { TimingIndex } from '@/engine/timing';
import type { BrandInfo, ProductInfo, VideoInput } from '@/engine/types';
import { norm } from '@/engine/timing';
import type { BrandKit } from '@/data/db';
import { STYLES, STYLE_LIST, type StyleId } from '@/styles/catalog';
import { hasEngine, loadStyle } from '@/styles/registry';
import type { Wizard } from './state';

export const MUSIC_FILES: Record<string, string> = { calm: 'audio/music/calm.mp3', tech: 'audio/music/tech.mp3', bright: 'audio/music/bright.mp3' };

/** styles a user can actually make now (engine present + passed the gate) */
export const availableStyles = () => STYLE_LIST.filter((s) => s.ready && hasEngine(s.id));

/** «اختيار تلقائي»: keywords + goal fit, among available styles; returns the reason in Arabic */
export const pickStyle = (w: Wizard): { id: StyleId; reason: string } => {
  const text = norm(`${w.content.script} ${w.content.topic} ${w.content.product.name}`);
  const pool = availableStyles();
  const list = pool.length ? pool : [STYLES.product];
  let best = list[0]!;
  let bestScore = -1;
  let hits: string[] = [];
  for (const s of list) {
    const kw = s.keywords.filter((k) => text.includes(norm(k)));
    const score = kw.length * 2 + (w.goal && s.goals.includes(w.goal) ? 3 : 0);
    if (score > bestScore) {
      best = s;
      bestScore = score;
      hits = kw;
    }
  }
  const why = hits.length ? `كلامك فيه «${hits.slice(0, 3).join('، ')}»` : w.goal ? `يناسب هدف «${w.goal === 'ad' ? 'إعلان منتج' : 'المحتوى'}»` : 'هو الأنسب لما كتبت';
  return { id: best.id, reason: `اخترنا «${best.nameAr}» لأن ${why}.` };
};

export const scriptOf = (w: Wizard) => w.content.script.trim();

/** timing from the script (no voice) or spread over the uploaded voice's duration */
export const buildTiming = (w: Wizard, voice?: { asset: string; duration: number } | null): Timing => {
  const pace = w.settings.pace;
  const t = estimateTiming(scriptOf(w), { wps: PACE_WPS[pace], gap: PACE_GAP[pace] });
  if (!voice || !(voice.duration > 1)) return t;
  // scale the estimate onto the real voice (until speech-to-text aligns it word by word)
  const k = (voice.duration - 0.3) / Math.max(0.5, t.duration);
  const sc = (x: number) => Math.round(x * k * 1000) / 1000;
  return {
    source: `estimate scaled to the voice (${voice.duration.toFixed(1)} s)`,
    audio: voice.asset,
    duration: voice.duration,
    lines: t.lines.map((l) => ({ ...l, start: sc(l.start), end: sc(l.end), words: l.words.map((x) => ({ ...x, start: sc(x.start), end: sc(x.end) })) })),
  };
};

export const productOf = (w: Wizard): ProductInfo | null => {
  const p = w.content.product;
  if (w.goal !== 'ad' || !p.name.trim()) return null;
  const dz = (s: string) => (s.trim() && /^\d[\d\s.,]*$/.test(s.trim()) ? `${s.trim()} دج` : s.trim());
  return { ...p, price: dz(p.price), oldPrice: dz(p.oldPrice), photos: p.photos };
};

export const brandOf = (b: BrandKit | null): BrandInfo | null =>
  b && b.name.trim() ? { name: b.name, logo: b.logo, colors: b.colors, handle: b.handles.instagram || b.handles.tiktok || '', phone: b.handles.whatsapp || b.handles.phone, endLine: b.endCard.line } : null;

export const localPlan = async (styleId: StyleId, w: Wizard, timing: Timing, seed: number, brand: BrandInfo | null) => {
  const style = await loadStyle(styleId);
  const plan = style.localPlan({ timing, goal: w.goal ?? 'free', aspect: w.settings.aspect, topic: w.content.topic || w.content.product.name, product: productOf(w), brandName: productOf(w)?.name ? '' : (brand?.name ?? ''), seed });
  return style.sanitize(plan as never, new TimingIndex(timing));
};

export const toInput = (w: Wizard, p: { styleId: StyleId; timing: Timing; plan: unknown }, assets: Record<string, string>, brand: BrandInfo | null, digits: 'western' | 'eastern'): VideoInput => {
  const s = w.settings;
  const music = s.music === 'none' || s.music === 'upload' ? null : MUSIC_FILES[s.music] ?? null;
  return {
    styleId: p.styleId,
    plan: p.plan,
    timing: p.timing,
    aspect: s.aspect,
    assets,
    audio: { voice: p.timing.audio && p.timing.audio !== w.content.videoAsset ? p.timing.audio : null, music, musicVolume: s.musicVolume, ducking: s.ducking, sfx: s.sfx, sfxIntensity: s.sfxIntensity },
    captions: s.captions && (!!p.timing.audio || !!w.content.videoAsset) ? { size: s.captionSize, position: s.captionPos, keywordColor: s.keywordColor } : null,
    brand: s.useBrandKit ? brand : null,
    endCard: s.endCard && !!brand,
    product: productOf(w),
    digits,
    accent: s.accent || null,
    talking: w.content.videoAsset ? { video: w.content.videoAsset, cuts: [] } : null,
  };
};
