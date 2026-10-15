# Product Spec — AI Motion-Graphics Reel Studio

> Working name: **the Studio** (the owner will choose the final brand name later; keep the name in one config constant so it can be changed in one place).
>
> UI language: **Arabic first (RTL)**, with Algerian Darija + French/English words mixed in speech. English UI is a later addition — build i18n-ready from day one.

---

## 1. What we are building

A web app (runs in Chrome) that turns a voice recording, a talking-head video, or product media into a **finished, professional vertical reel** with motion graphics, perfectly synced captions, visuals that appear exactly when the words are spoken, sound design, and an end card.

Three creation modes:

| Mode | Input | Output |
|---|---|---|
| **A. Motion Graphics** | Voice recording (MP3/WAV/M4A) or video (MP4/MOV, audio is extracted) + optional "idea" note + optional images | Full motion-graphics reel: kinetic typography, illustrations, icons, charts, generated images, captions |
| **B. Product Ad** | Product photos/clips + product info (name, price, offer, delivery, phone) + voice OR a script to be voiced later | Paid-ads-ready reel (Facebook/Instagram/TikTok): hook → problem → product → benefits → price/offer → CTA, with price badges, delivery badges, etc. |
| **C. Talking-Head Edit** | A video of a person talking | Professionally edited version of *their own footage*: silence/filler cuts, punch-in zooms, split screens, B-roll/graphic overlays, captions, sound design |

### Competitive bar
A competitor ("Make it") already does a template-like version of this. We must be clearly better on:
1. **No templates / no repetition** — every video's look is designed from its own topic (see §5).
2. **Frame-accurate sync** — captions and visuals are anchored to word timestamps (see §6).
3. **Openness** — any color, any font (incl. uploaded fonts), any style, free-text art direction, reference images.
4. **Editability** — edit/regenerate a single scene instead of re-generating the whole video.
5. **Automatic QA** — the system detects and fixes visual mistakes before the user sees them (see §8).
6. **Cost per video** — the competitor shows ~$4.6–$7.5 per video. Target **< $1.50** for a 60 s reel via asset reuse, caching, and generating images only where they add value.

---

## 2. Tech stack (decided)

### 2.0 Hard constraint: the owner works from a PHONE
The owner has no computer available while this is built. He will test the product **only by opening a public link in Chrome on his Android phone**. Therefore:
- The app must be a **static web app deployed automatically to GitHub Pages** from this repository (`https://<github-user>.github.io/<repo>/`). Every successful build must end with the live site updated and verified.
- **Everything must work inside the browser** in phases 0–4: preview with `@remotion/player`, final MP4 export with Remotion's **client-side renderer** (`@remotion/web-renderer`, stable since 4.0.491; needs WebCodecs → Chrome Android OK). Check its limitations page and design primitives within the supported HTML/CSS subset.
- Mobile-first UI (360–430 px wide is the primary target), works on desktop too.
- Rendering on a phone is slower: offer 720p "fast export" and 1080p "HD export", show progress, keep the screen awake (Wake Lock API), and never lose work if the tab is backgrounded (persist state in IndexedDB).

### 2.1 Stack
- **Vite + React + TypeScript (strict) + Tailwind CSS**, static build, `base` set to `/<repo>/`. Client-side routing must survive refresh on GitHub Pages (copy `index.html` → `404.html` or use hash routing).
- **Remotion** (latest v4): compositions are React components shared by the Player (preview) and the web renderer (export). Install the official agent skills `npx skills add remotion-dev/skills` and follow them (`remotion-best-practices`, `remotion-captions`, `remotion-markup`, `remotion-saas`, `remotion-render`, `remotion-docs`). Look up APIs in the docs; do not guess.
  - Fonts: bundle OFL Arabic + Latin fonts locally and allow uploaded font files; always wait for fonts before rendering.
  - Licensing: Remotion is free for individuals/teams ≤ 3 people; a SaaS beyond that needs the "Automators" plan. Client-side renders send a telemetry event; keep render calls in one module so usage can be counted.
- **Audio processing in the browser:** Web Audio API / `ffmpeg.wasm` only if needed (decode, extract audio from MP4/MOV, loudness normalisation, silence detection, waveform).
- **Local data (phases 0–4):** IndexedDB (via `idb` or Dexie) for projects, media blobs, transcripts, plans, brand kits, fingerprints, cost ledger. Behind a `Repo` interface so it can move to Supabase in phase 5.
- **Validation:** Zod for every AI output and every input.
- **Testing:** Vitest for logic; Playwright (see the `webapp-testing` skill) for end-to-end tests at a **mobile viewport (412×915)** against the built site, including a full generate → export flow with mock providers.

### 2.2 API keys during the owner-test phases (BYOK)
- A **Settings → API keys** screen where the owner pastes his keys; stored only in his browser (IndexedDB/localStorage), never committed, never sent anywhere except the provider.
- Claude API is called from the browser with the official SDK and `dangerouslyAllowBrowser: true` (header `anthropic-dangerous-direct-browser-access`). Use the `claude-api` skill for correct model names, structured outputs and prompt caching.
- If a provider blocks browser calls (CORS) — verify ElevenLabs Speech-to-Text — add a tiny proxy (Cloudflare Worker or Supabase Edge Function) and document the 3-tap setup for the owner; or fall back to in-browser Whisper (`@huggingface/transformers`) for transcription.
- Every screen must work with **mock providers** when no key is present (clearly labelled "demo mode"), so the owner can click through the whole product immediately.
- In phase 5 the keys move server-side (Supabase Edge Functions) and the BYOK screen becomes admin-only.

### 2.3 Deployment (GitHub Pages) — make it work end to end
- Workflow `.github/workflows/deploy.yml`: on push → `npm ci` → typecheck → unit tests → build → deploy to Pages.
- Known pitfall: Claude Code web sessions often push to `claude/*` branches, while the default `github-pages` environment only accepts the default branch. Solve it robustly (e.g. deploy on pushes to `main` and open/merge a PR, or publish the build to a `gh-pages` branch which works from any branch). If a one-time setting is required in GitHub (Settings → Pages → Source), tell the owner exactly which buttons to tap on his phone, then verify.
- After each deploy, fetch the live URL and run the Playwright smoke test against it before telling the owner it's ready.

### AI providers (all behind interfaces in `src/lib/providers/*`, chosen by env vars)
| Job | Default provider | Notes |
|---|---|---|
| Speech-to-text with **word-level timestamps** | ElevenLabs Scribe | Must return per-word start/end. Keep an OpenAI/Deepgram adapter slot. |
| Directing, art direction, scene planning, copywriting, QA | Anthropic Claude API (latest Sonnet for planning, latest Haiku for cheap checks; model names in config) | Use **tool use / structured output** with Zod-validated JSON. Never parse free text. |
| Vision QA | Claude (vision) | Inspects rendered stills. |
| Image generation | Pluggable (e.g. Gemini image / fal.ai Flux / OpenAI) | Only for scenes that need a unique image. Cache by prompt hash. |
| Icons | Iconify (open icon sets) | Thousands of icons, recolorable SVG, zero cost. |
| Music / SFX | Local royalty-free library in `assets/audio` (owner will add files) + user upload | Tagged by mood/BPM/energy. |
| Text-to-speech (later, mode B) | ElevenLabs TTS | Optional voice-over when the user has only a script. |

Keys: BYOK in the browser during phases 0–4 (§2.2), server-side from phase 5. Never commit keys.

---

## 3. User flow

### Step 1 — Project & Brand
- Project name; business/activity type (e-commerce, services, restaurant/café, beauty/health, education, real estate, tech, personal brand, other + free text).
- **Brand kit (saved per user, reusable):**
  - Logo upload → auto-extract a palette (k-means) and suggest 3 harmonious palettes.
  - Unlimited custom colors (hex/picker), or "let AI choose per video".
  - Fonts: any Google Font (Arabic + Latin pairing), or upload `.ttf/.otf/.woff2`. Live preview with the user's own words.
- Video mode: A / B / C.

### Step 2 — Style (all optional, every option has "Auto — AI decides from the topic")
- **Visual style:** Auto, plus a large open gallery (flat illustration, 3D-clay, isometric, editorial/magazine, neo-brutalist, glassmorphism, retro/80s, minimal luxury, hand-drawn/doodle, tech/HUD, collage/cut-out, gradient-mesh, documentary, playful kids…). Styles are *ingredients*, not templates (§5).
- **Free-text art direction** ("dark and cinematic, gold accents, like an Apple ad") + **reference image upload** (Claude extracts palette/mood/composition notes from it).
- **Captions:** style gallery (pill/capsule, block, karaoke highlight, word-pop, outline, gradient, handwritten, boxed keyword…) **plus full custom**: font, size, weight, colors, active-word color, background, position (with platform safe zones), words per line, animation in/out, emphasis rule (keywords get color/scale), or "no captions".
- **Pacing:** Fast (≈1.2–2 s per visual beat) / Normal (2–3 s) / Calm (3–4.5 s) / Auto (follows speech energy).
- **Aspect ratio:** 9:16 (Reels/TikTok/Shorts), 4:5 (Feed ads), 1:1, 16:9. Render the same project in several ratios without re-planning (layouts are responsive).
- **Audio:** sound effects on/off + intensity; background music (library by mood, upload, or none) with **automatic ducking** under the voice; voice loudness normalisation (-14 LUFS target).
- **End card:** handle(s), phone, website, CTA text, logo, QR (optional). Leave blank = no end card.
- **Platform safe zones:** toggle overlays for Instagram/TikTok/YouTube UI so nothing important sits under buttons.

### Step 3 — Studio (media)
- Upload voice/video, or paste a link (later).
- Optional extra media (photos/clips) with optional notes ("use this when I talk about delivery").
- Optional "idea / context" text box: what the video is about, audience, keywords, brand terms.
- **Custom vocabulary** box: brand names, product names, French terms — fed to the transcriber and the transcript fixer.

### Step 4 — Transcript review
- Show the transcript as editable words. Low-confidence words highlighted.
- Edits must **preserve timestamps** (word-level diff → re-align edited words to the original timing; split/merge time proportionally to character length).
- A "Fix with AI" button: Claude corrects obvious transcription errors using context + custom vocabulary, but **never changes the meaning or the spoken words' order** — it only fixes spelling of what was actually said. Show a diff for approval.

### Step 5 — Generate
- Progress screen with real stages (transcribe → plan → design → assets → render → QA) and ETA.

### Step 6 — Editor
- Player preview (Remotion Player) + **timeline of scenes** under it, aligned to the waveform and words.
- Per scene: change text, swap visual, change primitive/layout, regenerate this scene only, adjust in/out by dragging (snaps to word boundaries), change animation.
- Global: change palette/font/caption style/pacing → re-styles the whole video **without** re-planning timing.
- "Make another version" → same audio, new art direction (useful for A/B testing ads).
- Export MP4 (H.264, AAC, 30 fps default, 60 fps option), plus SRT captions, plus thumbnail.

---

## 4. Generation pipeline

```
upload ─► extract/decode audio (Web Audio / ffmpeg.wasm) ─► normalise loudness
       ─► transcribe (words + timestamps + confidence)
       ─► user review / AI fix (timestamps preserved)
       ─► segment speech into BEATS (meaningful units, 1 idea each)
       ─► ART DIRECTOR (Claude): Design DNA for this video (§5)
       ─► SCENE DIRECTOR (Claude): scene plan JSON, every element anchored to word IDs (§6)
       ─► asset resolution: icons (Iconify), user media, generated images (cached), music, SFX
       ─► compile plan → Remotion props (deterministic, no AI here)
       ─► automatic QA: deterministic checks + vision checks on stills (§8) ─► auto-fix loop (max 2)
       ─► instant preview in the Player ─► export MP4 in the browser ─► save/download/share
```

Each stage is a separate step with saved inputs/outputs (IndexedDB), so any step can be retried or edited without redoing earlier steps, and a reloaded tab resumes where it stopped.

### Mode C (talking head) extra steps
- Detect silences (> 350 ms, configurable) and filler words ("euh", "ممم", repeated words); propose cuts; user can toggle. Apply J/L-style micro crossfades on audio to avoid clicks.
- Face/subject position (optional, later) for smart crops and punch-in zooms (1.0 → 1.12 on emphasis words; never two zooms within 1.5 s).
- Layout options per beat: full speaker, speaker + graphic panel (split top/bottom), graphic full-screen with speaker audio, picture-in-picture.

### Mode B (product ad) extra steps
- Claude writes/structures the ad using a proven direct-response arc (hook in first 1.5 s, problem, product reveal, 3 benefits, social proof, price/offer, urgency, CTA). If the user provides voice, the arc is *mapped onto what they said* — never invent claims they did not say.
- Ad-specific primitives: price tag (old/new price), "free delivery / X wilayas" badge, cash-on-delivery badge, stock/urgency counter, feature callouts on product image, before/after, comparison, review stars (only if the user supplies real reviews).
- Generate 3 hook variants for A/B tests on request.

---

## 5. "No templates" — the Design DNA system (core differentiator)

We do **not** ship fixed templates. We ship a **design system of parametric primitives** and let the Art Director compose a unique look per video.

### 5.1 Design DNA (generated per video by Claude, Zod-validated)
```ts
type DesignDNA = {
  mood: string;                    // e.g. "clinical-trust", "street-energy", "warm-family"
  palette: { bg: string[]; surface: string; primary: string; accent: string; text: string; textOnAccent: string }; // contrast-checked
  typography: { display: FontRef; body: FontRef; captions: FontRef; scale: number; weightContrast: "low"|"mid"|"high" };
  layoutGrammar: "centered"|"asymmetric"|"editorial-grid"|"stacked-cards"|"full-bleed"|"split";
  motionLanguage: { easing: "snappy"|"smooth"|"bouncy"|"mechanical"|"elastic"; baseDurationFrames: number; overshoot: number; stagger: number; transitionFamily: string[] };
  background: { kind: "solid"|"gradient"|"mesh"|"grain"|"pattern"|"photo-blur"|"3d-room"; params: Record<string, unknown> };
  illustrationStyle: string;       // used for image-generation prompts + icon set choice
  iconSet: string;                 // Iconify set id
  texture: { grain: number; shadows: "none"|"soft"|"hard"|"long"; corners: number };
  sfxPalette: string;              // e.g. "soft-ui", "punchy", "cinematic"
  seed: number;                    // drives deterministic variation
};
```
- Brand kit values, when given, **override** the DNA (brand colors/fonts win) — the DNA adapts around them.
- Palettes are always run through a contrast checker (WCAG AA for text ≥ 4.5:1; auto-adjust lightness if it fails).

### 5.2 Primitive library (≥ 40, each fully parametric, all RTL-aware, all responsive to aspect ratio)
Text: kinetic headline, word-by-word build, keyword highlight sweep, big number counter, quote card, typewriter, split-flap, text-on-path, stacked list reveal.
Data: bar/line/pie/donut charts, progress ring, comparison (A vs B), timeline, step process, checklist, rating, map pin/route (Algeria map with wilayas available).
Media: image card with masks (circle/blob/arch/tilted), Ken Burns, device mockups (phone/laptop), before/after slider, collage, polaroid stack, product hero with shadow/turntable.
Graphic: icon burst, icon grid, character/illustration scene, emoji/sticker pop, arrows/callouts/annotations, highlighter circles, particles, light leaks, shape morphs, liquid transitions.
Structure: title card, chapter divider, CTA, end card, logo sting.
Ad: price tag, delivery badge, COD badge, urgency/stock, offer ribbon, feature callouts.

Each primitive exposes: content slots, palette/typography from DNA, `enter`/`emphasis`/`exit` animations chosen from the DNA's motion language, and layout variants. **Combinatorics** (primitive × layout variant × motion × background × DNA) is what makes videos unique.

### 5.3 Anti-repetition
- Store a **fingerprint** of each rendered video (DNA + sequence of primitive/variant ids).
- The Art/Scene Directors receive the user's last 10 fingerprints and must stay below a similarity threshold (e.g. Jaccard < 0.4 on primitive sequences; different palette & motion family). Enforced by code — if violated, re-plan with a higher temperature/new seed.
- Within one video: never the same primitive variant in two consecutive scenes; no primitive used more than 3 times unless it's the caption layer.

---

## 6. Timing & sync rules (frame-accurate)

- **Single source of truth:** the word list `{id, text, startMs, endMs, confidence}`. All visual events reference **word IDs**, not seconds. The compiler converts to frames: `frame = Math.round(ms / 1000 * fps)`.
- **Captions:**
  - Group words into lines by phrase/punctuation/pauses; max N words (setting) and max width; never split a line across a scene cut.
  - Active-word highlight starts at the word's start frame and ends at its end frame (or next word's start). Measured drift must be **0–1 frame**.
  - Lines appear 2 frames before their first word and leave at the end of the last word (+ max 6 frames hold if a pause follows).
- **Visuals:**
  - A visual tied to a keyword **enters 3–6 frames before** that word starts (perception anticipation) and finishes its entrance animation by the word's end.
  - Scene cuts snap to word boundaries, preferably inside pauses ≥ 120 ms.
  - Visuals exit when the idea ends (end of the beat), never mid-word.
  - Minimum scene length respects pacing setting; very long beats get internal "emphasis" motion so the screen is never static > 2 s.
- **SFX** are placed on visual events (whoosh on transitions, pop on icon enter, tick on counters), auto-ducked, and never louder than the voice.
- **Music** ducks −12 dB under speech with 150 ms attack / 400 ms release; optional beat-sync of cuts when pacing = Auto.

---

## 7. Arabic / RTL correctness (non-negotiable)

- Every text node uses proper shaping with `dir="rtl"` and `unicode-bidi: isolate` per run; mixed Arabic + Latin (French brand names, numbers, prices) must render in the correct order. Write unit tests with real Darija sentences containing French words and numbers ("الجاكيت ب 3500 DA مع livraison 58 ولاية").
- Numbers: setting for Western (123) or Eastern Arabic (١٢٣) digits; default Western (common in Algeria).
- Line breaking must never split a word; measure text with the actual font before layout (`@remotion/layout-utils` `measureText`/`fitText`).
- Arabic diacritics and kashida must not clip: add vertical padding based on font metrics.
- Animations that go "left→right" in Latin must mirror to "right→left" for Arabic.

---

## 8. Automatic quality assurance

### 8.1 Deterministic checks (run on the compiled plan + layout measurements, before render)
- Text overflow / clipping / out-of-frame.
- Min font size per aspect ratio (captions ≥ 42 px at 1080×1920).
- Contrast ratio ≥ 4.5:1 for text over its actual background.
- Safe zones (platform UI areas) free of text/key visuals.
- Element overlap (bounding boxes) between captions and graphics.
- Caption ↔ audio sync drift ≤ 1 frame; every word appears in captions exactly once (unless captions off).
- No empty frames, no scene shorter than 12 frames, no static screen > 2 s.
- Every referenced asset exists and loads; fonts loaded.
- Audio: voice peaks ≤ −1 dBTP, music ducked.

### 8.2 Vision checks (Claude vision on rendered stills)
- Render 1 still per scene at its "hero" frame + the first and last frame.
- Ask Claude (structured output) to flag: unreadable text, awkward composition, wrong reading order, visual that doesn't match the spoken meaning, culturally inappropriate imagery, broken Arabic shaping.
- Auto-fix loop: send flagged scene + issue to the Scene Director for a targeted fix; re-check; max 2 loops; then surface remaining warnings to the user in the editor.

### 8.3 Test suite
- Unit tests (Vitest) for timing math, caption grouping, transcript edit re-alignment, contrast, bidi.
- A **golden set** of 5 sample audio files (owner supplies) rendered in CI-like script `npm run golden` producing contact sheets for visual review.

---

## 9. Data model (initial)

User, BrandKit, Project, MediaAsset, Transcript (words JSON), DesignDNA, ScenePlan (versions), Render (status, url, cost), Job (type, status, input, output, error, attempts), Fingerprint, CostLedger (per provider call: tokens/seconds/images, $).

Show the **cost of each project** in an admin view (not to end users).

---

## 10. UI / UX quality bar

- Our own distinctive design (do NOT copy the competitor's dark-navy + yellow look). Modern, premium, fast. RTL-native layout.
- Wizard with clear progress, but power users can jump between steps.
- Every option shows a **live visual preview** (fonts render the user's own words, caption styles animate, palettes preview on a mini scene).
- Mobile-friendly (many users are on phones), keyboard accessible, Arabic-first copy written naturally (Algerian-friendly MSA).
- Skeletons and optimistic UI; never a frozen screen during long jobs.

---

## 11. Phases & acceptance criteria

**Phase 0 — Setup + identity + live link.** Vite + React + Remotion + Tailwind scaffold, skills installed, provider interfaces with mocks, IndexedDB repo, BYOK settings screen, lint/typecheck/test scripts, Pages deployment working. Brand identity: choose a professional name, original SVG logo, palette and type (see MASTER prompt). ✅ The public GitHub Pages link opens on a phone and shows the branded landing + app shell; Playwright mobile smoke test passes on the live URL.

**Phase 1 — Core Mode A, end-to-end in the browser.** Upload audio → transcribe → review transcript → Design DNA → scene plan → ~15 primitives → captions (3 styles) → preview → export 9:16 MP4 in the browser. Include 3 built-in **demo projects** (dentist tips, car-engine explainer, phone-holder product ad) with bundled sample voice + precomputed transcripts so the owner can see real results even before adding keys. ✅ A 45–60 s Darija voice note produces a watchable reel; caption drift ≤ 1 frame; zero text overflow; two different topics produce visibly different videos.

**Phase 2 — Depth & uniqueness.** Full primitive library (≥ 40), full style/brand/caption customisation, music + SFX + ducking, end card, multiple aspect ratios, anti-repetition, image generation with caching, QA (deterministic + vision) with auto-fix. ✅ 10 consecutive videos on different topics show no repeated look; QA catches seeded errors.

**Phase 3 — Editor.** Scene timeline, per-scene edit/regenerate, global restyle, versions, exports (MP4/SRT/thumbnail). ✅ Changing one scene re-renders only what's needed; restyle keeps timing.

**Phase 4 — Modes B & C.** Product ad mode and talking-head mode as specified. ✅ A product-photo set + voice produces an ad with price/delivery badges; a talking-head video gets silence cuts, zooms, split-screen and captions.

**Phase 5 — SaaS.** Auth (email + Google), Postgres (Supabase), cloud storage, server-side keys, optional server rendering (Remotion Lambda or a render worker) for long/4K videos, credit-based plans, payments (gateway to be chosen by the owner — must work for Algerian customers, e.g. local card gateway, plus an international option), usage limits, admin dashboard (users, renders, costs, errors), landing page, terms/privacy. ✅ A new user can sign up, pay, generate, and download; admin sees costs per user.

---

## 12. Non-goals for now
No mobile app, no team workspaces, no public template marketplace, no voice cloning.
