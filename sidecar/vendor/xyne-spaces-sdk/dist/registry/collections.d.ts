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
import type { Collection, CollectionItem, CollectionPermission, CollectionRole } from '../types/index.js';
export declare const collectionsOperations: {
    /**
     * Root collections, optionally narrowed to one scope.
     */
    readonly list: import("./types.js").SdkOperation<{
        scopeType?: string;
        scopeId?: string;
    } | undefined, Collection[]>;
    /**
     * Sub-collections beneath a root.
     */
    readonly listSubfolders: import("./types.js").SdkOperation<{
        rootCollectionId: string;
    }, Collection[]>;
    /**
     * Who a collection is shared with — the user, group and channel grants on it.
     */
    readonly listPermissions: import("./types.js").SdkOperation<{
        collectionId: string;
    }, CollectionPermission[]>;
    /**
     * Files in a collection — latest versions only.
     */
    readonly listItems: import("./types.js").SdkOperation<{
        collectionId: string;
    }, CollectionItem[]>;
    /**
     * One collection by id, or nothing if it has been soft-deleted.
     *
     * The query filters on the primary key but does **not** end in `.one()`, so
     * the wire shape is a list. Unwrapped here so the declared return type is
     * honest about there being at most one.
     */
    readonly get: import("./types.js").SdkOperation<{
        id: string;
    }, Collection | null>;
    /**
     * Every latest-version file beneath a root collection, across its subfolders,
     * with each file's attachment joined in.
     *
     * Differs from {@link listItems}, which is one collection's own files:
     * this walks the whole tree under a root.
     */
    readonly listFilesByRoot: import("./types.js").SdkOperation<{
        rootCollectionId: string;
    }, CollectionItem[]>;
    /**
     * Root collections with their files already joined.
     *
     * Same scoping as {@link list} — omit both arguments for everything the
     * caller can reach — but one round trip instead of a list-then-fetch per
     * collection.
     */
    readonly listWithItems: import("./types.js").SdkOperation<{
        scopeType?: string;
        scopeId?: string;
    } | undefined, Collection[]>;
    /**
     * Create a root collection. The creator's permission row is created with it.
     */
    readonly create: import("./types.js").SdkOperation<{
        id: string;
        permissionId: string;
        name: string;
        scopeType: string;
        scopeId: string;
        description?: string;
        isPrivate?: boolean;
    }, void>;
    /**
     * Rename a collection or change its description or privacy.
     */
    readonly update: import("./types.js").SdkOperation<{
        id: string;
        name?: string;
        description?: string;
        isPrivate?: boolean;
    }, void>;
    /**
     * Delete a collection.
     */
    readonly delete: import("./types.js").SdkOperation<{
        id: string;
    }, void>;
    /**
     * Create a sub-collection under a parent.
     */
    readonly createFolder: import("./types.js").SdkOperation<{
        id: string;
        parentId: string;
        name: string;
    }, void>;
    /**
     * Rename a file or sub-collection.
     */
    readonly renameItem: import("./types.js").SdkOperation<{
        id: string;
        collectionId: string;
        name: string;
    }, void>;
    /**
     * Remove a file or sub-collection.
     */
    readonly deleteItem: import("./types.js").SdkOperation<{
        id: string;
        collectionId: string;
    }, void>;
    /**
     * Grant a user or group access to a collection.
     *
     * Exactly one of `userId` or `userGroupId` should be set. Granting access also
     * re-indexes the collection's files so search reflects the new permissions.
     */
    readonly grantPermission: import("./types.js").SdkOperation<{
        id: string;
        collectionId: string;
        role: CollectionRole;
        userId?: string;
        userGroupId?: string;
        channelId?: string;
    }, void>;
    /**
     * Revoke a permission grant.
     */
    readonly revokePermission: import("./types.js").SdkOperation<{
        id: string;
        collectionId: string;
    }, void>;
};
