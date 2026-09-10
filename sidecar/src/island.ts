/**
 * Talks to the notch app over its user-only Unix socket.
 *
 * One JSON event per connection, newline-terminated. The app closes the
 * connection immediately unless the event expects an answer, in which case it
 * holds it open until someone presses a button in the notch.
 */
import net from 'node:net';
import os from 'node:os';
import { randomUUID } from 'node:crypto';

/** Must match `CastID` in the app. */
export type Cast = 'mention' | 'ticket' | 'call' | 'architect' | 'askai' | 'bot' | 'xyne';

/** Must match `CardState` in the app. */
export type CardState = 'working' | 'needsYou' | 'approval' | 'done' | 'overdue' | 'fyi';

/** Must match `BridgeState` in the app. */
export type BridgeState = 'waiting' | 'connected' | 'signedOut' | 'degraded';

export const PROTOCOL_VERSION = 1;

export interface CardPayload {
  id: string;
  cast: Cast;
  title: string;
  activity: string;
  context?: string;
  state: CardState;
  link?: string;
  /** The body a finished card reveals: an agent's answer, a message in full. */
  detail?: string;
  prompt?: { kind: 'question' | 'approval'; title: string; detail: string };
}

export type Answer = 'open' | 'dismiss';

export function socketPath(): string {
  return `/tmp/xyne-island-${os.userInfo().uid}.sock`;
}

/** The app decodes strict ISO 8601, which has no fractional seconds. */
function timestamp(ms = Date.now()): string {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

interface SendOptions {
  expectsAnswer?: boolean;
  timeoutMs?: number;
}

function write(event: Record<string, unknown>, { expectsAnswer = false, timeoutMs }: SendOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(socketPath());
    let buffer = '';
    let settled = false;
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      action();
      socket.destroy();
    };
    const timer = setTimeout(
      () => finish(() => resolve(buffer.trim())),
      timeoutMs ?? (expectsAnswer ? 6 * 3_600_000 : 5_000),
    );
    socket.setEncoding('utf8');
    socket.on('connect', () => socket.write(`${JSON.stringify(event)}\n`));
    socket.on('data', (chunk: string) => {
      buffer += chunk;
      if (buffer.includes('\n')) finish(() => resolve(buffer.trim()));
    });
    socket.on('end', () => finish(() => resolve(buffer.trim())));
    socket.on('close', () => finish(() => resolve(buffer.trim())));
    socket.on('error', (error) => finish(() => reject(error)));
  });
}

/**
 * Show a card, or update the one already on screen with the same cast and id.
 *
 * When `expectsAnswer` is set the promise stays pending until someone answers
 * in the notch, or the app goes away — so callers should not await it inline in
 * the poll loop.
 */
export async function showCard(card: CardPayload, options: SendOptions = {}): Promise<Answer | null> {
  const raw = await write(
    {
      v: PROTOCOL_VERSION,
      id: randomUUID(),
      kind: 'card',
      card,
      expectsAnswer: options.expectsAnswer ?? false,
      sentAt: timestamp(),
    },
    options,
  );
  if (!raw) return null;
  try {
    const answer = JSON.parse(raw) as { choice?: Answer };
    return answer.choice ?? null;
  } catch {
    return null;
  }
}

/** Take a card off the island; it is no longer relevant. */
export async function retireCard(cast: Cast, id: string): Promise<void> {
  await write({
    v: PROTOCOL_VERSION,
    id: randomUUID(),
    kind: 'retire',
    card: { id, cast, title: '', activity: '', state: 'done' },
    expectsAnswer: false,
    sentAt: timestamp(),
  });
}

/** Tell the notch how the bridge itself is doing, so an empty island explains itself. */
export async function reportStatus(state: BridgeState, message: string): Promise<void> {
  await write({
    v: PROTOCOL_VERSION,
    id: randomUUID(),
    kind: 'status',
    status: { state, message },
    expectsAnswer: false,
    sentAt: timestamp(),
  });
}

export function isAppRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection(socketPath());
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}
