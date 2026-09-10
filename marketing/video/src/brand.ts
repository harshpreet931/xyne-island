/**
 * Design tokens and motion math ported verbatim from the Xyne Island app so the
 * launch video matches shipped behaviour instead of approximating it.
 *
 * Sources:
 *   docs/brand.md                              — color tokens
 *   Sources/XyneIslandApp/UI/Components.swift   — resolved SwiftUI colors
 *   Sources/XyneIslandApp/UI/ThinkingStatusOrb.swift — orb geometry
 *   Sources/XyneIslandApp/UI/CastAvatarView.swift — cast motion
 */

export const color = {
  folkInk: '#0E0F11',
  night: '#08090A',
  folkPaper: '#F2EDDE',
  quietPaper: '#F7F3E8',
  ember: '#F27945',
  sky: '#61C7F5',
  moss: '#A3E073',
  // The Xyne cast — Components.swift folkCoral … folkTeal
  coral: '#FF4F4F',
  saffron: '#FAB040',
  callGreen: '#45D98F',
  blueprint: '#5C9EFF',
  violet: '#A98FFF',
  teal: '#2ECCB3',
  signalGreen: '#6EE89C',
  signalAmber: '#FFB847',
} as const;

export const font = {
  mono: '"SF Mono", SFMono-Regular, Menlo, monospace',
  sans: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
  rounded:
    'ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
} as const;

/** AgentSessionCard.swift:241 */
export const stateColor = (state: SessionState): string => {
  switch (state) {
    case 'working':
      return color.signalGreen;
    case 'needsApproval':
    case 'needsAnswer':
      return color.signalAmber;
    case 'completed':
      return 'rgba(255,255,255,0.46)';
    case 'failed':
      return 'rgba(255,69,58,0.88)';
    case 'idle':
      return 'rgba(255,255,255,0.38)';
  }
};

/** AgentSessionCard.swift — label(for:) */
export const stateLabel = (state: SessionState, provider?: ProviderID): string => {
  if (state === 'failed' && provider === 'ticket') return 'OVERDUE';
  if (state === 'working' && provider === 'call') return 'SOON';
  switch (state) {
    case 'working':
      return 'LIVE';
    case 'needsApproval':
      return 'APPROVAL';
    case 'needsAnswer':
      return 'NEEDS YOU';
    case 'completed':
      return 'DONE';
    case 'failed':
      return 'FAILED';
    case 'idle':
      return 'FYI';
  }
};

export type SessionState =
  | 'idle'
  | 'working'
  | 'needsApproval'
  | 'needsAnswer'
  | 'completed'
  | 'failed';

export type ProviderID =
  | 'claude'
  | 'codex'
  | 'opencode'
  | 'mention'
  | 'ticket'
  | 'call'
  | 'architect'
  | 'askai'
  | 'bot';

export const needsAttention = (state: SessionState): boolean =>
  state === 'needsApproval' || state === 'needsAnswer';

/** ProviderAvatarView.swift:694 */
export const normalizedSine = (value: number): number => (Math.sin(value) + 1) * 0.5;

/** ProviderAvatarView.swift:698 */
export const positiveRemainder = (value: number, modulus: number): number => {
  const remainder = value % modulus;
  return remainder >= 0 ? remainder : remainder + modulus;
};

/** ProviderAvatarView.swift:723 */
export const motionRate = (state: SessionState): number => {
  switch (state) {
    case 'needsApproval':
    case 'needsAnswer':
      return 3.1;
    case 'working':
      return 2.2;
    case 'idle':
      return 1.15;
    default:
      return 0;
  }
};

/** ProviderAvatarView.swift:732 */
export const bobAmplitude = (state: SessionState): number => {
  switch (state) {
    case 'needsApproval':
    case 'needsAnswer':
      return 0.7;
    case 'working':
      return 0.45;
    case 'idle':
      return 0.18;
    default:
      return 0;
  }
};

/** ProviderAvatarView.swift:759 */
export const bobMultiplier = (provider: ProviderID): number => {
  switch (provider) {
    case 'claude':
      return 1.08;
    case 'codex':
      return 0.72;
    case 'opencode':
      return 0.88;
    case 'mention':
      return 1.15;
    case 'ticket':
      return 0.55;
    case 'call':
      return 1.3;
    case 'architect':
      return 0.6;
    case 'askai':
      return 0.95;
    case 'bot':
      return 0.8;
  }
};

/** ProviderAvatarView.swift:767 */
export const ambientLean = (
  provider: ProviderID,
  time: number,
  state: SessionState,
): number => {
  if (state !== 'working' && state !== 'idle') return 0;
  const quiet = state === 'idle' ? 0.38 : 1;
  switch (provider) {
    case 'claude':
      return Math.sin(time * 0.72 + 0.4) * 0.85 * quiet;
    case 'codex':
      return Math.sin(time * 0.54 + 1.7) * 0.28 * quiet;
    case 'opencode':
      return Math.sin(time * 0.64 + 2.6) * 0.58 * quiet;
    case 'mention':
      return Math.sin(time * 0.8 + 0.9) * 1.1 * quiet;
    case 'ticket':
      return Math.sin(time * 0.45 + 1.9) * 0.3 * quiet;
    case 'call':
      return Math.sin(time * 1.1 + 0.2) * (state === 'working' ? 2.2 : 0.8) * quiet;
    case 'architect':
      return Math.sin(time * 0.5 + 2.1) * 0.22 * quiet;
    case 'askai':
      return Math.sin(time * 0.7 + 1.3) * 0.7 * quiet;
    case 'bot':
      return Math.sin(time * 0.6 + 3.0) * 0.4 * quiet;
  }
};

export const providerColor = (provider: ProviderID): string => {
  switch (provider) {
    case 'claude':
      return color.ember;
    case 'codex':
      return color.sky;
    case 'opencode':
      return color.moss;
    case 'mention':
      return color.coral;
    case 'ticket':
      return color.saffron;
    case 'call':
      return color.callGreen;
    case 'architect':
      return color.blueprint;
    case 'askai':
      return color.violet;
    case 'bot':
      return color.teal;
  }
};

export const folkName = (provider: ProviderID): string => {
  switch (provider) {
    case 'claude':
      return 'Ember';
    case 'codex':
      return 'Orbit';
    case 'opencode':
      return 'Moss';
    case 'mention':
      return 'Pip';
    case 'ticket':
      return 'Stub';
    case 'call':
      return 'Ring';
    case 'architect':
      return 'Beam';
    case 'askai':
      return 'Sage';
    case 'bot':
      return 'Doc';
  }
};

/** Personality phase offsets — ProviderAvatarView.swift:234, 315, 377 */
export const personalityOffset = (provider: ProviderID): number => {
  switch (provider) {
    case 'claude':
      return 0.35;
    case 'codex':
      return 1.65;
    case 'opencode':
      return 2.55;
    case 'mention':
      return 0.2;
    case 'ticket':
      return 1.1;
    case 'call':
      return 2.0;
    case 'architect':
      return 0.9;
    case 'askai':
      return 1.6;
    case 'bot':
      return 2.4;
  }
};

export const cheekBase = (provider: ProviderID): number => {
  switch (provider) {
    case 'claude':
      return 0.16;
    case 'codex':
      return 0.12;
    case 'opencode':
      return 0.42;
    case 'mention':
      return 0.2;
    case 'ticket':
      return 0.12;
    case 'call':
      return 0.14;
    case 'architect':
      return 0.1;
    case 'askai':
      return 0.14;
    case 'bot':
      return 0.08;
  }
};

// ---------------------------------------------------------------------------
// Thinking orb — ThinkingStatusOrb.swift:168
// ---------------------------------------------------------------------------

export type OrbDot = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  depth: number;
};

export type OrbVisualState = 'quiet' | 'thinking' | 'attention' | 'settled' | 'failed';

export const orbVisualState = (state: SessionState): OrbVisualState => {
  switch (state) {
    case 'idle':
      return 'quiet';
    case 'working':
      return 'thinking';
    case 'needsApproval':
    case 'needsAnswer':
      return 'attention';
    case 'completed':
      return 'settled';
    case 'failed':
      return 'failed';
  }
};

/** ThinkingStatusOrb.swift:129 */
export const orbColor = (visual: OrbVisualState): string => {
  switch (visual) {
    case 'thinking':
      return color.signalGreen;
    case 'attention':
      return color.signalAmber;
    case 'failed':
      return 'rgba(255,69,58,0.88)';
    case 'settled':
      return 'rgba(255,255,255,0.52)';
    case 'quiet':
      return 'rgba(255,255,255,0.56)';
  }
};

const orbit = (options: {
  count: number;
  time: number;
  speed: number;
  horizontalRadius: number;
  verticalRadius: number;
  baseRadius: number;
  depthRadius: number;
  baseOpacity: number;
  depthOpacity: number;
}): OrbDot[] =>
  Array.from({length: options.count}, (_, index) => {
    const angle =
      options.time * options.speed + (index * 2 * Math.PI) / options.count;
    const sine = Math.sin(angle);
    const depth = (sine + 1) * 0.5;
    return {
      x: 0.5 + Math.cos(angle) * options.horizontalRadius,
      y: 0.5 + sine * options.verticalRadius,
      radius: options.baseRadius + depth * options.depthRadius,
      opacity: options.baseOpacity + depth * options.depthOpacity,
      depth,
    };
  });

const centerDot = (radius: number, opacity: number): OrbDot => ({
  x: 0.5,
  y: 0.5,
  radius,
  opacity,
  depth: 0.5,
});

/** ThinkingStatusOrb.swift:171 — sample() */
export const sampleOrb = (state: SessionState, time: number): OrbDot[] => {
  const visual = orbVisualState(state);

  switch (visual) {
    case 'quiet':
      return [
        ...orbit({
          count: 5,
          time,
          speed: 0.34,
          horizontalRadius: 0.24,
          verticalRadius: 0.105,
          baseRadius: 0.052,
          depthRadius: 0.018,
          baseOpacity: 0.28,
          depthOpacity: 0.42,
        }),
        centerDot(0.07, 0.66),
      ];

    case 'thinking': {
      const centerDrift = Math.sin(time * 0.72) * 0.018;
      return [
        ...orbit({
          count: 7,
          time,
          speed: 0.96,
          horizontalRadius: 0.31,
          verticalRadius: 0.17,
          baseRadius: 0.054,
          depthRadius: 0.03,
          baseOpacity: 0.26,
          depthOpacity: 0.62,
        }),
        {x: 0.5 + centerDrift, y: 0.5, radius: 0.09, opacity: 0.92, depth: 0.54},
      ];
    }

    case 'attention': {
      const anticipation = 1 + Math.sin(time * 2.15) * 0.035;
      return [
        ...orbit({
          count: 6,
          time,
          speed: 1.32,
          horizontalRadius: 0.27 * anticipation,
          verticalRadius: 0.23 * anticipation,
          baseRadius: 0.058,
          depthRadius: 0.022,
          baseOpacity: 0.34,
          depthOpacity: 0.54,
        }),
        centerDot(0.092 * anticipation, 0.94),
      ];
    }

    case 'settled':
      return [
        {x: 0.25, y: 0.48, radius: 0.052, opacity: 0.34, depth: 0.1},
        {x: 0.36, y: 0.58, radius: 0.062, opacity: 0.48, depth: 0.2},
        {x: 0.48, y: 0.68, radius: 0.075, opacity: 0.74, depth: 0.4},
        {x: 0.62, y: 0.5, radius: 0.075, opacity: 0.84, depth: 0.6},
        {x: 0.76, y: 0.31, radius: 0.082, opacity: 0.96, depth: 0.8},
      ];

    case 'failed':
      return [
        {x: 0.24, y: 0.43, radius: 0.052, opacity: 0.24, depth: 0.1},
        {x: 0.37, y: 0.5, radius: 0.064, opacity: 0.34, depth: 0.2},
        {x: 0.5, y: 0.58, radius: 0.074, opacity: 0.52, depth: 0.4},
        {x: 0.64, y: 0.63, radius: 0.062, opacity: 0.34, depth: 0.2},
        {x: 0.77, y: 0.67, radius: 0.05, opacity: 0.22, depth: 0.1},
      ];
  }
};
