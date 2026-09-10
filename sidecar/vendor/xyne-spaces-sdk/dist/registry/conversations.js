/**
 * Conversations Operation Registry
 *
 * A conversation is a thread: it owns an initial message and its replies. Most
 * channel reads go through this registry rather than the channel one, because
 * the channel surface is a list of threads.
 *
 * Note the `isMember` argument on several queries. It is not a filter — it is a
 * hint that selects a cheaper ACL path when the caller is known to be a channel
 * member. Passing `true` when you are not a member is safe (the row-level ACL
 * still applies and you get nothing back), so it defaults to `true`.
 */
import { op, api } from './types.js';
import { appendFiles, appendOptional } from '../core/form-data.js';
export const conversationsOperations = {
    // ----- Direct API operations -----
    /**
     * Start a thread while uploading file bytes in the same request.
     */
    createWithAttachments: api('POST', (args) => `/api/sdk/v1/channels/${encodeURIComponent(args.channelId)}/conversations`, {
        mapArgs: (args) => {
            const form = new FormData();
            appendOptional(form, 'content', args.content);
            appendOptional(form, 'msgType', args.msgType);
            appendOptional(form, 'visibleTo', args.visibleTo);
            appendFiles(form, args.files, { includeThumbnails: true });
            return form;
        },
        mapResult: (raw) => {
            const result = raw;
            const messageId = result.initialMessage?.messageId ?? result.messageId;
            if (!messageId)
                throw new Error('Conversation response did not include a message id');
            return {
                conversationId: result.conversationId,
                messageId,
            };
        },
    }),
    // ----- Reads -----
    /**
     * Threads in a channel, newest activity first, paginated.
     */
    listByChannel: op('conversations.listByChannel', 'query'),
    /**
     * The most recent threads in a channel, without paging.
     */
    listLatestByChannel: op('conversations.listLatestByChannel', 'query'),
    /**
     * One thread by id.
     */
    get: op('conversations.get', 'query'),
    /**
     * A thread plus its channel, for rendering a thread view cold.
     */
    getWithChannel: op('conversations.getWithChannel', 'query'),
    /**
     * A thread with its replies resolved.
     */
    getThread: op('conversations.getThread', 'query'),
    /**
     * The thread attached to a call.
     */
    getByCallId: op('conversations.getByCallId', 'query'),
    /**
     * The **caller's own** participation in a thread, including subscription state.
     *
     * Despite the query's name, this is one row, not a list: it filters on
     * `ctx.userID` and ends in `.one()`. The catalog has no query that returns every
     * participant of a thread. This was declared `ConversationParticipant[]`, so a
     * caller iterating the result got a `TypeError` on a plain object.
     */
    getMyParticipation: op('conversations.getMyParticipation', 'query'),
    /**
     * Pinned threads in a channel.
     */
    listPinned: op('conversations.listPinned', 'query'),
    /**
     * The single most recent thread in a channel.
     */
    getLatest: op('conversations.getLatest', 'query'),
    /**
     * Labels defined for a channel.
     *
     * `isMember` is required by the schema but unread by the query body — it is
     * a hint to Zero's ACL layer, and is supplied here so a caller does not have
     * to know that.
     */
    listLabels: op('conversations.listLabels', 'query'),
    /**
     * Labels applied to a thread.
     *
     * The V2 query takes the owning `channelId` as well, for the same ACL reason
     * as {@link listLabels}, so callers must now pass it.
     */
    listAppliedLabels: op('conversations.listAppliedLabels', 'query'),
    // ----- Writes -----
    /**
     * Start a new thread in a channel by posting its first message.
     *
     * Both the thread id and the message id are supplied by the caller so the
     * resource method can return them.
     */
    create: op('conversations.create', 'mutator'),
    /**
     * Pin or unpin a thread. Toggles; there is no explicit target state.
     */
    togglePin: op('conversations.togglePin', 'mutator'),
    /**
     * Forward a message into another channel as a new thread.
     */
    forwardMessage: op('conversations.forwardMessage', 'mutator'),
    /**
     * Subscribe to a thread's replies.
     */
    subscribe: op('conversations.subscribe', 'mutator'),
    /**
     * Unsubscribe from a thread.
     */
    unsubscribe: op('conversations.unsubscribe', 'mutator'),
    /**
     * Mark a thread unread starting at a given message.
     */
    markUnreadFrom: op('conversations.markUnreadFrom', 'mutator'),
    /**
     * The thread nearest a point in time — used to jump to a date in a channel.
     */
    getByTimestamp: op('conversations.getByTimestamp', 'query'),
    /**
     * Threads a user takes part in across every channel, most recent reply first.
     */
    listForUser: op('conversations.listForUser', 'query'),
    /**
     * Set the tag types on a thread. Free-form: projects define their own beyond
     * the built-in vocabulary.
     */
    setTagTypes: op('conversations.setTagTypes', 'mutator'),
};
