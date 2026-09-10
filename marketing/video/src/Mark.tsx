import React from 'react';
import {color} from './brand';

/**
 * The home mark — BrandIdentity.swift. A black notch on paper carrying the
 * coral Xyne x. Never gains eyes or scenario glyphs; the cast carries those.
 */
export const IslandMark: React.FC<{
  size?: number;
  pulse?: number;
  onPaper?: boolean;
}> = ({size = 28, pulse = 1, onPaper = false}) => {
  const s = (fraction: number) => fraction * size;
  const capsuleW = s(0.76);
  const capsuleH = s(0.36);
  const armW = s(0.3);
  const armH = Math.max(1.5, s(0.07));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      style={{display: 'block', flexShrink: 0}}
    >
      <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={s(0.23)} fill={color.folkPaper} />
      <rect
        x={-size / 2 + s(onPaper ? 0.012 : 0.004)}
        y={-size / 2 + s(onPaper ? 0.012 : 0.004)}
        width={size - s(onPaper ? 0.024 : 0.008)}
        height={size - s(onPaper ? 0.024 : 0.008)}
        rx={s(onPaper ? 0.222 : 0.226)}
        fill="none"
        stroke={onPaper ? color.folkInk : '#000000'}
        strokeOpacity={onPaper ? 1 : 0.1}
        strokeWidth={s(onPaper ? 0.024 : 0.008)}
      />
      <rect x={-capsuleW / 2} y={-capsuleH / 2} width={capsuleW} height={capsuleH} rx={capsuleH / 2} fill={color.folkInk} />
      <g opacity={0.55 + pulse * 0.45}>
        <rect x={-armW / 2} y={-armH / 2} width={armW} height={armH} rx={armH / 2} fill={color.coral} transform="rotate(40)" />
        <rect x={-armW / 2} y={-armH / 2} width={armW} height={armH} rx={armH / 2} fill={color.coral} transform="rotate(-40)" />
      </g>
    </svg>
  );
};
