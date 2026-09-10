/**
 * A scripted day at Xyne, with no Spaces session needed.
 *
 * Every scene sends the same cards the real bridge sends, so this is a faithful
 * stand-in for design work, for demos, and for checking a build before anyone
 * hands it a token.
 *
 *   npm run scenes            # play the whole day
 *   npm run scenes -- mention # play one scene
 */
import { retireCard, showCard, isAppRunning, type Cast } from './island.ts';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SPACES = 'https://spaces.xyne.juspay.net';

/** Every card the scenes create, so a reset can clear the island. */
export const SCENE_CARDS: Array<{ cast: Cast; id: string }> = [
  { cast: 'architect', id: 'arch-1' },
  { cast: 'mention', id: 'act-1' },
  { cast: 'ticket', id: 'req-1' },
  { cast: 'call', id: 'call-1' },
  { cast: 'ticket', id: 'tk-1' },
  { cast: 'call', id: 'miss-1' },
  { cast: 'ticket', id: 'due-1' },
  { cast: 'ticket', id: 'pr-1' },
  { cast: 'bot', id: 'doc-1' },
];

/** A card that waits for an answer, exactly as the live bridge holds one open. */
function held(id: string, card: Parameters<typeof showCard>[0]): void {
  void showCard(card, { expectsAnswer: true, timeoutMs: 3_600_000 })
    .then((answer) => console.log(`${id} answered: ${answer ?? '(closed)'}`))
    .catch(() => console.log(`${id}: the notch went away`));
}

export const scenes: Record<string, () => Promise<void>> = {
  async agent() {
    // The Architect picks up a task you tagged it on.
    await showCard({
      id: 'arch-1', cast: 'architect', title: 'Architect · Review PR #1653',
      activity: 'Reading useSavedView.ts', context: '/xyne-spaces', state: 'working', link: SPACES,
    });
    await sleep(4_000);
    await showCard({
      id: 'arch-1', cast: 'architect', title: 'Architect · Review PR #1653',
      activity: 'Answered', context: '/xyne-spaces', state: 'done', link: SPACES,
      detail: 'Changes requested. One high: legacy saved views lose custom fields because `columns ?? []` drops the default list (useSavedView.ts:142). Fix is a one-liner; repro and POT posted to XYNE-61392.',
    });
  },

  async mention() {
    held('act-1', {
      id: 'act-1', cast: 'mention', title: 'Priya Raman · #xyne-spaces',
      activity: 'POT for #1653? Need it before the 6pm release cut.',
      context: '/pending', state: 'needsYou', link: SPACES,
      prompt: {
        kind: 'question',
        title: 'Mentioned you in XYNE-61392 · 4:12 pm',
        detail: '@Harshpreet POT for #1653? Need it before the 6pm release cut.',
      },
    });
  },

  async approval() {
    held('req-1', {
      id: 'req-1', cast: 'ticket', title: 'XYNE-62857 · custom runners flag',
      activity: 'Devin asked to move it to QA', context: '/approval', state: 'approval', link: SPACES,
      prompt: {
        kind: 'approval',
        title: 'Approve the move to QA?',
        detail: 'Devin asked to move it to QA · gate needs one approver',
      },
    });
  },

  async call() {
    await showCard({
      id: 'call-1', cast: 'call', title: 'Standup',
      activity: 'Starts in 4 min · 6 joining', context: '/call', state: 'working', link: SPACES,
    });
  },

  async ticket() {
    held('tk-1', {
      id: 'tk-1', cast: 'ticket', title: 'XYNE-62857 · Add flag for custom runners',
      activity: 'Assigned to you by Devin · low · To be picked up',
      context: '/pending', state: 'needsYou', link: SPACES,
      prompt: {
        kind: 'question',
        title: 'New ticket for you · 3:58 pm',
        detail: 'Add flag to enable custom runners in ci.yaml',
      },
    });
  },

  async missed() {
    held('miss-1', {
      id: 'miss-1', cast: 'call', title: 'Aisha Khan',
      activity: 'Missed call · 2 min ago', context: '/pending', state: 'needsYou', link: SPACES,
      prompt: { kind: 'question', title: 'Missed call · 4:31 pm', detail: 'Aisha Khan called you' },
    });
  },

  async overdue() {
    await showCard({
      id: 'due-1', cast: 'ticket', title: 'XYNE-61392 · Custom field not persisting',
      activity: 'Overdue by 40 min · critical · PR Review',
      context: '/XYNE-61392', state: 'overdue', link: SPACES,
    });
  },

  async pr() {
    await showCard({
      id: 'pr-1', cast: 'ticket', title: 'XYNE-61392 · PR #1653',
      activity: 'PR merged on your ticket · moved to Merged',
      context: '/fyi', state: 'fyi', link: SPACES,
    });
  },

  async doctor() {
    await showCard({
      id: 'doc-1', cast: 'bot', title: 'infra-doctor · #production-logs',
      activity: 'Correlating the CPU alarm with ALB request counts',
      context: '/production-logs', state: 'working', link: SPACES,
    });
    await sleep(4_000);
    await showCard({
      id: 'doc-1', cast: 'bot', title: 'infra-doctor · #production-logs',
      activity: 'RCA ready', context: '/production-logs', state: 'done', link: SPACES,
      detail: 'RCA complete. CPU alarm on checkout-api-v5 self-resolved at 13:08 UTC after peaking at 70.5%. Root cause: imposter SQL flood of ~1M/min from 19:30, decayed by 21:00. Full report attached in the thread.',
    });
  },
};

export async function resetScenes(): Promise<void> {
  for (const card of SCENE_CARDS) {
    await retireCard(card.cast, card.id).catch(() => {});
  }
}

const isCLI = process.argv[1]?.endsWith('scenes.ts');
if (isCLI) {
  if (!(await isAppRunning())) {
    console.error('Xyne Island is not running (no socket). Launch the app first.');
    process.exit(1);
  }
  const picked = process.argv.slice(2);
  const order = picked.length
    ? picked
    : ['agent', 'mention', 'ticket', 'call', 'pr', 'overdue', 'doctor', 'missed', 'approval'];
  for (const name of order) {
    const scene = scenes[name];
    if (!scene) {
      console.error(`Unknown scene ${name}. Scenes: ${Object.keys(scenes).join(', ')}`);
      process.exit(1);
    }
    console.log('scene:', name);
    await scene();
    await sleep(1_200);
  }
  // Cards that wait for an answer keep the process alive until someone answers.
  if (order.some((name) => ['mention', 'approval', 'ticket', 'missed'].includes(name))) {
    console.log('waiting for answers from the notch (Ctrl-C to stop)');
  } else {
    process.exit(0);
  }
}
