/**
 * Canvases Operation Registry
 *
 * Collaborative documents, their folders, participants, inline comment threads,
 * and saved versions.
 *
 * Two things to know about content. It is a BlockNote block array rather than
 * markdown, so callers pass structured blocks. And when a canvas has
 * `isCollaborative` set, the realtime CRDT server owns the document — writing
 * through `update` in that state is not a safe read-modify-write, so prefer the
 * realtime editor or take a version snapshot first.
 */
import { op } from './types.js';
export const canvasesOperations = {
    // ----- Reads -----
    /**
     * The current user's canvases, newest first.
     */
    list: op('canvases.list', 'query'),
    /**
     * The current user's Quarto documents.
     */
    listQuartoDocs: op('canvases.listQuartoDocs', 'query'),
    /**
     * Canvases in a channel.
     */
    listByChannel: op('canvases.listByChannel', 'query'),
    /**
     * Quarto documents in a channel.
     */
    listQuartoDocsByChannel: op('canvases.listQuartoDocsByChannel', 'query'),
    /**
     * Canvases in a folder within a project.
     */
    listByFolder: op('canvases.listByFolder', 'query'),
    /**
     * Canvases at one level of the folder tree.
     *
     * The scope decides which id is required: `folder` needs `folderId`,
     * `channel` and `channel_root` need `channelId`, and `personal_root` needs
     * neither. Supplying both, or the wrong one, is rejected.
     */
    listHierarchy: op('canvases.listHierarchy', 'query'),
    /**
     * One canvas.
     */
    get: op('canvases.get', 'query'),
    /**
     * A canvas's participants — users, groups, and channels with access.
     */
    listParticipants: op('canvases.listParticipants', 'query'),
    /**
     * Saved versions of a canvas.
     */
    listVersions: op('canvases.listVersions', 'query'),
    /**
     * Comment threads on a canvas.
     */
    listCommentThreads: op('canvases.listCommentThreads', 'query'),
    /**
     * Comments within one thread.
     */
    listThreadComments: op('canvases.listThreadComments', 'query'),
    // ----- Folders -----
    /**
     * The current user's personal folders.
     */
    listPersonalFolders: op('canvases.listPersonalFolders', 'query'),
    /**
     * Folders in a channel.
     */
    listChannelFolders: op('canvases.listChannelFolders', 'query'),
    /**
     * Folders in a project.
     */
    listProjectFolders: op('canvases.listProjectFolders', 'query'),
    /**
     * Create a folder.
     */
    createFolder: op('canvases.createFolder', 'mutator'),
    /**
     * Rename a folder.
     */
    updateFolder: op('canvases.updateFolder', 'mutator'),
    /**
     * Delete a folder.
     */
    deleteFolder: op('canvases.deleteFolder', 'mutator'),
    // ----- Writes -----
    /**
     * Create a canvas. The creator becomes its first participant.
     */
    create: op('canvases.create', 'mutator'),
    /**
     * Update a canvas's title, content, placement, or visibility.
     */
    update: op('canvases.update', 'mutator'),
    /**
     * Delete a canvas.
     */
    delete: op('canvases.delete', 'mutator'),
    /**
     * Star or unstar a canvas for the current user.
     */
    toggleStarred: op('canvases.toggleStarred', 'mutator'),
    // ----- Participants -----
    /**
     * Grant users access to a canvas.
     */
    addParticipants: op('canvases.addParticipants', 'mutator'),
    /**
     * Grant a user group access.
     */
    addGroupParticipant: op('canvases.addGroupParticipant', 'mutator'),
    /**
     * Grant a whole channel access.
     */
    addChannelParticipant: op('canvases.addChannelParticipant', 'mutator'),
    /**
     * Revoke a user's access.
     */
    removeParticipant: op('canvases.removeParticipant', 'mutator'),
    /**
     * Revoke a group's access.
     */
    removeGroupParticipant: op('canvases.removeGroupParticipant', 'mutator'),
    /**
     * Revoke a channel's access.
     */
    removeChannelParticipant: op('canvases.removeChannelParticipant', 'mutator'),
    /**
     * Change a user's role.
     */
    updateParticipantRole: op('canvases.updateParticipantRole', 'mutator'),
    /**
     * Change a group's role.
     */
    updateGroupParticipantRole: op('canvases.updateGroupParticipantRole', 'mutator'),
    /**
     * Change a channel's role.
     */
    updateChannelParticipantRole: op('canvases.updateChannelParticipantRole', 'mutator'),
    // ----- Comments -----
    /**
     * Start a comment thread anchored to a block.
     */
    createCommentThread: op('canvases.createCommentThread', 'mutator'),
    /**
     * Reply in a thread.
     */
    replyToThread: op('canvases.replyToThread', 'mutator'),
    /**
     * Edit a comment.
     */
    updateComment: op('canvases.updateComment', 'mutator'),
    /**
     * Delete a comment.
     */
    deleteComment: op('canvases.deleteComment', 'mutator'),
    /**
     * Resolve or reopen a thread.
     */
    setThreadStatus: op('canvases.setThreadStatus', 'mutator'),
    // ----- Versions -----
    /**
     * Snapshot the current content as a named version.
     */
    saveVersion: op('canvases.saveVersion', 'mutator'),
    /**
     * Rename a saved version.
     */
    renameVersion: op('canvases.renameVersion', 'mutator'),
    /**
     * Restore a canvas to a saved version.
     */
    restoreVersion: op('canvases.restoreVersion', 'mutator'),
    /**
     * Archive a canvas, hiding it from the default listings.
     */
    archive: op('canvases.archive', 'mutator'),
    /**
     * Restore an archived canvas.
     */
    unarchive: op('canvases.unarchive', 'mutator'),
};
