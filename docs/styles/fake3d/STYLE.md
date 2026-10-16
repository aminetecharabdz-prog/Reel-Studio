# STYLE.md: Extruded Paper Odyssey (`fake3d`)

Source analysed: `ref/msk/styles/fake3d/reference.mp4` — 1280×720, 30 fps, 18.0 s, 0 hard cuts, SFX only.
All px values below are normalised to a **1920×1080** frame (reference px × 1.5). Reference sheet: `ref-sheet.jpg`.

---

## 1. Overall feeling

A single, unbroken journey that follows **one golden hero object** through changing worlds — calm, magical, storybook-like, more short-film than explainer. Flat vector shapes are given real thickness by stacked offset copies, so they look like thick cut-metal / cardboard that turns in light, without any 3D engine. You recognise it instantly by: the extruded gold object with a moving specular sheen, a soft radial glow behind it, a continuous camera (no cuts — transitions happen *through* the object), and a whisper-thin Arabic caption.

## 2. Colours

Measured from `palette.json` + pixel sampling; the style runs through **world palettes** (one per act), all sharing the gold hero.

| Name | Hex | ~Share | Use |
|---|---|---|---|
| Mint sky top | `#E3F1E8` | 26% (with bottom) | Act 1 background, vertical gradient top |
| Mint sky bottom | `#A7D7C4` | 14% | Act 1 gradient bottom (`#BADCCC` mid) |
| Dusk peach | `#F8D3B6` | — | Horizon band during the ascent |
| Dusk magenta | `#B25A82` | — | Upper band during the ascent |
| Night violet | `#3B1859` → `#160A28` | 9% | Sky top at the end of the ascent; stars `#FFFFFF` @ 0.5–0.9 |
| Room violet (wall) | `#341844` / `#361A46` | 24% | Interior wall; panel moulding `#47224D` @ 1px highlight |
| Room floor / shadow | `#221034` → `#120720` | 9% | Floor plane, gets darker toward bottom edge |
| Teal door | `#21625F` (light face `#2E8A80`, shade `#1F5455`) | 4% | The "goal" object in the dark act |
| Gold light | `#FFF1BC` | — | Gold gradient highlight / sheen |
| Gold mid | `#F5B54A` | — | Gold face mid tone; also the draw-on stroke colour |
| Gold dark (extrusion) | `#B4641A` (ring face `#C17323`) | 5% (`#C27F58` cluster) | Extrusion back layers, ring face in shade |
| Warm light | `#FFF6E2` core → `#FFC76A` edge | 11% (`#F8E9C9`) | Light behind the door, rays, fill-flash |
| Glow halo | `#F9E6AD` @ centre → transparent | — | Radial glow behind the hero (Act 1) |
| Contact shadow | `#2E4A46` @ 0.35 (reads `#95AEA9` on mint) | — | Blurred ellipse under a floating hero |
| Poster wall (end) | `#EDE5D8` | — | End-card background (cream) |
| Poster frame | `#FCF6EF` | — | 22 px passe-partout around the poster image |
| Ink (headline) | `#24123A` | — | End-card headline, dark aubergine, never pure black |
| Ink soft | `#5A5052` | — | Sub-line; caption ink on mint `#2F3E40` |
| Word "pending" grey | `#ABA29C` | — | A headline word before it is "lit" (turns into ink) |

**Accent rule:** gold (`#F5B54A` family) belongs **only to the hero object** and to the light it emits/receives. Never use gold for text, UI, or background. Teal is reserved for the single "goal/target" object of the dark act. Warm light `#FFF6E2/#FFC76A` appears only as the payoff (the thing the hero unlocks). Each world uses ≤ 3 hues + the gold.

## 3. Typography

Reference: geometric, very light Arabic sans (thin strokes, open counters) — exactly Alexandria Thin/Light. Text is rare and quiet; the picture does the talking.

| Role | Look in reference | Font (installed) | Weight | Size @1920×1080 | Line height | Colour |
|---|---|---|---|---|---|---|
| Big title (end card) | Light geometric, large | **Alexandria** | 300 | 90 px | 1.35 | `#24123A` |
| Body / sub-line | Same family, thinner | **Alexandria** | 200 | 33 px | 1.4 | `#5A5052` |
| Floating caption (in-scene) | Thin, small, ellipsis-ended phrase | **Alexandria** | 300 | 36 px | 1.4 | `#2F3E40` (light world) / `#F3EAF8` @ 0.85 (dark world) |
| Signature / small label | Light, with a 20 px em-rule before it | **Alexandria** | 500 | 24 px | 1.35 | `#5A5052` @ 0.8 |
| Numbers / code | not used in reference | **IBM Plex Mono** 300 if ever needed | 300 | 28 px | 1.35 | ink soft |

Letter-spacing 0 (never letter-spacing on Arabic); line-height ≥ 1.35 everywhere (project rule). Never split an Arabic word into letters — word reveals use a clip mask. Never bold above 500. Max 7 words per caption.

## 4. Composition

- **Margins:** 150 px left/right safe margin (caption sits at x≈150–570, y≈273 in the reference); end-card text right-aligned at x = 1788 (132 px margin).
- **Hero placement:** centre of frame, slightly above middle (hero centre ≈ (960, 500)); hero spans ~660 px (34% of width) when "presented", ~260 px when distant.
- **Caption placement:** upper-start corner (RTL: upper **right** is the natural spot; the reference placed it upper-left of the hero, away from the glow). Never over the hero, never centred.
- **Elements per frame:** 1 hero + 1 environment + ≤ 1 caption. Max 3 readable things.
- **Empty space:** 60–70% of the frame is atmosphere (gradient, wall, sky).
- **Angled sets:** interiors are drawn with a fixed camera yaw ≈ 15–20° and pitch ≈ 8–10° downward, so the wall plane recedes to the right and the floor is visible (moulding lines slope ~4°).
- **End card:** poster (square, 696 px incl. 22 px frame) on the start side at x ≈ 297–993, vertically centred; text block on the other side, right-aligned, vertically centred around y ≈ 540.
- **Reading direction:** RTL for text; the camera journey is mostly vertical (up) and depth (in/out), so it is direction-neutral.

**Other ratios (redesign, never letterbox):**
- **9:16 (1080×1920):** hero centred at (540, 820), spans 70% of width (~760 px). Caption top block at y ≈ 300, centred-right, 44 px. Ascent shots get *more* sky (vertical format suits the toss). Angled room: rotate composition so the door sits at 60% height, floor fills bottom 30%. End card: poster on top (820 px square, centred, y 300–1120), headline + sub below, right-aligned at x = 980, headline 96 px.
- **4:5 (1080×1350):** like 9:16 but poster 680 px at top, text below, headline 80 px.
- **1:1 (1080×1080):** hero 60% width; end card: poster 560 px centred-top, headline 64 px below, sub-line hidden if it would wrap to 3 lines.
- **16:9:** as specified above.
Keep the 150 px (16:9) / 90 px (vertical) safe margin; caption never inside the bottom 20% in vertical (platform UI).

## 5. Recurring elements

1. **Extruded hero object** — a single flat silhouette path (`fill-rule: evenodd` for holes), copied N times along its normal behind itself (1 layer per ~1.5 px of on-screen depth; depth ≈ 6–9% of the object's width, e.g. 40 px for a 660 px key). Back layers `#B4641A` → front `#E39A3A`; front face linear gradient `#FFF1BC → #F5B54A → #C17323` at 120°. Holes show their inner walls automatically.
2. **Moving specular sheen** — a 40–60 px wide soft white band (`#FFFFFF` @ 0.35, blurred 12 px) clipped to the front face; its position = dot(face normal, light dir) → slides across while rotating.
3. **Inner groove/bevel line** — concentric inset line on large faces (1.5 px, `#000000` @ 0.12) giving a coin-like rim (see the key ring).
4. **Radial glow halo** behind the hero: radius ≈ 375 px, `#F9E6AD` @ 0.85 centre → 0 at edge (Gaussian falloff), breathes ±4% scale over 3 s.
5. **Contact shadow** — blurred ellipse 570×22 px, 180 px below hero's bottom, `#2E4A46` @ 0.35, blur 10 px; shrinks/fades as the hero rises.
6. **Four-point sparkle** — concave 4-point star, 60 px, `#FFFDF2`, with 120 px glow @ 0.4; appears on "birth" moments.
7. **Sky gradient bands** — the background is a tall vertical gradient strip (mint → peach → magenta → violet → night) that the camera travels along. Stars: 1–2 px dots, ~60 per 1920×1080, twinkle opacity 0.3–0.9.
8. **Angled set pieces** — wall with a horizontal moulding line (2 px, `#4A2A62`), floor plane, door frame with visible depth (frame side `#2A1441`), door panels inset (2 recessed panels, 3 px darker border).
9. **Light leak + god rays** — light under a door (4 px strip `#FFC76A`), then 3–5 diagonal ray quads (`#FFF6E2` @ 0.10–0.22, additive), floor light trapezoid, and 20–40 dust motes (1.5–3 px, @ 0.4–0.9, drifting up 20 px/s).
10. **Framed poster** — the whole journey's final frame shrinks into a cream-matted square on a cream wall.
11. **Global grain** — always on (see §8).

## 6. Motion vocabulary

Durations measured by counting 0.1 s frames in `motion/` strips.

| Event | Exactly how | Duration | Curve |
|---|---|---|---|
| Birth sparkle | 4-point star scales 0→1.1→1 with 20° twist, glow blooms | 0.40 s | easeOutBack (overshoot 1.4) |
| Line draw-on | Hero outline drawn via `strokeDasharray` (2 px, `#F5B54A`), sparkle rides the pen tip | 0.50–0.60 s | easeInOutCubic |
| Face fill | Front-face gradient opacity 0→1, outline fades | 0.30 s | easeOutQuad |
| Extrusion grow | depth 0 → full while object yaws 0→25° (reveals the thickness) | 0.40 s | easeOutCubic |
| Idle float | ±12 px vertical bob + ±8° yaw sway | 3.0 s period | sine (easeInOutSine) |
| Caption in | fade 0→1 + blur 6→0 px + 8 px rise, as a whole phrase | 0.30 s | easeOutCubic |
| Caption out | fade 1→0, no movement | 0.25 s | easeInQuad |
| Word highlight (end card) | words arrive in `#ABA29C`, then the key word darkens to ink | 0.35 s per word, 0.12 s stagger | easeOutCubic |
| Toss / ascend | hero jumps up (anticipation squat 6 px for 0.1 s), then tumbles 2 full rotations on two axes; camera tilts up through sky gradient (≈ 1.2 screen-heights/s) | 1.8–2.2 s | easeOutCubic on height, linear spin decaying (easeOutQuart) |
| Through-the-hole transition | camera pushes exponentially into the hero's hole; next scene is pre-rendered full-frame, clipped by the hole circle, until the circle covers the screen | 0.50–0.60 s | exponential zoom (scale = e^(k·t)), easeInExpo feel |
| Approach & insert | hero flies into the target in an arc, scales down, slides 1/3 of its length in | 0.50 s fly + 0.30 s insert | easeInOutCubic / easeOutQuad |
| Turn / click | 90° rotation about its long axis (shows thickness flipping) | 0.30 s | easeInOutBack (slight overshoot), click sfx at end |
| Hinge open | door rotates about its hinge 0→~85°, light grows behind | 0.60–0.80 s | easeInOutCubic |
| Camera move into light | push-in on the bright opening until it fills the frame | 0.80 s | easeInCubic |
| Light flash | full-frame `#FFF6E2` fill at 1.0 for 2 frames then hand-off | 0.10 s | linear |
| Poster pull-back (end) | final scene appears scaled 4× centred on its light point, scales to 1 inside the poster while the cream wall + frame appear; text block slides in 40 px from the end side | 0.80 s pull + 0.40 s text | easeOutCubic (pull), easeOutQuart (text) |
| Camera (general) | always moving slightly: ≥ 2% scale drift per 3 s, never fully static except on the end card | continuous | easeInOutSine |

**Never** a hard cut; never a slide/wipe transition. The object or the camera carries every transition.

## 7. Rhythm

- **Shot length:** 1 continuous shot (18 s). Internally: acts of 2.5–4 s each (build 2.3 s, float/caption 2.4 s, toss 2.2 s, portal 0.6 s, insert/turn 2.5 s, open/light 3 s, poster 2.5 s).
- **Cuts per minute:** 0. "Beat changes" per minute ≈ 20 (one every ~3 s).
- **Stillness:** ~53% of frames are near-still (frame change < threshold) — slow idle motion, then a burst.
- **Words on screen:** 0–7 at once; text appears in only ~35% of the runtime.
- **Sync:** sentence-by-sentence (caption appears per phrase); visual *events* (click, open, flash) are hit on a stressed word.

## 8. Texture & finish

- **Grain:** fine monochrome noise over everything, opacity 0.05–0.06, 1 px, re-seeded every frame (`random(frame)`), blend `overlay`.
- **Glow:** radial halo behind hero (see §5) at 0.85; light opening bloom `#FFC76A` blur 40 px @ 0.6.
- **Shadows:** soft contact shadow only (no drop shadows on text, no hard shadows).
- **Vignette:** soft, dark worlds only: radial `#000000` @ 0.35 at corners; light worlds no vignette.
- **Gradients:** every background is a gradient (2–4 stops, vertical); every face of an object has a lighting gradient. No flat fills larger than 10% of the frame.
- **Motion blur:** none rendered; fast spins rely on extrusion smear. Optional 2-sample blur on the toss only.
- **Depth of field:** none.

## 9. Sound in the reference

- **Voice-over:** none (on-screen text only). In our product, VO may be added; then captions follow the VO phrase-by-phrase.
- **Music:** none.
- **SFX:** synthesised, ~77 onsets/min, sound present 59% of the time: metallic shimmer on birth, sparkle twinkles, a whoosh on the toss, an air "whump" through the hole, metal-scrape on insert, a crisp lock click, a wooden door creak + soft swell on the light, a gentle settle on the poster.

## 10. Do / Don't

**Do**
1. Give every hero object real thickness by stacking path copies (≥ 12 layers) and a moving sheen.
2. Transition only through the object or camera (rise with it, enter its hole, enter its light, pull back to a poster).
3. Keep text thin (Alexandria 200–300) and sparse; let the picture carry meaning.
4. Change world palette per act (light pastel → dusk → deep violet → warm light → cream).
5. Keep grain on, and keep the camera breathing.

**Don't**
1. Don't use real 3D/WebGL or perspective-skewed photos — parallel projection with `matrix()` only.
2. Don't hard-cut, wipe or slide between scenes.
3. Don't put more than one hero object or more than one caption on screen.
4. Don't use gold anywhere except the hero and its light; don't use pure black `#000` or pure white text.
5. Don't use bold/heavy type, outlined text, stickers, emoji, or kinetic word-by-word bouncing.

## 11. What we will not copy

- The reference's story (locked doors / key metaphor) and all its Arabic sentences and end-line.
- The channel name / signature shown on the end card.
- The exact key and door drawings — we draw our own prop library; the key is used here only as a description of the technique.

---

## 12. Engine notes

### (a) Scene vocabulary

Every video = one continuous camera path through 3–5 "worlds", with one hero object (chosen per topic: a lightbulb, coin, phone, leaf, pill, house, pen, heart, rocket, star…). Words below are word-IDs in the script; durations are minimums.

| # | Beat type | What appears | Trigger word | Min duration |
|---|---|---|---|---|
| 1 | **Spark Birth** | Empty pastel gradient → sparkle → outline draws → fill → extrusion grows | first content noun (the hero's name) lands the fill | 2.0 s |
| 2 | **Hero Float + Caption** | Hero idles with glow + contact shadow; thin caption at upper corner | caption phrase start = caption in | 2.0 s |
| 3 | **Spin Reveal** | Hero does a 360° yaw showing its thickness; sheen sweeps | a word meaning "look / actually / the truth" | 1.0 s |
| 4 | **Toss & Ascend** | Hero thrown up, tumbles; camera climbs the sky gradient (day→dusk→night, stars fade in) | verb of change/effort ("start", "jump", "try") | 1.8 s |
| 5 | **Portal Through Hole** | Camera dives into a hole/opening in the hero (or any closed shape) revealing the next world inside | the word that introduces the next idea | 0.6 s |
| 6 | **Angled Set** | A 2.5D room/landscape at fixed yaw/pitch (wall + moulding + floor + one target prop) | establishes "the problem" / place noun | 1.5 s |
| 7 | **Approach & Fit** | Hero flies in an arc into the target (slot, lock, socket, hand, pocket) | verb of joining ("open", "connect", "put") | 0.8 s |
| 8 | **Turn / Click** | Hero rotates 90° in place; tiny shake of the target | the stressed result word | 0.4 s |
| 9 | **Hinge Reveal** | Target (door, lid, book cover, box flap) rotates on a hinge; light leaks | "suddenly / then / so" | 0.8 s |
| 10 | **Light Bloom** | God rays, floor light, dust motes; camera pushes into the brightness → flash | the payoff noun | 1.2 s |
| 11 | **Morph Ascent Inverse** (Fall/Descend) | Camera follows hero down from night to day (optimism inversion) | words of return/arrival | 1.5 s |
| 12 | **Orbit Compare** | Two extruded objects turning side by side, one dims (choice/contrast) | "or / but / versus" | 1.5 s |
| 13 | **Poster Pull-Back** (end card) | Last world becomes a framed poster on a cream wall; headline lit word-by-word; sub-line; signature | final sentence | 2.5 s |
| 14 | **Shadow Hold** | Hero stops, glow dims to 40%, caption only (for a pause/question) | question mark / rhetorical question | 1.2 s |

Rules for the director: always start with #1 (or #6 then #1 inside it) and end with #13; at least one camera-carried transition (#4, #5 or #10) every ≤ 5 s; the same hero object persists through the whole video (it may be joined by at most one target prop per world).

### (b) Illustration approach

- **Construction:** each prop is a single closed SVG path in its own local 2D coordinates (u, v), plus optional hole sub-paths (counter-wound / `evenodd`). The engine projects it with a parallel `matrix(a,b,c,d,e,f)` derived from the rotated u/v axes; depth layers offset along the projected normal.
- **Stroke:** none on finished objects. Only the draw-on phase uses a 2 px (`#F5B54A`) outline at 1920 width (scale with object: 0.3% of object width, min 1.5 px).
- **Fills:** front face = 3-stop linear gradient (light/mid/dark of the object's hue), rotated with the light direction; extrusion = flat colour per layer stepping 18% darker from front to back; back face (when flipped) = mid-dark flat.
- **Shading:** Lambert term `max(0, n·L)` with fixed light from upper-left (L = (-0.4, -0.6, 0.7)) modulates the front-face brightness (0.65–1.15); specular band position = projection of the reflection vector.
- **Detail level:** 1–3 inset details per prop (groove ring, panel inset, notch), drawn as 1.5 px lines @ 0.12 black or 3 px darker inset fills. No outlines, no textures, no faces/characters with features. If a character is needed: a flat silhouette figure, extruded, faceless.
- **Environments:** flat polygons in a fixed angled projection; walls 2-stop gradients, a single moulding line, floors darker than walls by 30%.
- **Animate-in:** props never pop. Either (1) sparkle → draw-on → fill → extrude, or (2) arrive from off-frame along an arc while rotating, or (3) already exist in the next world revealed by a portal.
- **Hero hues for other topics:** keep the gold ramp as default; allowed alternates (still metallic): rose-copper `#FFD9C2/#E58A5F/#9C4A2B`, jade `#D9F7E8/#3FBF8F/#1E6E52`. One hero hue per video.

### (c) "Same creator" checklist (verify on stills)

1. ☐ The main object has visible thickness (side wall darker than face) in ≥ 80% of frames where it appears.
2. ☐ A soft-edged specular highlight sits on the object's face, in a different place across stills.
3. ☐ Background is a gradient (no flat colour) and changes world/palette at least twice in the video.
4. ☐ Fine film grain is visible when zoomed to 200%.
5. ☐ Any text is Alexandria 200–300, small, dark-on-light or light-on-dark, ≤ 7 words, never centred over the object.
6. ☐ No still looks like a "slide": there is always a single hero + an atmosphere, ≥ 60% empty space.
7. ☐ At least one still shows a camera-carried transition (object filling the frame, a circular reveal, or a light flash).
8. ☐ Interiors are seen from a slight angle (floor visible, moulding sloped), not straight-on.
9. ☐ Gold/accent appears only on the hero and its light.
10. ☐ The last still is a framed poster on a cream wall with a thin headline.

### (d) Sound design

Code-generated SFX only, no music by default (optional: a single soft pad at −28 LUFS under VO).
- **Birth:** metallic shimmer (bandpassed noise + 3 high sine partials, 0.6 s decay) on sparkle; tiny glass "tink" when fill completes.
- **Spin reveal:** short airy swish (0.25 s) per rotation.
- **Toss:** whoosh rising in pitch (0.8 s) + distant twinkle when stars appear.
- **Portal:** low "whump" / air suck (0.4 s, 60–120 Hz) exactly on the frame where the hole covers the screen.
- **Approach & fit:** metal slide (filtered noise, 0.3 s) then a **crisp click** (2 ms transient) on Turn.
- **Hinge:** soft creak (0.5 s) + warm swell (rising pad 0.8 s) as light grows.
- **Flash:** soft bright shimmer, then silence 0.2 s before the poster.
- **Poster:** gentle paper/frame settle tap; each lit headline word may get a very soft tick (−30 dB).
Density target ≈ 60–80 onsets/min; every SFX lands on an anchored word-ID, never free-running.
