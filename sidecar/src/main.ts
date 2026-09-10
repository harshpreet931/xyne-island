/**
 * The Spaces bridge: polls Xyne Spaces and keeps the notch in sync.
 *
 * Each poll builds the set of cards the current snapshot implies, diffs it
 * against what the notch is already showing, and sends only the difference.
 * Cards that ask something hold their connection open so the buttons in the
 * notch round-trip back here and mark the thing handled in Spaces.
 *
 * Credentials refresh themselves: the token is checked before every poll and
 * replaced through `spaces token` before it expires, or right after Spaces
 * rejects it. Nobody has to notice.
 */
import { cardsFrom, signature, type Card } from './cards.ts';
import { isAppRunning, reportStatus, retireCard, showCard } from './island.ts';
import { client, snapshot, type Snapshot } from './spaces.ts';
import { EXIT_NEEDS_SIGN_IN, NeedsSignIn, TokenStore, isAuthFailure, type Credentials } from './token.ts';

const POLL_MS = Number(process.env.XYNE_ISLAND_POLL_MS ?? 12_000);
/** How long a card waits for an answer before the notch gives up on it. */
const ANSWER_TIMEOUT_MS = 6 * 3_600_000;
/** Managed by the app: if the notch stays gone this long, let the app respawn us. */
const ORPHAN_TIMEOUT_MS = 60_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const managed = process.env.XYNE_ISLAND_MANAGED === '1';
const debug = !!process.env.XYNE_ISLAND_DEBUG;

/** What the notch is currently showing, and what we last told it. */
const onScreen = new Map<string, { card: Card; signature: string }>();

function log(message: string): void {
  console.log(`${new Date().toISOString()} ${message}`);
}

async function show(card: Card, previous?: { card: Card; signature: string }): Promise<void> {
  const next = signature(card);
  if (previous?.signature === next) return;
  onScreen.set(card.id, { card, signature: next });

  const { answerable, onOpen, onDismiss, ...payload } = card;
  if (!answerable) {
    await showCard(payload).catch(() => {});
    return;
  }

  // Held open until somebody presses a button in the notch. Deliberately not
  // awaited: the poll loop must keep running while it waits.
  void showCard(payload, { expectsAnswer: true, timeoutMs: ANSWER_TIMEOUT_MS })
    .then(async (answer) => {
      if (!answer) return;
      // The app already opened the link; our job is to mark it handled in Spaces.
      const handled = answer === 'open' ? onOpen : onDismiss;
      await handled?.().catch(() => {});
      onScreen.delete(card.id);
      await retireCard(card.cast, card.id).catch(() => {});
    })
    .catch(() => {});
}

async function retire(id: string): Promise<void> {
  const entry = onScreen.get(id);
  if (!entry) return;
  onScreen.delete(id);
  await retireCard(entry.card.cast, id).catch(() => {});
}

async function main(): Promise<void> {
  const tokens = new TokenStore();
  let credentials: Credentials;
  try {
    credentials = await tokens.current();
  } catch (error) {
    const message = error instanceof NeedsSignIn ? error.message : String(error);
    log(`no Spaces session: ${message}`);
    await reportStatus('signedOut', message).catch(() => {});
    process.exit(EXIT_NEEDS_SIGN_IN);
  }

  let sdk = client(credentials);
  let previous: Snapshot | undefined;
  let lastSeenApp = Date.now();
  let announced = false;

  log(`Xyne Island bridge · ${credentials.baseUrl} · token from ${credentials.source} · polling every ${POLL_MS / 1000}s`);

  for (;;) {
    if (!(await isAppRunning())) {
      onScreen.clear();
      previous = undefined;
      announced = false;
      if (managed && Date.now() - lastSeenApp > ORPHAN_TIMEOUT_MS) {
        log('the notch has been gone for a while; exiting so the app can restart us');
        process.exit(0);
      }
      await sleep(3_000);
      continue;
    }
    lastSeenApp = Date.now();

    try {
      // Cheap on every poll; only shells out to `spaces token` near expiry.
      const fresh = await tokens.current();
      if (fresh.token !== credentials.token) {
        credentials = fresh;
        sdk = client(credentials);
        log('refreshed the Spaces token before it expired');
      }
    } catch (error) {
      const message = error instanceof NeedsSignIn ? error.message : String(error);
      log(`token refresh failed: ${message}`);
      await reportStatus('signedOut', message).catch(() => {});
      await sleep(30_000);
      continue;
    }

    try {
      const current = await snapshot(sdk, previous);
      previous = current;

      const cards = cardsFrom(current, credentials.baseUrl, sdk);
      const wanted = new Set(cards.map((card) => card.id));
      for (const id of [...onScreen.keys()]) {
        if (!wanted.has(id)) await retire(id);
      }
      for (const card of cards) await show(card, onScreen.get(card.id));

      if (!announced) {
        announced = true;
        await reportStatus('connected', 'Connected to Spaces').catch(() => {});
        for (const card of cards) log(`  ${card.cast.padEnd(9)} ${card.state.padEnd(8)} ${card.title} — ${card.activity}`);
        if (!cards.length) log('  nothing needs you right now');
      }
      if (current.warnings.length) {
        if (debug) log(`warnings:\n${current.warnings.join('\n')}`);
      }
    } catch (error) {
      if (isAuthFailure(error)) {
        log('Spaces rejected the token; asking `spaces token --update` for a new one');
        try {
          credentials = await tokens.refresh();
          sdk = client(credentials);
          announced = false;
          continue;
        } catch (refreshError) {
          const message = refreshError instanceof NeedsSignIn ? refreshError.message : String(refreshError);
          log(`could not refresh: ${message}`);
          await reportStatus('signedOut', message).catch(() => {});
          await sleep(30_000);
          continue;
        }
      }
      const message = (error as Error).message;
      log(`poll failed: ${message}`);
      await reportStatus('degraded', message).catch(() => {});
    }

    await sleep(POLL_MS);
  }
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => process.exit(0));
}

main().catch((error) => {
  log(`bridge stopped: ${(error as Error).message}`);
  process.exit(1);
});
