import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  interpolate,
  spring,
  Easing,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const INK = "#292F36";
const PAPER = "#F7FFF7";
const CYAN = "#4ECDC4";
const GOLD = "#FFE66D";
const CORAL = "#FF6B6B";
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = '"Segoe UI", system-ui, -apple-system, Arial, sans-serif';

// A single floating line-doodle that drifts up and sways gently, looping.
const Doodle: React.FC<{
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

const PLANE = "M3 12l18-7-5.5 16-4-6.5z M11.5 14.5L21 5";
const BOOK =
  "M12 6.5C10.5 5 8 4.5 4.5 4.8v13.4C8 17.9 10.5 18.4 12 19.7c1.5-1.3 4-1.8 7.5-1.5V4.8C16 4.5 13.5 5 12 6.5z M12 6.5v13.2";
const STAR = "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 5.9L12 16.4 6.7 19.3l1.2-5.9L3.4 9.3l6-.7z";
const PENCIL = "M14.5 5.5l4 4L9 19l-5 1 1-5z M13 7l4 4";
const APPLE =
  "M15.5 8.4c1.9.6 3 2.4 3 4.6 0 3.4-2.5 7-4.9 7-.6 0-1-.2-1.6-.2s-1 .2-1.6.2c-2.4 0-4.9-3.6-4.9-7 0-2.2 1.1-4 3-4.6 1-.3 2.2-.1 3.5.5 1.3-.6 2.5-.8 3.5-.5z M12 8V5.5c0-1.5 1-2.5 2.5-3";
const MUG =
  "M5 8.5h10V16a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z M15 10.5h2a2.5 2.5 0 0 1 0 5h-2M7.5 5.5v-2M10.5 5.5V3";
const BOARD = "M3 4h18v12H3z M8 20h8M12 16v4M7 8h7M7 11h4";
const HEART = "M12 20s-7-4.4-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19 10c0 5.6-7 10-7 10z";

const MottoLine: React.FC<{
  text: string;
  delay: number;
  color: string;
  size: number;
  serif?: boolean;
}> = ({ text, delay, color, size, serif }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const y = interpolate(appear, [0, 1], [28, 0]);
  return (
    <div
      style={{
        fontFamily: serif ? SERIF : SANS,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.15,
        color,
        opacity: appear,
        transform: `translateY(${y}px)`,
      }}
    >
      {text}
    </div>
  );
};

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Ken Burns on the photo
  const scale = interpolate(frame, [0, durationInFrames], [1.13, 1.0], {
    extrapolateRight: "clamp",
  });
  const panX = interpolate(frame, [0, durationInFrames], [-14, 14]);

  // Living seam of light down the center
  const seamBase = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  const seamPulse = 0.6 + Math.sin(frame * 0.09) * 0.4;
  const seam = seamBase * seamPulse;

  // Mottos fade out together before the end card
  const mottoOut = interpolate(frame, [150, 185], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* Concept photo, gently zooming */}
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

      {/* Brand harmonizing wash: cyan-left to gold-right, plus vignette */}
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

      {/* The living seam of light */}
      <div
        style={{
          position: "absolute",
          left: "calc(50% - 3px)",
          top: 0,
          width: 6,
          height: "100%",
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.95) 75%, transparent)",
          opacity: seam,
          filter: `blur(${1 + seam * 2}px)`,
          boxShadow: `0 0 ${20 + seam * 40}px ${6 + seam * 12}px rgba(255,255,255,${0.35 * seam})`,
        }}
      />
      {/* Bright star at the seam's heart */}
      <div
        style={{
          position: "absolute",
          left: "calc(50% - 60px)",
          top: "calc(50% - 60px)",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.9), transparent)",
          opacity: seam * 0.9,
        }}
      />

      {/* Floating doodles: student side (left) */}
      <Doodle d={PLANE} x={230} y={230} size={78} color={CORAL} speed={0.5} phase={0} />
      <Doodle d={BOOK} x={520} y={330} size={62} color={CORAL} speed={0.35} phase={40} />
      <Doodle d={STAR} x={300} y={640} size={50} color={CORAL} speed={0.6} phase={80} />
      <Doodle d={PENCIL} x={640} y={720} size={58} color={CORAL} speed={0.42} phase={120} />
      {/* Floating doodles: teacher side (right) */}
      <Doodle d={APPLE} x={1560} y={250} size={70} color={GOLD} speed={0.45} phase={20} />
      <Doodle d={MUG} x={1300} y={360} size={64} color={GOLD} speed={0.38} phase={60} />
      <Doodle d={BOARD} x={1580} y={660} size={70} color={GOLD} speed={0.55} phase={100} />
      <Doodle d={HEART} x={1300} y={740} size={50} color={GOLD} speed={0.48} phase={140} />

      {/* Mottos */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          top: "34%",
          opacity: mottoOut,
          textShadow: "0 2px 18px rgba(41,47,54,0.35)",
        }}
      >
        <MottoLine text="Small steps." delay={15} color={PAPER} size={62} serif />
        <MottoLine text="Big dreams." delay={30} color={PAPER} size={62} serif />
        <MottoLine text="Brighter tomorrows." delay={45} color={CORAL} size={62} serif />
      </div>
      <div
        style={{
          position: "absolute",
          right: "8%",
          top: "36%",
          textAlign: "right",
          opacity: mottoOut,
          textShadow: "0 2px 18px rgba(41,47,54,0.35)",
        }}
      >
        <MottoLine text="Great teachers." delay={55} color={PAPER} size={62} serif />
        <MottoLine text="Stronger tomorrows." delay={72} color={GOLD} size={62} serif />
      </div>

      {/* End card */}
      <Sequence from={195}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 200 } });
  const panelOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const scrim = interpolate(frame, [0, 20], [0, 0.55], { extrapolateRight: "clamp" });

  // Arc emblem draw-in
  const dash = 40;
  const arc1 = interpolate(frame, [10, 34], [dash, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arc2 = interpolate(frame, [22, 46], [dash, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emblemSpin = interpolate(frame, [40, 195], [0, 20]);

  const wordFrame = frame - 34;
  const wordAppear = spring({ frame: wordFrame, fps, config: { damping: 200 } });
  const subAppear = spring({ frame: frame - 52, fps, config: { damping: 200 } });
  const pillAppear = spring({ frame: frame - 70, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(41,47,54,${scrim})` }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity: panelOpacity,
            transform: `translateY(${interpolate(rise, [0, 1], [40, 0])}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
          }}
        >
          {/* Arc emblem */}
          <svg
            width={110}
            height={110}
            viewBox="0 0 40 40"
            fill="none"
            style={{ transform: `rotate(${emblemSpin}deg)` }}
          >
            <path
              d="M5.2 17.4 A15 15 0 0 1 34.8 17.4"
              stroke={PAPER}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={arc1}
            />
            <path
              d="M34.8 22.6 A15 15 0 0 1 5.2 22.6"
              stroke={CYAN}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={arc2}
            />
          </svg>

          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 92,
              color: PAPER,
              opacity: wordAppear,
              transform: `translateY(${interpolate(wordAppear, [0, 1], [24, 0])}px)`,
              letterSpacing: "-0.01em",
            }}
          >
            EdCircles
          </div>

          <div
            style={{
              fontFamily: SANS,
              fontSize: 34,
              color: "rgba(247,255,247,0.85)",
              opacity: subAppear,
            }}
          >
            Which slice is yours?
          </div>

          <div
            style={{
              marginTop: 10,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 28,
              color: INK,
              background: PAPER,
              padding: "16px 40px",
              borderRadius: 999,
              opacity: pillAppear,
              transform: `translateY(${interpolate(pillAppear, [0, 1], [18, 0])}px)`,
            }}
          >
            Become a member
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
