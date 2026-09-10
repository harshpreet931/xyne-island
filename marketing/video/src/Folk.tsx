import React from 'react';
import {
  ProviderID,
  SessionState,
  ambientLean,
  bobAmplitude,
  bobMultiplier,
  cheekBase,
  color,
  motionRate,
  needsAttention,
  normalizedSine,
  personalityOffset,
  positiveRemainder,
  providerColor,
} from './brand';

/**
 * SVG port of ProviderAvatarView.swift. All geometry is expressed in
 * thousandths of the folk body size, matching the Swift `size * fraction`
 * idiom one-to-one so the two implementations stay comparable.
 */

const U = 1000;
const u = (fraction: number) => fraction * U;

/** Frame bottom used as the squash/stretch anchor — identical for all folk. */
const STRETCH_ANCHOR_Y = u(0.47);

type FolkGeometry = {
  frameOffsetY: number;
};

const geometry: Record<ProviderID, FolkGeometry> = {
  claude: {frameOffsetY: u(0.06)},
  codex: {frameOffsetY: u(0.09)},
  opencode: {frameOffsetY: u(0.09)},
  mention: {frameOffsetY: u(0.06)},
  ticket: {frameOffsetY: u(0.06)},
  call: {frameOffsetY: u(0.06)},
  architect: {frameOffsetY: u(0.06)},
  askai: {frameOffsetY: u(0.06)},
  bot: {frameOffsetY: u(0.06)},
};

// ---------------------------------------------------------------------------
// Face — ProviderAvatarView.swift:422
// ---------------------------------------------------------------------------

type FaceProps = {
  provider: ProviderID;
  state: SessionState;
  time: number;
  bodySizePx: number;
};

const blinkWave = (phase: number, start: number, duration: number): number | null => {
  if (phase < start || phase > start + duration) return null;
  const progress = (phase - start) / duration;
  return Math.max(0.1, Math.abs(Math.cos(progress * Math.PI)));
};

const FolkFace: React.FC<FaceProps> = ({provider, state, time, bodySizePx}) => {
  const offset = personalityOffset(provider);
  const attention = needsAttention(state);
  const isStill = state === 'completed' || state === 'failed';

  // eyeScale — swift:538
  const eyeD = attention ? 0.138 : 0.115;

  // gazeX — swift:544
  let gazeX = 0;
  if (state === 'working') {
    gazeX =
      Math.sin(time * 0.82 + offset) * 0.022 + Math.sin(time * 1.9 + offset) * 0.007;
  } else if (state === 'idle') {
    gazeX = Math.sin(time * 0.34 + offset) * 0.014;
  }

  // gazeY — swift:559
  const gazeY = state === 'working' ? Math.sin(time * 0.61 + offset) * 0.006 : 0;

  // blinkScale — swift:564
  let blinkScale = 1;
  if (!attention && !isStill) {
    const period = 4.6 + offset;
    const phase = positiveRemainder(time + offset, period);
    blinkScale =
      blinkWave(phase, period - 0.42, 0.15) ?? blinkWave(phase, period - 0.17, 0.12) ?? 1;
  }

  // resolvedCheekOpacity — swift:583
  let cheek = cheekBase(provider);
  if (attention) cheek += 0.12;
  if (state === 'working') cheek += normalizedSine(time * 1.7 + offset) * 0.07;
  cheek = Math.min(cheek, 0.72);

  // brows — swift:593
  const browOpacity = attention ? 0.58 : state === 'working' ? 0.36 : 0;
  const browLift = attention ? -0.018 : 0;
  const leftBrow = attention
    ? -5
    : state === 'working'
      ? 8 + Math.sin(time * 0.55 + offset) * 1.5
      : -2;
  const rightBrow = attention
    ? 5
    : state === 'working'
      ? -8 - Math.sin(time * 0.55 + offset) * 1.5
      : 2;

  // Mouth frame — swift:492
  let mouthW: number;
  let mouthH: number;
  if (attention) {
    mouthW = 0.1;
    mouthH = 0.1;
  } else if (state === 'completed') {
    mouthW = 0.21;
    mouthH = 0.1;
  } else if (state === 'failed') {
    mouthW = 0.18;
    mouthH = 0.08;
  } else if (state === 'working') {
    mouthW = 0.115 + normalizedSine(time * 1.45 + offset) * 0.025;
    mouthH = 0.035;
  } else {
    mouthW = 0.12;
    mouthH = 0.035;
  }

  // VStack(spacing: 0.105) { eyes; mouth } — swift:453
  const eyeRowH = isStill ? 0.035 : eyeD;
  const eyeW = isStill ? 0.12 : eyeD;
  const totalH = eyeRowH + 0.105 + mouthH;
  const stackCenterY = 0.08 + gazeY;
  const eyeCY = stackCenterY - totalH / 2 + eyeRowH / 2;
  const mouthCY = stackCenterY + totalH / 2 - mouthH / 2;
  const eyeCX = (0.17 + eyeW) / 2;

  const renderEye = (side: -1 | 1) => {
    const cx = u(gazeX + side * eyeCX);
    const cy = u(eyeCY);

    if (isStill) {
      const rotation =
        (state === 'failed' ? (side === -1 ? 9 : -9) : 0) +
        (state === 'completed' ? 12 : 0);
      return (
        <rect
          key={side}
          x={cx - u(0.12) / 2}
          y={cy - u(0.035) / 2}
          width={u(0.12)}
          height={u(0.035)}
          rx={u(0.0175)}
          fill={color.folkInk}
          fillOpacity={0.88}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
      );
    }

    const r = u(eyeD) / 2;
    return (
      <g key={side} transform={`translate(${cx} ${cy}) scale(1 ${blinkScale})`}>
        <circle cx={0} cy={0} r={r} fill={color.folkInk} />
        {bodySizePx >= 20 ? (
          <circle
            cx={-r + u(0.027) + u(0.031) / 2}
            cy={-r + u(0.027) + u(0.031) / 2}
            r={u(0.031) / 2}
            fill={color.folkPaper}
            fillOpacity={0.9}
          />
        ) : null}
      </g>
    );
  };

  const renderMouth = () => {
    const cx = u(gazeX);
    const cy = u(mouthCY);

    if (attention) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={u(0.1) / 2}
          fill="none"
          stroke={color.folkInk}
          strokeOpacity={0.82}
          strokeWidth={u(0.045)}
        />
      );
    }

    if (state === 'completed' || state === 'failed') {
      const w = u(mouthW);
      const h = u(mouthH);
      const left = cx - w / 2;
      const top = cy - h / 2;
      const d =
        state === 'completed'
          ? // FolkSmileShape — swift:670
            `M ${left} ${top + h * 0.2} Q ${left + w / 2} ${top + h} ${left + w} ${top + h * 0.2}`
          : // FolkFrownShape — swift:682
            `M ${left} ${top + h} Q ${left + w / 2} ${top} ${left + w} ${top + h}`;
      return (
        <path
          d={d}
          fill="none"
          stroke={color.folkInk}
          strokeOpacity={state === 'completed' ? 0.86 : 0.72}
          strokeWidth={state === 'completed' ? u(0.045) : u(0.04)}
          strokeLinecap="round"
        />
      );
    }

    const drift = state === 'working' ? Math.sin(time * 1.1 + offset) * 0.008 : 0;
    const w = u(mouthW);
    const h = u(mouthH);
    return (
      <rect
        x={cx + u(drift) - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={color.folkInk}
        fillOpacity={state === 'working' ? 0.76 : 0.54}
      />
    );
  };

  const renderBrow = (side: -1 | 1) => {
    const cx = u(side * 0.235);
    const cy = u(-0.055 + browLift);
    const w = u(0.04);
    const h = u(0.027);
    return (
      <rect
        key={side}
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={color.folkInk}
        fillOpacity={browOpacity}
        transform={`rotate(${side === -1 ? leftBrow : rightBrow} ${cx} ${cy})`}
      />
    );
  };

  return (
    <g>
      {bodySizePx >= 19 && browOpacity > 0 ? [renderBrow(-1), renderBrow(1)] : null}

      {/* cheeks — swift:445 */}
      <ellipse
        cx={u(-0.285)}
        cy={u(0.18)}
        rx={u(0.075) / 2}
        ry={u(0.075) / 2}
        fill={color.folkPaper}
        fillOpacity={cheek}
      />
      <ellipse
        cx={u(0.285)}
        cy={u(0.18)}
        rx={u(0.075) / 2}
        ry={u(0.075) / 2}
        fill={color.folkPaper}
        fillOpacity={cheek}
      />

      {renderEye(-1)}
      {renderEye(1)}
      {renderMouth()}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Bodies
// ---------------------------------------------------------------------------

/** WarmFolkBodyShape — swift:624, mapped into a 1.0 x 0.82 rect centred on 0. */
const emberBodyPath = (): string => {
  const w = 1;
  const h = 0.82;
  const x = (f: number) => u(-0.5 + f * w);
  const y = (f: number) => u(-0.41 + f * h);
  return [
    `M ${x(0.48)} ${y(0.04)}`,
    `C ${x(0.74)} ${y(0.02)} ${x(0.91)} ${y(0.18)} ${x(0.9)} ${y(0.42)}`,
    `C ${x(0.92)} ${y(0.76)} ${x(0.8)} ${y(0.94)} ${x(0.58)} ${y(0.95)}`,
    `C ${x(0.25)} ${y(0.98)} ${x(0.07)} ${y(0.8)} ${x(0.09)} ${y(0.55)}`,
    `C ${x(0.08)} ${y(0.24)} ${x(0.24)} ${y(0.07)} ${x(0.48)} ${y(0.04)}`,
    'Z',
  ].join(' ');
};

/** MossEarShape — swift:653, in a local w x h box. */
const mossEarPath = (w: number, h: number): string =>
  `M 0 ${h} Q ${w * 0.16} 0 ${w} ${h * 0.78} Q ${w * 0.72} ${h} 0 ${h} Z`;

type BodyProps = {
  state: SessionState;
  time: number;
  bodySizePx: number;
};

const EmberBody: React.FC<BodyProps> = ({state, time, bodySizePx}) => {
  const rate = state === 'idle' ? 0.7 : 2.4;
  const amplitude = state === 'idle' ? 1.4 : 4;
  const tuftSway = Math.sin(time * rate) * amplitude;
  const counterSway = Math.sin(time * rate + 0.85) * amplitude;
  const tuftLift = normalizedSine(time * rate + 1.4) * 0.035;
  const centreStretch = 0.96 + normalizedSine(time * 1.8) * 0.04;

  // HStack(spacing: 0.01) of three capsules in a 0.46 x 0.25 frame.
  const tuftW = (0.46 - 0.02) / 3;
  const pitch = tuftW + 0.01;
  const tuftH = 0.25;
  const tuftBaseY = -0.39;

  const tuft = (index: -1 | 0 | 1) => {
    const cx = u(index * pitch);
    const extraY = index === 0 ? -0.055 - tuftLift : 0;
    const cy = u(tuftBaseY + extraY);
    const w = u(tuftW);
    const h = u(tuftH);
    const rotation = index === -1 ? -38 + tuftSway : index === 1 ? 38 - counterSway : 0;
    const scaleY = index === 0 ? centreStretch : 1;
    const bottom = cy + h / 2;
    return (
      <rect
        key={index}
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={Math.min(w, h) / 2}
        fill={color.ember}
        transform={
          `rotate(${rotation} ${cx} ${cy}) ` +
          `translate(0 ${bottom}) scale(1 ${scaleY}) translate(0 ${-bottom})`
        }
      />
    );
  };

  // EmberMotes — swift:395
  const mote = (phase: number, x: number, scale: number) => {
    const raw = positiveRemainder(time * 0.34 + phase, 1);
    const progress = 1 - Math.pow(1 - raw, 2);
    const opacity = Math.sin(raw * Math.PI) * 0.46;
    return (
      <circle
        key={phase}
        cx={u(x + Math.sin(time * 1.2 + phase) * 0.025)}
        cy={u(0.06 - progress * 0.54)}
        r={u(0.055 * scale) / 2}
        fill={color.folkPaper}
        fillOpacity={opacity}
      />
    );
  };

  return (
    <g opacity={state === 'failed' ? 0.64 : 1}>
      {bodySizePx >= 22 && state === 'working' ? (
        <g>
          {mote(0.12, -0.31, 1)}
          {mote(0.61, 0.32, 0.72)}
        </g>
      ) : null}

      {tuft(-1)}
      {tuft(0)}
      {tuft(1)}

      <path d={emberBodyPath()} fill={color.ember} />
      <ellipse
        cx={u(-0.5 + 0.2) + u(0.2) / 2}
        cy={u(-0.41 + 0.13) + u(0.12) / 2}
        rx={u(0.2) / 2}
        ry={u(0.12) / 2}
        fill={color.folkPaper}
        fillOpacity={0.18}
      />
    </g>
  );
};

const OrbitBody: React.FC<BodyProps> = ({state, time, bodySizePx}) => {
  const attention = needsAttention(state);
  const rate = state === 'idle' ? 0.65 : 2.1;
  const amplitude = state === 'idle' ? 1.2 : 5;
  const antennaSway = Math.sin(time * rate) * amplitude;
  const signalPulse = normalizedSine(time * 2.35 + 0.4);
  const podLift = Math.sin(time * 1.75) * 0.018;

  const bodyW = 0.84;
  const bodyH = 0.76;
  const headX = 0.035;
  const headY = -0.535;

  return (
    <g opacity={state === 'failed' ? 0.64 : 1}>
      {bodySizePx >= 22 && (state === 'working' || attention) ? (
        <circle
          cx={u(headX)}
          cy={u(headY)}
          r={(u(0.19) / 2) * (0.72 + signalPulse * 0.3)}
          fill="none"
          stroke={attention ? color.signalAmber : color.folkPaper}
          strokeOpacity={(attention ? 0.3 : 0.2) * (0.58 - signalPulse * 0.38)}
          strokeWidth={u(0.025)}
        />
      ) : null}

      {/* antenna, rotated about its bottom edge */}
      <rect
        x={u(-0.04)}
        y={u(-0.44 - 0.105)}
        width={u(0.08)}
        height={u(0.21)}
        rx={u(0.04)}
        fill={color.sky}
        fillOpacity={0.72}
        transform={`rotate(${antennaSway} 0 ${u(-0.44 + 0.105)})`}
      />

      <circle
        cx={u(headX)}
        cy={u(headY)}
        r={(u(0.105) / 2) * (0.96 + signalPulse * 0.08)}
        fill={attention ? color.signalAmber : color.folkPaper}
      />

      {/* pods — HStack(spacing: 0.68) in a 1.0 x 0.18 frame */}
      <circle cx={u(-0.42)} cy={u(podLift)} r={u(0.16) / 2} fill={color.sky} fillOpacity={0.58} />
      <circle cx={u(0.42)} cy={u(-podLift)} r={u(0.16) / 2} fill={color.sky} fillOpacity={0.58} />

      <rect
        x={u(-bodyW / 2)}
        y={u(-bodyH / 2)}
        width={u(bodyW)}
        height={u(bodyH)}
        rx={u(0.25)}
        fill={color.sky}
      />
      <rect
        x={u(-bodyW / 2 + 0.17 + Math.sin(time * 0.9) * 0.018)}
        y={u(-bodyH / 2 + 0.12)}
        width={u(0.3)}
        height={u(0.095)}
        rx={u(0.095) / 2}
        fill={color.folkPaper}
        fillOpacity={0.17}
      />
    </g>
  );
};

const MossBody: React.FC<BodyProps> = ({state, time}) => {
  const rate = state === 'idle' ? 0.75 : 2.6;
  const amplitude = state === 'idle' ? 1.5 : 5;
  const leftWiggle = Math.sin(time * rate) * amplitude;
  const rightWiggle = Math.sin(time * rate * 0.92 + 0.78) * amplitude * 0.82;
  const earStretch = 0.98 + normalizedSine(time * 1.45) * 0.035;

  const bodyW = 0.84;
  const bodyH = 0.76;

  // HStack(spacing: 0.36) of two ears in a 0.78 x 0.34 frame at y -0.32
  const earW = (0.78 - 0.36) / 2;
  const earH = 0.34;
  const earCX = (0.36 + earW) / 2;
  const earTop = u(-0.32 - earH / 2);
  const earBottom = u(-0.32 + earH / 2);

  return (
    <g opacity={state === 'failed' ? 0.64 : 1}>
      {/* left ear: stretch about bottom, rotate about bottom-trailing */}
      <g
        transform={
          `rotate(${-leftWiggle} ${u(-earCX + earW / 2)} ${earBottom}) ` +
          `translate(0 ${earBottom}) scale(1 ${earStretch}) translate(0 ${-earBottom})`
        }
      >
        <path
          d={mossEarPath(u(earW), u(earH))}
          transform={`translate(${u(-earCX - earW / 2)} ${earTop})`}
          fill={color.moss}
          fillOpacity={0.88}
        />
      </g>

      {/* right ear: mirrored, counter-stretched, rotate about bottom-leading */}
      <g
        transform={
          `rotate(${rightWiggle} ${u(earCX - earW / 2)} ${earBottom}) ` +
          `translate(0 ${earBottom}) scale(1 ${2 - earStretch}) translate(0 ${-earBottom})`
        }
      >
        <path
          d={mossEarPath(u(earW), u(earH))}
          transform={`translate(${u(earCX + earW / 2)} ${earTop}) scale(-1 1)`}
          fill={color.moss}
          fillOpacity={0.88}
        />
      </g>

      <rect
        x={u(-bodyW / 2)}
        y={u(-bodyH / 2)}
        width={u(bodyW)}
        height={u(bodyH)}
        rx={u(0.27)}
        fill={color.moss}
      />
      <rect
        x={u(-bodyW / 2 + 0.15)}
        y={u(-bodyH / 2 + 0.11)}
        width={u(0.27)}
        height={u(0.09)}
        rx={u(0.08)}
        fill={color.folkPaper}
        fillOpacity={0.17}
      />
    </g>
  );
};

// ---------------------------------------------------------------------------
// The Xyne cast — ProviderAvatarView.swift "Scenario folk" and "The Xyne cast"
// ---------------------------------------------------------------------------

/** A rounded highlight the Swift bodies share: Circle(paper 0.18) 0.2 x 0.12. */
const highlight = (x: number, y: number) => (
  <ellipse cx={u(x)} cy={u(y)} rx={u(0.2) / 2} ry={u(0.12) / 2} fill={color.folkPaper} fillOpacity={0.18} />
);

/** Pip — a coral speech bubble with a tail that flicks when it needs you. */
const MentionBody: React.FC<BodyProps> = ({state, time}) => {
  const attention = needsAttention(state);
  const flick = attention ? Math.sin(time * 6) * 4 : 0;
  const w = 0.9;
  const h = 0.8;
  const tail = 0.16;
  const bodyH = h - tail;
  const r = bodyH * 0.34;
  const left = -w / 2;
  const top = -h / 2 + 0.02;
  const bodyBottom = top + bodyH;
  const path = [
    `M ${u(left + r)} ${u(top)}`,
    `H ${u(left + w - r)}`,
    `Q ${u(left + w)} ${u(top)} ${u(left + w)} ${u(top + r)}`,
    `V ${u(bodyBottom - r)}`,
    `Q ${u(left + w)} ${u(bodyBottom)} ${u(left + w - r)} ${u(bodyBottom)}`,
    `H ${u(left + w * 0.4)}`,
    `L ${u(left + w * 0.12)} ${u(top + h)}`,
    `L ${u(left + w * 0.18)} ${u(bodyBottom)}`,
    `H ${u(left + r)}`,
    `Q ${u(left)} ${u(bodyBottom)} ${u(left)} ${u(bodyBottom - r)}`,
    `V ${u(top + r)}`,
    `Q ${u(left)} ${u(top)} ${u(left + r)} ${u(top)}`,
    'Z',
  ].join(' ');
  return (
    <g opacity={state === 'failed' ? 0.64 : 1}>
      <g transform={`rotate(${flick} ${u(left)} ${u(top + h)})`}>
        <path d={path} fill={color.coral} />
        {highlight(left + 0.28, top + 0.16)}
      </g>
    </g>
  );
};

/** Stub — a saffron ticket stub with side notches and a perforation; shivers when overdue. */
const TicketBody: React.FC<BodyProps> = ({state, time}) => {
  const shiver = state === 'failed' ? Math.sin(time * 14) * 1.5 : 0;
  const w = 0.94;
  const h = 0.72;
  const notch = 0.09;
  const r = h * 0.22;
  const left = -w / 2;
  const top = -h / 2 + 0.06;
  const midY = top + h / 2;
  const path = [
    `M ${u(left + r)} ${u(top)}`,
    `H ${u(left + w - r)}`,
    `Q ${u(left + w)} ${u(top)} ${u(left + w)} ${u(top + r)}`,
    `V ${u(midY - notch)}`,
    `A ${u(notch)} ${u(notch)} 0 0 0 ${u(left + w)} ${u(midY + notch)}`,
    `V ${u(top + h - r)}`,
    `Q ${u(left + w)} ${u(top + h)} ${u(left + w - r)} ${u(top + h)}`,
    `H ${u(left + r)}`,
    `Q ${u(left)} ${u(top + h)} ${u(left)} ${u(top + h - r)}`,
    `V ${u(midY + notch)}`,
    `A ${u(notch)} ${u(notch)} 0 0 0 ${u(left)} ${u(midY - notch)}`,
    `V ${u(top + r)}`,
    `Q ${u(left)} ${u(top)} ${u(left + r)} ${u(top)}`,
    'Z',
  ].join(' ');
  return (
    <g opacity={state === 'failed' ? 0.8 : 1} transform={`rotate(${shiver} 0 ${u(midY)})`}>
      <path d={path} fill={color.saffron} />
      {[0, 1, 2, 3].map((index) => (
        <circle
          key={index}
          cx={u(0.3)}
          cy={u(midY - 0.135 + index * 0.09)}
          r={u(0.035) / 2}
          fill={color.folkInk}
          fillOpacity={0.28}
        />
      ))}
    </g>
  );
};

/** Ring — a green round body wearing a handset that rings as the call gets close. */
const CallBody: React.FC<BodyProps> = ({state, time}) => {
  const attention = needsAttention(state);
  const ring = state === 'working' || attention ? Math.sin(time * 9) * (attention ? 7 : 3) : 0;
  const w = 0.8;
  const h = 0.4;
  const cupW = w * 0.3;
  const cupH = h * 0.7;
  const cupR = w * 0.1;
  const bridgeY = h * 0.5;
  return (
    <g opacity={state === 'failed' ? 0.64 : 1}>
      <g transform={`translate(${u(0.04)} ${u(-0.4)}) rotate(${-26 + ring})`}>
        <rect x={u(-w / 2)} y={u(-h / 2 + h * 0.3)} width={u(cupW)} height={u(cupH)} rx={u(cupR)} fill={color.callGreen} />
        <rect x={u(w / 2 - cupW)} y={u(-h / 2 + h * 0.3)} width={u(cupW)} height={u(cupH)} rx={u(cupR)} fill={color.callGreen} />
        <path
          d={`M ${u(-w / 2 + w * 0.15)} ${u(-h / 2 + bridgeY)} Q 0 ${u(-h / 2 - h * 0.45)} ${u(w / 2 - w * 0.15)} ${u(-h / 2 + bridgeY)}`}
          fill="none"
          stroke={color.callGreen}
          strokeWidth={u(h * 0.3)}
          strokeLinecap="round"
        />
      </g>
      <circle cx={0} cy={u(0.06)} r={u(0.78) / 2} fill={color.callGreen} />
      {highlight(-0.13, -0.2)}
    </g>
  );
};

/** Beam — the Architect: a squared blueprint body with a hard-hat brim. */
const ArchitectBody: React.FC<BodyProps> = ({state, time}) => {
  const lift = normalizedSine(time * (state === 'working' ? 2.0 : 0.8)) * 0.03;
  return (
    <g opacity={state === 'failed' ? 0.64 : 1}>
      <rect x={u(-0.46)} y={u(-0.36 - lift - 0.06)} width={u(0.92)} height={u(0.12)} rx={u(0.06)} fill={color.blueprint} />
      <rect x={u(-0.28)} y={u(-0.46 - lift - 0.09)} width={u(0.56)} height={u(0.18)} rx={u(0.09)} fill={color.blueprint} />
      <rect x={u(-0.41)} y={u(0.08 - 0.35)} width={u(0.82)} height={u(0.7)} rx={u(0.18)} fill={color.blueprint} />
      <rect x={u(-0.3)} y={u(0.18)} width={u(0.6)} height={u(0.015)} fill={color.folkPaper} fillOpacity={0.12} />
      <rect x={u(-0.3)} y={u(0.3)} width={u(0.6)} height={u(0.015)} fill={color.folkPaper} fillOpacity={0.12} />
    </g>
  );
};

/** Sage — Ask AI: a round violet body with an orbiting spark. */
const AskBody: React.FC<BodyProps> = ({state, time}) => {
  const angle = time * (state === 'working' ? 2.6 : 0.9);
  const still = state === 'completed' || state === 'failed';
  return (
    <g opacity={state === 'failed' ? 0.64 : 1}>
      <circle cx={0} cy={u(0.04)} r={u(0.8) / 2} fill={color.violet} />
      {highlight(-0.14, -0.22)}
      <circle
        cx={u(Math.cos(angle) * 0.46)}
        cy={u(-0.1 + Math.sin(angle) * 0.2)}
        r={u(0.11) / 2}
        fill={color.folkPaper}
        fillOpacity={still ? 0.4 : 0.95}
      />
    </g>
  );
};

/** Doc — every other Spaces agent: a teal shield that holds still while it works. */
const shieldPath = (w: number, h: number, cx: number, cy: number): string => {
  const r = w * 0.22;
  const left = cx - w / 2;
  const top = cy - h / 2;
  return [
    `M ${u(left + r)} ${u(top)}`,
    `H ${u(left + w - r)}`,
    `Q ${u(left + w)} ${u(top)} ${u(left + w)} ${u(top + r)}`,
    `V ${u(top + h / 2)}`,
    `Q ${u(left + w)} ${u(top + h * 0.92)} ${u(cx)} ${u(top + h)}`,
    `Q ${u(left)} ${u(top + h * 0.92)} ${u(left)} ${u(top + h / 2)}`,
    `V ${u(top + r)}`,
    `Q ${u(left)} ${u(top)} ${u(left + r)} ${u(top)}`,
    'Z',
  ].join(' ');
};

const BotBody: React.FC<BodyProps> = ({state}) => (
  <g opacity={state === 'failed' ? 0.64 : 1}>
    <path d={shieldPath(0.84, 0.86, 0, 0.02)} fill={color.teal} />
    <path d={shieldPath(0.66, 0.68, 0, 0.04)} fill="none" stroke={color.folkPaper} strokeOpacity={0.22} strokeWidth={u(0.03)} />
  </g>
);

// ---------------------------------------------------------------------------
// Public avatar
// ---------------------------------------------------------------------------

export type FolkProps = {
  provider: ProviderID;
  state: SessionState;
  /** Seconds on the same clock the Swift view reads. */
  time: number;
  /** Rendered edge length in px, matching ProviderAvatarView's `size`. */
  size: number;
  showsContainer?: boolean;
  /** 0 = settled, 1 = full anticipation pose after a state change. */
  reaction?: number;
};

export const Folk: React.FC<FolkProps> = ({
  provider,
  state,
  time,
  size,
  showsContainer = true,
  reaction = 0,
}) => {
  const bodyScale = showsContainer ? 0.74 : 0.94;
  const bodySizePx = size * bodyScale;
  const attention = needsAttention(state);

  // avatar() — swift:43
  const pulse = normalizedSine(time * motionRate(state));
  const bob = bobAmplitude(state) * bobMultiplier(provider) * Math.sin(time * motionRate(state));
  const stretch = 0.985 + pulse * 0.03;
  const lean = ambientLean(provider, time, state);

  // playReaction anticipation — swift:147
  const hoverTilt =
    provider === 'claude' ? -2.2
    : provider === 'codex' ? 2.2
    : provider === 'opencode' ? -1.4
    : provider === 'mention' ? -2.6
    : provider === 'ticket' ? 1.6
    : provider === 'call' ? -2.0
    : provider === 'architect' ? 1.2
    : provider === 'askai' ? 2.0
    : 0;
  let reactionScale = 1;
  let reactionOffset = 0;
  let reactionRotation = 0;
  if (reaction > 0) {
    const target = attention
      ? {scale: 0.965, offset: 0.8, rotation: -hoverTilt * 0.7}
      : state === 'completed'
        ? {scale: 0.97, offset: 1.1, rotation: hoverTilt * 0.55}
        : {scale: 0.985, offset: 0.45, rotation: -hoverTilt * 0.25};
    reactionScale = 1 + (target.scale - 1) * reaction;
    reactionOffset = target.offset * reaction;
    reactionRotation = target.rotation * reaction;
  }

  const {frameOffsetY} = geometry[provider];
  // Bob and reaction offsets are in points in the Swift source; convert to units.
  const offsetYUnits = ((bob + reactionOffset) / size) * U * bodyScale;

  const Body =
    provider === 'claude' ? EmberBody
    : provider === 'codex' ? OrbitBody
    : provider === 'opencode' ? MossBody
    : provider === 'mention' ? MentionBody
    : provider === 'ticket' ? TicketBody
    : provider === 'call' ? CallBody
    : provider === 'architect' ? ArchitectBody
    : provider === 'askai' ? AskBody
    : BotBody;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-U / 2} ${-U / 2} ${U} ${U}`}
      style={{display: 'block', overflow: 'visible'}}
    >
      {showsContainer ? (
        <g>
          <rect
            x={-U / 2}
            y={-U / 2}
            width={U}
            height={U}
            rx={u(0.31)}
            fill={providerColor(provider)}
            fillOpacity={0.105}
          />
          {size >= 28 ? (
            <rect
              x={-U / 2 + u(0.18)}
              y={-U / 2 + u(0.14)}
              width={u(0.24)}
              height={u(0.035)}
              rx={u(0.0175)}
              fill="#FFFFFF"
              fillOpacity={0.055}
            />
          ) : null}
          <rect
            x={-U / 2 + u(0.012)}
            y={-U / 2 + u(0.012)}
            width={U - u(0.024)}
            height={U - u(0.024)}
            rx={u(0.298)}
            fill="none"
            stroke={attention ? color.signalAmber : '#FFFFFF'}
            strokeOpacity={attention ? 0.18 + pulse * 0.14 : 0.07}
            strokeWidth={u(0.024)}
          />
        </g>
      ) : null}

      {/* groundShadow — swift:137 */}
      <rect
        x={-u(0.34 + pulse * 0.035) / 2}
        y={u(showsContainer ? 0.31 : 0.36) - u(0.055) / 2}
        width={u(0.34 + pulse * 0.035)}
        height={u(0.055)}
        rx={u(0.055) / 2}
        fill="#000000"
        fillOpacity={(showsContainer ? 0.22 : 0.14) * (state === 'failed' ? 0.3 : 0.72)}
      />

      <g transform={`scale(${bodyScale})`}>
        <g
          transform={
            `scale(${reactionScale}) ` +
            `translate(0 ${offsetYUnits / bodyScale}) ` +
            `rotate(${lean + reactionRotation} 0 ${frameOffsetY}) ` +
            `translate(0 ${STRETCH_ANCHOR_Y}) scale(${2 - stretch} ${stretch}) translate(0 ${-STRETCH_ANCHOR_Y})`
          }
        >
          <g transform={`translate(0 ${frameOffsetY})`}>
            <Body state={state} time={time} bodySizePx={bodySizePx} />
            <FolkFace
              provider={provider}
              state={state}
              time={time}
              bodySizePx={bodySizePx}
            />
          </g>
        </g>
      </g>
    </svg>
  );
};
