import React from 'react';
import {ProviderID} from './brand';
import {Folk} from './Folk';

/**
 * The folkline — brand.md's signature composition: a thin, quiet baseline with
 * the cast gathered on it. Used once per high-visibility composition, so this
 * belongs on the end card and nowhere else in the film.
 */
export const Folkline: React.FC<{
  time: number;
  size?: number;
  width?: number;
  /** Per-folk 0-1 arrival weights so the cast gathers rather than appearing. */
  weights?: number[];
}> = ({time, size = 76, width = 460, weights = [1, 1, 1, 1, 1, 1]}) => {
  const cast: {provider: ProviderID; phase: number}[] = [
    {provider: 'mention', phase: 0.7},
    {provider: 'ticket', phase: 2.2},
    {provider: 'call', phase: 3.6},
    {provider: 'architect', phase: 1.3},
    {provider: 'askai', phase: 2.9},
    {provider: 'bot', phase: 4.4},
  ];

  return (
    <div style={{position: 'relative', width, height: size + 18}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 16,
          height: 1,
          background:
            'linear-gradient(to right, transparent, rgba(242,237,222,0.24) 22%, rgba(242,237,222,0.24) 78%, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 12,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 18,
        }}
      >
        {cast.map((member, index) => {
          const weight = weights[index] ?? 1;
          return (
            <div
              key={member.provider}
              style={{
                opacity: weight,
                transform: `translateY(${(1 - weight) * 16}px) scale(${0.9 + weight * 0.1})`,
              }}
            >
              <Folk
                provider={member.provider}
                state="idle"
                time={time + member.phase}
                size={size}
                showsContainer={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
