import { publicUrl } from './assets';

export const MUSIC = ['upbeat-pop', 'tech-pulse', 'warm-pluck', 'calm-pad'] as const;
export type MusicId = (typeof MUSIC)[number];
export const MUSIC_INFO: Record<MusicId, { ar: string; mood: string }> = {
  'upbeat-pop': { ar: 'بوب حيوي', mood: 'upbeat, positive, marketing, lifestyle' },
  'tech-pulse': { ar: 'نبض تقني', mood: 'tech, modern, confident, product launch' },
  'warm-pluck': { ar: 'دافئ', mood: 'warm, friendly, food, family, handmade' },
  'calm-pad': { ar: 'هادئ', mood: 'calm, premium, spiritual, luxury, emotional' },
};
export const musicUrl = (id: string | null | undefined): string | null => {
  if (!id || id === 'none') return null;
  const k = (MUSIC as readonly string[]).includes(id) ? id : 'upbeat-pop';
  return publicUrl(`audio/music/${k}.mp3`);
};
export const sfxUrl = (k: 'whoosh' | 'pop' | 'tick' | 'ding' | 'impact', palette: string): string | null => {
  const soft = palette === 'soft';
  const f = { whoosh: soft ? 'whoosh-soft' : 'whoosh-hard', pop: soft ? 'pop-soft' : 'pop-punchy', tick: 'tick', ding: 'ding', impact: soft ? 'swipe' : 'impact' }[k];
  return publicUrl(`audio/sfx/${f}.mp3`);
};
