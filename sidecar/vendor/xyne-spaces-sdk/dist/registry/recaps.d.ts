/**
 * Recaps Operation Registry
 *
 * Generated daily summaries of channel and project activity, their
 * subscriptions and read state, plus the entity-level nudge queries.
 *
 * Recaps are addressed by date: every read takes a `recapDate` in epoch
 * milliseconds identifying the day being summarised.
 *
 * Message-level nudges and the dismiss/act operations live on
 * `sdk.activities`, since that is where a user encounters them.
 */
import type { Nudge, NudgeState, Recap } from '../types/index.js';
export declare const recapsOperations: {
    /**
     * Recaps for several channels on one day.
     */
    readonly listForChannels: import("./types.js").SdkOperation<{
        channelIds: string[];
        recapDate: number;
    }, Recap[]>;
    /**
     * Daily recap rows for several channels, including per-user variants.
     */
    readonly listDaily: import("./types.js").SdkOperation<{
        channelIds: string[];
        recapDate: number;
    }, Recap[]>;
    /**
     * Project recaps for a day.
     */
    readonly listForProjects: import("./types.js").SdkOperation<{
        recapDate: number;
    }, Recap[]>;
    /**
     * Nudges attached to an entity such as a ticket.
     */
    readonly listEntityNudges: import("./types.js").SdkOperation<{
        sourceId: string;
        states?: NudgeState[];
    }, Nudge[]>;
    /**
     * Nudges behind aggregate counts, resolved by count-row id.
     */
    readonly listNudgesByCountRows: import("./types.js").SdkOperation<{
        countRowIds: string[];
    }, Nudge[]>;
    /**
     * Replace the set of channels the user gets recaps for.
     *
     * This is the whole subscription list, not an addition — send every channel
     * you want subscribed.
     */
    readonly saveSubscriptions: import("./types.js").SdkOperation<{
        channelIds: string[];
    }, void>;
    /**
     * Set a custom prompt shaping how a channel's recap is written.
     */
    readonly setCustomPrompt: import("./types.js").SdkOperation<{
        channelId: string;
        prompt: string;
    }, void>;
    /**
     * Mark a whole day's recaps seen.
     */
    readonly markSeen: import("./types.js").SdkOperation<{
        recapDate: number;
    }, void>;
    /**
     * Mark one channel's recap read.
     */
    readonly markChannelRead: import("./types.js").SdkOperation<{
        channelId: string;
        recapDate: number;
    }, void>;
    /**
     * Mark one channel's recap unread again.
     */
    readonly markChannelUnread: import("./types.js").SdkOperation<{
        channelId: string;
    }, void>;
};
