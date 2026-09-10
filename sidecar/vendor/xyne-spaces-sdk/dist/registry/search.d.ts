/**
 * Search Operation Registry
 *
 * Maps SDK search methods to backend operations.
 * Search uses direct API endpoints (not Zero queries) since it delegates to Vespa.
 */
import type { SearchOptions, SearchResponse, SearchSchemaName } from '../types/index.js';
/**
 * Search operations registry.
 *
 * Search operations use direct API calls since they delegate to Vespa,
 * not Zero queries.
 */
export declare const searchOperations: {
    /**
     * Search across messages, tickets, files, channels, calls, and users.
     */
    readonly query: import("./types.js").ApiOperation<SearchOptions, SearchResponse>;
    /**
     * Get search schema for building advanced queries.
     */
    readonly getSchema: import("./types.js").ApiOperation<{
        schema: SearchSchemaName;
    }, string>;
};
