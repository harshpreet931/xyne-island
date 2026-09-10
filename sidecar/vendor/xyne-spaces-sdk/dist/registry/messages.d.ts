/**
 * Messages Operation Registry
 *
 * Individual messages within a thread, plus the two deferred-send surfaces:
 * drafts (saved, sent manually) and delayed messages (scheduled for a time).
 *
 * To start a *new* thread use `sdk.conversations.create` — `messages.send` here
 * replies into an existing one.
 */
import type { DelayedMessage, DelayedMessageStatus, DraftMessage, Message, MessageAttachment, MessageType, Nudge, NudgeState } from '../types/index.js';
/** Page cursor for the user's sent-message history. */
export interface MessageCursor {
    messageId: string;
    createdAt: number;
}
export declare const messagesOperations: {
    /**
     * All messages in a thread, oldest first.
     */
    readonly listByConversation: import("./types.js").SdkOperation<{
        conversationId: string;
    }, Message[]>;
    /**
     * Messages by id.
     */
    readonly getMany: import("./types.js").SdkOperation<{
        messageIds: string[];
    }, Message[]>;
    /**
     * One message with the context an activity entry needs to render.
     */
    readonly get: import("./types.js").SdkOperation<{
        messageId: string;
    }, Message | null>;
    /**
     * Top-level channel messages together with thread replies promoted into the
     * channel via "also send to channel".
     */
    readonly listByChannel: import("./types.js").SdkOperation<{
        channelId: string;
    }, Message[]>;
    /**
     * The current user's own sent messages, newest first.
     */
    readonly listMine: import("./types.js").SdkOperation<{
        limit?: number;
        start?: MessageCursor;
    }, Message[]>;
    /**
     * Messages authored by a given user, newest first (via Vespa search).
     *
     * Uses Vespa search under the hood, similar to cmd+k's `from:@xyz` filter.
     * Results are ordered by newest first. Uses offset-based pagination.
     */
    readonly listByUser: import("./types.js").ApiOperation<{
        userId: string;
        limit?: number;
        offset?: number;
        /** Inclusive epoch-ms lower bound. */
        after?: number;
        /** Inclusive epoch-ms upper bound. */
        before?: number;
    }, Message[]>;
    /**
     * The latest message in a channel.
     */
    readonly getLatestInChannel: import("./types.js").SdkOperation<{
        channelId: string;
    }, Message | null>;
    /**
     * Nudges attached to a message.
     */
    readonly listNudges: import("./types.js").SdkOperation<{
        messageId: string;
        states?: NudgeState[];
    }, Nudge[]>;
    /**
     * Reply into an existing thread.
     *
     * `showInChannel` also surfaces the reply in the parent channel; when set, the
     * mutator needs a child conversation id, which is generated here.
     */
    readonly send: import("./types.js").SdkOperation<{
        messageId: string;
        conversationId: string;
        content: string;
        type?: MessageType;
        showInChannel?: boolean;
        attachmentIds?: string[];
    }, void>;
    /**
     * Edit a message's content.
     */
    readonly update: import("./types.js").SdkOperation<{
        messageId: string;
        content: string;
    }, void>;
    /**
     * Delete a message.
     */
    readonly delete: import("./types.js").SdkOperation<{
        messageId: string;
    }, void>;
    /**
     * Add or remove an emoji reaction.
     */
    readonly react: import("./types.js").SdkOperation<{
        messageId: string;
        emojiName: string;
        action: "add" | "remove";
    }, void>;
    /**
     * Show or hide a thread reply in its parent channel.
     */
    readonly setShowInChannel: import("./types.js").SdkOperation<{
        messageId: string;
        showInChannel: boolean;
    }, void>;
    /**
     * Close the incident artifact attached to a slash-command message.
     *
     * Only the message's author may close it, and only while the artifact is
     * still ACTIVE — a second call is refused. `timestamp` is stamped here and
     * is what the closed artifact records as its close time.
     */
    readonly closeSlashCommandArtifact: import("./types.js").SdkOperation<{
        messageId: string;
    }, void>;
    /**
     * Remove an attachment from a message.
     */
    readonly deleteAttachment: import("./types.js").SdkOperation<{
        attachmentId: string;
    }, void>;
    /**
     * Remove several attachments at once.
     */
    readonly deleteAttachments: import("./types.js").SdkOperation<{
        attachmentIds: string[];
    }, void>;
    /**
     * The current user's saved drafts.
     */
    readonly listDrafts: import("./types.js").SdkOperation<{
        limit?: number;
    }, DraftMessage[]>;
    /**
     * Edit a draft's content.
     */
    readonly editDraft: import("./types.js").SdkOperation<{
        id: string;
        content: string;
    }, void>;
    /**
     * Send a saved draft now.
     */
    readonly sendDraft: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Discard a draft.
     */
    readonly deleteDraft: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * The current user's scheduled messages.
     */
    readonly listScheduled: import("./types.js").SdkOperation<void, DelayedMessage[]>;
    /**
     * Schedule a message for a future time.
     */
    readonly schedule: import("./types.js").SdkOperation<{
        id: string;
        channelId: string;
        content: string;
        scheduledFor: number;
        conversationId?: string;
    }, void>;
    /**
     * Cancel a scheduled message.
     */
    readonly cancelScheduled: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Change when a scheduled message will send.
     */
    readonly reschedule: import("./types.js").SdkOperation<{
        id: string;
        scheduledFor: number;
    }, void>;
    /**
     * Edit a scheduled message's content.
     */
    readonly editScheduled: import("./types.js").SdkOperation<{
        id: string;
        content: string;
    }, void>;
    /**
     * Send a scheduled message immediately.
     */
    readonly sendScheduledNow: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Turn a scheduled message back into an editable draft.
     */
    readonly scheduledToDraft: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Attachments by id.
     */
    readonly getAttachments: import("./types.js").SdkOperation<{
        attachmentIds: string[];
    }, MessageAttachment[]>;
    /**
     * Attachments on the message that started a thread.
     */
    readonly listAttachmentsForThread: import("./types.js").SdkOperation<{
        initialMessageId: string;
    }, MessageAttachment[]>;
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
    readonly listChannelAttachments: import("./types.js").SdkOperation<{
        channelId: string;
        limit?: number;
        start?: {
            attachementId: string;
            createdAt: number;
        };
        direction?: "forward" | "backward";
    }, MessageAttachment[]>;
    /**
     * Scheduled messages, a page at a time, optionally filtered by status.
     */
    readonly listScheduledPaginated: import("./types.js").SdkOperation<{
        limit?: number;
        statuses?: DelayedMessageStatus[];
        start?: {
            id: string;
            scheduledFor: number;
        };
    }, DelayedMessage[]>;
    /**
     * Attach files to a draft.
     */
    readonly addDraftAttachments: import("./types.js").SdkOperation<{
        draftMessageId: string;
        channelId: string;
        attachments: Array<{
            attachmentId: string;
            originalFilename: string;
            mimetype: string;
            size: number;
            width?: number;
            height?: number;
        }>;
        conversationId?: string;
    }, void>;
    /**
     * Clear a channel or thread draft's content.
     */
    readonly clearDraft: import("./types.js").SdkOperation<{
        channelId: string;
        conversationId?: string;
    }, void>;
    /**
     * Resolve a mention of someone who is not in the channel: add them, add
     * everyone mentioned, or ignore.
     */
    readonly handleNonParticipants: import("./types.js").SdkOperation<{
        messageId: string;
        channelId: string;
        userIds: string[];
        action: "add" | "add_all" | "ignore" | "ignore_all";
    }, void>;
};
