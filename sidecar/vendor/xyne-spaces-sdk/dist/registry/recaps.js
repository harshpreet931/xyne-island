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
import { op } from './types.js';
export const recapsOperations = {
    // ----- Reads -----
    /**
     * Recaps for several channels on one day.
     */
    listForChannels: op('recaps.listForChannels', 'query'),
    /**
     * Daily recap rows for several channels, including per-user variants.
     */
    listDaily: op('recaps.listDaily', 'query'),
    /**
     * Project recaps for a day.
     */
    listForProjects: op('recaps.listForProjects', 'query'),
    /**
     * Nudges attached to an entity such as a ticket.
     */
    listEntityNudges: op('recaps.listEntityNudges', 'query'),
    /**
     * Nudges behind aggregate counts, resolved by count-row id.
     */
    listNudgesByCountRows: op('recaps.listNudgesByCountRows', 'query'),
    // ----- Writes -----
    /**
     * Replace the set of channels the user gets recaps for.
     *
     * This is the whole subscription list, not an addition — send every channel
     * you want subscribed.
     */
    saveSubscriptions: op('recaps.saveSubscriptions', 'mutator'),
    /**
     * Set a custom prompt shaping how a channel's recap is written.
     */
    setCustomPrompt: op('recaps.setCustomPrompt', 'mutator'),
    /**
     * Mark a whole day's recaps seen.
     */
    markSeen: op('recaps.markSeen', 'mutator'),
    /**
     * Mark one channel's recap read.
     */
    markChannelRead: op('recaps.markChannelRead', 'mutator'),
    /**
     * Mark one channel's recap unread again.
     */
    markChannelUnread: op('recaps.markChannelUnread', 'mutator'),
};
