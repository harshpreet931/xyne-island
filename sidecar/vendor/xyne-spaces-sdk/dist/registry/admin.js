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
import { op } from './types.js';
export const adminOperations = {
    // ----- Workspace -----
    /**
     * One workspace.
     */
    getWorkspace: op('admin.getWorkspace', 'query'),
    /**
     * Organizations attached to a workspace.
     */
    listWorkspaceOrgs: op('admin.listWorkspaceOrgs', 'query'),
    /**
     * Every active organization, for attaching to a workspace.
     */
    listAvailableOrgs: op('admin.listAvailableOrgs', 'query'),
    /**
     * Rename a workspace or change its settings.
     */
    updateWorkspace: op('admin.updateWorkspace', 'mutator'),
    // ----- Organizations -----
    /**
     * Create an organization and attach it to a workspace, with a first member.
     */
    createOrg: op('admin.createOrg', 'mutator'),
    /**
     * Attach an existing organization to a workspace.
     */
    addOrgToWorkspace: op('admin.addOrgToWorkspace', 'mutator'),
    /**
     * Detach an organization from a workspace.
     */
    removeOrgFromWorkspace: op('admin.removeOrgFromWorkspace', 'mutator'),
    // ----- Org members -----
    /**
     * Members of an organization.
     */
    listOrgMembers: op('admin.listOrgMembers', 'query'),
    /**
     * One org member.
     */
    getOrgMember: op('admin.getOrgMember', 'query'),
    /**
     * Add someone to an organization by email.
     */
    addOrgMember: op('admin.addOrgMember', 'mutator'),
    /**
     * Change an org member's role.
     */
    updateOrgMemberRole: op('admin.updateOrgMemberRole', 'mutator'),
    /**
     * Remove someone from an organization.
     *
     * A soft delete — `leftAt` is stamped so the member drops out of active
     * queries while their history stays intact.
     */
    removeOrgMember: op('admin.removeOrgMember', 'mutator'),
    // ----- Workspace users -----
    /**
     * Change a user's workspace role.
     */
    updateUserRole: op('admin.updateUserRole', 'mutator'),
    /**
     * Remove a user from a workspace.
     */
    removeUser: op('admin.removeUser', 'mutator'),
    // ----- Invitations -----
    /**
     * Outstanding invitations.
     */
    listInvitations: op('admin.listInvitations', 'query'),
    /**
     * Revoke an invitation.
     */
    revokeInvitation: op('admin.revokeInvitation', 'mutator'),
    // ----- Roles -----
    /**
     * Roles defined in the workspace.
     */
    listRoles: op('admin.listRoles', 'query'),
    /**
     * One role.
     */
    getRole: op('admin.getRole', 'query'),
    /**
     * Create a role.
     */
    createRole: op('admin.createRole', 'mutator'),
    /**
     * Rename a role or change its description.
     */
    updateRole: op('admin.updateRole', 'mutator'),
    /**
     * Assign users to a role.
     */
    addRoleMembers: op('admin.addRoleMembers', 'mutator'),
    /**
     * Remove role assignments, by mapping id.
     */
    removeRoleMembers: op('admin.removeRoleMembers', 'mutator'),
    // ----- Resource access -----
    /**
     * Resources that can have access granted on them.
     */
    listResources: op('admin.listResources', 'query'),
    /**
     * A user's resource-level grants.
     */
    listUserAccess: op('admin.listUserAccess', 'query'),
    /**
     * Grant access to resources. Takes a batch.
     */
    grantAccess: op('admin.grantAccess', 'mutator'),
    /**
     * Change existing grants. Takes a batch.
     */
    updateAccess: op('admin.updateAccess', 'mutator'),
    /**
     * Revoke grants by id.
     */
    revokeAccess: op('admin.revokeAccess', 'mutator'),
    // ----- Apps -----
    /**
     * Apps installed in the workspace.
     */
    listInstalledApps: op('admin.listInstalledApps', 'query'),
    /**
     * Apps published by the organization.
     */
    listOrgApps: op('admin.listOrgApps', 'query'),
    /**
     * Apps available to install.
     */
    listMarketplaceApps: op('admin.listMarketplaceApps', 'query'),
    /**
     * Update an app's name, description, or webhook URL.
     */
    updateApp: op('admin.updateApp', 'mutator'),
};
