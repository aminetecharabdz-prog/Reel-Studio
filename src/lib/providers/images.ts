import { z } from 'zod';
import type { ImageGenerator } from './types';
import { MODELS, PRICES } from './config';
import { logCost } from '../cost/ledger';
import { repo } from '../repo/db';
import { sha256, uid } from '../util/rng';
import type { Keys } from './keys';
import { openaiImages } from './openai';

const blobToB64 = async (b: Blob) => {
  const buf = new Uint8Array(await b.arrayBuffer());
  let out = '';
  for (let i = 0; i < buf.length; i += 0x8000) out += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(out);
};

/** find the first base64 image anywhere in a Gemini response (interactions or generateContent shapes) */
const findImage = (node: unknown, depth = 0): { data: string; mime: string } | null => {
  if (!node || typeof node !== 'object' || depth > 8) return null;
  const o = node as Record<string, unknown>;
  if (o.type === 'image' && typeof o.data === 'string') return { data: o.data, mime: String(o.mime_type ?? o.mimeType ?? 'image/png') };
  const inline = (o.inlineData ?? o.inline_data) as Record<string, unknown> | undefined;
  if (inline && typeof inline.data === 'string') return { data: inline.data, mime: String(inline.mimeType ?? inline.mime_type ?? 'image/png') };
  for (const v of Object.values(o)) {
    const hit = Array.isArray(v) ? v.map((x) => findImage(x, depth + 1)).find(Boolean) : findImage(v, depth + 1);
    if (hit) return hit;
  }
  return null;
};

export const geminiImages = (apiKey: string): ImageGenerator => ({
  id: 'gemini-image',
  async generate(prompt, opts) {
    const text = `${prompt}\nVertical ${opts.aspect} composition. No text, no letters, no logos, no watermark.`;
    const refs = await Promise.all((opts.refs ?? []).slice(0, 4).map(async (b) => ({ mime: b.type || 'image/png', data: await blobToB64(b) })));
    const headers = { 'x-goog-api-key': apiKey, 'content-type': 'application/json' };
    // 1) Interactions API (current docs), with reference images for consistency
    let res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODELS.geminiImage,
        input: refs.length ? [{ type: 'text', text }, ...refs.map((r) => ({ type: 'image', mime_type: r.mime, data: r.data }))] : text,
        response_format: { type: 'image', aspect_ratio: opts.aspect, image_size: '1K' },
      }),
    });
    let model: string = MODELS.geminiImage;
    // 2) fallback: classic generateContent with the legacy model
    if (res.status === 404 || res.status === 400) {
      model = MODELS.geminiImageLegacy;
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ contents: [{ parts: [{ text }, ...refs.map((r) => ({ inlineData: { mimeType: r.mime, data: r.data } }))] }], generationConfig: { responseModalities: ['IMAGE'] } }),
      });
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const img = findImage(z.unknown().parse(await res.json()));
    if (!img) throw new Error('Gemini returned no image');
    await logCost({ projectId: opts.projectId ?? null, provider: 'gemini', model, op: 'image', units: 1, unitLabel: 'image', usd: PRICES.geminiImage });
    return new Blob([Uint8Array.from(atob(img.data), (c) => c.charCodeAt(0))], { type: img.mime });
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
export const cachedImage = async (gen: ImageGenerator, prompt: string, aspect: '1:1' | '9:16' | '4:5', projectId: string, refs: Blob[] = []) => {
  const hash = await sha256(`${gen.id}|${aspect}|${prompt}|refs:${refs.map((r) => `${r.size}-${r.type}`).join(',')}`);
  const hit = await repo.findAssetByHash(hash);
  if (hit) return hit.id;
  const blob = await gen.generate(prompt, { aspect, projectId, refs });
  const id = uid('img_');
  await repo.putAsset({ id, projectId, kind: 'generated-image', name: prompt.slice(0, 40), mime: blob.type, size: blob.size, hash, blob, createdAt: Date.now(), meta: { prompt } });
  return id;
};
