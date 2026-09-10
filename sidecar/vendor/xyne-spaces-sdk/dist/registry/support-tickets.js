/**
 * Support Tickets Operation Registry
 *
 * The support-desk view of tickets: rows that arrive over email into a desk
 * channel, ordered by last email rather than creation, and filtered by desk
 * concepts (assignee, priority, stage, AI category, draft state).
 *
 * These are the same underlying ticket rows as `registry/tickets.ts` — the
 * queries differ in ordering, filters, and which relations they resolve. Writes
 * go through the ticket operations.
 *
 * `isMember` is an ACL fast-path hint rather than a filter; see the note in
 * `registry/conversations.ts`.
 */
import { op } from './types.js';
export const supportTicketsOperations = {
    /**
     * A page of desk tickets in a channel.
     *
     * Paging is bidirectional: `dir` walks forward or backward from the cursor.
     */
    list: op('supportTickets.list', 'query'),
    /**
     * Desk tickets matching the full filter set, unpaginated.
     *
     * Supports the filters the desk sidebar exposes, including AI categorisation
     * and whether a draft reply is waiting.
     */
    listFiltered: op('supportTickets.listFiltered', 'query'),
    /**
     * One desk ticket row, with the relations the list view renders.
     */
    get: op('supportTickets.get', 'query'),
    /**
     * A desk ticket by its human-readable key.
     */
    getByKey: op('supportTickets.getByKey', 'query'),
    /**
     * A desk ticket's full detail, by id or by key.
     *
     * V2 takes the same arguments but resolves fewer relations than V1 — it drops
     * the caller-scoped `emailDrafts` / `emailReads` and the `conversation`. Neither
     * was part of this method's declared `Ticket` result, so the typed surface is
     * unchanged; read email state through `sdk.email` instead.
     */
    getDetail: op('supportTickets.getDetail', 'query'),
    /**
     * Desk tickets across the user's email channels.
     */
    listForEmailChannels: op('supportTickets.listForEmailChannels', 'query'),
};
