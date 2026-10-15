---
name: video-qa
description: Procedure to verify a generated reel is error-free before calling it done — deterministic layout/sync/contrast checks, rendering stills and contact sheets, visual inspection, auto-fix loop, and regression checks. Use after any change to video code, the director prompts, or before reporting a build as ready.
---

# Video QA

"It compiles" is not done. A video is done when it has been rendered and inspected.

## 1. Automated checks (code, every plan)
Implement and run these on the compiled plan (see SPEC §8.1):
- text out of frame / clipped / overflowing its box
- min font size per aspect ratio; contrast ≥ 4.5:1 against the real background
- platform safe zones respected
- bounding-box overlap between captions and graphics
- caption ↔ word sync drift ≤ 1 frame; every word captioned once
- no empty/black frames, no scene < 12 frames, no static screen > 2 s
- all assets and fonts load
- audio: voice peak ≤ −1 dBTP, music ducked under speech

## 2. Visual inspection (every time you touch video code)
1. Render the demo projects (dentist, car engine, phone-holder ad) — at least short sections if full renders are slow.
2. Render stills (`renderStillOnWeb` in browser tests, or the Remotion CLI in CI) at: first frame, each scene's hero frame, each transition midpoint, last frame.
3. Build a **contact sheet** (grid image) and LOOK at it. Check: readability, Arabic shaping and order, alignment, hierarchy, visual-to-speech match, variety between the three demos, nothing under platform UI.
4. Fix root causes, not symptoms. Add an automated check for every bug you fix.

## 3. Sync verification
- For 5 random words, compute expected frame from the transcript and assert the caption highlight and any anchored visual start within ±1 frame (unit test on the compiled timeline).
- Spot-check in the Player: scrub to those frames.

## 4. Variety verification
- Generate the same audio twice with different seeds and two different topics: fingerprints must differ (primitive sequence Jaccard < 0.4, different palette and motion family).

## 5. Live-site verification (owner uses a phone)
- Run Playwright at 412×915 against the deployed GitHub Pages URL: open app → open a demo project → preview plays → export finishes → file downloads. Capture screenshots and inspect them.
- Only then tell the owner it is ready, with the link.

## Report format to the owner (Arabic, short)
- ما الذي تم + الرابط
- ما الذي فحصته
- ما بقي من ملاحظات معروفة (إن وجدت)
