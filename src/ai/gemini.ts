/** Gemini image generation (BYOK). Tries the configured model, then a fallback list (model names change often). */
import { GEMINI_IMAGE_MODELS } from '@/data/settings';
import { logCost } from '@/data/db';
import { AIError } from './claude';

const PRICE: Record<string, number> = { 'gemini-3-pro-image-preview': 0.134, 'gemini-2.5-flash-image': 0.039, 'gemini-2.5-flash-image-preview': 0.039 };
const base = 'https://generativelanguage.googleapis.com/v1beta/models';
let working: string | null = null;

export type GenImage = { blob: Blob; model: string; usd: number };

const b64ToBlob = (b64: string, mime: string) => {
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type: mime });
};

export const generateImage = async (o: { key: string; model: string; prompt: string; aspect: '9:16' | '1:1' | '4:5' | '16:9'; eco?: boolean; refs?: Blob[]; projectId?: string; signal?: AbortSignal }): Promise<GenImage> => {
  const order = [...new Set([...(o.model && o.model !== 'auto' ? [o.model] : []), ...(working ? [working] : []), ...(o.eco ? ['gemini-2.5-flash-image', ...GEMINI_IMAGE_MODELS] : GEMINI_IMAGE_MODELS)])];
  const parts: unknown[] = [{ text: o.prompt }];
  for (const r of o.refs ?? []) {
    const buf = new Uint8Array(await r.arrayBuffer());
    let s = '';
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    parts.push({ inlineData: { mimeType: r.type || 'image/png', data: btoa(s) } });
  }
  let last = '';
  for (const model of order) {
    let res: Response;
    try {
      res = await fetch(`${base}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': o.key },
        body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: o.aspect } } }),
        signal: o.signal,
      });
    } catch (e) {
      throw new AIError('network', (e as Error).message);
    }
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      const t = await res.text();
      if (/API key|PERMISSION|API_KEY/i.test(t)) throw new AIError('key', 'مفتاح Gemini غير صالح');
      last = t.slice(0, 200);
      continue;
    }
    if (res.status === 429) throw new AIError('quota', 'حد Gemini المجاني انتهى مؤقتا');
    if (!res.ok) {
      last = `${res.status}`;
      continue;
    }
    const j = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType: string; data: string } }> } }> };
    const img = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
    if (!img) {
      last = 'no image in response';
      continue;
    }
    working = model;
    const usd = PRICE[model] ?? 0.05;
    await logCost({ provider: 'gemini', what: 'image', usd, projectId: o.projectId, detail: model });
    return { blob: b64ToBlob(img.data, img.mimeType), model, usd };
  }
  throw new AIError('invalid', `Gemini: ${last}`);
};
