# CLAUDE.md — project rules

**Current mission: `docs/MISSION_V4.md` — a brand-new website "رسّام · Rassam" built from scratch on the orphan branch `rassam`, applying everything in the Motion Starter Kit. It supersedes every earlier brief (MISSION_V4, MASTER_PROMPT.md, SPEC.md §5, QUALITY_BAR.md).**

## The owner
- Not a programmer. Speaks Arabic (Algerian). Works **from his phone only** — he cannot run commands, open files on a computer, or edit code. He tests by opening the **public GitHub Pages link** in Chrome on Android.
- Talk to him in simple, short Arabic. When you truly need him (an API key, a GitHub setting, a choice), give exact phone steps ("افتح GitHub ← Settings ← Pages ← …") and ask only one thing at a time.
- Work autonomously. Don't stop to ask for things you can decide yourself with good judgment; record the decision in `docs/progress.md`.

## Skills — use them
- First thing in a fresh environment: if `.claude/skills/remotion-best-practices` is missing, run `npx skills add remotion-dev/skills` (accept defaults / choose Claude Code). Then follow: `remotion-best-practices` (router), `remotion-captions`, `remotion-markup`, `remotion-render`, `remotion-saas`, `remotion-docs`.
- Project skills already in `.claude/skills/`:
  - `motion-director` — motion-graphics craft: beats, timing, easing, composition, anti-template rules. Use when planning scenes, writing primitives, or prompting the AI director.
  - `arabic-rtl-video` — Arabic/Darija/French mixed text in video and UI.
  - `reel-copywriting` — hooks, ad structure, on-screen text in Darija/Arabic/French.
  - `video-qa` — how to verify a video is error-free before saying it's done.
  - `frontend-design` — distinctive, premium UI (use for every UI screen).
  - `webapp-testing` — Playwright testing of the web app.
  - `claude-api` — correct Claude API usage (models, structured output, caching).

## How we work
- One phase at a time (SPEC §11). Keep `docs/progress.md` updated: plan, done, decisions, known issues, live URL. Read it at the start of every session so work can resume after interruptions ("أكمل").
- Never call something done until its acceptance criteria pass **on the live link**. After meaningful changes run typecheck, lint, unit tests, a real render, and the Playwright mobile test.
- Commit after each working step with clear messages. Keep the deploy green.

## Engineering rules
- TypeScript strict. Zod on every input and every AI output. AI calls use structured output / tool use — never regex-parse prose.
- All external services behind interfaces in `src/lib/providers/` with mock implementations, so the app always runs in demo mode.
- Never commit secrets. BYOK keys live only in the owner's browser (SPEC §2.2).
- Cache AI results and generated images by content hash. Log every paid call in the cost ledger.

## Video rules (most important)
- **Style engines (MISSION_V4):** each of the 10 styles is a module with its own tokens, scene vocabulary and drawable illustration library, matching its reference video. Within a style, every video is planned from its own content (no fixed scene sequence).
- **Timing is anchored to word IDs**, converted to frames in one compiler module (SPEC §6). Never hand-type seconds.
- Remotion code is deterministic: `random(seed)` not `Math.random()`, no `Date.now()`, animation only from `useCurrentFrame()`. Stay within what the web renderer supports.
- Arabic RTL correctness is mandatory (SPEC §7).
- Every visual bug you fix gets an automatic check so it never returns (SPEC §8).

## UI rules
- Arabic-first, RTL-native, mobile-first, i18n-ready.
- Premium, original identity — never imitate the competitor's navy + yellow look.
- Every setting has a live preview.
