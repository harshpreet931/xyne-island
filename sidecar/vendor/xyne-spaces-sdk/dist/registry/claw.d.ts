/**
 * Claw Operation Registry
 *
 * Xyne Claw runs remote agents. It is a separate service from Spaces, but the
 * SDK does not talk to it: these operations go to Spaces, which relays them with
 * its own service credential. So Claw needs no login of its own here, and a
 * Spaces API key is the only credential the SDK ever holds.
 *
 * Not part of the Zero catalog, so each one is a direct API call — same pattern
 * as search.
 */
import type { ClawAgent, ClawRun, ClawRunInput } from '../types/index.js';
/**
 * Statuses that mean a run has stopped moving. Anything else is still in flight.
 * `cancelled` and `canceled` both occur in the wild.
 */
export declare const TERMINAL_RUN_STATUSES: readonly string[];
export declare const clawOperations: {
    /**
     * Agents this deployment can run.
     */
    readonly listAgents: import("./types.js").ApiOperation<void, ClawAgent[]>;
    /**
     * Dispatch a run. Returns as soon as the agent is queued.
     */
    readonly run: import("./types.js").ApiOperation<ClawRunInput, {
        sessionId: string;
    }>;
    /**
     * The current state of a run, including its result once finished.
     */
    readonly getRun: import("./types.js").ApiOperation<{
        sessionId: string;
    }, ClawRun>;
};
