/**
 * Spaces SDK Client
 *
 * Main entry point for the SDK. Provides access to all resources.
 */
import { UsersResource } from './resources/users.js';
import { SearchResource } from './resources/search.js';
import { ChannelsResource } from './resources/channels.js';
import { ConversationsResource } from './resources/conversations.js';
import { MessagesResource } from './resources/messages.js';
import { ActivitiesResource } from './resources/activities.js';
import { TicketsResource } from './resources/tickets.js';
import { SupportTicketsResource } from './resources/support-tickets.js';
import { BoardsResource } from './resources/boards.js';
import { ProjectsResource } from './resources/projects.js';
import { CanvasesResource } from './resources/canvases.js';
import { CollectionsResource } from './resources/collections.js';
import { FormsResource } from './resources/forms.js';
import { CallsResource } from './resources/calls.js';
import { EmailResource } from './resources/email.js';
import { RecapsResource } from './resources/recaps.js';
import { AdminResource } from './resources/admin.js';
import { UserGroupsResource } from './resources/user-groups.js';
import { DashboardsResource } from './resources/dashboards.js';
import { AutomationsResource } from './resources/automations.js';
import { IncidentsResource } from './resources/incidents.js';
import { PreferencesResource } from './resources/preferences.js';
import { WorkspaceResource } from './resources/workspace.js';
import { AttachmentsResource } from './resources/attachments.js';
import { ClawResource } from './resources/claw.js';
export interface SpacesClientOptions {
    /**
     * Base URL of the Spaces API.
     * @default 'https://spaces.xyne.app'
     */
    baseUrl?: string;
    /**
     * API key for authentication, minted from the Apps page in Spaces.
     *
     * A key acts as the user who created it, in that user's workspace, and is
     * valid for a fixed period. Can be set later via `setApiKey()`.
     */
    apiKey?: string;
    /**
     * Request timeout in milliseconds.
     * @default 30000
     */
    timeout?: number;
    /**
     * Route requests to the pre-prod (playground) environment by sending
     * `x-route-env: playground` — the same header the Electron app's pre-prod
     * toggle sets, and the same option `@xyne/storage-sdk` exposes. Absent or
     * false sends NO header, which is what routes to prod.
     *
     * @default false
     */
    useBeta?: boolean;
}
/**
 * The Spaces SDK client.
 *
 * Provides typed access to the Spaces API through resource objects.
 *
 * @example
 * ```typescript
 * import { SpacesClient } from '@xyne/spaces-sdk';
 *
 * const client = new SpacesClient({
 *   apiKey: process.env.XYNE_SPACES_API_KEY,
 * });
 *
 * // List users
 * const users = await client.users.list();
 *
 * // Search
 * const results = await client.search.query({ q: 'project update' });
 * ```
 */
export declare class SpacesClient {
    private readonly http;
    private readonly transport;
    /** User operations */
    readonly users: UsersResource;
    /** Search operations */
    readonly search: SearchResource;
    /** Direct multipart file uploads */
    readonly attachments: AttachmentsResource;
    /** Channel membership, settings, participants, and sidebar sections */
    readonly channels: ChannelsResource;
    /** Threads: listing, reading, pinning, and subscription */
    readonly conversations: ConversationsResource;
    /** Messages, drafts, and scheduled sends */
    readonly messages: MessagesResource;
    /** The current user's activity feed and its read state */
    readonly activities: ActivitiesResource;
    /** Tickets, sub-tickets, tags, references, and stage approvals */
    readonly tickets: TicketsResource;
    /** The support-desk view of tickets (reads; write via `tickets`) */
    readonly supportTickets: SupportTicketsResource;
    /** Boards, stages, transitions, and SLA policies */
    readonly boards: BoardsResource;
    /** Projects and their tags, fields, and applications */
    readonly projects: ProjectsResource;
    /** Canvases: content, sharing, comments, versions, and folders */
    readonly canvases: CanvasesResource;
    /** Knowledge-base collections and their permissions */
    readonly collections: CollectionsResource;
    /** Custom forms, their mappings, and submitted values */
    readonly forms: FormsResource;
    /** Calls, scheduling, participation, and recordings */
    readonly calls: CallsResource;
    /** Desk email: drafts, signatures, read state, and labels */
    readonly email: EmailResource;
    /** Daily channel and project recaps, and entity nudges */
    readonly recaps: RecapsResource;
    /** Workspace and organization administration */
    readonly admin: AdminResource;
    /** Teams, membership, and assignment routing */
    readonly userGroups: UserGroupsResource;
    /** Dashboards, saved queries, and tile layout */
    readonly dashboards: DashboardsResource;
    /** Automations and their approval lifecycle */
    readonly automations: AutomationsResource;
    /** RCAs, impacts, corrective actions, and release attribution */
    readonly incidents: IncidentsResource;
    /** The current user's own settings, bookmarks, and saved views */
    readonly preferences: PreferencesResource;
    /** Shared links, repositories, emoji, and reference data */
    readonly workspace: WorkspaceResource;
    /** Remote agents: dispatch, poll, and their own login */
    readonly claw: ClawResource;
    constructor(options?: SpacesClientOptions);
    /** Set the API key, e.g. after rotating one. */
    setApiKey(apiKey: string): void;
    /** Clear the API key. Subsequent calls fail with `AuthError`. */
    clearApiKey(): void;
    /** Whether an API key is set. Says nothing about whether it is still valid. */
    hasApiKey(): boolean;
}
/**
 * Create a new Spaces SDK client.
 *
 * @param options - Client configuration options
 * @returns A configured SpacesClient instance
 *
 * @example
 * ```typescript
 * import { createClient } from '@xyne/spaces-sdk';
 *
 * const sdk = createClient({
 *   apiKey: process.env.XYNE_SPACES_API_KEY,
 * });
 *
 * const users = await sdk.users.list();
 * ```
 */
export declare function createClient(options?: SpacesClientOptions): SpacesClient;
