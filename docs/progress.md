# Rassam · رسّام — progress

> **External review (Claude, owner's assistant, 2026-10-16 12:40 Algiers) — fix before continuing new styles:**
> 1. `whiteboard` 9:16 (`docs/gate/whiteboard/teeth.jpg`): during the lean-in camera the title is cut off at the frame edges ("ش السنان تتسوس؟!"), and labels overlap ("حمض يحفر" over the bolt). The grey eraser-ghost bars read like UI skeleton loaders — make them much subtler or irregular. Re-check the gate after fixing.
> 2. Every gate contact sheet header says "errors: 1" — find which still fails and why; a gate sheet must have 0 errors.
> 3. `product`: tiny Arabic numerals/labels inside the 3D window at 9:16 (already listed) — enlarge.
> 4. The owner will judge on his phone: check every live preview tile plays smoothly at 412×915 (no blank first frame).


> Active branch: `rassam` (orphan). Mission: `docs/MISSION_V4.md`. Live URL: https://aminetecharabdz-prog.github.io/Reel-Studio/
> Final report: **not yet delivered** (the build is in progress).

## Status — MISSION_V4 §6 step 1 (scaffold, CI, deploy, brand, design system, landing shell)

### Done
- [x] Orphan branch `rassam` created (2026-10-16 ~03:10 Algiers). Copied `.claude/skills/*` from main, the kit's
      `motion-from-reference` skill (with its MIT licence) and the Remotion agent skills (cloned from remotion-dev/skills,
      since `npx skills add` needs the npm registry the sandbox does not have).
- [x] New `CLAUDE.md`, `docs/CREDITS.md`, CI: `deps-cache.yml` (node_modules + regenerated lock → branch `deps-cache`),
      `deploy.yml` (checks → build → gh-pages → Playwright on the live URL, results → branch `qa-rassam-live`).

- [x] Style bibles `docs/styles/<id>/STYLE.md` + `ref-sheet.jpg` for all 10 styles.
- [x] Brand config + logo mark, design tokens, UI kit, shell; landing (three.js hero + static fallback), style pages,
      studio wizard skeleton (steps 1-4), projects, brand kit, settings (BYOK), help, about/credits, legal. Deployed.
- [x] Site tests (every page at 412×915 and 1440×900, wizard autosave, settings) — green on the live URL (qa-rassam-live).
- [x] Engine core (WIP): word timing (`line()`/`word()` + ids), estimator + STT alignment, composition (music ducking,
      SFX on peaks), captions, end card, SFX/music library generated from the kit's sfx.py/music.py.

- [x] **`product` style engine** (ported from `claude/rassam-wip-engine`, adapted to the rassam engine): 9 scene kinds
      (words, punch, prompt, logo, showcase, capsule, cards, orb, end), local planner, Claude director, SFX design, 2 demos.
- [x] Browser export (`@remotion/web-renderer`): MP4 (H.264) or WebM fallback, cover still, SRT. Exporter-safe paint rules.
- [x] Studio steps 5–7: script & scene plan (editable), live Player preview + edits + undo/redo, export, 3 hook variants.
- [x] Step 3 inputs: «اكتب لي» (local templates / Claude), voice upload + browser recording, talking-head video, product photos.
- [x] Talking-head layouts for every style (speaker / split / full-screen cutaway, punch-in zoom, captions on the speaker).
- [x] Live previews rendered by the engine on style tiles and style pages.
- [x] **`infographic` style engine**: one continuous morph shot (100-unit particle bridge, bar→ring bend), 12 beat kinds,
      rolling counters, number-aware local planner (%, shares, amounts, years, sources), Claude director, SFX, 2 demos.
- [x] **`doodle` style engine**: code-drawn ink library (variable-width ribbons from SVG paths, memoised), cut-out
      character rig (walk phase from distance, talk, gesture, blink, robes/casual, hijab, kufi, turban, kids, elders),
      Maghreb props, one-take world with zones + camera keys in pauses, overlays (bubble, thought, ؟, tag, cards, quote),
      caption with squiggled accent word, local planner (cast/zones/beats from sentences), 2 demos.
- [x] **`whiteboard` style engine**: board world + layout solver per aspect, prop library (bespoke + all icons) drawn as
      progressive pressure ribbons, clipped 60° hatching, write-on Marhey text, marker prop that follows the tip,
      lean-in camera, living loops, mascot journey, local planner (title/objects/arrows/numbers/contrast/band/note), 2 demos.
- [x] **`plotter` style engine**: 11 scene kinds on a gliding graph-paper canvas (pen title, hero stack, slam, node flow,
      prompt input + ranking table, karaoke, graph card, schematic with product photo, paper form, film strip, arc outro).
- [x] Fix: public audio resolved against the page base (the site lives under /Reel-Studio/; `staticFile` pointed to `/`).

### Next
- Deploy + live gate for the studio flow (CI live tests include the full ad → export flow).
- Styles in order: `stickman`, `chalkboard`, `isometric`, `fake3d`, `map-journey`.
- Speech-to-text alignment provider (OpenAI Whisper / ElevenLabs Scribe, BYOK) for word-exact timing on uploaded voice/video;
  AI voice (ElevenLabs) for «صوت ذكي»; silence/filler cuts for talking-head; background removal for product photos.

## Quality gate verdicts (MISSION_V4 §5)

| Style | Demos (2) | 3rd video (local planner) | Talking-head | E-commerce | Auto checks | Verdict |
|---|---|---|---|---|---|---|
| product | `docs/gate/product/ad_sheet.jpg` (9:16), `app169_gate.jpg` (16:9 side by side with `docs/styles/product/ref-sheet.jpg`) | `water_sheet.jpg` (water benefits, Darija) | `talk_sheet.jpg` | Nova watch ad (photo in the 3D window, price chip, delivery/COD chips) | planner unit tests (schema, anchors, ordering, no 3D back-to-back); preview vs export `export_fidelity.jpg`; site tests 15/15 locally | **PASS — same creator** (black + glow dome, blur-in kinetic type with one gradient word, neon prompt bar typed word by word, glowing 3D product window, light flips with pill rings, orbit finale) |

| infographic | `docs/gate/infographic/ad.jpg` (Nova in numbers), `water.jpg` (sourced: USGS, Guyton & Hall); `ad169.jpg` side by side with `docs/styles/infographic/ref-sheet.jpg` | `phone.jpg` (screen time, planner: headline → symbol → grid → bar → timeline → symbol → source) | `talk.jpg` | Nova ad (grid 98 %, versus battery, bar→ring sleep split, price symbol) | planner tests (figures, % inheritance, share names, no invented numbers); `export_fidelity.jpg` (mask-free counters) | **PASS — same creator** (black + blue bloom, one glass object morphing through 100 units, rolling gradient counters, single cyan focus, bar bending into a ring, source line) |

| doodle | `docs/gate/doodle/story.jpg` (original story, 9:16), `ad.jpg` (delivery app); `story169.jpg` side by side with `docs/styles/doodle/ref-sheet.jpg`; `story11.jpg` (1:1) | `shop.jpg` (planner: woman + daughter, thought, bubbles, cards, quote, closing) | `talk.jpg` | Dooz delivery ad (name tag, phone thought, product cards, delivery scooter, COD quote card) | planner tests; `export_fidelity.jpg` | **PASS — same creator** (one continuous inked world, variable-width brown ink, big-head smiling cast with chalk-hatched robes, word-by-word navy caption with one orange squiggled word, camera travelling between sentences, bubbles/cards/tags/quote card, dusk ending) |

| whiteboard | `docs/gate/whiteboard/teeth.jpg` (why teeth decay, 9:16), `ad.jpg` (Safi water filter); `teeth169.jpg` side by side with `docs/styles/whiteboard/ref-sheet.jpg` | `sell.jpg` (selling on Facebook, planner) | `talk.jpg` | Safi filter explainer (count of layers, flow arrow, number, ✗/✓ contrast, CTA note) | planner tests; `export_fidelity.jpg` | **PASS — same creator** (off-white board + bezel + eraser ghosts, hand-less marker with shadow, pressure strokes, 60° hatching, Marhey lettering written R→L, red underline + stars, faces, flowing arrows, lean-in camera, pull-back reveal) |

| plotter | `docs/gate/plotter/ad.jpg` (Nova schematic ad, 9:16), `voice169.jpg` (voice → meaning) side by side with `docs/styles/plotter/ref-sheet.jpg` | `shop.jpg` (3 shop mistakes, planner) | `talk.jpg` | Nova: product photo as a schematic, price paper form with strike + stamp | planner tests; `export_fidelity.jpg` | **PASS — same creator** (ink graph paper + vignette + grain, spark pen drawing outlined title / underlines / connectors, mono micro-annotations, single orange focus, orange slam, paper interlude, arc outro with glowing end word) |

Known gaps for `product` (non-blocking): Arabic numerals inside Latin fonts in the window UI are tiny at 9:16; giant word
can show the next word's slot opening at its side for 2–3 frames.

## Decisions
- Export runs in the browser with `@remotion/web-renderer` under Remotion's Free License (`licenseKey: 'free-license'`):
  the owner is an individual creator. Revisit if the platform becomes a company with > 3 people.
- Exporter-safe paint: only centred `radial-gradient(ellipse|circle, …)` (`src/engine/paint.ts` `glow()` replaces
  `closest-side`), `perspective()` inside each element's transform (no `perspective`/`preserve-3d` on parents), glows as
  box-shadows. Verified with `scripts/qa/fidelity.mjs` (preview vs exported still).
- Audio library is MP3 (decodes everywhere incl. open-source Chromium); SFX peaks re-measured after conversion.
- Talking-head: one continuous audio track from the user's video; layouts switch on scene boundaries (hard cuts in the
  pause before the scene's first word); the style lists its full-screen cutaway beats.
- Default Claude model: `claude-sonnet-5-5` (cost); the director uses a forced tool call validated with Zod and cached.
- Infrastructure reused from the old branch (Pages deploy, deps-cache snapshot trick). UI, brand, engine: 100 % new.
- Fonts: UI display **Alexandria**, UI text **IBM Plex Sans Arabic**, Latin/numbers accent **Space Grotesk**, mono **IBM Plex Mono**.
  Video fonts are chosen per style in each STYLE.md.
- 3D hero: vanilla **three.js** (lighter than react-three-fiber), lazy-loaded, static SVG fallback on weak devices /
  reduced motion.

## Known issues
- (fixed) Live export failed while SFX/music URLs were root-absolute; live run 450cfcc passes the full ad → export flow.
- The sandbox's headless Chromium has no H.264, so CI/local exports are WebM; phones with H.264 encoders get MP4.
- Without a speech-to-text key, timing on an uploaded voice/video is the script estimate scaled to the media length.
