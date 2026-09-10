/**
 * Boards Operation Registry
 *
 * Boards, their stages, stage transitions, and SLA policies.
 *
 * Tickets reference a stage by `stageName`, not by stage id, so stage renames
 * are meaningful operations rather than cosmetic ones.
 */
import { op } from './types.js';
export const boardsOperations = {
    // ----- Reads -----
    /**
     * Every board in the workspace.
     */
    list: op('boards.list', 'query'),
    /**
     * Boards in a project.
     */
    listByProject: op('boards.listByProject', 'query'),
    /**
     * Boards in a project, id and name only — for pickers.
     */
    listByProjectLite: op('boards.listByProjectLite', 'query'),
    /**
     * Boards by id.
     */
    getMany: op('boards.getMany', 'query'),
    /**
     * One board.
     */
    get: op('boards.get', 'query'),
    /**
     * One board with its stages.
     */
    getDetail: op('boards.getDetail', 'query'),
    /**
     * One board with stages, transitions, and approvers resolved.
     */
    getFullDetail: op('boards.getFullDetail', 'query'),
    /**
     * Stages of a board, in sequence order.
     */
    listStages: op('boards.listStages', 'query'),
    /**
     * Stages across several boards.
     */
    listStagesForBoards: op('boards.listStagesForBoards', 'query'),
    /**
     * Stages for every board in a project, optionally of one board type.
     */
    listStagesByProject: op('boards.listStagesByProject', 'query'),
    /**
     * The boards mapped to a channel, with each board joined in.
     *
     * Reads `channel_board_mappings`, not `boards`, so a row is the mapping and
     * the board hangs off its `board` relation. A channel can surface more than
     * one board; ordering is by when the mapping was made.
     */
    listByChannel: op('boards.listByChannel', 'query'),
    /**
     * Allowed stage transitions on a non-linear board.
     */
    listTransitions: op('boards.listTransitions', 'query'),
    /**
     * Stage transitions across several boards.
     */
    listTransitionsForBoards: op('boards.listTransitionsForBoards', 'query'),
    /**
     * SLA policies on a board, one per priority.
     */
    listSlaPolicies: op('boards.listSlaPolicies', 'query'),
    /**
     * SLA policies across several boards.
     */
    listSlaPoliciesForBoards: op('boards.listSlaPoliciesForBoards', 'query'),
    /**
     * Complexity scores a user group has assigned to boards.
     */
    listComplexityScores: op('boards.listComplexityScores', 'query'),
    /**
     * Saved filter views on a board.
     */
    listSavedViews: op('boards.listSavedViews', 'query'),
    /**
     * Form mappings for several boards.
     */
    listFormMappings: op('boards.listFormMappings', 'query'),
    // ----- Writes -----
    /**
     * Update a board.
     *
     * When `stages` is supplied it replaces the board's stage list wholesale, so
     * send the complete set — including stages you are not changing, with their
     * existing ids — or they will be removed.
     */
    update: op('boards.update', 'mutator'),
    /**
     * Delete a board.
     */
    delete: op('boards.delete', 'mutator'),
    /**
     * Create or update a board's SLA policy for one priority.
     */
    upsertSlaPolicy: op('boards.upsertSlaPolicy', 'mutator'),
    /**
     * Remove an SLA policy.
     */
    deleteSlaPolicy: op('boards.deleteSlaPolicy', 'mutator'),
    /**
     * Replace a non-linear board's transition graph.
     */
    syncTransitions: op('boards.syncTransitions', 'mutator'),
    /**
     * Replace a flow board's plan — its nodes, groups, and decision routing.
     *
     * A whole-plan replace, not a patch: anything absent from `plan.nodes` is
     * removed. Read the current plan first and edit it.
     */
    updateFlowPlan: op('boards.updateFlowPlan', 'mutator'),
};
