/**
 * Incidents Operation Registry
 *
 * Root-cause analyses and everything attached to them: recorded impacts,
 * corrective actions (CoE), and the release attributions that connect an
 * incident to the deploy that caused it.
 *
 * An RCA hangs off a ticket. Impacts and CoE items hang off the RCA.
 */
import { op } from './types.js';
export const incidentsOperations = {
    // ----- Reads -----
    /**
     * Every RCA, most recent first.
     */
    listRcas: op('incidents.listRcas', 'query'),
    /**
     * One RCA.
     */
    getRca: op('incidents.getRca', 'query'),
    /**
     * Impacts recorded against an RCA.
     */
    listImpactAttachments: op('incidents.listImpactAttachments', 'query'),
    /**
     * Attachments across several impacts.
     */
    listAttachmentsForImpacts: op('incidents.listAttachmentsForImpacts', 'query'),
    /**
     * Release tickets.
     */
    listReleaseTickets: op('incidents.listReleaseTickets', 'query'),
    /**
     * Search release tickets.
     */
    searchReleaseTickets: op('incidents.searchReleaseTickets', 'query'),
    /**
     * Application release tickets for a release.
     */
    listApplicationReleaseTickets: op('incidents.listApplicationReleaseTickets', 'query'),
    /**
     * Changes bundled into a release.
     */
    listReleaseChanges: op('incidents.listReleaseChanges', 'query'),
    /**
     * Form values captured against a release's changes.
     */
    listReleaseChangeFormValues: op('incidents.listReleaseChangeFormValues', 'query'),
    /**
     * Change-log entries for a release.
     */
    listReleaseChangeLog: op('incidents.listReleaseChangeLog', 'query'),
    // ----- RCA -----
    /**
     * Open an RCA against a ticket.
     */
    createRca: op('incidents.createRca', 'mutator'),
    /**
     * Update an RCA.
     */
    updateRca: op('incidents.updateRca', 'mutator'),
    // ----- Impacts -----
    /**
     * Record an impact against an RCA.
     */
    createImpact: op('incidents.createImpact', 'mutator'),
    /**
     * Update a recorded impact.
     */
    updateImpact: op('incidents.updateImpact', 'mutator'),
    /**
     * Remove a recorded impact.
     */
    deleteImpact: op('incidents.deleteImpact', 'mutator'),
    // ----- Corrective actions -----
    /**
     * Add a corrective action to an RCA.
     */
    createAction: op('incidents.createAction', 'mutator'),
    /**
     * Update a corrective action.
     */
    updateAction: op('incidents.updateAction', 'mutator'),
    /**
     * Remove a corrective action.
     */
    deleteAction: op('incidents.deleteAction', 'mutator'),
    // ----- Release attribution -----
    /**
     * Attribute a ticket to a release.
     */
    createAttribution: op('incidents.createAttribution', 'mutator'),
    /**
     * Update an attribution.
     */
    updateAttribution: op('incidents.updateAttribution', 'mutator'),
    /**
     * Remove an attribution.
     */
    deleteAttribution: op('incidents.deleteAttribution', 'mutator'),
    /**
     * Move an application release ticket to another stage.
     */
    updateReleaseTicketStatus: op('incidents.updateReleaseTicketStatus', 'mutator'),
    /**
     * Record who tested a release ticket.
     */
    setReleaseTicketTestedBy: op('incidents.setReleaseTicketTestedBy', 'mutator'),
    /**
     * A release's event log, newest first. `FORM_SAVED` events are filtered out
     * server-side as noise.
     */
    listReleaseEvents: op('incidents.listReleaseEvents', 'query'),
};
