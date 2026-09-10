/**
 * Collections Operation Registry
 *
 * Knowledge-base collections: nested folders of files that get ingested for
 * search. Access is granted per collection to a user or a user group.
 *
 * Collections nest — `parentId` is the immediate parent, `rootCollectionId` the
 * top of the tree — and files are versioned, with `isLatest` marking the current
 * revision. File *upload* is not in this catalog; these operations manage the
 * structure and permissions around files that already exist.
 */
import { op } from './types.js';
export const collectionsOperations = {
    // ----- Reads -----
    /**
     * Root collections, optionally narrowed to one scope.
     */
    list: op('collections.list', 'query'),
    /**
     * Sub-collections beneath a root.
     */
    listSubfolders: op('collections.listSubfolders', 'query'),
    /**
     * Who a collection is shared with — the user, group and channel grants on it.
     */
    listPermissions: op('collections.listPermissions', 'query'),
    /**
     * Files in a collection — latest versions only.
     */
    listItems: op('collections.listItems', 'query'),
    /**
     * One collection by id, or nothing if it has been soft-deleted.
     *
     * The query filters on the primary key but does **not** end in `.one()`, so
     * the wire shape is a list. Unwrapped here so the declared return type is
     * honest about there being at most one.
     */
    get: op('collections.get', 'query', {
        mapResult: (rows) => rows[0] ?? null,
    }),
    /**
     * Every latest-version file beneath a root collection, across its subfolders,
     * with each file's attachment joined in.
     *
     * Differs from {@link listItems}, which is one collection's own files:
     * this walks the whole tree under a root.
     */
    listFilesByRoot: op('collections.listFilesByRoot', 'query'),
    /**
     * Root collections with their files already joined.
     *
     * Same scoping as {@link list} — omit both arguments for everything the
     * caller can reach — but one round trip instead of a list-then-fetch per
     * collection.
     */
    listWithItems: op('collections.listWithItems', 'query'),
    // ----- Writes -----
    /**
     * Create a root collection. The creator's permission row is created with it.
     */
    create: op('collections.create', 'mutator'),
    /**
     * Rename a collection or change its description or privacy.
     */
    update: op('collections.update', 'mutator'),
    /**
     * Delete a collection.
     */
    delete: op('collections.delete', 'mutator'),
    /**
     * Create a sub-collection under a parent.
     */
    createFolder: op('collections.createFolder', 'mutator'),
    /**
     * Rename a file or sub-collection.
     */
    renameItem: op('collections.renameItem', 'mutator'),
    /**
     * Remove a file or sub-collection.
     */
    deleteItem: op('collections.deleteItem', 'mutator'),
    /**
     * Grant a user or group access to a collection.
     *
     * Exactly one of `userId` or `userGroupId` should be set. Granting access also
     * re-indexes the collection's files so search reflects the new permissions.
     */
    grantPermission: op('collections.grantPermission', 'mutator'),
    /**
     * Revoke a permission grant.
     */
    revokePermission: op('collections.revokePermission', 'mutator'),
};
