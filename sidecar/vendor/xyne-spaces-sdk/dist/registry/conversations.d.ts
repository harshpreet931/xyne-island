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
import type { Conversation, ConversationLabel, ConversationLabelMapping, ConversationParticipant, CreateConversationWithAttachmentsInput, Message, MessageType } from '../types/index.js';
/** Page cursor for the paginated thread listings. */
export interface ConversationCursor {
    conversationId: string;
    lastActivityAt: number;
}
export declare const conversationsOperations: {
    /**
     * Start a thread while uploading file bytes in the same request.
     */
    readonly createWithAttachments: import("./types.js").ApiOperation<CreateConversationWithAttachmentsInput, {
        conversationId: string;
        messageId: string;
    }>;
    /**
     * Threads in a channel, newest activity first, paginated.
     */
    readonly listByChannel: import("./types.js").SdkOperation<{
        channelId: string;
        limit?: number;
        start?: ConversationCursor;
        isMember?: boolean;
        /** Page direction relative to `start`. Required server-side. */
        direction?: "forward" | "backward";
    }, Conversation[]>;
    /**
     * The most recent threads in a channel, without paging.
     */
    readonly listLatestByChannel: import("./types.js").SdkOperation<{
        channelId: string;
        limit?: number;
        isMember?: boolean;
    }, Conversation[]>;
    /**
     * One thread by id.
     */
    readonly get: import("./types.js").SdkOperation<{
        conversationId: string;
    }, Conversation | null>;
    /**
     * A thread plus its channel, for rendering a thread view cold.
     */
    readonly getWithChannel: import("./types.js").SdkOperation<{
        conversationId: string;
        channelId: string;
        isMember?: boolean;
    }, Conversation | null>;
    /**
     * A thread with its replies resolved.
     */
    readonly getThread: import("./types.js").SdkOperation<{
        conversationId: string;
        channelId?: string;
        isMember?: boolean;
    }, Conversation | null>;
    /**
     * The thread attached to a call.
     */
    readonly getByCallId: import("./types.js").SdkOperation<{
        callId: string;
    }, Conversation | null>;
    /**
     * The **caller's own** participation in a thread, including subscription state.
     *
     * Despite the query's name, this is one row, not a list: it filters on
     * `ctx.userID` and ends in `.one()`. The catalog has no query that returns every
     * participant of a thread. This was declared `ConversationParticipant[]`, so a
     * caller iterating the result got a `TypeError` on a plain object.
     */
    readonly getMyParticipation: import("./types.js").SdkOperation<{
        conversationId: string;
    }, ConversationParticipant | null>;
    /**
     * Pinned threads in a channel.
     */
    readonly listPinned: import("./types.js").SdkOperation<{
        channelId: string;
        isMember?: boolean;
    }, Conversation[]>;
    /**
     * The single most recent thread in a channel.
     */
    readonly getLatest: import("./types.js").SdkOperation<{
        channelId: string;
        isMember?: boolean;
    }, Conversation | null>;
    /**
     * Labels defined for a channel.
     *
     * `isMember` is required by the schema but unread by the query body — it is
     * a hint to Zero's ACL layer, and is supplied here so a caller does not have
     * to know that.
     */
    readonly listLabels: import("./types.js").SdkOperation<{
        channelId: string;
    }, ConversationLabel[]>;
    /**
     * Labels applied to a thread.
     *
     * The V2 query takes the owning `channelId` as well, for the same ACL reason
     * as {@link listLabels}, so callers must now pass it.
     */
    readonly listAppliedLabels: import("./types.js").SdkOperation<{
        conversationId: string;
        channelId: string;
    }, ConversationLabelMapping[]>;
    /**
     * Start a new thread in a channel by posting its first message.
     *
     * Both the thread id and the message id are supplied by the caller so the
     * resource method can return them.
     */
    readonly create: import("./types.js").SdkOperation<{
        conversationId: string;
        messageId: string;
        channelId: string;
        content: string;
        type?: MessageType;
        attachmentIds?: string[];
    }, void>;
    /**
     * Pin or unpin a thread. Toggles; there is no explicit target state.
     */
    readonly togglePin: import("./types.js").SdkOperation<{
        conversationId: string;
    }, void>;
    /**
     * Forward a message into another channel as a new thread.
     */
    readonly forwardMessage: import("./types.js").SdkOperation<{
        conversationId: string;
        messageId: string;
        targetChannelId: string;
        originalMessageId: string;
        optionalMessage?: string;
    }, void>;
    /**
     * Subscribe to a thread's replies.
     */
    readonly subscribe: import("./types.js").SdkOperation<{
        conversationId: string;
    }, void>;
    /**
     * Unsubscribe from a thread.
     */
    readonly unsubscribe: import("./types.js").SdkOperation<{
        conversationId: string;
    }, void>;
    /**
     * Mark a thread unread starting at a given message.
     */
    readonly markUnreadFrom: import("./types.js").SdkOperation<{
        conversationId: string;
        messageId: string;
    }, void>;
    /**
     * The thread nearest a point in time — used to jump to a date in a channel.
     */
    readonly getByTimestamp: import("./types.js").SdkOperation<{
        channelId: string;
        timestamp: number;
        isMember?: boolean;
    }, Conversation | null>;
    /**
     * Threads a user takes part in across every channel, most recent reply first.
     */
    readonly listForUser: import("./types.js").SdkOperation<{
        userId: string;
        limit?: number;
        start?: {
            lastReplyAt: number;
            id: string;
        };
    }, Conversation[]>;
    /**
     * Set the tag types on a thread. Free-form: projects define their own beyond
     * the built-in vocabulary.
     */
    readonly setTagTypes: import("./types.js").SdkOperation<{
        conversationId: string;
        types: string[];
        note?: string;
    }, void>;
};
export type { Message };
