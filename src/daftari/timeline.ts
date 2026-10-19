import data from "./words.json";
import { compileTimeline } from "./compiler";

export const FPS = 30;

/** Compiled Daftari timeline: words → frames, captions, voice clips, phrase anchors. */
export const timeline = compileTimeline(data.voices, data.words, FPS, 1.5);
export const { at, endOf } = timeline;
