import React from 'react';
import {SessionState, orbColor, orbVisualState, sampleOrb} from './brand';

/**
 * SVG port of ThinkingStatusOrb.swift. Dots are drawn back-to-front by depth,
 * exactly as the SwiftUI Canvas does.
 */
export const ThinkingOrb: React.FC<{
  state: SessionState;
  time: number;
  size: number;
  /** Cross-fade helper: blend the previous state's colour into this one. */
  colorOverride?: string;
  opacity?: number;
}> = ({state, time, size, colorOverride, opacity = 1}) => {
  const dots = [...sampleOrb(state, time)].sort((a, b) => a.depth - b.depth);
  const fill = colorOverride ?? orbColor(orbVisualState(state));

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1 1"
      style={{display: 'block', opacity}}
    >
      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={Math.max(0.48 / size, dot.radius)}
          fill={fill}
          fillOpacity={dot.opacity}
        />
      ))}
    </svg>
  );
};
