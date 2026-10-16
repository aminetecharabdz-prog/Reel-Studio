# Rassam · رسّام — progress

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

### Now (session 3, 2026-10-16 ~07:20 Algiers)
- Port `product` style from `claude/rassam-wip-engine` onto the rassam engine; 2 demos; local still renderer + gate.
- Studio steps 5-7 (script & scenes, preview & edit, export).

## Decisions
- Infrastructure reused from the old branch (Pages deploy, deps-cache snapshot trick). UI, brand, engine: 100 % new.
- Fonts: UI display **Alexandria**, UI text **IBM Plex Sans Arabic**, Latin/numbers accent **Space Grotesk**, mono **IBM Plex Mono**.
  Video fonts are chosen per style in each STYLE.md.
- 3D hero: vanilla **three.js** (lighter than react-three-fiber), lazy-loaded, static SVG fallback on weak devices /
  reduced motion.

## Known issues
- (none yet)
