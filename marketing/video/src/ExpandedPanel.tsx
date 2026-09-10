import React from 'react';
import {
  ProviderID,
  SessionState,
  color,
  font,
  providerColor,
  stateColor,
  stateLabel,
} from './brand';
import {Folk} from './Folk';
import {ThinkingOrb} from './ThinkingOrb';
import {IslandMark} from './Mark';
import {ArrowUpRight, CheckCircle, QuestionCircle, Sparkles, WarningTriangle, Xmark} from './Icons';

/** NotchLayout.expandedSize */
export const PANEL_WIDTH = 548;
export const PANEL_HEIGHT = 382;

export type CardModel = {
  key: string;
  provider: ProviderID;
  state: SessionState;
  title: string;
  activity: string;
  elapsed: string;
  phase: number;
  featured?: boolean;
  reaction?: number;
  interaction?: {title: string; detail: string; kind?: 'approval' | 'question'};
  finalResponse?: string;
  /** 0-1 entry weight, used to slide a card in. */
  entry?: number;
  /** 0-1 press weight on the primary action. */
  allowPress?: number;
  /** 0-1 open weight for the interaction drawer, so it collapses on Allow. */
  detailWeight?: number;
  /** 0-1 open weight for the final-response drawer. */
  responseWeight?: number;
  /** 0-1 word-by-word reveal progress for the final response. */
  responseReveal?: number;
};

/**
 * Measured heights of the two detail drawers at their natural size.
 *   interaction: 11 pad + 1 rule + 8 + 28 request + 10 + 30 buttons
 *   response:    12 pad + 1 rule + 8 + 10 label + 8 + 15.2 single text line
 */
const INTERACTION_HEIGHT = 90;
const RESPONSE_HEIGHT = 70;

const StatusPill: React.FC<{state: SessionState; provider: ProviderID}> = ({state, provider}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 6px',
      borderRadius: 999,
      background: `color-mix(in srgb, ${stateColor(state)} 9%, transparent)`,
      color: stateColor(state),
    }}
  >
    <ThinkingOrb state={state} time={1.1} size={10} />
    <span
      style={{
        fontFamily: font.mono,
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: 0.2,
      }}
    >
      {stateLabel(state, provider)}
    </span>
  </div>
);

const ActionButton: React.FC<{
  label: string;
  role: 'primary' | 'secondary';
  press?: number;
}> = ({label, role, press = 0}) => {
  const primary = role === 'primary';
  const fill = primary
    ? `rgba(255,255,255,${0.92 - press * 0.14})`
    : `rgba(255,255,255,${0.07 + press * 0.04})`;
  return (
    <div
      style={{
        height: 30,
        padding: '0 13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
        background: fill,
        color: primary ? '#000000' : 'rgba(255,255,255,0.66)',
        fontFamily: font.rounded,
        fontSize: 10,
        fontWeight: 600,
        transform: `scale(${1 - press * 0.04})`,
      }}
    >
      {label}
    </div>
  );
};

export const SessionCard: React.FC<{card: CardModel; time: number}> = ({card, time}) => {
  const hasDetail = Boolean(card.interaction || card.finalResponse);
  const tint = card.featured ? 0.045 : 0;
  const isTerminal = card.state === 'completed' || card.state === 'failed';

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        background: `rgba(255,255,255,${hasDetail ? 0.072 : 0.055})`,
        boxShadow: card.featured
          ? `inset 0 0 0 1px color-mix(in srgb, ${providerColor(card.provider)} 17%, transparent)`
          : undefined,
        overflow: 'hidden',
      }}
    >
      {tint > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `color-mix(in srgb, ${providerColor(card.provider)} ${tint * 100}%, transparent)`,
          }}
        />
      ) : null}

      <div style={{position: 'relative'}}>
        <div
          style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 10,
            paddingRight: isTerminal ? 4 : 10,
          }}
        >
          <Folk
            provider={card.provider}
            state={card.state}
            time={time + card.phase}
            size={34}
            reaction={card.reaction ?? 0}
          />

          <div style={{display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
              <span
                style={{
                  fontFamily: font.rounded,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.92)',
                  whiteSpace: 'nowrap',
                }}
              >
                {card.title}
              </span>
              <StatusPill state={card.state} provider={card.provider} />
            </div>
            <span
              style={{
                fontFamily: font.rounded,
                fontSize: 10.5,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.46)',
                whiteSpace: 'nowrap',
              }}
            >
              {card.activity}
            </span>
          </div>

          <div style={{flexGrow: 1, minWidth: 8}} />

          <span
            style={{
              fontFamily: font.mono,
              fontSize: 10,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.34)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {card.elapsed}
          </span>
          <ArrowUpRight size={11} color="rgba(255,255,255,0.28)" />

          {isTerminal ? (
            <div
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Xmark size={10} color="rgba(255,255,255,0.26)" />
            </div>
          ) : null}
        </div>

        {card.interaction ? (
          <div
            style={{
              padding: '0 11px 11px',
              height: INTERACTION_HEIGHT * (card.detailWeight ?? 1),
              opacity: card.detailWeight ?? 1,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <div style={{height: 1, background: 'rgba(255,255,255,0.07)'}} />
            <div style={{height: 10}} />
            <div style={{display: 'flex', alignItems: 'flex-start', gap: 9}}>
              <div style={{paddingTop: 1}}>
                {card.interaction.kind === 'question' ? (
                  <QuestionCircle size={12} color={color.signalAmber} />
                ) : (
                  <WarningTriangle size={12} color={color.signalAmber} />
                )}
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 3}}>
                <span
                  style={{
                    fontFamily: font.rounded,
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.86)',
                  }}
                >
                  {card.interaction.title}
                </span>
                <span
                  style={{
                    fontFamily: font.mono,
                    fontSize: 10,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.42)',
                  }}
                >
                  {card.interaction.detail}
                </span>
              </div>
            </div>
            <div style={{height: 10}} />
            <div style={{display: 'flex', gap: 8}}>
              <ActionButton label={card.interaction.kind === 'question' ? 'Done' : 'Reject'} role="secondary" />
              <ActionButton
                label={card.interaction.kind === 'question' ? 'Open' : 'Approve'}
                role="primary"
                press={card.allowPress ?? 0}
              />
            </div>
          </div>
        ) : null}

        {card.finalResponse ? (
          <div
            style={{
              padding: '0 11px 12px',
              height: RESPONSE_HEIGHT * (card.responseWeight ?? 1),
              opacity: card.responseWeight ?? 1,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <div style={{height: 1, background: 'rgba(255,255,255,0.07)'}} />
            <div style={{height: 8}} />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: `color-mix(in srgb, ${providerColor(card.provider)} 92%, transparent)`,
              }}
            >
              <Sparkles size={10} color={providerColor(card.provider)} />
              <span
                style={{
                  fontFamily: font.mono,
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              >
                FINAL RESPONSE
              </span>
            </div>
            <div style={{height: 8}} />
            <span
              style={{
                display: 'block',
                fontFamily: font.rounded,
                fontSize: 10.5,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.72)',
                lineHeight: 1.45,
              }}
            >
              {/* Agents stream their answer, so the reveal is word by word. */}
              {card.finalResponse.split(' ').map((word, index, words) => {
                const progress = (card.responseReveal ?? 1) * words.length;
                const weight = Math.max(0, Math.min(1, progress - index));
                return (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      opacity: weight,
                      transform: `translateY(${(1 - weight) * 3}px)`,
                      marginRight: '0.28em',
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/**
 * The expanded surface — NotchRootView.swift:123. Header, hairline, cards.
 */
export const ExpandedPanel: React.FC<{
  cards: CardModel[];
  time: number;
  attentionCount: number;
  /** 0-1 presence weight so the pill grows in and shrinks away. */
  attentionWeight?: number;
  sessionSummary: string;
  showsClearButton: boolean;
  /** The app's panel is fixed at PANEL_HEIGHT and scrolls; the film may grow it so every card stays in frame. */
  height?: number;
}> = ({
  cards,
  time,
  attentionCount,
  attentionWeight = 1,
  sessionSummary,
  showsClearButton,
  height = PANEL_HEIGHT,
}) => (
  <div
    style={{
      width: PANEL_WIDTH,
      height,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        height: 54,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 14,
        paddingRight: 8,
        flexShrink: 0,
      }}
    >
      <IslandMark size={28} />

      <div style={{display: 'flex', flexDirection: 'column', gap: 1}}>
        <span
          style={{
            fontFamily: font.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.7,
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          XYNE ISLAND
        </span>
        <span
          style={{
            fontFamily: font.rounded,
            fontSize: 10,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.42)',
          }}
        >
          {sessionSummary}
        </span>
      </div>

      <div style={{flexGrow: 1}} />

      {attentionWeight > 0.01 ? (
        <div
          style={{
            padding: '5px 8px',
            borderRadius: 999,
            background: 'rgba(255,184,71,0.11)',
            color: color.signalAmber,
            fontFamily: font.mono,
            fontSize: 9,
            fontWeight: 700,
            opacity: attentionWeight,
            transform: `scale(${0.86 + attentionWeight * 0.14})`,
          }}
        >
          {Math.max(attentionCount, 1)} NEEDS YOU
        </div>
      ) : null}

      {showsClearButton ? (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle size={12} color="rgba(255,255,255,0.42)" />
        </div>
      ) : null}

      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Xmark size={11} color="rgba(255,255,255,0.5)" />
      </div>
    </div>

    <div style={{height: 1, background: 'rgba(255,255,255,0.075)', flexShrink: 0}} />

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '10px 12px',
      }}
    >
      {cards.map((card) => {
        const entry = card.entry ?? 1;
        return (
          <div
            key={card.key}
            style={{
              opacity: entry,
              transform:
                `translateY(${(1 - entry) * -14}px) ` +
                `scale(${0.965 + entry * 0.035})`,
              transformOrigin: 'top center',
            }}
          >
            <SessionCard card={card} time={time} />
          </div>
        );
      })}
    </div>
  </div>
);
