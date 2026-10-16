# STYLE.md: Classroom Chalk Proof

Style id: `chalkboard` · Reference: `ref/msk/styles/chalkboard/reference.mp4` (1280×720, 30 fps, 26.0 s, one continuous shot, 0 hard cuts) · Analysis sheet: `ref-sheet.jpg` (top: contact sheet 0.5–14.5 s; middle: cells flying into the big square with live counter 14.7–15.4 s; bottom: final pull-back + chalk returning to the tray 23.7–24.4 s).

All px values are normalised to a **1920×1080 frame at camera zoom 1.0** (reference px × 1.5). Write every size as a multiple of `u = min(W, H) / 1080` (see §4 "Aspect ratios").

---

## 1. Overall feeling

A patient teacher works through one idea on a real green chalkboard: a single stick of chalk, with no hand, writes the title, draws a clean figure, then *proves* the idea visually by moving pieces around until the answer becomes obvious, and finally writes the conclusion with a green tick. It feels tactile and nostalgic — the board grain, the soft chalk halo, falling chalk dust and the wooden frame with its tray — but the logic is crisp and modern. Recognisable at first glance by: dark green grainy board inside a brown wooden frame, a pastel chalk palette (white, butter-yellow, pink, sky-blue, mint), Ruqaa handwriting, and pieces that physically fly from one shape into another while a counter ticks up.

## 2. Colours

| Name | Hex | Approx. share | Use |
|---|---|---|---|
| Board centre | `#3F6357` | ~35% | Radial centre (slightly above middle) |
| Board mid | `#395C50` | ~30% | Main board body (analysis #1 colour, 31%) |
| Board edge | `#2E4C44` | ~15% | Radial outer stop / corners (README range down to `#17302A` for the darkest vignette) |
| Grain dots | `#546F61` / `#87988B` | ~7% | Static chalk-dust speckle across the whole board |
| Wood frame | `#6F4328` | ~6% | Frame top/sides (`#604329` in analysis = frame incl. shading) |
| Tray | `#5A361C` | ~2% | Bottom ledge, slightly darker than frame |
| Eraser | felt `#C6A26F`, base `#3C3B3B` | <1% | Prop resting on the tray, right side |
| White chalk | `#F3F1E7` | 2–3% | Main figures, formulas, neutral text |
| Yellow chalk | `#F6E07A` | 1–2% | Title + underline, results/answers, the "target" shape, counter |
| Pink chalk | `#F4A9BC` | 1% | First quantity (part A), conclusion sentence |
| Blue chalk | `#9AD3F0` | 1% | Second quantity (part B) |
| Mint tick | `#A9E6A2` | <1% | Check marks / "correct" only |
| Cell fills | pink `#F4A9BC` @0.42, blue `#9AD3F0` @0.42 | 2% | Translucent tiles that move (read as `#8E837F` / `#6F9A97` on the board) |

**Accent rule.** White is the default voice. Yellow = the headline and the answer (what we are looking for). Pink and blue = the two ingredients being compared/combined — always used as a pair, each idea keeps its colour for the whole video. Mint appears **only** for a correct/final confirmation (✓). Never more than 4 chalk colours in one video; no saturated or neon colours; nothing pure white `#FFFFFF`.

## 3. Typography

Hand-written classroom Arabic — calligraphic Ruqaa with flat, fast strokes, written slightly unevenly by chalk.

| Role | Reference look | Font | Weight | Size @1080 (world, zoom 1.0) | Line height |
|---|---|---|---|---|---|
| Big title | Ruqaa, compact, sloped baseline feel, yellow | **Aref Ruqaa** | 700 | 72 px (≈ 510 px wide for 2 words) | 1.4 |
| Formula line | Ruqaa letters + big operators, white | **Aref Ruqaa** | 700 | 80 px; operators (`+ = ×`) 1.1× | 1.45 |
| Number line / result | Ruqaa digits, yellow | **Aref Ruqaa** | 700 | 80 px | 1.45 |
| Figure labels (vertex/side letters) | small, white @0.85 | **Aref Ruqaa** | 400 | 30 px | 1.35 |
| In-shape numbers / counter | Ruqaa digits inside shapes | **Aref Ruqaa** | 700 | 44 px (counter 54 px yellow) | 1.35 |
| Conclusion / caption | Ruqaa, pink, one line | **Aref Ruqaa** | 400 | 42 px | 1.4 |
| Superscripts | small raised digit | **Aref Ruqaa** | 700 | 0.55× base, raised 0.45 em | – |

Digits: pick Arabic-Indic (٠١٢…) or Western per project setting and use the same system for exponents too (the reference mixes `٢٥` with Latin `²` — do **not** mix). No letter-spacing; line-height ≥ 1.35. Text is HTML/SVG text revealed by a mask (letters stay joined), with the static grain overlay making it look chalky.

## 4. Composition

- **Fixed frame, moving board.** The wooden frame (top 22 px, sides 27 px, bottom tray 30 px, inner shadow 6 px black @0.35) and the tray props are fixed to the screen; the board content (world) moves under the camera. The grain overlay is also fixed to the screen.
- **World size:** equal to the frame interior at zoom 1.0 (1866×1028 for 16:9). Inner margins: 80 px sides, 60 px top, 80 px above the tray.
- **Final layout (16:9):** figure/proof on the **left-centre** half (x 330–1000 px), title top-right (x 1130–1630, y 90–220) with a yellow underline, formula block centred under the title (y 380–620), tick to the right of the result, conclusion line under it (y 800–840). (RTL logic: the reading block — title → formula → conclusion — sits on the right, the picture on the left.)
- **Element count per beat:** one new item; final wide shot holds 1 figure + 3 text lines + 1 tick (≈ 10–14 words).
- **Empty space:** ≥ 40% plain board in the final shot; ≥ 55% during close-ups.
- **Figure sizes (world):** main figure 240–480 px; grid squares 180–420 px with 3–5 cells per side; cell gap 6 px, cell corner radius 4 px.

### Aspect ratios (redesign, never letterbox)

| Ratio | Canvas | Layout |
|---|---|---|
| 16:9 | 1920×1080 | As above: figure left, text block right. |
| 1:1 | 1080×1080 | Title top-centre; figure centre-left (≤ 520 u); formula + tick below figure; frame 18 u / tray 24 u. |
| 4:5 | 1080×1350 | Title top (y 80–200 u); figure middle (y 260–820 u); formula + result + tick (y 880–1150 u); conclusion above tray. |
| 9:16 | 1080×1920 | Title top 120–300 u; figure 360–1060 u; formula lines 1130–1420 u; tick + conclusion 1460–1600 u; tray at bottom (still visible, 30 u), bottom 220 u above tray free of key content. Frame sides 18 u. Chalk stick keeps 160 u length. |

Camera zoom stays in [1.0, 1.3] for every ratio; the layout solver places items, the camera only frames them.

## 5. Recurring elements

1. **Chalk stick (no hand).** Cylinder 160×26 px (world @ zoom 1.0), rounded ends, one end slightly worn (flat facet), colour = current chalk colour with a 1-px darker edge and a lighter top highlight. Held at **+30°** from horizontal (tip at the upper-left end touching the stroke). Drop shadow offset (6, 8), blur 6, black @0.35 while drawing; offset (16, 22), blur 12, @0.25 while travelling (lifted). Colour switches mid-travel when the next stroke uses another chalk.
2. **Tray props.** Two short chalk pieces (yellow + pink, 60×14 px) lying on the tray at x ≈ 420–545 px, and an eraser (150×28 px, felt `#C6A26F` over dark base `#3C3B3B`) at x ≈ 1560–1710 px. In the outro the active chalk flies down and lands on the tray.
3. **Chalk halo.** Every stroke is rendered twice: a halo 2.2× wider at opacity 0.12 in the chalk colour, then the core stroke.
4. **Board grain.** Static full-frame SVG `feTurbulence` (fractalNoise, baseFrequency 0.85, 2 octaves) → `feColorMatrix` mapped to board-coloured dots (`#546F61`/`#87988B`), opacity 0.35, *above* the drawings (so chalk lines look speckled) but below the chalk prop and frame. Never displacement-mapped.
5. **Board light/vignette.** Radial gradient from `#3F6357` (centre, 45% from top) to `#2E4C44` at the corners, plus 2–3 very faint large erase clouds (white @0.03, blur 80).
6. **Chalk dust.** For the last 14 drawing samples: a particle (Ø 2–4 px, chalk colour @0.55) spawns at the tip, falls with gravity (≈ 900 px/s²) with small x jitter (±12 px), fades out within 0.5 s. Seeded `random()`.
7. **Grid squares.** Square outline in its chalk colour (6 px) with inner grid lines (3.5 px, colour @0.75) dividing it into n×n cells; a number centred inside.
8. **Right-angle / geometry marks.** Small 18 px corner squares, tick marks, vertex letters in white @0.85.
9. **Answer glow.** On completion, the target shape gets an outer glow (yellow, blur 14 px, @0.5) that rises and settles in 0.6 s, then stays @0.15.
10. **Tick.** Mint `#A9E6A2` check mark, 85×64 px, stroke 12 px, drawn in two strokes.

## 6. Motion vocabulary

| Event | Exactly how | Duration | Curve |
|---|---|---|---|
| Text entry (write-on) | Mask with 36 px soft edge moving **right→left**; chalk tip follows the edge on the baseline with ±5 px bob; dust falls behind | ≈ 0.09 s per character (2-word title ≈ 1.3–1.5 s; formula line ≈ 1.0–1.2 s) | linear |
| Word complete | No wobble (chalk is steadier than marker); a single soft tap (chalk lifts 3 px and back) | 0.12 s | easeOutQuad |
| Text exit | None — the board is never erased in-video. | – | – |
| Keyword emphasis | Underline in the line's colour drawn R→L under the word, slight arc (sag 8 px), or colour the answer yellow | 0.5–0.7 s | easeInOutSine |
| Stroke draw | perfect-freehand on sampled points, pressure varies; straight lines are drawn as one stroke per segment (multi-`M` paths split and progress distributed by length) | line 0.35–0.6 s; square outline 0.9 s; grid lines 0.08 s each | easeInOutSine on progress |
| Chalk travel | Lift (shadow grows, scale 1 → 1.05), arc (sag 40 px), land | 0.4–0.6 s | easeInOutCubic |
| Piece flies (proof) | A filled cell leaves its centre in the source square, travels to its target cell centre, rotating to the target's angle, with a 24 px hop at mid-path; on landing a 1.06 → 1 scale settle; the counter increments on each landing | 0.6 s per piece, stagger 0.16 s (25 pieces ≈ 4.4 s) | position easeInOutCubic; hop = sin(π·t); rotation easeInOutSine; settle spring (damping 14, stiffness 200) |
| Counter | Integer equal to the number of landed pieces, in yellow inside the target; each change does scale 1.12 → 1 | 0.15 s per tick | easeOutBack |
| Completion glow | See §5.9 | 0.6 s | easeOutCubic |
| Transition between "scenes" | None; camera pans on the same board | – | – |
| Camera move | (x, y, zoom) keyframes together; content moves under the fixed frame | 0.8–1.0 s | `Easing.inOut(Easing.cubic)` |
| Camera final pull-back | To zoom 1.0, whole board | 0.8–1.0 s | `Easing.inOut(Easing.cubic)` |
| Outro | Chalk flies to the tray, rotates to 0°, lands with a small bounce (8 px) | 0.7 s | easeInCubic + spring settle (damping 12) |
| Idle | Camera perfectly still while drawing; no ambient loops except the glow hold | – | – |

## 7. Rhythm

- **Shot length:** one continuous shot (26 s). For longer videos chain boards with `BOARD_WIPE` (§12) — never a hard cut.
- **Cuts per minute:** 0.
- **Camera targets:** ≈ 6 in 26 s (title → figure → part A/B → target/proof → formula → wide), every 3–5 s.
- **Stillness:** very high — still 82% of the time, mean frame change 0.41%. Motion is concentrated in the chalk tip and the proof.
- **Words on screen at once:** title (1–3 words) + current line; final shot ≈ 10–14 words. Formula lines are short; sentences only for the single conclusion line.
- **Sync:** sentence-by-sentence for camera moves, word-by-word for drawings: a figure part starts 0.2 s before its noun's word ID; each formula symbol is revealed on the word that says it; each proof piece can be bound to a counting word, otherwise the cascade spans the sentence that describes the move.
- **Hold rule:** text stays ≥ 0.3 s × words + 0.6 s before the camera leaves it.

## 8. Texture & finish

- **Grain:** static fractal-noise speckle, opacity 0.35, above drawings (see §5.4). Strong — this is what makes it "chalk".
- **Glow:** chalk halo @0.12 on every stroke; answer glow @0.5 peak → 0.15 hold.
- **Shadows:** chalk prop drop shadow; frame inner shadow 6 px @0.35; tray props' contact shadow 3 px @0.4.
- **Vignette:** via board radial gradient (≈ 25% luminance drop at the corners).
- **Gradients:** board, wood frame (subtle top-lit gradient `#7A4B2E` → `#5E3A20`).
- **Motion blur:** none.
- **Stroke character:** `thinning 0.35, smoothing 0.5, streamline 0.45, simulatePressure: true`, caps round, small tapers (8 px). Edges look dry because of the grain overlay, not because of displacement.

## 9. Sound in the reference

- **Voice-over:** none (product adds VO; the pacing suits ~2.2–2.6 words/s).
- **Music:** none.
- **SFX:** sound present 65% of the time, **≈ 129 onsets per minute**:
  - chalk scratch loop on every stroke (coarse noise 0.7–4.5 kHz, grain crackle, pressure pulses 7–11 Hz) with a soft **tap** at each stroke start;
  - a click each time a proof piece lands (≈ 6/s during the cascade);
  - a bright "shine" when the proof completes (glow);
  - a wooden knock when the chalk lands on the tray.

## 10. Do / Don't

**Do**
1. Keep the wooden frame, tray and grain fixed while only the board world moves.
2. Draw everything with chalk strokes (halo + core) and let the grain overlay texture them.
3. Keep fixed meaning per colour: white = neutral, yellow = title/answer, pink/blue = the two parts, mint = correct.
4. Make the key idea a *visual proof*: pieces move, a counter counts, the result glows.
5. End on the full board with the chalk back on the tray.

**Don't**
1. Don't show a hand, a cursor or digital UI.
2. Don't use solid opaque fills — only translucent (@0.42) tiles; no gradients or drop shadows on drawings.
3. Don't erase, fade out, or hard-cut.
4. Don't use saturated/neon colours or pure white; don't mix digit systems.
5. Don't wobble or bounce text — chalk text is steady; save springy motion for moving pieces.

## 11. What we will not copy

- The topic (a geometry theorem), its title, its formula, its letters and numbers, and the conclusion sentence.
- The specific triangle-with-three-squares figure as a fixed template (it is one possible `VISUAL_PROOF` instance, not the default).
- The channel name and any branding from the README.

---

## 12. Engine notes

### (a) Scene vocabulary (beats)

Mandatory: `TITLE_CHALK` first, `BOARD_REVEAL` last. Everything else is chosen from content.

| # | Beat | What appears | Trigger (word anchoring) | Min duration |
|---|---|---|---|---|
| 1 | `TITLE_CHALK` | Camera zoom 1.25 on title spot; title written R→L in yellow; yellow underline arc | Word 0; each word reveals on its own ID | 2.6 s |
| 2 | `FIGURE_DRAW` | A white geometric/schematic figure (triangle, axes, box diagram, simple object) stroke by stroke + geometry marks + vertex letters | The noun naming the figure (start 0.2 s before) | 2.0 s |
| 3 | `PART_SQUARE` | A coloured grid/tile group attached to the figure (pink or blue), grid lines, its number inside | The quantity's word ID; number on the number word | 1.8 s |
| 4 | `TARGET_SHAPE` | The goal container in yellow, with "؟" inside | "how much / كم / شحال" or the unknown's name | 1.6 s |
| 5 | `VISUAL_PROOF` | Tiles fly from part shapes into the target, counter ticks, completion glow | The sentence describing the combination; cascade spans it | 3.5 s |
| 6 | `FORMULA_LINE` | Symbolic line in white written R→L, operators enlarged | Each symbol on the word that says it | 1.8 s |
| 7 | `NUMBER_LINE` | Same line with numbers in yellow directly below the formula | Number words | 1.6 s |
| 8 | `TICK` | Mint check mark beside the result, 2 strokes | "صحيح / exactly / هكذا" or the end of the result | 0.8 s |
| 9 | `CONCLUSION` | One pink line (≤ 7 words) under the formula block | Concluding sentence | 2.2 s |
| 10 | `LIST_STEPS` | Up to 4 short chalk lines with hand-drawn numerals and a white dot bullet, each written on its own sentence | Enumeration words ("first / أولاً / ثانياً") | 1.2 s per item |
| 11 | `CIRCLE_AND_ARROW` | Chalk ellipse around an existing element (yellow) + curved arrow to a note | Stressed keyword ID | 1.2 s |
| 12 | `COMPARE_TABLE` | Two-column chalk table (lines 4 px), pink header vs blue header, rows fill in | "vs / مقارنة / بين" | 3.0 s |
| 13 | `BOARD_WIPE` (long videos) | Eraser prop sweeps across in 3 passes, leaving faint smear clouds (white @0.04), new section starts | Topic shift | 1.6 s |
| 14 | `BOARD_REVEAL` | Camera to zoom 1.0, all content visible, chalk returns to the tray (knock) | Final sentence | 2.4 s |

Camera rule: each beat declares a world rect; fit it at zoom 1.0–1.3 with the active drawing slightly right of centre; skip camera moves when the next rect is already ≥ 85% visible.

### (b) Illustration approach

- **Construction:** props/figures are SVG paths in world coordinates; one stroke per sub-path (split multi-`M`); perfect-freehand along `getPointAtLength` samples (clamp `L - 1e-4`), each stroke rendered as halo (2.2× width, @0.12) + core.
- **Stroke widths (world @1080):** primary outlines 6 px; grid/inner lines 3.5 px; geometry marks 3 px; underline 5–6 px; tick 12 px; figure sketches of objects (e.g. a house, a coin, a person) 5 px.
- **Fills:** only translucent tiles (chalk colour @0.42, corner radius 4, gap 6) or loose diagonal chalk hatching (pitch 14 px, width 3 px, @0.35) for shading an area. Never solid.
- **Shading:** none beyond hatching; depth is communicated by layering tiles, not by shadows.
- **Shape language:** precise, ruler-straight geometry with slightly imperfect pressure; objects are schematic line art (5–12 strokes), not cartoons. No faces/mascots (that belongs to whiteboard).
- **Animate-in order:** outline → inner grid/marks → letters/numbers → tiles (if any). Tiles appear with fade 0 → 0.42 over 0.2 s in their source shape before they fly.
- **Library module shape:** `{ strokes: Path[], tiles?: Rect[], labels: Anchor[], colour, bbox }`; the proof engine takes `source tiles[]` + `target cells[]` + angle and produces the flight timeline.

### (c) "Same creator" checklist (verify on stills)

1. Dark green board with visible static grain speckle and a darker vignette at corners.
2. Brown wooden frame on all sides with a tray at the bottom holding small chalk pieces and an eraser — identical position in every still.
3. A hand-less chalk stick (+30°, soft drop shadow) visible until the outro, then lying on the tray.
4. All text is Aref Ruqaa; title is yellow with a yellow underline arc.
5. Only pastel chalk colours (white, yellow, pink, blue, mint) with consistent meaning; no pure white.
6. Strokes show a faint halo and look speckled/dry.
7. Filled areas are translucent tiles or hatching, never solid.
8. There is a visual proof / transformation (pieces moved, counted) with a glowing completed target.
9. Final frame: wide full board, picture on one side, text block with formula + mint tick + one pink conclusion line on the other.
10. No cuts, no fades, no erasing (except an explicit `BOARD_WIPE` in long videos).

### (d) Sound design

| SFX | When | Notes |
|---|---|---|
| Chalk scratch (procedural) | Every stroke, gated by progress | Coarse noise band 0.7–4.5 kHz + grain crackle, AM 7–11 Hz; ‑18 dB under VO |
| Chalk tap | Start of each stroke and each text line | 30 ms dull knock, ‑16 dB |
| Tile click | Each tile landing in `VISUAL_PROOF` | tiny wooden/plastic click, pitch +1 semitone every 5 tiles, ‑22 dB |
| Shine | Completion glow, `TICK` | soft bell/chime, 0.6 s tail, ‑20 dB |
| Eraser swish | `BOARD_WIPE` | felt swish ×3 |
| Tray knock | `BOARD_REVEAL` chalk landing | wooden knock + tiny roll |
| Music | Optional | off by default; if on, soft piano bed ‑28 LUFS, ducked during proof clicks |
