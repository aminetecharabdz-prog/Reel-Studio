/** The ONLY place where milliseconds become frames (SPEC §6). */
export const msToFrame = (ms: number, fps: number): number => Math.round((ms / 1000) * fps);
export const frameToMs = (frame: number, fps: number): number => (frame / fps) * 1000;
/** Frames a visual enters before its anchor word (perception anticipation, 3–6 f at 30 fps). */
export const anticipationFrames = (fps: number) => Math.round((4 / 30) * fps);
