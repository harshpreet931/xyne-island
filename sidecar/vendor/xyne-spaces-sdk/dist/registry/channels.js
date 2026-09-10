/**
 * Channels Operation Registry
 *
 * Maps SDK channel methods to backend operations.
 *
 * Several mutators here expect the caller to supply row ids and a timestamp —
 * `channelParticipantId`, `channelUserStatusId`, per-user id maps, and the
 * system-message ids that operations like rename and role change post into the
 * channel. Those come from Zero's optimistic-write model and are generated in
 * `mapArgs` so SDK callers never see them.
 */
import { op, api } from './types.js';
export const channelsOperations = {
    // ----- Direct API operations -----
    /**
     * Create a channel and its associated server-owned rows atomically.
     */
    create: api('POST', '/api/sdk/v1/channels', {
        mapResult: (raw) => {
            const result = raw;
            return { id: result.channelId ?? result.id };
        },
    }),
    /**
     * Check channel-name uniqueness before presenting a create action.
     */
    checkDuplicate: api('POST', '/api/sdk/v1/channels/check-duplicate'),
    // ----- Reads -----
    /**
     * Channels visible to the current user, with channel and stats relations.
     */
    list: op('channels.list', 'query'),
    /**
     * Every channel the user belongs to, including closed ones.
     */
    listAll: op('channels.listAll', 'query'),
    /**
     * Email-type channels only (the support desk surface).
     */
    listEmail: op('channels.listEmail', 'query'),
    /**
     * Public channels the user could join but has not.
     */
    listBrowsable: op('channels.listBrowsable', 'query'),
    /**
     * Message and participant counts for one channel.
     */
    getStats: op('channels.getStats', 'query'),
    /**
     * The current user's read state for one channel.
     */
    getUserStatus: op('channels.getUserStatus', 'query'),
    /**
     * Participants of a channel.
     */
    listParticipants: op('channels.listParticipants', 'query'),
    /**
     * Participants matching a search term.
     */
    searchParticipants: op('channels.searchParticipants', 'query'),
    /**
     * The current user's participation across several channels at once.
     */
    getMyParticipations: op('channels.getMyParticipations', 'query'),
    /**
     * Links shared in a channel.
     */
    listLinks: op('channels.listLinks', 'query'),
    /**
     * The current user's sidebar sections.
     */
    listSections: op('channels.listSections', 'query'),
    // ----- Writes -----
    /**
     * Join a public channel.
     */
    join: op('channels.join', 'mutator'),
    /**
     * Leave a channel.
     */
    leave: op('channels.leave', 'mutator'),
    /**
     * Add users to a channel.
     *
     * The mutator wants a participant id and a user-status id per user, keyed by
     * user id; both maps are generated here.
     */
    addParticipants: op('channels.addParticipants', 'mutator'),
    /**
     * Remove a user from a channel.
     */
    removeParticipant: op('channels.removeParticipant', 'mutator'),
    /**
     * Change a participant's role. Posts a system message into the channel, hence
     * the generated conversation/message ids.
     */
    updateParticipantRole: op('channels.updateParticipantRole', 'mutator'),
    /**
     * Rename a channel.
     */
    rename: op('channels.rename', 'mutator'),
    /**
     * Set a channel's description. Also posts a system message.
     */
    updateDescription: op('channels.updateDescription', 'mutator'),
    /**
     * Archive a channel.
     */
    archive: op('channels.archive', 'mutator'),
    /**
     * Restore an archived channel.
     */
    unarchive: op('channels.unarchive', 'mutator'),
    /**
     * Convert a private channel to public. Not reversible through this API.
     */
    makePublic: op('channels.makePublic', 'mutator'),
    /**
     * Star or unstar a channel. The mutator toggles; there is no explicit target
     * state.
     */
    toggleStarred: op('channels.toggleStarred', 'mutator'),
    /**
     * Mark a channel as read up to now, optionally preserving an unsent draft.
     */
    markAsViewed: op('channels.markAsViewed', 'mutator'),
    /**
     * Move a channel into a sidebar section. Pass `sectionId: null` to ungroup.
     */
    moveToSection: op('channels.moveToSection', 'mutator'),
    // ----- Sections -----
    /**
     * Create a sidebar section.
     *
     * Takes the new row's `id` rather than generating it here: mutators return
     * nothing, so the id has to be minted by the caller (the resource method) for
     * it to be returned to the user.
     */
    createSection: op('channels.createSection', 'mutator'),
    /**
     * Update a sidebar section.
     */
    updateSection: op('channels.updateSection', 'mutator'),
    /**
     * Delete a sidebar section.
     */
    removeSection: op('channels.removeSection', 'mutator'),
    /**
     * Close a DM, hiding it from the sidebar without losing history.
     */
    closeDm: op('channels.closeDm', 'mutator'),
    /**
     * Reopen a closed DM.
     */
    reopenDm: op('channels.reopenDm', 'mutator'),
    /**
     * Turn a group DM into a named channel. Posts a system message announcing it.
     */
    promoteToChannel: op('channels.promoteToChannel', 'mutator'),
    /**
     * Mark a channel unread starting at a given message.
     */
    markUnreadFrom: op('channels.markUnreadFrom', 'mutator'),
    /**
     * Set who may add people to the channel.
     */
    setAddUserPolicy: op('channels.setAddUserPolicy', 'mutator'),
    /**
     * Set the prompt used to summarise calls held in this channel.
     */
    setCallSummaryPrompt: op('channels.setCallSummaryPrompt', 'mutator'),
    /**
     * Pin a board to the channel's tickets tab.
     */
    setSelectedBoard: op('channels.setSelectedBoard', 'mutator'),
    /**
     * Show or hide ticket activity inline in the channel.
     */
    setShowTicketsInChat: op('channels.setShowTicketsInChat', 'mutator'),
    /**
     * Stats for several channels at once.
     */
    getStatsForChannels: op('channels.getStatsForChannels', 'query'),
    /**
     * Participants of a channel, a page at a time.
     */
    listParticipantsPaginated: op('channels.listParticipantsPaginated', 'query'),
    /**
     * Every user's status row for one channel — who has it open, muted, starred.
     */
    listUserStatuses: op('channels.listUserStatuses', 'query'),
    /**
     * Channels the current user has an active conversation in.
     */
    listWithMyConversations: op('channels.listWithMyConversations', 'query'),
};
