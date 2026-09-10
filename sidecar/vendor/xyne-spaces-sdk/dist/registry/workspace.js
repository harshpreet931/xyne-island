/**
 * Workspace Operation Registry
 *
 * Shared workspace-level items that do not belong to a larger domain: shared
 * links, connected repositories, custom emoji, lookup values, merchants, and
 * the classification mappings that route categorised mail to a team.
 */
import { op } from './types.js';
export const workspaceOperations = {
    // ----- Links -----
    /**
     * Create a shared link in a channel.
     */
    createLink: op('workspace.createLink', 'mutator'),
    /**
     * Update a shared link.
     */
    updateLink: op('workspace.updateLink', 'mutator'),
    /**
     * Delete a shared link.
     */
    deleteLink: op('workspace.deleteLink', 'mutator'),
    /**
     * Share a link with specific users.
     */
    shareLink: op('workspace.shareLink', 'mutator'),
    /**
     * Stop sharing a link with someone.
     */
    unshareLink: op('workspace.unshareLink', 'mutator'),
    // ----- Repositories -----
    /**
     * Connected repositories.
     */
    listRepos: op('workspace.listRepos', 'query'),
    /**
     * Connect a repository.
     */
    createRepo: op('workspace.createRepo', 'mutator'),
    /**
     * Update a repository's details.
     */
    updateRepo: op('workspace.updateRepo', 'mutator'),
    /**
     * Disconnect a repository.
     */
    deleteRepo: op('workspace.deleteRepo', 'mutator'),
    /**
     * Track another branch on a repository.
     */
    addRepoBranch: op('workspace.addRepoBranch', 'mutator'),
    // ----- SDLC -----
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
    getSdlcChannel: op('workspace.getSdlcChannel', 'query'),
    /**
     * Tracks belonging to an SDLC channel, oldest first.
     *
     * Keyed by `channelId` since the same re-keying; it took `repoId` before.
     */
    listSdlcTracks: op('workspace.listSdlcTracks', 'query'),
    /**
     * Start a track on an SDLC repository.
     *
     * The caller only names the repository and the track; the id and timestamp
     * are generated here, and the id is returned so the new track can be acted
     * on without a re-read. Permission comes from channel participation in the
     * repository's channel.
     */
    createSdlcTrack: op('workspace.createSdlcTrack', 'mutator'),
    /**
     * Change a track's name, description, or status.
     *
     * Only the fields passed are changed. `description` accepts null to clear it.
     */
    updateSdlcTrack: op('workspace.updateSdlcTrack', 'mutator'),
    // ----- Custom emoji -----
    /**
     * Custom emoji in the workspace.
     */
    listEmojis: op('workspace.listEmojis', 'query'),
    /**
     * One custom emoji by id.
     */
    getEmoji: op('workspace.getEmoji', 'query'),
    /**
     * One custom emoji by name.
     */
    getEmojiByName: op('workspace.getEmojiByName', 'query'),
    // ----- Reference data -----
    /**
     * Lookup values of a given type — the enumerations used across forms and
     * incident records.
     */
    listLookupValues: op('workspace.listLookupValues', 'query'),
    /**
     * Merchants known to the workspace.
     */
    listMerchants: op('workspace.listMerchants', 'query'),
    /**
     * Tags defined across projects.
     */
    listTicketTags: op('workspace.listTicketTags', 'query'),
    // ----- Classification routing -----
    /**
     * Rules mapping a mail category to the team that handles it, for one channel.
     */
    listClassificationMappings: op('workspace.listClassificationMappings', 'query'),
    /**
     * Route a category to a team.
     */
    createClassificationMapping: op('workspace.createClassificationMapping', 'mutator'),
    /**
     * Change a routing rule.
     */
    updateClassificationMapping: op('workspace.updateClassificationMapping', 'mutator'),
    /**
     * Remove a routing rule.
     */
    deleteClassificationMapping: op('workspace.deleteClassificationMapping', 'mutator'),
};
