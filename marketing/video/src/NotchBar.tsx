import React from 'react';
import {ProviderID, SessionState, color, font} from './brand';
import {Folk} from './Folk';
import {ThinkingOrb} from './ThinkingOrb';

export type Session = {
  provider: ProviderID;
  state: SessionState;
  /** Per-card clock offset so the cast does not move in lockstep. */
  phase: number;
  /** 0-1 anticipation weight from a recent state change. */
  reaction?: number;
};

/**
 * The collapsed notch surface: hardware notch geometry with Xyne Island's
 * summary orb, one status line, and the cast on the right.
 */
export const NotchBar: React.FC<{
  /** Notch width in px, animated by the caller. */
  width: number;
  height: number;
  /** 0 while the notch is dormant, 1 once Xyne Island owns the surface. */
  contentOpacity: number;
  sessions: Session[];
  time: number;
  /** Stacked label layers, cross-faded by the caller. */
  labels: {text: string; opacity: number}[];
  orbLayers: {state: SessionState; opacity: number}[];
  orbSize?: number;
  avatarSize?: number;
}> = ({
  width,
  height,
  contentOpacity,
  sessions,
  time,
  labels,
  orbLayers,
  orbSize = 26,
  avatarSize = 32,
}) => {
  const bottomRadius = Math.min(height * 0.32, 15);

  // Square top corners (flush with the display edge), rounded bottom corners.
  const path = [
    `M 0 0`,
    `H ${width}`,
    `V ${height - bottomRadius}`,
    `A ${bottomRadius} ${bottomRadius} 0 0 1 ${width - bottomRadius} ${height}`,
    `H ${bottomRadius}`,
    `A ${bottomRadius} ${bottomRadius} 0 0 1 0 ${height - bottomRadius}`,
    'Z',
  ].join(' ');

  return (
    <div style={{position: 'relative', width, height}}>
      <svg
        width={width}
        height={height}
        style={{position: 'absolute', inset: 0, display: 'block'}}
      >
        <path d={path} fill="#000000" />
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 22,
          paddingRight: 18,
          opacity: contentOpacity,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: orbSize,
            height: orbSize,
            flexShrink: 0,
          }}
        >
          {orbLayers.map((layer, index) => (
            <div key={index} style={{position: 'absolute', inset: 0}}>
              <ThinkingOrb
                state={layer.state}
                time={time}
                size={orbSize}
                opacity={layer.opacity}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'relative',
            marginLeft: 13,
            height: 22,
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          {labels.map((label, index) => (
            <span
              key={index}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                lineHeight: '22px',
                whiteSpace: 'nowrap',
                fontFamily: font.sans,
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: 0.1,
                color: color.quietPaper,
                opacity: label.opacity,
              }}
            >
              {label.text}
            </span>
          ))}
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0}}>
          {sessions.map((session) => (
            <Folk
              key={session.provider}
              provider={session.provider}
              state={session.state}
              time={time + session.phase}
              size={avatarSize}
              reaction={session.reaction ?? 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
