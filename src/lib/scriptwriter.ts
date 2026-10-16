/**
 * «اكتب لي السكريبت»: Claude when a key exists, otherwise a good local template (reel-copywriting: hook → problem →
 * answer → proof → offer → CTA), one line per beat, in Darija, MSA, French or English.
 */
import { z } from 'zod';
import type { Goal } from '@/styles/catalog';
import { claudeTool, hasClaude } from './providers/claude';

export type Lang = 'darija' | 'msa' | 'fr' | 'en';
export type ScriptBrief = { goal: Goal; lang: Lang; topic: string; product?: { name: string; price: string; oldPrice: string; offer: string; delivery58: boolean; cod: boolean; whatsapp: string } | null; seconds: number };

const T = {
  darija: {
    adHook: (n: string) => `راك تقلّب على ${n} مليح؟`,
    adProblem: 'بزاف سلع تبان مليحة وفي الحقيقة لا',
    adAnswer: (n: string) => `جبنالك ${n}`,
    adProof: 'جودة مضمونة، مجرّب ومحبوب',
    adPrice: (p: string, o: string) => (o ? `بـ ${p} برك بدل ${o}` : `بـ ${p} برك`),
    adDelivery: (d: boolean, c: boolean) => [d ? 'التوصيل لـ 58 ولاية' : '', c ? 'والدفع عند الاستلام' : ''].filter(Boolean).join(' '),
    adCta: (n: string) => `اطلب ${n} اليوم`,
    exHook: (t: string) => `واش تعرف الحقيقة على ${t}؟`,
    exP: 'أغلب الناس يغلطو في هاد النقطة',
    ex1: 'أول حاجة: ابدا بالصح',
    ex2: 'ثاني حاجة: كون ثابت كل يوم',
    ex3: 'ثالث حاجة: شوف النتيجة وعاود',
    exCta: 'تابعنا باش تعرف أكثر',
  },
  msa: {
    adHook: (n: string) => `هل تبحث عن ${n} يستحق ثمنه؟`,
    adProblem: 'كثير من المنتجات تبدو جيدة ثم تخيب ظنك',
    adAnswer: (n: string) => `إليك ${n}`,
    adProof: 'جودة مضمونة وتجربة يحبها الجميع',
    adPrice: (p: string, o: string) => (o ? `بـ ${p} فقط بدل ${o}` : `بـ ${p} فقط`),
    adDelivery: (d: boolean, c: boolean) => [d ? 'توصيل إلى 58 ولاية' : '', c ? 'والدفع عند الاستلام' : ''].filter(Boolean).join(' '),
    adCta: (n: string) => `اطلب ${n} الآن`,
    exHook: (t: string) => `هل تعرف الحقيقة عن ${t}؟`,
    exP: 'معظم الناس يخطئون في هذه النقطة',
    ex1: 'أولًا: ابدأ بالطريقة الصحيحة',
    ex2: 'ثانيًا: كن ثابتًا كل يوم',
    ex3: 'ثالثًا: راقب النتيجة وكرّر',
    exCta: 'تابعنا لتعرف المزيد',
  },
  fr: {
    adHook: (n: string) => `Vous cherchez un ${n} qui vaut vraiment le coup ?`,
    adProblem: 'Beaucoup de produits déçoivent dès le premier jour',
    adAnswer: (n: string) => `Voici ${n}`,
    adProof: 'Qualité garantie, déjà adopté par nos clients',
    adPrice: (p: string, o: string) => (o ? `Seulement ${p} au lieu de ${o}` : `Seulement ${p}`),
    adDelivery: (d: boolean, c: boolean) => [d ? 'Livraison dans les 58 wilayas' : '', c ? 'paiement à la livraison' : ''].filter(Boolean).join(', '),
    adCta: (n: string) => `Commandez ${n} aujourd’hui`,
    exHook: (t: string) => `Connaissez-vous la vérité sur ${t} ?`,
    exP: 'La plupart des gens se trompent ici',
    ex1: 'Un : commencez correctement',
    ex2: 'Deux : soyez régulier chaque jour',
    ex3: 'Trois : mesurez et recommencez',
    exCta: 'Abonnez-vous pour en savoir plus',
  },
  en: {
    adHook: (n: string) => `Looking for a ${n} that’s actually worth it?`,
    adProblem: 'Most products look good and then let you down',
    adAnswer: (n: string) => `Meet ${n}`,
    adProof: 'Quality guaranteed, loved by our customers',
    adPrice: (p: string, o: string) => (o ? `Only ${p} instead of ${o}` : `Only ${p}`),
    adDelivery: (d: boolean, c: boolean) => [d ? 'Delivery to all 58 wilayas' : '', c ? 'cash on delivery' : ''].filter(Boolean).join(', '),
    adCta: (n: string) => `Order ${n} today`,
    exHook: (t: string) => `Do you know the truth about ${t}?`,
    exP: 'Most people get this part wrong',
    ex1: 'One: start the right way',
    ex2: 'Two: stay consistent every day',
    ex3: 'Three: check the result and repeat',
    exCta: 'Follow for more',
  },
} as const;

export const localScript = (b: ScriptBrief): string => {
  const t = T[b.lang];
  const p = b.product;
  if (b.goal === 'ad' && p?.name) {
    return [t.adHook(p.name), t.adProblem, t.adAnswer(p.name), p.offer || t.adProof, p.price ? t.adPrice(p.price, p.oldPrice) : '', t.adDelivery(p.delivery58, p.cod), t.adCta(p.name)].filter(Boolean).join('\n');
  }
  const topic = b.topic.trim() || '…';
  return [t.exHook(topic), t.exP, t.ex1, t.ex2, t.ex3, t.exCta].join('\n');
};

const ScriptOut = z.object({ lines: z.array(z.string().min(1).max(90)).min(3).max(24), hookVariants: z.array(z.string().min(1).max(90)).max(3).default([]) });

export const writeScript = async (b: ScriptBrief): Promise<{ script: string; hooks: string[]; source: 'claude' | 'local' }> => {
  if (!hasClaude()) return { script: localScript(b), hooks: [], source: 'local' };
  const lang = { darija: 'Algerian Darija written in Arabic letters', msa: 'Modern Standard Arabic', fr: 'French', en: 'English' }[b.lang];
  const out = await claudeTool({
    op: 'script',
    system: `You write short-video scripts for Algerian creators and shops. ${lang}. One line = one spoken beat (3–9 words). Structure: hook (≤ 1.5 s) → problem → answer → proof/benefits → offer → one clear CTA. Natural spoken rhythm, no hashtags, no emoji, never invent prices or facts that are not given.`,
    user: JSON.stringify({ goal: b.goal, topic: b.topic, product: b.product, targetSeconds: b.seconds }),
    toolName: 'script',
    toolDescription: 'The script lines and up to 3 alternative hooks for A/B tests.',
    inputSchema: z.toJSONSchema(ScriptOut, { io: 'input' }) as Record<string, unknown>,
    schema: ScriptOut,
    maxTokens: 2000,
  });
  return { script: out.lines.join('\n'), hooks: out.hookVariants, source: 'claude' };
};
