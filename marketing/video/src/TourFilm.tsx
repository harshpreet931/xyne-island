import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ProviderID, SessionState, color, font, positiveRemainder} from './brand';
import {Display} from './Display';
import {Folk} from './Folk';
import {Folkline} from './Folkline';
import {ThinkingOrb} from './ThinkingOrb';
import {IslandMark} from './Mark';
import {Pointer} from './Icons';
import {CardModel, ExpandedPanel, PANEL_HEIGHT, PANEL_WIDTH} from './ExpandedPanel';

export const TOUR_WIDTH = 1920;
export const TOUR_HEIGHT = 1080;
export const TOUR_FPS = 30;

const SCALE = 1.95;
const BEZEL_TOP = 96;
const BEZEL = 16;
const SCREEN_TOP = BEZEL_TOP + BEZEL;
const QUIET_W = 200;
const QUIET_H = 34;
const BAR_H = 40;
const SPACES = 'https://spaces.xyne.juspay.net';

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const settle = {damping: 200, stiffness: 130, mass: 0.8};

/** The primary button of the first card's drawer, in panel points. */
const PRIMARY_BUTTON = {x: 109.5, y: 189};

type Mode = 'quiet' | 'bar' | 'panel' | 'cast' | 'end';

type Scene = {
  id: string;
  seconds: number;
  mode: Mode;
  caption?: string;
  camera: [zoom: number, originY: number];
  bar?: {label: (f: number) => string; folk: {provider: ProviderID; state: SessionState}[]; orb: SessionState; width: number};
  cards?: (f: number, fps: number) => CardModel[];
  /** Pointer travels in, presses the first card's primary button at `clickAt` (local frames). */
  pointer?: {enterAt: number; clickAt: number};
  attentionCount?: (f: number) => number;
};

const sp = (frame: number, fps: number, config = settle) => spring({frame, fps, config});

// --- scenes ------------------------------------------------------------------

const call = (f: number, fps: number, minutes: number, entry = 1): CardModel => ({
  key: 'call',
  provider: 'call',
  state: 'working',
  title: 'Standup',
  activity: `Starts in ${minutes} min · 6 joining`,
  elapsed: '30s',
  phase: 0.9,
  entry,
});

const SCENES: Scene[] = [
  {
    id: 'cold',
    seconds: 3,
    mode: 'quiet',
    caption: 'Everything from Spaces that needs you, in the notch.',
    camera: [1.0, 220],
  },
  {
    id: 'wake',
    seconds: 5,
    mode: 'bar',
    caption: 'See what is coming.',
    camera: [1.22, 250],
    bar: {label: (f) => `Standup in ${Math.max(9, 12 - Math.floor(f / 60))} min`, folk: [{provider: 'call', state: 'working'}], orb: 'working', width: 470},
  },
  {
    id: 'mention',
    seconds: 10,
    mode: 'panel',
    caption: 'Know who needs you.',
    camera: [1.34, 300],
    pointer: {enterAt: 60, clickAt: 170},
    attentionCount: (f) => (f < 175 ? 1 : 0),
    cards: (f, fps) => {
      const opened = f >= 175;
      const detail = 1 - sp(f - 175, fps, {damping: 200, stiffness: 200, mass: 0.6});
      const press = interpolate(f, [170, 173, 179], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return [
        {
          key: 'mention',
          provider: 'mention',
          state: opened ? 'completed' : 'needsAnswer',
          title: 'Priya Raman · #xyne-spaces',
          activity: opened ? 'Opened in Spaces' : 'POT for #1653? Need it before the 6pm release cut.',
          elapsed: '4m',
          phase: 0,
          featured: !opened,
          reaction: opened ? interpolate(f, [175, 190], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : interpolate(f, [0, 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          interaction: detail > 0.01 ? {kind: 'question', title: 'Mentioned you in XYNE-61392 · 4:12 pm', detail: '@Harshpreet POT for #1653? Need it before the 6pm release cut.'} : undefined,
          detailWeight: detail,
          allowPress: press,
          entry: sp(f, fps),
        },
        call(f, fps, 9, sp(f - 8, fps)),
      ];
    },
  },
  {
    id: 'dm',
    seconds: 7,
    mode: 'panel',
    caption: 'Direct messages land here too.',
    camera: [1.34, 300],
    pointer: {enterAt: 50, clickAt: 140},
    attentionCount: (f) => (f < 145 ? 1 : 0),
    cards: (f, fps) => {
      const done = f >= 145;
      const detail = 1 - sp(f - 145, fps, {damping: 200, stiffness: 200, mass: 0.6});
      const press = interpolate(f, [140, 143, 149], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return [
        {
          key: 'dm',
          provider: 'mention',
          state: done ? 'completed' : 'needsAnswer',
          title: 'Aisha Khan',
          activity: done ? 'Marked read' : 'Can you look at the runner flag before standup?',
          elapsed: '1m',
          phase: 0.4,
          featured: !done,
          reaction: interpolate(f, [0, 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          interaction: detail > 0.01 ? {kind: 'question', title: 'Direct message · 10:42 am', detail: 'Can you look at the runner flag before standup?'} : undefined,
          detailWeight: detail,
          allowPress: press,
          entry: sp(f, fps),
        },
        call(f, fps, 8, 1),
      ];
    },
  },
  {
    id: 'ticket',
    seconds: 7,
    mode: 'panel',
    caption: 'Tickets find you.',
    camera: [1.3, 300],
    attentionCount: () => 1,
    cards: (f, fps) => [
      {
        key: 'ticket',
        provider: 'ticket',
        state: 'needsAnswer',
        title: 'XYNE-62857 · Add flag for custom runners',
        activity: 'Assigned to you by Devin · low · To be picked up',
        elapsed: '10s',
        phase: 1.1,
        featured: true,
        reaction: interpolate(f, [0, 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        interaction: {kind: 'question', title: 'New ticket for you · 10:44 am', detail: 'Add flag to enable custom runners in ci.yaml'},
        entry: sp(f, fps),
      },
      call(f, fps, 7, 1),
    ],
  },
  {
    id: 'overdue',
    seconds: 7,
    mode: 'panel',
    caption: 'And tell you when one slips.',
    camera: [1.3, 300],
    cards: (f, fps) => {
      const slipped = f >= 90;
      return [
        {
          key: 'due',
          provider: 'ticket',
          state: slipped ? 'failed' : 'working',
          title: 'XYNE-61392 · Custom field not persisting',
          activity: slipped ? 'Overdue by 2 min · critical · PR Review' : 'Due 6:00 pm · critical · PR Review',
          elapsed: '40m',
          phase: 1.75,
          featured: slipped,
          reaction: slipped ? interpolate(f, [90, 105], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0,
          entry: sp(f, fps),
        },
        call(f, fps, 6, 1),
      ];
    },
  },
  {
    id: 'fyi',
    seconds: 6,
    mode: 'panel',
    caption: 'Small changes pass through and retire on their own.',
    camera: [1.3, 300],
    cards: (f, fps) => {
      const leaving = 1 - sp(f - 120, fps, {damping: 200, stiffness: 120, mass: 0.9});
      const cards: CardModel[] = [];
      if (leaving > 0.01) {
        cards.push({
          key: 'pr',
          provider: 'ticket',
          state: 'idle',
          title: 'XYNE-61392 · PR #1653',
          activity: 'PR merged on your ticket · moved to Merged',
          elapsed: '5s',
          phase: 2.1,
          reaction: interpolate(f, [0, 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          entry: Math.min(sp(f, fps), leaving),
        });
      }
      cards.push(call(f, fps, 6, 1));
      return cards;
    },
  },
  {
    id: 'architect',
    seconds: 10,
    mode: 'panel',
    caption: 'Agents you tagged work while you work.',
    camera: [1.22, 340],
    cards: (f, fps) => {
      const answered = f >= 150;
      const weight = sp(f - 150, fps, {damping: 200, stiffness: 150, mass: 0.8});
      const reveal = interpolate(f, [160, 250], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return [
        {
          key: 'architect',
          provider: 'architect',
          state: answered ? 'completed' : 'working',
          title: 'Architect · XYNE-62857',
          activity: answered ? 'Answered' : f < 70 ? 'Reading ci.yaml and the runner config' : 'Checking where the flag is consumed',
          elapsed: '1m',
          phase: 2.6,
          featured: answered,
          reaction: answered ? interpolate(f, [150, 165], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0,
          finalResponse: answered ? 'The flag is read in two places: the workflow template and the runner allocator. Added it to both, with a default of off. PR #1607 updated.' : undefined,
          responseWeight: weight,
          responseReveal: reveal,
          entry: sp(f, fps),
        },
        call(f, fps, 5, 1),
      ];
    },
  },
  {
    id: 'doctor',
    seconds: 9,
    mode: 'panel',
    caption: 'Catch what just landed.',
    camera: [1.22, 340],
    cards: (f, fps) => {
      const landed = f >= 90;
      const weight = sp(f - 90, fps, {damping: 200, stiffness: 150, mass: 0.8});
      const reveal = interpolate(f, [100, 200], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return [
        {
          key: 'doctor',
          provider: 'bot',
          state: landed ? 'completed' : 'working',
          title: 'infra-doctor · #production-logs',
          activity: landed ? 'RCA ready' : 'Correlating the CPU alarm with ALB counts',
          elapsed: '3m',
          phase: 3.4,
          featured: landed,
          reaction: landed ? interpolate(f, [90, 105], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0,
          finalResponse: landed ? 'RCA complete. The CPU alarm self-resolved at 13:08 UTC. Root cause: an imposter SQL flood, about 1M requests a minute, that decayed by 21:00.' : undefined,
          responseWeight: weight,
          responseReveal: reveal,
          entry: sp(f, fps),
        },
        call(f, fps, 4, 1),
      ];
    },
  },
  {
    id: 'approval',
    seconds: 9,
    mode: 'panel',
    caption: 'Approve without leaving your work.',
    camera: [1.34, 300],
    pointer: {enterAt: 60, clickAt: 170},
    attentionCount: (f) => (f < 175 ? 1 : 0),
    cards: (f, fps) => {
      const approved = f >= 175;
      const detail = 1 - sp(f - 175, fps, {damping: 200, stiffness: 200, mass: 0.6});
      const press = interpolate(f, [170, 173, 179], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return [
        {
          key: 'approval',
          provider: 'ticket',
          state: approved ? 'working' : 'needsApproval',
          title: 'XYNE-62857 · custom runners flag',
          activity: approved ? 'Approved — moved to QA' : 'Devin asked to move it to QA',
          elapsed: '2m',
          phase: 1.3,
          featured: !approved,
          reaction: interpolate(f, [0, 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          interaction: detail > 0.01 ? {kind: 'approval', title: 'Approve the move to QA?', detail: 'Stage gate needs one approver · requested by Devin'} : undefined,
          detailWeight: detail,
          allowPress: press,
          entry: sp(f, fps),
        },
        call(f, fps, 3, 1),
      ];
    },
  },
  {
    id: 'missed',
    seconds: 5,
    mode: 'panel',
    caption: 'Missed calls wait for you.',
    camera: [1.3, 300],
    attentionCount: () => 1,
    cards: (f, fps) => [
      {
        key: 'missed',
        provider: 'call',
        state: 'needsAnswer',
        title: 'Aisha Khan',
        activity: 'Missed call · 2 min ago',
        elapsed: '2m',
        phase: 0.6,
        featured: true,
        reaction: interpolate(f, [0, 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        interaction: {kind: 'question', title: 'Missed call · 10:51 am', detail: 'Call back from the notch, or open the thread'},
        entry: sp(f, fps),
      },
      call(f, fps, 2, 1),
    ],
  },
  {
    id: 'glyphs',
    seconds: 7,
    mode: 'bar',
    caption: 'One glyph per kind of thing, before you even look.',
    camera: [1.3, 250],
    bar: {
      label: () => '3 needs you',
      folk: [
        {provider: 'mention', state: 'needsAnswer'},
        {provider: 'ticket', state: 'working'},
        {provider: 'call', state: 'working'},
        {provider: 'architect', state: 'working'},
        {provider: 'askai', state: 'working'},
        {provider: 'bot', state: 'completed'},
      ],
      orb: 'needsAnswer',
      width: 560,
    },
  },
  {id: 'quiet', seconds: 3, mode: 'quiet', caption: 'Quiet when nothing needs you.', camera: [1.0, 220]},
  {id: 'cast', seconds: 9, mode: 'cast', camera: [1.0, 240]},
  {id: 'end', seconds: 8, mode: 'end', camera: [1.0, 240]},
];

const starts: number[] = [];
{
  let acc = 0;
  for (const s of SCENES) {
    starts.push(acc);
    acc += s.seconds * TOUR_FPS;
  }
}
export const TOUR_DURATION = SCENES.reduce((n, s) => n + s.seconds * TOUR_FPS, 0);

const Surface: React.FC<{width: number; height: number; radius: number; children?: React.ReactNode}> = ({width, height, radius, children}) => (
  <div style={{width, height, background: '#000000', borderBottomLeftRadius: radius, borderBottomRightRadius: radius, overflow: 'hidden', position: 'relative'}}>{children}</div>
);

const panelHeightFor = (cards: CardModel[]): number => {
  let h = 54 + 1 + 10 + 10;
  cards.forEach((c, i) => {
    h += 60 + (i ? 8 : 0);
    if (c.interaction) h += 90 * (c.detailWeight ?? 1);
    if (c.finalResponse) h += 70 * (c.responseWeight ?? 1);
  });
  return Math.max(PANEL_HEIGHT, Math.ceil(h));
};

export const TourFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps + 4.7;

  let index = 0;
  for (let i = 0; i < SCENES.length; i++) if (frame >= starts[i]) index = i;
  const scene = SCENES[index];
  const prev = SCENES[index - 1];
  const local = frame - starts[index];
  const sceneLen = scene.seconds * fps;

  // --- surface morph -----------------------------------------------------
  const morph = sp(local, fps, {damping: 200, stiffness: 150, mass: 0.85});
  const targetFor = (s: Scene | undefined, cards: CardModel[]): {w: number; h: number; r: number} => {
    if (!s || s.mode === 'quiet' || s.mode === 'end' || s.mode === 'cast') return {w: QUIET_W, h: QUIET_H, r: 12};
    if (s.mode === 'bar') return {w: s.bar?.width ?? 470, h: BAR_H, r: 12};
    return {w: PANEL_WIDTH, h: panelHeightFor(cards), r: 26};
  };
  const cards = scene.cards ? scene.cards(local, fps) : [];
  const prevCards = prev?.cards ? prev.cards(prev.seconds * fps, fps) : [];
  const to = targetFor(scene, cards);
  const from = targetFor(prev, prevCards);
  const width = lerp(from.w, to.w, morph);
  const height = lerp(from.h, to.h, morph);
  const radius = lerp(from.r, to.r, morph);

  // Chapter cuts: panel→panel dissolves the outgoing cards under the incoming ones;
  // a change of mode fades the content while the surface morphs.
  const next = SCENES[index + 1];
  const sameMode = !!prev && prev.mode === scene.mode && scene.mode === 'panel';
  const XFADE = 14;
  const xfade = sameMode ? clamp01(local / XFADE) : 1;
  const fadeIn = interpolate(local, [6, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(local, [sceneLen - 14, sceneLen - 2], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const contentOpacity = sameMode ? xfade : fadeIn * (next && next.mode !== scene.mode ? fadeOut : 1);
  const showPrevPanel = sameMode && local < XFADE;

  // --- camera --------------------------------------------------------------
  const camT = interpolate(local, [0, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const camFrom = prev?.camera ?? scene.camera;
  const breath = Math.sin(time * 0.34) * 0.006;
  const zoom = lerp(camFrom[0], scene.camera[0], camT) + breath;
  const originY = lerp(camFrom[1], scene.camera[1], camT);

  // --- pointer -------------------------------------------------------------
  let pointer: {x: number; y: number; opacity: number; press: number} | null = null;
  if (scene.pointer) {
    const travel = sp(local - scene.pointer.enterAt, fps, {damping: 200, stiffness: 58, mass: 1});
    const targetX = TOUR_WIDTH / 2 + (PRIMARY_BUTTON.x - PANEL_WIDTH / 2) * SCALE;
    const targetY = SCREEN_TOP + PRIMARY_BUTTON.y * SCALE;
    const press = interpolate(local, [scene.pointer.clickAt, scene.pointer.clickAt + 3, scene.pointer.clickAt + 9], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const opacity =
      interpolate(local, [scene.pointer.enterAt, scene.pointer.enterAt + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
      interpolate(local, [scene.pointer.clickAt + 16, scene.pointer.clickAt + 30], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    pointer = {x: lerp(TOUR_WIDTH / 2 + 430, targetX, travel), y: lerp(SCREEN_TOP + 540, targetY, travel), opacity, press};
  }

  // --- captions & end card -------------------------------------------------
  const captionIn = interpolate(local, [12, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const captionOut = interpolate(local, [sceneLen - 16, sceneLen - 4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionWeight = captionIn * captionOut;

  const isCast = scene.mode === 'cast';
  const isEnd = scene.mode === 'end' || isCast;
  const endIn = isEnd ? interpolate(local, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const markIn = isEnd ? sp(local, fps, {damping: 200, stiffness: 120, mass: 0.9}) : 0;
  const castWeights = [12, 18, 24, 30, 36, 42].map((d) => (isEnd ? (scene.mode === 'end' ? 1 : sp(local - d, fps, {damping: 200, stiffness: 120, mass: 0.9})) : 0));
  const CAST = [
    {name: 'Pip', role: 'mentions & DMs'},
    {name: 'Stub', role: 'tickets'},
    {name: 'Ring', role: 'calls'},
    {name: 'Beam', role: 'the Architect'},
    {name: 'Sage', role: 'Ask AI'},
    {name: 'Doc', role: 'every other agent'},
  ];
  const markPulse = positiveRemainder(time, 1.15) < 0.72 ? 1 : 0.14;
  const sceneOpacity = isEnd ? 1 - endIn : 1;

  const attention = scene.attentionCount ? scene.attentionCount(local) : 0;
  const attentionWeight = attention > 0 ? sp(local, fps, {damping: 200, stiffness: 170, mass: 0.7}) : 0;
  const live = cards.length;
  const inMotion = cards.filter((c) => c.state === 'working').length;
  const showsClear = cards.some((c) => c.state === 'completed' || c.state === 'failed');

  return (
    <AbsoluteFill style={{backgroundColor: color.night}}>
      <AbsoluteFill style={{opacity: sceneOpacity, transform: `scale(${zoom})`, transformOrigin: `${TOUR_WIDTH / 2}px ${originY}px`}}>
        <Display top={BEZEL_TOP} width={2280} height={820} bezel={BEZEL} menuBarHeight={62} fadeStart={430} fadeEnd={760} compositionWidth={TOUR_WIDTH} menuInset={235} />

        <div style={{position: 'absolute', left: 0, right: 0, top: SCREEN_TOP, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${SCALE})`, transformOrigin: 'top center'}}>
            <Surface width={width} height={height} radius={radius}>
              {scene.mode === 'bar' && scene.bar ? (
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 15, paddingRight: 12, opacity: contentOpacity}}>
                  <ThinkingOrb state={scene.bar.orb} time={time} size={18} />
                  <span style={{marginLeft: 9, fontFamily: font.sans, fontSize: 11.5, fontWeight: 500, color: color.quietPaper, whiteSpace: 'nowrap'}}>{scene.bar.label(local)}</span>
                  <div style={{flexGrow: 1}} />
                  <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
                    {scene.bar.folk.map((f, i) => (
                      <div key={f.provider} style={{opacity: clamp01(sp(local - 10 - i * 6, fps)), transform: `translateY(${(1 - clamp01(sp(local - 10 - i * 6, fps))) * 6}px)`}}>
                        <Folk provider={f.provider} state={f.state} time={time + i * 1.3} size={24} showsContainer />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {showPrevPanel && prev ? (
                <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - xfade}}>
                  <ExpandedPanel
                    cards={prevCards}
                    time={time}
                    attentionCount={1}
                    attentionWeight={prev.attentionCount ? (prev.attentionCount(prev.seconds * fps) > 0 ? 1 : 0) : 0}
                    sessionSummary={`${prevCards.length} LIVE · ${prevCards.filter((c) => c.state === 'working').length} IN MOTION`}
                    showsClearButton={prevCards.some((c) => c.state === 'completed' || c.state === 'failed')}
                    height={from.h}
                  />
                </div>
              ) : null}

              {scene.mode === 'panel' ? (
                <div style={{position: 'absolute', left: 0, top: 0, opacity: contentOpacity}}>
                  <ExpandedPanel
                    cards={cards}
                    time={time}
                    attentionCount={Math.max(attention, 1)}
                    attentionWeight={attentionWeight}
                    sessionSummary={`${live} LIVE · ${inMotion} IN MOTION`}
                    showsClearButton={showsClear}
                    height={to.h}
                  />
                </div>
              ) : null}
            </Surface>
          </div>
        </div>

        {pointer ? (
          <div style={{position: 'absolute', left: pointer.x, top: pointer.y, opacity: pointer.opacity, transform: `scale(${1 - pointer.press * 0.12})`, transformOrigin: 'top left'}}>
            <Pointer size={30} />
          </div>
        ) : null}
      </AbsoluteFill>

      {scene.caption && !isEnd ? (
        <div
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
            opacity: captionWeight * 0.86,
            transform: `translateY(${(1 - captionIn) * 12}px)`,
          }}
        >
          {scene.caption}
        </div>
      ) : null}

      {isCast ? (
        <AbsoluteFill style={{opacity: endIn * interpolate(local, [sceneLen - 14, sceneLen - 2], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <span style={{fontFamily: font.sans, fontSize: 31, fontWeight: 400, letterSpacing: 0.2, color: color.folkPaper, opacity: 0.86 * markIn, transform: `translateY(${(1 - markIn) * 12}px)`}}>
              Six characters. Each one is a kind of thing that can need you.
            </span>
            <div style={{height: 54}} />
            <Folkline time={time} weights={castWeights} size={108} width={880} />
            <div style={{height: 10}} />
            <div style={{display: 'flex', gap: 18, width: 6 * 108 + 5 * 18, justifyContent: 'center'}}>
              {CAST.map((member, i) => (
                <div key={member.name} style={{width: 108, textAlign: 'center', opacity: castWeights[i], transform: `translateY(${(1 - castWeights[i]) * 8}px)`}}>
                  <div style={{fontFamily: font.rounded, fontSize: 20, fontWeight: 600, color: color.quietPaper}}>{member.name}</div>
                  <div style={{fontFamily: font.sans, fontSize: 15, fontWeight: 400, color: color.folkPaper, opacity: 0.58, marginTop: 4}}>{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {scene.mode === 'end' ? (
        <AbsoluteFill style={{opacity: endIn, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - markIn) * 16}px)`}}>
            <div style={{transform: `scale(${0.9 + markIn * 0.1})`}}>
              <IslandMark size={88} pulse={markPulse} />
            </div>
            <div style={{height: 30}} />
            <span style={{fontFamily: font.mono, fontSize: 40, fontWeight: 700, letterSpacing: 8, color: color.quietPaper}}>XYNE ISLAND</span>
            <div style={{height: 18}} />
            <span style={{fontFamily: font.sans, fontSize: 25, fontWeight: 400, letterSpacing: 0.2, color: color.folkPaper, opacity: 0.58}}>Your Spaces, with a pulse.</span>
            <div style={{height: 50}} />
            <Folkline time={time} weights={castWeights} size={88} width={760} />
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
