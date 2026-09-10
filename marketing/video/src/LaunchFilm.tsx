import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {color, font, positiveRemainder} from './brand';
import {Display} from './Display';
import {Folk} from './Folk';
import {Folkline} from './Folkline';
import {ThinkingOrb} from './ThinkingOrb';
import {IslandMark} from './Mark';
import {Pointer} from './Icons';
import {CardModel, ExpandedPanel, PANEL_HEIGHT, PANEL_WIDTH} from './ExpandedPanel';

export const FILM_WIDTH = 1920;
export const FILM_HEIGHT = 1080;
export const FILM_FPS = 60;
export const FILM_DURATION = 1080;

/** The notch surface is drawn at true point sizes, then scaled once. */
const SCALE = 1.95;

const BEZEL_TOP = 96;
const BEZEL = 16;
const SCREEN_TOP = BEZEL_TOP + BEZEL;

const QUIET_W = 200;
const QUIET_H = 34;
const BAR_W = 470;
const BAR_H = 40;

/**
 * One story, 18 seconds: a quiet notch → the standup countdown → a mention
 * needs you → Open → the ticket and the Architect arrive → an RCA lands →
 * the notch settles → the home mark and the cast.
 */
const BAR_IN = 55;
const MENTION_AT = 215;
const CURSOR_IN = 300;
const CLICK_AT = 395;
const OPENED_AT = 405;
const MENTION_OUT = 440;
const TICKET_AT = 458;
const ARCHITECT_AT = 476;
const DOCTOR_AT = 496;
const FINAL_AT = 645;
const COLLAPSE_AT = 810;
const ENDCARD_AT = 878;

/** Measured from the panel layout: the primary button in the first card's drawer. */
const OPEN_LOCAL = {x: 109.5, y: 189};

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Camera keyframes: [frame, zoom, originY]. */
const CAMERA: [number, number, number][] = [
  [0, 1.0, 220],
  [BAR_IN, 1.04, 220],
  [105, 1.22, 250],
  [205, 1.28, 250],
  [245, 1.02, 430],
  [300, 1.06, 430],
  [345, 1.42, 296],
  [400, 1.46, 296],
  [450, 1.03, 440],
  [630, 1.09, 440],
  [675, 1.12, 600],
  [775, 1.16, 600],
  [820, 1.0, 240],
  [ENDCARD_AT, 1.0, 240],
];

const BEATS: {text: string; from: number; to: number}[] = [
  {text: 'See what is coming.', from: 112, to: 208},
  {text: 'Know who needs you.', from: 252, to: 342},
  {text: 'Catch what just landed.', from: 690, to: 784},
];

const Surface: React.FC<{
  width: number;
  height: number;
  radius: number;
  children?: React.ReactNode;
}> = ({width, height, radius, children}) => (
  <div
    style={{
      width,
      height,
      background: '#000000',
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    {children}
  </div>
);

const settle = {damping: 200, stiffness: 130, mass: 0.8};

export const LaunchFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps + 4.7;

  // --- camera --------------------------------------------------------------
  const camFrames = CAMERA.map((key) => key[0]);
  const easing = {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp' as const,
    extrapolateRight: 'clamp' as const,
  };
  const breath = Math.sin(time * 0.34) * 0.006;
  const zoom = interpolate(frame, camFrames, CAMERA.map((key) => key[1]), easing) + breath;
  const originY = interpolate(frame, camFrames, CAMERA.map((key) => key[2]), easing);

  const openBar = spring({frame: frame - BAR_IN, fps, config: {damping: 200, stiffness: 170, mass: 0.75}});
  const openPanel = spring({frame: frame - MENTION_AT, fps, config: {damping: 200, stiffness: 140, mass: 0.9}});
  const closeAll = spring({frame: frame - COLLAPSE_AT, fps, config: {damping: 200, stiffness: 190, mass: 0.7}});

  const barW = lerp(QUIET_W, BAR_W, openBar);
  const barH = lerp(QUIET_H, BAR_H, openBar);
  // Four cards plus the RCA drawer need more than the app's fixed panel; grow as the drawer opens.
  const drawerGrowth = spring({frame: frame - FINAL_AT, fps, config: {damping: 200, stiffness: 150, mass: 0.8}});
  const panelHeight = PANEL_HEIGHT + 84 * drawerGrowth;
  const width = lerp(lerp(barW, PANEL_WIDTH, openPanel), QUIET_W, closeAll);
  const height = lerp(lerp(barH, panelHeight, openPanel), QUIET_H, closeAll);
  const radius = lerp(lerp(12, 26, openPanel), 12, closeAll);

  const fadeOnClose = 1 - interpolate(closeAll, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'});
  const barContentOpacity =
    interpolate(openBar, [0.6, 0.96], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    (1 - interpolate(openPanel, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'})) *
    fadeOnClose;
  const panelContentOpacity =
    interpolate(openPanel, [0.5, 0.88], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * fadeOnClose;

  // The countdown on the bar ticks while the story runs; the call is 12 minutes out.
  const minutesLeft = Math.max(4, 12 - Math.floor(frame / 120));

  // --- session model -------------------------------------------------------
  const opened = frame >= OPENED_AT;
  const detailWeight = 1 - spring({frame: frame - OPENED_AT, fps, config: {damping: 200, stiffness: 200, mass: 0.6}});
  const attentionWeight = 1 - spring({frame: frame - OPENED_AT, fps, config: {damping: 200, stiffness: 170, mass: 0.7}});
  const mentionExit = spring({frame: frame - MENTION_OUT, fps, config: {damping: 200, stiffness: 160, mass: 0.7}});

  const ticketEntry = spring({frame: frame - TICKET_AT, fps, config: settle});
  const architectEntry = spring({frame: frame - ARCHITECT_AT, fps, config: settle});
  const doctorEntry = spring({frame: frame - DOCTOR_AT, fps, config: settle});

  const finished = frame >= FINAL_AT;
  const responseWeight = spring({frame: frame - FINAL_AT, fps, config: {damping: 200, stiffness: 150, mass: 0.8}});
  const responseReveal = interpolate(frame, [FINAL_AT + 12, FINAL_AT + 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const openPress = interpolate(frame, [CLICK_AT, CLICK_AT + 5, CLICK_AT + 12], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const mentionReaction = opened
    ? interpolate(frame, [OPENED_AT, OPENED_AT + 17], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : interpolate(frame, [MENTION_AT, MENTION_AT + 17], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const doctorReaction = finished
    ? interpolate(frame, [FINAL_AT, FINAL_AT + 17], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0;

  const cards: CardModel[] = [];

  if (mentionExit < 0.99) {
    cards.push({
      key: 'mention',
      provider: 'mention',
      state: opened ? 'completed' : 'needsAnswer',
      title: 'Priya Raman · #xyne-spaces',
      activity: opened ? 'Opened in Spaces' : 'POT for #1653? Need it before the 6pm release cut.',
      elapsed: '4m',
      phase: 0,
      featured: !opened,
      reaction: mentionReaction,
      interaction:
        detailWeight > 0.01
          ? {
              kind: 'question',
              title: 'Mentioned you in XYNE-61392 · 4:12 pm',
              detail: '@Harshpreet POT for #1653? Need it before the 6pm release cut.',
            }
          : undefined,
      detailWeight,
      allowPress: openPress,
      entry: 1 - mentionExit,
    });
  }

  cards.push({
    key: 'call',
    provider: 'call',
    state: 'working',
    title: 'Standup',
    activity: `Starts in ${minutesLeft} min · 6 joining`,
    elapsed: '30s',
    phase: 0.9,
  });

  if (ticketEntry > 0) {
    cards.push({
      key: 'ticket',
      provider: 'ticket',
      state: 'working',
      title: 'XYNE-61392 · Custom field not persisting',
      activity: 'Due 6:00 pm · critical · PR Review',
      elapsed: '40m',
      phase: 1.75,
      entry: ticketEntry,
    });
  }

  if (architectEntry > 0) {
    cards.push({
      key: 'architect',
      provider: 'architect',
      state: 'working',
      title: 'Architect · XYNE-62857',
      activity: 'Reading ci.yaml and the runner config',
      elapsed: '1m',
      phase: 2.6,
      entry: architectEntry,
    });
  }

  if (doctorEntry > 0) {
    cards.push({
      key: 'doctor',
      provider: 'bot',
      state: finished ? 'completed' : 'working',
      title: 'infra-doctor · #production-logs',
      activity: finished ? 'RCA ready' : 'Correlating the CPU alarm with ALB counts',
      elapsed: '3m',
      phase: 3.4,
      entry: doctorEntry,
      featured: finished,
      reaction: doctorReaction,
      finalResponse: finished
        ? 'RCA complete. The CPU alarm self-resolved at 13:08 UTC. Root cause: an imposter SQL flood, about 1M requests a minute, that decayed by 21:00.'
        : undefined,
      responseWeight,
      responseReveal,
    });
  }

  const live = cards.filter((card) => card.entry === undefined || card.entry > 0.5).length;
  const inMotion = cards.filter((card) => card.state === 'working').length;
  const sessionSummary = `${live} LIVE · ${inMotion} IN MOTION`;

  // --- pointer -------------------------------------------------------------
  const openX = FILM_WIDTH / 2 + (OPEN_LOCAL.x - PANEL_WIDTH / 2) * SCALE;
  const openY = SCREEN_TOP + OPEN_LOCAL.y * SCALE;
  const cursorTravel = spring({frame: frame - CURSOR_IN, fps, config: {damping: 200, stiffness: 58, mass: 1}});
  const cursorX = lerp(FILM_WIDTH / 2 + 430, openX, cursorTravel);
  const cursorY = lerp(SCREEN_TOP + 540, openY, cursorTravel);
  const cursorOpacity =
    interpolate(frame, [CURSOR_IN, CURSOR_IN + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(frame, [CLICK_AT + 24, CLICK_AT + 44], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // --- end card ------------------------------------------------------------
  const sceneOpacity = interpolate(frame, [COLLAPSE_AT + 26, ENDCARD_AT], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const endOpacity = interpolate(frame, [ENDCARD_AT, ENDCARD_AT + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const markIn = spring({frame: frame - ENDCARD_AT, fps, config: {damping: 200, stiffness: 120, mass: 0.9}});
  const castWeights = [24, 34, 44, 54, 64, 74].map((delay) =>
    spring({frame: frame - ENDCARD_AT - delay, fps, config: {damping: 200, stiffness: 120, mass: 0.9}}),
  );
  // The coral x breathes like a cursor: on, then dim, never a glow.
  const markPulse = positiveRemainder(time, 1.15) < 0.72 ? 1 : 0.14;

  return (
    <AbsoluteFill style={{backgroundColor: color.night}}>
      <AbsoluteFill
        style={{
          opacity: sceneOpacity,
          transform: `scale(${zoom})`,
          transformOrigin: `${FILM_WIDTH / 2}px ${originY}px`,
        }}
      >
        <Display
          top={BEZEL_TOP}
          width={2280}
          height={820}
          bezel={BEZEL}
          menuBarHeight={62}
          fadeStart={430}
          fadeEnd={760}
          compositionWidth={FILM_WIDTH}
          menuInset={235}
        />

        <div style={{position: 'absolute', left: 0, right: 0, top: SCREEN_TOP, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${SCALE})`, transformOrigin: 'top center'}}>
            <Surface width={width} height={height} radius={radius}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 15,
                  paddingRight: 12,
                  opacity: barContentOpacity,
                }}
              >
                <ThinkingOrb state="working" time={time} size={18} />
                <span
                  style={{
                    marginLeft: 9,
                    fontFamily: font.sans,
                    fontSize: 11.5,
                    fontWeight: 500,
                    color: color.quietPaper,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Standup in {minutesLeft} min
                </span>
                <div style={{flexGrow: 1}} />
                <Folk provider="call" state="working" time={time} size={24} />
              </div>

              <div style={{position: 'absolute', left: 0, top: 0, opacity: panelContentOpacity}}>
                <ExpandedPanel
                  cards={cards}
                  time={time}
                  attentionCount={1}
                  attentionWeight={attentionWeight}
                  sessionSummary={sessionSummary}
                  showsClearButton={finished}
                  height={panelHeight}
                />
              </div>
            </Surface>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: cursorX,
            top: cursorY,
            opacity: cursorOpacity,
            transform: `scale(${1 - openPress * 0.12})`,
            transformOrigin: 'top left',
          }}
        >
          <Pointer size={30} />
        </div>
      </AbsoluteFill>

      {BEATS.map((beat) => {
        const inWeight = interpolate(frame, [beat.from, beat.from + 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        });
        const outWeight = interpolate(frame, [beat.to - 16, beat.to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const weight = inWeight * outWeight * sceneOpacity;
        if (weight <= 0.01) return null;
        return (
          <div
            key={beat.text}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 962,
              textAlign: 'center',
              fontFamily: font.sans,
              fontSize: 31,
              fontWeight: 400,
              letterSpacing: 0.2,
              color: color.folkPaper,
              opacity: weight * 0.86,
              transform: `translateY(${(1 - inWeight) * 12}px)`,
            }}
          >
            {beat.text}
          </div>
        );
      })}

      <AbsoluteFill style={{opacity: endOpacity, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - markIn) * 16}px)`}}>
          <div style={{transform: `scale(${0.9 + markIn * 0.1})`}}>
            <IslandMark size={88} pulse={markPulse} />
          </div>
          <div style={{height: 30}} />
          <span style={{fontFamily: font.mono, fontSize: 40, fontWeight: 700, letterSpacing: 8, color: color.quietPaper}}>XYNE ISLAND</span>
          <div style={{height: 18}} />
          <span style={{fontFamily: font.sans, fontSize: 25, fontWeight: 400, letterSpacing: 0.2, color: color.folkPaper, opacity: 0.58}}>
            Your Spaces, with a pulse.
          </span>
          <div style={{height: 50}} />
          <Folkline time={time} weights={castWeights} size={88} width={760} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
