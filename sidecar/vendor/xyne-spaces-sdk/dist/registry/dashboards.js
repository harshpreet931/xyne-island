/**
 * Dashboards Operation Registry
 *
 * Dashboards, the saved queries that feed them, and the layout of their tiles.
 *
 * A query is defined once and mapped onto a dashboard; `mappingId` is that
 * placement, which is what reordering and removal operate on.
 */
import { op } from './types.js';
export const dashboardsOperations = {
    // ----- Reads -----
    /**
     * Every dashboard.
     */
    list: op('dashboards.list', 'query'),
    /**
     * One dashboard with its components.
     */
    get: op('dashboards.get', 'query'),
    // ----- Writes -----
    /**
     * Create or update a dashboard.
     *
     * `createdBy` is taken as an argument rather than from the session — pass the
     * acting user's id, available from `sdk.users.me()`.
     */
    upsert: op('dashboards.upsert', 'mutator'),
    /**
     * Delete a dashboard.
     */
    delete: op('dashboards.delete', 'mutator'),
    /**
     * Move tiles around a dashboard.
     */
    updateLayout: op('dashboards.updateLayout', 'mutator'),
    // ----- Saved queries -----
    /**
     * Create or update a saved query, optionally placing it on a dashboard.
     */
    upsertQuery: op('dashboards.upsertQuery', 'mutator'),
    /**
     * Delete a saved query.
     */
    deleteQuery: op('dashboards.deleteQuery', 'mutator'),
    /**
     * Reorder a dashboard's tiles, by placement id.
     */
    reorderQueries: op('dashboards.reorderQueries', 'mutator'),
};
