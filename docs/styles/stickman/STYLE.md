# STYLE.md: Rubber-hose Stickman Comedy

> Style id: `stickman` · Reference: `ref/msk/styles/stickman/reference.mp4` (1280×720, 30 fps, 24.0 s, SFX only).
> Analysis sheet: `docs/styles/stickman/ref-sheet.jpg` (contact sheet 0.5–14.5 s + motion strip 7.9 s "tower sway → collapse" + motion strip 17.0 s "card throw with ghost trail").
> All px values are normalised to a **1920×1080** frame at camera zoom 1.0 (reference px × 1.5). Measured from extracted stills, not guessed.

---

## 1. Overall feel
A single continuous comic sketch on a warm paper set: one elastic white stick character with a real face lives a tiny story (procrastinate → disaster → fix → relief), and every idea of the script becomes a physical object he reacts to. It reads like a hand-made cartoon strip that moves — clean ink outlines, flat friendly colours, squash-and-stretch, slapstick timing — never like a slide deck. You recognise it instantly by the white pill-bodied character with a 6 px ink outline, the thin black floor line across the lower quarter, and colour-tagged task cards that fall, stack, topple and fly.

## 2. Colours
| Name | Hex | Share (approx.) | Use |
|---|---|---|---|
| Paper (wall / background) | `#FAF9F4` | 49 % | Whole wall above the floor line. Never pure white. |
| Floor fill | `#F0ECE1` (palette `#EDE9E0`) | 24 % | Everything below the floor line. |
| Ink | `#1F2328` | 3–4 % | Every outline, limbs, floor line, text, clock hands, sofa feet. The only "black". |
| Character / card white | `#FFFFFF` | 2–5 % | Character head + body fill, cards, callout boxes, counter pill. |
| Body shade | `#E8E8E6` | <1 % | Soft shading stripe on the back side of the body tube (≈22 % of tube width, blurred 4 px). |
| Ground shadow | `#EBE7DC` | 1 % | Flat ellipse under sofa / character / box. |
| Neutral mid-grey | `#BEBFBD` | 9 % (incl. AA) | Dust puffs outline, subtitles' secondary lines, ghost/disabled states. |
| Hero object blue | `#5B8DEF` (shade `#4A7AD8`) | 3.5 % | The single big set prop (here: sofa). Shade = arms/back/side faces. |
| Kraft | `#D9A066` (flaps `#C98B50`) | 2 % | Container / "done" box. |
| Tag red | `#EB5757` | <1 % | Card tag stripe, stamp, exclamation "!", clock second hand. |
| Tag yellow | `#F2C94C` | <1 % | Card tag, keyword highlighter bar, sparkles, picture-frame sun. |
| Tag green | `#27AE60` | <1 % | Card tag, "completed" card flip, check badges, box label. |
| Tag purple | `#9B51E0` | <1 % | Card tag. |
| Tag blue | `#5B8DEF` | <1 % | Card tag. |
| Mint (decor) | `#9ACFB6` | <1 % | Wall-picture mountains only. |

**Rule.** The set is ≥ 85 % paper/floor/white. Saturated colours appear only on *objects that carry meaning* (cards, stamp, hero prop, box label) — never as backgrounds or big fills. Green is reserved for "done/solved" (flip of a card, check, counter); red is reserved for "alarm / rule / problem" (stamp, "!", sweat-panic). Yellow appears as a highlighter bar under one keyword in a title and as sparkles at the happy ending. Max 4 tag colours visible at once.

## 3. Typography
Reference: a geometric, rounded-terminal, heavy Arabic sans (bold 700), very compact. We use **Readex Pro** throughout (it is the reference look); fallback **Alexandria**.

| Role | Reference look | Font · weight | Size @1920×1080 | Line height | Colour |
|---|---|---|---|---|---|
| Title (topic name, top centre) | heavy geometric, no box, sits on the wall | Readex Pro 700 | 84 px | 1.35 | `#1F2328`; keyword gets yellow highlighter bar |
| Callout line 1 (setup) | bold in white rounded box | Readex Pro 700 | 54 px | 1.4 | `#1F2328` |
| Stamp / punchline | heavy, red, inside red stroked rectangle, rotated −4° | Readex Pro 700 | 90 px | 1.35 | `#EB5757` |
| Card label | bold, single line, ≤ 3 words | Readex Pro 700 | 34 px | 1.35 (single line) | `#1F2328` |
| Speech bubble | bold, short (1–2 words + "…") | Readex Pro 700 | 40 px | 1.35 | `#1F2328` |
| Subtitle / takeaway line | medium, grey | Readex Pro 500 | 32 px | 1.45 | `#5F6368` |
| Counter / numbers | bold, Arabic-Indic digits, "n / total" | Readex Pro 700 (tabular: IBM Plex Mono 600 for Latin digits) | 36 px | 1.35 | `#1F2328` |

Project text rules apply: `line-height` ≥ 1.35, no `letter-spacing` on Arabic, never split a word into letters (reveal whole words or wipe with a clip mask), every text holds ≥ 0.3 s × words + 0.6 s.

Highlighter bar: `#F2C94C` at 85 % opacity, height 34 % of font size, sitting on the baseline band (lower third of x-height), extends 6 px past the word on both sides, drawn *behind* the text, wipes in right→left (RTL) in 0.30 s easeOutCubic.

## 4. Composition
- **Stage, not slide.** A side-view room: wall above, floor below. **Floor line at y = 812 px (75 % of height)**, ink, 6 px, full width, never moves vertically except with camera.
- Margins: 72 px safe margin left/right, 48 px top. Title centred, baseline at y ≈ 150 px.
- Character and the hero prop live on the floor line in the left 45 % of the frame at story start; the "goal" prop (box/destination) sits on the floor at the far right (x ≈ 1650–1880). The middle third is the *arena* where problem objects pile up.
- Wall decor: one round clock top-left (centre ≈ (90, 250), Ø 172 px) and one framed picture top-right (240×165 px). These are the "room" — they stay for the whole video and help sell camera moves.
- Elements per frame: 1 character + 1 hero prop + 1 goal prop + 2 wall decors + 0–6 cards + ≤ 1 text box. Never more than ~12 objects.
- Empty space: 45–55 % of the frame is plain paper (upper middle mainly) — text boxes drop into that empty upper-middle band (y 60–380).
- Reading direction: RTL. Text right-aligned inside boxes; story progress flows right→left is NOT required — physical action uses whatever reads best, but text boxes and counters follow RTL. Counter pill top-right (Arabic reading start).

**Aspect ratios (redesign, never letterbox):**
- **9:16 (1080×1920):** floor line at y = 1440 (75 %). Scale the world ×1.35 relative to 1080-high (character stands ≈ 560 px tall). Title/callout box occupies y 140–520, max width 960 px. Wall decor moves to the band y 560–820 (clock left, picture right). The arena is *vertical*: card stacks may grow up to y ≈ 700. Goal box sits bottom-right at x 760–1020, hero prop bottom-left; the camera frames 2 of the 3 actors at a time and pans between them (instead of seeing all three). Counter pill top-right at (1000, 90) anchor right.
- **4:5 (1080×1350):** floor line at y = 1010; world ×1.1; text band y 80–380.
- **1:1 (1080×1080):** floor line at y = 800; world ×1.0 of 1080 height but horizontal positions compressed: hero prop x 0–40 %, goal x 75–100 %; wall picture hidden if it collides with the text box.
- **16:9:** as measured.

## 5. Recurring elements
1. **The character** — head circle Ø 90 px (white fill, 6 px ink stroke); body = curved tube (quadratic Bézier hip→neck) drawn twice: ink 96 px wide then white 84 px wide, round caps → 6 px outline. Back-side shade stripe `#E8E8E6`. Limbs = single ink strokes 7 px, round caps, soft bend through elbow/knee (quadratic, control = 2J − (S+E)/2), no hands/feet shapes (round caps only). Near arm drawn in front of the body, far arm behind. Standing height ≈ 420 px (39 % of frame height).
2. **Face** — two dot eyes (Ø 9 px) or "^ ^" happy arcs / ">  <" squeezed arcs; eyebrows 4 px strokes; mouth: arc smile, flat line (bored), open "O" with blue sweat drop (`#7FB3FF`, panic), teeth grin (determined), closed-eye big smile (relieved). Blink every 2.5–4 s (2 frames closed).
3. **Task cards** — white rounded rect 360×110 px, radius 16, 5 px ink stroke, 12 px colour stripe on the right edge (RTL start; reference had it on the left), coloured icon disc Ø 52 px with white glyph at the start side, label in Readex 700 34 px. Drop shadow: hard offset (0, 6 px), `rgba(31,35,40,0.10)`.
4. **Hero prop** (sofa / desk / bed…) — big flat shape 525×345 px, fill `#5B8DEF`, sides `#4A7AD8`, 6 px ink outline, radius 28, 2 ink feet 30×20 px; one 3 px ink seam line.
5. **Goal container** (box) — kraft cube front 290×160 px, two open flaps, 5 px ink outline, centred green label pill (`#27AE60`, white ✓ + word).
6. **Wall clock** — Ø 172 px, 6 px ink rim, 12 ticks (4 px), ink hour/min hands, red second hand 3 px. Hands spin fast-forward to show time passing (minute hand 1 rev / 4 s during "procrastination").
7. **Wall picture** — 240×165 frame, 5 px ink, mint mountains + yellow sun.
8. **Callout box** — white, 5 px ink, radius 24, padding 36×28, hard shadow (0, 8 px) `rgba(31,35,40,0.10)`. Holds setup line and optional stamp.
9. **Stamp** — red text in red 5 px stroked rect, radius 10, rotated −4°.
10. **Counter pill** — top-right, 225×82 px, white, 5 px ink, radius 41, green check disc + "n / N" digits.
11. **FX:** dust puffs (3–5 outlined circles Ø 24–40 px, 3 px `#BEBFBD`), speed lines (radial strokes 3 px `#E6E3DA`, 120–180 px), ghost trail (3 copies at 45 %/28 %/14 % opacity, 0.033 s apart), red "!" (ink-outlined, 70 px tall), sparkles (4-point stars `#F2C94C`, ink 3 px, Ø 28–44 px), sweat drop.

## 6. Motion vocabulary
| Event | Exactly how | Duration | Curve |
|---|---|---|---|
| Text box entrance | Box scales 0.25→1.04→1.0 from its centre, with opacity 0→1 in first 40 % | 0.20 s (6 f) | spring damping 12, stiffness 180, mass 0.6 |
| Text inside box | Word-by-word: each word fades 0→1 and slides 8 px from the reading start, triggered on its spoken word ID | 0.20 s per word | easeOutCubic |
| Text exit (not before 0.3 s × words + 0.6 s) | Box scales 1→0.9 + fade to 0 | 0.15 s | easeInCubic |
| Title on wall | Fade + rise 24 px; highlighter wipes after the title is fully in | 0.35 s + 0.30 s | easeOutCubic |
| Keyword emphasis | Yellow highlighter wipe (RTL) under keyword; or stamp slam | 0.30 s | easeOutCubic |
| Stamp slam | Scale 1.6→0.95→1.0, rotate −10°→−4°, opacity 0→1 in 2 frames, camera shake 0.25 s | 0.18 s | easeOutBack (overshoot 2.2) |
| Card drop-in | Falls from above frame, lands on stack, squash 1.0→0.86 Y / 1.10 X, rebounds 18 px, settles | 0.45 s fall + 0.25 s settle | fall easeInQuad; bounce spring damping 10 |
| Tower sway | Stack sways ±4°→±9° growing, pivot at base, period 0.6 s | 1.2–1.8 s | sine, amplitude easeInQuad |
| Collapse | Stack rotates & falls onto character; cards spread to a pile; dust puffs + shake | 0.35 s | easeInQuad, landing spring damping 14 |
| Card fly to hand | Card leaves pile on an arc to the hand point with 3-ghost trail | 0.30 s | easeInOutCubic |
| Card flip to "done" | scaleX 1→0→1, colour switch to green `#27AE60` + white ✓ at the midpoint | 0.20 s | easeInOutSine |
| Throw into box | Parabolic arc (peak 220 px above start), rotates 1 full turn, ghost trail; box squashes 0.92 Y and pops back | 0.40 s + 0.20 s | x linear, y gravity (quadratic) ; box spring damping 9 |
| Counter tick | Old digit slides up/out, new digit up/in; check disc pulses 1→1.2→1 | 0.20 s | easeOutBack |
| Character pose change | Key poses interpolated; head lags body by 2–3 frames; body bends with tilt velocity | 0.4–0.8 s | Easing.inOut(Easing.cubic) |
| Jump / stand up | Anticipation squash 0.12 s (Y 0.9), stretch up (Y 1.12), land squash (Y 0.88) | 0.5–0.7 s total | inOut cubic + spring on landing |
| Walk | 2-step cycle, hip bob 10 px | 0.5 s per step | sine |
| Idle | Breathing: body scaleY 1±0.015, period 2.4 s; blinks | continuous | sine |
| Camera move | Keyframed x / y / zoom (range 1.0–1.35); re-frames on the active actor | 0.8–1.2 s | easeInOutCubic |
| Camera shake | noise2D, amplitude 14 px → 0, rotation ±0.6° | 0.25–0.35 s | exponential decay |
| Scene "transition" | **No cuts.** The camera pans/zooms within the same room; acts are separated by camera re-framing | — | easeInOutCubic |
| Sparkles | Pop scale 0→1.2→1 then twinkle 1↔0.7 | 0.25 s + loop 0.6 s | easeOutBack |

Measured from strips: text box pop = 1–2 frames at 0.1 s (≈ 0.2 s); word reveal ≈ 0.2 s/word; card throw arc = frames 4→7 of strip @17.0 (0.3–0.4 s); hand-to-box loop = 1.0 s per card (counter steps exactly every 1.0 s from 15.5 to 19.5 s); counter badge fade-in ≈ 0.15 s.

## 7. Rhythm
- One continuous shot (0 hard cuts / min). Mean "beat" length ≈ 1.0–1.5 s; act length ≈ 5–7 s.
- 4 acts in 24 s: setup (0–7 s), disaster (7–10 s), rule (10–13 s), payoff loop (13–20 s), relief (20–24 s).
- Stillness 38 % of time — but stillness is never dead: idle breathing, blinking, clock hands keep moving.
- On-screen words at once: 1–6 (title or callout ≤ 8 words; card labels ≤ 3 words each).
- Motion follows the script **phrase-by-phrase** for actions, **word-by-word** for text reveals and for hits (a card drop / stamp lands on the stressed word).
- Repetition-with-variation for lists: each list item gets the same 1.0 s action loop (fly → flip → throw → count), with small variations (arc height ±15 %, spin direction alternating).

## 8. Texture & finishing
- **Grain: none** (0.0). Clean vector.
- **Glow: none.**
- **Shadows:** hard offset UI shadows (0, 6–8 px) at 10 % ink; floor contact shadows = flat ellipses `#EBE7DC`, 0 blur, width 110 % of object.
- **Vignette: none.** **Gradients: none** (only the body-shade stripe is softly blurred, 4 px).
- **Motion blur:** none — replaced by ghost trails (3 copies) and speed lines.
- All strokes use round caps + round joins.

## 9. Sound in the reference
- **No voice-over, no music** — 57 % of the time has sound; 127 onsets/min (≈ 2 per second) = dense cartoon SFX.
- SFX types: clock ticking (bed during procrastination), card thud/land per card, tower creak, crash + dust "poof", cartoon boing (jump/stand-up), whoosh per card fly, paper flip, box "thunk", rubber stamp slam, success "ding/sparkle" on count and ending.

## 10. Do / Don't
**Do**
1. Keep the room: paper wall, 6 px ink floor line at 75 %, clock + picture — in every frame of the video.
2. Turn every concept into a physical object the character touches (card, box, stack, tool) and give each object weight (fall, squash, bounce).
3. Let the face carry the emotion — change expression on the emotional word, blink regularly.
4. Use one consistent ink weight family: 6 px characters/props, 5 px cards/UI, 3 px FX.
5. Land every hit (drop, stamp, crash) on the spoken stressed word, with a matching SFX and a short shake for big ones.

**Don't**
1. Don't cut — move the camera inside the same set.
2. Don't fill backgrounds with colour, gradients, textures or photos.
3. Don't draw hands, fingers, feet or clothes on the stickman — round-capped strokes only.
4. Don't put more than one text box on screen, or more than ~8 words in it.
5. Don't animate with linear easing or uniform timing; no element ever pops without overshoot or squash.

## 11. What we will NOT copy
- The reference's story, topic and all its Arabic texts (title, rule sentence, task labels, speech bubble, box label wording, takeaway line).
- The channel/brand name credited in the README and any logo.
- The exact "procrastination on the couch" plot. We keep the *grammar* (problem objects pile up → collapse → rule → loop of solving → relief) and re-plan it per topic.
- The left-side tag stripe is mirrored to the right (RTL start) in our version.

---

## 12. Engine notes

### (a) Scene vocabulary (beats the AI director can plan with)
All beats happen inside the single persistent room; a "scene" = camera framing + actor actions + objects. Durations are minimums at 30 fps.

| # | Beat | What appears / happens | Word trigger → action | Min duration |
|---|---|---|---|---|
| 1 | `room-open` | Camera at zoom 1.0 shows room, character in idle pose with hero prop; title fades onto wall | title words → word-by-word reveal; keyword → highlighter wipe | 2.0 s |
| 2 | `idle-habit` | Character does a looped habit (scroll phone, sleep, eat) on the hero prop; clock fast-forwards | verb of the habit → loop starts; time word ("later", "every day") → clock spins | 2.0 s |
| 3 | `speech-bubble` | Rounded white bubble with tail near head, 1–3 words | bubble pops on first word of the quote | 1.2 s |
| 4 | `pile-up` | Objects (cards, coins, papers, notifications) drop one by one onto a stack | each list noun → one object drops (0.45 s) | 0.6 s × n |
| 5 | `alarm-react` | Red "!" pops above head, face → panic, sweat drop, camera push-in 1.0→1.25 | alarm/problem word → "!" + face change | 1.0 s |
| 6 | `collapse` | Stack sways then falls on character/area; dust, shake; only legs kick out | climax word → fall starts so impact lands on the stressed syllable | 1.5 s |
| 7 | `rule-callout` | Callout box pops in empty upper band; setup line word-by-word; then stamp slams | condition clause → box + words; imperative/punchline → stamp | 2.5 s |
| 8 | `get-up` | Character climbs out / stands, determined face, speed lines appear | decision word ("now", "start") → anticipation squash + jump | 1.0 s |
| 9 | `do-loop` | For each item: point → item flies to hand → flips green ✓ → thrown into goal box → counter +1 | each item noun → one loop (1.0 s) | 1.0 s × n |
| 10 | `counter-reveal` | Counter pill appears top-right ("0 / N") | first number / "all" → pill fades in | 0.5 s |
| 11 | `compare-split` | Two framings in one room: camera pans between "before" spot and "after" spot (e.g., messy pile vs. empty floor) | contrast connector ("but", "instead") → camera pan | 1.5 s |
| 12 | `relief-end` | Character returns to hero prop relaxed, happy closed-eye face, sparkles; takeaway box (title + grey subtitle) | conclusion words → box pop; final noun → sparkles | 2.5 s |
| 13 | `think` | Character hand on chin, thought dots (3 circles) grow, icon object appears above | question word → dots; answer noun → object pops | 1.5 s |
| 14 | `walk-to` | Walk cycle across floor to another prop; camera follows | movement verb → walk starts | 1.0 s |

Planning rules: a video uses 6–10 beats, never the same beat twice in a row except `do-loop`/`pile-up` iterations; at most one `collapse` per video; always end with a resolution beat (`relief-end` or equivalent).

### (b) Illustration approach
- Everything is SVG drawn in code, no bitmaps. Two-pass strokes: ink outline then fill (character body tube), or `fill` + `stroke` 5–6 px with `stroke-linejoin: round`.
- Flat fills only; one optional shade colour per prop (side faces 12 % darker than the main fill, e.g. `#5B8DEF` → `#4A7AD8`). Character shade stripe is the only blurred element.
- Props are built from rounded rectangles (radius 12–28) and circles; small icon glyphs inside discs are white, 4 px strokes.
- New props for any topic (laptop, coin, book, phone, trophy, plant, bed, desk, door) follow the same recipe: ink 6 px (≥ 200 px objects) or 5 px (< 200 px), one saturated fill from the tag palette or a neutral (white/kraft/blue), contact shadow ellipse.
- Animate-in by physics, not by fades: drop + squash, pop with overshoot (scale 0→1.08→1 in 0.25 s), slide out from behind another prop, or flip. Props never draw-on stroke by stroke in this style.
- Character rig: pose = { hip(x,y), bodyTilt, headTilt, gazeDir, handL, handR, footL, footR, expression }. Two-bone IK for limbs; elbow bends backward, knee forward relative to gaze. Body bend from tilt velocity (max 18°), squash/stretch from hip vertical velocity (scale 0.85–1.15), head lag 2–3 frames.

### (c) "Same creator" checklist (verifiable on stills)
- [ ] Background is warm paper `#FAF9F4` above a 6 px ink floor line at ≈ 75 % height with a `#F0ECE1` floor below.
- [ ] The stickman has a white pill body + white circle head with ≈ 6 px ink outline and a soft grey back-shade; limbs are single round-capped strokes with no hands/feet.
- [ ] The face shows a clear, readable emotion (eyes + brows + mouth).
- [ ] A wall clock and one wall picture are visible (or just out of frame during camera push-ins).
- [ ] All props have the same ink outline weight family (5–6 px) and flat fills from the limited palette.
- [ ] Coloured accents only on meaningful objects (tags, stamp, hero prop, "done" green); no coloured backgrounds.
- [ ] Text sits in a white rounded box with hard offset shadow, or is a wall title with yellow highlighter on one keyword; Readex Pro bold.
- [ ] Motion stills show at least one of: ghost trail, speed lines, dust puffs, sparkles, squash.
- [ ] No grain, glow, gradients or photographic elements.

### (d) Sound design
No music by default (optional very soft ukulele/pizzicato bed at −28 LUFS if the user asks). Voice-over (when present) leads; SFX at −14 to −18 dB under it.
| SFX | When |
|---|---|
| clock tick loop | during `idle-habit` while the clock fast-forwards |
| soft paper thud (pitch +/− per object) | every object landing in `pile-up` |
| wood creak | tower sway |
| crash + poof | `collapse` impact frame |
| cartoon boing / spring | jump, stand-up, box squash |
| whoosh (short, 0.25 s) | every flying object / camera whip |
| paper flip | card flip to done |
| rubber-stamp thump | stamp slam (aligned to frame of contact) |
| pop | text box / bubble / "!" entrance |
| bright ding (rising pitch per count) | counter +1 |
| sparkle shimmer | `relief-end` sparkles |
Target density ≈ 1.5–2 SFX per second during action beats, 0–1 during idle beats.
