# Brand identity (from the design page)

Source image: `docs/design/design-page.jpg` — "دليل الهوية البصرية للأكاديمية".
Font file: `public/fonts/Montserrat-wght.woff2` (bundled, SIL OFL — no network needed).
Visual check: composition `BrandCheck` in Studio.
Code: `src/brand/` — every video imports from here (`import { brand, Caption, GlassPanel, textEnter } from "./brand"`).
**Never use a color or font in a video that is not in `src/brand/brand.ts`.**

## From the page (exact)
| Item | Value |
|---|---|
| Yellow | `#FFC107` |
| Dark slate | `#1E293B` |
| Font | Montserrat |
| Captions | lower third · white · bold · max 2 lines |
| Motion | each text appears gradually, slides slightly, nothing vanishes abruptly |
| Speed | calm · one idea at a time |
| Transitions | smooth and gradual |
| Shape element | light frosted glass (Glassmorphism) for a modern feel and depth |
| Illustration | yellow academy notebook with a graduation cap (logo/mascot) |

## Decisions (the page states these only in words)
| Setting | Value | Why |
|---|---|---|
| Text fade-in | 18 frames (0.6 s), ease-out | "gradual" + "calm" |
| Text slide | 24 px | "slightly" |
| Transition crossfade | 20 frames | "smooth and gradual" |
| Caption size | 64 px, line-height 1.25, 84% width | readable bold 2 lines on 1080×1920 |
| Glass | white 8% fill, white 22% border, 24 px blur, 36 px radius | "light" frosted glass, rounded panels as on the page |

## Known issue
Montserrat has no Arabic letters. Arabic text will fall back to the device font until an Arabic font is added to the design page.
