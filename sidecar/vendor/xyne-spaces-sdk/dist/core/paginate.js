/**
 * Client-side pagination for operations with no server-side cursor.
 *
 * Some reads — thread messages, channel participants, ticket activities, the
 * user directory, and others — return every matching row in one response and
 * accept no `limit`/`start`, so there is nothing to ask the server for "the
 * next page" with. That suits a live-syncing client that holds the whole set
 * and renders a window of it, and suits a one-shot HTTP fetch poorly: a caller that
 * wants the last 20 messages of a long-running thread would otherwise pay
 * for, and receive, all of them.
 *
 * `paginate` does the one thing available without a backend change: it takes
 * the full result the operation already returned and windows it before
 * handing it back. The network cost of the full fetch is real and is not
 * solved here — that needs a paginated variant of the underlying Zero query,
 * which is a backend change. What this removes is a caller having to hold and
 * iterate an unbounded array just to render one page of it.
 */
/** Rows returned when a caller names no `limit`. */
export const DEFAULT_LIMIT = 100;
/**
 * The most rows one page can hold, whatever a caller asks for.
 *
 * A larger `limit` is clamped to this rather than rejected: the number is a
 * request for how much to hand back, not an assertion about the data, so
 * failing a call over it would turn a harmless over-estimate into an error the
 * caller has to write code around.
 */
export const MAX_LIMIT = 100;
/**
 * Window an already-fetched array into one page.
 *
 * `limit` is clamped into `[1, MAX_LIMIT]` rather than validated — see
 * {@link MAX_LIMIT}. The floor of 1 matters as much as the ceiling: a `limit`
 * of 0 would otherwise return an empty page while `hasMore` stayed true,
 * which reads as "there is more, ask again" and loops forever.
 */
export function paginate(all, options) {
    const limit = Math.max(1, Math.min(options?.limit ?? DEFAULT_LIMIT, MAX_LIMIT));
    const offset = Math.max(options?.offset ?? 0, 0);
    const items = all.slice(offset, offset + limit);
    return {
        items,
        hasMore: offset + items.length < all.length,
        total: all.length,
        nextOffset: offset + items.length,
    };
}
