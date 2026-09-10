import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color, font } from "./brand";
import { Display } from "./Display";
import { NotchBar, Session } from "./NotchBar";

export const HERO_WIDTH = 1200;
export const HERO_HEIGHT = 460;
export const HERO_FPS = 60;
export const HERO_DURATION = 360;

const BEZEL_TOP = 64;
const BEZEL = 13;
const SCREEN_TOP = BEZEL_TOP + BEZEL;

const QUIET_WIDTH = 210;
const ACTIVE_WIDTH = 780;
const QUIET_HEIGHT = 46;
const ACTIVE_HEIGHT = 60;

const EXPAND_AT = 50;
const ATTENTION_AT = 214;
const COLLAPSE_AT = 328;

/**
 * Seamless README banner: the notch wakes, the cast works, one agent asks for
 * something, then the surface settles back to a dormant notch identical to
 * frame zero.
 */
export type HeroLoopProps = {
  /**
   * A full-frame scale changes every pixel each frame, which defeats GIF
   * inter-frame compression and quadruples the file. On for video, off for the
   * README GIF.
   */
  drift?: boolean;
};

export const HeroLoop: React.FC<HeroLoopProps> = ({ drift: driftEnabled = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const time = frame / fps + 4.7;

  const expand = spring({
    frame: frame - EXPAND_AT,
    fps,
    config: { damping: 200, stiffness: 170, mass: 0.75 },
  });
  const collapse = spring({
    frame: frame - COLLAPSE_AT,
    fps,
    config: { damping: 200, stiffness: 210, mass: 0.6 },
  });
  const openness = expand * (1 - collapse);

  const width = QUIET_WIDTH + (ACTIVE_WIDTH - QUIET_WIDTH) * openness;
  const height = QUIET_HEIGHT + (ACTIVE_HEIGHT - QUIET_HEIGHT) * openness;
  const contentOpacity = interpolate(openness, [0.6, 0.96], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const attention = frame >= ATTENTION_AT;
  const reaction = interpolate(
    frame,
    [ATTENTION_AT, ATTENTION_AT + 17],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const orbBlend = interpolate(
    frame,
    [ATTENTION_AT - 4, ATTENTION_AT + 12],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const labelBlend = interpolate(
    frame,
    [ATTENTION_AT - 6, ATTENTION_AT + 10],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const sessions: Session[] = [
    {
      provider: "mention",
      state: attention ? "needsAnswer" : "working",
      phase: 0,
      reaction: attention ? reaction : 0,
    },
    { provider: "ticket", state: "working", phase: 0.9 },
    { provider: "call", state: "working", phase: 1.75 },
    { provider: "architect", state: "working", phase: 2.6 },
  ];

  // One full sine over the loop length, so the drift returns to zero on the
  // seam. Small enough to read as breathing rather than as a camera move.
  const drift = driftEnabled
    ? Math.sin((frame / HERO_DURATION) * Math.PI * 2)
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: color.night }}>
      <AbsoluteFill
        style={{
          transform: `scale(${1 + drift * 0.009})`,
          transformOrigin: `${HERO_WIDTH / 2}px ${SCREEN_TOP}px`,
        }}
      >
        <Display
          top={BEZEL_TOP}
          width={1560}
          height={396}
          bezel={BEZEL}
          menuBarHeight={52}
          fadeStart={130}
          fadeEnd={296}
          compositionWidth={HERO_WIDTH}
          menuInset={212}
        />

        <div
          style={{
            position: "absolute",
            left: HERO_WIDTH / 2 - width / 2,
            top: SCREEN_TOP,
          }}
        >
          <NotchBar
            width={width}
            height={height}
            contentOpacity={contentOpacity}
            sessions={sessions}
            time={time}
            orbSize={30}
            avatarSize={38}
            labels={[
              { text: "Standup in 4 min", opacity: 1 - labelBlend },
              { text: "1 needs you", opacity: labelBlend },
            ]}
            orbLayers={[
              { state: "working", opacity: 1 - orbBlend },
              { state: "needsAnswer", opacity: orbBlend },
            ]}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 358,
            textAlign: "center",
            fontFamily: font.sans,
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: 0.2,
            color: color.folkPaper,
            opacity: 0.84,
          }}
        >
          Your Spaces, with a pulse.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
