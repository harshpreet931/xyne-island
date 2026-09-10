/**
 * Calls Operation Registry
 *
 * Call metadata, scheduling, participation, and recordings.
 *
 * Live media is not part of this API. A call row points at a room provisioned on
 * the realtime server via `externalId` and `roomLink`; the operations here
 * create and manage the row, not the room. `initiate` therefore requires the
 * caller to supply an already-provisioned room — see its note.
 */
import { op } from './types.js';
export const callsOperations = {
    // ----- Reads -----
    /**
     * Calls currently in progress and visible to the user.
     */
    listActive: op('calls.listActive', 'query'),
    /**
     * Calls currently in progress in one channel.
     */
    listActiveInChannel: op('calls.listActiveInChannel', 'query'),
    /**
     * Upcoming scheduled calls the user is invited to.
     */
    listScheduled: op('calls.listScheduled', 'query'),
    /**
     * Past calls, most recent first.
     */
    listHistory: op('calls.listHistory', 'query'),
    /**
     * Participants of a call.
     */
    listParticipants: op('calls.listParticipants', 'query'),
    /**
     * A recurring call series.
     */
    getRecurringSeries: op('calls.getRecurringSeries', 'query'),
    /**
     * One call-summary template by id.
     */
    getSummaryTemplate: op('calls.getSummaryTemplate', 'query'),
    /**
     * Summary templates available for call notes.
     */
    listSummaryTemplates: op('calls.listSummaryTemplates', 'query'),
    // ----- Recordings -----
    /**
     * Recordings from the user's own calls.
     */
    listRecordings: op('calls.listRecordings', 'query'),
    /**
     * Standalone recordings the user created.
     */
    listCreatedRecordings: op('calls.listCreatedRecordings', 'query'),
    /**
     * Standalone recordings shared with the user.
     */
    listSharedRecordings: op('calls.listSharedRecordings', 'query'),
    /**
     * One recording by its room id.
     */
    getRecording: op('calls.getRecording', 'query'),
    /**
     * The thread attached to a call.
     */
    getConversation: op('calls.getConversation', 'query'),
    // ----- Writes -----
    /**
     * Start a call.
     *
     * `externalId` and `roomLink` must refer to a room that already exists on the
     * realtime server — this operation records the call, it does not provision
     * media. Without a real room the call row will exist but nobody can join.
     */
    initiate: op('calls.initiate', 'mutator'),
    /**
     * Join a call.
     */
    join: op('calls.join', 'mutator'),
    /**
     * Leave a call.
     */
    leave: op('calls.leave', 'mutator'),
    /**
     * Decline an incoming call.
     */
    reject: op('calls.reject', 'mutator'),
    /**
     * Cancel a call, optionally the whole recurring series.
     */
    cancel: op('calls.cancel', 'mutator'),
    /**
     * Invite more people to a call in progress.
     */
    invite: op('calls.invite', 'mutator'),
    /**
     * Attach a canvas to a call for shared notes.
     */
    linkNotesCanvas: op('calls.linkNotesCanvas', 'mutator'),
    /**
     * Bookmark a moment in a call, for the recording timeline.
     *
     * `timestampSeconds` is an offset from the start of the call, not a clock time.
     */
    markMoment: op('calls.markMoment', 'mutator'),
    // ----- Lobby -----
    /**
     * Ask to be let into a call you were not invited to.
     */
    requestToJoin: op('calls.requestToJoin', 'mutator'),
    /**
     * Withdraw a pending join request.
     */
    cancelJoinRequest: op('calls.cancelJoinRequest', 'mutator'),
    /**
     * Admit someone waiting in the lobby.
     */
    approveLobbyRequest: op('calls.approveLobbyRequest', 'mutator'),
    /**
     * Turn away someone waiting in the lobby.
     */
    rejectLobbyRequest: op('calls.rejectLobbyRequest', 'mutator'),
};
