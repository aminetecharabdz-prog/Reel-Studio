# MISSION V4 — "رسّام · Rassam": a brand-new website, built from scratch

> Supersedes MISSION_V3 and every earlier brief (MASTER_PROMPT.md, SPEC.md §5, QUALITY_BAR.md). Owner's words (2026-10-16 03:03, Algiers), summarised:
> "Do NOT update the previous site — build a completely new one. Arabic interface, very well divided, ordered and organised, 3D or a clear beautiful style, extremely professional, every section and every detail present, the user has big control over the video. Apply EVERYTHING in the GitHub link (https://github.com/motalim-ai/motion-starter-kit) — it contains everything I want. A complete site for e-commerce, for content marketers, and for people who appear on camera with montage around them. Strong videos like the ones in the kit. No mistakes. Take the time needed for a professional result, but deliver as soon as possible. You have every permission."
> Never ask the owner anything. Decide, record decisions in `docs/progress.md`, report once at the end.

## 0. Repository layout and branches
- Build the new site on a fresh **orphan branch `rassam`** (no Motiq/Nabra code). Old branches stay untouched as archive: `claude/modest-wozniak-1umut3` (Motiq), `claude/upbeat-ride-cwljzw`, `claude/modest-cerf-gwzwwp`, `asset-staging`, `qa-sheets`.
- The new site replaces what GitHub Pages serves: https://aminetecharabdz-prog.github.io/Reel-Studio/ (deploy the `rassam` build to `gh-pages`; keep the deploy workflow on the `rassam` branch).
- You may reuse **infrastructure know-how** from the old branches (Pages deploy workflow, the CI trick that publishes a `node_modules` snapshot for sandboxes without an npm registry, `[qa]` contact-sheet workflow, transcription provider code) — but the **UI, design system, video engine and brand are 100 % new**.
- Copy into the new branch: `.claude/skills/*` from main, `docs/MISSION_V4.md`, a new `CLAUDE.md` (adapted from main's: owner profile, rules, Arabic, deterministic Remotion, word-anchored timing, BYOK, Playwright on live URL).
- If a sandbox has no npm/pip registry: install/build/test/render in GitHub Actions (as earlier sessions did) and read results back from a results branch.

## 1. The source of truth: Motion Starter Kit (MIT)
https://github.com/motalim-ai/motion-starter-kit — clone into `.ref/msk` each session (git-ignored; never commit its videos). Apply **everything** in it:
- `AGENTS.md` rules (Remotion only, every frame a pure function of time, no CSS animations / Math.random / state between frames, timing from word data via `line()` / `word()`, never split Arabic words into letters, text stays until readable, self-review with stills next to the reference).
- The skill `.agents/skills/motion-from-reference/` (copy it into `.claude/skills/motion-from-reference/`, keep its licence; credit "Motion Starter Kit by Motalim" in `docs/CREDITS.md` and the site's About page): its 8-stage method, `references/style-bible.md`, `questions.md` (turn the questions into the site's creation form), `arabic.md`, `remotion.md`, `audio.md`, `review.md`, and scripts `analyze.py`, `align.py`, `sfx.py`, `music.py` (port the audio generators — SFX and music by mood — to the browser or run them at build time to produce a royalty-free library).
- The **10 styles**: `plotter`, `doodle`, `whiteboard`, `chalkboard`, `stickman`, `isometric`, `fake3d`, `infographic`, `map-journey`, `product`. For each: analyse `styles/<id>/reference.mp4`, read `styles/<id>/README.md`, write `docs/styles/<id>/STYLE.md` (exact colours, px, durations, easings), then implement it.
- The "your own reference" idea: a user can upload a reference video they own the rights to; the AI extracts a style bible (palette, rhythm, typography) and applies it to the closest engine. (Phase after the 10 styles if time is short.)

## 2. Brand: رسّام · Rassam
- Name رسّام / Rassam — "the one who draws". One config file controls name, tagline, colours.
- Original SVG logo: one continuous hand-drawn stroke forming the letter **ر** that closes into a **play triangle**, with a glowing **orange spark** at the pen tip. Lockup (mark + wordmark), icon (legible at 16 px, PWA icons), and an animated version (stroke draws itself, spark travels) used in the landing hero, loading states and as an optional end-card sting.
- Tagline idea: «ارسم فيديوك بالكلام» (adjust if a better one comes).

## 3. Design of the website (owner: "3D or clear and beautiful, extremely professional, divided, ordered, organised")
Use the `frontend-design` skill for every screen. Direction: **premium Arabic product with tasteful 3D depth** — a real-time 3D hero (Three.js / react-three-fiber, low-poly or glassy objects: a pen drawing a glowing stroke, floating video frames, orbiting style tiles) that degrades to a static render on weak phones; elsewhere clean layered cards with soft depth, generous spacing, clear hierarchy. Not "AI template" (no purple gradient washes, no emoji, no Inter/Roboto). Arabic-first RTL, mobile-first (412×915 primary), also excellent on desktop. Dark and light themes. Fast (Lighthouse mobile ≥ 85 performance, ≥ 95 accessibility).

### Information architecture (Arabic labels)
1. **الرئيسية (landing):** 3D hero + animated logo; «ابدأ مجانًا»; three audience paths as big cards — **التجارة الإلكترونية** (product ads), **صنّاع المحتوى** (explainers, stories, numbers), **الظهور بالصورة** (talking-head with montage around you); live gallery of the 10 styles (each tile plays a real looping preview rendered by our engine); how it works in 4 steps; sample videos; FAQ; footer (About, credits, terms, privacy).
2. **الستايلات:** a page per style: live preview, what it's good for, best formats, sample, «استعمل هذا الستايل».
3. **إنشاء فيديو (the studio wizard)** — clear numbered steps with a sticky progress bar, every step savable:
   1. **الهدف:** ad / explainer / story / numbers / talking-head / free.
   2. **الستايل:** pick one of 10 (or «اختيار تلقائي» — the AI recommends with a reason).
   3. **المحتوى:** upload voice (or record in the browser), upload a talking-head video, write/paste a script, or «اكتب لي السكريبت» from a topic/product (Claude; Darija, MSA, French, English); for ads: product name, photos (1–5, background removal in the browser), price, old price, offer, delivery (58 ولاية), cash on delivery, phone/WhatsApp.
   4. **الإعدادات** (big control, every option with a live preview): duration, aspect (9:16, 4:5, 1:1, 16:9), language, voice-over (none / my voice / AI voice with voice choice & speed), music (mood library generated from the kit's music.py logic, upload, none, volume, auto-ducking), SFX (on/off, intensity), captions (on/off, size, position, keyword colour), pace (calm/normal/fast), accent colour within the style's palette, brand kit (logo, colours, handles) and end card.
   5. **السكريبت والمشاهد:** the script line by line and the scene plan table (as in the kit's PLAN.md: scene, starts at which line, what appears, on which word, motion, SFX) — editable before generating.
   6. **المعاينة والتعديل:** Remotion Player + timeline of scenes and words; per-scene: edit text, replace image, change motion/emphasis word, regenerate; global: accent colour, pace, music; undo/redo; versions.
   7. **التصدير:** MP4 in the browser (720p fast / 1080p HD; 4K if feasible), SRT, cover image, «3 نسخ للإعلان» (hook variants) for A/B tests.
4. **مشاريعي:** grid of projects (IndexedDB), search, duplicate, rename, delete.
5. **هوية علامتي (brand kit):** logo, colours, fonts, handles, default end card.
6. **الإعدادات:** BYOK keys (Claude, ElevenLabs, optional OpenAI/Whisper, optional Google image) each with «كيف أحصل عليه من الهاتف؟» steps; language; theme; data export/clear. Everything works in a clearly labelled demo mode without keys.
7. **المساعدة:** short Arabic guides per feature.
(Accounts, payments and admin come in a later phase — design the UI so they slot in.)

## 4. Video engines — the heart of the product
Each style is a module `src/styles/<id>/`: tokens from STYLE.md, a **scene vocabulary**, Zod plan schema, Claude director prompt (structured output) + a good local no-key planner, Remotion components, a drawable **illustration library** generated as code/SVG (rich enough for everyday topics: health, teeth, food, money, cars & engines, phones & apps, shops, delivery, clothes, beauty, school, sport, family, time, growth, warnings, before/after, Algeria/Maghreb places), and **2 demo projects** you author yourself at top quality (one e-commerce/ad, one content topic). Every style supports 9:16 (redesigned for vertical, not letterboxed), 4:5, 1:1, 16:9.

**Talking-head mode ("الظهور بالصورة")** for every style: the user's own video stays the star — automatic silence/filler cuts, punch-in zooms on emphasis words, layouts (full speaker, speaker top + style panel bottom, split, picture-in-picture, full-screen style cutaways on key ideas), the style's graphics drawn *around* the speaker on the spoken words, captions, music ducking. Browser-side person segmentation (MediaPipe selfie segmentation) for cut-out layouts if feasible.

**E-commerce mode**: product photos become the hero inside any style (e.g. whiteboard draws the product outline then reveals the photo; infographic counts the price; product style tilts it in a glowing card), with offer chips and a WhatsApp/phone CTA.

Rules: deterministic Remotion, word-anchored timing, Arabic rules from the kit's `arabic.md` and our `arabic-rtl-video` skill, correct mixed Arabic/French/number order, no empty frames, text readable, everything inside safe zones.

## 5. Quality gate (blocking)
For each style, before it appears as available:
1. Render its two demos; make stills at ≥ 6 key moments; build an image with each still **side by side with the reference analysis sheet**. Verdict: "same creator?" — fix until yes.
2. Generate a third video on an unrelated topic with the local planner; same check.
3. Talking-head and e-commerce variants of that style render correctly.
4. Automated checks pass: overflow, empty frame, Arabic letter splitting, bidi order, on-screen time ≥ reading time, sync drift ≤ 1 frame, safe zones, contrast.
Record verdicts + image paths in `docs/progress.md`. A style that does not pass is shown as «قريبًا» — never shipped weak.
Site gate: Playwright at 412×915 and 1440×900 **on the live URL** for every flow in §3 (landing, style pages, full wizard for each goal, preview edits, export download, projects, brand kit, settings), zero console errors.

## 6. Order of work (fastest path to a complete, professional result)
1. Fresh `rassam` branch: scaffold, CI (build/test/render/contact sheets), Pages deploy, brand + logo, design system, landing shell.
2. Core: timing/words engine, captions, audio (voice, TTS, music library, SFX), Player, export, projects, settings, wizard skeleton.
3. Styles in this order, each through the gate: `product`, `infographic`, `doodle`, `whiteboard`, `plotter`, `stickman`, `chalkboard`, `isometric`, `fake3d`, `map-journey`. Talking-head + e-commerce variants as each style lands.
4. Full polish pass of every page (frontend-design), empty/loading/error states in clear Arabic, performance, accessibility.
5. Final gate on the live URL, then the final report.

## 7. Done =
The live URL serves Rassam with all sections of §3 working on a phone, every style that passed the gate available (goal: all 10), demos for each, talking-head and e-commerce flows working, exports downloading. At the very top of `docs/progress.md` on branch `rassam`: a short report in simple Arabic (link, what's ready, how to make a first video, how to add keys from the phone, known limits).
