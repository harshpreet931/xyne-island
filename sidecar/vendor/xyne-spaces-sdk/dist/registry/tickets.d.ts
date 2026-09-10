/**
 * Tickets Operation Registry
 *
 * Work-tracking tickets and everything hanging off one: sub-tickets, tags,
 * references between tickets, stage-approval requests, and per-user mailbox
 * state. Support-desk tickets (the email surface) are a separate view of the
 * same table and live in `registry/support-tickets.ts`.
 */
import type { CreateTicketInput, CreateTicketResponse, Email, MailboxState, MessageAttachment, ProjectTag, Rca, ReleaseAttribution, StageRequestStatus, SubTicket, SubTicketMapping, Ticket, TicketActivity, TicketAssignment, TicketExport, TicketFieldDefinition, TicketMailbox, TicketReferenceRelation, TicketPriority, TicketStageRequest, TicketStatusV2, Workflow } from '../types/index.js';
/** How a ticket list is scoped. Determines which of the id filters apply. */
export type TicketViewMode = 'project' | 'board' | 'my-tickets' | 'user-tickets' | 'group-tickets';
/** Page cursor for the kanban listing. */
export interface TicketCursor {
    id: string;
    createdAt: number;
}
/** Whether a kanban column is a workflow stage or a ticket status. */
export type KanbanColumnType = 'stage' | 'status';
/**
 * The kanban board's filter set.
 *
 * Ids are user, group, board, tag, and channel ids; `stages` and `ticketTypes` are
 * names.
 */
export interface KanbanTicketFilters {
    priority?: TicketPriority[];
    assignee?: string[];
    userGroups?: string[];
    createdBy?: string[];
    prReviewers?: string[];
    qaAssigned?: string[];
    dueDateStart?: number;
    dueDateEnd?: number;
    createdDateStart?: number;
    createdDateEnd?: number;
    boards?: string[];
    tags?: string[];
    assigned?: boolean;
    created?: boolean;
    stages?: string[];
    ticketTypes?: string[];
    sourceChannels?: string[];
    /** Role-scoped assignment filter: everyone assigned to `roleId` from `userIds`. */
    roleAssignments?: Array<{
        roleId: string;
        userIds: string[];
    }>;
}
/** Page cursor for the cross-ticket activity feed, ordered by timestamp then id. */
export interface TicketActivityCursor {
    timestamp: number;
    id: string;
}
export declare const ticketsOperations: {
    /**
     * Create a ticket through the server-side sequence allocator and workflow.
     */
    readonly create: import("./types.js").ApiOperation<CreateTicketInput, CreateTicketResponse>;
    /**
     * Tickets for a view. `viewMode` selects the scope and decides which of
     * `projectId` / `boardId` / `userId` / `groupId` is used.
     */
    readonly list: import("./types.js").SdkOperation<{
        viewMode: TicketViewMode;
        projectId?: string;
        boardId?: string;
        userId?: string;
        groupId?: string;
        formEntityValueFieldIds?: string[];
    }, Ticket[]>;
    /**
     * A page of tickets for the kanban board, with the board's filter set.
     *
     * Kanban rows carry a precomputed `isStageOverdue` flag and do not include the
     * `stageEtaEntries` relation; `list` does relate it.
     *
     * `viewMode` and `stageName` are required by the query, not conveniences: the
     * query is written per board column, so it wants to know which scope and which
     * column. `stageName: ''` is the sentinel the product's own board navigation
     * uses to mean "every stage", and is the default here.
     *
     * Filters go inside `filters`. An earlier version of this entry accepted
     * `searchQuery` / `statusFilter` / `assignedToFilter` / `createdByFilter` /
     * `workflowTypeFilter`, which belong to an unrelated workflow listing — the
     * server stripped them silently, so those filters never did anything.
     */
    readonly listKanban: import("./types.js").SdkOperation<{
        viewMode: TicketViewMode;
        stageName?: string;
        columnType?: KanbanColumnType;
        limit?: number;
        start?: TicketCursor | null;
        dir?: "forward" | "backward";
        projectId?: string;
        boardId?: string;
        userId?: string;
        groupId?: string;
        filters?: KanbanTicketFilters;
        formEntityValueFieldIds?: string[];
        showOverdueOnly?: boolean;
        overdueReferenceTime?: number;
        excludeFlowSteps?: boolean;
    }, Ticket[]>;
    /**
     * Tickets created in a channel inside a time window, newest first.
     *
     * Drives the desk support screen's topic explorer. The window is inclusive at
     * both ends and the server rejects `createdAtStart > createdAtEnd`.
     *
     * `isMember` is required by the schema but unread by the query body — it is an
     * ACL hint, and is supplied here so a caller does not have to know that.
     */
    readonly listByChannelInWindow: import("./types.js").SdkOperation<{
        channelId: string;
        createdAtStart: number;
        createdAtEnd: number;
        isMember?: boolean;
    }, Ticket[]>;
    /**
     * One ticket.
     */
    readonly get: import("./types.js").SdkOperation<{
        ticketId: string;
    }, Ticket | null>;
    /**
     * One ticket with its relations resolved for a detail view.
     */
    readonly getDetails: import("./types.js").SdkOperation<{
        ticketId: string;
    }, Ticket | null>;
    /**
     * Look a ticket up by its human-readable key (e.g. `PLAT-1234`).
     */
    readonly getByKey: import("./types.js").SdkOperation<{
        xyneId: string;
        workspaceId: string;
    }, Ticket | null>;
    /**
     * Several tickets by id.
     */
    readonly getMany: import("./types.js").SdkOperation<{
        ticketIds: string[];
    }, Ticket[]>;
    /**
     * The bare ticket row, with no relations resolved.
     *
     * Cheaper than `get` when only the ticket's own columns are needed — `get`
     * additionally pulls project, tags, assignments, references, and stage data.
     */
    readonly getRow: import("./types.js").SdkOperation<{
        ticketId: string;
    }, Ticket | null>;
    /**
     * Free-text ticket search by title.
     */
    readonly search: import("./types.js").SdkOperation<{
        search?: string;
        limit?: number;
    }, Ticket[]>;
    /**
     * Tickets in a project.
     */
    readonly listByProject: import("./types.js").SdkOperation<{
        projectId: string;
    }, Ticket[]>;
    /**
     * The current user's ticket exports, newest first (server caps at 100).
     */
    readonly listExports: import("./types.js").SdkOperation<void, TicketExport[]>;
    /**
     * A ticket's activity timeline.
     */
    readonly listActivities: import("./types.js").SdkOperation<{
        ticketId: string;
    }, TicketActivity[]>;
    /**
     * Activities across several tickets at once, newest first, paginated.
     *
     * The batch counterpart to `listActivities`. `start` is nullable rather than
     * optional server-side, so it is always sent — as null on the first page.
     */
    readonly listActivitiesForTickets: import("./types.js").SdkOperation<{
        ticketIds: string[];
        limit?: number;
        start?: TicketActivityCursor;
    }, TicketActivity[]>;
    /**
     * Assignment history for a ticket.
     */
    readonly listAssignments: import("./types.js").SdkOperation<{
        ticketId: string;
    }, TicketAssignment[]>;
    /**
     * The workflow attached to a ticket, if any.
     */
    readonly getWorkflow: import("./types.js").SdkOperation<{
        ticketId: string;
    }, Workflow | null>;
    /**
     * Files attached to a ticket.
     */
    readonly listAttachments: import("./types.js").SdkOperation<{
        ticketId: string;
    }, MessageAttachment[]>;
    /**
     * Emails on a ticket's conversation (desk tickets).
     */
    readonly listEmails: import("./types.js").SdkOperation<{
        conversationId: string;
    }, Email[]>;
    /**
     * The current user's mailbox state for a ticket (inbox / archived, starred).
     *
     * The V2 query takes the ticket's `channelId` too, as a hint to Zero's ACL
     * layer, so callers must now pass it. `isMember` is supplied here.
     */
    readonly getMailbox: import("./types.js").SdkOperation<{
        ticketId: string;
        channelId: string;
    }, TicketMailbox | null>;
    /**
     * The RCA linked to a ticket.
     */
    readonly getRca: import("./types.js").SdkOperation<{
        ticketId: string;
    }, Rca | null>;
    /**
     * Release attributions for a ticket.
     */
    readonly listReleaseAttributions: import("./types.js").SdkOperation<{
        ticketId: string;
    }, ReleaseAttribution[]>;
    /**
     * Custom-field values set on a ticket.
     */
    readonly listFieldValues: import("./types.js").SdkOperation<{
        ticketId: string;
    }, TicketFieldDefinition[]>;
    /**
     * Sub-tickets of a ticket.
     */
    readonly listSubTickets: import("./types.js").SdkOperation<{
        ticketId: string;
    }, SubTicket[]>;
    /**
     * Sub-tickets by id.
     */
    readonly getSubTickets: import("./types.js").SdkOperation<{
        subTicketIds: string[];
    }, SubTicket[]>;
    /**
     * Sub-ticket mappings for several parent tickets at once.
     *
     * Returns the mapping rows (each carrying its sub-ticket), not bare sub-tickets,
     * so a caller batching many parents can tell which parent each one belongs to.
     */
    readonly listSubTicketMappings: import("./types.js").SdkOperation<{
        ticketIds: string[];
    }, SubTicketMapping[]>;
    /**
     * Create a sub-ticket. The row id and its mapping id are supplied by the
     * caller so the resource can return them.
     */
    readonly createSubTicket: import("./types.js").SdkOperation<{
        subTicketId: string;
        mappingId: string;
        ticketId: string;
        title: string;
        description?: string;
        conversationId?: string;
    }, void>;
    /**
     * Update a sub-ticket.
     */
    readonly updateSubTicket: import("./types.js").SdkOperation<{
        subTicketId: string;
        assignedTo?: string;
        mappedTicketId?: string;
    }, void>;
    /**
     * Update a ticket.
     *
     * This is the single broad update path — title, description, status, priority,
     * stage, assignee, ETA, and archive state all go through it.
     */
    readonly update: import("./types.js").SdkOperation<{
        id: string;
        title?: string;
        description?: string;
        statusV2?: TicketStatusV2;
        priority?: TicketPriority;
        stageName?: string;
        assignedTo?: string;
        ticketType?: string;
        userGroupId?: string;
        boardId?: string;
        eta?: number;
        isArchived?: boolean;
        kanbanPosition?: string;
        metadata?: unknown;
    }, void>;
    /**
     * Reassign a ticket.
     */
    readonly assign: import("./types.js").SdkOperation<{
        ticketId: string;
        assignedTo: string;
    }, void>;
    /**
     * Archive a desk ticket.
     */
    readonly archive: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Set the ETA for a ticket's current stage.
     */
    readonly setStageEta: import("./types.js").SdkOperation<{
        id: string;
        stageEta: number;
        ticketId?: string;
        stageId?: string;
    }, void>;
    /**
     * Tags defined on a project, available to its tickets.
     */
    readonly listProjectTags: import("./types.js").SdkOperation<{
        projectId: string;
    }, ProjectTag[]>;
    /**
     * Apply a tag to a ticket. The tag, project-tag, and mapping row ids are all
     * generated here.
     */
    readonly addTag: import("./types.js").SdkOperation<{
        ticketId: string;
        projectId: string;
        tagName: string;
    }, void>;
    /**
     * Remove a tag from a ticket.
     */
    readonly removeTag: import("./types.js").SdkOperation<{
        tagId: string;
        mappingId: string;
    }, void>;
    /**
     * Link two tickets (blocks, relates-to, and so on).
     */
    readonly addReference: import("./types.js").SdkOperation<{
        sourceTicketId: string;
        targetTicketId: string;
        relationType: TicketReferenceRelation;
    }, void>;
    /**
     * Change how two linked tickets relate.
     */
    readonly updateReference: import("./types.js").SdkOperation<{
        id: string;
        relationType: TicketReferenceRelation;
    }, void>;
    /**
     * Unlink two tickets.
     */
    readonly removeReference: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Approval requests raised for a ticket's stage moves.
     */
    readonly listStageRequests: import("./types.js").SdkOperation<{
        ticketId: string;
    }, TicketStageRequest[]>;
    /**
     * Open approval requests sitting on a stage.
     */
    readonly listOpenStageRequests: import("./types.js").SdkOperation<{
        stageId: string;
    }, TicketStageRequest[]>;
    /**
     * Raise or decide a stage-approval request.
     *
     * `updatedBy` has to be supplied by the caller: the mutator records it as an
     * argument rather than deriving it from the session.
     */
    readonly upsertStageRequest: import("./types.js").SdkOperation<{
        id: string;
        ticketId: string;
        stageId: string;
        status: StageRequestStatus;
        updatedBy: string;
        formId?: string;
        reviewedBy?: string;
        comment?: string;
    }, void>;
    /**
     * Clear a ticket's stage requests.
     */
    readonly deleteStageRequests: import("./types.js").SdkOperation<{
        ticketId: string;
    }, void>;
    /**
     * Move a ticket to another stage on a non-linear board, running the board's
     * transition rules.
     */
    readonly transitionStage: import("./types.js").SdkOperation<{
        ticketId: string;
        toStageName: string;
        formValuesJson?: string;
    }, void>;
    /**
     * Move a ticket between inbox and archive for the current user.
     */
    readonly setMailboxState: import("./types.js").SdkOperation<{
        id: string;
        ticketId: string;
        channelId: string;
        state: MailboxState;
    }, void>;
    /**
     * Star or unstar a ticket for the current user.
     */
    readonly setMailboxStarred: import("./types.js").SdkOperation<{
        id: string;
        ticketId: string;
        channelId: string;
        starred: boolean;
    }, void>;
    /**
     * Sub-tickets linked to a mapped ticket.
     */
    readonly listSubTicketsByMapped: import("./types.js").SdkOperation<{
        mappedTicketId: string;
    }, SubTicket[]>;
    /**
     * The single sub-ticket linked to a mapped ticket.
     */
    readonly getSubTicketByMapped: import("./types.js").SdkOperation<{
        mappedTicketId: string;
    }, SubTicket | null>;
};
