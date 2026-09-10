/**
 * Turns a Spaces snapshot into the cards the notch shows.
 *
 * This is the only place that decides what something *means* — that a mention
 * needs you and a merged PR is just worth knowing. The app draws what it is
 * told, so getting the judgement right here is getting the product right.
 */
import type { Cast, CardPayload } from './island.ts';
import { linkFor, markChannelViewed, markRead, type Snapshot, type SpacesClientLike } from './spaces.ts';

export interface Card extends CardPayload {
  /** Held open for an answer, so Open and Done in the notch reach back here. */
  answerable: boolean;
  onOpen?: () => Promise<void>;
  onDismiss?: () => Promise<void>;
}

const short = (value: string, limit: number) => (value.length > limit ? `${value.slice(0, limit - 1)}…` : value);
const minutes = (ms: number) => Math.max(0, Math.round(ms / 60_000));
const clock = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** What each activity kind is called in the notch. */
const ACTIVITY_LABELS: Record<string, string> = {
  mentioned_user: 'Mentioned you',
  group_mention: 'Mentioned your group',
  replied_v2: 'Replied to you',
  added_v2: 'Added you to a thread',
  ticket_assigned: 'New ticket for you',
  ticket_status_v2: 'Ticket status changed',
  ticket_priority: 'Priority changed',
  ticket_pr_created: 'PR raised on your ticket',
  ticket_pr_merged: 'PR merged on your ticket',
  ticket_title: 'Ticket renamed',
  ticket_description: 'Ticket description changed',
  scheduled_call: 'Call scheduled',
  call_reminder: 'Call reminder',
  missed_call: 'Missed call',
};

/** Activities that are actually waiting on you. */
const NEEDS_YOU = new Set(['mentioned_user', 'group_mention', 'replied_v2', 'ticket_assigned', 'missed_call']);
/** Activities worth a glance and nothing more. */
const FYI = new Set([
  'added_v2', 'ticket_status_v2', 'ticket_priority', 'ticket_pr_created',
  'ticket_pr_merged', 'ticket_title', 'scheduled_call', 'call_reminder',
]);
/** How long an FYI stays before it is just noise. */
const FYI_LIFETIME_MS = 20 * 60_000;

export function cardsFrom(snapshot: Snapshot, baseUrl: string, sdk: SpacesClientLike): Card[] {
  const cards: Card[] = [];
  const castFor = (kind: string, who: string, actorId: string): Cast => {
    if (kind.startsWith('ticket')) return 'ticket';
    if (/call/.test(kind)) return 'call';
    if (snapshot.agentIds.has(actorId)) {
      if (/architect/i.test(who)) return 'architect';
      if (/ask ai|xyne ai/i.test(who)) return 'askai';
      return 'bot';
    }
    return 'mention';
  };

  for (const activity of snapshot.needsYou) {
    const needsYou = NEEDS_YOU.has(activity.kind);
    if (!needsYou && !FYI.has(activity.kind)) continue;
    if (!needsYou && Date.now() - activity.createdAt > FYI_LIFETIME_MS) continue;

    const who = snapshot.names[activity.actorId] ?? 'Someone';
    const label = ACTIVITY_LABELS[activity.kind] ?? activity.kind;
    const when = clock(activity.createdAt);
    const markHandled = async () => {
      await markRead(sdk, activity.id).catch(() => {});
    };

    cards.push({
      id: `activity:${activity.id}`,
      cast: castFor(activity.kind, who, activity.actorId),
      title: activity.kind.startsWith('ticket') && activity.text ? short(activity.text, 48) : who,
      activity: activity.text ? short(activity.text, 90) : `${label} · ${when}`,
      context: `/${activity.classification.toLowerCase()}`,
      link: linkFor(baseUrl, {
        channelId: activity.channelId,
        conversationId: activity.conversationId,
        messageId: activity.messageId,
        dm: !!activity.channelId && snapshot.dmChannelIds.has(activity.channelId),
      }),
      state: needsYou ? 'needsYou' : 'fyi',
      answerable: needsYou,
      prompt: needsYou
        ? {
            kind: 'question',
            title: `${label} · ${when}`,
            detail: activity.text ? short(activity.text, 160) : `${who} · ${label}`,
          }
        : undefined,
      onOpen: markHandled,
      onDismiss: markHandled,
    });
  }

  for (const message of snapshot.dms) {
    const who = snapshot.names[message.senderId] ?? 'Someone';
    const markViewed = async () => {
      await markChannelViewed(sdk, message.channelId).catch(() => {});
    };
    cards.push({
      id: `dm:${message.channelId}`,
      cast: 'mention',
      title: who,
      activity: short(message.text, 90),
      context: '/pending',
      link: linkFor(baseUrl, { channelId: message.channelId, dm: true }),
      state: 'needsYou',
      answerable: true,
      prompt: {
        kind: 'question',
        title: `${message.group ? 'Group message' : 'Direct message'} · ${clock(message.createdAt)}`,
        detail: short(message.text, 160),
      },
      onOpen: markViewed,
      onDismiss: markViewed,
    });
  }

  for (const thread of snapshot.agents) {
    const cast: Cast = /architect/i.test(thread.agentName)
      ? 'architect'
      : /ask ai|xyne ai/i.test(thread.agentName)
        ? 'askai'
        : 'bot';
    cards.push({
      id: `agent:${thread.conversationId}:${thread.agentUserId}`,
      cast,
      title: thread.agentName,
      activity: thread.replied ? 'Answered' : short(thread.prompt || 'Working on your request', 72),
      context: '/spaces',
      link: linkFor(baseUrl, {
        channelId: thread.channelId,
        conversationId: thread.conversationId,
        dm: !!thread.channelId && snapshot.dmChannelIds.has(thread.channelId),
      }),
      state: thread.replied ? 'done' : 'working',
      detail: thread.replied ? thread.reply : undefined,
      answerable: false,
    });
  }

  for (const call of snapshot.calls) {
    const untilStart = (call.startsAt ?? Date.now()) - Date.now();
    const inTheRoom = call.participantCount ? ` · ${call.participantCount} in the room` : '';
    const activity = call.active
      ? `Live now${inTheRoom}`
      : untilStart <= 60_000
        ? 'Starting now'
        : `Starts in ${minutes(untilStart)} min`;
    const imminent = call.active || untilStart <= 2 * 60_000;
    cards.push({
      id: `call:${call.id}`,
      cast: 'call',
      title: call.title,
      activity,
      context: '/call',
      link: linkFor(baseUrl, { callId: call.id }),
      state: imminent ? 'needsYou' : 'working',
      answerable: imminent,
      prompt: imminent
        ? { kind: 'question', title: call.active ? 'Live now' : 'Starting now', detail: `${call.title}${inTheRoom}` }
        : undefined,
    });
  }

  for (const ticket of snapshot.due) {
    const when = ticket.overdue
      ? `Overdue by ${minutes(Date.now() - ticket.eta)} min`
      : `Due ${clock(ticket.eta)}`;
    cards.push({
      id: `due:${ticket.id}`,
      cast: 'ticket',
      title: `${ticket.key} · ${short(ticket.title, 40)}`,
      activity: `${when} · ${ticket.priority.toLowerCase()} · ${ticket.stageName}`,
      context: `/${ticket.key}`,
      link: linkFor(baseUrl, { channelId: ticket.channelId, ticketId: ticket.id }),
      state: ticket.overdue ? 'overdue' : 'working',
      answerable: false,
    });
  }

  return cards;
}

/** What changed about a card, so an unchanged one is not resent every poll. */
export function signature(card: Card): string {
  return [card.state, card.title, card.activity, card.detail ?? '', card.prompt?.detail ?? ''].join(' ');
}
