# STYLE.md: Doodle — one-take ink storybook

Reference: `.ref/msk/styles/doodle/reference.mp4` (720×1280 vertical, 30 fps, 84.0 s, **0 hard cuts**). Analysis:
`analysis/doodle/` (report, palette, 4 contact sheets, 6 motion strips). This style is **natively vertical**, so all px
values are given for **1080×1920** (reference px × 1.5) and then for 1920×1080 (§4.3). Style only — no story, text,
series name or voice is reused (§11).

---

## 1. Feel

A warm, gentle picture-book told in one continuous camera move: friendly cartoon people with big smiles walk through
a single connected world (desert → stones → garden) under a soft sky, while the narration appears word by word at the
top like a book caption. It feels kind, calm and trustworthy — a story told to you, not an advert shouted at you.
Recognisable at first glance by the **brown hand-inked outlines with varying width, flat pastel fills, the navy
headline with one orange squiggle-underlined word, and a camera that never cuts**.

## 2. Colours

| Name | Hex | Share | Use |
|---|---|---|---|
| `sky-top` | `#AFDCF0` (measured `#B0D8EB`) | 23 % | Top of sky gradient (day) |
| `sky-horizon` | `#EAF6F4` (measured `#DFECEB`) | 11 % | Bottom of sky gradient near horizon |
| `sky-dusk-top` / `sky-dusk-horizon` | `#9DBCDF` / `#C4CBD7` | — | Final 15 % of the video: light shifts toward evening |
| `sand` | `#F1D9AE` (rendered `#ECD5AB`) | 15 % (desert section) | Desert ground |
| `grass` | `#BCDB92` (rendered `#BBD891`) | 21 % | Garden ground |
| `grass-shade` | `#99A484` | 7 % | Ground near the camera (bottom 20 %), slight darkening |
| `water` | `#6FB3C8` (light `#99CDDC`) with white dashes `#EAF6F8` | 5 % | Stream / channel |
| `wall` | `#E0CDA8` bricks, mortar outlines in ink, cap `#7A5233` | 15 % (garden) | Garden wall |
| `leaf` | `#709E46` / dark `#4E7A33` | — | Palms, bushes, sprouts |
| `trunk` | `#AC7443` | — | Palm trunks (ring hatching in ink) |
| `stone` | `#5A524C` with highlight `#7A716A` | — | Black stones field |
| `sun` | `#FBD05D` + halo `#FFF1C2` 50 % | — | Sun behind the horizon |
| `cloud` | `#FCFAF8` fill, ink outline, glow `#FFF6DA` 60 % | — | Hero cloud |
| `ink` | `#3A2A1E` (dark parts render `#453025`) | — | **All outlines** |
| `skin` | `#C0895E` / shade `#AD805F` | — | Characters |
| `robe-white` | `#F1E8E0` (chalk texture `#EAE4DB`) | — | Character A |
| `robe-red` | `#D06643` | — | Character B |
| `robe-gold` / `robe-green` | `#E8B23A` / `#5DAA5A` | — | Secondary characters |
| `turban-blue` / `belt-teal` | `#2F4E9C` / `#589594` | — | Clothing accents |
| `text` | `#1E2B45` navy | — | Headline words |
| `subtitle` | `#45627F` | — | Small translation line |
| `accent` | `#F07F2E` (measured `#F27F30`) | ~1 % | Highlighted word, squiggle, connector line, `؟` badge, card labels |
| `accent-glow` | `#FFD0A0` | — | Soft glow behind the accent word / active card |
| `card` | `#FFFFFF` | — | Bubbles, cards, name tags |

**Accent rule:** orange belongs to **one word per line** (the word that carries the meaning) and to the props that
point to it (connector line, name tag text, `؟` badge). The world itself never uses `#F07F2E` (robes use the muted
`#D06643`). Never colour a whole line orange.

## 3. Typography

| Role | Look in reference | Font (installed) | Weight | Size @1080×1920 | Line height |
|---|---|---|---|---|---|
| Headline (narration line) | Rounded heavy geometric Arabic (Tajawal 900 in ref) | **Readex Pro** (fallback **Changa** 700) | 700 | 64 px (2 lines max, ≤ 22 chars/line) | 1.40 |
| Accent word | Same font, orange, with squiggle under it | **Readex Pro** | 700 | 64 px | — |
| Series / channel label | Small bold, navy | **Readex Pro** | 600 | 24 px | 1.4 |
| Translation subtitle | Small rounded Latin, bold | **Readex Pro** (Latin glyphs) | 600 | 24 px, colour `#45627F` | 1.35 |
| Speech-bubble text | Same family, heavy, navy; key name in orange | **Readex Pro** | 700 | 44 px | 1.35 |
| Card label (under icon) | Heavy, navy | **Readex Pro** | 700 | 34 px | 1.3 |
| Name tag | Heavy orange | **Readex Pro** | 700 | 42 px | 1.2 |
| Quote card (end) | Heavy navy, accent word orange + squiggle | **Readex Pro** | 700 | 70 px | 1.45 |
| Numbers | Same family (no mono in this style) | **Readex Pro** | 700 | as role | — |

No letter-spacing. Diacritics allowed (the reference vocalises key words) — keep line-height ≥ 1.40 so harakat never
collide.

## 4. Composition

### 4.1 9:16 (native)
- **Side margins** 80 px; text block centred horizontally (`text-align: center`).
- **Series label** centred at y = 180 px.
- **Headline** first line baseline ≈ y 340, second ≈ y 430 (block occupies y 290–460 ≈ 15–24 % of height).
- **Subtitle** 40 px under the headline (≈ y 505).
- **Sky gap**: y 520–760 kept empty (clouds/bubbles may enter here).
- **World band**: horizon/wall top at ≈ 45–55 % height; characters' feet at 72–78 % height; character height ≈ 320 px at
  medium zoom (≈ 17 % of frame), 220 px wide shot, 450 px close-up.
- **Bottom 15 %**: only ground texture (sprouts, stones) — keeps platform UI clear.
- **Elements:** headline (≤ 2 lines) + 1–3 characters + 0–3 cards/bubbles. Max 1 bubble at a time.
- **Empty space:** ~45 % (sky + foreground ground).
- **Reading direction:** RTL text; the story travels **right → left in world space** is not required — the reference
  camera moves left→right through the world (x increases with time). Keep one consistent travel direction per video.

### 4.2 Layers (back → front, also depth by y)
1. Sky gradient + sun. 2. Far dunes/hills (thin ink line only). 3. Palms behind wall. 4. Wall / horizon. 5. Bushes on
wall base. 6. Water channel (always *behind* feet). 7. Characters & props sorted by foot-y. 8. Foreground sprouts and
stones (larger, bottom). 9. Cards / bubbles / tags. 10. Text block (screen-space, unaffected by camera).
11. Paper grain overlay.

### 4.3 Other aspect ratios (redesign, never letterbox)
- **16:9 (1920×1080):** text moves to the **top-right third** as a right-aligned block (x 1040–1840, y 110–330),
  headline 64 px, subtitle 24 px; the world gets the full width and the camera frames characters in the left-centre
  (feet at 82 % height, character 300 px). Series label top-right at y 70. Wide shots zoom 0.75–0.85 to show more
  world horizontally; cards line up horizontally.
- **4:5 (1080×1350):** headline block y 120–300 centred (60 px); horizon at 42 %; feet at 80 %; character 280 px.
- **1:1 (1080×1080):** headline block y 70–220 (56 px, max 2 lines), horizon at 40 %, feet at 84 %; prefer medium
  shots; subtitle optional (hide if > 1 line).
- Camera keyframes are authored in **world units**; each aspect has its own framing preset (zoom × safe area), not a crop.

## 5. Recurring elements

| Element | Exact look | When |
|---|---|---|
| **Ink outline** | Variable-width hand stroke, `#3A2A1E`, 3.5–6 px @1080w (thin at ends, pressure via sine), round caps; perfect-freehand style | Every drawn object |
| **Characters** | ¾ view cartoon, big head (head ≈ 33 % of height), closed happy eyes or dot eyes, huge open smile with teeth, full black beard, turban/kufi, long robe with chalk-hatch texture, small feet, soft ground shadow ellipse (ink 12 %) | Protagonists of every beat |
| **Accent squiggle** | Sine wave under the accent word: stroke 5 px `#F07F2E`, wavelength 22 px, amplitude 4 px, width = word + 8 px; glow `#FFD0A0` blur 14 px opacity 0.6; phase drifts slowly | Under the 1 accent word of the line |
| **Speech bubble** | White pill, ink outline 4.5 px, radius 48 px, padding 28×18 px, triangular tail 30 px towards speaker | Quoted speech |
| **Thought bubble** | White cloud shape + 2 trailing circles (24 px, 14 px) towards the head; contains a mini drawing | Remembering / imagining |
| **`؟` badge** | White circle 52 px, ink outline 4 px, orange `؟` 34 px; pops above the head | Questions / confusion |
| **Name tag** | White rounded rect 210×72, radius 14, ink outline 4 px, orange label; small glow behind | Naming a person/thing |
| **Icon card** | White rounded square 240×230, radius 22, ink outline 4.5 px, tail at bottom centre; icon 90 px (flat colour + ink) above a 34 px navy label | Splitting / listing ideas (2–4 cards in a row, 24 px apart) |
| **Connector line** | 4 px orange line from a circled word (orange ellipse 4 px around it) to a tag/card | "this is the same as that" |
| **Sparkles** | 4-point stars 14–22 px, ink outline + pale yellow `#FFF1C2` fill, twinkle scale 0.6↔1 | Around the magical/hero object |
| **Rain** | Short dashes 18×3 px `#7FB8D8`, falling 900 px/s, slanted 8° | Water/blessing beats |
| **Piles / props** | Pyramids of small ink-outlined circles (dates/fruit), crate base with plank lines | Quantities / harvest / goods |
| **Dashed divider** | 3 px ink dashes 12/10 on the ground | Splitting into parts |
| **Quote card** | White rounded rect 900×560 @9:16, radius 36, ink outline 5 px; world behind washed with white at 70 % | A quotation / moral / key fact |
| **Pill CTA** | White pill, ink outline 4 px, icon + 32 px text | Source / CTA under end text |

## 6. Motion vocabulary

Measured from the motion strips (0.1 s per frame).

| Event | Exactly how | Duration | Curve |
|---|---|---|---|
| **Word reveal** | Each word: opacity 0→1, `translateY 10→0 px`, blur 4→0 px, starting at its word timestamp | 0.25 s | `easeOutCubic` |
| **Accent word** | Same reveal, then squiggle draws R→L (`strokeDashoffset`) and glow fades in; squiggle phase then drifts 1 wavelength / 2 s | +0.35 s draw | `easeInOutSine` |
| **Subtitle** | Fades 0→1 (y 6→0) after the last Arabic word of the line | 0.3 s | `easeOutQuad` |
| **Line exit** | Whole text block fades to 0 (no movement) right before the next line's first word | 0.3 s | `easeInQuad` |
| **Camera move** | Keyframes (x, y, zoom) in the pauses between sentences, holds during speech; zoom presets wide 0.85–0.95, medium 1.15–1.30, close 1.50–1.60 | 1.0–2.0 s | `Easing.inOut(Easing.cubic)` |
| **Camera handheld** | Noise drift ±4 px, ±0.15°, 0.2 Hz | continuous | noise |
| **Card/bubble pop-in** | Scale 0.6→1 (origin = tail tip), opacity 0→1 | 0.35 s | spring `{damping: 12, stiffness: 180, mass: 0.6}` (≈ 6 % overshoot) |
| **Card exit** | Opacity 1→0 + scale 1→0.95 (strip 5: fades over 4 frames) | 0.4 s | `easeInCubic` |
| **Name tag exit** | Shrinks toward its anchor (scale 1→0) | 0.3 s | `easeInBack` |
| **`؟` badge** | Pop scale 0→1.15→1 + 1 wobble (±8°) | 0.4 s | spring damping 10 |
| **Character idle** | Breathing scaleY 1↔1.01 at 0.4 Hz; blink 0.12 s every 3–5 s (seeded) | continuous | sine |
| **Gesture** (raise arm, point, wave) | Arm rotates about shoulder 0→−110° | 0.3 s up, hold, 0.35 s down | `easeOutBack` / `easeInOutCubic` |
| **Walk** | Phase from distance travelled (stride 0.55 × height); legs ±22°, body bob 6 px, arms counter-swing ±15° | per step ≈ 0.45 s | sine |
| **Face turn** | `face` −1…1 interpolates features and swaps near/far arm | 0.25 s | `easeInOutCubic` |
| **Rain** | Drops spawn seeded; fade-in 0.4 s | while active | linear |
| **World transition** | Ground colour and prop density blend across x (sand → stones → grass) as the camera travels — never a cut | 3–6 s of travel | — |
| **Light shift** | Sky gradient interpolates day → dusk over the final section | 6–10 s | linear |
| **Quote card** | World washes to white 70 % (0.5 s), card scales 0.9→1 + fade | 0.5 s | `easeOutCubic` |

## 7. Rhythm

- **0 cuts** — one continuous take for the whole video. Camera repositions every 3–6 s (between sentences).
- Still 46 % of the time (camera held while a line is spoken; only idle/breathing motion).
- On screen at once: one narration line of 4–12 words (2 lines max) + subtitle.
- Text follows speech **word by word**; camera and props follow **sentence by sentence**; every sentence gets one
  visible "thing" (bubble, tag, card, `؟`, rain, gesture).
- Line duration ≥ 0.3 s × words + 0.6 s.

## 8. Texture & finish

- **Paper grain:** warm noise, opacity 0.05, multiply; plus very subtle paper fibre 0.03.
- **Chalk texture in robes:** hatch lines inside fills (1.5 px, robe colour −12 % lightness, opacity 0.5, seeded).
- **Glow:** only around the accent word (`#FFD0A0`, blur 14 px, 0.6), the hero cloud (`#FFF6DA`, 40 px, 0.6) and active
  card (orange 20 px, 0.25).
- **Shadows:** soft ground ellipse under characters/props, ink 12 %, blur 6 px. No drop shadows on UI cards.
- **Vignette:** none. **Bottom darkening:** ground gets 6 % darker toward the bottom edge (`grass-shade`).
- **No** `feDisplacementMap` / turbulence wobble on the world (renderer drops elements → flicker). Hand-drawn feel comes
  from pre-computed variable-width strokes only.

## 9. Sound in reference

- Voice-over: calm storytelling MSA (synthetic voice), slow ~110–120 words/min, pauses between sentences (camera moves
  in those pauses).
- Music: **none**.
- SFX: light natural ambience — soft wind in the desert, gentle rain, water trickle in the garden, soft pops when
  bubbles/cards appear. 155 onsets/min (mostly speech). Sound present 86 % of the time.

## 10. Do / Don't

**Do**
1. Keep one continuous world and one continuous camera; change place by travelling, not cutting.
2. Ink every object with the same brown variable-width line; fills flat pastel.
3. Give every sentence one visible object that explains it (bubble, card, tag, `؟`, gesture, weather).
4. One orange squiggled word per line, navy for the rest.
5. Move the camera only between sentences, with `inOut(cubic)`, and hold still while words are revealing.

**Don't**
1. No black outlines, no gradients on objects, no 3D shading, no photos or AI images.
2. No hard cuts, zoom-punches or whip pans.
3. No more than 2 text lines + subtitle; no text over the characters' faces.
4. No water or path drawn over a character's feet (water always passes behind).
5. No SVG displacement filters on the world; no sarcastic or loud tone (no shake, no flashing).

## 11. Not copied

The story and its quotations, the series title, the narration text and voice, the specific characters' identities.
Religious phrases from the reference are not reused as defaults. We take the visual grammar only (ink style, world
building, camera language, caption system). Build notes from the reference README (perfect-freehand strokes, cut-out
rigs, `face` parameter, distance-based walk phase) are technique, credited in `docs/CREDITS.md`.

---

## 12. Engine notes

### (a) Scene vocabulary

All beats live in one world; a "beat" = camera keyframe + world props + overlay objects. Triggers are word IDs.

| # | Beat type | What appears | Trigger words | Min |
|---|---|---|---|---|
| 1 | `establish` | Wide shot (zoom 0.9) of the place, hero object (sun/cloud/shop/house) with sparkles; character small | Opening hook / "imagine / تخيّل / هل" | 3.0 s |
| 2 | `introduce` | Camera eases to medium (1.2) on a character standing/walking in | First mention of a person ("رجل / امرأة / صاحب / زبون") | 2.5 s |
| 3 | `walkTo` | Character walks across the world; camera tracks; ground transitions (sand → stones → grass…) | Motion verbs ("مشى / ذهب / راح / يمشي") | 3.0 s |
| 4 | `speak` | Speech bubble from a character, key word orange | Quoted speech (text in «» or after "قال") | 0.3 s × words + 0.8 s |
| 5 | `think` | Thought bubble with mini drawing of the remembered thing | "تذكّر / سمع / فكّر / حلم" | 2.0 s |
| 6 | `question` | `؟` badge pops above a head; head tilt | Question sentences, "لماذا / علاش / كيف" | 1.2 s |
| 7 | `nameTag` | Tag with orange label pops next to a person/object; optional connector line from a circled word | Names, product names, "اسمه / هذا هو" | 1.5 s |
| 8 | `cardsSplit` | 2–4 icon cards in a row above props, dashed dividers on the ground; one card glows when spoken | Lists / splits / options ("ثلث / الأول… الثاني / خيارات") — each item word pops its card | 0.8 s per card |
| 9 | `weather` | Cloud with glow + rain / sun rays / wind lines over a region | Change-of-state words ("أمطرت / نزل / تغيّر / بدأ") | 2.5 s |
| 10 | `gesture` | Character waves/points/raises arms; others react | Greetings, discovery, joy ("فرح / وجد / شاف") | 1.0 s |
| 11 | `reveal` | Camera pans to reveal the result (garden, piles, full shop) | "فإذا / فوجد / والنتيجة" | 2.0 s |
| 12 | `quoteCard` | World washes white 70 %, centred quote card with accent squiggle | Quotation, moral, key stat, guarantee | 4.0 s |
| 13 | `closingWide` | Wide shot of everyone together, dusk light, sparkles; end headline + pill CTA | Last sentence / CTA | 3.5 s |

Director rules: camera keyframes only in sentence gaps; alternate zoom levels (never the same size twice in a row);
≥ 1 overlay object per sentence; at most one bubble on screen; the world plan (list of zones along x) is decided first,
then beats are placed along it in reading order.

### (b) Illustration approach

- **Stroke:** perfect-freehand style variable-width outline, base 4.5 px @1080w (thin 3 px / thick 6 px), pressure =
  `0.5 + 0.35·sin(i·0.21 + seed)`, ink `#3A2A1E`, closed shapes filled flat underneath. Precompute once per prop
  (memoised by prop id + size), never per frame.
- **Fills:** flat pastel from §2; one inner highlight shape at 15 % white on clouds/water; robes get seeded chalk-hatch
  texture; no gradients except sky and the sun halo.
- **Characters:** cut-out rig — body, head, near arm, far arm, two legs, each rotating around its joint; `face ∈ [−1, 1]`
  shifts eyes/nose/mouth and swaps arm layers; mouth open/closed tied to the character's own spoken words; walk phase
  from distance. Variants by colour (robe, headwear, beard/hair, age wrinkles, child scale 0.6).
- **Props library** (for any topic): drawn as chunky simple shapes with the same ink — phone, tooth, food plate,
  coins/notes, car, engine, shop front, delivery box/scooter, clothes on a hanger, lipstick/bottle, school bag, ball,
  family, clock, plant growth stages, warning sign, before/after split, Maghreb places (palm oasis, white houses,
  market stall, mosque silhouette, mountains). Icons inside cards use the same ink at 3.5 px and 2–3 fills.
- **Animate in:** props already exist in the world (the camera discovers them) or pop in with the spring from §6;
  growth uses scale-from-base 0→1 with `easeOutBack`; never draw-on stroke animation for world props (that is the
  whiteboard style).

### (c) "Same creator" checklist (verify on stills)

- [ ] All outlines brown `#3A2A1E` with visibly varying width (no uniform black strokes).
- [ ] Sky gradient light blue → near-white at the horizon; ground in sand/grass pastels.
- [ ] Narration headline at the top, centred (9:16), navy, Readex Pro heavy, ≤ 2 lines.
- [ ] Exactly one orange word with a wavy underline and soft peach glow.
- [ ] Small translation/subtitle line under the headline (when enabled).
- [ ] Characters: big heads, ¾ view, huge smiles, robes with chalk hatching, soft ground shadow.
- [ ] Water/path passes behind characters' feet.
- [ ] At least one storytelling object (bubble, tag, card, `؟`, rain, sparkles) in most stills.
- [ ] No hard cuts across a contact sheet — consecutive stills show the same continuous world.
- [ ] Flat look: no drop shadows on cards, no vignette, no 3D shading.

### (d) Sound design

| SFX | When | Level |
|---|---|---|
| Ambience bed per zone (desert wind / birds / water trickle) | Continuous, cross-faded as the camera travels between zones | −32 dB |
| Soft pop / bubble blip | Speech/thought bubble, card, tag, `؟` pop-in | −20 dB |
| Pencil/whoosh light | Camera move between sentences (very soft, only on moves > 400 px) | −28 dB |
| Rain / water | Weather beats | −24 dB |
| Footsteps (sand / grass) | Walk cycles, one per step | −30 dB |
| Sparkle chime | Hero object sparkles; accent word on the final line | −24 dB |
| Music | None by default (style is voice + nature); if user adds music: soft acoustic/oud at −28 dB, ducked | — |
