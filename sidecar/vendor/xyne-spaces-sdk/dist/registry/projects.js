/**
 * Projects Operation Registry
 *
 * Projects group boards, tickets, tags, and canvases. A project's `code` is the
 * prefix in its tickets' keys (a project coded `PLAT` yields `PLAT-1234`).
 *
 * There is no create operation — projects are provisioned elsewhere — so this
 * registry covers reads, update, and delete.
 *
 * Each entry is an operation id on the versioned API plus the types either side
 * of the call. What the server does with an id is defined server-side, in
 * `api/sdk/v1/mapper.ts` and `api/sdk/v1/parser.ts`.
 */
import { op } from './types.js';
export const projectsOperations = {
    // ----- Reads -----
    list: op('projects.list', 'query'),
    listLite: op('projects.listLite', 'query'),
    get: op('projects.get', 'query'),
    getMany: op('projects.getMany', 'query'),
    listTags: op('projects.listTags', 'query'),
    listFieldDefinitions: op('projects.listFieldDefinitions', 'query'),
    listCanvasFolders: op('projects.listCanvasFolders', 'query'),
    listApplications: op('projects.listApplications', 'query'),
    listReleaseTickets: op('projects.listReleaseTickets', 'query'),
    listRecaps: op('projects.listRecaps', 'query'),
    // ----- Writes -----
    update: op('projects.update', 'mutator'),
    delete: op('projects.delete', 'mutator'),
    saveReleaseBoardConfig: op('projects.saveReleaseBoardConfig', 'mutator'),
};
