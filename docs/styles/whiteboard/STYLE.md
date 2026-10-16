# STYLE.md: Living Marker Whiteboard

Style id: `whiteboard` · Reference: `ref/msk/styles/whiteboard/reference.mp4` (1280×720, 30 fps, 23.0 s, one continuous shot, 0 hard cuts) · Analysis sheet: `ref-sheet.jpg` (top: contact sheet 0.5–15.5 s; middle: title being written 1.1–1.8 s; bottom: final pull-back 18.9–19.6 s).

All px values are normalised to a **1920×1080 frame at camera zoom 1.0** (reference px × 1.5). Write every size in the engine as a multiple of the base unit `u = min(W, H) / 1080` so the same numbers work in every aspect ratio (see §4 "Aspect ratios").

---

## 1. Overall feeling

A calm, friendly teacher draws one complete diagram on a clean whiteboard while you watch: a marker with no hand glides in, writes, hatches colour inside shapes, and the camera leans in to each part as it is drawn, then steps back to reveal the whole picture. Every finished drawing keeps living (the sun rotates and blinks, rain falls, arrows flow), so the final wide shot feels like a small animated world, not a static slide. Recognisable at first glance by: off-white board with faint eraser ghosts, chunky rounded Arabic marker lettering, a floating marker prop with a soft drop shadow, diagonal marker hatching inside shapes, and the red curved underline with two orange stars under the title.

## 2. Colours

| Name | Hex | Approx. share | Use |
|---|---|---|---|
| Board centre | `#FAFAF8` | ~45% | Radial centre of board (sample at frame centre) |
| Board edge | `#EFF1EE` | ~25% | Radial outer stop, corners |
| Eraser ghost | `#ECEEEC` | ~8% | Soft horizontal smudge bars, opacity 0.55–0.75 |
| Bezel | `#D5D8E1` | ~5% | Fixed outer frame around board (does not move with camera) |
| Bezel line | `#C9CDD0` | <1% | 2 px inner edge of bezel |
| Ink (black marker) | `#23272E` | 2–4% | Titles, mountain/object outlines, neutral marker |
| Blue marker | `#1E63D6` | 4–6% | Water, sea, cloud outline, cool-concept labels |
| Blue hatch result | `#A4CCFD` | 5% | What blue hatch at 0.55 opacity reads as on the board |
| Red marker | `#E0412E` | 1–2% | Title underline, "heat/rise/warning" arrows and labels |
| Orange marker | `#F28C12` | 1% | Sun / energy objects, title stars (outline) |
| Sun fill | `#FEE593` | 1% | Warm yellow hatch inside orange shapes; star fill `#FFD24A` |
| Green marker | `#2E9B4F` | 1% | Ground, growth, flow-back arrows, "positive" labels |
| Green hatch result | `#A1D5A4` | 1% | Flat band of green hatch (ground strip) |
| Highlight white | `#FFFFFF` | <1% | Inner dashes inside arrows, face highlights |
| Shadow | `#000000` @ 0.18–0.28 | – | Marker drop shadow only |

Palette from analysis: `#F5F5F3 27%, #F9F9F7 20%, #FBFBFA 14%, #DEDADA 14%, #EFEFEE 11%, #FEFEFE 7%, #9DBBDA 5%, #797676 2%` — i.e. the picture is ~93% near-white; colour is used sparingly.

**Accent rule.** Each marker colour carries a meaning and is chosen per concept, not per decoration: black = structure/text, blue = water/cool/calm, red = heat/rising/emphasis (and the title underline, always), orange+yellow = energy/sun/joy (and the title stars, always), green = ground/flow/success. Max **3 marker colours drawing in any single beat**; total frame never exceeds the 5 marker colours. Labels take the colour of the thing they name. Never use colour for backgrounds, boxes or panels — colour only enters as marker strokes and hatching.

## 3. Typography

All text is handwritten-feeling but perfectly legible: rounded, heavy, slightly bouncy Arabic with soft terminals.

| Role | Reference look | Font | Weight | Size @1080 (world, zoom 1.0) | Line height |
|---|---|---|---|---|---|
| Big title | Heavy rounded marker-lettering, wide counters, soft ends | **Marhey** | 700 | 76 px (≈ 885 px wide for a 3-word title) | 1.35 |
| Diagram label | Same hand, smaller, coloured to its object | **Marhey** | 700 | 44 px | 1.35 |
| Small note / caption | Same hand, one line max | **Marhey** | 600 | 34 px | 1.4 |
| Numbers | Drawn in the same hand; use Arabic-Indic or Western digits per project setting, never mixed in one video | **Marhey** | 700 | same as role | – |
| Formula / code (rare) | – | **IBM Plex Mono** 600 for Latin symbols only, inside a Marhey line | 600 | 0.9× surrounding | – |

Close-ups (zoom 1.45) make the title appear ~110 px on screen — this is intended; do not shrink type to fit the close-up. Letter-spacing 0 (never letter-spacing on Arabic); line-height ≥ 1.35 (project rule). Text is real HTML/SVG text (letters must join), never per-glyph stroked paths.

## 4. Composition

- **One world, one picture.** The whole video is a single board "world" (equal to the frame at zoom 1.0). Every element is placed in world coordinates so the final pull-back shows a complete, balanced diagram.
- **Safe margins (world):** 96 px left/right, 64 px top, 80 px bottom inside the bezel. Bezel: 15 px wide, colour `#D5D8E1`, 2 px `#C9CDD0` line, inner corner radius 14 px. The bezel is fixed to the screen, not the world.
- **Title:** top-centre at y = 60–150 px (final layout); during its own beat it is written at the world centre-top and the camera is zoomed on it. Underline 40 px below the baseline, 735 px wide, centred.
- **Diagram area:** y = 200–1020 px. Objects arranged as a loop or left→right story in RTL reading order (the story starts at the **right or bottom-right** and progresses leftwards/clockwise; the reference starts at the sea bottom-left because it is a cycle — for a sequence, start right).
- **Element count:** 1 element being drawn per beat; 5–8 objects + 5–7 labels in the final wide shot; never more than ~10 labelled items.
- **Empty space:** ≥ 45% of the frame is plain board in the final shot; ≥ 60% during close-ups.
- **Object sizes (world):** hero objects 260–520 px across (cloud 360×180, mountain 600×270, sea band 690×110, sun Ø150 + rays to Ø260). Labels sit 20–40 px from their object, never overlapping strokes.
- **Reading direction:** RTL. Text is revealed right→left; a sequence of objects is introduced right→left or top→bottom.

### Aspect ratios (redesign, never letterbox)

Base unit `u = min(W,H)/1080`; every size above is ×u. The world is re-laid out per ratio by the director/layout solver, not scaled:

| Ratio | Canvas | World layout |
|---|---|---|
| 16:9 | 1920×1080 | As reference: title top band, diagram as wide loop/row. |
| 1:1 | 1080×1080 | Title top (max width 900 u, wrap to 2 lines if needed); diagram as a compact 2×2 loop. |
| 4:5 | 1080×1350 | Title top 0–220 u; diagram as 2-column, 3-row loop; labels under objects. |
| 9:16 | 1080×1920 | Title top 120–380 u (2 lines allowed, 68 u); diagram as a **vertical** story/loop (objects stacked, arrows run top↔bottom); bottom 260 u kept free of key content (platform UI). Bezel 12 u. Marker prop keeps its length 240 u. |

Camera zoom levels stay the same in all ratios (close-up 1.3–1.45, wide 1.0), so the "lean in" feeling is identical.

## 5. Recurring elements

1. **Marker prop (no hand).** A felt-tip marker drawn in vector: white barrel 230×34 px (world @ zoom 1.0; appears ~330 px in close-ups), coloured cap at the back end (rounded, 46 px long), coloured label band in the middle (blank band — no text/brand), black conical tip 22 px. Held at **‑35°** (tip pointing up-left, tip is the drawing point), barrel colour = current stroke colour. Drop shadow: offset (8, 10) px, blur 6 px, black @ 0.22 while drawing; offset (18, 24), blur 12, @ 0.16 while travelling (it "lifts"). Visible the whole video; it rests near the last drawing at the end.
2. **Eraser ghosts.** 4–6 soft horizontal smudge bars per world, 60–90 px tall, 300–700 px long, fully rounded ends, colour `#ECEEEC` @ 0.6, slight blur 4 px. They move with the camera (they are on the board).
3. **Board light.** Radial gradient `#FAFAF8` (centre, slightly above middle) → `#EFF1EE` (corners), plus one large soft white highlight blob (Ø ~450 px, white @ 0.5, blur 60) in the upper-left quadrant.
4. **Title underline.** Red `#E0412E` freehand stroke 9 px max width, 735 px long, gentle smile curve (sag 10–14 px), tapered both ends.
5. **Title stars.** Two 5-point stars (~32 px), orange `#F28C12` 3 px outline, yellow `#FFD24A` fill, one at each end of the title, top-aligned. Pop in after the underline.
6. **Diagonal hatching.** Every closed shape is filled with back-and-forth diagonal zigzag hatch (angle 60° from horizontal, pitch 18 px, stroke 14 px, marker colour @ 0.55), clipped to the shape. The thin white gaps between hatch strokes must stay visible.
7. **Flow arrows.** Thick wavy or curved arrows (stroke 8–10 px, arrowhead open "V", 28 px) with a **white dashed centre line** (dash 8, gap 10, width 2.5 px) that flows along the arrow forever.
8. **Dotted path.** A thin loop of dots (`#1E63D6` @ 0.7, dot Ø 4 px, gap 10 px) that connects the steps of a cycle; appears in the summary beat.
9. **Character with a face.** One mascot made from the subject (e.g. a droplet, coin, seed): simple shape 50–70 px, two dot eyes + smile in ink, travels along the dotted path in the summary. Objects such as the sun may also have a face (eyes Ø 10 px, smile 4 px stroke) and blink.
10. **Celebration sparkles.** 3 small orange stars (22 px) popping around the mascot when it completes the loop.

## 6. Motion vocabulary

All times at 30 fps; durations measured by counting frames in the motion strips.

| Event | Exactly how | Duration | Curve |
|---|---|---|---|
| Text entry (write-on) | HTML text revealed by a `mask-image: linear-gradient(to left, …)` with a 40 px soft edge moving **right→left**; marker tip follows the mask edge on the text baseline with a ±6 px vertical bob | ≈ 0.075 s per character (title of 16 chars ≈ 1.2–1.5 s; 5-char label ≈ 0.4–0.5 s) | linear position, mask edge soft |
| Word complete | The finished word does a tiny wobble: rotate 0 → 1.5° → ‑1° → 0 and scale 1 → 1.04 → 1 around its centre | 0.25 s | spring (damping 10, stiffness 220, mass 0.6) |
| Text exit | None. Nothing is erased; text leaves only by the camera moving away. | – | – |
| Keyword emphasis | Red underline drawn under it (right→left), then 2 stars pop | underline 0.5–0.7 s; stars 0.3 s each, 0.1 s stagger | stroke: easeInOutSine; stars: spring (damping 12, stiffness 180) overshoot to 1.2 |
| Stroke draw | perfect-freehand stroke grows along the path; `simulatePressure` so width swells mid-stroke and thins at the ends; speed slow-fast-slow | 0.4–0.9 s per stroke (wave line 0.7 s, circle 0.6 s, arrow 0.45 s, ray 0.08 s each) | easeInOutSine on path progress |
| Hatch fill | Zigzag path drawn with `strokeDasharray` sweeping diagonally across the shape | 0.5–0.8 s per shape | easeInOutQuad |
| Marker travel between drawings | Marker lifts (shadow grows, scale 1 → 1.06), glides on a slight arc (sag 30–60 px) to the next start point, lands (shadow shrinks) | 0.35–0.6 s | easeInOutCubic |
| Marker colour change | Barrel/cap recolour happens while lifted, mid-travel | instant, at travel midpoint | – |
| Transition between "scenes" | No cuts, no fades. A camera move on the same board is the only transition. | – | – |
| Camera move (lean-in / pan) | Keyframes of (x, y, zoom) interpolated together; one transform applied to both SVG and HTML layers | 0.9–1.2 s | `Easing.inOut(Easing.cubic)` |
| Camera final pull-back | From last close-up (zoom 1.3–1.45) to zoom 1.0 showing the whole world, centred | 0.9–1.0 s | `Easing.inOut(Easing.cubic)` |
| Camera hold | After landing, the camera is perfectly still while drawing (no drift) | – | – |
| Living loops (after an object is complete) | Sun: rotation 360° / 14 s + eye blink 0.15 s every ~3.5 s. Rain: dashes fall 40 px and fade, 0.6 s loop, staggered. Flow arrows: white dashes travel 18 px/0.3 s. Steam arrows: same dash flow upward. Waves: horizontal phase drift 1 cycle / 2 s. | continuous | linear (real-time, not scaled by the tempo factor `TS`) |
| Mascot journey | Mascot rides the dotted path step to step, small hop (12 px) between steps, pause 0.3 s at each station | ≈ 3 s for a full loop | easeInOutSine per segment |
| Pop-ins (stars, sparkles) | scale 0 → 1.2 → 1, rotate ‑20° → 0 | 0.3 s | spring (damping 12, stiffness 180) |

## 7. Rhythm

- **Shot length:** one continuous shot (23 s). In the engine: one world per video; for videos > 45 s, chain 2–3 worlds joined by a "board slide" (see §12 vocabulary) — never a hard cut.
- **Cuts per minute:** 0.
- **Camera stops (beats):** a new camera target every 2.5–4 s (≈ 7 targets in 23 s).
- **Stillness:** still ~29% of the time (frame change < threshold) — the camera holds while drawing; only the marker and living loops move.
- **Words on screen at once:** title (3–4 words) + 1 new label (1 word) per beat; final shot ≈ 10–12 words total. Labels are 1–2 words, never sentences.
- **Sync:** beat-by-beat with the voice-over (the reference has no VO). Each drawing beat is anchored to the **word ID** of the noun it illustrates: the stroke starts 0.15–0.25 s *before* the word onset so the shape is half-drawn when the word is heard; its label writes on starting at the word end. Camera moves start on the first word of a new sentence.

## 8. Texture & finish

- **Grain:** none visible. If added for compression safety: monochrome noise @ 0.02, static.
- **Glow:** none.
- **Shadows:** only under the marker prop (see §5.1). Drawn strokes are flat.
- **Vignette:** very soft, via the radial board gradient (`#FAFAF8` → `#EFF1EE`, ≈ 4% luminance drop at corners). No dark vignette.
- **Gradients:** board only. All drawn elements are flat colour.
- **Motion blur:** none. Camera moves are slow enough not to need it.
- **Stroke character:** perfect-freehand with `thinning 0.5, smoothing 0.6, streamline 0.5, simulatePressure: true`, round caps; tapered starts/ends (`start.taper ≈ 12 px`, `end.taper ≈ 16 px`).

## 9. Sound in the reference

- **Voice-over:** none (the product will add VO; keep the visual rhythm calm enough for ~2.2–2.8 words/s narration).
- **Music:** none. The product may add a very soft acoustic bed at ‑28 LUFS under VO, optional.
- **SFX:** sound present 70% of the time, **≈ 125 onsets per minute**:
  - marker squeak/scribble loop on every stroke (filtered noise 1.8–7 kHz, amplitude-modulated at 9–14 Hz, with short squeaks) — follows stroke progress, starts/stops with it;
  - a soft click/tick at each completed word;
  - marker cap "snap" at the very end.

## 10. Do / Don't

**Do**
1. Keep every element on one board world; transition only with eased camera moves.
2. Draw everything progressively with pressure-varying marker strokes; nothing just fades in (except sparkles that pop).
3. Fill shapes only with diagonal hatching at 0.55 opacity, clipped to the shape, gaps visible.
4. Colour-code by meaning (§2) and label each object in its own colour.
5. Make every finished object keep living with a small continuous loop.

**Don't**
1. Don't show a hand, a cursor or any UI chrome — only the floating marker.
2. Don't use solid flat fills, gradients, drop shadows or glows on drawings.
3. Don't erase or fade out content; don't hard-cut.
4. Don't place more than one new object per beat or write sentences on the board.
5. Don't use a font other than Marhey for board text, and don't stroke text glyphs as paths (Arabic must join).

## 11. What we will not copy

- The topic (water cycle) and all its words: the title text, the labels for sea, evaporation, condensation, precipitation and run-off.
- The specific drawings composition (sun/cloud/mountain/sea arrangement) as a fixed template.
- The word printed on the marker barrel (our marker band is blank or carries the product's own neutral mark).
- The channel name and any branding from the README.

---

## 12. Engine notes

### (a) Scene vocabulary (beats)

Every beat is a camera target + 1 drawing action. The director picks beats from content; there is no fixed order (only `TITLE_WRITE` first and `PULL_BACK_REVEAL` last are mandatory).

| # | Beat | What appears | Trigger (word anchoring) | Min duration |
|---|---|---|---|---|
| 1 | `TITLE_WRITE` | Camera zoom 1.45 on top-centre; title written R→L in ink, word-complete wobble per word; then red underline + 2 stars | Starts at word 0; each title word reveals on its own word ID | 2.8 s |
| 2 | `OBJECT_DRAW` | One hero object outlined (1–4 strokes), then hatch-filled; label written in object colour | Outline starts 0.2 s before the noun's word ID; label at noun end | 2.0 s |
| 3 | `OBJECT_WITH_FACE` | Same as 2, then two eyes + smile appear (0.3 s) and a blink — makes an abstract idea friendly | Noun word ID; face on next stressed word | 2.4 s |
| 4 | `PROCESS_ARROW` | 1–3 wavy/curved arrows from object A to B (staggered 0.15 s), white dash flow starts; verb label | Verb word ID (e.g. "rises", "moves", "turns into") | 1.6 s |
| 5 | `LABEL_ONLY` | A single coloured label written next to an existing object, small wobble | The term's word ID | 0.8 s |
| 6 | `COUNT_REPEAT` | 3–6 repeated small marks (drops, coins, dots, people) drawn fast in a row, 0.12 s each | Number word or plural noun | 1.2 s |
| 7 | `CONTRAST_PAIR` | Two small objects side by side, red ✗ under one, green ✓ under the other (checks drawn 0.3 s) | "but / instead / not / بصح / ماشي" | 2.4 s |
| 8 | `EMPHASIS_UNDERLINE` | Red underline + 1–2 stars on an existing word; optional circle-around (ellipse stroke 0.5 s) | Stressed keyword ID | 0.8 s |
| 9 | `ZONE_BAND` | A wide hatched band (sea, ground, timeline bar) at the bottom of the world with wavy or straight top edge | Setting/place noun | 1.8 s |
| 10 | `NUMBER_CALLOUT` | A big hand-written number (96 px) in orange/red with a curved arrow to the object it describes | Number word ID | 1.4 s |
| 11 | `MASCOT_JOURNEY` | Dotted loop path appears (0.6 s), mascot rides it through each step, sparkles at the end | Summary sentence ("so…", "وهكذا") | 3.0 s |
| 12 | `PULL_BACK_REVEAL` | Camera eases to zoom 1.0 showing the whole world; all living loops continue; marker rests; cap snap | Last sentence start | 2.5 s |
| 13 | `BOARD_SLIDE` (long videos only) | Whole board world slides left by one world width (1.2 s, easeInOutCubic) to a fresh board with new eraser ghosts | Topic shift / new section | 1.5 s |
| 14 | `CTA_NOTE` | Short 2–4 word note in ink with orange star, bottom of world, underlined in green | CTA phrase | 1.8 s |

Camera rule for planning: each beat declares a world rect; the camera fits that rect at zoom ∈ [1.25, 1.45] with the drawing slightly right-of-centre (RTL lead room); move only when the next beat's rect is not fully visible.

### (b) Illustration approach

- **Construction:** every prop is a list of SVG path strings in world coordinates (single-subpath per stroke; split multi-`M` paths). Strokes rendered via perfect-freehand from points sampled with `getPointAtLength` (clamp to `L - 1e-4`).
- **Stroke widths (world @1080):** outlines 7 px (ink objects, cloud, mountain); bold primary shapes 10 px (sun ring, sea waves 8 px); arrows 9 px; small details (rays 7 px, rain dashes 8 px, face features 4 px); dotted paths 4 px dots.
- **Fills:** only diagonal hatch (60°, pitch 18, width 14, @0.55) clipped to the closed shape; ground/zone bands may be hatch dense enough to read flat (`#A1D5A4`). Faces and highlights in ink/white, no fill gradients.
- **Shading:** none, except "hatch only on the lower/right half" for a 3D hint (as on the cloud close-up). No shadows.
- **Shape language:** rounded, geometric, simple — circle-based sun, 3–4 bump cloud, two-peak mountain with a tiny snow zigzag, wavy lines for liquids. 3–8 strokes per object; recognisable at 80 px.
- **Characters:** a mascot = simple silhouette (drop, coin, leaf, box) + dot eyes + smile; no limbs, or tiny stick limbs at most. Max one mascot per video.
- **Animate-in order:** outline (stroke order: big contour first, details last) → hatch → face → label → living loop starts 0.2 s after label.
- **Library build:** each prop module exports `{ strokes: Path[], hatchRegions: Path[], colour, anchor, labelAnchor, loop?: (t) => transform }` so the director can place/scale it; sizes are world px and scaled per-ratio by the layout solver.

### (c) "Same creator" checklist (verify on stills)

1. Board is off-white with a radial light and 3–6 faint horizontal eraser ghosts; fixed light-grey bezel with rounded inner corners.
2. A hand-less felt-tip marker (white barrel, coloured cap/band, ‑35° angle, soft drop shadow) is visible in every still before the last second.
3. All lettering is Marhey 700, heavy and rounded; the title has a red curved underline and two orange-and-yellow stars.
4. Every filled shape shows diagonal marker hatching with white gaps — no flat fills, no gradients.
5. Strokes have visible width variation and tapered ends (not uniform vector lines).
6. Colours are only from the 5-marker palette, each with consistent meaning; labels match their object colour.
7. At least one object has a face; arrows have a white dashed centre.
8. Composition is airy (≥ 45% empty board) and the last frame is a wide shot of one complete diagram.
9. No cuts, fades or text boxes anywhere.

### (d) Sound design

| SFX | When | Notes |
|---|---|---|
| Marker scribble (procedural) | Every stroke, gated to stroke progress | Band-passed noise 1.8–7 kHz, AM 9–14 Hz, random squeak blips; gain follows stroke speed; ‑18 dB under VO |
| Hatch scribble | Hatch fill | Same generator, faster AM (14–18 Hz), slightly brighter |
| Soft tick/click | Each completed word (title + labels) | 40 ms, ‑20 dB |
| Marker lift "whoosh" | Marker travel > 400 px | very soft air, ‑30 dB (optional) |
| Pop | Stars/sparkles/face appear | short bubbly pop, ‑22 dB |
| Cap snap | Final `PULL_BACK_REVEAL` end | single plastic click |
| Music | Optional | Light acoustic/plucked bed ‑28 LUFS under VO, ducks during scribbles; off by default to match reference |
