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

### Next
- Style analyses (`docs/styles/<id>/STYLE.md` + analysis sheets) for all 10 styles.
- Brand config + logo (ر closing into a play triangle, orange spark), design system, landing shell, deploy.

## Decisions
- Infrastructure reused from the old branch (Pages deploy, deps-cache snapshot trick). UI, brand, engine: 100 % new.
- Fonts: UI display **Alexandria**, UI text **IBM Plex Sans Arabic**, Latin/numbers accent **Space Grotesk**, mono **IBM Plex Mono**.
  Video fonts are chosen per style in each STYLE.md.
- 3D hero: vanilla **three.js** (lighter than react-three-fiber), lazy-loaded, static SVG fallback on weak devices /
  reduced motion.

## Known issues
- (none yet)
