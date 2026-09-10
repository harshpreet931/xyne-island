import React from 'react';

/**
 * SF Symbols are not available to a browser renderer, so the panel's glyphs are
 * redrawn here at matching optical weights. These are approximations of the
 * shipped icons, not the system symbols themselves.
 */

export const ArrowUpRight: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 12 12" style={{display: 'block'}}>
    <path
      d="M3.2 8.8 L8.8 3.2 M4.3 3.2 H8.8 V7.7"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Xmark: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 12 12" style={{display: 'block'}}>
    <path
      d="M3 3 L9 9 M9 3 L3 9"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </svg>
);

export const CheckCircle: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 14 14" style={{display: 'block'}}>
    <circle cx={7} cy={7} r={5.6} fill="none" stroke={color} strokeWidth={1.4} />
    <path
      d="M4.6 7.1 L6.3 8.8 L9.4 5.3"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const WarningTriangle: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 14 14" style={{display: 'block'}}>
    <path
      d="M7 1.6 L13.2 12.2 H0.8 Z"
      fill={color}
      strokeLinejoin="round"
      strokeWidth={1.4}
      stroke={color}
    />
    <path d="M7 5.2 V8.4" stroke="#0E0F11" strokeWidth={1.5} strokeLinecap="round" />
    <circle cx={7} cy={10.2} r={0.85} fill="#0E0F11" />
  </svg>
);

export const Sparkles: React.FC<{size: number; color: string}> = ({size, color}) => {
  const star = (cx: number, cy: number, r: number) =>
    `M ${cx} ${cy - r} Q ${cx + r * 0.22} ${cy - r * 0.22} ${cx + r} ${cy} ` +
    `Q ${cx + r * 0.22} ${cy + r * 0.22} ${cx} ${cy + r} ` +
    `Q ${cx - r * 0.22} ${cy + r * 0.22} ${cx - r} ${cy} ` +
    `Q ${cx - r * 0.22} ${cy - r * 0.22} ${cx} ${cy - r} Z`;

  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{display: 'block'}}>
      <path d={star(8.4, 5.4, 4.6)} fill={color} />
      <path d={star(3.3, 10.4, 2.6)} fill={color} />
    </svg>
  );
};

/** macOS arrow pointer. */
export const Pointer: React.FC<{size?: number}> = ({size = 26}) => (
  <svg
    width={size}
    height={size * 1.45}
    viewBox="0 0 20 29"
    style={{display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))'}}
  >
    <path
      d="M1.2 1.1 L1.2 21.6 L6.3 16.9 L9.6 24.9 L13.2 23.4 L10 15.6 L16.8 15.4 Z"
      fill="#FFFFFF"
      stroke="#0E0F11"
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  </svg>
);

/** questionmark.circle.fill — the mention drawer's glyph. */
export const QuestionCircle: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', flexShrink: 0}}>
    <circle cx="12" cy="12" r="11" fill={color} />
    <path
      d="M9.2 9.4c0-1.6 1.3-2.7 2.9-2.7 1.7 0 2.9 1.1 2.9 2.5 0 2.3-2.8 2.2-2.8 4.3"
      fill="none"
      stroke="#0E0F11"
      strokeWidth="2.1"
      strokeLinecap="round"
    />
    <circle cx="12.2" cy="17.2" r="1.3" fill="#0E0F11" />
  </svg>
);
