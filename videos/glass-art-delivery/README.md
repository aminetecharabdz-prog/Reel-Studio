# Glass wall-art delivery reel (40 s, 1080×1920)

Product ad for the S&C Décoration glass triptych, built in Remotion from the owner's Darija voiceover
(using the craft rules of github.com/motalim-ai/motion-starter-kit + this repo's skills).

- Final video: `final/reel-40s.mp4` (loudness-normalised to about −15 LUFS)
- Timing: `tools/make_words.py` → `src/data/words.json` (Whisper large-v3 transcript + silence detection)
- Scenes: `src/scenes/` — Hook (69 wilayas) → Fear (glass cracks) → 5 steps → Packing (inspect, corner guards,
  bubble wrap, reinforced box, tape + shake test) → Arrive → End card
- SFX: `public/sfx/` (synthesised; `tools/extra_sfx.py` adds glass + tape); music bed `public/music.wav`

Rebuild:
```
npm install
BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npm run render -- --approved
ffmpeg -i out/video.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=7 -c:a aac -b:a 192k final/reel-40s.mp4
```
