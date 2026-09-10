/**
 * Boards Operation Registry
 *
 * Boards, their stages, stage transitions, and SLA policies.
 *
 * Tickets reference a stage by `stageName`, not by stage id, so stage renames
 * are meaningful operations rather than cosmetic ones.
 */
import type { Board, BoardComplexityScore, BoardSlaPolicy, ChannelBoardMapping, FlowPlan, FormContextMapping, SavedView, Stage, StageTransition, StageTransitionInput, TicketPriority, TicketStatusV2 } from '../types/index.js';
/** A stage as accepted by {@link boardsOperations.update}, which replaces the whole stage list. */
export interface StageInput {
    /** Omit to create a new stage; pass an existing id to update it. */
    id?: string;
    name: string;
    sequenceNumber: number;
    eta?: number;
    defaultTicketStatusV2?: TicketStatusV2;
    formId?: string;
    requestApprovalOnEntry?: boolean;
    approverIds?: string[];
    approvers?: Array<{
        approverId: string;
        approverType: 'USER' | 'ROLE';
    }>;
}
export declare const boardsOperations: {
    /**
     * Every board in the workspace.
     */
    readonly list: import("./types.js").SdkOperation<void, Board[]>;
    /**
     * Boards in a project.
     */
    readonly listByProject: import("./types.js").SdkOperation<{
        projectId: string;
    }, Board[]>;
    /**
     * Boards in a project, id and name only — for pickers.
     */
    readonly listByProjectLite: import("./types.js").SdkOperation<{
        projectId: string;
    }, Board[]>;
    /**
     * Boards by id.
     */
    readonly getMany: import("./types.js").SdkOperation<{
        boardIds: string[];
    }, Board[]>;
    /**
     * One board.
     */
    readonly get: import("./types.js").SdkOperation<{
        boardId: string;
    }, Board | null>;
    /**
     * One board with its stages.
     */
    readonly getDetail: import("./types.js").SdkOperation<{
        boardId: string;
    }, Board | null>;
    /**
     * One board with stages, transitions, and approvers resolved.
     */
    readonly getFullDetail: import("./types.js").SdkOperation<{
        boardId: string;
    }, Board | null>;
    /**
     * Stages of a board, in sequence order.
     */
    readonly listStages: import("./types.js").SdkOperation<{
        boardId: string;
    }, Stage[]>;
    /**
     * Stages across several boards.
     */
    readonly listStagesForBoards: import("./types.js").SdkOperation<{
        boardIds: string[];
    }, Stage[]>;
    /**
     * Stages for every board in a project, optionally of one board type.
     */
    readonly listStagesByProject: import("./types.js").SdkOperation<{
        projectId: string;
        boardType?: string;
    }, Stage[]>;
    /**
     * The boards mapped to a channel, with each board joined in.
     *
     * Reads `channel_board_mappings`, not `boards`, so a row is the mapping and
     * the board hangs off its `board` relation. A channel can surface more than
     * one board; ordering is by when the mapping was made.
     */
    readonly listByChannel: import("./types.js").SdkOperation<{
        channelId: string;
    }, ChannelBoardMapping[]>;
    /**
     * Allowed stage transitions on a non-linear board.
     */
    readonly listTransitions: import("./types.js").SdkOperation<{
        boardId: string;
    }, StageTransition[]>;
    /**
     * Stage transitions across several boards.
     */
    readonly listTransitionsForBoards: import("./types.js").SdkOperation<{
        boardIds: string[];
    }, StageTransition[]>;
    /**
     * SLA policies on a board, one per priority.
     */
    readonly listSlaPolicies: import("./types.js").SdkOperation<{
        boardId: string;
    }, BoardSlaPolicy[]>;
    /**
     * SLA policies across several boards.
     */
    readonly listSlaPoliciesForBoards: import("./types.js").SdkOperation<{
        boardIds: string[];
    }, BoardSlaPolicy[]>;
    /**
     * Complexity scores a user group has assigned to boards.
     */
    readonly listComplexityScores: import("./types.js").SdkOperation<{
        userGroupId: string;
    }, BoardComplexityScore[]>;
    /**
     * Saved filter views on a board.
     */
    readonly listSavedViews: import("./types.js").SdkOperation<{
        boardId: string;
    }, SavedView[]>;
    /**
     * Form mappings for several boards.
     */
    readonly listFormMappings: import("./types.js").SdkOperation<{
        boardIds: string[];
    }, FormContextMapping[]>;
    /**
     * Update a board.
     *
     * When `stages` is supplied it replaces the board's stage list wholesale, so
     * send the complete set — including stages you are not changing, with their
     * existing ids — or they will be removed.
     */
    readonly update: import("./types.js").SdkOperation<{
        boardId: string;
        name?: string;
        description?: string;
        projectId?: string;
        boardType?: string;
        metadata?: unknown;
        stages?: StageInput[];
    }, void>;
    /**
     * Delete a board.
     */
    readonly delete: import("./types.js").SdkOperation<{
        boardId: string;
    }, void>;
    /**
     * Create or update a board's SLA policy for one priority.
     */
    readonly upsertSlaPolicy: import("./types.js").SdkOperation<{
        id: string;
        boardId: string;
        priority: TicketPriority;
        responseHours: number;
        resolutionHours: number;
        businessHoursOnly: boolean;
        timezone: string;
        workdayStart: number;
        workdayEnd: number;
        isActive: boolean;
    }, void>;
    /**
     * Remove an SLA policy.
     */
    readonly deleteSlaPolicy: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Replace a non-linear board's transition graph.
     */
    readonly syncTransitions: import("./types.js").SdkOperation<{
        boardId: string;
        transitions: StageTransitionInput[];
    }, void>;
    /**
     * Replace a flow board's plan — its nodes, groups, and decision routing.
     *
     * A whole-plan replace, not a patch: anything absent from `plan.nodes` is
     * removed. Read the current plan first and edit it.
     */
    readonly updateFlowPlan: import("./types.js").SdkOperation<{
        boardId: string;
        plan: FlowPlan;
    }, void>;
};
