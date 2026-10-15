# Progress — نبرة Nabra (AI motion-graphics reel studio)

Read this first when resuming ("أكمل"). Source of truth: `SPEC.md`. Owner brief: `MASTER_PROMPT.md`.

**Live URL:** https://aminetecharabdz-prog.github.io/Reel-Studio/  (served from the `gh-pages` branch,
built by `.github/workflows/deploy.yml` on every push to any branch).

## Plan
- [x] Phase 0 — scaffold, brand (name/logo/palette/type), i18n, IndexedDB repo, provider interfaces + mocks,
      BYOK settings, Pages deploy + live Playwright smoke test (runs in GitHub Actions, see below)
- [x] Phase 1 — Mode A end-to-end: upload → transcribe → review → DNA → plan → primitives → captions → preview → export;
      3 demo projects (dentist, car engine, phone-holder ad) with bundled voice + transcript
- [x] Phase 2 — ≥40 primitives, full customisation, music/SFX/ducking, end card, aspect ratios, anti-repetition,
      image generation + cache, QA (deterministic + vision) with auto-fix
- [x] Phase 3 — editor: timeline, per-scene edit/regenerate, global restyle, versions, MP4/SRT/thumbnail
- [x] Phase 4 — Mode B (product ad) + Mode C (talking head)
- [x] Final QA on the live link (16 Playwright tests pass on the live URL in CI) + Arabic report to the owner

## Decisions (made autonomously)
- **Name: نبرة / Nabra** (see `docs/brand.md`, 10 candidates). Rename in `src/config/brand.ts` only.
- **Deploy:** build → force-push `dist/` to `gh-pages` from any branch (Claude sessions push to `claude/*`).
  GITHUB_TOKEN cannot enable Pages, so the owner must once set Settings → Pages → Branch `gh-pages`.
- **Routing:** hash routing + `base: './'` so refresh works on Pages and in any sub-path.
- **Live-site test:** this sandbox cannot reach `*.github.io`, so the Playwright mobile test against the live URL
  runs in the `live-smoke` job of the deploy workflow (412×915), after polling `version.json` for the new commit.
- **Demo voices:** no human recordings or neural Arabic TTS were reachable from the build sandbox, so demo voices are
  generated with **espeak-ng** (GPLv3 program; output audio is free to use) and labelled "صوت تجريبي آلي" in the UI.
  Word timestamps come from espeak's own word events (exact), not guessed. Script: `scripts/demo-voice/make_demo.py`.
- **Fonts:** all OFL, self-hosted via @fontsource (no Google CDN at runtime). Latin display partners sit in front of the
  Arabic face in the CSS stack.
- **Icons:** curated offline subset of Iconify sets (ph, tabler, solar, fluent-emoji-flat) generated at build time.
- **Client-side render constraints** (Remotion web renderer): no z-index (DOM order), only linear gradients, no
  backdrop-filter/blend modes. Primitives are written within that subset.
- **Models:** Claude Sonnet 5.5 (`claude-sonnet-5-5`) for directing, Haiku 5.5 (`claude-haiku-5-5`) for cheap checks;
  names in `src/lib/providers/config.ts`.

## Done
- Live link works (owner enabled Pages); `live-smoke` Playwright job passes on the live URL.
- Engine: 50 parametric primitives (src/video/primitives), Design DNA art director (local + Claude), local scene director
  (beats → primitives, anti-repetition), word-anchored compiler, 8 caption styles, 10 transitions, music ducking, SFX,
  deterministic QA + auto-fix, vision QA loop (Claude), export (H.264 MP4, VP9/VP8 WebM fallback), SRT, thumbnail.
- UI: landing with live demo reel, wizard (A/B/C), transcript review w/ timestamp-preserving edits + AI fix, studio editor
  (scene timeline, per-scene edit/regenerate/lock, global restyle, versions, QA), settings (BYOK + Arabic phone guides), costs.
- Demos: dentist (A), engine (A), phone-holder ad (B), talking-head (C, synthetic speaker clip).
- Visual QA: `node scripts/contact-sheet.mjs [demo] [atSeconds]` → .qa/sheet-*.png (needs `npm run build` + `vite preview`).
- Scaffold, brand config, logo geometry, schemas (transcript, DNA, plan, project), bidi utils + tests,
  timing compiler, captions grouping, cuts (mode C), local art director, font catalog, deploy workflow.

## Acceptance evidence
- Unit (vitest, 30): bidi runs, digits, timing/captions drift 0–1 f, re-alignment keeps timestamps, 10-video variety,
  contrast ≥ 4.5 on 40 random palettes, QA catches + fixes seeded errors, Claude output mapping, mode C cuts.
- E2E (Playwright 412×915, also run on the LIVE URL by CI): landing, full creation flow (upload → transcript → generate →
  preview), all demos open, zero text overflow on every scene of every demo at 3 time points, export → download.
- Visual: contact sheets reviewed for all 4 demos (hero frames + transition midpoints); fixed: tiny type, empty openings,
  reversed French phrases, transition ghosting, overlay contrast on footage, PiP collisions, text overflowing stage height.

## Known issues
- Headless Chromium (CI/sandbox) has no H.264 encoder → export falls back to WebM there; Chrome on Android exports MP4.
- Demo voices are robotic (espeak-ng) by necessity; the owner's own voice + ElevenLabs gives the real result.
