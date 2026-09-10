/**
 * The live-demo director. You narrate; the notch does the next thing when you
 * press a key. Nothing fires on a timer, so the pacing is yours.
 *
 *   npm run demo            # interactive
 *   npm run demo -- --auto  # plays the whole run with narration-sized pauses
 */
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import { isAppRunning } from './island.ts';
import { scenes, sleep, resetScenes } from './scenes.ts';

const RUN: Array<{ key: string; scene: string; say: string; holdMs: number }> = [
  { key: '1', scene: 'call', say: 'The notch wakes: standup in 4 minutes. One glance, no window.', holdMs: 6000 },
  { key: '2', scene: 'mention', say: 'Priya mentions me. The notch turns amber and opens by itself. Press Open here, it jumps to the thread; Done marks it read.', holdMs: 12000 },
  { key: '3', scene: 'ticket', say: 'A ticket lands on me: Stub, the ticket stub. Same two buttons.', holdMs: 8000 },
  { key: '4', scene: 'agent', say: 'I tagged the Architect on a PR. Beam works while I keep typing, then the answer reveals for eight seconds and settles.', holdMs: 14000 },
  { key: '5', scene: 'overdue', say: 'A critical ticket goes overdue. Stub frowns; the pill says OVERDUE.', holdMs: 6000 },
  { key: '6', scene: 'doctor', say: 'infra-doctor finishes an RCA in #production-logs. I catch the summary without opening the channel.', holdMs: 14000 },
  { key: '7', scene: 'approval', say: 'A stage gate needs an approver. Approve or Reject, right here, and it round-trips to Spaces.', holdMs: 10000 },
  { key: '8', scene: 'missed', say: 'A missed call. Ring holds it until I deal with it.', holdMs: 6000 },
];

const help = () => {
  console.log('\nXyne Island demo director');
  console.log('  1-8  fire a scene        n  next scene in order     r  reset the notch');
  console.log('  a    play everything     q  quit\n');
  for (const step of RUN) console.log(`  ${step.key}  ${step.scene.padEnd(9)} ${step.say}`);
  console.log('');
};

async function ensureApp(): Promise<boolean> {
  if (await isAppRunning()) return true;
  console.log('Xyne Island is not running. Launching it…');
  spawn('open', ['-a', 'Xyne Island'], { stdio: 'ignore', detached: true }).unref();
  for (let i = 0; i < 20 && !(await isAppRunning()); i++) await sleep(500);
  return isAppRunning();
}

async function fire(step: (typeof RUN)[number]) {
  console.log(`\n▶ ${step.scene}: ${step.say}`);
  if (!(await ensureApp())) { console.log('  (no notch app; open "build/Xyne Island.app" and press the key again)'); return; }
  try {
    await scenes[step.scene]();
  } catch (e) {
    console.log(`  scene failed: ${(e as Error).message}`);
  }
}

async function main() {
  if (!(await ensureApp())) {
    console.error('Still no socket. Open "build/Xyne Island.app" first.');
    process.exit(1);
  }
  await resetScenes();
  process.on('unhandledRejection', (e) => console.log(`  (ignored: ${(e as Error)?.message ?? e})`));

  if (process.argv.includes('--auto')) {
    for (const step of RUN) {
      await fire(step);
      await sleep(step.holdMs);
    }
    console.log('\nRun complete. Held cards stay until answered in the notch.');
    return;
  }

  help();
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  let cursor = 0;
  process.stdin.on('keypress', async (_str, key) => {
    const k = key.name ?? _str;
    if (k === 'q' || (key.ctrl && k === 'c')) { console.log('\nbye'); process.exit(0); }
    if (k === 'r') { await resetScenes(); cursor = 0; console.log('\n↺ reset — the notch is quiet again'); return; }
    if (k === 'h') return help();
    if (k === 'a') { for (const step of RUN) { await fire(step); await sleep(step.holdMs); } return; }
    if (k === 'n' || k === 'return' || k === 'space') {
      const step = RUN[cursor];
      if (!step) { console.log('\n(end of run — r to reset)'); return; }
      cursor++;
      await fire(step);
      return;
    }
    const step = RUN.find((s) => s.key === k);
    if (step) { cursor = RUN.indexOf(step) + 1; await fire(step); }
  });
}

main();
