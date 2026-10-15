# NEW APP — Motiq · موتيك (built from scratch, 2026-10-15)

Owner verdict on v1 (Nabra): everything bad, Make-it copy, rule-based. He asked for a COMPLETELY new app (not a repair) whose
videos reach the level of his 4 Pinterest references (.qa/refs, quality examples only — never copy them, never copy Make it).
Owner later clarified: NOT "simple white background + centred text"; the result must feel like those references
(photoreal objects as metaphors, bold colour fields, editorial serif/italic + giant ghost type, film leaks, framed photos).
Auto-resume task: trig_01DsLxrv2WFQdrdHBPEt67KE (every 2h) — disable it after the final report.

Architecture (all new):
- src/engine: schema.ts (AI scene graph), compile.ts (word ids → frames), render/* (Reel, Background, Text/Image/Shape/Counter/UI layers),
  fonts.ts (self-hosted catalog), audio.ts, assets.ts, library.ts (photo library ids), stickers.ts.
- src/ai: prompt.ts (director craft rules, no templates), claude.ts (tool call + Zod + repair, caching, ledger), sanitize.ts,
  gemini.ts (images, model fallback), cutout.ts, speech.ts (Scribe STT, TTS with timestamps, no-key estimator), local.ts
  (no-key kinetic-type fallback), script.ts (Claude writes the script), pipeline.ts.
- src/data: settings (localStorage, BYOK), db (IndexedDB projects/assets/cache/ledger), project.ts.
- src/app: Landing, New (wizard), Studio (player, restyle, style/audio/end/export tabs), Settings (complete), Projects, Credits, QA (#/qa?demo=).
- Demos are authored by me as fixtures: scripts/demos/*.py → public/demo/*.json.
- Photo library: scripts/assets/fetch.py runs in GitHub Actions (fetch-assets.yml; sandbox has no internet for images),
  openly licensed (CC0/BY/BY-SA) photos from Wikimedia Commons + Openverse, rembg cut-outs → branch asset-staging;
  chosen ones copied to public/art/{obj,bg}/ with credits.json.
- Deploy: commits with [no-deploy] skip the Pages deploy (keeps the live link stable while building).

Status:
- [x] engine, AI layer, data layer, UI pages written; typecheck/lint/unit tests green locally
- [ ] photo library (waiting for fetch-assets run) → director prompt lists library ids when no Gemini key
- [ ] demos: content (re-author with photos, bold), product ad, YouTube short
- [ ] contact-sheet QA vs references, Playwright local, deploy, live smoke, final Arabic report

---

# التقرير النهائي (بالعربية البسيطة)

**الرابط:** https://aminetecharabdz-prog.github.io/Reel-Studio/ — افتحه في كروم على هاتفك.

**واش تبدّل اليوم (بعد ملاحظتك على فيديو طبيب الأسنان):**
- كل مشهد فيه الآن صورة كبيرة تشرح الكلام بالضبط (تقريبًا نصف الشاشة): سن مقطوع يبيّن العصب والتسوس، أسنان مع الجير والخيط، محرك يتحرك بأشواطه الأربعة، داخل سيارة والتيليفون يطيح أو يتركّب، عداد دورات، وأكثر من 140 رسمة ثلاثية الأبعاد (سن، فرشاة، حلوى، شاحنة توصيل...).
- العنوان فوق الصورة كلمة أو ثلاث فقط، ما يعاودش الكابشن.
- الخلفية تتبدّل بين المشاهد (ضوء، أشعة، غرفة، شبكة، نصفين...) وكل فيديو عنده ألوانه: أزرق طبي للطبيب، أسود وبرتقالي للمحرك، كريمي وبرتقالي لإعلان الحامل.
- العربية مع الفرنسية في الترتيب الصحيح (مثال: «بدّل la brosse»، «بدّل l'huile»).
- النظام يفحص كل فيديو تلقائيًا: يرفض المشهد الفارغ، العنوان الطويل، والخلفية المكررة، ويصلحهم وحده.

**أين تجرّب:** الصفحة الرئيسية ← المشاريع التجريبية الثلاثة (طبيب الأسنان، محرك السيارة، إعلان حامل الهاتف) + مونتاج فيديو متكلم. افتح أي مشروع ← شغّل الفيديو ← «تصدير» لتحميل MP4.
ملاحظة: الأصوات التجريبية آلية (روبوت)، بصوتك أنت تكون النتيجة أحسن بكثير.

**كيف تضيف المفاتيح من الهاتف:** افتح الرابط ← زر «الإعدادات» فوق ← الصق المفاتيح (كل خانة فيها شرح خطوة بخطوة):
1. مفتاح Claude (التصميم الذكي): من console.anthropic.com ← API Keys.
2. مفتاح ElevenLabs (تفريغ صوتك): من elevenlabs.io ← Profile ← API Keys.
3. **مفتاح Gemini للصور (مهم للجودة الكاملة):** من aistudio.google.com ← Get API key ← Create. مع هذا المفتاح كل مشهد مهم ياخذ صورة خاصة (شخصية ثابتة، منتجك في مواقف حقيقية).
ثم اضغط «احفظ». المفاتيح تبقى في هاتفك فقط.

**التكلفة التقريبية لفيديو 60 ثانية:** حوالي 0.35 إلى 0.45 دولار (تفريغ + تصميم Claude + صور Gemini). بدون مفتاح الصور: أقل من 0.15 دولار.

**المرحلة القادمة المقترحة:** تسجيل الدخول للزبائن، الدفع (بطاقة جزائرية + دفع دولي)، باقات بالرصيد، ولوحة تحكم لك تشوف فيها الزبائن والتكاليف.

---

# Progress — نبرة Nabra (AI motion-graphics reel studio)

> **Active branch:** `claude/modest-wozniak-1umut3` (main merged in, incl. `docs/QUALITY_BAR.md`).
> **Status (2026-10-15, after the QUALITY_BAR rebuild):** final QA done and the final Arabic report delivered (above).
> Next work only on the owner's request (phase 5 SaaS) — see "Next" below.
> **Sandbox note:** this build sandbox cannot reach the npm registry, so typecheck/lint/tests/build/contact sheets run in
> GitHub Actions (`.github/workflows/qa-sheets.yml`) and are published to the `qa-sheets` branch
> (`git fetch origin qa-sheets` → PNG contact sheets + logs + hero-area metrics). Read those to continue.

## Quality-bar rebuild (in progress)
- [x] Hero compositions: new `hero-scene` primitive (src/video/primitives/compose.tsx): backdrop → big hero → props,
      badge, red/green mark → 1–3 word label; camera push, idle loop, emphasis pulse. Hero box measured ≥ 35 % (QA page).
- [x] Rich illustration sources: 143 glossy 3D objects (Microsoft Fluent UI Emoji 3D, MIT, public/art/3d) with a
      Darija/Arabic/French concept lexicon (src/lib/design/art3d.ts); animated topic illustrations
      (src/video/illustrations: tooth cross-section, teeth row + plaque/floss, 4-stroke engine, car POV + phone holder,
      tachometer). Preview without a build: `node scripts/preview-illustrations.mjs out.html` + headless Chromium.
- [x] Per-scene background treatments (spotlight, split, rays, room, grid, duotone, deep) — ≥ 3 per video (QA check).
- [x] Demo directions authored by Claude as fixtures: public/demo/*.direction.json (source: scripts/demo-direction/build.py);
      DEMO_REV forces cached demo projects in the owner's browser to regenerate.
- [x] Local director: every A/B beat → hero-scene (src/lib/director/hero.ts); headline 1–3 words; no repeated composition.
- [x] QA checks + auto-fix: `hero` (no empty scenes), `headline-echo`/`headline-long`, `bg-variety`; unit tests in
      src/lib/__tests__/quality.test.ts; caption crash on words with inner spaces ("10 000") fixed + regression test.
- [x] Claude director: hero/bg fields + quality-bar rules in the prompt; Gemini image adapter on the current model
      (`gemini-nano-banana-2.1`, Interactions API, reference images) + per-video style sheet for consistency.
- [x] Iterated on contact sheets (7 CI rounds): every demo scene has a topic-literal hero (measured 43–47 % of the frame),
      labels land as one unit, ≥ 3 background treatments, end cards carry a hero; phone-holder 360° on the real product.
- [x] Mode A speaker-top + graphic panel layout (face video uploaded in mode A); compact hero panels in split layouts.
- [x] Final QA: CI green (typecheck, lint, 40 unit tests, build); live-smoke Playwright on the LIVE URL passes, incl. the new
      "hero ≥ 35 % in every scene" test for the three demos; Arabic report delivered at the top of this file.


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

## Next (suggested)
- Phase 5 (SaaS): auth, Supabase, server keys, payments, admin. Waits for the owner's go-ahead and payment-gateway choice.
- More topic illustrations (beauty, food, real estate) and a recurring illustrated character set for voice-only videos.
- Re-generate the demos with Gemini images once the owner adds an image key (UI already says so in the studio).

## Known issues
- Without an image key the hero visuals are 3D objects + vector illustrations; lifestyle photos for product ads need Gemini.
- Mode C talking-head: full-frame speaker scenes keep light overlays (the speaker is the hero); measured hero < 35 % there by design.
- The Claude director's new hero schema could not be exercised live (no API key in the sandbox); it is covered by the
  mapping unit test and the QA auto-fix converts any text-only scene into a hero composition.
- Headless Chromium (CI/sandbox) has no H.264 encoder → export falls back to WebM there; Chrome on Android exports MP4.
- Demo voices are robotic (espeak-ng) by necessity; the owner's own voice + ElevenLabs gives the real result.
