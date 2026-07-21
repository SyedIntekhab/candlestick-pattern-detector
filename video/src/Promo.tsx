import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { INK, PAPER, CYAN, GOLD, SERIF, SANS, SceneBackground } from "./scene";

// The full standalone promo: the shared scene, plus motto text and a logo
// end card layered on top. This is a one-shot narrative video, meant to be
// watched start to finish (shared as a clip, not used as a page background).

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

  const mottoOut = interpolate(frame, [150, 185], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <SceneBackground />

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
        <MottoLine text="Brighter tomorrows." delay={45} color="#FF6B6B" size={62} serif />
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

  const wordAppear = spring({ frame: frame - 34, fps, config: { damping: 200 } });
  const subAppear = spring({ frame: frame - 52, fps, config: { damping: 200 } });
  const pillAppear = spring({ frame: frame - 70, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(41,47,54,${scrim})` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
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
