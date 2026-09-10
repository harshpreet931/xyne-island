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
import type { Call, CallType, CallParticipant, Conversation, RecurringCallSeries, SummaryTemplate } from '../types/index.js';
/** Page cursor for the call and recording listings, ordered by start time. */
export interface CallCursor {
    id: string;
    startedAt: number;
}
export declare const callsOperations: {
    /**
     * Calls currently in progress and visible to the user.
     */
    readonly listActive: import("./types.js").SdkOperation<void, Call[]>;
    /**
     * Calls currently in progress in one channel.
     */
    readonly listActiveInChannel: import("./types.js").SdkOperation<{
        channelId: string;
    }, Call[]>;
    /**
     * Upcoming scheduled calls the user is invited to.
     */
    readonly listScheduled: import("./types.js").SdkOperation<void, Call[]>;
    /**
     * Past calls, most recent first.
     */
    readonly listHistory: import("./types.js").SdkOperation<{
        limit?: number;
        start?: CallCursor;
    }, Call[]>;
    /**
     * Participants of a call.
     */
    readonly listParticipants: import("./types.js").SdkOperation<{
        callId: string;
    }, CallParticipant[]>;
    /**
     * A recurring call series.
     */
    readonly getRecurringSeries: import("./types.js").SdkOperation<{
        seriesId: string;
    }, RecurringCallSeries | null>;
    /**
     * One call-summary template by id.
     */
    readonly getSummaryTemplate: import("./types.js").SdkOperation<{
        templateId: string;
    }, SummaryTemplate | null>;
    /**
     * Summary templates available for call notes.
     */
    readonly listSummaryTemplates: import("./types.js").SdkOperation<void, SummaryTemplate[]>;
    /**
     * Recordings from the user's own calls.
     */
    readonly listRecordings: import("./types.js").SdkOperation<{
        limit?: number;
        start?: CallCursor;
    }, Call[]>;
    /**
     * Standalone recordings the user created.
     */
    readonly listCreatedRecordings: import("./types.js").SdkOperation<{
        limit?: number;
        start?: CallCursor;
        participantId?: string;
    }, Call[]>;
    /**
     * Standalone recordings shared with the user.
     */
    readonly listSharedRecordings: import("./types.js").SdkOperation<{
        limit?: number;
        start?: CallCursor;
        participantId?: string;
    }, Call[]>;
    /**
     * One recording by its room id.
     */
    readonly getRecording: import("./types.js").SdkOperation<{
        callId: string;
    }, Call | null>;
    /**
     * The thread attached to a call.
     */
    readonly getConversation: import("./types.js").SdkOperation<{
        callId: string;
    }, Conversation | null>;
    /**
     * Start a call.
     *
     * `externalId` and `roomLink` must refer to a room that already exists on the
     * realtime server — this operation records the call, it does not provision
     * media. Without a real room the call row will exist but nobody can join.
     */
    readonly initiate: import("./types.js").SdkOperation<{
        callId: string;
        channelId: string;
        callType: CallType;
        externalId: string;
        roomLink: string;
        targetUserIds?: string[];
    }, void>;
    /**
     * Join a call.
     */
    readonly join: import("./types.js").SdkOperation<{
        callId: string;
    }, void>;
    /**
     * Leave a call.
     */
    readonly leave: import("./types.js").SdkOperation<{
        callId: string;
    }, void>;
    /**
     * Decline an incoming call.
     */
    readonly reject: import("./types.js").SdkOperation<{
        callId: string;
    }, void>;
    /**
     * Cancel a call, optionally the whole recurring series.
     */
    readonly cancel: import("./types.js").SdkOperation<{
        callId: string;
        cancelEntireSeries?: boolean;
    }, void>;
    /**
     * Invite more people to a call in progress.
     */
    readonly invite: import("./types.js").SdkOperation<{
        callId: string;
        userIds: string[];
    }, void>;
    /**
     * Attach a canvas to a call for shared notes.
     */
    readonly linkNotesCanvas: import("./types.js").SdkOperation<{
        callId: string;
        notesCanvasId: string;
    }, void>;
    /**
     * Bookmark a moment in a call, for the recording timeline.
     *
     * `timestampSeconds` is an offset from the start of the call, not a clock time.
     */
    readonly markMoment: import("./types.js").SdkOperation<{
        callId: string;
        type: string;
        timestampSeconds: number;
        text: string;
    }, void>;
    /**
     * Ask to be let into a call you were not invited to.
     */
    readonly requestToJoin: import("./types.js").SdkOperation<{
        callId: string;
    }, void>;
    /**
     * Withdraw a pending join request.
     */
    readonly cancelJoinRequest: import("./types.js").SdkOperation<{
        callId: string;
    }, void>;
    /**
     * Admit someone waiting in the lobby.
     */
    readonly approveLobbyRequest: import("./types.js").SdkOperation<{
        callId: string;
        participantId: string;
    }, void>;
    /**
     * Turn away someone waiting in the lobby.
     */
    readonly rejectLobbyRequest: import("./types.js").SdkOperation<{
        callId: string;
        participantId: string;
    }, void>;
};
