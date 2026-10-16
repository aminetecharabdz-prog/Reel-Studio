# CLAUDE.md — رسّام · Rassam

**Mission: `docs/MISSION_V4.md`.** A brand-new site built from scratch on this orphan branch `rassam`, applying everything in the
Motion Starter Kit (https://github.com/motalim-ai/motion-starter-kit, MIT — clone into `.ref/msk`, git-ignored).
Read `docs/progress.md` first in every session and continue where the last run stopped.

## The owner
- Not a programmer. Speaks Arabic (Algerian). Works **from his phone only**; tests by opening the public link
  https://aminetecharabdz-prog.github.io/Reel-Studio/ in Chrome on Android.
- Never ask him anything during the build. Decide, record the decision in `docs/progress.md`, report once at the end in
  simple Arabic at the very top of `docs/progress.md`.

## Skills — use them
- `motion-from-reference` (from the kit — its 8-stage method, style-bible, arabic.md, remotion.md, audio.md, review.md).
- `remotion-best-practices` (router), `remotion-captions`, `remotion-markup`, `remotion-render`, `remotion-saas`, `remotion-docs`.
- `motion-director`, `arabic-rtl-video`, `reel-copywriting`, `video-qa`, `frontend-design` (every UI screen),
  `webapp-testing`, `claude-api`.

## How we work
- Sandbox has no npm registry. `node_modules` comes from branch `deps-cache` (CI `deps-cache.yml`, commit message `[deps]`).
  Restore: `git archive origin/deps-cache | tar -x -C /tmp/d && cat /tmp/d/part-* | tar -xz` then symlink `node_modules`.
  If `package.json` changed, CI also publishes the regenerated `package-lock.json` there — copy it back and commit.
- CI: `deploy.yml` (typecheck, lint, unit tests, build → `gh-pages`, then Playwright on the LIVE URL).
  `qa.yml` (`[qa]` in the message): contact sheets, gate sheets, UI shots → branch `qa-rassam`.
- Commit + push at least every 20 minutes (the scheduler treats a fresh commit as "a session is working").
- Never call something done until it passes on the live link.

## Engineering rules
- TypeScript strict. Zod on every input and every AI output. AI calls use tool use / structured output.
- External services behind interfaces in `src/lib/providers/` with mock/local implementations — the app always runs in demo mode.
- Never commit secrets. BYOK keys live only in the owner's browser.
- Cache AI results by content hash. Log every paid call in the cost ledger.

## Video rules (the kit's AGENTS.md, applied to a product)
- Remotion only. Every frame is a pure function of time: no CSS animations/transitions inside compositions, no
  `Math.random()` (use `random(seed)`), no `Date.now()`, no state between frames.
- **Timing comes from word data** via `line()` / `word()` (`src/engine/timing.ts`). Never hand-type *when* something happens.
- Never split an Arabic word into letters; reveal with a clip mask. No `letter-spacing` on Arabic. `line-height` ≥ 1.35.
- Text stays on screen ≥ 0.3 s × words + 0.6 s.
- Each style is a module `src/styles/<id>/` with tokens from `docs/styles/<id>/STYLE.md`, a scene vocabulary, a Zod plan
  schema, a director prompt + local planner, Remotion components and an illustration library.
- Self-review: stills side by side with the reference analysis sheet. A style that fails the gate is shown as «قريبًا».

## UI rules
- Arabic-first, RTL-native, mobile-first (412×915), excellent on desktop, dark + light.
- Premium original identity: ink + paper + orange spark. No purple gradient washes, no emoji, no Inter/Roboto.
- Every setting has a live preview.
