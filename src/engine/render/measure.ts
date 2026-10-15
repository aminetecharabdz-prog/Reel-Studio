import { measureText } from '@remotion/layout-utils';

const cache = new Map<string, number>();
export const measure = (text: string, family: string, weight: number, size: number, italic = false) => {
  const k = `${family}|${weight}|${italic}|${size}|${text}`;
  const hit = cache.get(k);
  if (hit !== undefined) return hit;
  const w = measureText({ text, fontFamily: family, fontSize: size, fontWeight: weight, validateFontIsLoaded: false, additionalStyles: italic ? { fontStyle: 'italic' } : undefined }).width;
  cache.set(k, w);
  return w;
};
export const clearMeasure = () => cache.clear();
