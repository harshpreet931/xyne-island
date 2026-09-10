/**
 * Activities Operation Registry
 *
 * The current user's activity feed: mentions, thread replies, reactions, and
 * missed calls, plus the read-state operations that clear them.
 *
 * Every operation here is implicitly scoped to the authenticated user by the
 * underlying query — there is no user id parameter to pass, and none to spoof.
 */
import type { Activity, Bookmark } from '../types/index.js';
/** Page cursor for the paginated activity feed. */
export interface ActivityCursor {
    id: string;
    updatedAt: number;
}
export declare const activitiesOperations: {
    /**
     * The full activity feed.
     */
    readonly list: import("./types.js").SdkOperation<void, Activity[]>;
    /**
     * The activity feed, paginated.
     */
    readonly listPaginated: import("./types.js").SdkOperation<{
        limit?: number;
        start?: ActivityCursor;
        types?: string[];
    }, Activity[]>;
    /**
     * Unread activities only.
     */
    readonly listUnread: import("./types.js").SdkOperation<void, Activity[]>;
    /**
     * Unread activities from subscribed threads.
     */
    readonly listUnreadThreads: import("./types.js").SdkOperation<void, Activity[]>;
    /**
     * Missed calls.
     */
    readonly listMissedCalls: import("./types.js").SdkOperation<void, Activity[]>;
    /**
     * The current user's bookmarks.
     */
    readonly listBookmarks: import("./types.js").SdkOperation<void, Bookmark[]>;
    /**
     * Mark one activity read.
     */
    readonly markAsRead: import("./types.js").SdkOperation<{
        activityId: string;
    }, void>;
    /**
     * Mark one activity unread again.
     */
    readonly markAsUnread: import("./types.js").SdkOperation<{
        activityId: string;
    }, void>;
    /**
     * Mark every activity in a thread read, optionally preserving a draft.
     */
    readonly markThreadAsRead: import("./types.js").SdkOperation<{
        conversationId: string;
        draftMessage?: string;
    }, void>;
    /**
     * Clear the missed-call badge.
     */
    readonly markMissedCallsAsRead: import("./types.js").SdkOperation<void, void>;
    /**
     * Mark activities seen up to a given message.
     */
    readonly markSeenByMessage: import("./types.js").SdkOperation<{
        messageId: string;
    }, void>;
    /**
     * Dismiss a nudge.
     */
    readonly dismissNudge: import("./types.js").SdkOperation<{
        nudgeId: string;
    }, void>;
    /**
     * Act on a nudge.
     */
    readonly actOnNudge: import("./types.js").SdkOperation<{
        nudgeId: string;
        actionResult?: unknown;
    }, void>;
    /**
     * Mark every activity matching a filter as read — for example all reactions,
     * or everything of one classification.
     */
    readonly markAsReadByFilter: import("./types.js").SdkOperation<{
        actorAction?: string;
        classification?: string;
    }, void>;
};
