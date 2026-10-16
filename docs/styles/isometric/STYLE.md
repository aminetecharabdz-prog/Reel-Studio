# STYLE.md: Isometric Living World

> Style id: `isometric` · Reference: `ref/msk/styles/isometric/reference.mp4` (1280×720, 30 fps, 28.0 s, SFX only).
> Analysis sheet: `docs/styles/isometric/ref-sheet.jpg` (contact sheet 0.5–14.5 s + motion strip 8.6 s "camera travels cloud → warehouse following a data packet" + motion strip 24.5 s "final pull-back + title reveal").
> All px values are normalised to a **1920×1080** frame at camera zoom 1.0 (reference px × 1.5). Colours sampled from stills and cross-checked with `palette.json`.

---

## 1. Overall feel
One big, toy-like isometric world — a thick floating ground slab split into colour-coded districts — and the camera travels across it following a single "thing" (a parcel, a data packet, a vehicle) as it moves through a process. It feels like a calm, premium explainer: soft pastel candy colours on a lavender sky, no outlines, three-tone shaded boxes, gentle life everywhere (blinking lights, swaying trees, a traffic light changing). It is recognisable at first glance by the 30° isometric projection, the pastel slab floating on `#EDEFFC`, and the clean white UI overlays (step bar at the bottom, pill tags with numbered discs) sitting above the world.

## 2. Colours
| Name | Hex | Share (approx.) | Use |
|---|---|---|---|
| Sky / background | gradient `#EAF1FF` (top-left) → `#F4F1FF` (bottom-right); mean `#EDEFFC` | 44 % | Behind the world, always. Linear 135°. |
| Residential ground | `#E4F5DC` (palette `#E9EDDB`) | 20 % | Grass district top face. |
| City ground | `#EEF0F8` | ~8 % | Downtown district top face (with faint `#E2E5F2` plot lines 2 px). |
| Industrial ground | `#F6EEDC` | ~6 % | Warehouse/factory district top face. |
| Slab side faces | left `#C7CEF3`, right `#BCCCEA` | 15 % | Thickness of the ground slab (40–60 px). |
| Road | `#CCD2EA` with white dashes `#FFFFFF` 80 % | ~5 % | Main road + branches; zebra crossing white stripes. |
| Ink (text) | `#1E1B4B` | <2 % | All UI text, phone bezel `#141625`, poles `#4E5B64`. |
| Phase 1 — indigo | `#6366F1` | 3 % | Step 1 / brand of the process, server tower, person's shirt, step-bar progress line. |
| Phase 2 — amber | `#F59E0B` (light `#FCD34D`, roof `#B45309`) | 4 % | Data packets, warehouse, step tags. |
| Phase 3 — teal | `#14B8A6` (building `#5EEAD4`/`#99F6E4`) | 4 % | Shipping step, teal tower. |
| Phase 4 — rose | `#E11D48` (building `#F9A8D4`/`#F472B6`) | 5 % | Final step / arrival, pink tower, confetti. |
| Tree green | `#34D399` (shade `#10B981`), trunk `#8B3A0F` | 2 % | Every tree: sphere crown + box trunk. |
| Roof oranges/reds | `#EA580C`/`#C2410C`, `#DB2777`/`#BE185D`, `#2DD4BF`/`#14B8A6` | 3 % | House pyramid roofs (lit face / shade face). |
| UI white | `#FFFFFF` (cards `#FAFAFD`) | 3 % | Step bar, pills, cards, phone screen, clouds. |
| Success green | `#10B981` (CTA `#22C55E`) | <1 % | Check icons, "confirmed" states. |
| Lamp yellow | `#FDE68A` | <1 % | Street-lamp heads. |

**Box shading rule** (every solid): top face = base colour lightened 18 %, left face = base, right face = base darkened 18 % (light comes from top-left). E.g. indigo tower: top `#C7D2FE`, left `#A5B4FC`, right `#818CF8`; pink: `#FCD0E9` / `#F3ABD3` / `#DB7DAF`; warehouse wall: `#FCD34D` left / `#F59E0B` right, roof `#B45309` / `#92400E`.

**Accent rule.** The four phase colours map 1:1 to the steps of the process (in order: indigo, amber, teal, rose). A phase colour appears in the UI (step node, pill number disc, numbered map tag) **only once that phase is active or done**. Saturated colours on buildings are allowed everywhere, but the brightest moving element on screen must be the protagonist (packet/parcel/vehicle) — give it amber `#F59E0B` with a halo.

## 3. Typography
Reference: geometric, rounded, modern Arabic sans in 3 weights. We use **Readex Pro** (400/500/700); fallback **IBM Plex Sans Arabic**. Numbers in tags use Arabic-Indic digits in Readex Pro 700.

| Role | Reference look | Font · weight | Size @1920×1080 | Line height | Colour |
|---|---|---|---|---|---|
| Title (open / end) | heavy, tight, top-right block | Readex Pro 700 | 72 px | 1.35 | `#1E1B4B` |
| Subtitle | regular, under title | Readex Pro 500 | 36 px | 1.45 | `#4C4A72` |
| Status card title | bold | Readex Pro 700 | 30 px | 1.4 | `#1E1B4B` |
| Status card body | regular, grey | Readex Pro 400 | 22 px | 1.45 | `#6B7280` |
| Pill tag (world label) | bold, 1–3 words | Readex Pro 700 | 27 px | 1.35 | `#1E1B4B` |
| District label (on world) | bold, coloured | Readex Pro 700 | 40 px | 1.35 | `#6366F1` (or district accent) |
| Step-bar labels | bold if active/done, regular + 50 % grey if pending | Readex Pro 700 / 500 | 21 px | 1.35 | active `#1E1B4B`, pending `#9CA3AF` |
| Phone UI | header bold white, product name bold, price medium indigo | Readex Pro 700/500 | 24–30 px | 1.4 | — |
| Numbers / code | — | IBM Plex Mono 600 (Latin) / Readex Pro 700 (Arabic-Indic) | 22–27 px | 1.35 | — |

Project text rules: `line-height` ≥ 1.35, no `letter-spacing` on Arabic, never split words into letters, every text stays ≥ 0.3 s × words + 0.6 s. All Arabic text is HTML positioned over the SVG at a projected world point — never SVG `<text>` with `textAnchor="end"` + `direction="rtl"`.

## 4. Composition
- **Margins / safe area:** 64 px sides, 48 px top, step bar bottom edge at 1080 − 42 px.
- **Step bar:** bottom-centre, 1040×90 px white pill (radius 24, shadow 0 8 px 24 px `rgba(30,27,75,0.08)`), 5 nodes evenly spaced 205 px apart, RTL (first step on the right).
- **Main subject** sits in the central 60 % of the frame, slightly above centre (y 300–700) so the step bar never covers it. Camera target is the protagonist's world point projected to (960, 480).
- **Title block** top-right (right edge x = 1838, top y = 60) only on the opening and the final overview — never over busy buildings; when the world is behind it, the camera frames the world so the top-right 35 % × 22 % is sky.
- **Status cards / phone mockup** float in the sky area above the protagonist (centre x ≈ 960, top y ≈ 110), never covering the protagonist.
- **Elements per frame:** 1 district fully visible + parts of 1–2 neighbours; 8–20 world objects (buildings, trees, poles), 1 protagonist, ≤ 2 UI overlays (+ step bar).
- **Empty space:** ≈ 30–40 % sky; the world slab is cropped by the frame edges most of the time (except the final overview: whole slab at ≈ 70 % frame width).
- **Reading direction:** RTL for all UI. The world's process path should run, on screen, from upper-right/right to left/lower-left when possible so travel matches reading direction.

**Aspect ratios (redesign, never letterbox):**
- **9:16 (1080×1920):** camera zoom ×1.25 vs. 16:9; lay districts along the world **x+y diagonal** (which projects vertically on screen) so the journey travels top→bottom; protagonist target at (540, 860). Step bar: 1000×110 px at bottom (y 1720–1830), labels 26 px; if > 5 steps, show only current ±2 with fade edges. Title block top (y 120–380), right-aligned at x = 1016, title 84 px. Status cards 920 px wide in the y 300–600 band. Final overview: whole slab rotated so its long axis is vertical-ish (choose world layout 2×N districts), filling ≈ 90 % width.
- **4:5 (1080×1350):** zoom ×1.1, protagonist at (540, 620), step bar y 1210–1300, title 76 px.
- **1:1 (1080×1080):** zoom ×1.0, step bar 1000×84 at bottom, title 64 px, cards max 900 px wide.
- **16:9:** as measured.

## 5. Recurring elements
1. **Ground slab** — isometric plate, top face divided into districts (colour per district), side faces 48 px thick (`#C7CEF3` left / `#BCCCEA` right). Floats on the sky with a very soft shadow (blur 60 px, `rgba(99,102,241,0.12)`, offset y 40 px).
2. **Roads** — 1.6 units wide, `#CCD2EA`, dashed centre line (white, 4 px, dash 28/22 px), zebra crossings at junctions (6 white bars).
3. **Buildings** — extruded boxes, 3-tone shading, no outlines; top edges get a 1.5 px white line at 45 % opacity. Windows: grid of small rounded rectangles (16×20 px at zoom 1, 2 px radius) in a lighter tone (top colour) on both walls, applied with a face `matrix()`. Doors darker (`#7C2D12`), signs = white rounded plaques with 1–2 words.
4. **Houses** — box + pyramid roof (2 visible roof faces, lit/shade), 1 door, 2 windows per wall.
5. **Trees** — sphere crown Ø 60 px (radial highlight top-left `#6EE7B7` → `#34D399` → `#10B981`), trunk box 14×36 px `#8B3A0F`/`#6B2D0A`, flat diamond shadow `rgba(0,0,0,0.08)`.
6. **Street furniture** — lamp posts (3 px `#4E5B64` pole, Ø 18 px `#FDE68A` head with 3 px dark ring), traffic light (dark box `#1F2937`, 3 lamps Ø 18 px: red `#EF4444`, amber `#F59E0B`, green `#22C55E`).
7. **Protagonist object** — parcel (kraft box `#EBBF8E`/`#D9A066`/`#C98B4E`), vehicle (white body + coloured cab `#F43F5E`), or data packet (amber dot Ø 20 px + halo ring Ø 40 px at 30 %).
8. **Data path** — dotted arc between two world points (3 px amber dots, gap 9 px), packet dots travel along it with a halo; arc peak 25–35 % of chord length above.
9. **People** — 70 px tall at zoom 1: round head Ø 26 px skin `#F5C99B` with dark-brown hair cap, pill body `#6366F1`, two navy legs `#1E1B4B` 7 px, tiny shadow.
10. **UI overlays (above the world, in HTML):**
    - **Pill tag** — white, height 60 px, radius 30, padding 0 24 px, shadow 0 6 px 18 px `rgba(30,27,75,0.10)`, numbered disc Ø 38 px in the phase colour with white digit on the reading-start side (right).
    - **Status card** — 540×108 px, white, radius 30, icon tile 52 px (`#EEF2FF` bg, indigo icon) at right, check disc `#10B981` at left, title + grey body.
    - **Phone mockup** — 300×555 px, bezel 12 px `#141625`, radius 42, header bar in phase colour with white store name, product tile `#EFF1FD`, big CTA button radius 28 (amber → green on confirm).
    - **Step bar** — see §4; nodes Ø 34 px: pending = white with 3 px `#C7CBEA` ring; active = filled phase colour + white ✓ + 10 px halo ring at 25 %; done = filled phase colour + ✓. Connector line 4 px: pending `#E0E3F5`, done `#6366F1`.
    - **Numbered map tags** (final overview) — discs Ø 40 px in phase colour, white Arabic-Indic digit, white 3 px ring, placed at each station.
11. **Clouds** — white blobby clusters (overlapping circles Ø 60–120 px) with flat lavender under-shadow `#DDE1F7`; floating island = slab on a cloud.

## 6. Motion vocabulary
| Event | Exactly how | Duration | Curve |
|---|---|---|---|
| Title entrance | Fade 0→1 + rise 20 px, subtitle 0.15 s later | 0.40 s | easeOutCubic |
| Title exit | Fade to 0 + drift up 12 px while camera starts moving | 0.30 s | easeInCubic |
| Pill tag entrance | Scale 0.6→1.05→1 from its anchor point + fade; tiny 8 px rise | 0.25 s | spring damping 14, stiffness 170 |
| Pill tag exit | Fade + scale 0.9 | 0.20 s | easeInCubic |
| Status card entrance | Slide down 30 px + fade, check disc pops 0.15 s later (scale 0→1.2→1) | 0.35 s + 0.20 s | easeOutCubic; check easeOutBack |
| Phone mockup entrance | Rise 60 px + scale 0.9→1 + fade | 0.45 s | spring damping 16 |
| Button tap | Ripple circle 0→1.6× button height, 40 %→0 opacity; button scale 1→0.94→1; label swaps to confirm state with colour lerp amber→green | 0.35 s | easeOutQuad |
| Keyword emphasis | The world object that the keyword names gets a halo pulse (ring scale 1→1.6, opacity 0.5→0) and a 6 % bounce | 0.40 s | easeOutCubic |
| Step-bar progress | Connector line fills right→left over the segment, then node fills + ✓ + halo pulse | 0.40 s + 0.25 s | easeInOutCubic; node easeOutBack |
| Camera travel between districts | World-space keyframe [t, x, y, z, zoom]; smooth pan, no cut | 1.4–2.0 s | easeInOutCubic |
| Camera follow | Blend weight 0→1 over 0.6 s from keyframe camera to "track the protagonist" | continuous | easeInOutSine for the blend |
| Final pull-back | Zoom 1.0 → 0.45 to reveal the whole slab, title fades in during last 30 % | 2.0 s | easeInOutCubic |
| Data packet flight | Dots spawn every 0.12 s and travel the dotted arc; the lead packet has a halo | 1.2–1.5 s per hop | easeInOutSine along arc length |
| Parcel hop | Parabolic jump (peak 1.2 units), squash 0.85 on landing | 0.50 s | y quadratic; landing spring damping 10 |
| Vehicle drive | Moves along road polyline at constant speed with ease-in/out at stops; at a turn it flips facing with a 6 px hop + squash 0.9 to hide the swap | segment-dependent; turn 0.15 s | easeInOutQuad |
| Door open | Door rect scales Y 1→0 (rolls up) | 0.40 s | easeOutCubic |
| Conveyor | Belt stripes scroll 60 px/s; item rides | continuous | linear |
| Life loops | Trees sway ±2° (period 3 s, phase per tree from `random(seed)`), server LEDs blink (period 0.8 s, 0.3 s when "processing"), antenna waves (rings expand Ø 20→80 px, 1.2 s), traffic light changes, exhaust puffs | continuous | sine |
| Arrival celebration | Confetti (16–24 rect bits, phase colours) burst from the protagonist, gravity fall | 0.9 s | easeOutQuad + gravity |

Measured from strips: camera home→cloud travel ≈ 1.5 s (strip @5.0 shows continuous pan for all 0.7 s); cloud→warehouse follow ≈ 1.6 s (strip @8.6); pill tag pop ≈ 0.2 s (2 frames); truck turn swap hidden in 1 frame with hop; pull-back to overview 24.5 → 26.5 s (≈ 2.0 s), title legible by frame 7 of strip @24.5 (≈ 0.3–0.4 s after its start).

## 7. Rhythm
- One continuous camera move (0 hard cuts / min). 5 stations in 28 s → one station every ≈ 5 s; camera travels ≈ 30 % of the time, holds ≈ 40 % (still 41 %).
- Each station = arrive (camera settles) → local action (0.5–1.5 s) → UI confirmation (pill/card/step) → depart.
- On-screen words at once: 2–8 (one pill tag or one status card + step-bar labels, which are small and constant).
- Motion follows the script **sentence-by-sentence** for camera travel (a new station per sentence/step), **word-by-word** for UI pops (pill appears on the noun, step node fills on the verb of completion).
- Ending is always the overview pull-back with numbered tags and the route line connecting stations.

## 8. Texture & finishing
- **Grain:** none (0.0).
- **Glow:** only halos on active things (packet halo 30 %, active node halo 25 %, antenna rings 40 %→0).
- **Shadows:** soft, flat, cast to the bottom-right in iso space: parallelogram/diamond shadows `rgba(30,27,75,0.08)`, blur 4 px; UI shadows 0 8 px 24 px `rgba(30,27,75,0.08)`.
- **Outlines:** none on the world. White top-edge highlight 1.5 px @ 45 %.
- **Vignette:** none. **Gradients:** sky (135°, very subtle), tree crowns (radial), cloud undersides.
- **Depth of field / motion blur:** none.
- Paint order: by `x + y` depth key, elevated objects after what is under them; nothing tall is placed in front of a spot where the protagonist stops.

## 9. Sound in the reference
- **No voice-over, no music**; sound present 56 % of the time, 81 onsets/min (≈ 1.4 per second).
- SFX: UI button click, data "blip/whoosh" for flying packets, door roll, conveyor hum, packing thump, truck engine + short horn, parcel landing thud, arrival sparkle/chime.

## 10. Do / Don't
**Do**
1. Build one world per video and travel through it; every concept is a *place* or a *vehicle* in that world.
2. Shade every solid with exactly 3 tones from one hue; light from top-left.
3. Keep the world alive with cheap loops (trees, LEDs, traffic light, smoke) seeded per object.
4. Put all text in white UI overlays (pills, cards, step bar) anchored to projected world points; RTL.
5. End with a pull-back that shows the whole slab and the numbered route.

**Don't**
1. Don't cut between scenes or swap backgrounds — the camera moves.
2. Don't outline shapes or use black anywhere in the world.
3. Don't place a tall building in front of where the protagonist stops; don't put the title over a busy area (a flaw visible in the reference at 0–1.5 s).
4. Don't use more than 4 phase accent colours, and don't show a phase colour in the UI before its phase.
5. Don't break the projection (no perspective, no rotated cameras, no 3D-tilted text) — everything is the same 30° iso.

## 11. What we will NOT copy
- The reference topic (online order journey) and all its texts: title, subtitle, step names, store name, product name/price, district labels, pill messages, warehouse sign.
- The channel/brand credited in the README and any logos.
- The specific world layout (house → cloud server → warehouse → city → house). We keep the grammar (station → travel → station, step bar, overview) and generate a world per topic.

---

## 12. Engine notes

### (a) Scene vocabulary (beats the AI director can plan with)
A "scene" is a camera station or move inside one persistent world. Durations are minimums at 30 fps.

| # | Beat | What appears / happens | Word trigger → action | Min duration |
|---|---|---|---|---|
| 1 | `world-open` | Close shot on the first district, title block top-right in clean sky, life loops running | title words → title in; first noun → camera starts drifting | 2.0 s |
| 2 | `actor-intro` | A person/object at its spot; pill tag pops above it | name of actor/place → pill tag | 1.5 s |
| 3 | `device-ui` | Phone/laptop/screen mockup rises next to the actor, shows 1 item + CTA; tap ripple | action verb ("press", "order", "send") → tap + confirm state | 2.0 s |
| 4 | `data-hop` | Dotted arc from A to B; packets travel; camera follows the lead packet | transfer verb → packets launch; destination noun → arrival pulse | 1.5 s |
| 5 | `district-travel` | Camera glides to the next district; step-bar segment fills | sentence start of the next step → travel starts | 1.4 s |
| 6 | `processing-station` | Building/machine at work: LEDs speed up, antenna waves, gears, door opens, conveyor runs | processing verb → speed-up; result word → status card | 2.0 s |
| 7 | `status-confirm` | Status card drops in the sky band with check pop; step node completes | confirmation word ("confirmed", "ready", "done") → check pop | 1.5 s |
| 8 | `vehicle-run` | Vehicle drives a road segment, camera tracks; may stop at a traffic light | movement verb → drive; obstacle word ("wait", "light") → stop | 2.0 s |
| 9 | `transform` | Object changes state on a machine (raw → packed, gray → coloured), with hop to next carrier | change verb → transform + hop | 1.2 s |
| 10 | `compare-districts` | Camera pans between two districts showing contrast (two pill tags) | contrast connector → pan | 2.0 s |
| 11 | `stat-tower` | Buildings rise from the slab (z 0→h, 0.5 s stagger 0.08 s) as a 3D bar chart, value pills on top | each number → its tower rises | 2.0 s |
| 12 | `arrival` | Protagonist reaches destination, person waves, confetti, final step node rose | arrival word → confetti | 1.5 s |
| 13 | `overview-map` | Pull-back to whole slab, route line connects stations, numbered tags pop in order, title returns | summary sentence → pull-back; each step name → its tag pops | 3.0 s |

Planning rules: 3–6 stations per video (one per process step), each station uses a different district colour; `data-hop`/`district-travel` connect consecutive stations; always open with `world-open` and close with `overview-map`. The step bar exists only if the topic is a sequence (otherwise hide it and use pill tags only).

### (b) Illustration approach
- One projection function: `X = OX + (x − y)·cos30°·S`, `Y = OY + (x + y)·0.5·S − z·S`, S = 48 px per world unit at zoom 1 (1920×1080).
- Every solid = `isoBox(x, y, z, w, d, h, baseColour)` → 3 polygons (top / left / right) with the 3-tone rule, optional roof (pyramid or gable), plus face decals (windows, doors, signs, vents) drawn flat then mapped with `matrix()` onto the face.
- Library to build per topic from primitives: house, tower (window grid), shop (awning stripes), warehouse (gable roof + roll door), server rack (slot stripes + LEDs), factory (chimney + smoke), school, hospital (cross sign), bank (columns), cloud island, tree, lamp, traffic light, bench, vehicle (van/truck/scooter), parcel, coin, person.
- No strokes. Fills only; highlights = lighter tone or 1.5 px white edge; shadows = translucent diamonds on the ground.
- Animate-in options (pick by meaning, stagger 0.06–0.1 s): **rise** (z from −h to 0 out of the slab, 0.5 s easeOutBack), **pop** (scale 0→1.06→1 around its ground point, 0.35 s spring), **drop** (falls 1.5 units with squash, 0.45 s). World content that is already "there" is never animated in — only things the narration introduces.
- Depth order by `x + y` (+ elevation), recomputed per frame for movers.

### (c) "Same creator" checklist (verifiable on stills)
- [ ] True 30° isometric projection everywhere; no perspective, no outlines.
- [ ] Lavender sky `#EDEFFC`-ish with a floating thick slab (lavender side faces) split into pastel districts (green / grey-blue / sand).
- [ ] Every solid has exactly three tones of one hue, lit from top-left, with a faint white top-edge line.
- [ ] Trees are glossy green spheres on brown box trunks; lamp posts and a traffic light appear in the city.
- [ ] A bright amber protagonist (packet/parcel) or a vehicle is the visual focus, with a halo or dotted arc.
- [ ] Text only in white rounded UI (pill tag with phase-coloured numbered disc, status card, step bar) in Readex Pro, RTL.
- [ ] Bottom step bar with phase-coloured nodes (indigo → amber → teal → rose) reflects progress.
- [ ] Ending still shows the whole slab with numbered tags and a route.
- [ ] No grain, no hard black, no cuts.

### (d) Sound design
No music by default (optional soft ambient pad at −30 LUFS if requested). VO leads; SFX −16 to −20 dB under it.
| SFX | When |
|---|---|
| soft UI click / tap | button tap, step node completes |
| digital blip-whoosh (pitch rises along arc) | each `data-hop` launch + arrival blip |
| airy whoosh (low, 1.2 s) | camera `district-travel` / pull-back |
| mechanical hum / conveyor loop | `processing-station` |
| roll-door rattle | door opens |
| packing thump / tape | `transform` |
| small engine + short horn | `vehicle-run` start / stop |
| box landing thud | parcel hop landing |
| pop | pill tag / status card entrance |
| chime + sparkle | `arrival`, final overview tags |
Target density ≈ 1–1.5 SFX per second in action beats; silence (only ambient life loops) while the camera holds.
