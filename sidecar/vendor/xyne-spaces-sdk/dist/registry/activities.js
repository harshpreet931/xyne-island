/**
 * Activities Operation Registry
 *
 * The current user's activity feed: mentions, thread replies, reactions, and
 * missed calls, plus the read-state operations that clear them.
 *
 * Every operation here is implicitly scoped to the authenticated user by the
 * underlying query — there is no user id parameter to pass, and none to spoof.
 */
import { op } from './types.js';
export const activitiesOperations = {
    // ----- Reads -----
    /**
     * The full activity feed.
     */
    list: op('activities.list', 'query'),
    /**
     * The activity feed, paginated.
     */
    listPaginated: op('activities.listPaginated', 'query'),
    /**
     * Unread activities only.
     */
    listUnread: op('activities.listUnread', 'query'),
    /**
     * Unread activities from subscribed threads.
     */
    listUnreadThreads: op('activities.listUnreadThreads', 'query'),
    /**
     * Missed calls.
     */
    listMissedCalls: op('activities.listMissedCalls', 'query'),
    /**
     * The current user's bookmarks.
     */
    listBookmarks: op('activities.listBookmarks', 'query'),
    // ----- Writes -----
    /**
     * Mark one activity read.
     */
    markAsRead: op('activities.markAsRead', 'mutator'),
    /**
     * Mark one activity unread again.
     */
    markAsUnread: op('activities.markAsUnread', 'mutator'),
    /**
     * Mark every activity in a thread read, optionally preserving a draft.
     */
    markThreadAsRead: op('activities.markThreadAsRead', 'mutator'),
    /**
     * Clear the missed-call badge.
     */
    markMissedCallsAsRead: op('activities.markMissedCallsAsRead', 'mutator'),
    /**
     * Mark activities seen up to a given message.
     */
    markSeenByMessage: op('activities.markSeenByMessage', 'mutator'),
    /**
     * Dismiss a nudge.
     */
    dismissNudge: op('activities.dismissNudge', 'mutator'),
    /**
     * Act on a nudge.
     */
    actOnNudge: op('activities.actOnNudge', 'mutator'),
    /**
     * Mark every activity matching a filter as read — for example all reactions,
     * or everything of one classification.
     */
    markAsReadByFilter: op('activities.markAsReadByFilter', 'mutator'),
};
