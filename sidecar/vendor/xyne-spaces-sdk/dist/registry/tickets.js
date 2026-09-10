/**
 * Tickets Operation Registry
 *
 * Work-tracking tickets and everything hanging off one: sub-tickets, tags,
 * references between tickets, stage-approval requests, and per-user mailbox
 * state. Support-desk tickets (the email surface) are a separate view of the
 * same table and live in `registry/support-tickets.ts`.
 */
import { api, firstOrNull, op } from './types.js';
import { appendArray, appendFiles, appendOptional } from '../core/form-data.js';
export const ticketsOperations = {
    // ----- Direct API operations -----
    /**
     * Create a ticket through the server-side sequence allocator and workflow.
     */
    create: api('POST', '/api/sdk/v1/tickets', {
        mapArgs: (args) => {
            const { files, ...fields } = args;
            if (!files || files.length === 0)
                return fields;
            const { tags, excludedChatAttachmentIds, draftAttachmentIds, ...scalarFields } = fields;
            const form = new FormData();
            for (const [key, value] of Object.entries(scalarFields)) {
                appendOptional(form, key, value);
            }
            appendArray(form, 'tags', tags);
            appendArray(form, 'excludedChatAttachmentIds', excludedChatAttachmentIds);
            appendArray(form, 'draftAttachmentIds', draftAttachmentIds);
            appendFiles(form, files);
            return form;
        },
        // Passed through rather than rebuilt field by field. The controller
        // returns a full ticket detail (see `createTicket` in ticketController),
        // and narrowing it here silently dropped `stageName` and `status` — the
        // two things a caller most wants back, since the server rather than the
        // caller decides them.
        mapResult: (raw) => raw,
    }),
    // ----- Reads -----
    /**
     * Tickets for a view. `viewMode` selects the scope and decides which of
     * `projectId` / `boardId` / `userId` / `groupId` is used.
     */
    list: op('tickets.list', 'query'),
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
    listKanban: op('tickets.listKanban', 'query'),
    /**
     * Tickets created in a channel inside a time window, newest first.
     *
     * Drives the desk support screen's topic explorer. The window is inclusive at
     * both ends and the server rejects `createdAtStart > createdAtEnd`.
     *
     * `isMember` is required by the schema but unread by the query body — it is an
     * ACL hint, and is supplied here so a caller does not have to know that.
     */
    listByChannelInWindow: op('tickets.listByChannelInWindow', 'query'),
    /**
     * One ticket.
     */
    get: op('tickets.get', 'query'),
    /**
     * One ticket with its relations resolved for a detail view.
     */
    getDetails: op('tickets.getDetails', 'query'),
    /**
     * Look a ticket up by its human-readable key (e.g. `PLAT-1234`).
     */
    getByKey: op('tickets.getByKey', 'query'),
    /**
     * Several tickets by id.
     */
    getMany: op('tickets.getMany', 'query'),
    /**
     * The bare ticket row, with no relations resolved.
     *
     * Cheaper than `get` when only the ticket's own columns are needed — `get`
     * additionally pulls project, tags, assignments, references, and stage data.
     */
    getRow: op('tickets.getRow', 'query'),
    /**
     * Free-text ticket search by title.
     */
    search: op('tickets.search', 'query'),
    /**
     * Tickets in a project.
     */
    listByProject: op('tickets.listByProject', 'query'),
    /**
     * The current user's ticket exports, newest first (server caps at 100).
     */
    listExports: op('tickets.listExports', 'query'),
    /**
     * A ticket's activity timeline.
     */
    listActivities: op('tickets.listActivities', 'query'),
    /**
     * Activities across several tickets at once, newest first, paginated.
     *
     * The batch counterpart to `listActivities`. `start` is nullable rather than
     * optional server-side, so it is always sent — as null on the first page.
     */
    listActivitiesForTickets: op('tickets.listActivitiesForTickets', 'query'),
    /**
     * Assignment history for a ticket.
     */
    listAssignments: op('tickets.listAssignments', 'query'),
    /**
     * The workflow attached to a ticket, if any.
     */
    getWorkflow: op('tickets.getWorkflow', 'query', {
        mapResult: firstOrNull,
    }),
    /**
     * Files attached to a ticket.
     */
    listAttachments: op('tickets.listAttachments', 'query'),
    /**
     * Emails on a ticket's conversation (desk tickets).
     */
    listEmails: op('tickets.listEmails', 'query'),
    /**
     * The current user's mailbox state for a ticket (inbox / archived, starred).
     *
     * The V2 query takes the ticket's `channelId` too, as a hint to Zero's ACL
     * layer, so callers must now pass it. `isMember` is supplied here.
     */
    getMailbox: op('tickets.getMailbox', 'query', { mapResult: firstOrNull }),
    /**
     * The RCA linked to a ticket.
     */
    getRca: op('tickets.getRca', 'query'),
    /**
     * Release attributions for a ticket.
     */
    listReleaseAttributions: op('tickets.listReleaseAttributions', 'query'),
    /**
     * Custom-field values set on a ticket.
     */
    listFieldValues: op('tickets.listFieldValues', 'query'),
    // ----- Sub-tickets -----
    /**
     * Sub-tickets of a ticket.
     */
    listSubTickets: op('tickets.listSubTickets', 'query'),
    /**
     * Sub-tickets by id.
     */
    getSubTickets: op('tickets.getSubTickets', 'query'),
    /**
     * Sub-ticket mappings for several parent tickets at once.
     *
     * Returns the mapping rows (each carrying its sub-ticket), not bare sub-tickets,
     * so a caller batching many parents can tell which parent each one belongs to.
     */
    listSubTicketMappings: op('tickets.listSubTicketMappings', 'query'),
    /**
     * Create a sub-ticket. The row id and its mapping id are supplied by the
     * caller so the resource can return them.
     */
    createSubTicket: op('tickets.createSubTicket', 'mutator'),
    /**
     * Update a sub-ticket.
     */
    updateSubTicket: op('tickets.updateSubTicket', 'mutator'),
    // ----- Writes -----
    /**
     * Update a ticket.
     *
     * This is the single broad update path — title, description, status, priority,
     * stage, assignee, ETA, and archive state all go through it.
     */
    update: op('tickets.update', 'mutator'),
    /**
     * Reassign a ticket.
     */
    assign: op('tickets.assign', 'mutator'),
    /**
     * Archive a desk ticket.
     */
    archive: op('tickets.archive', 'mutator'),
    /**
     * Set the ETA for a ticket's current stage.
     */
    setStageEta: op('tickets.setStageEta', 'mutator'),
    // ----- Tags -----
    /**
     * Tags defined on a project, available to its tickets.
     */
    listProjectTags: op('tickets.listProjectTags', 'query'),
    /**
     * Apply a tag to a ticket. The tag, project-tag, and mapping row ids are all
     * generated here.
     */
    addTag: op('tickets.addTag', 'mutator'),
    /**
     * Remove a tag from a ticket.
     */
    // Both ids are required: the tag itself and the row linking it to the ticket.
    removeTag: op('tickets.removeTag', 'mutator'),
    // ----- References between tickets -----
    /**
     * Link two tickets (blocks, relates-to, and so on).
     */
    addReference: op('tickets.addReference', 'mutator'),
    /**
     * Change how two linked tickets relate.
     */
    updateReference: op('tickets.updateReference', 'mutator'),
    /**
     * Unlink two tickets.
     */
    removeReference: op('tickets.removeReference', 'mutator'),
    // ----- Stage approval requests -----
    /**
     * Approval requests raised for a ticket's stage moves.
     */
    listStageRequests: op('tickets.listStageRequests', 'query'),
    /**
     * Open approval requests sitting on a stage.
     */
    listOpenStageRequests: op('tickets.listOpenStageRequests', 'query'),
    /**
     * Raise or decide a stage-approval request.
     *
     * `updatedBy` has to be supplied by the caller: the mutator records it as an
     * argument rather than deriving it from the session.
     */
    upsertStageRequest: op('tickets.upsertStageRequest', 'mutator'),
    /**
     * Clear a ticket's stage requests.
     */
    deleteStageRequests: op('tickets.deleteStageRequests', 'mutator'),
    /**
     * Move a ticket to another stage on a non-linear board, running the board's
     * transition rules.
     */
    transitionStage: op('tickets.transitionStage', 'mutator'),
    // ----- Mailbox -----
    /**
     * Move a ticket between inbox and archive for the current user.
     */
    setMailboxState: op('tickets.setMailboxState', 'mutator'),
    /**
     * Star or unstar a ticket for the current user.
     */
    setMailboxStarred: op('tickets.setMailboxStarred', 'mutator'),
    /**
     * Sub-tickets linked to a mapped ticket.
     */
    listSubTicketsByMapped: op('tickets.listSubTicketsByMapped', 'query'),
    /**
     * The single sub-ticket linked to a mapped ticket.
     */
    getSubTicketByMapped: op('tickets.getSubTicketByMapped', 'query'),
};
