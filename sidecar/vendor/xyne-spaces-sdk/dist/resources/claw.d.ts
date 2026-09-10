/**
 * Claw Resource
 *
 * Remote agents, reached through Spaces. There is no separate Claw login: the
 * Spaces backend relays these calls using its own service credential, so the
 * client's API key is the only credential involved.
 */
import { Resource } from './base.js';
import type { ClawAgent, ClawRun, ClawRunInput } from '../types/index.js';
export interface ClawRunAndWaitInput extends ClawRunInput {
    /** Give up after this long. Default 5 minutes. */
    timeoutMs?: number;
    /** Called after each poll, while the run is still in flight. */
    onProgress?: (run: ClawRun) => void | Promise<void>;
    /** Abort waiting. The run itself keeps going. */
    signal?: AbortSignal;
}
export declare class ClawResource extends Resource {
    /**
     * List the agents this deployment can run.
     *
     * @returns Available agents. Use an agent's `slug` to dispatch it.
     * @example
     * const agents = await sdk.claw.listAgents();
     * const slug = agents[0].slug;
     */
    listAgents(): Promise<ClawAgent[]>;
    /**
     * Dispatch an agent and return as soon as it is queued.
     *
     * Passing `channelId` also posts the agent's reply into that Spaces thread —
     * the one place the two services meet.
     *
     * @param input - The agent to run and what to give it.
     * @param input.agent - Agent slug, from {@link listAgents}.
     * @param input.task - The task or prompt to send.
     * @param input.context - Extra context prepended to the task.
     * @param input.channelId - Post the reply into this channel or DM.
     * @param input.conversationId - Continue an existing thread.
     * @returns The session id, for {@link getRun}.
     * @example
     * const { sessionId } = await sdk.claw.run({ agent: 'ask-ai', task: 'Summarise today' });
     */
    run(input: ClawRunInput): Promise<{
        sessionId: string;
    }>;
    /**
     * Read a run's current state, including its result once it has finished.
     *
     * @param sessionId - Session id returned by {@link run}.
     * @returns The run, with `result` set once its `status` is terminal.
     * @throws {NotFoundError} if the session id is unknown.
     * @example
     * const run = await sdk.claw.getRun('session-1');
     */
    getRun(sessionId: string): Promise<ClawRun>;
    /**
     * Dispatch an agent and poll until it finishes.
     *
     * Backs off gently — a run takes tens of seconds at best, so polling hard buys
     * nothing. A timeout stops the waiting, not the run: the `sessionId` in the
     * error message can still be passed to {@link getRun}.
     *
     * @param input - Everything {@link run} takes, plus how long to wait.
     * @param input.timeoutMs - Give up waiting after this long. Defaults to 5 minutes.
     * @param input.onProgress - Called after each poll while the run is in flight.
     * @param input.signal - Abort waiting. The run itself keeps going.
     * @returns The finished run.
     * @throws {SdkError} with code `timeout` if the wait elapses first.
     * @example
     * const run = await sdk.claw.runAndWait({ agent: 'ask-ai', task: 'Summarise today' });
     * console.log(run.status, run.result);
     */
    runAndWait(input: ClawRunAndWaitInput): Promise<ClawRun>;
}
