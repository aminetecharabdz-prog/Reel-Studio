# Progress — نبرة Nabra (AI motion-graphics reel studio)

Read this first when resuming ("أكمل"). Source of truth: `SPEC.md`. Owner brief: `MASTER_PROMPT.md`.

**Live URL:** https://aminetecharabdz-prog.github.io/Reel-Studio/  (served from the `gh-pages` branch,
built by `.github/workflows/deploy.yml` on every push to any branch).

## Plan
- [ ] Phase 0 — scaffold, brand (name/logo/palette/type), i18n, IndexedDB repo, provider interfaces + mocks,
      BYOK settings, Pages deploy + live Playwright smoke test (runs in GitHub Actions, see below)
- [ ] Phase 1 — Mode A end-to-end: upload → transcribe → review → DNA → plan → primitives → captions → preview → export;
      3 demo projects (dentist, car engine, phone-holder ad) with bundled voice + transcript
- [ ] Phase 2 — ≥40 primitives, full customisation, music/SFX/ducking, end card, aspect ratios, anti-repetition,
      image generation + cache, QA (deterministic + vision) with auto-fix
- [ ] Phase 3 — editor: timeline, per-scene edit/regenerate, global restyle, versions, MP4/SRT/thumbnail
- [ ] Phase 4 — Mode B (product ad) + Mode C (talking head)
- [ ] Final QA on the live link + Arabic report to the owner

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
- Scaffold, brand config, logo geometry, schemas (transcript, DNA, plan, project), bidi utils + tests,
  timing compiler, captions grouping, cuts (mode C), local art director, font catalog, deploy workflow.

## Known issues / waiting on owner
- Waiting for owner to enable Pages (Settings → Pages → gh-pages). Until then the `live-smoke` job fails.
