/**
 * Operation Registry Types
 *
 * How an SDK method reaches the server. Two shapes:
 *
 *   SdkOperation  an operation id on the versioned API, resolved server-side
 *   ApiOperation  a versioned REST route the client addresses directly
 *
 * Nothing here names a backend operation. What `projects.update` runs, and how
 * its arguments are shaped, is decided in the backend's `api/sdk/v1/` — so the
 * catalog can be renamed or re-versioned without touching a published client.
 */
// ----- Helper Functions -----
/**
 * Define a direct API operation.
 *
 * @example
 * const searchUsers = api<{ query: string }, User[]>('GET', '/api/sdk/v1/users/search');
 */
export function api(method, path, options) {
    return { type: 'api', method, path, ...options };
}
/**
 * The first row of a list result, or null.
 *
 * For a `mapResult` on a query that is logically singular but whose Zero
 * definition omits `.one()`, so the server sends an array. Declaring the singular
 * type without mapping is the bug this exists to prevent: the caller gets an array
 * typed as an object and every field reads `undefined`.
 *
 * Tolerates a server that does collapse the row, so the same mapping stays correct
 * if `.one()` is added to the query later.
 */
export function firstOrNull(raw) {
    if (Array.isArray(raw))
        return raw[0] ?? null;
    return raw ?? null;
}
/**
 * Define an operation on the versioned API.
 *
 * @example
 * const update = op<{ projectId: string; name?: string }, void>('projects.update', 'mutator');
 */
export function op(id, kind, options) {
    return { type: 'sdk', op: id, kind, ...options };
}
