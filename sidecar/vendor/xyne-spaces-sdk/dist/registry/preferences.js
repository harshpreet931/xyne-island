/**
 * Preferences Operation Registry
 *
 * The current user's own settings: notification behaviour, profile card,
 * presence, bookmarks, and saved filter views.
 *
 * Everything here is scoped to the caller. The `id` several mutators take is the
 * preference row's own id, not a user id — it is generated on first write and
 * reused after, so the resource methods accept it optionally.
 */
import { op } from './types.js';
export const preferencesOperations = {
    // ----- Reads -----
    /**
     * The current user's preference row.
     */
    get: op('preferences.get', 'query'),
    /**
     * The current user's bookmarks.
     */
    listBookmarks: op('preferences.listBookmarks', 'query'),
    /**
     * Saved filter views a user created.
     *
     * Takes an explicit `userId` — despite the old `void` signature suggesting it was
     * caller-scoped, the query has no `ctx` fallback, so it required an argument the
     * SDK never sent. Pass `me.id` from `sdk.users.me()` for your own views.
     */
    listSavedViews: op('preferences.listSavedViews', 'query'),
    // ----- Notification settings -----
    /**
     * Set global notification levels.
     */
    setNotificationSettings: op('preferences.setNotificationSettings', 'mutator'),
    /**
     * Set the words that trigger a notification when mentioned.
     */
    setNotificationKeywords: op('preferences.setNotificationKeywords', 'mutator'),
    /**
     * Override notification behaviour for one channel.
     */
    setChannelNotifications: op('preferences.setChannelNotifications', 'mutator'),
    // ----- Interface preferences -----
    /**
     * Set how channels are ordered in the sidebar.
     */
    setChannelSortOrder: op('preferences.setChannelSortOrder', 'mutator'),
    /**
     * Set the filter and sort applied to one sidebar group.
     *
     * `filterMode` is ACTIVE | UNREADS | MENTIONS | ALL.
     */
    setSidebarGroup: op('preferences.setSidebarGroup', 'mutator'),
    /**
     * Choose whether Enter sends a message or inserts a newline.
     */
    setEnterSendsMessage: op('preferences.setEnterSendsMessage', 'mutator'),
    /**
     * Show or hide thread tags.
     */
    setShowThreadTags: op('preferences.setShowThreadTags', 'mutator'),
    /**
     * Allow or block broadcast mentions inside threads.
     */
    setAllowThreadBroadcastMentions: op('preferences.setAllowThreadBroadcastMentions', 'mutator'),
    // ----- Profile and presence -----
    /**
     * Update the current user's profile card.
     */
    updateProfile: op('preferences.updateProfile', 'mutator'),
    /**
     * Set a status emoji, message, or availability window.
     */
    updatePresence: op('preferences.updatePresence', 'mutator'),
    // ----- Bookmarks -----
    /**
     * Bookmark something.
     */
    addBookmark: op('preferences.addBookmark', 'mutator'),
    /**
     * Remove a bookmark, or mark it done.
     */
    removeBookmark: op('preferences.removeBookmark', 'mutator'),
    /**
     * Change a bookmark's metadata, such as a reminder time.
     */
    updateBookmark: op('preferences.updateBookmark', 'mutator'),
    // ----- Saved views -----
    /**
     * Save a filter configuration for reuse.
     */
    createSavedView: op('preferences.createSavedView', 'mutator'),
    /**
     * Update a saved view.
     */
    updateSavedView: op('preferences.updateSavedView', 'mutator'),
    /**
     * Delete a saved view.
     */
    deleteSavedView: op('preferences.deleteSavedView', 'mutator'),
};
