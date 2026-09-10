/**
 * Automations Operation Registry
 *
 * Event-triggered automations and the workflows they belong to.
 *
 * Automations move through an approval lifecycle rather than being switched on
 * directly: a proposal is submitted, approved or rejected, then activated. The
 * operations here follow that sequence, and each is a distinct mutator so the
 * transitions stay auditable.
 */
import type { Workflow } from '../types/index.js';
/** Page cursor for the workflow listing. */
export interface WorkflowCursor {
    id: string;
    createdAt: number;
}
export declare const automationsOperations: {
    /**
     * Every automation.
     */
    readonly list: import("./types.js").SdkOperation<void, Workflow[]>;
    /**
     * One automation.
     */
    readonly get: import("./types.js").SdkOperation<{
        id: string;
    }, Workflow | null>;
    /**
     * Workflows, paginated. Automations are one workflow type among several.
     */
    readonly listWorkflows: import("./types.js").SdkOperation<{
        limit?: number;
        start?: WorkflowCursor;
    }, Workflow[]>;
    /**
     * Propose a new automation. It starts as a draft and must be submitted and
     * approved before it can run.
     */
    readonly createProposal: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        configJson: unknown;
        metadataJson: unknown;
        eventType: string;
        automationSeriesId?: string;
    }, void>;
    /**
     * Edit an automation.
     */
    readonly update: import("./types.js").SdkOperation<{
        id: string;
        name?: string;
        configJson?: unknown;
        metadataJson?: unknown;
        eventType?: string;
    }, void>;
    /**
     * Delete an automation.
     */
    readonly delete: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Send a draft for approval.
     */
    readonly submitForApproval: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Withdraw a submission before it is decided.
     */
    readonly revoke: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Approve a submitted automation.
     */
    readonly approve: import("./types.js").SdkOperation<{
        id: string;
        note?: string;
    }, void>;
    /**
     * Reject a submitted automation. A note explaining why is required.
     */
    readonly reject: import("./types.js").SdkOperation<{
        id: string;
        note: string;
    }, void>;
    /**
     * Start running an approved automation.
     */
    readonly activate: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Stop running an automation without deleting it.
     */
    readonly disable: import("./types.js").SdkOperation<{
        id: string;
        cancelQueued?: boolean;
    }, void>;
    /**
     * Retire an automation.
     */
    readonly archive: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
};
