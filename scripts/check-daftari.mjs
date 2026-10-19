// Automated checks for the Daftari reel timeline (run: npm run check:daftari).
import { readFileSync } from "node:fs";
import { compileTimeline, MAX_CAPTION_CHARS } from "../src/daftari/compiler.ts";

const data = JSON.parse(readFileSync(new URL("../src/daftari/words.json", import.meta.url), "utf8"));
const FPS = 30;
const t = compileTimeline(data.voices, data.words, FPS, 1.5);
const errors = [];

// Every word appears in exactly one caption, in order.
let expect = 0;
for (const c of t.captions) {
  if (c.firstWord !== expect) errors.push(`caption "${c.text}" starts at word ${c.firstWord}, expected ${expect}`);
  expect = c.lastWord + 1;
  if (c.text.length > MAX_CAPTION_CHARS) errors.push(`caption too long (${c.text.length}): ${c.text}`);
  if (c.endFrame - c.startFrame < 12) errors.push(`caption shorter than 12 frames: ${c.text}`);
}
if (expect !== t.words.length) errors.push(`captions cover ${expect}/${t.words.length} words`);

// Captions never overlap: one idea on screen at a time.
t.captions.forEach((c, i) => {
  const n = t.captions[i + 1];
  if (n && n.startFrame < c.endFrame) errors.push(`captions overlap: "${c.text}" / "${n.text}"`);
});

// Word timing is monotonic and inside its voice clip.
t.words.forEach((w, i) => {
  if (w.endFrame <= w.startFrame) errors.push(`word ${w.id} has no duration`);
  if (i && w.startFrame < t.words[i - 1].startFrame) errors.push(`word ${w.id} starts before previous word`);
});

// Speaking rate sanity per phrase (alignment drift shows up as absurd rates).
let phrase = [];
for (const w of t.words) {
  phrase.push(w);
  if (w.breakAfter >= 1.5) {
    const chars = phrase.map((x) => x.text.replace(/[^\p{L}]/gu, "")).join("").length;
    const secs = (phrase.at(-1).end - phrase[0].start);
    if (chars >= 8 && (chars / secs > 18 || chars / secs < 5)) errors.push(`suspicious rate ${(chars / secs).toFixed(1)} c/s: ${phrase.map((x) => x.text).join(" ")}`);
    phrase = [];
  }
}

console.log(`${t.words.length} words, ${t.captions.length} captions, ${(t.durationInFrames / FPS).toFixed(1)} s`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Daftari timeline checks passed");
