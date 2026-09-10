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
import type { Application, CanvasFolder, Project, ProjectTag, Recap, Ticket, TicketFieldDefinition } from '../types/index.js';
export declare const projectsOperations: {
    readonly list: import("./types.js").SdkOperation<void, Project[]>;
    readonly listLite: import("./types.js").SdkOperation<void, Project[]>;
    readonly get: import("./types.js").SdkOperation<{
        projectId: string;
    }, Project | null>;
    readonly getMany: import("./types.js").SdkOperation<{
        projectIds: string[];
    }, Project[]>;
    readonly listTags: import("./types.js").SdkOperation<{
        projectId: string;
    }, ProjectTag[]>;
    readonly listFieldDefinitions: import("./types.js").SdkOperation<{
        projectId: string;
    }, TicketFieldDefinition[]>;
    readonly listCanvasFolders: import("./types.js").SdkOperation<{
        projectId: string;
    }, CanvasFolder[]>;
    readonly listApplications: import("./types.js").SdkOperation<{
        projectId: string;
    }, Application[]>;
    readonly listReleaseTickets: import("./types.js").SdkOperation<{
        projectId: string;
    }, Ticket[]>;
    readonly listRecaps: import("./types.js").SdkOperation<{
        recapDate: number;
    }, Recap[]>;
    readonly update: import("./types.js").SdkOperation<{
        projectId: string;
        name?: string;
        description?: string;
    }, void>;
    readonly delete: import("./types.js").SdkOperation<{
        projectId: string;
    }, void>;
    readonly saveReleaseBoardConfig: import("./types.js").SdkOperation<{
        projectId: string;
        mainBoardId: string;
        mainBoardName: string;
        vcsProvider: string;
        releaseTrackingMode: string;
        channelId: string;
        applications: unknown[];
    }, void>;
};
