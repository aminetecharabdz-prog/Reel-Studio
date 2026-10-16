# STYLE.md: Plotter — spark-pen blueprint

Reference: `.ref/msk/styles/plotter/reference.mp4` (1280×720, 30 fps, 122.4 s). Analysis: `analysis/plotter/` (report, palette,
4 contact sheets, 6 motion strips). All px values below are normalised to a **1920×1080** frame (reference px × 1.5).
Adaptations for 9:16 / 4:5 / 1:1 are in §4.3. Style only — no texts, names or logos from the reference are reused (§11).

---

## 1. Feel

A late-night engineering notebook: a glowing pen tip with an orange spark draws words and diagrams onto near-black graph
paper while the camera glides over an endless technical canvas. It feels precise, clever and slightly dramatic — like
watching a machine think. Recognisable at first glance by **three colours only (ink black, bone white, signal orange)**,
the spark pen, hairline measurement annotations everywhere, and the occasional full-bleed orange "slam" frame.

## 2. Colours

| Name | Hex | Share | Use |
|---|---|---|---|
| `ink` (background) | `#090909` | 31 % | Canvas of every dark scene. Never pure #000. |
| `ink-2` | `#0D0C0C` | 27 % | Vignette edges, panel fills (frames, input boxes). |
| `grid` | `#171515` | 11 % | Graph-paper hairlines, panel fills one step up. |
| `rule` | `#302827` | 4 % | Panel borders, rulers, perspective floor grid, dashed guides. |
| `muted` | `#5C534F` | 2 % | Mono annotations, dimmed (not-yet-spoken) words. |
| `dim` | `#A0948A` | 2 % | Secondary labels, axis numbers. |
| `bone` | `#D1CDC2` | 19 % (dark) / paper bg | Line-drawn text strokes, shapes; also **paper** background (`#CEC8BE` measured, gradient `#D8D2C8` → `#C9C3B9`). |
| `white` | `#F2F0EA` | — | Hero words (pure-ish white with glow), spoken words. |
| `signal` (accent) | `#D33B16` (palette) → rendered `#F04A14` | 4 % (dark scenes) / 100 % on slam frames | Key word, spark, cursor, active row, strike-through, stamp, slam backgrounds. |
| `signal-hot` | `#FF8A2B` → `#FFCC54` | — | Inner glow of orange hero words (gradient bottom→top), spark core halo. |
| `spark-core` | `#FFF3D9` | — | 3–6 px core of the pen spark. |
| `paper-ink` | `#141414` | — | Header bar and text on paper scenes. |
| `paper-red` | `#FF4C10` (marker) / `#EB5C35` (stamp, 85 % opacity) | — | Strike-through marker & rubber stamp on paper. |

**Accent rule:** orange marks *exactly one* thing per beat — the key word being spoken, the pen spark, the active
data row, or the "wrong/old" thing being crossed out. Everything else is bone/white on ink. Full-bleed orange
(`#F04A14` centre → `#B9310C` corners, radial) is reserved for 1–2 "slam" beats per minute (the emotional peak word),
where text flips to `ink` `#0A0A0A`. Never orange body copy; never two orange words in the same line unless they are
one phrase.

## 3. Typography

| Role | Look in reference | Font (installed) | Weight | Size @1080p | Line height |
|---|---|---|---|---|---|
| Hero / slam word | Heavy geometric Arabic sans, square/diamond dots, very tight | **Alexandria** | 900 | 300 px (hero on dark), 480–520 px (slam on orange) | 1.35 |
| Latin hero (product names, "MOTION") | Wide grotesk black, uppercase | **Space Grotesk** | 700 | 150–200 px | 1.0 |
| Kicker / line above hero | Same family, bold, white | **Alexandria** | 700 | 44 px | 1.4 |
| Statement line (sentence on screen, karaoke) | Clean humanist Arabic | **IBM Plex Sans Arabic** | 500 (spoken) | 56–64 px | 1.45 |
| Line-drawn intro text | Monoline outline of a light sans, drawn by the pen | **Alexandria** 200 rendered as stroke path (`stroke 3 px`, no fill) | 200 | 140 px | — |
| Glowing end-card word | Rounded heavy, orange with soft glow | **Readex Pro** | 700 | 260 px | 1.35 |
| Annotations, axis numbers, coordinates, code | Small mono, tracked | **IBM Plex Mono** | 400/500 | 15–18 px (labels), 30 px (code panel), 36 px (counters like `0.97`) | 1.5 |
| Paper form title | Heavy Arabic sans, white on black bar | **Alexandria** | 800 | 64 px | 1.35 |
| Paper body / typewriter | Plain Arabic text face | **IBM Plex Sans Arabic** 400 (Arabic) + **IBM Plex Mono** (Latin) | 400 | 42 px | 1.5 |

No `letter-spacing` on Arabic (Latin mono labels may use +0.04 em). Digits: Western digits in mono labels; the
statement line follows the project's digit setting.

## 4. Composition

### 4.1 16:9 (reference)
- **Safe margins:** 96 px left/right, 72 px top/bottom. Corner registration marks (L-shaped, 30 px arms, 1.5 px,
  `rule`) sit 45 px from each corner on intro/outro frames.
- **Text anchor:** right-aligned (RTL) block whose right edge sits at x ≈ 1590 (≈ 83 %); hero word block spans
  x 780–1590, vertical centre ≈ 45 % of height. Kicker sits 40 px above the hero, right-aligned.
- **Diagram anchor:** diagrams/panels sit left or centre (x 70–1360), text right — text and diagram rarely overlap.
- **Elements per frame:** 1 hero + 1 kicker + 1 diagram/panel + 3–8 micro annotations. Max 3 "readable" items.
- **Empty space:** 55–70 % of the frame is plain ink/grid.
- **Reading direction:** right → left; diagrams flow right → left too (arrows `←`, timelines start at the right).

### 4.2 Layers (back → front)
1. Ink fill + radial vignette. 2. Graph-paper grid (or perspective floor grid). 3. Rulers/guides (dashed). 4. Panels
and diagrams. 5. Text. 6. Pen spark + glow. 7. Grain overlay.

### 4.3 Other aspect ratios (redesign, never letterbox)
- **9:16 (1080×1920):** stack instead of side-by-side: text block in top band (y 260–760, right-aligned, right margin
  80 px), diagram/panel in the lower band (y 860–1640, full width minus 80 px margins). Hero word size = 0.24 × width
  (≈ 260 px); slam word = 0.42 × width (≈ 450 px), may break into 2 lines. Statement lines max 14 Arabic words per
  line → wrap to 3 lines at 64 px. Camera moves become mostly **vertical** pans (the canvas is a tall scroll).
  Grid cell stays 64 px. Annotations 18 px min.
- **4:5 (1080×1350):** text top 40 %, diagram bottom 55 %; hero 240 px.
- **1:1 (1080×1080):** text overlays the top-right quadrant, diagram bottom-left; hero 220 px; max one panel.
- Rule: never place text in the bottom 12 % of vertical frames (platform UI).

## 5. Recurring elements

| Element | Exact look | When |
|---|---|---|
| **Graph-paper grid** | 1 px lines `#171515` every 64 px; every 4th line `#1E1B1B`; subtle, opacity 0.6 | All dark scenes |
| **Perspective floor grid** | 1 px `#302827` lines receding to a vanishing point at ~35 % height, 12–16 columns, fades to 0 at horizon | "Input/prompt" scenes and 3D moments |
| **Pen spark** | 4 px core `#FFF3D9`, 26 px inner glow `#FFCC54` (opacity 0.9), 90 px outer glow `#F04A14` (opacity 0.35), 4–7 short spark lines (8–18 px, 1.5 px) flickering seeded per frame | Rides the end of any stroke being drawn; parks at the end of underlines |
| **Underline rule** | 2 px `bone` (or `signal` for key) line under hero/line, extends 5–10 % past text, ends in the spark | Every hero word |
| **Dashed guide** | 1.5 px `rule`, dash 6 / gap 6, with a 7 px hollow circle handle and a 12-px mono label (e.g. an easing name) | Around hero text, like a design tool |
| **Ruler / timeline axis** | 1 px line + ticks every 64 px (ticks 8 px), mono numbers 15 px `dim`; a red playhead (2 px `signal` + 10 px triangle) | Under panels; any "time" or "progress" idea |
| **Panel / frame** | 1.5 px `rule` border (key panel `bone` 60 %), fill `#0D0C0C` 80 %, corner ticks, header row of mono labels | Diagrams, prompt input, code, charts |
| **Node box diagram** | 220×90 boxes, 1.5 px border, mono uppercase label 16 px, connected by 1.5 px arrows; active node gets orange corner tick + spark travelling along the connector | Process / pipeline explanations |
| **Easing graph card** | 360×200 panel, axes, a bone curve with orange end dot, formula label in mono | "smooth/acceleration" ideas |
| **Coordinate labels** | `(640, 300)` mono 22 px, bone or orange, next to a crosshair (+, 1.5 px, 30 px) | Shapes in diagrams |
| **Code panel** | Line numbers `muted`, code `bone` mono 30 px, keywords orange; a 2 px orange caret | "Code"/"instructions" beats |
| **Token underline** | each spoken word has a 3 px orange bar under it (width = word), plus a mono ID number 15 px `muted` under the bar | Prompt/karaoke statement scenes |
| **Probability table** | rows 34 px, mono numbers, active row filled `signal` 85 % with a 120 px bar | "choice/ranking" beats |
| **Wireframe solids** | 1.5 px `bone` 50 % icosahedra/cubes rotating slowly (12°/s) | Background accents in "3D/space" beats |
| **Film strip** | sprocket holes 14×10 px every 26 px, frames as panels | "frames / video" beats |
| **Paper form** (light interlude) | bg `#CEC8BE` gradient + 1 px faint grid `#BDB6AB` + horizontal paper fibres; 1600×100 black header bar `#141414` with title 64 px white; section numbers `1.`, `2.`; flow boxes 1.5 px `#141414`, arrows `←`; marker strike 15 px `#FF4C10` slightly wavy (±4 px); rubber stamp: 2 px double border, rotated −4°, `#EB5C35` 85 %, with grain knock-out | 1–2 per video: "before vs after", checklists, Q&A |
| **Checkbox list** | 22 px boxes 1.5 px, ticks/crosses orange | Paper Q&A / lists |
| **Counter** | mono 36 px number with 12 px label above and a 2 px rule beneath, bottom-left corner | Slam frames ("degree" meters), counts |

## 6. Motion vocabulary

All motion is from `useCurrentFrame()`; times below are measured from the motion strips (frames 0.1 s apart).

| Event | Exactly how | Duration | Curve |
|---|---|---|---|
| **Pen-draws-text** (intro) | Outline path of the words is stroked R→L with `strokeDashoffset`; spark rides the leading point; filled glyphs then fade in under the stroke | 0.25 s per word (≈ 1.4–1.8 s per line) | linear along path, word-starts `easeInOutSine` |
| **Hero word enter** | Fade 0→1 + `translateY 24→0` + blur 6→0 px; glow blooms after (opacity 0→0.5 over 0.3 s) | 0.35 s | `easeOutCubic` |
| **Orange key word enter** | As hero, plus underline draws R→L with spark | 0.35 s + 0.3 s underline | `easeOutCubic` / `easeInOutCubic` |
| **Karaoke statement** | Whole line pre-laid at `muted` 35 %; each word lights to white (or orange) on its word start; token underline grows 0→100 % width | 0.12 s per word | `easeOutQuad` |
| **Text exit** | Fade to 0 + blur 0→4 px, or carried away by camera move | 0.25 s | `easeInCubic` |
| **Slam (full-bleed orange)** | Hard cut to orange frame; word appears instantly at scale 1.06 → 1.0 | cut + 0.15 s settle | `easeOutQuart` |
| **Push-in transition** | Camera scales into a small element (key cap, node, play button) 1 → 4–6×, element fills frame, then hard cut | 0.3 s | `easeInExpo` |
| **Camera glide** (between beats inside a scene) | Whole canvas translates to the next region (pan up/left 600–1100 px) + slight zoom 1.0→1.08 | 0.6–0.8 s | `easeInOutCubic` |
| **Hard cut** | Dark ↔ paper ↔ orange — only cut type; no crossfades | 1 frame | — |
| **Diagram draw** | Boxes: border stroke draws (perimeter dashoffset) 0.4 s, label fades 0.2 s after; connectors draw 0.3 s with spark at tip | 0.4–0.7 s per node | `easeInOutCubic` |
| **Typewriter (paper)** | Clip-mask wipe R→L revealing ~10 visible chars/s (never split Arabic into letters — wipe the shaped word), orange caret blinks 0.5 s on/off | ≈ 0.1 s per glyph cluster | linear, stepped to frames |
| **Marker strike** | 15 px wavy stroke drawn R→L across a row | 0.45 s | `easeOutCubic` |
| **Stamp** | Scale 1.35 → 1.0, rotate −10° → −4°, opacity 0→1, 1-frame 4 px shake | 0.18 s | `easeOutBack` (overshoot 1.4) |
| **Spark idle** | Spark lines re-seeded every 2 frames; glow pulses ±12 % at 3 Hz | continuous | sine |
| **Wireframe solids** | Constant rotation 12°/s on two axes | continuous | linear |
| **Panel enter** | Border draws + fill fades 0→0.8 | 0.4 s | `easeOutCubic` |

## 7. Rhythm

- Hard cuts: 2.5 / min (scene changes between dark canvas / orange slam / paper). Mean shot 20 s, but each shot is
  a long camera journey with a new **beat every 1.5–3 s** (camera glide or new element).
- Still 32 % of the time (holds on finished frames while voice continues).
- On-screen text at once: hero layouts 2–4 words; statement/karaoke lines up to 14 words (2 lines).
- Motion follows speech **word by word** for heroes/karaoke; diagrams follow the sentence.
- Slam beats: 1–2 per minute max. Paper interludes: 1 per 60–90 s, lasting 10–25 s.

## 8. Texture & finish

- **Film grain:** monochrome noise, opacity 0.06 on dark, 0.10 on paper (seeded per frame, 1.5 px grain).
- **Glow:** white hero text `text-shadow 0 0 18px rgba(255,255,255,.35)`; orange text/spark glow `0 0 28px rgba(240,74,20,.55)`
  + `0 0 70px rgba(240,74,20,.25)`.
- **Vignette:** radial, centre transparent → edges `#000` at opacity 0.45 (dark); on orange slam the edges darken to
  `#B9310C`; on paper the edges darken by 8 %.
- **Paper:** horizontal fibre streaks (opacity 0.05) + 1 px grid `#BDB6AB` at 40 px; slight warm cast.
- **Chromatic/scanline:** none. **Motion blur:** only on push-in (2–3 frames, 8 px directional).
- **Shadows:** none (flat, glow only).

## 9. Sound in reference

- Voice-over: calm, clear MSA, ~150 words/min, short punchy sentences with pauses before slams.
- Music: none audible as a bed (sound present 83 % — mostly voice + sfx).
- SFX: 184 onsets/min (includes word starts). Audible types: soft electric crackle on the spark while drawing; short
  UI ticks/clicks on each node/word light-up; whoosh on camera glides/push-ins; a deep hit on slam cuts; typewriter
  keys on paper; marker squeak; stamp thump.

## 10. Do / Don't

**Do**
1. Keep to 3 colours (ink / bone / signal) — every extra hue breaks the style.
2. Put a pen spark at the head of every stroke being drawn and park it at the end of underlines.
3. Surround content with real-looking technical micro-annotations (mono labels, coordinates, rulers, IDs).
4. Move the camera across one continuous canvas between beats; cut only to change "material" (dark/orange/paper).
5. Use a single orange focus per beat; flip to a full orange slam only for the peak word.

**Don't**
1. No gradients other than vignette/glow, no drop shadows, no rounded "app" cards.
2. No bouncy/elastic easing except the stamp; no spinning text.
3. No icons/emoji or clip-art — diagrams are boxes, lines, curves, crosshairs.
4. No crossfades between scenes.
5. No body text in orange, no orange on paper except marker/stamp/typed key word.

## 11. Not copied

The reference's sentences, the product names it mentions (AI model and editing-software names, server names),
version numbers, the form titles/reference codes and the voice-over. Only the visual grammar is used. Upstream
attribution for the visual idea is kept in `docs/CREDITS.md` (pdoom-video by mexicat, MIT).

---

## 12. Engine notes

### (a) Scene vocabulary

Timing for every trigger comes from word IDs (`word()` / `line()` in `src/engine/timing.ts`). "Min" = minimum duration.

| # | Beat type | What appears | Trigger words | Min |
|---|---|---|---|---|
| 1 | `penTitle` | Opening line drawn as outline by the spark pen over a long underline, corner reg-marks | First line of the script; each word's draw starts at its word start | 2.5 s |
| 2 | `heroStack` | Kicker line (44 px) + 1–2 huge hero words (white, key word orange) with underline+spark and dashed guides | Kicker = lead-in words; hero = the noun/claim; orange = the emphasised word | 2.0 s |
| 3 | `slam` | Hard cut to full-bleed orange, one giant ink word + corner counter | The single most emotional word of a section (≤ 2/min) | 1.2 s |
| 4 | `nodeFlow` | 2–5 boxes connected R→L, spark travels along connectors; active node orange tick | Each step name triggers its box; verbs like "then / ثم / بعدها" trigger the connector | 0.8 s per node |
| 5 | `promptInput` | Panel on perspective floor grid; a typed statement with token underlines + IDs; optional probability table | Quoted speech / an instruction / a question the user "types" | 3.0 s |
| 6 | `karaokeLine` | Statement pre-laid dim, words light up as spoken; key word orange | Any explanatory sentence without a visual noun | 0.3 s × words + 0.6 s |
| 7 | `canvasDiagram` | Framed canvas with a timeline ruler + playhead; shapes (square, circle) with crosshairs and coordinate labels; side labels appear per noun | Lists of components ("texts, shapes, positions…") — each noun adds its label/shape | 4.0 s |
| 8 | `codePanel` | Code panel slides in at right edge; lines type in; easing-graph card below | "code / formula / rule / recipe / steps" | 2.5 s |
| 9 | `graphCard` | Easing/growth curve drawn with orange end dot, formula in mono | "faster / smooth / growth / increase / curve / %" | 1.5 s |
| 10 | `pushIn` (transition) | Camera dives into a small element (key cap, play button, node) then cut | Sentence boundary before a big reveal | 0.3 s |
| 11 | `paperForm` | Light paper sheet with black header bar, numbered sections, flow boxes; marker strikes old row; new row; stamp | "instead of / بدل / before–after / old vs new / الآن" | 8 s |
| 12 | `paperChecklist` | Q&A with checkboxes typed in; crosses/ticks in orange | Questions to the viewer; lists of cases | 5 s |
| 13 | `filmStrip` | Strip of frames scrolling R→L, play-button panel | "video / frames / result / episode" | 2.0 s |
| 14 | `arcOutro` | Two labels joined by a drawn arc (A → B), spark at the end, then glowing orange end word (Readex Pro) | Final sentence / CTA | 3.0 s |

Director rules: start with `penTitle` or `heroStack`; never two `slam` in a row; insert a `paper*` scene once per
60–90 s for contrast; alternate text-led and diagram-led beats; every scene ends by camera-gliding or cutting.

### (b) Illustration approach

- **Everything is line-work:** 1.5 px (@1080p) strokes for diagrams/panels, 2 px for underlines, 3 px for pen-drawn text,
  15 px only for the paper marker. `stroke-linecap: round`. No fills except panels (`#0D0C0C` 80 %), active rows
  (`signal` 85 %), and the slam background.
- **Props** (for any topic) are drawn as **technical schematics**: outline silhouettes in 1.5 px bone (phone, tooth,
  car, box, coin, clock, house, shop, chart…) with crosshairs at the centre, dimension lines with arrowheads, mono
  measurement labels (`h 240`, `×14`), and one orange detail (a dot, a callout). Think "patent drawing + HUD".
- **No characters/people;** represent people as a 1.5 px circle + line body glyph or as labelled nodes.
- **Animate in** by stroke draw (`strokeDashoffset` from 100 % → 0) along the path in RTL order, 0.4–0.8 s,
  `easeInOutCubic`, spark at the drawing tip; labels fade in 0.2 s after their line completes. Wireframe 3D objects
  rotate continuously at 12°/s.
- Library format: SVG path data normalised to a 512×512 viewBox, `vector-effect: non-scaling-stroke`, so stroke
  widths stay 1.5 px at any size.

### (c) "Same creator" checklist (verify on stills)

- [ ] Only ink `#090909`, bone `#D1CDC2`/white and signal orange visible (paper/orange interludes excepted).
- [ ] A visible 64 px graph-paper grid (or perspective floor grid) behind dark scenes.
- [ ] A glowing spark (white core, orange halo) somewhere in at least 1 of every 3 stills.
- [ ] At least 3 mono micro-annotations (coordinates, rulers, IDs, labels) per dark frame.
- [ ] Hero Arabic word in a heavy geometric sans with an underline that extends past it.
- [ ] Exactly one orange focus per frame (word, row, spark or strike).
- [ ] Right-aligned text block, diagrams flowing right → left with `←` arrows.
- [ ] Grain + vignette present; no drop shadows; no rounded app cards.
- [ ] Hard cuts only between dark canvas, orange slam and paper.
- [ ] 55 %+ of the frame is empty canvas.

### (d) Sound design

| SFX | When | Level |
|---|---|---|
| Electric crackle loop (soft, high-passed) | While the pen spark is drawing (penTitle, underlines, connectors) | −24 dB |
| UI tick (short, dry) | Each node box completes; each karaoke key word; each probability row | −20 dB |
| Whoosh (airy, 0.4 s) | Camera glides; push-in (rising whoosh) | −18 dB |
| Low impact hit + sub | Slam cut (on the frame of the cut) | −10 dB |
| Typewriter keys | Paper typewriter reveals, ~10/s | −22 dB |
| Marker squeak | Strike-through | −20 dB |
| Stamp thump | Stamp lands | −14 dB |
| Optional bed | Minimal dark pulse/drone at −30 dB, ducked under voice; off by default | — |
