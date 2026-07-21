import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

export const INK = "#292F36";
export const PAPER = "#F7FFF7";
export const CYAN = "#4ECDC4";
export const GOLD = "#FFE66D";
export const CORAL = "#FF6B6B";
export const SERIF = 'Georgia, "Times New Roman", serif';
export const SANS = '"Segoe UI", system-ui, -apple-system, Arial, sans-serif';

export const PLANE = "M3 12l18-7-5.5 16-4-6.5z M11.5 14.5L21 5";
export const BOOK =
  "M12 6.5C10.5 5 8 4.5 4.5 4.8v13.4C8 17.9 10.5 18.4 12 19.7c1.5-1.3 4-1.8 7.5-1.5V4.8C16 4.5 13.5 5 12 6.5z M12 6.5v13.2";
export const STAR = "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 5.9L12 16.4 6.7 19.3l1.2-5.9L3.4 9.3l6-.7z";
export const PENCIL = "M14.5 5.5l4 4L9 19l-5 1 1-5z M13 7l4 4";
export const APPLE =
  "M15.5 8.4c1.9.6 3 2.4 3 4.6 0 3.4-2.5 7-4.9 7-.6 0-1-.2-1.6-.2s-1 .2-1.6.2c-2.4 0-4.9-3.6-4.9-7 0-2.2 1.1-4 3-4.6 1-.3 2.2-.1 3.5.5 1.3-.6 2.5-.8 3.5-.5z M12 8V5.5c0-1.5 1-2.5 2.5-3";
export const MUG =
  "M5 8.5h10V16a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z M15 10.5h2a2.5 2.5 0 0 1 0 5h-2M7.5 5.5v-2M10.5 5.5V3";
export const BOARD = "M3 4h18v12H3z M8 20h8M12 16v4M7 8h7M7 11h4";
export const HEART = "M12 20s-7-4.4-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19 10c0 5.6-7 10-7 10z";

// A single floating line-doodle that drifts up and sways gently, looping.
export const Doodle: React.FC<{
  d: string;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  phase: number;
}> = ({ d, x, y, size, color, speed, phase }) => {
  const frame = useCurrentFrame();
  const t = frame + phase;
  const drift = ((t * speed) % 160) - 80;
  const sway = Math.sin(t * 0.03) * 14;
  const rot = Math.sin(t * 0.02) * 8;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: 0.32,
        transform: `translate(${sway}px, ${-drift}px) rotate(${rot}deg)`,
      }}
    >
      <path d={d} />
    </svg>
  );
};

/**
 * The shared visual world: the concept photo panning and zooming, a brand
 * color wash, a living seam of light down the center, and floating
 * classroom doodles either side. Used both by the full standalone promo
 * (Promo.tsx, with motto text and an end card layered on top) and by the
 * text-free background loop for the Members page (MembersLoop.tsx). Motion
 * is periodic sine/modulo math rather than one-shot ramps, so it loops
 * seamlessly no matter which composition duration wraps around to frame 0.
 */
export const SceneBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = 1 + Math.sin(frame * 0.008) * 0.06 + 0.03;
  const panX = Math.sin(frame * 0.008 + 1.2) * 14;

  const seamPulse = 0.6 + Math.sin(frame * 0.09) * 0.4;

  return (
    <>
      <AbsoluteFill>
        <Img
          src={staticFile("classroom.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translateX(${panX}px)`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: `linear-gradient(100deg, ${CYAN}22 0%, transparent 42%, transparent 58%, ${GOLD}22 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 100% at 50% 45%, transparent 55%, rgba(41,47,54,0.42) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "calc(50% - 3px)",
          top: 0,
          width: 6,
          height: "100%",
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.95) 75%, transparent)",
          opacity: seamPulse,
          filter: `blur(${1 + seamPulse * 2}px)`,
          boxShadow: `0 0 ${20 + seamPulse * 40}px ${6 + seamPulse * 12}px rgba(255,255,255,${
            0.35 * seamPulse
          })`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "calc(50% - 60px)",
          top: "calc(50% - 60px)",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(255,255,255,0.9), transparent)",
          opacity: seamPulse * 0.9,
        }}
      />

      <Doodle d={PLANE} x={230} y={230} size={78} color={CORAL} speed={0.5} phase={0} />
      <Doodle d={BOOK} x={520} y={330} size={62} color={CORAL} speed={0.35} phase={40} />
      <Doodle d={STAR} x={300} y={640} size={50} color={CORAL} speed={0.6} phase={80} />
      <Doodle d={PENCIL} x={640} y={720} size={58} color={CORAL} speed={0.42} phase={120} />
      <Doodle d={APPLE} x={1560} y={250} size={70} color={GOLD} speed={0.45} phase={20} />
      <Doodle d={MUG} x={1300} y={360} size={64} color={GOLD} speed={0.38} phase={60} />
      <Doodle d={BOARD} x={1580} y={660} size={70} color={GOLD} speed={0.55} phase={100} />
      <Doodle d={HEART} x={1300} y={740} size={50} color={GOLD} speed={0.48} phase={140} />
    </>
  );
};
