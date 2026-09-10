/**
 * @xyne/spaces-sdk
 *
 * TypeScript SDK for the Xyne Spaces API.
 *
 * @example
 * ```typescript
 * import { createClient } from '@xyne/spaces-sdk';
 *
 * const sdk = createClient({
 *   apiKey: process.env.XYNE_SPACES_API_KEY,
 * });
 *
 * // List users
 * const users = await sdk.users.list();
 *
 * // Search
 * const results = await sdk.search.query({ q: 'project update' });
 * ```
 *
 * @packageDocumentation
 */
// ----- Client -----
export { createClient, SpacesClient } from './client.js';
// ----- Claw (remote agents, relayed through Spaces) -----
export { ClawResource } from './resources/claw.js';
// ----- Error Types -----
export { SdkError, AuthError, NotFoundError, RateLimitError, } from './core/errors.js';
// Exported so a caller can state its own ceiling against these rather than
// hardcoding a number that silently stops matching if the cap moves.
export { DEFAULT_LIMIT, MAX_LIMIT } from './core/paginate.js';
