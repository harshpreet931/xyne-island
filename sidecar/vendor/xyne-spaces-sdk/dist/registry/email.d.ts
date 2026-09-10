/**
 * Email Operation Registry
 *
 * The support-desk email surface: drafts, signatures, read state, per-channel
 * configuration, and conversation labels.
 *
 * Drafts come in two shapes that share a table. A *reply* draft belongs to a
 * conversation and is keyed by it — hence `deleteDraft` taking a conversation
 * id rather than a draft id. A *compose* draft has no conversation yet and
 * carries its own subject and recipients.
 *
 * Sending mail is not in this catalog; these operations manage what surrounds it.
 */
import type { ConversationLabel, ConversationLabelMapping, Email, EmailChannelPreference, EmailDraft, EmailReadMarker, EmailSignature } from '../types/index.js';
/** Page cursor for sent mail, ordered by creation. */
export interface EmailCursor {
    id: string;
    createdAt: number;
}
/** Page cursor for drafts, ordered by last edit. */
export interface EmailDraftCursor {
    id: string;
    updatedAt: number;
}
export declare const emailOperations: {
    /**
     * Emails on several conversations at once.
     *
     * V2 takes `channelId` and `isMember`, which it forwards to the table ACL for
     * channel-membership gating rather than gating inside the query body. Same result
     * shape; the channel is now required.
     */
    readonly listForConversations: import("./types.js").SdkOperation<{
        conversationIds: string[];
        channelId: string;
        isMember?: boolean;
    }, Email[]>;
    /**
     * Mail the current user has sent from a channel.
     */
    readonly listSent: import("./types.js").SdkOperation<{
        channelId: string;
        limit?: number;
        start?: EmailCursor;
        scope?: string;
    }, Email[]>;
    /**
     * The current user's drafts in a channel.
     */
    readonly listDrafts: import("./types.js").SdkOperation<{
        channelId: string;
        limit?: number;
        start?: EmailDraftCursor;
    }, EmailDraft[]>;
    /**
     * The reply draft on one conversation, if any.
     *
     * V2 adds `channelId` / `isMember` for ACL membership gating. Same result shape.
     *
     * The query returns a **list** — it has no `.one()` — ordered by `updatedAt`
     * descending, and there can legitimately be two rows (the caller's own draft and
     * a shared one with a null `userId`). The newest is the one to show, so
     * `mapResult` takes the first. While this was declared `EmailDraft | null` with
     * no mapping, callers received an array and every field read came back
     * `undefined`.
     */
    readonly getDraftForConversation: import("./types.js").SdkOperation<{
        conversationId: string;
        channelId: string;
        isMember?: boolean;
    }, EmailDraft | null>;
    /**
     * Compose drafts in a channel — those not yet tied to a conversation.
     */
    readonly listComposeDrafts: import("./types.js").SdkOperation<{
        channelId: string;
    }, EmailDraft[]>;
    /**
     * The current user's signatures.
     */
    readonly listSignatures: import("./types.js").SdkOperation<void, EmailSignature[]>;
    /**
     * A channel's desk configuration.
     *
     * At most one row exists per channel, but the query does not say `.one()`, so the
     * server sends a list. Unwrapped here rather than pushed onto callers.
     */
    readonly getChannelPreference: import("./types.js").SdkOperation<{
        channelId: string;
    }, EmailChannelPreference | null>;
    /**
     * Labels defined in a channel.
     *
     * `isMember` is required by the schema but unread by the query body — an ACL
     * hint, supplied here so a caller does not have to know about it.
     */
    readonly listLabels: import("./types.js").SdkOperation<{
        channelId: string;
    }, ConversationLabel[]>;
    /**
     * Conversations carrying a given label.
     */
    readonly listConversationsByLabel: import("./types.js").SdkOperation<{
        labelId: string;
    }, ConversationLabelMapping[]>;
    /**
     * Create or replace the reply draft on a conversation.
     */
    readonly saveDraft: import("./types.js").SdkOperation<{
        id: string;
        conversationId: string;
        channelId: string;
        draftContent?: string;
        toRecipients?: string[];
        ccRecipients?: string[];
        bccRecipients?: string[];
        attachmentIds?: string[];
    }, void>;
    /**
     * Discard a conversation's reply draft. Keyed by conversation, not draft id.
     */
    readonly deleteDraft: import("./types.js").SdkOperation<{
        conversationId: string;
    }, void>;
    /**
     * Create or replace a compose draft.
     */
    readonly saveComposeDraft: import("./types.js").SdkOperation<{
        id: string;
        channelId: string;
        subject?: string;
        fromAddress?: string;
        draftContent?: string;
        toRecipients?: string[];
        ccRecipients?: string[];
        bccRecipients?: string[];
        attachmentIds?: string[];
    }, void>;
    /**
     * Discard a compose draft.
     */
    readonly deleteComposeDraft: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Mark a desk ticket's mail read up to a given email.
     */
    readonly markAsRead: import("./types.js").SdkOperation<{
        id: string;
        ticketId: string;
        lastReadEmailId: string;
    }, void>;
    /**
     * Mark several tickets read at once.
     */
    readonly bulkMarkAsRead: import("./types.js").SdkOperation<{
        items: EmailReadMarker[];
    }, void>;
    /**
     * Mark several tickets unread.
     */
    readonly bulkMarkAsUnread: import("./types.js").SdkOperation<{
        ticketIds: string[];
    }, void>;
    /**
     * Create a signature.
     */
    readonly createSignature: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        content: string;
    }, void>;
    /**
     * Update a signature.
     */
    readonly updateSignature: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        content: string;
    }, void>;
    /**
     * Delete a signature.
     */
    readonly deleteSignature: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Make a signature the default for new mail.
     */
    readonly setDefaultSignature: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Update a channel's desk configuration.
     */
    readonly setChannelPreference: import("./types.js").SdkOperation<{
        channelId: string;
        ownerUserId?: string;
        assigneeUserGroupId?: string;
        sendAsEmail?: boolean;
        defaultCc?: string[];
        emailMergeMode?: string;
        twoStepSendEnabled?: boolean;
        autoDraftMode?: string;
        autoDraftAgentSlug?: string;
        metricsEnabled?: boolean;
    }, void>;
    /**
     * Configure AI categorisation of incoming mail.
     */
    readonly setClassificationConfig: import("./types.js").SdkOperation<{
        channelId: string;
        classificationEnabled: boolean;
        classificationPrompt: string;
        categoryField: string;
        subCategoryField?: string;
    }, void>;
    /**
     * Configure AI priority scoring of incoming mail.
     */
    readonly setPriorityClassificationConfig: import("./types.js").SdkOperation<{
        channelId: string;
        priorityClassificationEnabled: boolean;
        priorityClassificationPrompt?: string;
        priorityClassificationThreshold?: number;
    }, void>;
    /**
     * Create a label in a channel.
     */
    readonly createLabel: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        channelId: string;
        color?: string;
    }, void>;
    /**
     * Apply a label to a conversation.
     */
    readonly applyLabel: import("./types.js").SdkOperation<{
        mappingId: string;
        labelId: string;
        labelName: string;
        conversationId: string;
        channelId: string;
        color?: string;
    }, void>;
    /**
     * Remove the label from a conversation.
     */
    readonly removeLabel: import("./types.js").SdkOperation<{
        conversationId: string;
        labelId: string;
    }, void>;
};
