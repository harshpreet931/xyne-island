/**
 * User Groups Operation Registry
 *
 * Teams: their membership, and the assignment configuration that decides which
 * member gets the next ticket — on-call state, board weights, and expertise.
 */
import type { RotationInterval, UserAssignmentState, UserExpertiseMapping, UserGroup, UserGroupMember, UserWorkloadMapping } from '../types/index.js';
export declare const userGroupsOperations: {
    /**
     * Every user group.
     */
    readonly list: import("./types.js").SdkOperation<void, UserGroup[]>;
    /**
     * Groups by id.
     */
    readonly getMany: import("./types.js").SdkOperation<{
        groupIds: string[];
    }, UserGroup[]>;
    /**
     * One group.
     */
    readonly get: import("./types.js").SdkOperation<{
        userGroupId: string;
    }, UserGroup | null>;
    /**
     * Search groups by name.
     *
     * `limit` is required by the query and accepts null for no cap.
     */
    readonly search: import("./types.js").SdkOperation<{
        query: string;
        limit?: number;
    }, UserGroup[]>;
    /**
     * Members of a group.
     */
    readonly listMembers: import("./types.js").SdkOperation<{
        userGroupId: string;
    }, UserGroupMember[]>;
    /**
     * Members across several groups.
     */
    readonly listMembersForGroups: import("./types.js").SdkOperation<{
        userGroupIds: string[];
    }, UserGroupMember[]>;
    /**
     * The current user's group memberships.
     */
    readonly listMine: import("./types.js").SdkOperation<void, UserGroupMember[]>;
    /**
     * On-call and availability state for a group's members.
     */
    readonly listAssignmentStates: import("./types.js").SdkOperation<{
        userGroupId: string;
    }, UserAssignmentState[]>;
    /**
     * Assignment states for several groups at once.
     */
    readonly listAssignmentStatesForGroups: import("./types.js").SdkOperation<{
        userGroupIds: string[];
    }, UserAssignmentState[]>;
    /**
     * Per-member workload weightings for a group.
     *
     * Feeds the same assignment routing as `listAssignmentStates`: availability says
     * who *can* take work, this says how much each of them is carrying.
     */
    readonly listWorkloadMappings: import("./types.js").SdkOperation<{
        userGroupId: string;
    }, UserWorkloadMapping[]>;
    /**
     * One user's assignment state across their groups.
     */
    readonly getAssignmentStateForUser: import("./types.js").SdkOperation<{
        userId: string;
    }, UserAssignmentState[]>;
    /**
     * Which members of a group have expertise on a board.
     */
    readonly listExpertise: import("./types.js").SdkOperation<{
        userGroupId: string;
        boardId: string;
    }, UserExpertiseMapping[]>;
    /**
     * Rename a group, or change members' roles and responsibilities.
     *
     * `userRoleUpdates` and `userResponsibilityUpdates` are maps keyed by user id.
     */
    readonly update: import("./types.js").SdkOperation<{
        userGroupId: string;
        name?: string;
        alias?: string;
        description?: string;
        userRoleUpdates?: Record<string, string>;
        userResponsibilityUpdates?: Record<string, string>;
    }, void>;
    /**
     * Delete a group.
     */
    readonly delete: import("./types.js").SdkOperation<{
        userGroupId: string;
    }, void>;
    /**
     * Deactivate a group without deleting it — it stops receiving assignments.
     */
    readonly deactivate: import("./types.js").SdkOperation<{
        userGroupId: string;
    }, void>;
    /**
     * Reactivate a group.
     */
    readonly reactivate: import("./types.js").SdkOperation<{
        userGroupId: string;
    }, void>;
    /**
     * Add users to a group.
     */
    readonly addUsers: import("./types.js").SdkOperation<{
        userGroupId: string;
        userIds: string[];
        mappingIds: Record<string, string>;
        roleIds?: string[];
    }, void>;
    /**
     * Remove users from a group.
     */
    readonly removeUsers: import("./types.js").SdkOperation<{
        userGroupId: string;
        userIds: string[];
    }, void>;
    /**
     * Update on-call state, board weights, and expertise for a group in one go.
     *
     * The shapes here are nested and interdependent, so they are passed through
     * rather than modelled: read the current configuration first and send it back
     * modified.
     */
    readonly updateAssignmentConfig: import("./types.js").SdkOperation<{
        userGroupId: string;
        userStates: unknown;
        userMappings: unknown;
        boardWeight: unknown;
        expertiseMappings: unknown;
        stateIds?: unknown;
        complexityScoreId?: string;
        mappingIds?: unknown;
    }, void>;
    /**
     * Turn automatic on-call rotation on or off for a group.
     */
    readonly toggleAutoRotation: import("./types.js").SdkOperation<{
        userGroupId: string;
        autoRotationEnabled: boolean;
        rotationInterval?: RotationInterval;
        rotationStartDate?: number;
    }, void>;
};
