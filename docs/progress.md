# Progress

## 2026-10-16 — Product reel: glass wall art (40 s)
- Owner sent a product photo (S&C Décoration glass triptych), a 36 s Darija voiceover and the
  motion-starter-kit link; asked for a 40 s marketing video.
- Done: `videos/glass-art-delivery/` (Remotion). Final file `videos/glass-art-delivery/final/reel-40s.mp4`.
- Decisions:
  - Rendered directly without a Studio review step, because the owner works from his phone only.
  - Hugging Face is blocked in the cloud sandbox → transcribed with sherpa-onnx Whisper large-v3 (model from GitHub releases);
    word times are spread inside measured phrase spans.
  - Google Fonts are bundled locally (the headless browser can't fetch them through the proxy).
  - No image key yet → all packing visuals are drawn in code; the product photo is the only real image.
- Known issues: word timing is phrase-accurate, not word-perfect. The CTA says «اطلبي دروك» (feminine, matching the voiceover).
