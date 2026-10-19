
## 2026-10-19 — Brand identity saved
- Read the owner's design page (`docs/design/design-page.jpg`) and stored it as code in `src/brand/` + human notes in `docs/BRAND.md`.
- Colors: #FFC107, #1E293B (+ white for captions). Font: Montserrat (bundled locally).
- Decisions (page gives only words): text fade 18f, slide 24px, transitions 20f, caption 64px, glass blur 24px — see `docs/BRAND.md`.
- Known issue: Montserrat has no Arabic glyphs.

## 2026-10-19 — Glass card
- Added reusable `GlassCard` + Studio preview `GlassCardPreview`.
- Verified: backdrop blur renders in Remotion (blurred vs unblurred renders differ), text contrast 8.5.
- Fixed: yellow disc behind the title made white text unreadable → moved to the card corner; regression check `scripts/check_glass.py`.
