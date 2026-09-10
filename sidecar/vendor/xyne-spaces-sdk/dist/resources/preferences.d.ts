/**
 * Preferences Resource
 *
 * The current user's own settings: notifications, interface behaviour, profile
 * card, presence, bookmarks, and saved views.
 *
 * Several operations write to a single preference row. Its id is generated on
 * first use and can be passed back on later calls; read it from `get()` if you
 * want to reuse the same row explicitly.
 */
import { Resource } from './base.js';
import type { Bookmark, BookmarkEntityType, ChannelFilterMode, ChannelSortOrder, NotificationLevel, SavedConfigContextType, SavedConfigVisibility, SavedView, UserPreferences } from '../types/index.js';
export declare class PreferencesResource extends Resource {
    /**
     * Get the caller's preference row.
     *
     * @returns The settings row, or `null` before any preference has been set.
     * @example
     * const prefs = await sdk.preferences.get();
     */
    get(): Promise<UserPreferences | null>;
    /**
     * Set notification levels that apply across every channel.
     *
     * @param data - Levels to set; omitted fields are left alone.
     * @param data.id - Existing preference row to write to. Generated if omitted.
     * @param data.globalDesktopNotificationLevel - Default desktop level.
     * @param data.globalMobileNotificationLevel - Default mobile level.
     * @param data.threadReplyNotificationsEnabled - Notify on replies in threads you follow.
     * @param data.channelWideMentionsEnabled - Notify on `@channel` and `@here`.
     * @example
     * await sdk.preferences.setNotificationSettings({
     *   globalDesktopNotificationLevel: 'MENTIONS_ONLY',
     * });
     */
    setNotificationSettings(data: {
        id?: string;
        globalDesktopNotificationLevel?: NotificationLevel;
        globalMobileNotificationLevel?: NotificationLevel;
        threadReplyNotificationsEnabled?: boolean;
        channelWideMentionsEnabled?: boolean;
    }): Promise<void>;
    /**
     * Set the words that trigger a notification when they appear.
     *
     * Replaces the whole list. At most 50 keywords, each up to 80 characters.
     *
     * @param keywords - The complete set of keywords to watch for.
     * @param options.id - Existing preference row to write to.
     * @example
     * await sdk.preferences.setNotificationKeywords(['deploy', 'incident']);
     */
    setNotificationKeywords(keywords: string[], options?: {
        id?: string;
    }): Promise<void>;
    /**
     * Override notification behaviour for one channel.
     *
     * Pass `null` for a level to clear the override and fall back to the global
     * setting.
     *
     * @param channelId - Channel the override applies to.
     * @param data - Overrides to set; `null` clears one.
     * @param data.desktopNotificationLevel - Desktop level for this channel.
     * @param data.mobileNotificationLevel - Mobile level for this channel.
     * @param data.threadReplyNotificationsEnabled - Thread replies in this channel.
     * @param data.channelWideMentionsEnabled - `@channel` and `@here` here.
     * @example
     * await sdk.preferences.setChannelNotifications('channel-1', {
     *   desktopNotificationLevel: 'MENTIONS_ONLY',
     * });
     */
    setChannelNotifications(channelId: string, data: {
        desktopNotificationLevel?: NotificationLevel | null;
        mobileNotificationLevel?: NotificationLevel | null;
        threadReplyNotificationsEnabled?: boolean | null;
        channelWideMentionsEnabled?: boolean | null;
    }): Promise<void>;
    /**
     * Set how channels are ordered in the sidebar.
     *
     * @param channelSortOrder - The ordering to apply.
     * @param options.id - Existing preference row to write to.
     * @example
     * await sdk.preferences.setChannelSortOrder('RECENCY');
     */
    setChannelSortOrder(channelSortOrder: ChannelSortOrder, options?: {
        id?: string;
    }): Promise<void>;
    /**
     * Choose whether Enter sends a message or inserts a newline.
     *
     * @param enterSendsMessage - True for Enter to send; false for Shift+Enter.
     * @param options.id - Existing preference row to write to.
     * @example
     * await sdk.preferences.setEnterSendsMessage(false);
     */
    setEnterSendsMessage(enterSendsMessage: boolean, options?: {
        id?: string;
    }): Promise<void>;
    /**
     * Show or hide thread classification chips in chat.
     *
     * @param showThreadTags - Whether to render them.
     * @param options.id - Existing preference row to write to.
     * @example
     * await sdk.preferences.setShowThreadTags(true);
     */
    setShowThreadTags(showThreadTags: boolean, options?: {
        id?: string;
    }): Promise<void>;
    /**
     * Allow or block `@channel` and `@here` inside thread replies.
     *
     * @param allowThreadBroadcastMentions - Whether to permit them.
     * @param options.id - Existing preference row to write to.
     * @example
     * await sdk.preferences.setAllowThreadBroadcastMentions(false);
     */
    setAllowThreadBroadcastMentions(allowThreadBroadcastMentions: boolean, options?: {
        id?: string;
    }): Promise<void>;
    /**
     * Update the caller's profile card.
     *
     * @param data - Fields to change; omitted fields are left alone.
     * @param data.profileId - Existing profile row. Generated if omitted.
     * @param data.displayName - Name shown to others.
     * @param data.pronunciation - How to say the name.
     * @param data.team - Team or department.
     * @param data.phoneNumber - Contact number.
     * @param data.dob - Date of birth, epoch milliseconds.
     * @param data.manager - User id of their manager.
     * @returns The profile row id.
     * @example
     * await sdk.preferences.updateProfile({ displayName: 'Prajwal P', team: 'Platform' });
     */
    updateProfile(data: {
        profileId?: string;
        displayName?: string;
        pronunciation?: string;
        team?: string;
        phoneNumber?: string;
        dob?: number;
        manager?: string;
    }): Promise<{
        profileId: string;
    }>;
    /**
     * Set a status emoji, message, or availability window.
     *
     * @param data - What to set; omitted fields are left alone.
     * @param data.presenceId - Existing presence row. Generated if omitted.
     * @param data.statusEmoji - Emoji shown beside the name.
     * @param data.statusContent - Short status text.
     * @param data.statusExpiryAt - When the status clears, epoch milliseconds.
     * @param data.assignmentUnavailableUntil - Pause ticket assignment until then.
     * @param data.notificationsPausedUntil - Mute notifications until then.
     * @returns The presence row id.
     * @example
     * await sdk.preferences.updatePresence({
     *   statusEmoji: 'palm_tree',
     *   statusContent: 'On leave',
     *   statusExpiryAt: Date.now() + 86_400_000,
     * });
     */
    updatePresence(data: {
        presenceId?: string;
        statusEmoji?: string;
        statusContent?: string;
        statusExpiryAt?: number;
        assignmentUnavailableUntil?: number;
        notificationsPausedUntil?: number;
    }): Promise<{
        presenceId: string;
    }>;
    /**
     * List the caller's bookmarks.
     *
     * @returns Saved references to messages, threads, tickets and canvases.
     * @example
     * const bookmarks = await sdk.preferences.listBookmarks();
     */
    listBookmarks(): Promise<Bookmark[]>;
    /**
     * Bookmark something.
     *
     * @param data - What to bookmark.
     * @param data.entityId - Id of the thing being bookmarked.
     * @param data.entityType - What kind of thing it is.
     * @param data.metadata - Extra data, such as a reminder time.
     * @returns The new bookmark's id.
     * @example
     * const { bookmarkId } = await sdk.preferences.addBookmark({
     *   entityId: 'ticket-1',
     *   entityType: 'TICKET',
     * });
     */
    addBookmark(data: {
        entityId: string;
        entityType: BookmarkEntityType;
        metadata?: unknown;
    }): Promise<{
        bookmarkId: string;
    }>;
    /**
     * Remove a bookmark.
     *
     * @param entityId - Id of the bookmarked thing.
     * @param entityType - What kind of thing it is.
     * @param options.markAsDone - Complete it rather than deleting it outright.
     * @example
     * await sdk.preferences.removeBookmark('ticket-1', 'TICKET');
     */
    removeBookmark(entityId: string, entityType: BookmarkEntityType, options?: {
        markAsDone?: boolean;
    }): Promise<void>;
    /**
     * Change a bookmark's metadata, such as a reminder time.
     *
     * @param entityId - Id of the bookmarked thing.
     * @param entityType - What kind of thing it is.
     * @param metadata - The replacement metadata.
     * @example
     * await sdk.preferences.updateBookmark('ticket-1', 'TICKET', { remindAt: Date.now() });
     */
    updateBookmark(entityId: string, entityType: BookmarkEntityType, metadata: unknown): Promise<void>;
    /**
     * List the saved filter views a user created.
     *
     * @param userId - Whose views to list, from `sdk.users.me()`.
     * @returns Their saved views.
     * @example
     * const me = await sdk.users.me();
     * const views = await sdk.preferences.listSavedViews(me.id);
     */
    listSavedViews(userId: string): Promise<SavedView[]>;
    /**
     * Save a filter configuration for reuse.
     *
     * @param data - The view to save.
     * @param data.name - Display name.
     * @param data.contextType - What the view is scoped to.
     * @param data.contextId - Id within that scope, e.g. a board.
     * @param data.channelId - Channel the view belongs to.
     * @param data.visibility - Whether others can see it.
     * @param data.values - The filter configuration itself.
     * @returns The new view's id.
     * @example
     * const { id } = await sdk.preferences.createSavedView({
     *   name: 'My open tickets',
     *   contextType: 'BOARD',
     *   contextId: 'board-1',
     *   channelId: 'channel-1',
     *   visibility: 'PRIVATE',
     *   values: {},
     * });
     */
    createSavedView(data: {
        name: string;
        contextType: SavedConfigContextType;
        contextId: string;
        channelId: string;
        visibility: SavedConfigVisibility;
        values: unknown;
    }): Promise<{
        id: string;
    }>;
    /**
     * Update a saved view.
     *
     * @param configId - Id of the view.
     * @param data - Fields to change.
     * @param data.values - The replacement filter configuration.
     * @param data.name - New display name.
     * @param data.visibility - New visibility.
     * @param data.isStarred - Pin it to the top of the list.
     * @example
     * await sdk.preferences.updateSavedView('view-1', { values: {}, isStarred: true });
     */
    updateSavedView(configId: string, data: {
        values: unknown;
        name?: string;
        visibility?: SavedConfigVisibility;
        isStarred?: boolean;
    }): Promise<void>;
    /**
     * Delete a saved view.
     *
     * @param configId - Id of the view.
     * @example
     * await sdk.preferences.deleteSavedView('view-1');
     */
    deleteSavedView(configId: string): Promise<void>;
    /**
     * Set the filter and sort applied to one sidebar group.
     *
     * @param id - Existing preference row to write to.
     * @param group - Which sidebar group to configure.
     * @param options.filterMode - Which channels the group shows.
     * @param options.sortOrder - How the group is ordered.
     * @example
     * await sdk.preferences.setSidebarGroup('pref-1', 'channels', {
     *   filterMode: 'UNREADS',
     * });
     */
    setSidebarGroup(id: string, group: 'starred' | 'channels' | 'dms', options?: {
        filterMode?: ChannelFilterMode;
        sortOrder?: ChannelSortOrder;
    }): Promise<void>;
}
