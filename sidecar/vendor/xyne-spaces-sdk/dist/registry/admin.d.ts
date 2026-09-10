/**
 * Admin Operation Registry
 *
 * Workspace and organization administration: orgs and their members, roles,
 * invitations, resource-level access grants, and installed apps.
 *
 * These operations change who can do what. Most require an elevated workspace
 * or org role, and the server enforces that independently — an SDK call with an
 * under-privileged token is rejected rather than silently narrowed.
 */
import type { AccessResource, OrgRole, App, InstalledApp, Invitation, OrgMember, Organization, ResourceAccess, ResourceAccessGrant, ResourceAccessUpdate, Role, Workspace, WorkspaceOrganization, WorkspaceUpdate, WorkspaceUserUpdate } from '../types/index.js';
/** Page cursor for the app listings, ordered by creation. */
export interface AppCursor {
    id: string;
    createdAt: number;
}
/** Page cursor for the role listing. */
export interface RoleCursor {
    id: string;
    createdAt: number;
}
export declare const adminOperations: {
    /**
     * One workspace.
     */
    readonly getWorkspace: import("./types.js").SdkOperation<{
        workspaceId: string;
    }, Workspace | null>;
    /**
     * Organizations attached to a workspace.
     */
    readonly listWorkspaceOrgs: import("./types.js").SdkOperation<{
        workspaceId: string;
    }, WorkspaceOrganization[]>;
    /**
     * Every active organization, for attaching to a workspace.
     */
    readonly listAvailableOrgs: import("./types.js").SdkOperation<void, Organization[]>;
    /**
     * Rename a workspace or change its settings.
     */
    readonly updateWorkspace: import("./types.js").SdkOperation<{
        workspaceId: string;
        updates: WorkspaceUpdate;
    }, void>;
    /**
     * Create an organization and attach it to a workspace, with a first member.
     */
    readonly createOrg: import("./types.js").SdkOperation<{
        orgId: string;
        workspaceOrgId: string;
        memberId: string;
        orgName: string;
        workspaceId: string;
        orgDescription?: string;
    }, void>;
    /**
     * Attach an existing organization to a workspace.
     */
    readonly addOrgToWorkspace: import("./types.js").SdkOperation<{
        id: string;
        workspaceId: string;
        orgId: string;
    }, void>;
    /**
     * Detach an organization from a workspace.
     */
    readonly removeOrgFromWorkspace: import("./types.js").SdkOperation<{
        workspaceId: string;
        orgId: string;
    }, void>;
    /**
     * Members of an organization.
     */
    readonly listOrgMembers: import("./types.js").SdkOperation<{
        orgId: string;
    }, OrgMember[]>;
    /**
     * One org member.
     */
    readonly getOrgMember: import("./types.js").SdkOperation<{
        memberId: string;
    }, OrgMember | null>;
    /**
     * Add someone to an organization by email.
     */
    readonly addOrgMember: import("./types.js").SdkOperation<{
        memberId: string;
        orgId: string;
        email: string;
        role: OrgRole;
    }, void>;
    /**
     * Change an org member's role.
     */
    readonly updateOrgMemberRole: import("./types.js").SdkOperation<{
        memberId: string;
        role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
    }, void>;
    /**
     * Remove someone from an organization.
     *
     * A soft delete — `leftAt` is stamped so the member drops out of active
     * queries while their history stays intact.
     */
    readonly removeOrgMember: import("./types.js").SdkOperation<{
        memberId: string;
    }, void>;
    /**
     * Change a user's workspace role.
     */
    readonly updateUserRole: import("./types.js").SdkOperation<{
        workspaceId: string;
        userId: string;
        updates: WorkspaceUserUpdate;
    }, void>;
    /**
     * Remove a user from a workspace.
     */
    readonly removeUser: import("./types.js").SdkOperation<{
        workspaceId: string;
        userId: string;
    }, void>;
    /**
     * Outstanding invitations.
     */
    readonly listInvitations: import("./types.js").SdkOperation<void, Invitation[]>;
    /**
     * Revoke an invitation.
     */
    readonly revokeInvitation: import("./types.js").SdkOperation<{
        invitationId: string;
    }, void>;
    /**
     * Roles defined in the workspace.
     */
    readonly listRoles: import("./types.js").SdkOperation<{
        limit?: number;
        start?: RoleCursor;
    }, Role[]>;
    /**
     * One role.
     */
    readonly getRole: import("./types.js").SdkOperation<{
        id: string;
    }, Role | null>;
    /**
     * Create a role.
     */
    readonly createRole: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        description?: string;
    }, void>;
    /**
     * Rename a role or change its description.
     */
    readonly updateRole: import("./types.js").SdkOperation<{
        id: string;
        name?: string;
        description?: string;
    }, void>;
    /**
     * Assign users to a role.
     */
    readonly addRoleMembers: import("./types.js").SdkOperation<{
        roleId: string;
        userIds: string[];
        mappingIds: Record<string, string>;
    }, void>;
    /**
     * Remove role assignments, by mapping id.
     */
    readonly removeRoleMembers: import("./types.js").SdkOperation<{
        mappingIds: string[];
    }, void>;
    /**
     * Resources that can have access granted on them.
     */
    readonly listResources: import("./types.js").SdkOperation<void, AccessResource[]>;
    /**
     * A user's resource-level grants.
     */
    readonly listUserAccess: import("./types.js").SdkOperation<{
        userId: string;
    }, ResourceAccess[]>;
    /**
     * Grant access to resources. Takes a batch.
     */
    readonly grantAccess: import("./types.js").SdkOperation<{
        grants: ResourceAccessGrant[];
    }, void>;
    /**
     * Change existing grants. Takes a batch.
     */
    readonly updateAccess: import("./types.js").SdkOperation<{
        updates: ResourceAccessUpdate[];
    }, void>;
    /**
     * Revoke grants by id.
     */
    readonly revokeAccess: import("./types.js").SdkOperation<{
        ids: string[];
    }, void>;
    /**
     * Apps installed in the workspace.
     */
    readonly listInstalledApps: import("./types.js").SdkOperation<{
        limit?: number;
        start?: AppCursor;
    }, InstalledApp[]>;
    /**
     * Apps published by the organization.
     */
    readonly listOrgApps: import("./types.js").SdkOperation<{
        orgId: string;
        limit?: number;
        start?: AppCursor;
    }, App[]>;
    /**
     * Apps available to install.
     */
    readonly listMarketplaceApps: import("./types.js").SdkOperation<{
        limit?: number;
        start?: AppCursor;
    }, App[]>;
    /**
     * Update an app's name, description, or webhook URL.
     */
    readonly updateApp: import("./types.js").SdkOperation<{
        appId: string;
        name?: string;
        description?: string;
        webhookUrl?: string;
    }, void>;
};
