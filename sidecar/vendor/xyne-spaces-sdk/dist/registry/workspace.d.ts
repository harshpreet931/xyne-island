/**
 * Workspace Operation Registry
 *
 * Shared workspace-level items that do not belong to a larger domain: shared
 * links, connected repositories, custom emoji, lookup values, merchants, and
 * the classification mappings that route categorised mail to a team.
 */
import type { Channel, LinkVisibility, ClassificationMapping, CustomEmoji, LookupType, LookupValue, Merchant, Repo, SdlcTrack, SdlcTrackStatus, TicketTag } from '../types/index.js';
export declare const workspaceOperations: {
    /**
     * Create a shared link in a channel.
     */
    readonly createLink: import("./types.js").SdkOperation<{
        id: string;
        url: string;
        title: string;
        channelId: string;
        visibility: LinkVisibility;
        description?: string;
        favicon?: string;
    }, void>;
    /**
     * Update a shared link.
     */
    readonly updateLink: import("./types.js").SdkOperation<{
        id: string;
        title?: string;
        description?: string;
        favicon?: string;
        visibility?: LinkVisibility;
    }, void>;
    /**
     * Delete a shared link.
     */
    readonly deleteLink: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Share a link with specific users.
     */
    readonly shareLink: import("./types.js").SdkOperation<{
        linkId: string;
        userIds: string[];
        accessIds: string[];
    }, void>;
    /**
     * Stop sharing a link with someone.
     */
    readonly unshareLink: import("./types.js").SdkOperation<{
        linkId: string;
        userId: string;
    }, void>;
    /**
     * Connected repositories.
     */
    readonly listRepos: import("./types.js").SdkOperation<void, Repo[]>;
    /**
     * Connect a repository.
     */
    readonly createRepo: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        url: string;
        baseBranch: string[];
        prefix: string;
    }, void>;
    /**
     * Update a repository's details.
     */
    readonly updateRepo: import("./types.js").SdkOperation<{
        id: string;
        name?: string;
        url?: string;
        baseBranch?: string[];
        prefix?: string;
    }, void>;
    /**
     * Disconnect a repository.
     */
    readonly deleteRepo: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Track another branch on a repository.
     */
    readonly addRepoBranch: import("./types.js").SdkOperation<{
        id: string;
        branchName: string;
    }, void>;
    /**
     * One SDLC channel by id, with its participants, stats and canvas folders.
     *
     * Ends in `.one()`, so at most one row; a channel that is not an SDLC hub
     * resolves to null rather than an empty list.
     *
     * Replaces `getSdlcRepoByChannel`. The subsystem was re-keyed from
     * repositories to channels, and `getSdlcRepoByChannelId` no longer exists —
     * the SDLC hub *is* a channel now, so there is no separate repo row to fetch.
     */
    readonly getSdlcChannel: import("./types.js").SdkOperation<{
        channelId: string;
    }, Channel | null>;
    /**
     * Tracks belonging to an SDLC channel, oldest first.
     *
     * Keyed by `channelId` since the same re-keying; it took `repoId` before.
     */
    readonly listSdlcTracks: import("./types.js").SdkOperation<{
        channelId: string;
    }, SdlcTrack[]>;
    /**
     * Start a track on an SDLC repository.
     *
     * The caller only names the repository and the track; the id and timestamp
     * are generated here, and the id is returned so the new track can be acted
     * on without a re-read. Permission comes from channel participation in the
     * repository's channel.
     */
    readonly createSdlcTrack: import("./types.js").SdkOperation<{
        repoId: string;
        name: string;
        description?: string;
    }, void>;
    /**
     * Change a track's name, description, or status.
     *
     * Only the fields passed are changed. `description` accepts null to clear it.
     */
    readonly updateSdlcTrack: import("./types.js").SdkOperation<{
        trackId: string;
        name?: string;
        description?: string | null;
        status?: SdlcTrackStatus;
    }, void>;
    /**
     * Custom emoji in the workspace.
     */
    readonly listEmojis: import("./types.js").SdkOperation<void, CustomEmoji[]>;
    /**
     * One custom emoji by id.
     */
    readonly getEmoji: import("./types.js").SdkOperation<{
        emojiId: string;
    }, CustomEmoji | null>;
    /**
     * One custom emoji by name.
     */
    readonly getEmojiByName: import("./types.js").SdkOperation<{
        name: string;
    }, CustomEmoji | null>;
    /**
     * Lookup values of a given type — the enumerations used across forms and
     * incident records.
     */
    readonly listLookupValues: import("./types.js").SdkOperation<{
        type: LookupType;
    }, LookupValue[]>;
    /**
     * Merchants known to the workspace.
     */
    readonly listMerchants: import("./types.js").SdkOperation<void, Merchant[]>;
    /**
     * Tags defined across projects.
     */
    readonly listTicketTags: import("./types.js").SdkOperation<{
        projectId: string;
    }, TicketTag[]>;
    /**
     * Rules mapping a mail category to the team that handles it, for one channel.
     */
    readonly listClassificationMappings: import("./types.js").SdkOperation<{
        channelId: string;
    }, ClassificationMapping[]>;
    /**
     * Route a category to a team.
     */
    readonly createClassificationMapping: import("./types.js").SdkOperation<{
        id: string;
        channelId: string;
        category: string;
        userGroupId: string;
        subCategory?: string;
    }, void>;
    /**
     * Change a routing rule.
     */
    readonly updateClassificationMapping: import("./types.js").SdkOperation<{
        id: string;
        category?: string;
        subCategory?: string;
        userGroupId?: string;
    }, void>;
    /**
     * Remove a routing rule.
     */
    readonly deleteClassificationMapping: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
};
