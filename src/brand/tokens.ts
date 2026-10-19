// Brand design page (docs/design-page.png) as code. Every video imports from here.
// Colours were sampled from the design page; do not add colours or fonts that are not on it.

export const colors = {
  /** "Coral" — primary colour (the swatch on the page is a warm amber). */
  coral: "#E19E1C",
  /** "Midnight" — background colour. */
  midnight: "#13183E",
  /** Caption text colour: white. */
  white: "#FFFFFF",
} as const;

export const fonts = {
  /** Arabic font. */
  arabic: "Cairo",
  /** Latin font. */
  latin: "Poppins",
} as const;

/** Caption rules: lower third, white, bold, two lines max. */
export const caption = {
  color: colors.white,
  fontWeight: 700,
  maxLines: 2,
  /** Captions live in the lower third of the 1920px frame. */
  zone: { top: 1280, bottom: 1920 },
  /** One idea on screen at a time. */
  maxCaptionsOnScreen: 1,
} as const;

/** Motion rules: every text fades in gradually and slides up slightly — nothing jumps. */
export const motion = {
  /** Fade + slide duration in frames (30fps). Calm, not snappy. */
  enterFrames: 15,
  /** Small slide distance in px. */
  slideDistance: 24,
  /** No overshoot / bounce: plain ease-out only. */
  overshoot: false,
} as const;

/** Shape: light frosted glass (glassmorphism). */
export const glass = {
  background: "rgba(255, 255, 255, 0.12)",
  border: "1px solid rgba(255, 255, 255, 0.35)",
  blurPx: 18,
  radiusPx: 32,
  shadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
} as const;
