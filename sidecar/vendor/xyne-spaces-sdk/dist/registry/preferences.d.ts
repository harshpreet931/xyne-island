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
import type { Bookmark, BookmarkEntityType, ChannelFilterMode, ChannelSortOrder, NotificationLevel, SavedConfigContextType, SavedConfigVisibility, SavedView, UserPreferences, UserProfile } from '../types/index.js';
export declare const preferencesOperations: {
    /**
     * The current user's preference row.
     */
    readonly get: import("./types.js").SdkOperation<void, UserPreferences | null>;
    /**
     * The current user's bookmarks.
     */
    readonly listBookmarks: import("./types.js").SdkOperation<void, Bookmark[]>;
    /**
     * Saved filter views a user created.
     *
     * Takes an explicit `userId` — despite the old `void` signature suggesting it was
     * caller-scoped, the query has no `ctx` fallback, so it required an argument the
     * SDK never sent. Pass `me.id` from `sdk.users.me()` for your own views.
     */
    readonly listSavedViews: import("./types.js").SdkOperation<{
        userId: string;
    }, SavedView[]>;
    /**
     * Set global notification levels.
     */
    readonly setNotificationSettings: import("./types.js").SdkOperation<{
        id: string;
        globalDesktopNotificationLevel?: NotificationLevel;
        globalMobileNotificationLevel?: NotificationLevel;
        threadReplyNotificationsEnabled?: boolean;
        channelWideMentionsEnabled?: boolean;
    }, void>;
    /**
     * Set the words that trigger a notification when mentioned.
     */
    readonly setNotificationKeywords: import("./types.js").SdkOperation<{
        id: string;
        keywords: string[];
    }, void>;
    /**
     * Override notification behaviour for one channel.
     */
    readonly setChannelNotifications: import("./types.js").SdkOperation<{
        channelId: string;
        desktopNotificationLevel?: NotificationLevel | null;
        mobileNotificationLevel?: NotificationLevel | null;
        threadReplyNotificationsEnabled?: boolean | null;
        channelWideMentionsEnabled?: boolean | null;
    }, void>;
    /**
     * Set how channels are ordered in the sidebar.
     */
    readonly setChannelSortOrder: import("./types.js").SdkOperation<{
        id: string;
        channelSortOrder: ChannelSortOrder;
    }, void>;
    /**
     * Set the filter and sort applied to one sidebar group.
     *
     * `filterMode` is ACTIVE | UNREADS | MENTIONS | ALL.
     */
    readonly setSidebarGroup: import("./types.js").SdkOperation<{
        id: string;
        group: "starred" | "channels" | "dms";
        filterMode?: ChannelFilterMode;
        sortOrder?: ChannelSortOrder;
    }, void>;
    /**
     * Choose whether Enter sends a message or inserts a newline.
     */
    readonly setEnterSendsMessage: import("./types.js").SdkOperation<{
        id: string;
        enterSendsMessage: boolean;
    }, void>;
    /**
     * Show or hide thread tags.
     */
    readonly setShowThreadTags: import("./types.js").SdkOperation<{
        id: string;
        showThreadTags: boolean;
    }, void>;
    /**
     * Allow or block broadcast mentions inside threads.
     */
    readonly setAllowThreadBroadcastMentions: import("./types.js").SdkOperation<{
        id: string;
        allowThreadBroadcastMentions: boolean;
    }, void>;
    /**
     * Update the current user's profile card.
     */
    readonly updateProfile: import("./types.js").SdkOperation<{
        profileId: string;
        displayName?: string;
        pronunciation?: string;
        team?: string;
        phoneNumber?: string;
        dob?: number;
        manager?: string;
    }, void>;
    /**
     * Set a status emoji, message, or availability window.
     */
    readonly updatePresence: import("./types.js").SdkOperation<{
        presenceId: string;
        statusEmoji?: string;
        statusContent?: string;
        statusExpiryAt?: number;
        assignmentUnavailableUntil?: number;
        notificationsPausedUntil?: number;
    }, void>;
    /**
     * Bookmark something.
     */
    readonly addBookmark: import("./types.js").SdkOperation<{
        bookmarkId: string;
        entityId: string;
        entityType: BookmarkEntityType;
        metadata?: unknown;
    }, void>;
    /**
     * Remove a bookmark, or mark it done.
     */
    readonly removeBookmark: import("./types.js").SdkOperation<{
        entityId: string;
        entityType: BookmarkEntityType;
        markAsDone?: boolean;
    }, void>;
    /**
     * Change a bookmark's metadata, such as a reminder time.
     */
    readonly updateBookmark: import("./types.js").SdkOperation<{
        entityId: string;
        entityType: BookmarkEntityType;
        metadata: unknown;
    }, void>;
    /**
     * Save a filter configuration for reuse.
     */
    readonly createSavedView: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        contextType: SavedConfigContextType;
        contextId: string;
        channelId: string;
        visibility: SavedConfigVisibility;
        values: unknown;
    }, void>;
    /**
     * Update a saved view.
     */
    readonly updateSavedView: import("./types.js").SdkOperation<{
        configId: string;
        values: unknown;
        name?: string;
        visibility?: SavedConfigVisibility;
        isStarred?: boolean;
    }, void>;
    /**
     * Delete a saved view.
     */
    readonly deleteSavedView: import("./types.js").SdkOperation<{
        configId: string;
    }, void>;
};
export type { UserProfile };
