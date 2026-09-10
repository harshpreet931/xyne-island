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
import { api } from './types.js';
/**
 * Statuses that mean a run has stopped moving. Anything else is still in flight.
 * `cancelled` and `canceled` both occur in the wild.
 */
export const TERMINAL_RUN_STATUSES = [
    'completed',
    'failed',
    'cancelled',
    'canceled',
    'error',
];
export const clawOperations = {
    /**
     * Agents this deployment can run.
     */
    listAgents: api('GET', '/api/sdk/v1/claw/agents', {
        mapResult: (raw) => (Array.isArray(raw) ? raw : []),
    }),
    /**
     * Dispatch a run. Returns as soon as the agent is queued.
     */
    run: api('POST', '/api/sdk/v1/claw/runs'),
    /**
     * The current state of a run, including its result once finished.
     */
    getRun: api('GET', (args) => `/api/sdk/v1/claw/runs/${encodeURIComponent(args.sessionId)}`, {
        // A GET forwards its args as query parameters. The session id is already in
        // the path, so returning nothing here keeps it from being repeated there.
        mapArgs: () => undefined,
    }),
};
