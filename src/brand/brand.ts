/**
 * Brand identity — single source of truth for every video.
 * Source: docs/design/design-page.jpg ("دليل الهوية البصرية للأكاديمية").
 *
 * Rule: no color or font may be used in a video unless it is defined here,
 * and nothing here may be added unless it appears on the design page.
 * Values marked "decision" are timing/size choices the page describes only in
 * words (e.g. "calm", "slightly"); they are recorded in docs/BRAND.md.
 */
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const FONT_FAMILY = "Montserrat";

// Bundled locally (public/fonts, SIL OFL) so renders never depend on the network.
loadFont({
  family: FONT_FAMILY,
  url: staticFile("fonts/Montserrat-wght.woff2"),
  weight: "100 900",
});

export const brand = {
  /** Colors — exactly the swatches on the design page, plus the white the caption rule names. */
  colors: {
    /** Swatch #FFC107 — academy yellow (notebook, accents). */
    yellow: "#FFC107",
    /** Swatch #1E293B — dark slate (background, deep surfaces). */
    slate: "#1E293B",
    /** "أبيض" — caption text color. */
    white: "#FFFFFF",
  },

  /** Font — Montserrat, the only typeface on the design page. */
  font: {
    family: FONT_FAMILY,
    weights: { regular: 400, bold: 700, extraBold: 800 },
  },

  /** Captions: "في الثلث السفلي، أبيض وعريض، وسطران كحد أقصى". */
  caption: {
    position: "lower-third" as const,
    color: "#FFFFFF",
    fontWeight: 800,
    maxLines: 2,
    /** decision: size and width for a 1080×1920 frame. */
    fontSize: 64,
    lineHeight: 1.25,
    maxWidthRatio: 0.84,
  },

  /** Motion: "كل نص يظهر تدريجياً، وينزلق قليلاً، لا شيء يختفي فجأة". */
  motion: {
    textEnter: "fade-in + small slide" as const,
    /** decision: duration of a text fade-in, in frames at 30fps. */
    textEnterFrames: 18,
    /** decision: how far the text slides while it fades in (px). */
    textSlidePx: 24,
    /** Speed: "هادئة، فكرة واحدة في كل مرة". */
    speed: "calm" as const,
    oneIdeaAtATime: true,
    /** Transitions: "سلسة وتدريجية" — decision: crossfade length in frames. */
    transitionFrames: 20,
  },

  /** Shape element: light frosted glass (Glassmorphism) "لإعطاء شعور بالحداثة والعمق". */
  glass: {
    /** Translucent white fill (derived from the page's white, not a new color). */
    fill: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.22)",
    /** decision: frosted blur strength and corner radius. */
    blurPx: 24,
    radiusPx: 36,
  },
} as const;

export type Brand = typeof brand;
