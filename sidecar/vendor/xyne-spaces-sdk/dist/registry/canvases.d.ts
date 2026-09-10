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
import type { Canvas, CanvasComment, CanvasCommentThread, CanvasCommentThreadStatus, CanvasFolder, CanvasParticipant, CanvasRole, CanvasVersion, CanvasVisibility } from '../types/index.js';
/** Page cursor for the paginated canvas listings. */
export interface CanvasCursor {
    id: string;
    updatedAt: number;
}
/** Where a hierarchy listing is rooted. */
export type CanvasScope = 'channel' | 'channel_root' | 'folder' | 'personal_root';
export declare const canvasesOperations: {
    /**
     * The current user's canvases, newest first.
     */
    readonly list: import("./types.js").SdkOperation<{
        limit?: number;
        start?: CanvasCursor;
        includeQuartoDocs?: boolean;
        direction?: "forward" | "backward";
    }, Canvas[]>;
    /**
     * The current user's Quarto documents.
     */
    readonly listQuartoDocs: import("./types.js").SdkOperation<{
        limit?: number;
        start?: CanvasCursor;
        direction?: "forward" | "backward";
    }, Canvas[]>;
    /**
     * Canvases in a channel.
     */
    readonly listByChannel: import("./types.js").SdkOperation<{
        channelId: string;
        limit?: number;
        start?: CanvasCursor;
        includeQuartoDocs?: boolean;
    }, Canvas[]>;
    /**
     * Quarto documents in a channel.
     */
    readonly listQuartoDocsByChannel: import("./types.js").SdkOperation<{
        channelId: string;
        limit?: number;
        start?: CanvasCursor;
    }, Canvas[]>;
    /**
     * Canvases in a folder within a project.
     */
    readonly listByFolder: import("./types.js").SdkOperation<{
        folderId: string;
        projectId: string;
        includeQuartoDocs?: boolean;
    }, Canvas[]>;
    /**
     * Canvases at one level of the folder tree.
     *
     * The scope decides which id is required: `folder` needs `folderId`,
     * `channel` and `channel_root` need `channelId`, and `personal_root` needs
     * neither. Supplying both, or the wrong one, is rejected.
     */
    readonly listHierarchy: import("./types.js").SdkOperation<{
        scope?: CanvasScope;
        channelId?: string;
        folderId?: string;
        projectId?: string;
        includeQuartoDocs?: boolean;
    }, Canvas[]>;
    /**
     * One canvas.
     */
    readonly get: import("./types.js").SdkOperation<{
        canvasId: string;
    }, Canvas | null>;
    /**
     * A canvas's participants — users, groups, and channels with access.
     */
    readonly listParticipants: import("./types.js").SdkOperation<{
        canvasId: string;
    }, CanvasParticipant[]>;
    /**
     * Saved versions of a canvas.
     */
    readonly listVersions: import("./types.js").SdkOperation<{
        canvasId: string;
    }, CanvasVersion[]>;
    /**
     * Comment threads on a canvas.
     */
    readonly listCommentThreads: import("./types.js").SdkOperation<{
        canvasId: string;
    }, CanvasCommentThread[]>;
    /**
     * Comments within one thread.
     */
    readonly listThreadComments: import("./types.js").SdkOperation<{
        threadId: string;
    }, CanvasComment[]>;
    /**
     * The current user's personal folders.
     */
    readonly listPersonalFolders: import("./types.js").SdkOperation<void, CanvasFolder[]>;
    /**
     * Folders in a channel.
     */
    readonly listChannelFolders: import("./types.js").SdkOperation<{
        channelId: string;
    }, CanvasFolder[]>;
    /**
     * Folders in a project.
     */
    readonly listProjectFolders: import("./types.js").SdkOperation<{
        projectId: string;
    }, CanvasFolder[]>;
    /**
     * Create a folder.
     */
    readonly createFolder: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        projectId?: string;
        channelId?: string;
    }, void>;
    /**
     * Rename a folder.
     */
    readonly updateFolder: import("./types.js").SdkOperation<{
        id: string;
        name?: string;
    }, void>;
    /**
     * Delete a folder.
     */
    readonly deleteFolder: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Create a canvas. The creator becomes its first participant.
     */
    readonly create: import("./types.js").SdkOperation<{
        id: string;
        title: string;
        content?: unknown;
        channelId?: string;
        folderId?: string;
        projectId?: string;
        visibility?: CanvasVisibility;
    }, void>;
    /**
     * Update a canvas's title, content, placement, or visibility.
     */
    readonly update: import("./types.js").SdkOperation<{
        id: string;
        title?: string;
        content?: unknown;
        visibility?: CanvasVisibility;
        isCollaborative?: boolean;
        folderId?: string;
        projectId?: string;
        channelId?: string;
    }, void>;
    /**
     * Delete a canvas.
     */
    readonly delete: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Star or unstar a canvas for the current user.
     */
    readonly toggleStarred: import("./types.js").SdkOperation<{
        id: string;
        canvasId: string;
    }, void>;
    /**
     * Grant users access to a canvas.
     */
    readonly addParticipants: import("./types.js").SdkOperation<{
        canvasId: string;
        userIds: string[];
        role: CanvasRole;
    }, void>;
    /**
     * Grant a user group access.
     */
    readonly addGroupParticipant: import("./types.js").SdkOperation<{
        canvasId: string;
        userGroupId: string;
        role: CanvasRole;
    }, void>;
    /**
     * Grant a whole channel access.
     */
    readonly addChannelParticipant: import("./types.js").SdkOperation<{
        canvasId: string;
        channelId: string;
        role: CanvasRole;
    }, void>;
    /**
     * Revoke a user's access.
     */
    readonly removeParticipant: import("./types.js").SdkOperation<{
        canvasId: string;
        userId: string;
    }, void>;
    /**
     * Revoke a group's access.
     */
    readonly removeGroupParticipant: import("./types.js").SdkOperation<{
        canvasId: string;
        userGroupId: string;
    }, void>;
    /**
     * Revoke a channel's access.
     */
    readonly removeChannelParticipant: import("./types.js").SdkOperation<{
        canvasId: string;
        channelId: string;
    }, void>;
    /**
     * Change a user's role.
     */
    readonly updateParticipantRole: import("./types.js").SdkOperation<{
        canvasId: string;
        userId: string;
        role: CanvasRole;
    }, void>;
    /**
     * Change a group's role.
     */
    readonly updateGroupParticipantRole: import("./types.js").SdkOperation<{
        canvasId: string;
        userGroupId: string;
        role: CanvasRole;
    }, void>;
    /**
     * Change a channel's role.
     */
    readonly updateChannelParticipantRole: import("./types.js").SdkOperation<{
        canvasId: string;
        channelId: string;
        role: CanvasRole;
    }, void>;
    /**
     * Start a comment thread anchored to a block.
     */
    readonly createCommentThread: import("./types.js").SdkOperation<{
        threadId: string;
        commentId: string;
        canvasId: string;
        blockId: string;
        body: string;
        anchorText?: string;
        mentionedUserIds?: string[];
    }, void>;
    /**
     * Reply in a thread.
     */
    readonly replyToThread: import("./types.js").SdkOperation<{
        commentId: string;
        threadId: string;
        canvasId: string;
        body: string;
        mentionedUserIds?: string[];
    }, void>;
    /**
     * Edit a comment.
     */
    readonly updateComment: import("./types.js").SdkOperation<{
        commentId: string;
        body: string;
        mentionedUserIds?: string[];
    }, void>;
    /**
     * Delete a comment.
     */
    readonly deleteComment: import("./types.js").SdkOperation<{
        commentId: string;
    }, void>;
    /**
     * Resolve or reopen a thread.
     */
    readonly setThreadStatus: import("./types.js").SdkOperation<{
        threadId: string;
        status: CanvasCommentThreadStatus;
    }, void>;
    /**
     * Snapshot the current content as a named version.
     */
    readonly saveVersion: import("./types.js").SdkOperation<{
        id: string;
        canvasId: string;
        name: string;
        content: unknown;
        contentHash: string;
    }, void>;
    /**
     * Rename a saved version.
     */
    readonly renameVersion: import("./types.js").SdkOperation<{
        id: string;
        name: string;
    }, void>;
    /**
     * Restore a canvas to a saved version.
     */
    readonly restoreVersion: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Archive a canvas, hiding it from the default listings.
     */
    readonly archive: import("./types.js").SdkOperation<{
        canvasId: string;
    }, void>;
    /**
     * Restore an archived canvas.
     */
    readonly unarchive: import("./types.js").SdkOperation<{
        canvasId: string;
    }, void>;
};
