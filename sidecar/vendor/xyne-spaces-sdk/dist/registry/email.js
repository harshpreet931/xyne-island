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
import { op, firstOrNull } from './types.js';
export const emailOperations = {
    // ----- Reads -----
    /**
     * Emails on several conversations at once.
     *
     * V2 takes `channelId` and `isMember`, which it forwards to the table ACL for
     * channel-membership gating rather than gating inside the query body. Same result
     * shape; the channel is now required.
     */
    listForConversations: op('email.listForConversations', 'query'),
    /**
     * Mail the current user has sent from a channel.
     */
    listSent: op('email.listSent', 'query'),
    /**
     * The current user's drafts in a channel.
     */
    listDrafts: op('email.listDrafts', 'query'),
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
    getDraftForConversation: op('email.getDraftForConversation', 'query', {
        mapResult: (raw) => firstOrNull(raw),
    }),
    /**
     * Compose drafts in a channel — those not yet tied to a conversation.
     */
    listComposeDrafts: op('email.listComposeDrafts', 'query'),
    /**
     * The current user's signatures.
     */
    listSignatures: op('email.listSignatures', 'query'),
    /**
     * A channel's desk configuration.
     *
     * At most one row exists per channel, but the query does not say `.one()`, so the
     * server sends a list. Unwrapped here rather than pushed onto callers.
     */
    getChannelPreference: op('email.getChannelPreference', 'query', {
        mapResult: (raw) => firstOrNull(raw),
    }),
    /**
     * Labels defined in a channel.
     *
     * `isMember` is required by the schema but unread by the query body — an ACL
     * hint, supplied here so a caller does not have to know about it.
     */
    listLabels: op('email.listLabels', 'query'),
    /**
     * Conversations carrying a given label.
     */
    listConversationsByLabel: op('email.listConversationsByLabel', 'query'),
    // ----- Drafts -----
    /**
     * Create or replace the reply draft on a conversation.
     */
    saveDraft: op('email.saveDraft', 'mutator'),
    /**
     * Discard a conversation's reply draft. Keyed by conversation, not draft id.
     */
    deleteDraft: op('email.deleteDraft', 'mutator'),
    /**
     * Create or replace a compose draft.
     */
    saveComposeDraft: op('email.saveComposeDraft', 'mutator'),
    /**
     * Discard a compose draft.
     */
    deleteComposeDraft: op('email.deleteComposeDraft', 'mutator'),
    // ----- Read state -----
    /**
     * Mark a desk ticket's mail read up to a given email.
     */
    markAsRead: op('email.markAsRead', 'mutator'),
    /**
     * Mark several tickets read at once.
     */
    bulkMarkAsRead: op('email.bulkMarkAsRead', 'mutator'),
    /**
     * Mark several tickets unread.
     */
    bulkMarkAsUnread: op('email.bulkMarkAsUnread', 'mutator'),
    // ----- Signatures -----
    /**
     * Create a signature.
     */
    createSignature: op('email.createSignature', 'mutator'),
    /**
     * Update a signature.
     */
    updateSignature: op('email.updateSignature', 'mutator'),
    /**
     * Delete a signature.
     */
    deleteSignature: op('email.deleteSignature', 'mutator'),
    /**
     * Make a signature the default for new mail.
     */
    setDefaultSignature: op('email.setDefaultSignature', 'mutator'),
    // ----- Channel configuration -----
    /**
     * Update a channel's desk configuration.
     */
    setChannelPreference: op('email.setChannelPreference', 'mutator'),
    /**
     * Configure AI categorisation of incoming mail.
     */
    setClassificationConfig: op('email.setClassificationConfig', 'mutator'),
    /**
     * Configure AI priority scoring of incoming mail.
     */
    setPriorityClassificationConfig: op('email.setPriorityClassificationConfig', 'mutator'),
    // ----- Labels -----
    /**
     * Create a label in a channel.
     */
    createLabel: op('email.createLabel', 'mutator'),
    /**
     * Apply a label to a conversation.
     */
    applyLabel: op('email.applyLabel', 'mutator'),
    /**
     * Remove the label from a conversation.
     */
    removeLabel: op('email.removeLabel', 'mutator'),
};
