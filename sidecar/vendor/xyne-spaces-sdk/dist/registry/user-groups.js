/**
 * User Groups Operation Registry
 *
 * Teams: their membership, and the assignment configuration that decides which
 * member gets the next ticket — on-call state, board weights, and expertise.
 */
import { op } from './types.js';
export const userGroupsOperations = {
    // ----- Reads -----
    /**
     * Every user group.
     */
    list: op('userGroups.list', 'query'),
    /**
     * Groups by id.
     */
    getMany: op('userGroups.getMany', 'query'),
    /**
     * One group.
     */
    get: op('userGroups.get', 'query'),
    /**
     * Search groups by name.
     *
     * `limit` is required by the query and accepts null for no cap.
     */
    search: op('userGroups.search', 'query'),
    /**
     * Members of a group.
     */
    listMembers: op('userGroups.listMembers', 'query'),
    /**
     * Members across several groups.
     */
    listMembersForGroups: op('userGroups.listMembersForGroups', 'query'),
    /**
     * The current user's group memberships.
     */
    listMine: op('userGroups.listMine', 'query'),
    /**
     * On-call and availability state for a group's members.
     */
    listAssignmentStates: op('userGroups.listAssignmentStates', 'query'),
    /**
     * Assignment states for several groups at once.
     */
    listAssignmentStatesForGroups: op('userGroups.listAssignmentStatesForGroups', 'query'),
    /**
     * Per-member workload weightings for a group.
     *
     * Feeds the same assignment routing as `listAssignmentStates`: availability says
     * who *can* take work, this says how much each of them is carrying.
     */
    listWorkloadMappings: op('userGroups.listWorkloadMappings', 'query'),
    /**
     * One user's assignment state across their groups.
     */
    getAssignmentStateForUser: op('userGroups.getAssignmentStateForUser', 'query'),
    /**
     * Which members of a group have expertise on a board.
     */
    listExpertise: op('userGroups.listExpertise', 'query'),
    // ----- Writes -----
    /**
     * Rename a group, or change members' roles and responsibilities.
     *
     * `userRoleUpdates` and `userResponsibilityUpdates` are maps keyed by user id.
     */
    update: op('userGroups.update', 'mutator'),
    /**
     * Delete a group.
     */
    delete: op('userGroups.delete', 'mutator'),
    /**
     * Deactivate a group without deleting it — it stops receiving assignments.
     */
    deactivate: op('userGroups.deactivate', 'mutator'),
    /**
     * Reactivate a group.
     */
    reactivate: op('userGroups.reactivate', 'mutator'),
    /**
     * Add users to a group.
     */
    addUsers: op('userGroups.addUsers', 'mutator'),
    /**
     * Remove users from a group.
     */
    removeUsers: op('userGroups.removeUsers', 'mutator'),
    // ----- Assignment configuration -----
    /**
     * Update on-call state, board weights, and expertise for a group in one go.
     *
     * The shapes here are nested and interdependent, so they are passed through
     * rather than modelled: read the current configuration first and send it back
     * modified.
     */
    updateAssignmentConfig: op('userGroups.updateAssignmentConfig', 'mutator'),
    /**
     * Turn automatic on-call rotation on or off for a group.
     */
    toggleAutoRotation: op('userGroups.toggleAutoRotation', 'mutator'),
};
