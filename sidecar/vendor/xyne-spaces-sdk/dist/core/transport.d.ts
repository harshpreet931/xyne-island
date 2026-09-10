/**
 * Transport Layer
 *
 * Routes SDK operations to the versioned API:
 * - Operation ids via /api/sdk/v1/query and /api/sdk/v1/mutate
 * - Versioned REST routes via /api/sdk/v1/*
 */
import type { Operation } from '../registry/types.js';
import type { HttpClient } from './http.js';
export declare class Transport {
    private http;
    constructor(http: HttpClient);
    /**
     * The access token currently in use.
     *
     * Exposed so a resource can read the caller's own identity out of its token —
     * see `core/token.ts`. Not for authorization decisions.
     */
    getToken(): string | undefined;
    /**
     * Execute an operation against the appropriate backend.
     */
    execute<TArgs, TResult>(operation: Operation<TArgs, TResult>, args: TArgs): Promise<TResult>;
    /**
     * Execute an operation on the versioned API.
     *
     * The request carries the SDK's own operation id and nothing else about the
     * backend: `{ op: 'projects.update', args }`. Resolving that to a catalog
     * operation is the server's job, which is what lets the catalog move without
     * breaking a published client.
     *
     * A write echoes back any id the server minted for it, so a caller that
     * created a row learns its id without having had to invent one.
     */
    private executeV1;
    /**
     * Execute a direct API call
     */
    private executeApi;
}
