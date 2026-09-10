/**
 * Automations Operation Registry
 *
 * Event-triggered automations and the workflows they belong to.
 *
 * Automations move through an approval lifecycle rather than being switched on
 * directly: a proposal is submitted, approved or rejected, then activated. The
 * operations here follow that sequence, and each is a distinct mutator so the
 * transitions stay auditable.
 */
import { op } from './types.js';
export const automationsOperations = {
    // ----- Reads -----
    /**
     * Every automation.
     */
    list: op('automations.list', 'query'),
    /**
     * One automation.
     */
    get: op('automations.get', 'query'),
    /**
     * Workflows, paginated. Automations are one workflow type among several.
     */
    listWorkflows: op('automations.listWorkflows', 'query'),
    // ----- Authoring -----
    /**
     * Propose a new automation. It starts as a draft and must be submitted and
     * approved before it can run.
     */
    createProposal: op('automations.createProposal', 'mutator'),
    /**
     * Edit an automation.
     */
    update: op('automations.update', 'mutator'),
    /**
     * Delete an automation.
     */
    delete: op('automations.delete', 'mutator'),
    // ----- Approval lifecycle -----
    /**
     * Send a draft for approval.
     */
    submitForApproval: op('automations.submitForApproval', 'mutator'),
    /**
     * Withdraw a submission before it is decided.
     */
    revoke: op('automations.revoke', 'mutator'),
    /**
     * Approve a submitted automation.
     */
    approve: op('automations.approve', 'mutator'),
    /**
     * Reject a submitted automation. A note explaining why is required.
     */
    reject: op('automations.reject', 'mutator'),
    // ----- Run state -----
    /**
     * Start running an approved automation.
     */
    activate: op('automations.activate', 'mutator'),
    /**
     * Stop running an automation without deleting it.
     */
    disable: op('automations.disable', 'mutator'),
    /**
     * Retire an automation.
     */
    archive: op('automations.archive', 'mutator'),
};
