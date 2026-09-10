/**
 * Reads the slices of Xyne Spaces the island cares about. Every reader is
 * guarded: one failing endpoint degrades one card, never the whole notch.
 */
import { createClient, type SpacesClient } from '@xyne/spaces-sdk';

/** The SDK client, re-exported so callers need not depend on the SDK directly. */
export type SpacesClientLike = SpacesClient;
import type { Credentials } from './token.ts';

export function client(credentials: Credentials): SpacesClient {
  return createClient({ baseUrl: credentials.baseUrl, apiKey: credentials.token, timeout: 30_000 });
}

export interface Me { id: string; name: string; workspaceId: string }

export interface NeedsYou {
  id: string;            // activity id
  kind: string;          // mentioned_user | replied_v2 | ticket_assigned | ...
  classification: string;
  actorId: string;
  conversationId: string | null;
  channelId: string | null;
  ticketId: string | null;
  messageId: string | null;
  createdAt: number;
  /** The message text, when the activity points at one. */
  text?: string;
}

export interface AgentThread {
  conversationId: string;
  channelId: string | null;
  agentUserId: string;
  agentName: string;
  askedAt: number;
  prompt: string;
  replied: boolean;
  reply?: string;
  repliedAt?: number;
}

export interface DirectMessage {
  channelId: string;
  conversationId: string | null;
  messageId: string;
  senderId: string;
  text: string;
  createdAt: number;
  group: boolean;
}

export interface DueTicket { id: string; key: string; title: string; priority: string; stageName: string; eta: number; channelId: string; conversationId: string; overdue: boolean }
export interface UpcomingCall { id: string; title: string; startsAt: number | null; status: string; roomLink: string | null; channelId: string; participantCount: number | null; active: boolean }

const safe = async <T>(label: string, fn: () => Promise<T>, fallback: T, warnings: string[]): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    warnings.push(`${label}: ${(e as Error).message}`);
    return fallback;
  }
};

export interface Snapshot {
  me: Me;
  needsYou: NeedsYou[];
  dms: DirectMessage[];
  /** User ids that belong to agents and app users rather than people. */
  agentIds: Set<string>;
  /** Channels that are DMs or group DMs, which live under /chat/dm. */
  dmChannelIds: Set<string>;
  agents: AgentThread[];
  due: DueTicket[];
  calls: UpcomingCall[];
  names: Record<string, string>;
  warnings: string[];
  at: number;
}

const APP_EMAIL = /@app\.xyne\.ai$/i;
const MENTION = /data-user-id="([^"]+)"[^>]*data-username="([^"]+)"[^>]*data-user-email="([^"]+)"/g;
const strip = (html: string | null | undefined) => (html ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

export async function snapshot(sdk: SpacesClient, prev?: Snapshot): Promise<Snapshot> {
  const warnings: string[] = [];
  const meRaw = await sdk.users.me();
  const me: Me = { id: meRaw.id, name: meRaw.displayName || meRaw.name, workspaceId: meRaw.workspaceId };

  const [unread, missed] = await Promise.all([
    safe('unread activities', () => sdk.activities.listUnread(), [], warnings),
    safe('missed calls', () => sdk.activities.listMissedCalls(), [], warnings),
  ]);
  const dayAgo = Date.now() - 24 * 3_600_000;
  const needsYou: NeedsYou[] = [...unread, ...missed.map((m) => ({ ...m, actorAction: 'missed_call' }))]
    .filter((a) => a.actorId !== me.id && a.createdAt >= dayAgo)
    .map((a) => ({ id: a.id, kind: a.actorAction, classification: a.classification, actorId: a.actorId, conversationId: a.conversationId, channelId: a.channelId, ticketId: a.ticketId, messageId: a.messageId, createdAt: a.createdAt }))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 8);
  const msgIds = needsYou.map((n) => n.messageId).filter((id): id is string => !!id);
  if (msgIds.length) {
    const msgs = await safe('messages', () => sdk.messages.getMany(msgIds.slice(0, 50)), [], warnings);
    const byId = new Map(msgs.map((m) => [m.messageId, strip(m.content)]));
    for (const n of needsYou) if (n.messageId && byId.get(n.messageId)) n.text = byId.get(n.messageId)!.slice(0, 200);
  }

  // Agents you tagged recently: your last messages that mention an @app.xyne.ai user.
  const mine = await safe('my messages', () => sdk.messages.listMine({ limit: 40 }), [], warnings);
  const cutoff = Date.now() - 6 * 3_600_000;
  const asked = new Map<string, AgentThread>();
  for (const m of mine) {
    if (m.createdAt < cutoff) continue;
    for (const hit of (m.content ?? '').matchAll(MENTION)) {
      const [, uid, uname, email] = hit;
      if (!APP_EMAIL.test(email)) continue;
      const key = `${m.conversationId}:${uid}`;
      if (!asked.has(key) || asked.get(key)!.askedAt < m.createdAt) {
        asked.set(key, { conversationId: m.conversationId, channelId: null, agentUserId: uid, agentName: uname, askedAt: m.createdAt, prompt: strip(m.content).replace(/^@\S+\s*/, '').slice(0, 120), replied: false });
      }
    }
  }
  const agents: AgentThread[] = [];
  for (const t of asked.values()) {
    const conv = prev?.agents.find((a) => a.conversationId === t.conversationId)?.channelId
      ? null
      : await safe(`conversation ${t.conversationId}`, () => sdk.conversations.get(t.conversationId), null, warnings);
    t.channelId = conv?.channelId ?? prev?.agents.find((a) => a.conversationId === t.conversationId)?.channelId ?? null;
    const page = await safe(`thread ${t.conversationId}`, () => sdk.messages.listByConversation(t.conversationId, { limit: 100 }), null, warnings);
    if (page) {
      const reply = page.items.filter((x) => x.senderId === t.agentUserId && x.createdAt > t.askedAt && !/data-flow-json/.test(x.content ?? '')).sort((a, b) => b.createdAt - a.createdAt)[0];
      if (reply) Object.assign(t, { replied: true, reply: strip(reply.content).slice(0, 600), repliedAt: reply.createdAt });
    }
    agents.push(t);
  }

  // Direct messages: unread DM channels, then the latest message in each.
  const dms: DirectMessage[] = [];
  const statuses = await safe('channel statuses', () => sdk.channels.list(), [], warnings);
  const unreadIds = statuses.filter((st) => st.unreadCount > 0 && !st.isClosed).map((st) => st.channelId);
  if (!dmChannels || Date.now() - dmChannelsAt > 5 * 60_000) {
    const all = await safe('channels', () => sdk.channels.listAll(), [], warnings);
    dmChannels = new Map(all.filter((c) => c.scopeType === 'DM' || c.scopeType === 'GROUP_DM').map((c) => [c.id, c.scopeType]));
    dmChannelsAt = Date.now();
  }
  if (unreadIds.length) {
    const targets = unreadIds.filter((id) => dmChannels!.has(id)).slice(0, 8);
    await Promise.all(
      targets.map(async (channelId) => {
        const latest = await safe(`dm ${channelId}`, () => sdk.messages.getLatestInChannel(channelId), null, warnings);
        const st = statuses.find((x) => x.channelId === channelId)!;
        if (!latest || !latest.senderId || latest.senderId === me.id || latest.createdAt <= st.lastViewedAt) return;
        const text = strip(latest.content);
        if (!text) return;
        dms.push({ channelId, conversationId: latest.conversationId, messageId: latest.messageId, senderId: latest.senderId, text: text.slice(0, 200), createdAt: latest.createdAt, group: dmChannels!.get(channelId) === 'GROUP_DM' });
      }),
    );
  }

  const tickets = await safe('my tickets', () => sdk.tickets.list({ viewMode: 'my-tickets' }), [], warnings);
  const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
  const due: DueTicket[] = tickets
    .filter((t) => !t.isArchived && t.eta && t.statusV2 !== 'COMPLETED' && t.statusV2 !== 'CANCELLED' && t.eta <= endOfDay.getTime() + 86_400_000 && t.eta >= Date.now() - 3 * 86_400_000)
    .map((t) => ({ id: t.id, key: t.xyneId, title: t.title, priority: t.priority, stageName: t.stageName, eta: t.eta!, channelId: t.channelId, conversationId: t.conversationId, overdue: t.eta! < Date.now() }))
    .sort((a, b) => b.eta - a.eta)
    .slice(0, 3);

  const [scheduled, active] = await Promise.all([
    safe('scheduled calls', () => sdk.calls.listScheduled(), [], warnings),
    safe('active calls', () => sdk.calls.listActive(), [], warnings),
  ]);
  const soon = Date.now() + 2 * 3_600_000;
  const calls: UpcomingCall[] = [
    ...active.map((c) => ({ id: c.id, title: c.title ?? 'Call', startsAt: c.startsAt, status: c.status, roomLink: c.roomLink, channelId: c.channelId, participantCount: c.participantCount, active: true })),
    ...scheduled.filter((c) => c.startsAt && c.startsAt <= soon && c.startsAt >= Date.now() - 10 * 60_000).map((c) => ({ id: c.id, title: c.title ?? 'Call', startsAt: c.startsAt, status: c.status, roomLink: c.roomLink, channelId: c.channelId, participantCount: c.participantCount, active: false })),
  ]
    .filter((c, i, arr) => arr.findIndex((x) => x.title === c.title && x.startsAt === c.startsAt) === i)
    .sort((a, b) => (a.startsAt ?? 0) - (b.startsAt ?? 0))
    .slice(0, 3);

  // Names for actors we will show: the workspace directory, paged once and cached for the process.
  const ids = [...new Set([...needsYou.map((n) => n.actorId), ...dms.map((d) => d.senderId)])].filter((id): id is string => typeof id === 'string' && id.length > 0);
  const names = { ...(prev?.names ?? {}) };
  const agentIds = new Set(prev?.agentIds ?? []);
  if (ids.some((id) => !names[id])) await loadDirectory(sdk, warnings);
  for (const id of ids) {
    const u = directory.get(id);
    if (u) {
      names[id] = u.name;
      if (u.agent) agentIds.add(id);
    }
  }
  return { me, needsYou, dms, agentIds, dmChannelIds: new Set(dmChannels?.keys() ?? []), agents, due, calls, names, warnings, at: Date.now() };
}

const directory = new Map<string, { name: string; agent: boolean }>();
let directoryLoaded = false;

async function loadDirectory(sdk: SpacesClient, warnings: string[]): Promise<void> {
  if (directoryLoaded) return;
  directoryLoaded = true;
  let offset = 0;
  for (let page = 0; page < 40; page++) {
    const res = await safe('users', () => sdk.users.listBasic({ limit: 100, offset }), null, warnings);
    if (!res) return;
    for (const u of res.items) {
      const agent = /@app\.xyne\.ai$/i.test(u.email ?? '') || (u.userType && !/human|user|member/i.test(u.userType));
      directory.set(u.id, { name: u.displayName || u.name || u.email?.split('@')[0] || u.id, agent: !!agent });
    }
    if (!res.hasMore) return;
    offset = res.nextOffset;
  }
}

let dmChannels: Map<string, string> | null = null;
let dmChannelsAt = 0;

export async function markChannelViewed(sdk: SpacesClient, channelId: string): Promise<void> {
  await sdk.channels.markAsViewed(channelId);
}

export async function markRead(sdk: SpacesClient, activityId: string): Promise<void> {
  await sdk.activities.markAsRead(activityId);
}

/** Links in the shape the Spaces dashboard itself navigates to. */
export function linkFor(
  baseUrl: string,
  target: { channelId?: string | null; conversationId?: string | null; messageId?: string | null; ticketId?: string | null; callId?: string | null; dm?: boolean },
): string {
  const { channelId, conversationId, messageId, ticketId, callId, dm } = target;
  if (callId) return `${baseUrl}/call/${encodeURIComponent(callId)}`;
  if (dm && channelId) return `${baseUrl}/chat/dm/${channelId}`;
  if (channelId && ticketId) return `${baseUrl}/chat/dir/${channelId}/tickets/${ticketId}`;
  if (channelId && conversationId) return `${baseUrl}/chat/dir/${channelId}/${conversationId}#origin=${conversationId}${messageId ? `&messageId=${messageId}` : ''}`;
  if (channelId) return `${baseUrl}/chat/dir/${channelId}`;
  if (conversationId) return `${baseUrl}/chat/threads`;
  return `${baseUrl}/chat/activity`;
}
