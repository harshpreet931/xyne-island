/**
 * Incidents Operation Registry
 *
 * Root-cause analyses and everything attached to them: recorded impacts,
 * corrective actions (CoE), and the release attributions that connect an
 * incident to the deploy that caused it.
 *
 * An RCA hangs off a ticket. Impacts and CoE items hang off the RCA.
 */
import type { ApplicationReleaseTicket, AttributionConfidence, CoeStatus, RcaStatus, Severity, FormEntityValue, MessageAttachment, Rca, ReleaseChange, ReleaseEvent, Ticket } from '../types/index.js';
/** Page cursor for the RCA listing. */
export interface RcaCursor {
    id: string;
    createdAt: number;
}
export declare const incidentsOperations: {
    /**
     * Every RCA, most recent first.
     */
    readonly listRcas: import("./types.js").SdkOperation<{
        limit?: number;
        start?: RcaCursor;
    }, Rca[]>;
    /**
     * One RCA.
     */
    readonly getRca: import("./types.js").SdkOperation<{
        rcaId: string;
    }, Rca | null>;
    /**
     * Impacts recorded against an RCA.
     */
    readonly listImpactAttachments: import("./types.js").SdkOperation<{
        impactId: string;
    }, MessageAttachment[]>;
    /**
     * Attachments across several impacts.
     */
    readonly listAttachmentsForImpacts: import("./types.js").SdkOperation<{
        impactIds: string[];
    }, MessageAttachment[]>;
    /**
     * Release tickets.
     */
    readonly listReleaseTickets: import("./types.js").SdkOperation<void, Ticket[]>;
    /**
     * Search release tickets.
     */
    readonly searchReleaseTickets: import("./types.js").SdkOperation<{
        search?: string;
        limit?: number;
    }, Ticket[]>;
    /**
     * Application release tickets for a release.
     */
    readonly listApplicationReleaseTickets: import("./types.js").SdkOperation<{
        releaseId: string;
        limit?: number;
    }, ApplicationReleaseTicket[]>;
    /**
     * Changes bundled into a release.
     */
    readonly listReleaseChanges: import("./types.js").SdkOperation<{
        releaseId: string;
    }, ReleaseChange[]>;
    /**
     * Form values captured against a release's changes.
     */
    readonly listReleaseChangeFormValues: import("./types.js").SdkOperation<{
        releaseId: string;
    }, FormEntityValue[]>;
    /**
     * Change-log entries for a release.
     */
    readonly listReleaseChangeLog: import("./types.js").SdkOperation<{
        releaseId: string;
    }, FormEntityValue[]>;
    /**
     * Open an RCA against a ticket.
     */
    readonly createRca: import("./types.js").SdkOperation<{
        id: string;
        ticketId: string;
        title: string;
        severity: Severity;
        bugTypeId: string;
        categoryTypeId: string;
        status: RcaStatus;
        ownerId?: string;
        summary?: string;
        rootCause?: string;
        issueCategoryId?: string;
        issueStartAt?: number;
    }, void>;
    /**
     * Update an RCA.
     */
    readonly updateRca: import("./types.js").SdkOperation<{
        id: string;
        ticketId?: string;
        title?: string;
        summary?: string;
        rootCause?: string;
        severity?: Severity;
        bugTypeId?: string;
        categoryTypeId?: string;
        issueCategoryId?: string;
        issueStartAt?: number;
        status?: RcaStatus;
    }, void>;
    /**
     * Record an impact against an RCA.
     */
    readonly createImpact: import("./types.js").SdkOperation<{
        id: string;
        ticketId: string;
        rcaId: string;
        impactTypeId: string;
        impact: string;
    }, void>;
    /**
     * Update a recorded impact.
     */
    readonly updateImpact: import("./types.js").SdkOperation<{
        id: string;
        impactTypeId?: string;
        impact?: string;
    }, void>;
    /**
     * Remove a recorded impact.
     */
    readonly deleteImpact: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Add a corrective action to an RCA.
     */
    readonly createAction: import("./types.js").SdkOperation<{
        id: string;
        rcaId: string;
        ownerId: string;
        actionTypeId: string;
        action: string;
        status: CoeStatus;
        dueDate?: number;
    }, void>;
    /**
     * Update a corrective action.
     */
    readonly updateAction: import("./types.js").SdkOperation<{
        id: string;
        ownerId?: string;
        actionTypeId?: string;
        action?: string;
        status?: CoeStatus;
        dueDate?: number;
        completedAt?: number;
    }, void>;
    /**
     * Remove a corrective action.
     */
    readonly deleteAction: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Attribute a ticket to a release.
     */
    readonly createAttribution: import("./types.js").SdkOperation<{
        id: string;
        ticketId: string;
        releaseId: string;
        confidence: AttributionConfidence;
        releaseApplicationId?: string;
        rootCauseTicketId?: string;
    }, void>;
    /**
     * Update an attribution.
     */
    readonly updateAttribution: import("./types.js").SdkOperation<{
        id: string;
        releaseId?: string;
        releaseApplicationId?: string;
        rootCauseTicketId?: string;
        confidence?: AttributionConfidence;
    }, void>;
    /**
     * Remove an attribution.
     */
    readonly deleteAttribution: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Move an application release ticket to another stage.
     */
    readonly updateReleaseTicketStatus: import("./types.js").SdkOperation<{
        id: string;
        stageName?: string;
        defaultTicketStatusV2?: string;
        failureReason?: string;
    }, void>;
    /**
     * Record who tested a release ticket.
     */
    readonly setReleaseTicketTestedBy: import("./types.js").SdkOperation<{
        id: string;
        userId: string;
    }, void>;
    /**
     * A release's event log, newest first. `FORM_SAVED` events are filtered out
     * server-side as noise.
     */
    readonly listReleaseEvents: import("./types.js").SdkOperation<{
        releaseId: string;
        limit?: number;
    }, ReleaseEvent[]>;
};
