/**
 * Dashboards Operation Registry
 *
 * Dashboards, the saved queries that feed them, and the layout of their tiles.
 *
 * A query is defined once and mapped onto a dashboard; `mappingId` is that
 * placement, which is what reordering and removal operate on.
 */
import type { Dashboard, DashboardLayoutUpdate } from '../types/index.js';
export declare const dashboardsOperations: {
    /**
     * Every dashboard.
     */
    readonly list: import("./types.js").SdkOperation<void, Dashboard[]>;
    /**
     * One dashboard with its components.
     */
    readonly get: import("./types.js").SdkOperation<{
        dashboardId: string;
    }, Dashboard | null>;
    /**
     * Create or update a dashboard.
     *
     * `createdBy` is taken as an argument rather than from the session — pass the
     * acting user's id, available from `sdk.users.me()`.
     */
    readonly upsert: import("./types.js").SdkOperation<{
        id: string;
        name: string;
        createdBy: string;
        description?: string;
    }, void>;
    /**
     * Delete a dashboard.
     */
    readonly delete: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Move tiles around a dashboard.
     */
    readonly updateLayout: import("./types.js").SdkOperation<{
        updates: DashboardLayoutUpdate[];
    }, void>;
    /**
     * Create or update a saved query, optionally placing it on a dashboard.
     */
    readonly upsertQuery: import("./types.js").SdkOperation<{
        id: string;
        title: string;
        queryJson: unknown;
        createdBy: string;
        dashboardId?: string;
        mappingId?: string;
        entityType?: string;
        targetEntity?: string;
        visualType?: string;
    }, void>;
    /**
     * Delete a saved query.
     */
    readonly deleteQuery: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Reorder a dashboard's tiles, by placement id.
     */
    readonly reorderQueries: import("./types.js").SdkOperation<{
        orderedMappingIds: string[];
    }, void>;
};
