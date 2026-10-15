/** Model / provider names in ONE place (CLAUDE.md: model names in config). */
export const MODELS = {
  director: 'claude-sonnet-5-5', // art + scene direction, transcript fixing, vision QA
  cheap: 'claude-haiku-5-5', // small checks
  elevenStt: 'scribe_v1',
  elevenTts: 'eleven_multilingual_v2',
  openaiStt: 'whisper-1',
  geminiImage: 'gemini-nano-banana-2.1', // Google docs (Oct 2026): primary image model, supports reference images
  geminiImageLegacy: 'gemini-2.5-flash-image', // generateContent fallback
  openaiImage: 'gpt-image-1',
  falImage: 'fal-ai/flux/schnell',
} as const;

/** Approximate public prices (USD) used for the cost ledger estimates. */
export const PRICES = {
  'claude-sonnet-5-5': { in: 2 / 1e6, out: 10 / 1e6, cacheRead: 0.2 / 1e6 },
  'claude-haiku-5-5': { in: 0.1 / 1e6, out: 0.5 / 1e6, cacheRead: 0.01 / 1e6 },
  elevenSttPerMinute: 0.0067,
  elevenTtsPer1kChars: 0.15,
  openaiSttPerMinute: 0.006,
  geminiImage: 0.039,
  openaiImage: 0.04,
  falImage: 0.003,
} as const;
