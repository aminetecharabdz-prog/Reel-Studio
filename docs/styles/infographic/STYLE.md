# STYLE.md: Keynote Data Morph (`infographic`)

Source analysed: `ref/msk/styles/infographic/reference.mp4` — 1280×720, 30 fps, 28.0 s, 0 hard cuts, SFX only.
All px values normalised to a **1920×1080** frame (reference px × 1.5). Reference sheet: `ref-sheet.jpg`.

---

## 1. Overall feeling

A premium product-keynote reveal of one real statistic: deep black stage, a single glowing shape in the middle, and huge luminous numbers that roll like a mechanical counter. It feels precise, calm and expensive — every number is a little "wow" and every shape *becomes* the next shape (planet → sphere → dot grid → bar → ring → drop → spheres), so the viewer never sees a slide change. Recognisable at a glance by: pure black with a soft blue bloom, gradient-filled glowing numerals with a small `%`, and one glassy object per frame.

## 2. Colours

`palette.json` (frame-wide): `#000000` 29%, `#01090E` 20%, `#03121E` 17%, `#010407` 15%, `#0A2238` 8%, `#3174C6` 5%, `#23456D` 4%, `#93D0EE` 2%. Element colours from pixel sampling + README.

| Name | Hex | ~Share | Use |
|---|---|---|---|
| Stage black | `#000000` | 60% | Background, everywhere |
| Bloom core | `#0A3D91` @ 0.55 → `#03121E` → `#000` | 25% | Radial glow behind the active object (radius ≈ 700 px), follows the object |
| Bloom teal variant | `#0B3A55` → `#01090E` | — | Bloom tint in later beats (bar/ring/drop) |
| Text primary | `#F5F5F7` | 2% | Headlines, active labels |
| Text secondary | `#86868B` | 1% | Eyebrows, inactive legend rows, captions, source line |
| Hairline | `#1C1C1E` | <1% | Legend dividers (1.5 px) |
| Deep blue (category A / "majority") | `#5B9BFF` → `#1239A0` | 5% | Big-majority numbers & dots (e.g. 97.5%); also the 100% sphere |
| Cyan (hero / "the point") | `#C9F4FF` → `#64D2FF` → `#1AA7EC` | 3% | The highlighted value, the hero bar, the drop, active legend values |
| Ice white | `#FFFFFF` → `#8CCBFF` | 2% | Third category (largest neutral share) |
| Indigo-violet | `#A8A6FF` → `#3D57E0` | 1% | Fourth category |
| Muted segment | `#627888` / `#3F4D59` | 2% | De-emphasised ring/bar segments after focus |
| Dimmed object | object colours × 0.25 brightness | — | Things that "lose" (dried planet `#2A2D33`, salt dots) |
| Planet body | `#2F7DE0` → `#1B4FB0`, rim glow `#93D0EE` | — | Dotted globe |

**Accent rule:** cyan (`#64D2FF` family) marks *the one value the sentence is about* — only one cyan focus at a time. Other categories get their own gradient but sit at lower brightness. When focus moves, the previous focus desaturates to Muted segment / Text secondary. Never use warm colours.

## 3. Typography

Reference: humanist-geometric Arabic sans with sturdy weights (IBM Plex Sans Arabic). Digits are Latin (0-9), decimal point `.`, `%` after the number at ~45% size.

| Role | Look in reference | Font (installed) | Weight | Size @1920×1080 | Line height | Colour |
|---|---|---|---|---|---|---|
| Hero number | Very large, gradient fill + glow | **IBM Plex Sans Arabic** (Latin digits) | 700 | 190 px (single hero) / 158 px (with a visual beside it) / 96 px (stat under a bar) / 66 px (row of 4) | 1.0 for the digit row only (not Arabic) | vertical gradient of its category |
| `%` sign | Same font, smaller, baseline-aligned | IBM Plex Sans Arabic | 700 | 0.45 × number size | — | same gradient |
| Headline | Bold, white, short question | IBM Plex Sans Arabic | 700 | 68 px (side) / 60 px (centred top) | 1.4 | `#F5F5F7` |
| Eyebrow | Light, grey, one line above headline/number | IBM Plex Sans Arabic | 300 | 30 px | 1.4 | `#86868B` |
| Label under number | Medium white or grey | IBM Plex Sans Arabic | 500 | 33 px (hero) / 27 px (small) | 1.4 | `#F5F5F7` (active) / `#86868B` |
| Legend row | Medium, values on the far side in Latin digits | IBM Plex Sans Arabic 500 + values 700 | 500/700 | 30 px | 1.4 (row pitch 76 px) | active `#F5F5F7` + value cyan; inactive `#86868B` @ 0.6 |
| Equation line | Bold white with the result in cyan | IBM Plex Sans Arabic | 700 | 45 px | 1.4 | `#F5F5F7` + `#64D2FF` |
| Source line | Small, grey | IBM Plex Sans Arabic | 300 | 21 px | 1.4 | `#86868B` @ 0.8 |
| Mono (optional data tags) | — | IBM Plex Mono | 500 | 24 px | 1.35 | `#86868B` |

No letter-spacing on Arabic; digits use `font-variant-numeric: tabular-nums` so counters don't jitter. Numbers are isolated LTR runs inside RTL text (`<bdi dir="ltr">`).

## 4. Composition

- **Margins:** 192 px left/right (text right edge at x ≈ 1770, start at ≈ 150–250), 150 px top for headlines (eyebrow baseline y ≈ 180, headline y ≈ 270).
- **Two layouts only:**
  1. **Split** — visual centred at (620, 540) on the left half, text column right-aligned at x = 1770 (RTL start side) in the right 40%.
  2. **Centred** — visual centred at (960, 600–620); headline block centred on top (y 140–240); value labels in a row under the visual.
- **Elements per frame:** 1 visual + 1 text block (eyebrow + number/headline + label). Max 4 numbers (only in the final comparison row).
- **Empty space:** 65–75% of frame is black/bloom.
- **Visual sizes:** dot grid 566 px square (10×10 dots, Ø 45 px, pitch 58 px); bar 1400×111 px fully rounded; ring outer Ø 510 px, stroke 66 px; drop 160 px tall inside concentric discs Ø 525 / 325 px; comparison spheres Ø 300 / 190 / 105 / 50 px (log-scaled) with 30 px arrow glyphs between.
- **Reading direction:** RTL for text; data flows right→left (largest on the right, ending at the smallest on the left), arrows point left.

**Other ratios (redesign, not letterbox):**
- **9:16 (1080×1920):** stack instead of split: eyebrow/headline block top (y 260–480, right-aligned at x = 990, headline 72 px), visual centred at (540, 960) scaled to 80% of width (grid 760 px, ring Ø 700, bar becomes **vertical-friendly**: keep horizontal at 900×96 px), number block below the visual (hero number 200 px). Comparison row → 2×2 grid or vertical column of spheres with arrows pointing down. Keep the bottom 22% free of essential text (platform UI).
- **4:5 (1080×1350):** like 9:16 but visual 70% width at y ≈ 640, number 170 px.
- **1:1 (1080×1080):** Centred layout only; headline 56 px top, visual 55% width, number 140 px under it; legend reduced to the focus row + 2 neighbours.
- **16:9:** as specified above.

## 5. Recurring elements

1. **Radial bloom** behind the active visual: radius 700 px, `#0A3D91` @ 0.55 centre → 0, slowly re-centres on the next object (0.8 s easeInOutCubic).
2. **Rolling counter numbers** — one vertical 0–9 strip per digit, clipped; gradient via `background-clip: text`; soft glow (`text-shadow 0 0 24px` of the mid gradient colour @ 0.45). Mask must be padded ≥ 30 px so the glow is **not** clipped into a visible rectangle (reference flaw at 23.5 s — do not reproduce).
3. **Glass spheres** — radial gradient body + 2 inner soft reflections + elliptical top-left specular (`#FFFFFF` @ 0.55, 40% of radius) + 1.5 px rim light `#C9F4FF` @ 0.5 + outer glow 30 px.
4. **Dot grid (unit chart)** — 10×10 glossy dots; each dot = 1%. Highlighted units light up to cyan with glow; the rest dim to `#1239A0` @ 0.6.
5. **Pill bar** — fully rounded, segments with 2 px black gaps, each segment its category gradient with a top inner highlight (1/3 height, white @ 0.25).
6. **Ring / donut** — `strokeDasharray` arcs, stroke 66 px, butt joins between segments (2 px gap), focus segment has a wider (90 px) blurred under-stroke @ 0.35.
7. **Leader callout** — 1.5 px vertical line + a pill outline around a sliver segment, with a small number above (for values < 3%).
8. **Legend list** — rows with a 9 px dot, label (right), value (left, Latin), hairline divider; active rows white/cyan, inactive grey @ 0.6.
9. **Concentric discs** — 2 discs `#0E2A40` @ 0.35 and @ 0.5 behind a symbol + an ellipse "ripple" 330×50 px, 1.5 px `#64D2FF` @ 0.4 at its base.
10. **Dotted globe** (optional opener) — orthographic sphere of land dots (Ø 4 px, spacing 14 px), atmosphere rim glow 12 px `#93D0EE` @ 0.6, night-side shadow.
11. **Starfield** — 1 px dots @ 0.15–0.35, ~80 per frame, static (only in "space" beats).
12. **Source line** — always in the final beat, centred bottom (y ≈ 995).

## 6. Motion vocabulary

Measured from `motion/` strips (0.1 s per frame).

| Event | Exactly how | Duration | Curve |
|---|---|---|---|
| Text line in | line inside `overflow:hidden`, translateY 70% → 0, opacity 0 → 1, blur 8 → 0 px; lines stagger 0.12 s | 0.55 s | easeOutExpo (`cubic-bezier(0.16,1,0.3,1)`) |
| Text out | opacity 1 → 0 + blur 0 → 6 px, no movement | 0.30 s | easeInQuad |
| Counter roll | each digit column scrolls to its value; digit at position *i* from the left does `10 × i` extra turns, so units spin fastest; `%` fades in with the first digit | 0.9–1.1 s | easeOutCubic (progress), digits blurred 2 px while moving fast |
| Number highlight | a settled number brightens (+15% lightness) and glow 0.45 → 0.8 then back | 0.4 s | easeInOutSine |
| Focus shift / dim | non-focus items go to 0.25–0.35 opacity and desaturate | 0.4 s | easeOutCubic |
| Object morph (shape→shape) | geometry interpolates (sphere→particles→grid; bar→arc→ring; ring→drop; drop→spheres) with no cut | 0.7–1.0 s | easeInOutCubic |
| Particle scatter → grid | particles start at random points inside the source shape (`random(seed)`), fly to grid slots with **diagonal stagger** (delay = (row+col)·0.02 s) | 0.8 s total, 0.4 s each | easeOutBack (1.2) |
| Units fly to bar | highlighted dots arc (40 px lift) into the bar's start; bar grows from 0 to full width as they land | 0.4 s fly + 0.6 s grow | easeInOutQuad / easeOutCubic |
| Bar split | segment boundaries slide out from the start edge, labels counter-roll under each | 0.8 s | easeOutCubic |
| Zoom into sliver | bar's domain animates from [0,100] to [0,v] logarithmically; segments recompute geometry (no stretched caps) | 1.2 s | easeInOutCubic on log(domain) |
| Bar → ring bend | arc of constant length; radius goes from ~20× ring radius down to final radius (log interpolation) | 0.8 s | easeInOutCubic |
| Ring segment draw | `strokeDashoffset` sweep clockwise, segments sequential with 0.06 s stagger | 0.8 s | easeOutCubic |
| Planet rise / pull-back | globe rises from bottom edge (top third visible), then camera pulls back to the full globe drifting to the right while rotating | 0.8 s rise; 1.5 s pull-back | easeOutCubic |
| Camera | gentle constant drift: scale 1.00→1.03 over each beat; bloom follows | continuous | linear / easeInOutSine |
| Final spheres | spheres appear right→left, each scaling 0→1 from its left neighbour's position, arrows fade in between | 0.45 s each, 0.2 s stagger | easeOutBack (1.3) |

## 7. Rhythm

- **Shot length:** one continuous shot (28 s); visual beats of 3–5 s (planet 4 s, sphere 2 s, grid 4 s, bar 6 s, ring 5 s, drop 4 s, final 4 s).
- **Cuts per minute:** 0; beat changes ≈ 15/min.
- **Stillness:** 60% of frames near-still — each beat settles and holds ≥ 1.2 s so the number can be read.
- **Words on screen:** 2–12 (eyebrow + headline + legend); one number in focus at a time.
- **Sync:** sentence-by-sentence for text; numbers land (counter settles) exactly on the spoken number's word-ID; morphs start on the connective word ("but", "of those", "only").

## 8. Texture & finish

- **Grain:** none visible (keep ≤ 0.02 if used, to avoid banding in blacks only).
- **Glow:** numbers `text-shadow` 24 px @ 0.45; glass spheres outer glow 30 px @ 0.5; focus ring/bar segment glow 0.35; bloom (see §5).
- **Shadows:** none (black stage).
- **Vignette:** implicit — bloom centre vs pure black edges.
- **Gradients:** every filled shape and every number has a 2–3 stop gradient (light top → saturated bottom).
- **Blur:** text in/out blur 8 px; moving counter digits 2 px; dimmed objects 0.
- **Dither:** add 1-bit dither or 0.015 noise to the bloom only, to avoid 8-bit banding in compression.

## 9. Sound in the reference

- **Voice-over:** none (text-only). In-product VO is fine; numbers then land on spoken digits.
- **Music:** none.
- **SFX:** synthesised, ~94 onsets/min, sound in 41% of the time: soft airy swells on beat changes, whooshes under morphs, rapid mechanical ticks while counters roll, a pour sound when units fly into the bar, a single drop "plink" on the drop beat.

## 10. Do / Don't

**Do**
1. Build every beat around **one** real number with its source; show the source on the final beat.
2. Morph the previous visual into the next one — never cut or wipe.
3. Roll numbers digit-by-digit with Latin digits and a small `%`; let them settle and hold.
4. Keep a single cyan focus; dim everything else.
5. Keep it on pure black with a soft blue bloom following the active object.

**Don't**
1. Don't use warm colours, multiple simultaneous accents, or pie-chart rainbows.
2. Don't put more than one visual or more than one hero number on screen (except the final comparison row).
3. Don't use bouncy cartoon easing on text, or text that types letter by letter.
4. Don't clip glows with hard rectangles (pad masks), and don't stretch rounded caps when zooming bars.
5. Don't invent numbers — if the topic has no data, this style must not be chosen (or the director must request a sourced figure).

## 11. What we will not copy

- The reference's topic (Earth's water distribution), its Arabic sentences and its specific figures.
- The named data agency and channel names; any brand marks.
- We keep only the visual language: black stage, counter numbers, glass objects, morph chain.

---

## 12. Engine notes

### (a) Scene vocabulary

Each video is a morph chain of 4–7 beats; each beat = one visual primitive + one text block. Word triggers are word-IDs; durations are minimums including the ≥ 1.2 s hold.

| # | Beat type | What appears | Trigger word | Min duration |
|---|---|---|---|---|
| 1 | **Hero Stat** | Huge counter number (190 px) + eyebrow + label, centred or split with a small symbol | the spoken number | 2.5 s |
| 2 | **Globe / Big Body Rise** | A dotted sphere (planet, world, cell, ball) rises from the bottom edge; first stat above it | topic noun | 3.0 s |
| 3 | **Glass Sphere** | All of a quantity gathered into one glossy sphere (100%) | "all / total" | 2.0 s |
| 4 | **Unit Grid** | Sphere bursts into a 10×10 dot grid; N units light cyan; two numbers stacked on the text side | "out of every 100" / a percentage | 3.5 s |
| 5 | **Units → Bar** | Highlighted units fly into a pill bar that grows | "of those / only" | 2.0 s |
| 6 | **Bar Split** | Bar divides into 2–4 categories with counter labels below; leader callout for tiny slivers | "split / divided / goes to" | 3.0 s |
| 7 | **Zoom Into Sliver** | Bar re-scales log-domain so the tiny slice fills the bar | "but that tiny part" | 2.0 s |
| 8 | **Bar → Ring + Legend** | Bar bends into a donut; legend list on the side; focus segment glows; number inside the ring | "how is it shared" | 4.0 s |
| 9 | **Symbol Spotlight** | One symbol (drop, coin, person, leaf…) on concentric discs + hero number + "if it were 100 X…" equation line | "in other words / imagine" | 3.5 s |
| 10 | **Comparison Row** | 2–4 glass spheres shrinking right→left with arrows and value labels; headline on top | conclusion sentence | 3.5 s |
| 11 | **Versus Bars** | Two horizontal bars (stacked) growing to compare A vs B, values at their ends | "compared to / versus" | 2.5 s |
| 12 | **Timeline Count** | A single number counting through years along a thin glowing line with ticks | year / "since" | 3.0 s |
| 13 | **Source Card** | Final headline + comparison stays, source line fades in at bottom | end | 1.5 s |

Rules: start with #1 or #2; every beat-to-beat change is a morph listed in §6; exactly one cyan focus per beat; always end with #13 (source).

### (b) Illustration approach

- **No outlines.** All shapes are fills with gradients + glow; lines exist only as hairlines (1.5 px) in legends/callouts and as the ring stroke (66 px).
- **Glass objects:** radial gradient (`offset 0 → light`, `0.7 → mid`, `1 → dark`) centred at (35%, 30%); inner reflection = blurred ellipse @ 0.25 rotating slowly (12°/s); specular ellipse top-left; 1.5 px rim light. Same recipe for spheres, drops, dots, coins.
- **Symbols** (drop, person, coin, leaf, house, bolt…): simple single-path glyphs, ≤ 6 anchor points per curve segment, filled with the cyan gradient, one white highlight stroke inside (4 px @ 0.6, rounded caps).
- **Data shapes** are generated from numbers, never drawn by hand: grid from counts, bar widths from %, ring arcs from %, sphere radii from `r ∝ log10(value)` (clamped min 25 px).
- **Animate-in:** shapes come from the previous shape (morph) or from particles; only the first beat may fade/scale in (scale 0.92→1 + opacity, 0.6 s easeOutCubic).
- **Dimming:** "lost" categories go to 25% brightness + 60% desaturation, never disappear abruptly.

### (c) "Same creator" checklist (verify on stills)

1. ☐ Background is pure black at the edges with a soft blue radial bloom near the active visual.
2. ☐ Each still has exactly one visual object and one text block (except the final comparison row).
3. ☐ The main number is ≥ 150 px (16:9), gradient-filled, glowing, Latin digits, with a smaller `%`.
4. ☐ Above every big number or headline there is a small grey eyebrow line.
5. ☐ Exactly one element is cyan-focused; others are dimmer.
6. ☐ Objects look glassy (specular highlight + rim light), never flat or outlined.
7. ☐ Font is IBM Plex Sans Arabic in 300/500/700 only; no other family visible.
8. ☐ Consecutive stills show related shapes (one transforms into the next), never unrelated layouts.
9. ☐ The final still shows a source line at the bottom.
10. ☐ No glow is clipped by a visible rectangle; no stretched rounded caps.

### (d) Sound design

No music by default (optional very soft low pad at −30 LUFS under VO).
- **Beat change / text in:** soft airy swell (filtered noise, 0.5 s, −24 dB).
- **Morph:** smooth whoosh matched to morph duration (0.7–1.0 s), pitch rising for growth, falling for shrink.
- **Counter roll:** rapid mechanical ticks (one 3 ms click per digit change of the fastest column, capped at 30/s), ending with a slightly louder "settle" tick.
- **Particles → grid / units → bar:** granular sparkle / pour texture for the flight time.
- **Focus highlight:** tiny glassy ping (sine 1.8 kHz, 0.15 s).
- **Symbol spotlight:** a single "plink" (drop, coin, etc. matched to the symbol).
- **End:** soft low swell under the comparison row, then silence for the source line.
Target density 70–95 onsets/min, all anchored to word-IDs.
