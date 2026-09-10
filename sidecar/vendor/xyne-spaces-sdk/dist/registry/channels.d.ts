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
import type { Channel, ChannelAddUserPolicy, ChannelParticipant, ChannelRole, ChannelSection, ChannelStats, ChannelUserStatus, CheckDuplicateChannelResponse, CreateChannelInput, Link } from '../types/index.js';
export declare const channelsOperations: {
    /**
     * Create a channel and its associated server-owned rows atomically.
     */
    readonly create: import("./types.js").ApiOperation<CreateChannelInput, {
        id: string;
    }>;
    /**
     * Check channel-name uniqueness before presenting a create action.
     */
    readonly checkDuplicate: import("./types.js").ApiOperation<{
        name: string;
        projectId: string;
    }, CheckDuplicateChannelResponse>;
    /**
     * Channels visible to the current user, with channel and stats relations.
     */
    readonly list: import("./types.js").SdkOperation<void, ChannelUserStatus[]>;
    /**
     * Every channel the user belongs to, including closed ones.
     */
    readonly listAll: import("./types.js").SdkOperation<{
        updatedAt?: number;
    } | undefined, Channel[]>;
    /**
     * Email-type channels only (the support desk surface).
     */
    readonly listEmail: import("./types.js").SdkOperation<void, ChannelUserStatus[]>;
    /**
     * Public channels the user could join but has not.
     */
    readonly listBrowsable: import("./types.js").SdkOperation<void, Channel[]>;
    /**
     * Message and participant counts for one channel.
     */
    readonly getStats: import("./types.js").SdkOperation<{
        channelId: string;
    }, ChannelStats | null>;
    /**
     * The current user's read state for one channel.
     */
    readonly getUserStatus: import("./types.js").SdkOperation<{
        channelId: string;
    }, ChannelUserStatus | null>;
    /**
     * Participants of a channel.
     */
    readonly listParticipants: import("./types.js").SdkOperation<{
        channelId: string;
    }, ChannelParticipant[]>;
    /**
     * Participants matching a search term.
     */
    readonly searchParticipants: import("./types.js").SdkOperation<{
        channelId: string;
        searchQuery: string;
    }, ChannelParticipant[]>;
    /**
     * The current user's participation across several channels at once.
     */
    readonly getMyParticipations: import("./types.js").SdkOperation<{
        channelIds: string[];
    }, ChannelParticipant[]>;
    /**
     * Links shared in a channel.
     */
    readonly listLinks: import("./types.js").SdkOperation<{
        channelId: string;
    }, Link[]>;
    /**
     * The current user's sidebar sections.
     */
    readonly listSections: import("./types.js").SdkOperation<void, ChannelSection[]>;
    /**
     * Join a public channel.
     */
    readonly join: import("./types.js").SdkOperation<{
        channelId: string;
    }, void>;
    /**
     * Leave a channel.
     */
    readonly leave: import("./types.js").SdkOperation<{
        channelId: string;
    }, void>;
    /**
     * Add users to a channel.
     *
     * The mutator wants a participant id and a user-status id per user, keyed by
     * user id; both maps are generated here.
     */
    readonly addParticipants: import("./types.js").SdkOperation<{
        channelId: string;
        userIds: string[];
    }, void>;
    /**
     * Remove a user from a channel.
     */
    readonly removeParticipant: import("./types.js").SdkOperation<{
        channelId: string;
        userId: string;
    }, void>;
    /**
     * Change a participant's role. Posts a system message into the channel, hence
     * the generated conversation/message ids.
     */
    readonly updateParticipantRole: import("./types.js").SdkOperation<{
        channelId: string;
        userId: string;
        role: ChannelRole;
    }, void>;
    /**
     * Rename a channel.
     */
    readonly rename: import("./types.js").SdkOperation<{
        channelId: string;
        name: string;
    }, void>;
    /**
     * Set a channel's description. Also posts a system message.
     */
    readonly updateDescription: import("./types.js").SdkOperation<{
        channelId: string;
        description: string;
    }, void>;
    /**
     * Archive a channel.
     */
    readonly archive: import("./types.js").SdkOperation<{
        channelId: string;
    }, void>;
    /**
     * Restore an archived channel.
     */
    readonly unarchive: import("./types.js").SdkOperation<{
        channelId: string;
    }, void>;
    /**
     * Convert a private channel to public. Not reversible through this API.
     */
    readonly makePublic: import("./types.js").SdkOperation<{
        channelId: string;
    }, void>;
    /**
     * Star or unstar a channel. The mutator toggles; there is no explicit target
     * state.
     */
    readonly toggleStarred: import("./types.js").SdkOperation<{
        channelId: string;
    }, void>;
    /**
     * Mark a channel as read up to now, optionally preserving an unsent draft.
     */
    readonly markAsViewed: import("./types.js").SdkOperation<{
        channelId: string;
        conversationId?: string;
        draftMessage?: string;
    }, void>;
    /**
     * Move a channel into a sidebar section. Pass `sectionId: null` to ungroup.
     */
    readonly moveToSection: import("./types.js").SdkOperation<{
        channelId: string;
        sectionId: string | null;
        position: string;
    }, void>;
    /**
     * Create a sidebar section.
     *
     * Takes the new row's `id` rather than generating it here: mutators return
     * nothing, so the id has to be minted by the caller (the resource method) for
     * it to be returned to the user.
     */
    readonly createSection: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        position: string;
        emoji?: string | null;
    }, void>;
    /**
     * Update a sidebar section.
     */
    readonly updateSection: import("./types.js").SdkOperation<{
        id: string;
        name?: string;
        emoji?: string | null;
        isCollapsed?: boolean;
        position?: string;
    }, void>;
    /**
     * Delete a sidebar section.
     */
    readonly removeSection: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Close a DM, hiding it from the sidebar without losing history.
     */
    readonly closeDm: import("./types.js").SdkOperation<{
        channelId: string;
    }, void>;
    /**
     * Reopen a closed DM.
     */
    readonly reopenDm: import("./types.js").SdkOperation<{
        channelId: string;
    }, void>;
    /**
     * Turn a group DM into a named channel. Posts a system message announcing it.
     */
    readonly promoteToChannel: import("./types.js").SdkOperation<{
        channelId: string;
        name: string;
        projectId: string;
        visibility: "PUBLIC" | "PRIVATE";
        description?: string;
    }, void>;
    /**
     * Mark a channel unread starting at a given message.
     */
    readonly markUnreadFrom: import("./types.js").SdkOperation<{
        channelId: string;
        messageId: string;
        conversationId?: string;
    }, void>;
    /**
     * Set who may add people to the channel.
     */
    readonly setAddUserPolicy: import("./types.js").SdkOperation<{
        channelId: string;
        policy: ChannelAddUserPolicy;
    }, void>;
    /**
     * Set the prompt used to summarise calls held in this channel.
     */
    readonly setCallSummaryPrompt: import("./types.js").SdkOperation<{
        channelId: string;
        prompt: string;
    }, void>;
    /**
     * Pin a board to the channel's tickets tab.
     */
    readonly setSelectedBoard: import("./types.js").SdkOperation<{
        channelId: string;
        boardId: string | null;
    }, void>;
    /**
     * Show or hide ticket activity inline in the channel.
     */
    readonly setShowTicketsInChat: import("./types.js").SdkOperation<{
        channelId: string;
        show: boolean;
    }, void>;
    /**
     * Stats for several channels at once.
     */
    readonly getStatsForChannels: import("./types.js").SdkOperation<{
        channelIds: string[];
    }, ChannelStats[]>;
    /**
     * Participants of a channel, a page at a time.
     */
    readonly listParticipantsPaginated: import("./types.js").SdkOperation<{
        channelId: string;
        limit?: number;
        start?: {
            role: string;
            userId: string;
        };
    }, ChannelParticipant[]>;
    /**
     * Every user's status row for one channel — who has it open, muted, starred.
     */
    readonly listUserStatuses: import("./types.js").SdkOperation<{
        channelId: string;
    }, ChannelUserStatus[]>;
    /**
     * Channels the current user has an active conversation in.
     */
    readonly listWithMyConversations: import("./types.js").SdkOperation<void, Channel[]>;
};
