/**
 * Messages Operation Registry
 *
 * Individual messages within a thread, plus the two deferred-send surfaces:
 * drafts (saved, sent manually) and delayed messages (scheduled for a time).
 *
 * To start a *new* thread use `sdk.conversations.create` — `messages.send` here
 * replies into an existing one.
 */
import { op, api } from './types.js';
export const messagesOperations = {
    // ----- Reads -----
    /**
     * All messages in a thread, oldest first.
     */
    listByConversation: op('messages.listByConversation', 'query'),
    /**
     * Messages by id.
     */
    getMany: op('messages.getMany', 'query'),
    /**
     * One message with the context an activity entry needs to render.
     */
    get: op('messages.get', 'query'),
    /**
     * Top-level channel messages together with thread replies promoted into the
     * channel via "also send to channel".
     */
    listByChannel: op('messages.listByChannel', 'query'),
    /**
     * The current user's own sent messages, newest first.
     */
    listMine: op('messages.listMine', 'query'),
    /**
     * Messages authored by a given user, newest first (via Vespa search).
     *
     * Uses Vespa search under the hood, similar to cmd+k's `from:@xyz` filter.
     * Results are ordered by newest first. Uses offset-based pagination.
     */
    listByUser: api('GET', '/api/sdk/v1/search', {
        mapArgs: (args) => ({
            q: '', // Empty query for filter-only search
            from: args.userId,
            type: 'messages',
            orderBy: 'newest',
            limit: args.limit ?? 50,
            offset: args.offset ?? 0,
            // Convert epoch-ms to ISO date format for search
            ...(args.after !== undefined
                ? { after: new Date(args.after).toISOString().split('T')[0] }
                : {}),
            ...(args.before !== undefined
                ? { before: new Date(args.before).toISOString().split('T')[0] }
                : {}),
        }),
        mapResult: (raw) => {
            // The SDK search endpoint returns a different format than the standard search
            const response = raw;
            return response.results.map((r) => ({
                messageId: r.searchContext?.messageId ?? r.id,
                conversationId: r.searchContext?.conversationId ?? '',
                childConversationId: null,
                senderId: r.searchContext?.senderId ?? '',
                workspaceId: '',
                content: r.context ?? '',
                msgType: (r.searchContext?.msgType ?? 'USER'),
                hasAttachment: false,
                edited: false,
                isDeleted: false,
                showInChannel: false,
                visibleTo: null,
                isSent: true,
                nudgeCount: null,
                metadata: {},
                createdAt: r.searchContext?.createdAtTimestamp ?? 0,
            }));
        },
    }),
    /**
     * The latest message in a channel.
     */
    getLatestInChannel: op('messages.getLatestInChannel', 'query'),
    /**
     * Nudges attached to a message.
     */
    listNudges: op('messages.listNudges', 'query'),
    // ----- Writes -----
    /**
     * Reply into an existing thread.
     *
     * `showInChannel` also surfaces the reply in the parent channel; when set, the
     * mutator needs a child conversation id, which is generated here.
     */
    send: op('messages.send', 'mutator'),
    /**
     * Edit a message's content.
     */
    update: op('messages.update', 'mutator'),
    /**
     * Delete a message.
     */
    delete: op('messages.delete', 'mutator'),
    /**
     * Add or remove an emoji reaction.
     */
    react: op('messages.react', 'mutator'),
    /**
     * Show or hide a thread reply in its parent channel.
     */
    setShowInChannel: op('messages.setShowInChannel', 'mutator'),
    /**
     * Close the incident artifact attached to a slash-command message.
     *
     * Only the message's author may close it, and only while the artifact is
     * still ACTIVE — a second call is refused. `timestamp` is stamped here and
     * is what the closed artifact records as its close time.
     */
    closeSlashCommandArtifact: op('messages.closeSlashCommandArtifact', 'mutator'),
    /**
     * Remove an attachment from a message.
     */
    deleteAttachment: op('messages.deleteAttachment', 'mutator'),
    /**
     * Remove several attachments at once.
     */
    deleteAttachments: op('messages.deleteAttachments', 'mutator'),
    // ----- Drafts -----
    /**
     * The current user's saved drafts.
     */
    listDrafts: op('messages.listDrafts', 'query'),
    /**
     * Edit a draft's content.
     */
    editDraft: op('messages.editDraft', 'mutator'),
    /**
     * Send a saved draft now.
     */
    sendDraft: op('messages.sendDraft', 'mutator'),
    /**
     * Discard a draft.
     */
    deleteDraft: op('messages.deleteDraft', 'mutator'),
    // ----- Delayed (scheduled) messages -----
    /**
     * The current user's scheduled messages.
     */
    listScheduled: op('messages.listScheduled', 'query'),
    /**
     * Schedule a message for a future time.
     */
    schedule: op('messages.schedule', 'mutator'),
    /**
     * Cancel a scheduled message.
     */
    cancelScheduled: op('messages.cancelScheduled', 'mutator'),
    /**
     * Change when a scheduled message will send.
     */
    reschedule: op('messages.reschedule', 'mutator'),
    /**
     * Edit a scheduled message's content.
     */
    editScheduled: op('messages.editScheduled', 'mutator'),
    /**
     * Send a scheduled message immediately.
     */
    sendScheduledNow: op('messages.sendScheduledNow', 'mutator'),
    /**
     * Turn a scheduled message back into an editable draft.
     */
    scheduledToDraft: op('messages.scheduledToDraft', 'mutator'),
    /**
     * Attachments by id.
     */
    getAttachments: op('messages.getAttachments', 'query'),
    /**
     * Attachments on the message that started a thread.
     */
    listAttachmentsForThread: op('messages.listAttachmentsForThread', 'query'),
    /**
     * Every attachment shared in a channel, newest first.
     *
     * V2 takes identical arguments; it moves channel-visibility gating out of the
     * query body and onto the table ACL, so this is a drop-in swap.
     *
     * `direction` is required server-side. It was previously never sent, which made
     * every call fail validation — the coverage gate only checks mutator arguments,
     * so nothing caught it.
     */
    listChannelAttachments: op('messages.listChannelAttachments', 'query'),
    /**
     * Scheduled messages, a page at a time, optionally filtered by status.
     */
    listScheduledPaginated: op('messages.listScheduledPaginated', 'query'),
    /**
     * Attach files to a draft.
     */
    addDraftAttachments: op('messages.addDraftAttachments', 'mutator'),
    /**
     * Clear a channel or thread draft's content.
     */
    clearDraft: op('messages.clearDraft', 'mutator'),
    /**
     * Resolve a mention of someone who is not in the channel: add them, add
     * everyone mentioned, or ignore.
     */
    handleNonParticipants: op('messages.handleNonParticipants', 'mutator'),
};
