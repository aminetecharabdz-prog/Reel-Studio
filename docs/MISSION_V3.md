# MISSION V3 — Rebuild the platform as "Rassam" around the Motion Starter Kit styles

> Base: continue from branch `claude/modest-wozniak-1umut3` (the current "Motiq" app, live on Pages) after merging `origin/main`. Leave the branches `claude/upbeat-ride-cwljzw`, `claude/modest-cerf-gwzwwp` and `asset-staging` untouched (owner's one-off client reels).

> This file **supersedes** the creative/engine parts of `MASTER_PROMPT.md`, `SPEC.md` §5 and `docs/QUALITY_BAR.md`.
> Infrastructure decisions in SPEC.md (static site on GitHub Pages, BYOK keys, in-browser render/export, IndexedDB, word-anchored timing, Arabic RTL rules, mobile-first, Playwright on the live URL) still apply.
> The owner (Arabic speaker, not a programmer, works from his phone) has given **full permission**: do not ask him anything, decide yourself, record decisions in `docs/progress.md`, and tell him only when it is done.


## ⚠️ SCOPE DECISION (owner, updated 2026-10-16 03:00 Algiers) — ALL TEN STYLES, as fast as possible
The owner changed his mind: build **all 10 styles** and the **whole website**, as quickly as possible, then report once. Order: `product` first (it defines the e-commerce flow below), then `infographic`, `doodle`, `whiteboard`, `plotter`, `stickman`, `chalkboard`, `isometric`, `fake3d`, `map-journey`. Each style still has to pass the §5 gate; work fast but never ship a style below its reference (a style that is not ready yet shows as "قريبًا" until it passes). The site features below apply to every style.
- `product` must cover the owner's market: **physical product ads for e-commerce** (shoes, clothes, phone holder, watch, cosmetics… from 1–5 user photos: background removal in the browser if possible, the product as hero object in the style's tilted glowing card / orbiting rings / giant words), **app/service promos**, and **offers** (price, old→new price, delivery to 58 wilayas, cash on delivery, stock/urgency only if true). Vertical 9:16 first, also 4:5, 1:1 and 16:9.
- Features to ship with it (all working, tested on a phone):
  1. Create from **voice** (upload/record in the browser, transcription with word timing), from a **script**, or **"write the ad for me"** from product name + price + 3 benefits (Claude, Darija/MSA/French) with 3 hook variants to choose from.
  2. Optional AI voice-over (ElevenLabs TTS, voices list, speed) when a key exists.
  3. **Brand kit**: logo upload, brand colours, phone/WhatsApp/Instagram handle → used on the end card; saved and reused.
  4. Music library by mood + upload, auto-ducking under voice, SFX on/off.
  5. Caption styles (in the product style's language) with keyword highlight; on/off.
  6. Preview with scene list: edit any text, swap product photo, change accent colour, regenerate a scene, re-time.
  7. Export MP4 in the browser (720p fast / 1080p HD), SRT, cover image (thumbnail); "make 3 versions" for ad A/B tests.
  8. Projects library (IndexedDB), duplicate project, demo projects (at least 3 product ads you author at top quality: e.g. sneakers, smart watch, phone holder).
  9. Settings with BYOK keys + Arabic phone guides; demo mode without keys.
- Then polish the whole site with the `frontend-design` skill: landing (animated Rassam logo, live product demo playing, how-it-works, styles gallery, FAQ), app shell, empty states, loading states, errors in clear Arabic, accessibility, smooth transitions, perfect RTL, fast on a phone.
- Quality gate (§5) applies to `product` and to the site: Playwright on the live URL at 412×915 for every flow above; contact sheets side by side with the kit's product reference.

## 1. Why we rebuild
The owner rejected "Nabra" (v1) and now wants a new direction beyond "Motiq" (v2, the current live app: scene-graph engine, photo library, Claude/Gemini director). He found the open-source **Motion Starter Kit** (MIT licence): https://github.com/motalim-ai/motion-starter-kit — 10 hand-crafted Remotion styles, all drawn in code (no AI images), with reference videos, style analysis scripts, Arabic rules and a review method. **That is the quality he wants.** Our platform turns that agent workflow into a self-serve web product: a user picks a style, gives a voice or a script, and gets a finished video of that quality.

## 2. New brand — "رسّام · Rassam"
- Name: **رسّام / Rassam** ("the one who draws") — the platform *draws* your video: pen, marker, chalk, ink, light. Short, strong, easy in Arabic, French and English.
- Replace every "Motiq/موتيك" and "Nabra/نبرة" occurrence (brand config, title, manifest, favicon, landing, docs). One config file controls the name.
- Logo (original SVG, design it with the `frontend-design` skill): one continuous hand-drawn stroke that forms the letter **ر** and closes into a **play triangle**, with a small glowing **orange spark at the pen tip** (the stroke is "still being drawn"). Variants: full lockup (mark + wordmark رسّام / Rassam), icon only (favicon/PWA, legible at 16 px), animated version (the stroke draws itself, spark travels) for the landing hero and the video end card.
- UI identity: ink-black `#0E0D0B`, warm paper `#F5EFE4`, spark orange `#FF5A1F`, plus one cool accent; display type with hand-drawn character for Arabic + a clean sans for UI. Premium, calm, editorial — must look like a serious international product, clearly different from "Make it" (navy + yellow).

## 3. The kit — how to use it
- Build sandboxes may have no npm/pip registry (see progress.md): if so, do installs, builds, tests, renders and contact sheets in GitHub Actions as the Motiq sessions did (`[qa]` commits → `qa-sheets` branch), and extract reference frames locally with `ffmpeg` if `uv`/Python packages are unavailable.
- In every session: `git clone --depth 1 https://github.com/motalim-ai/motion-starter-kit .ref/msk` (add `.ref/` to `.gitignore`; do NOT commit the reference videos).
- Copy the kit's skill `motion-from-reference` (SKILL.md, references/, scripts/) into `.claude/skills/motion-from-reference/` once and commit it (MIT — keep the licence file and credit "Motion Starter Kit by Motalim" in `docs/CREDITS.md` and in the app's About page).
- For each style: run its analysis (`analyze.py`, needs `uv`; install it if missing) on `.ref/msk/styles/<id>/reference.mp4`, LOOK at every sheet/motion image, read `styles/<id>/README.md`, and write `docs/styles/<id>/STYLE.md` using the kit's `references/style-bible.md` template (exact hex colours, px sizes, durations, easing names). Commit the small analysis images you need under `docs/styles/<id>/`.
- Follow the kit's rules: `references/arabic.md`, `references/remotion.md`, `references/review.md`, `references/audio.md` (timing via words.json-like data, no hard-coded seconds, every frame a pure function of time, never split Arabic words into letters, text stays until readable).
- Take only the **style** from references, never their content, logos or texts. Our gallery thumbnails/previews must be rendered by **our** engines.

## 4. Product
### 4.1 Styles = the core
Ten style engines, each a module `src/styles/<id>/`:
`plotter`, `doodle`, `whiteboard`, `chalkboard`, `stickman`, `isometric`, `fake3d`, `infographic`, `map-journey`, `product`.
Each module contains:
1. `STYLE.md` link + design tokens (palette, fonts, sizes, easing, durations) taken from the analysis.
2. A **scene vocabulary** for that style (e.g. whiteboard: draw-path, colour-fill, write-label, camera-zoom-to-region, arrow; infographic: big-counter, sphere, dot-grid 10×10, morph bar→ring, stat list; doodle: character walk/talk/gesture, prop, world-segment, word-by-word caption with glowing keyword; product: giant word → shrink to line, neon prompt box typing, tilted UI card with glowing edge, rings, glass orb).
3. A Zod schema for that style's scene plan + a director prompt (Claude API, structured output) that writes a plan in that vocabulary from the user's transcript/script, topic and aspect ratio.
4. Remotion components implementing the vocabulary at reference quality, deterministic, word-anchored, supporting **9:16 (default, reels), 16:9 and 1:1**. Adapt 16:9 references to vertical with a real layout redesign, not letterboxing.
5. A local (no-key) fallback planner that still produces a good video, and **one demo project per style** whose plan you author yourself as the director at the highest quality (Arabic Darija/MSA script, coherent topic, 20–40 s), shipped as fixtures.
6. A drawable illustration library for that style (SVG paths for pen/marker/chalk drawing, characters with jointed limbs for doodle/stickman, isometric building kit, map coastlines, etc.). Illustrations are generated as code/SVG — build a rich enough library to illustrate everyday topics (health, food, money, cars, phones, shops, delivery, school, sport, family, time, growth, warnings, before/after…).

### 4.2 User flow (mobile-first, Arabic RTL)
1. **Home/landing:** hero with the animated logo; "اختر ستايل" gallery of the 10 styles as **live looping previews rendered by our Player**, each with name, one-line use-case and a demo button.
2. **Create:** style (or "اختيار تلقائي" — Claude picks the best style from the topic) → content: upload voice (MP3/M4A/WAV/MP4 → transcription with word timestamps) OR write/paste a script (optional ElevenLabs TTS if key, else silent with text pacing like the kit's `--wps`) OR "write the script for me" from a topic (Claude) → topic/notes, duration, aspect ratio → music (generated/mood or upload) + SFX on/off → **Generate**.
3. **Preview & edit:** Player, scene list, edit any text, regenerate one scene, change accent colour, re-time; then **Export MP4 in the browser** (720p fast / 1080p HD), plus SRT.
4. **Settings:** BYOK keys (Claude, ElevenLabs, optional OpenAI for Whisper) with Arabic phone guides; works in demo mode without keys.
5. Keep from the current Motiq build where useful: `src/ai/speech.ts` (Scribe STT / TTS / estimator), Claude tool-call + Zod + caching + cost ledger, export pipeline, IndexedDB projects, BYOK settings, the QA checks in `src/engine/qa.ts` (adapt them to the new engines), CI workflows (`qa-sheets` with `[qa]` commits, live-smoke). Motiq's free-form scene-graph engine and photo library may remain as an extra style "editorial" only if it still passes the quality gate; otherwise remove it.

### 4.3 Product ads
The `product` style plus user product photos: the photo is placed as the hero object inside the style (tilted card with glowing edge, orbiting rings, price/offer/delivery chips in the style's language). Ad structure from the `reel-copywriting` skill.

## 5. Build order and quality gate
Order: framework → `product` → `infographic` → `doodle` (vertical native) → `whiteboard` → `plotter` → `stickman` → `chalkboard` → `isometric` → `fake3d` → `map-journey`.

**Gate for every style before starting the next:** render its demo, make stills at 6+ key moments and put each **side by side with the reference analysis sheets**. Ask honestly: "would a viewer believe this came from the same creator as the reference?" If not, fix and repeat. Then a second test: generate a video in that style for a *different* topic with the local planner (e.g. dental tips, car engine basics, a phone-holder ad, a restaurant promo) and check it still looks like the reference. Record the verdict and the side-by-side image path in `docs/progress.md`. Every bug fixed gets an automated check (overflow, empty frame, Arabic letter splitting, bidi order, text on screen long enough, sync drift ≤ 1 frame).

If time/limits run short, ship fewer styles at full quality rather than ten mediocre ones: a style that fails the gate is hidden from the gallery ("قريبًا").

## 6. Done = 
- Live site https://aminetecharabdz-prog.github.io/Reel-Studio/ branded Rassam, styles that passed the gate visible, each with a demo, full create → preview → export flow working on a phone (Playwright 412×915 on the live URL).
- Top of `docs/progress.md`: a short report in simple Arabic: the link, which styles are ready, how to make a video, how to add keys from the phone, known limits.
