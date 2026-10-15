import { z } from 'zod';
import type { ImageGenerator } from './types';
import { MODELS, PRICES } from './config';
import { logCost } from '../cost/ledger';
import { repo } from '../repo/db';
import { sha256, uid } from '../util/rng';
import type { Keys } from './keys';
import { openaiImages } from './openai';

export const geminiImages = (apiKey: string): ImageGenerator => ({
  id: 'gemini-image',
  async generate(prompt, opts) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELS.geminiImage}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${prompt}\nAspect ratio ${opts.aspect}. No text, no letters, no watermark.` }] }], generationConfig: { responseModalities: ['IMAGE'] } }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    const parts = z.array(z.object({ inlineData: z.object({ data: z.string(), mimeType: z.string() }).optional() }).passthrough()).parse(json?.candidates?.[0]?.content?.parts ?? []);
    const img = parts.find((p) => p.inlineData)?.inlineData;
    if (!img) throw new Error('Gemini returned no image');
    await logCost({ projectId: opts.projectId ?? null, provider: 'gemini', model: MODELS.geminiImage, op: 'image', units: 1, unitLabel: 'image', usd: PRICES.geminiImage });
    return new Blob([Uint8Array.from(atob(img.data), (c) => c.charCodeAt(0))], { type: img.mimeType });
  },
});

export const falImages = (apiKey: string): ImageGenerator => ({
  id: 'fal-image',
  async generate(prompt, opts) {
    const res = await fetch(`https://fal.run/${MODELS.falImage}`, {
      method: 'POST',
      headers: { Authorization: `Key ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, image_size: opts.aspect === '1:1' ? 'square_hd' : 'portrait_16_9', num_images: 1 }),
    });
    if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = z.object({ images: z.array(z.object({ url: z.string() })) }).parse(await res.json());
    const blob = await (await fetch(data.images[0]!.url)).blob();
    await logCost({ projectId: opts.projectId ?? null, provider: 'fal', model: MODELS.falImage, op: 'image', units: 1, unitLabel: 'image', usd: PRICES.falImage });
    return blob;
  },
});

export const imageGenerator = (k: Keys): ImageGenerator | null => {
  if (k.imageProvider === 'gemini' && k.gemini) return geminiImages(k.gemini);
  if (k.imageProvider === 'openai' && k.openai) return openaiImages(k.openai);
  if (k.imageProvider === 'fal' && k.fal) return falImages(k.fal);
  return null;
};

/** Generate (or reuse) an image by prompt hash — never pay twice for the same prompt. */
export const cachedImage = async (gen: ImageGenerator, prompt: string, aspect: '1:1' | '9:16' | '4:5', projectId: string) => {
  const hash = await sha256(`${gen.id}|${aspect}|${prompt}`);
  const hit = await repo.findAssetByHash(hash);
  if (hit) return hit.id;
  const blob = await gen.generate(prompt, { aspect, projectId });
  const id = uid('img_');
  await repo.putAsset({ id, projectId, kind: 'generated-image', name: prompt.slice(0, 40), mime: blob.type, size: blob.size, hash, blob, createdAt: Date.now(), meta: { prompt } });
  return id;
};
