import type { CSSProperties, ReactNode } from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { arabicStack, colors, glassStyle, latinStack, motion, textEnter } from "../brand";

/** Visual zone above the caption band, inside the platform safe area. */
export const ZONE = { top: 240, bottom: 1250, left: 90, right: 90 } as const;

const ease = (frame: number, from: number, frames: number = motion.enterFrames) =>
  interpolate(frame - from, [0, frames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

/** Wraps one scene: fills the visual zone, fades out over its last frames. */
export const Scene: React.FC<{ duration: number; children: ReactNode; justify?: CSSProperties["justifyContent"] }> = ({ duration, children, justify = "center" }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [duration - 10, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: ZONE.top,
        height: ZONE.bottom - ZONE.top,
        left: ZONE.left,
        right: ZONE.right,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: justify,
        gap: 36,
        opacity: out,
        transform: `translateY(${(1 - out) * -20}px)`,
        direction: "rtl",
      }}
    >
      {children}
    </div>
  );
};

/** Display text that fades/slides in at `from`. */
export const Line: React.FC<{ from: number; children: ReactNode; size?: number; color?: string; weight?: number; latin?: boolean; style?: CSSProperties }> = ({
  from,
  children,
  size = 120,
  color = colors.white,
  weight = 700,
  latin = false,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: latin ? latinStack : arabicStack,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.35,
        color,
        textAlign: "center",
        direction: latin ? "ltr" : "rtl",
        ...textEnter(frame, from),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Any element that fades/slides in at `from`. */
export const Appear: React.FC<{ from: number; children: ReactNode }> = ({ from, children }) => {
  const frame = useCurrentFrame();
  return <div style={{ display: "flex", ...textEnter(frame, from) }}>{children}</div>;
};

/** Coral word inside a Line. */
export const Accent: React.FC<{ children: ReactNode }> = ({ children }) => <span style={{ color: colors.coral }}>{children}</span>;

/** Round coral chip holding an icon. */
export const IconChip: React.FC<{ children: ReactNode; size?: number; muted?: boolean }> = ({ children, size = 96, muted }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: muted ? "rgba(255,255,255,0.10)" : colors.coral,
      color: muted ? colors.white : colors.midnight,
    }}
  >
    {children}
  </div>
);

/** Glass row: icon chip + text, enters at `from`. */
export const Row: React.FC<{ from: number; icon: ReactNode; children: ReactNode; size?: number; muted?: boolean; width?: number | string }> = ({
  from,
  icon,
  children,
  size = 60,
  muted,
  width = "100%",
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...glassStyle, width, boxSizing: "border-box", padding: "28px 36px", display: "flex", alignItems: "center", gap: 32, ...textEnter(frame, from) }}>
      <IconChip muted={muted}>{icon}</IconChip>
      <div style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: size, color: colors.white, lineHeight: 1.35, opacity: muted ? 0.75 : 1 }}>{children}</div>
    </div>
  );
};

/** Glass pill with a small label (the problem being answered). */
export const Pill: React.FC<{ from: number; children: ReactNode; icon?: ReactNode }> = ({ from, children, icon }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...glassStyle, borderRadius: 999, padding: "18px 40px", display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap", ...textEnter(frame, from) }}>
      {icon ? <span style={{ color: colors.coral, display: "flex" }}>{icon}</span> : null}
      <span style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 52, color: colors.white, lineHeight: 1.35 }}>{children}</span>
    </div>
  );
};

/** Square glass tile: big icon over a label. */
export const Tile: React.FC<{ from: number; icon: ReactNode; label: ReactNode; pulseAt?: number }> = ({ from, icon, label, pulseAt }) => {
  const frame = useCurrentFrame();
  const pulse = pulseAt === undefined ? 0 : interpolate(frame - pulseAt, [0, 8, 24], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        ...glassStyle,
        flex: 1,
        padding: "48px 20px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        ...textEnter(frame, from),
        boxShadow: `${glassStyle.boxShadow}, 0 0 ${60 * pulse}px rgba(225,158,28,${0.55 * pulse})`,
        border: pulse > 0.05 ? `2px solid rgba(225,158,28,${0.4 + 0.6 * pulse})` : glassStyle.border,
      }}
    >
      <span style={{ color: colors.coral, display: "flex", transform: `scale(${1 + 0.06 * pulse})` }}>{icon}</span>
      <span style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 46, color: colors.white, textAlign: "center", lineHeight: 1.35 }}>{label}</span>
    </div>
  );
};

/** Phone mock-up with a real app screenshot; optional zoom onto a region (focusY 0..1 of the image). */
export const Phone: React.FC<{ from: number; src: string; height?: number; focus?: { at: number; y: number; scale: number } }> = ({ from, src, height = 900, focus }) => {
  const frame = useCurrentFrame();
  const width = Math.round(height * (972 / 2000));
  const z = focus ? ease(frame, focus.at, 24) : 0;
  const drift = interpolate(frame - from, [0, 300], [1, 1.03], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = (1 + z * ((focus?.scale ?? 1) - 1)) * drift;
  const y = focus?.y ?? 0.5;
  return (
    <div style={{ ...textEnter(frame, from), padding: 14, borderRadius: 72, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.35)", boxShadow: "0 40px 90px rgba(0,0,0,0.45)" }}>
      <div style={{ width, height, borderRadius: 58, overflow: "hidden", position: "relative", background: colors.midnight }}>
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})`, transformOrigin: `50% ${y * 100}%` }}
        />
      </div>
    </div>
  );
};

/** Coral line drawn across a word (right → left, following Arabic reading direction). */
export const Strike: React.FC<{ at: number; children: ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at, 12);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: 1 - 0.45 * p }}>{children}</span>
      <span style={{ position: "absolute", right: -8, top: "54%", height: 10, borderRadius: 5, background: colors.coral, width: `calc(${p * 100}% + ${p * 16}px)` }} />
    </span>
  );
};

/** Number counting up from 0 to `to` between `at` and `at + frames`. */
export const Counter: React.FC<{ at: number; to: number; frames?: number }> = ({ at, to, frames = 24 }) => {
  const frame = useCurrentFrame();
  const v = Math.round(to * ease(frame, at, frames));
  return <span style={{ fontFamily: latinStack, unicodeBidi: "isolate" }}>{v}</span>;
};

/** Daftari logo (cropped from the design page). */
export const Logo: React.FC<{ from: number; width?: number }> = ({ from, width = 640 }) => {
  const frame = useCurrentFrame();
  const p = ease(frame, from, 20);
  return (
    <Img
      src={staticFile("daftari/logo.png")}
      style={{ width, borderRadius: 28, boxShadow: "0 30px 80px rgba(225,158,28,0.25)", opacity: p, transform: `translateY(${(1 - p) * motion.slideDistance}px) scale(${0.96 + 0.04 * p})` }}
    />
  );
};

/** Slow drifting glow behind everything, so no frame is ever fully static. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const a = frame / 240;
  return (
    <>
      <div style={{ position: "absolute", width: 1100, height: 1100, borderRadius: "50%", left: -300 + 120 * Math.sin(a), top: 100 + 140 * Math.cos(a * 0.8), background: "radial-gradient(circle, rgba(225,158,28,0.16), rgba(225,158,28,0) 65%)" }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", right: -350 + 100 * Math.cos(a * 0.7), top: 900 + 120 * Math.sin(a * 0.9), background: "radial-gradient(circle, rgba(255,255,255,0.07), rgba(255,255,255,0) 65%)" }} />
    </>
  );
};
