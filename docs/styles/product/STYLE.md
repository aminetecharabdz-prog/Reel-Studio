# STYLE.md: Neon Product Launch

Style id: `product` · Reference: 40.0 s, 1280×720 @ 30 fps, SFX only (no voice, no music).
All pixel values are normalised to a **1920×1080** frame (reference px × 1.5) unless stated. Section 4.4 gives the
redesign rules for 9:16, 4:5 and 1:1.
Analysis sheet for side-by-side checks: `docs/styles/product/ref-sheet.jpg`.

---

## 1. Overall feeling

A premium software-launch promo: near-black space with a soft violet-blue-orange glow dome rising from the bottom,
huge Arabic words that arrive out of blur and shrink into sentences, a neon prompt bar, a real product UI floating in
3D, and sudden flips into a clean lavender-white world. It feels fast, confident and expensive — every second a new
beat, every beat sharp. Recognisable at a glance by **the coloured glow dome at the bottom of a black frame**, **giant
white words entering from blur**, and **gradient-filled accent words (violet, or pink→orange)**.

## 2. Colours

| Name | Hex | Share (approx.) | Use |
|---|---|---|---|
| Night background | `#05050A` (measured `#06050A`, `#07060B`) | 38 % | Dark sections |
| Deep violet shadow | `#171125` / `#2D1F4A` | 22 % | Upper falloff of the glow, UI panels |
| Glow violet | `#6C3BFF` (measured `#6335DE` at bottom centre) | 8 % | Centre of the glow dome |
| Glow blue | `#2F5BFF` (measured `#3B39C1` bottom-left) | 4 % | Left side of the dome |
| Glow magenta | `#D946EF` (muted in frame to `#6B3082`) | 3 % | Right-centre of the dome |
| Glow orange | `#FF6A1A` → `#FF8A3D` (in frame `#542633`, low) | 1–2 % | Bottom-right corner ember; flares on "send"/click |
| Violet light | `#A88BFF` | 3 % | Accent words, caret, ring strokes, wordmark last word |
| Violet deep | `#6C3BFF` | — | Gradient end, orb core, logo icon |
| Text white | `#F5F3FF` (measured `#F5F3FE`) | 23 % in dark parts | Hero words, UI text |
| Text muted | `#8B88A6` | 2 % | Taglines, secondary UI text, ghost list items |
| Light background | `#F8F7FF` (measured `#F8F6FF`) | ~25 % of runtime | Light sections |
| Light glow | `#BB9BFE` | light sections | Lavender glow dome at the bottom of light sections |
| Ink on light | `#1C1A2E` | light sections | Headlines on white |
| Ring lavender | `#7C6CF8` / `#CFC8FF` / `#ECE8FF` | light sections | Concentric pill/orb rings |
| Success green | `#34D399` | UI only | Completed steps/progress in the product window |

**Accent rule:** in any line, only **one** word (the key word) carries a gradient fill. Violet gradient
`#A88BFF → #6C3BFF` is the default emphasis; the warm gradient `#D946EF → #FF6A1A` is reserved for the single most
important emphasis of a section (≤ 2 times per video). Orange as a solid colour appears only as small sparks (logo
sparkle, click flare, glow ember). Never more than 2 accent words on screen.

## 3. Typography

The reference uses a modern geometric Arabic sans (weights 300/400/500/700) with matching Latin. Closest installed:
**Readex Pro** for everything (it has Arabic + Latin in one design); **Alexandria** is the alternate when a heavier,
more geometric hero is wanted.

| Role | Reference look | Font | Weight | Size @1080p | Line-height |
|---|---|---|---|---|---|
| Hero word (1 word, full screen) | Geometric sans, heavy, open counters | **Readex Pro** (alt. Alexandria) | 700 | 320 px (word ≈ 570 px wide) | 1.35 |
| Kinetic line (after shrink) | Same | **Readex Pro** | 600 | 96 px | 1.35 |
| Section headline (2–4 words) | Same, gradient key word | **Readex Pro** | 700 | 120 px (dark) / 96 px (light) | 1.35 |
| Prompt bar text | Medium, white | **Readex Pro** | 500 | 54 px | 1.4 |
| Wordmark / product name | Bold sans, last word violet | **Readex Pro** (Latin) or **Space Grotesk** for Latin-only names | 700 | 96 px | 1.2 |
| Tagline | Light, muted | **Readex Pro** | 300 | 36 px, `#8B88A6` | 1.4 |
| Pill / orb word | Bold, violet | **Readex Pro** | 700 | 72 px | 1.35 |
| UI text (inside window) | Small sans | **Readex Pro** | 400–500 | 14–22 px (at window scale 1) | 1.4 |
| Numbers, %, URLs, code | Tabular | **IBM Plex Mono** (URLs/code), Readex Pro tabular for big % | 500 | 28 px URL; % up to 120 px | 1.2 |
| Ghost background word | Ultra-wide caps / heavy | **Readex Pro** | 700 | 360 px, `#FFFFFF` @ 0.04 | 1.0 |

Rules: no `letter-spacing` on Arabic; reveal by blur/opacity per **word**, never per letter. Gradient text uses
`background-clip:text` with padding + equal negative margin (0.15 em) so dots and descenders (ي، ج، ق) are not cut.

## 4. Composition

### 4.1 Margins
- Safe area 16:9: 120 px left/right, 96 px top/bottom. Text never closer than 120 px to the edge.

### 4.2 Positions
- Centre stage: hero words, lines, pills, orbs are **centred horizontally**, vertical centre at **y = 50–54 %**.
- Light-section headline sits at **y = 26 %** above a pill/orb centred at **y = 58 %**.
- Glow dome: an ellipse centred at (50 %, 115 %) with radius 75 % W × 55 % H; visible top of the glow at ~y = 55 %.
- Prompt bar: 192 px tall, pill radius 96 px; starts zoomed so the bar runs off the left edge; at rest it is
  1180 × 120 px centred (after the camera pulls back), send button at the left end (RTL end of line).
- Product window (3D): occupies 70–85 % of frame width, right side nearer the camera; rim glow spills 40–60 px around.
- Wordmark: icon (132 px hexagon) + name, centred as a group at y = 47 %; tagline 64 px below.

### 4.3 Density
- One idea per frame. Dark sections: 1–4 words. Light sections: 1 headline + 1 object.
- 55–70 % of the frame is empty black (or white). The glow dome takes the bottom 40–45 %.
- Reading direction RTL: lines grow leftward from the first word on the right; lists/marquees move right→left.

### 4.4 Redesign per aspect ratio (never letterbox)

| Aspect | Hero word | Kinetic line | Glow dome | Prompt bar | 3D product UI | Card flythrough |
|---|---|---|---|---|---|---|
| 16:9 (1920×1080) | 320 px | 96 px, 1 line | bottom 45 % | 1180×120 rest | landscape window 1500×900 | 3×3 cloud |
| 1:1 (1080×1080) | 260 px | 84 px, ≤ 2 lines | bottom 42 % | 940×110 | window 980×640, tilt 14° | 3×3, tighter |
| 4:5 (1080×1350) | 260 px | 84 px, ≤ 2 lines | bottom 38 % | 960×120 | window 1000×700 or tall app 760×1180 | 2×4 |
| 9:16 (1080×1920) | 240 px (or stack 2 words) | 80 px, ≤ 3 lines, centre y 45 % | bottom 35 % + faint second dome top 10 % at 0.3 | 960×130 at y 50 % | **portrait app screen** 820×1460, `rotateY −16°` `rotateX 8°`, camera pans vertically | single column, cards 760×430 |

- Type scale base = `min(width, height) / 1080`. Hero word must not exceed 86 % of frame width; if it does, reduce
  size, never wrap a single word.
- Keep 300 px bottom and 200 px top free of text in 9:16 (platform UI).

## 5. Recurring elements

| Element | Exact look | When |
|---|---|---|
| Glow dome | 3–4 radial gradients (`radial-gradient(closest-side, c, transparent)`) — blue left, violet centre, magenta right, orange ember bottom-right — each fading to 0 at its own box edge; slow drift ±3 % in x over 6 s; global opacity 0.9 | Every dark frame |
| Light glow dome | single lavender `#BB9BFE` radial, bottom 30 %, opacity 0.7 | Every light frame |
| Blur entrance | word/object from blur 18 px + opacity 0 + scale 1.06 | Nearly every entrance |
| Gradient key word | violet or pink→orange fill, one per line | Every line |
| Ghost echo | headline duplicated above and below (±110 px), opacity 0.18, blur 3 px, like a rolodex | Section headlines on dark |
| Ghost background word | one huge word at 4 % white behind wordmarks | Brand moments |
| Neon pill frame | 3 px gradient stroke (orange → pink → violet → lavender), + same stroke at 14 px blurred 18 px @ 0.6 as glow, + a short white dash "light head" (8 % of perimeter) running ahead while drawing | Prompt/input moments, highlight frames |
| Caret | 4 × 56 px `#A88BFF` bar, blinks with 1.0 s period (on 0.5 / off 0.5) computed from frame | Typing |
| Cursor | Arrow 54 px, fill `#D9CCFF`, 2 px stroke `#2D1F4A`, soft shadow | Click moments |
| Send button | 64 px circle, gradient `#D946EF → #6C3BFF`, white arrow (pointing left for RTL) | Prompt bar |
| Logo icon | Rounded hexagon 132 px, gradient `#7B5CFF → #4B3BFF`, white play triangle, orange 4-point sparkle 24 px `#FF8A3D` at top-right | Brand moments |
| 3D product window | Panel `#0E0B18`, inner cards `#15111F`, 1 px borders `#2A2340`, radius 18 px; traffic-light dots; sidebar; steps with progress bars (`#34D399` done, `#8B6CFF` in progress); preview area; timeline | Product demo |
| Pill with rings | White pill 470×140, 72 px violet word; rings: 36 px `#7C6CF8`, 60 px `#CFC8FF`, 90 px `#ECE8FF` — one ring added per step | Light section counters/comparisons |
| Glass orb | 150 px sphere: radial highlight top-left `#E9DDFF`, body `#8B5CFF`, rim `#3A1FB8`, warm hotspot `#FF6A1A` @ 0.25 bottom-right; halos 360 px `#E6E0FF` and 560 px `#F3F0FF` | Process/marquee moments; finale |
| Orbit rings | 3 concentric 1 px circles `#FFFFFF` @ 0.08, radii 170 / 260 / 380 px, with 4–6 small glass orbs (12–40 px) orbiting | Finale |
| Floating cards | Rounded 14 px thumbnails 400×225 in 3D at varied `translateZ`, 1 px violet rim glow, 22 px label below | Gallery/variety moments |

## 6. Motion vocabulary

Measured from motion strips (0.1 s per frame).

| Event | How exactly | Duration | Curve |
|---|---|---|---|
| Hero word enter | opacity 0 → 1, blur 18 → 0 px, scale 1.06 → 1.0 | 0.3 s | easeOutCubic |
| Hero → line shrink | font-size 320 → 96 px about the line's right edge; following words enter staggered 0.1 s each with blur 12 → 0 | 0.25 s shrink, +0.1 s per word | easeInOutCubic (shrink), easeOutCubic (words) |
| Word/line exit | blur 0 → 16 px + opacity 1 → 0 + x −40 px (toward reading end) | 0.2 s | easeInCubic |
| Key-word emphasis | gradient fill fades in over white, scale 1.0 → 1.04 → 1.0 | 0.3 s | easeOutBack (overshoot 1.4) |
| Neon frame draw | `strokeDasharray` with `pathLength=1`, white light-head leads | 1.0 s | easeInOutSine |
| Typing | word-by-word append (never letter-by-letter for Arabic), ~4 words/s; camera starts ×2.2 at the line's start and pulls to ×1.0 by the last word | per prompt length; pull-back = typing time | easeInOutCubic (camera) |
| Cursor move + click | curved path to target; press scale 1 → 0.85 → 1 (0.12 s); ripple ring 0 → 60 px, opacity 0.8 → 0 | 0.6 s move, 0.4 s ripple | easeInOutCubic, easeOutQuad |
| Glow warm-up on click | orange/pink blob opacity ×2, then settle | 0.5 s up, 0.8 s down | easeOutCubic |
| Logo reveal | icon pops (scale 0.6 → 1, spring); name expands from behind icon (container max-width 0 → full, `overflow:hidden`) pushing icon aside | icon 0.3 s; name 0.5 s | spring {damping 14, stiffness 160}; easeOutCubic |
| 3D window enter | slides up from bottom-right + rotate settles (`rotateX 25° → 14°`, `rotateY −30° → −20°`) | 0.8 s | easeOutCubic |
| Camera on window | slow keyframed drift: `rotateY` ±6°, translate 8 % W, zoom ×1.0 → ×1.25 toward the active UI panel | 4–6 s | smoothed keyframes, easeInOutSine |
| UI internal progress | bars fill, check icons pop (scale 0 → 1), % counter counts | 0.4–0.8 s each | easeOutCubic / spring |
| Dark → light switch | 0.15 s blur-out of dark scene → **hard cut** to light (reverse-suck SFX before) → light content enters from blur | 0.2 s + cut | easeInCubic |
| Light → dark switch | light content fades/blurs out 0.2 s → hard cut → dark headline from blur | 0.2 s + cut | easeInCubic |
| Pill word roll | outgoing word slides up 100 % + blur 6 px; incoming from below; + one new ring springs out | 0.35 s roll; ring 0.4 s | easeInOutCubic; spring {damping 12, stiffness 140} |
| Ghost echo headline | main line from blur; echoes appear 0.1 s later at 0.18 opacity | 0.3 s | easeOutCubic |
| Card flythrough | all cards share one camera `translateZ` (+1200 px total); a card fades to 0 as it passes the camera (z > −150) | 2.5–3 s | easeInCubic for camera |
| Orb marquee | row of words slides right→left one step per beat; word inside orb circle is drawn white via `clip-path: circle()` copy | 0.4 s per step | easeInOutCubic |
| Vertical feature roll | list scrolls up one row; centre item 72 px gradient, neighbours 40 px @ 0.25 | 0.35 s per item | easeInOutCubic |
| Orbit finale | orbs orbit (periods 3–5 s), then converge into icon with a white flash (0.1 s) | 2.0 s orbit + 0.6 s converge | linear orbit; easeInCubic converge |

## 7. Rhythm

- Shots: 4 hard cuts in 40 s (6/min), mean 8 s, median 5.2 s, shortest 4.2 s — but inside each shot a new beat lands
  **every 0.8–1.5 s**.
- Stillness 49 %: moves are fast (0.2–0.35 s) and then hold crisp; nothing floats aimlessly except the glow.
- Words on screen: 1 (hero) → 3–5 (line) → 1 (hero). Max 8 words except the prompt bar (≤ 14).
- Motion follows **word by word**: each spoken/key word triggers an entrance; sentence ends trigger the shrink/exit.
- Sound onsets 121 per minute — the edit is driven by hits.

## 8. Texture and finish

- Grain: very subtle, opacity 0.03, monochrome, static seed per scene (prevents gradient banding on the glow).
- Glow: dome blur effectively infinite (radial gradients, no edges); neon strokes have 18 px blur @ 0.6; window rim glow
  40 px blur @ 0.7 in pink→violet.
- Shadows: on light sections only — pills/orbs `0 20px 60px rgba(108,59,255,0.18)`.
- Vignette: none (the black is already deep); light sections have none.
- Motion blur: simulated via the blur-in/out (16–18 px); no directional motion blur.
- Depth of field: 3D cards farther than z −900 px get blur 2–4 px.
- No textures, no noise patterns, no illustrations with outlines — everything is glossy UI.

## 9. Sound in the reference

- Voice-over: none (SFX-driven). Our product adds VO; hits must then sit on VO words, not fight them.
- Music: none.
- SFX: sound present 46 % of the time, **≈ 121 onsets/min**: whooshes with words and transitions, a scanning shimmer
  with the neon frame, keyboard ticks while typing, a mouse click, a riser + cinematic hit for the logo and the end,
  a reverse-suck at dark → light cuts, pass-by whooshes for flying cards.

## 10. Do / Don't

**Do**
1. Enter almost everything from blur; exit with blur + slight sideways drift.
2. Keep exactly one gradient key word per line; keep the rest white (dark) or ink `#1C1A2E` (light).
3. Alternate dark and light sections with a hard cut on a strong word (2–4 switches per minute).
4. Build UI and objects in code with real-looking detail (sidebars, progress, check marks) that animate with time.
5. Land each SFX peak exactly on its visual event (pre-roll the file by its peak offset).

**Don't**
1. Don't place text over the brightest part of the glow dome (keep text above y = 60 % in dark sections).
2. Don't animate Arabic letter by letter (typing is word by word); don't use `letter-spacing` on Arabic.
3. Don't use flat solid purple backgrounds — the base is near-black or near-white; colour lives only in glows/accents.
4. Don't add more than one moving object besides the glow in a light section.
5. Don't fade slowly — transitions are 0.2–0.35 s; holds are crisp and still.

## 11. What we will not copy

- The product name, wordmark, logo hexagon design as-is, the repository URL, all Arabic/English copy lines and the
  example prompt text.
- The style thumbnails shown in the flying cards and the window (they are someone else's work/previews).
- The proprietary typeface (we use Readex Pro / Alexandria).
- We take only the look: black + glow dome, blur-in kinetic type, neon prompt bar, 3D UI, light/dark flips, glass orbs.

---

## 12. Engine notes

### 12a. Scene vocabulary

The director plans each video from the user's product/offer copy (any product: an app, a restaurant, a course, a
shop). Product UI scenes accept a generic **mock UI spec** (screens, list items, stats) generated from the content.

| # | Beat type | What appears | Trigger words → action | Min duration |
|---|---|---|---|---|
| 1 | `heroWord` | One giant word from blur on dark + glow | the hook's key word (verb/noun) → enter at word start | 0.8 s |
| 2 | `shrinkLine` | Hero shrinks into a line; following words enter staggered; one gradient key word | each following word → its entrance; key word → gradient | 0.3 s × words + 0.6 s |
| 3 | `promptBar` | Neon pill draws, text types word by word, camera pulls back, cursor clicks send, glow warms | the "ask/command" sentence; last word → click | 2.5 s |
| 4 | `logoReveal` | Icon pops, name expands from behind it, ghost word behind, tagline | brand/product name word → icon; +0.2 s → name | 1.5 s |
| 5 | `product3D` | Floating product window/phone with rim glow; UI steps complete one by one; camera drifts to active panel | each feature/step word → its panel completes | 3.0 s |
| 6 | `lightFlip` | Hard cut to light world with dark headline from blur | contrast words (لكن، الآن، بدل) or section change | 0.8 s |
| 7 | `pillCounter` | Pill with rolling word + growing rings (e.g. before → after values) | each value word → roll + ring | 0.6 s per value, ≥ 2.0 s |
| 8 | `echoHeadline` | Dark headline with ghost echoes above/below, warm gradient key word | a slogan/benefit sentence | 1.5 s |
| 9 | `cardFlythrough` | Many feature/variety cards in 3D, camera flies through with pass-by whooshes | "كل/جميع/أنواع" variety words; list of items | 2.5 s |
| 10 | `orbMarquee` | Glass orb at centre, a row of step words passes; the word inside the orb turns white | each step word in a process | 0.5 s per step, ≥ 2.0 s |
| 11 | `featureRoll` | Vertical list rolling through a centre slot; centre word gradient | each feature word | 0.5 s per item |
| 12 | `statHit` | Big number counting up (tabular) with unit, ring pulse | a number word | 1.2 s |
| 13 | `rapidWords` | Single words hit one after another (each replaces the last from blur) | each short benefit word ("سريع"، "بسيط"…) | 0.5 s per word |
| 14 | `orbitFinale` + `endCard` | Orbs orbit the logo, converge with flash, wordmark + tagline + CTA/URL (mono) | closing/CTA sentence | 3.0 s |

Planning rules: open with `heroWord`; alternate dark/light 2–4 times per minute; never two 3D scenes back-to-back
without a type beat between; end with `orbitFinale`/`endCard`.

### 12b. Illustration approach

- No line drawings. All visuals are **glossy UI and glass primitives** built in code: rounded rectangles (radius
  14–18 px), 1 px borders `#2A2340` on dark / `#E6E1FF` on light, inner panels one step lighter than their parent.
- Shading = gradients and glow only: glass orbs via 3 stacked radial gradients (highlight, body, rim) + one warm hotspot;
  icons via linear gradient `#7B5CFF → #4B3BFF` with a white glyph.
- Product mock UI: built from a schema (sidebar items, step cards with icon + title + progress bar, preview tile, list,
  stat) using Readex Pro 14–22 px; icons from a simple 2 px-stroke rounded line set, white @ 0.8.
- Images (user product photos) go inside a rounded 18 px card with a 1 px violet rim glow and slight 3D tilt — never
  full-bleed.
- Animate-in: from blur (16 px) + opacity + 6 % scale; UI internals tick in with staggered 0.08 s delays; check marks
  pop with spring (damping 12).

### 12c. "Same creator" checklist (verify on stills)

1. Dark frames are near-black `#05050A` with a soft blue→violet→magenta→orange glow dome rising from the bottom edge.
2. Light frames are near-white `#F8F7FF` with a lavender glow at the bottom — no other background colour exists.
3. Typography is one geometric Arabic sans (Readex Pro), big and centred; a single word fills the frame at least once.
4. Each line has one gradient-filled key word (violet, or pink→orange).
5. At least one neon pill/frame with a gradient stroke and outer glow.
6. A floating 3D UI object (window/phone/cards) with a coloured rim glow appears.
7. Text from blur is visible in mid-transition stills (soft-focus words).
8. Glass orbs or concentric rings (pill rings / orbit rings) appear in light or finale scenes.
9. No outlines-and-fills illustrations, no textures, no paper, no hand-drawn marks.
10. Ending: logo icon + wordmark with last word in violet, muted tagline, mono URL/CTA.

### 12d. Sound design

| SFX | When | Notes |
|---|---|---|
| Short air whoosh | Every `heroWord`, each staggered word (softer), every blur exit | Peak at visual 50 % point |
| Shimmer / scan sweep | Neon frame draw | Length = draw time (1.0 s) |
| Keyboard ticks | Each typed word in `promptBar` | Randomise sample per word with `random(seed)` |
| Mouse click | Cursor press | Exactly on press frame |
| Riser → cinematic hit | Into `logoReveal` and `orbitFinale` | Riser ends on the hit frame |
| Reverse suck | 0.3 s before a dark ↔ light hard cut | Ends on the cut |
| Pass-by whoosh | Each flying card crossing the camera | Timed from the same camera easing (inverse) |
| Glass tick / soft pop | Pill ring added, orb word change, check mark | |
| Digital count ticks | `statHit` counting | Thinned to ≤ 12/s |

Target ≈ 100–120 onsets per minute. No music by default; under VO, reduce whooshes on staggered words by 6 dB.
