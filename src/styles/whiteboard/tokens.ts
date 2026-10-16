/** whiteboard — "living marker whiteboard" tokens from docs/styles/whiteboard/STYLE.md (1920×1080 world @ zoom 1). */
export const B = {
  boardCentre: '#FAFAF8',
  boardEdge: '#EFF1EE',
  ghost: '#ECEEEC',
  ghostDeep: 'rgba(225,228,225,0.9)',
  bezel: '#D5D8E1',
  bezelLine: '#C9CDD0',
  font: '"Marhey", "Readex Pro", sans-serif',
} as const;

export const MARKERS = {
  ink: { stroke: '#23272E', hatch: '#23272E' },
  blue: { stroke: '#1E63D6', hatch: '#1E63D6' },
  red: { stroke: '#E0412E', hatch: '#E0412E' },
  orange: { stroke: '#F28C12', hatch: '#FFC94A' },
  green: { stroke: '#2E9B4F', hatch: '#2E9B4F' },
} as const;
export type Marker = keyof typeof MARKERS;

/** seconds per character of written text (STYLE.md §6) */
export const CHAR_S = 0.075;
