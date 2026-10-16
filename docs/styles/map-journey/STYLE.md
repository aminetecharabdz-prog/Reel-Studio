# STYLE.md: Ink-Map Cinematic Journey

Style id: `map-journey` · Reference: 34.0 s, 1280×720 @ 30 fps, one continuous shot (0 hard cuts), SFX only.
All pixel values are normalised to a **1920×1080** frame (reference px × 1.5) unless stated. Section 4.4 gives the
redesign rules for 9:16, 4:5 and 1:1.
Analysis sheet for side-by-side checks: `docs/styles/map-journey/ref-sheet.jpg`.

---

## 1. Overall feeling

A hand-inked antique map lying on a dark wooden desk; the camera dives from above through cloud, tilts the map into a
3D plane and follows a small traveller along a red dashed route, stopping at each place for a stamped flag and a paper
note. It feels like a scholarly, calm documentary — warm paper, brown ink, one brick-red thread of story.
It is recognisable at a glance by: the **sepia paper plane in perspective with a desk band at the top**, **teal-grey
seas outlined by three parallel water lines**, and **a single red dashed route with red pennant flags**.

## 2. Colours

| Name | Hex | Share (approx.) | Use |
|---|---|---|---|
| Paper (centre) | `#EAD9B5` (measured `#E5D5B3`–`#E8D9B8`) | 50 % | Land / map ground, centre of the vignette |
| Paper (edge) | `#C9AA72` → darkest corner `#A7A18A` | 15 % | Radial vignette toward paper edges and frame corners |
| Paper (highlight) | `#EDE0C2` | 4 % | Hot-spot of the vignette, card paper |
| Card paper | `#F3E8CA` | 3–8 % | Title card, station cards, HUD panel |
| Sea | `#BFCDBE` (measured `#BBC8B6`, `#B8C3B1`) | 14 % | Flat sea fill (no gradient) |
| Sea label ink | `#5E7470` | <1 % | Sea names, written in the sea |
| Ink | `#3B2716` (darkest strokes `#261A0F`) | 5 % | Coastlines, text, mountains, camel, compass |
| Faded ink | `#867C67` | 4 % | Small labels, graticule, captions in cards, HUD labels |
| Mountain shade | `#C4B596` | inside 13 % | Shaded half of every mountain glyph |
| Route / accent red | `#9C2A1C` (flag cloth measured `#A12820`) | <1 % | Route, flags, station seals, year number, key numbers |
| Gold | `#B8862B` | <0.5 % | Compass needle half, seal cross, card hairline ornament |
| River blue-grey | `#6F8E95` | <0.5 % | Rivers (1.5 px), drawn over land |
| Desk | `#24170E` (measured `#27190E`) | 0–12 % | Visible above the tilted paper and as side bars in the flat view |
| Cloud | `#FFFFFF` @ 0.55–0.85 | transient | Only during descent / final pull-out |

**Accent rule:** red `#9C2A1C` is reserved for *the journey itself*: the route line, flags/seals at stations, the year
counter, and key numbers in the end card. Never use red for decoration, borders, region labels or body text. Gold
appears only inside small instruments (compass, seal cross). At most **one** new red element enters per beat.

## 3. Typography

| Role | Reference look | Font (installed) | Weight | Size @1080p | Line-height |
|---|---|---|---|---|---|
| Hero title (title card, end card headline) | Ruq'ah calligraphic, heavy, ink-brush, slight slant | **Aref Ruqaa** | 700 | 84 px (end-card headline 60 px) | 1.4 |
| City / station name (on map, under flag) | Same Ruq'ah, black ink with paper-coloured halo | **Aref Ruqaa** | 700 | 30 px at map zoom 1 (scales with camera, clamp 24–44 px) | 1.35 |
| Card title | Ruq'ah | **Aref Ruqaa** | 700 | 42 px | 1.35 |
| Region labels (land) | Ruq'ah, faded ink | **Aref Ruqaa** | 400 | 36–60 px by region size, opacity 0.55–0.7 | 1.35 |
| Sea labels | Ruq'ah, teal ink, large, sparse | **Aref Ruqaa** | 400 | 48–64 px, `#5E7470` @ 0.8 | 1.35 |
| Body (card fact, subtitle) | Classic Naskh book face | **Amiri** | 400 | 30 px (title-card subtitle 30 px in red) | 1.5 |
| Small labels (towns, HUD captions, source line) | Naskh, faded | **Amiri** | 400 | 18–20 px, `#867C67` | 1.4 |
| Numbers (year, km, dates) | Old-style serif digits, bold | **Amiri** | 700 | HUD 42 px; card date 22 px | 1.2 |

- Digits: Western digits `0-9` with thousands comma (`4,120 كم`) as in the reference; set `font-variant-numeric:
  tabular-nums` on counters so they do not jitter. Bidi-isolate every number (`<bdi>`/`unicode-bidi: isolate`).
- City names on the map get a 3 px paper-coloured halo (`paint-order: stroke`, stroke `#EAD9B5`, 0.9 opacity) so they
  stay legible over route and coast.
- No `letter-spacing` on Arabic, never per-letter animation; reveals use a right-to-left clip mask.

## 4. Composition

### 4.1 Margins and safe area (16:9)
- Paper inset from frame in the flat (top-down) view: 42 px left/right, desk visible as dark bars; top/bottom bleed.
- Double frame on the paper: outer rule 2 px ink @ 0.7, inner rule 1 px @ 0.5, gap 9 px, 30 px inside the paper edge.
- UI safe area for cards/HUD: 60 px from left/right, 48 px from top, 72 px from bottom.

### 4.2 Positions
- **Title card** (opening): 753 × 288 px, centred horizontally, centre at y = 474 (slightly above middle). Double rule
  inset 9 px. Shadow `0 18px 40px rgba(36,23,14,0.35)`.
- **HUD panel** (journey): 327 × 232 px, anchored top-right (top 48 px, right 60 px). Contents RTL: small header (journey
  name, Aref Ruqaa 30 px) · hairline · two columns «السنة» (red year 42 px, right) and «المسافة» (km 42 px, left) ·
  row of N progress dots (12 px diameter, 9 px gap; visited = filled ink, upcoming = 1.5 px ink ring).
- **Traveller** sits on the route, framed at ~40–45 % from left and ~50–55 % from top while moving (the camera centre is
  between the traveller and a point ~8 % ahead on the route).
- **Station card**: 426 × 168 px, placed up-right of the flag by (+90 px, −130 px) and clamped to the safe area; never
  overlaps the HUD, the flag or the current city label. A dashed ink leader (1.5 px, dash 5/5, ink @ 0.6) curves from the
  card's lower corner to the flag top.
- **End card**: 640 × 255 px, centred horizontally, top at 72 px; the full route occupies the middle/lower 70 %.

### 4.3 Density and empty space
- 1 traveller + ≤ 2 flags in focus + 1 card + HUD — max **5 foreground objects**; the map texture is background.
- ~35 % of the frame is calm paper/sea without labels. Region labels are sparse: ≤ 4 visible at any time.
- Reading direction RTL: card text right-aligned; HUD reads right→left (year on the right). The route itself goes
  wherever geography says — direction of travel is **not** forced to RTL.

### 4.4 Redesign per aspect ratio (never letterbox)
The map is a plane; we re-frame the camera, not the artwork. Fit the projection to the **route bounding box + 12 %
padding**, matched to the output aspect.

| Aspect | Camera tilt | HUD | Station card | Title / end card | Type scale |
|---|---|---|---|---|---|
| 16:9 (1920×1080) | 38° | top-right 327×232 | up-right of flag, 426×168 | 753×288 centred | 1.00 |
| 1:1 (1080×1080) | 34° | top-right, ×0.9 | above flag, 400×160 | 900 wide, centred y 40 % | 1.00 (base = min side) |
| 4:5 (1080×1350) | 32° | top full-width strip 960×150 (year · km · dots in one row) | below or above flag (choose side with more space), 900×190 | 940 wide | 1.05 |
| 9:16 (1080×1920) | 28° (less tilt → more readable vertical land) | top strip 960×160 at y = 120 | lower third, 940×220, top edge ≥ 1250, bottom ≤ 1620 (keep 300 px for platform UI) | 960 wide at y = 30 % | 1.15 |

- Font sizes scale with `min(width, height) / 1080 × typeScale`.
- In 9:16 prefer routes that run north–south on screen; if the route is mainly east–west, rotate nothing — instead
  zoom in tighter (scale +25 %) and let the camera follow; the route keeps leaving frame which is fine.
- Desk band: only visible at the top in tilted views, 6–12 % of height in every aspect.

## 5. Recurring elements

| Element | Exact look | When |
|---|---|---|
| Coastlines | Ink `#3B2716`, 2.2 px at zoom 1 (map-space units, so it thickens with zoom), smoothed Catmull-Rom with tiny fixed hand jitter (±0.6 px, seeded) | Always; drawn on in the opening |
| Water lines | 3 strokes parallel to every coast inside the sea, offsets 6/12/18 px, 1 px, ink @ 0.35/0.25/0.15 | Always |
| Sea fill | Flat `#BFCDBE` | Fades in after coasts are drawn |
| Graticule | Lat/long lines every 10°, 1 px ink @ 0.10 | Always, faint |
| Mountains | Rows of small "^" peaks along real ranges, 14–22 px wide, 10–16 px tall; outline 1.4 px ink; left/shadow half filled `#C4B596`; peaks overlap 30 % | Always |
| Dunes / sand | Sparse dots 1.5 px ink @ 0.25 and short arcs in deserts, seeded, never inside sea | Always |
| Rivers | 1.5 px `#6F8E95`, tapered toward source | Always |
| Compass rose | 8-point star, ~150 px diameter in 16:9 opening, ink outline, alternating gold `#B8862B` / ink fills, double circle ring, small «شمال» label | Placed in an ocean corner; visible in wide shots |
| Ships | Tiny lateen boat 40×30 px with red pennant, ink outline, short wave strokes under it | 1–3 per sea, static with 2 px bob |
| Old-map stains | 2–4 faint circular rings, radius 90–140 px, ink @ 0.05–0.07 | Background texture |
| Route | Under-stroke 7 px `#9C2A1C` @ 0.18 + dashed top stroke 3 px `#9C2A1C`, dash 10 / gap 7, round caps | Grows behind traveller |
| Flag | Pole 2 px ink, 72 px tall; triangular pennant 40×26 px `#A12820` with 1 px darker edge; base: red disc 16 px with ink ring + small shadow ellipse | Rises at each station |
| Station seal (wide view) | Red disc 26 px, 2 px ink ring, small gold cross inside | Replaces flags in the grand pull-back |
| Traveller | Side-view silhouette (camel / rider / car / ship — chosen by topic), ink `#43311B`, with a red blanket accent; ~60 px tall at journey zoom; contact shadow ellipse 40×8 px ink @ 0.25 | Moves along route |
| Dust | 3–5 puffs behind traveller, radius 4–10 px, `#C9AA72` @ 0.35 → 0, life 0.6 s | While moving on land |
| Station card | Paper `#F3E8CA`, 1 px ink rule inset 6 px, title (right) + red date (left) on first row, hairline, fact on second row; shadow `0 10px 24px rgba(36,23,14,0.30)` | At each station with a fact |
| HUD panel | Same paper card, title / year / km / dots | From the end of descent to the pull-back |
| Desk | Flat `#24170E` with a subtle 2-stop gradient to `#1A100A`; paper edge has 1 px light `#F3E8CA` @ 0.5 bevel | Whenever the paper edge is in frame |

## 6. Motion vocabulary

| Event | How exactly | Duration | Curve |
|---|---|---|---|
| Coast ink-draw (opening) | `strokeDasharray` with `pathLength=1`, all coasts start together, longest finishes last | 1.0 s | easeInOutSine |
| Sea fill appear | opacity 0 → 1 after coasts | 0.8 s (starts 0.6 s after draw start) | easeOutQuad |
| Details appear (mountains, labels, compass, ships) | staggered opacity 0 → 1, 40 ms per item, labels clip-reveal RTL | 0.8 s total | easeOutCubic |
| Title card enter | opacity 0 → 1, scale 0.96 → 1.0, y +12 → 0 | 0.35 s | easeOutCubic |
| Title card exit | opacity 1 → 0, scale 1.0 → 1.02 | 0.3 s | easeInCubic |
| Camera descent + tilt | through cloud layer: zoom ×1 → ×3, `rotateX` 0° → 38°, centre moves to first station; clouds (6–8 soft blobs, blur 30 px) scale past camera | 1.6 s | easeInOutCubic |
| HUD panel enter | opacity 0 → 1, y −10 → 0 | 0.3 s | easeOutCubic |
| Flag rise (stamp) | pole grows from base, pennant scales 0 → 1 from pole; overshoot | 0.25 s | spring {damping 12, stiffness 180, mass 0.6} |
| City name write | clip mask right→left | 0.4 s | easeOutQuad |
| Station card enter | opacity 0 → 1, y +8 → 0, leader line draws after | 0.3 s (+0.2 s leader) | easeOutCubic |
| Station card hold | static | ≥ max(1.4 s, 0.3 s × words + 0.6 s) | — |
| Station card exit | opacity 1 → 0 | 0.2 s | easeInQuad |
| Traveller leg | position by arc-length along route; route revealed up to traveller | 1.8–4.0 s per leg | easeInOutSine per leg |
| Traveller gait | 2 px vertical bob at 4 Hz, ±3° rock | continuous while moving | sine |
| Camera follow | centre = lerp(traveller, look-ahead point); zoom drops −20 % mid-leg on long legs and returns on arrival | per leg | easeInOutSine |
| Station push-in | extra zoom +15 % while card is up | 0.6 s | easeInOutCubic |
| HUD counters | km counts with route progress (haversine distance distributed along arc length), year steps on arrival | continuous | linear in arc length |
| HUD dot | next dot fills | 0.2 s | easeOutBack |
| Grand pull-back | zoom → whole route, `rotateX` 38° → 0°, through a light cloud veil; flags collapse to seals | 1.5 s | easeInOutCubic |
| End card | opacity + y +12 → 0; red numbers count up | 0.4 s (count 0.8 s) | easeOutCubic |

No scene cuts. Everything is one camera move; "transitions" are camera moves between map regions.

## 7. Rhythm

- Shot length: one continuous 34 s shot; internal beats every **≈ 3.5 s** (7 stations in ~25 s).
- Cuts per minute: 0. Stillness: 53 % of time the frame barely changes (map holds while a card reads).
- Per station: arrive (0.25 s flag) → name (0.4 s) → card (≥ 1.4 s hold) → leave. Travel legs 1.8–4 s.
- Words on screen at once: card title 1–2 words + fact 3–7 words; never more than **12** words visible (HUD excluded).
- Motion follows the **sentence**: a place name word triggers arrival; the fact sentence holds the card; a movement
  sentence ("ثم سافر إلى …") drives the next leg. Numbers in speech trigger counter emphasis (scale 1.0 → 1.12 → 1.0,
  0.3 s).

## 8. Texture and finish

- Paper vignette: radial gradient centre `#EAD9B5` → edge `#C9AA72`, plus a multiply layer of `#5A3F22` @ 0.18 in
  the outer 25 %. Corners noticeably darker (reads like a lit desk).
- Paper grain: fine noise, opacity 0.05, static (seeded, not per-frame flicker); fibres/blotches at 0.03.
- Fold creases: 1 vertical + 1 horizontal crease at thirds, 1 px light `#F6EBD0` @ 0.35 next to 1 px dark @ 0.08.
- Shadows: cards `0 10px 24px rgba(36,23,14,0.30)`; title card deeper `0 18px 40px rgba(36,23,14,0.35)`; objects
  standing on the map have contact ellipses, no cast shadows.
- Glow: none, except a soft warm pool `#E6B86A` @ 0.25, radius 60 px, under the final destination seal.
- Motion blur: none. Clouds blur 30 px. Depth of field: none.
- Ink lines have no anti-alias tricks — crisp SVG; keep the SVG inside the tilted div and zoom inside the SVG so lines
  stay sharp.

## 9. Sound in the reference

- Voice-over: none in the reference (SFX only). Our product adds the user's voice; the style must also work with VO.
- Music: none.
- SFX: sound present 100 % of the time (continuous wind bed) with **≈ 32 onsets per minute**: pen scratch while coasts
  draw, a whoosh on the descent, soft padded footsteps while travelling, a stamp thud for each flag, a paper rustle for
  each card.

## 10. Do / Don't

**Do**
1. Keep one continuous camera: move between places, never hard-cut.
2. Keep red exclusively for the journey (route, flags, year, key numbers).
3. Ground every standing object (traveller, flag) with a contact shadow and correct perspective scale `P / (P − z)`.
4. Hold each card long enough to read (≥ 0.3 s × words + 0.6 s) and pause the traveller while it is up.
5. Use real geography (lat/long) when the topic has places; use historical/poetic region names written in Ruq'ah.

**Don't**
1. Don't add gradients, glows or saturated colours to the map — it is flat paper, flat sea, brown ink.
2. Don't let labels collide (the reference's end frame overlaps two city names and hides one under the end card — we
   run a collision pass and offset/stack labels with leader lines).
3. Don't move the camera and the card at the same time — the camera settles, then the card appears.
4. Don't use more than one typeface family per role (Ruq'ah for names, Naskh for reading text).
5. Don't letterbox other aspect ratios; re-fit the projection and re-place HUD/cards per 4.4.

## 11. What we will not copy

- The specific historical story, its title, its seven cities and every text line of the reference (dates, facts, the
  closing sentence and the book citation).
- The channel name and any credits.
- The exact route shape and the specific traveller (a camel is one option among many; choose per topic).
- We take only the look: antique inked map, tilted camera, red dashed route, flags, paper cards, HUD counter.

---

## 12. Engine notes

### 12a. Scene vocabulary

The map is one persistent world per video; "scenes" are beats on it. The director plans a list of **places** (lat/lon
or invented coordinates) and a list of beats; the engine builds the map bounds from the places.

| # | Beat type | What appears | Trigger words → action | Min duration |
|---|---|---|---|---|
| 1 | `inkReveal` (opener) | Coasts draw, sea fills, details stagger in, title card with topic + subtitle | first word of the title sentence → draw start; topic noun → title card | 2.5 s |
| 2 | `descent` | Clouds, zoom + tilt onto the first place, HUD enters | first place name / start verb (انطلق، بدأ، خرج) → camera lands as the word ends | 1.6 s |
| 3 | `arrive` | Flag stamps up, place name writes on the map, HUD dot fills, year updates | the place-name word → flag at its start, label at its end | 1.0 s |
| 4 | `noteCard` | Paper card linked to flag: title, red date, one fact | first word of the fact sentence → card in; card out after the sentence's last word + 0.3 s | max(1.4 s, 0.3 s × words + 0.6 s) |
| 5 | `travelLeg` | Traveller moves along the route, dust, camera follows, km counter ticks | movement verb or «إلى» + destination → leg starts; destination word → arrival | 1.8 s (short) / 3–4 s (long) |
| 6 | `regionCallout` | A region or sea label inks in large (clip reveal) with a slow +10 % zoom | region/sea name word | 1.0 s |
| 7 | `landmark` | Small ink vignette pops on the map (tower, gate, palace, mine, factory, tree) with stamp + mini caption | a concrete noun tied to the place | 1.2 s |
| 8 | `seaCrossing` | Traveller swaps to a boat silhouette; route becomes a dotted arc over water; wave strokes | «البحر», «سفينة», «عبر» | 2.0 s |
| 9 | `measure` | Brass divider/ruler: dashed line between two points + red km/day label in the middle | a distance or duration number | 1.5 s |
| 10 | `timeJump` | HUD year flips (roll up 0.3 s), a small calendar stamp near HUD | a year/date word | 0.8 s |
| 11 | `compare` | Two routes/areas tinted (hatched ink 15 %) with labels A/B | comparison words (أكثر، مقابل، بينما) | 2.0 s |
| 12 | `grandPullback` | Camera to whole route, tilt to 0°, flags → seals, route complete | the concluding sentence's first word | 2.0 s |
| 13 | `endCard` | Paper card: headline (Ruq'ah), key numbers in red, source/CTA line | last sentence; numbers count when spoken | 3.0 s |
| 14 | `allegoryMap` (variant) | For non-geographic topics: invented islands/continents labelled with concepts (e.g. "جزيرة الفكرة"), same ink rules; route = process steps | used when no real places | — (replaces 1–2) |

Planning rules: at most one card visible; ≥ 0.6 s camera-still before a card; legs between consecutive places are
ordered; places farther than 35 % of map width apart get a long-leg zoom-out.

### 12b. Illustration approach

- Everything is SVG drawn in **map space** (zooms with camera) except standing objects, which are overlaid in screen
  space using the perspective transform (`Y' = Y·cosθ`, `z = Y·sinθ`, scale `P/(P−z)`, P = 1400 px) so they stand up.
- Line: ink `#3B2716`, 1.4–2.2 px, round joins, seeded ±0.6 px jitter; no pure geometric perfection.
- Fill: flat paper tones only (`#EAD9B5`, `#C4B596`, `#BFCDBE`, red `#9C2A1C` for small flags/accents). One shading
  method: **hatched or flat half-fill on the shadow side** (light comes from top-right), never gradients.
- Silhouettes (traveller, landmarks): solid ink fill + one red detail; 40–80 px tall on screen; built from ≤ 6 paths.
- Landmarks are small "map vignettes" (≤ 90 px), outline + half-fill, sitting on a short ground stroke.
- Animate-in: lines draw on (`pathLength`), fills fade after lines (0.3 s), standing objects spring up from their base
  (scale Y 0 → 1, spring damping 12), labels clip-reveal RTL.
- Library to provide: coast/landmass generator (from lat/lon polygons or seeded blobs), mountain row, dune field,
  river, compass, ship, flag, seal, traveller set (camel, horse rider, walker, car, truck, ship, plane), landmark set
  (tower, mosque/dome, gate, palace, lighthouse, factory, oil rig, tree grove, city cluster).

### 12c. "Same creator" checklist (verify on stills)

1. Paper is sepia with a darker radial vignette and a dark wood desk visible at the top in tilted shots.
2. Seas are flat teal-grey `#BFCDBE` with three thin parallel water lines along every coast.
3. Exactly one red: the dashed route, red pennant flags/seals, red year/numbers — nothing else red.
4. Mountains drawn as rows of small half-shaded peaks along ranges.
5. Place/region names in Ruq'ah (Aref Ruqaa); reading text and numbers in Naskh (Amiri).
6. Map plane is tilted (~30–40°) with standing objects in correct perspective and contact shadows.
7. A paper HUD with year, distance and progress dots in the top corner/strip during the journey.
8. Station cards are cream paper with a thin inset rule, title + red date + one-line fact, linked by a dashed leader.
9. A compass rose and at least one tiny ship decorate the sea in wide shots.
10. No hard cuts; no glows, no saturated or neon colours.

### 12d. Sound design

| SFX | When | Notes |
|---|---|---|
| Wind / room-tone bed | Whole video | −30 dB under VO, fade in 1 s, fade out 1.5 s |
| Pen scratch (loop) | During `inkReveal` and any `regionCallout`/`measure` drawing | Duck with VO |
| Air whoosh (low) | `descent` and `grandPullback` | Peak aligned to the moment the tilt ends |
| Padded footsteps / hooves / engine (by traveller) | While a `travelLeg` moves | ~2 steps/s, −24 dB |
| Rubber-stamp thud | Each flag rise (`arrive`) | Peak on the spring's first overshoot |
| Paper rustle | Each `noteCard` in (and softer on out) | |
| Soft wood tick | HUD year flip / `timeJump` | |
| Waves | `seaCrossing` | |
| Low warm swell | `endCard` numbers | Optional; no music by default |

Target ≈ 30–35 onsets per minute — calm, not busy.
