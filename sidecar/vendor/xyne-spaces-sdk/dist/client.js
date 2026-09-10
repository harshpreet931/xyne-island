/**
 * Spaces SDK Client
 *
 * Main entry point for the SDK. Provides access to all resources.
 */
import { HttpClient } from './core/http.js';
import { Transport } from './core/transport.js';
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
export class SpacesClient {
    http;
    transport;
    /** User operations */
    users;
    /** Search operations */
    search;
    /** Direct multipart file uploads */
    attachments;
    /** Channel membership, settings, participants, and sidebar sections */
    channels;
    /** Threads: listing, reading, pinning, and subscription */
    conversations;
    /** Messages, drafts, and scheduled sends */
    messages;
    /** The current user's activity feed and its read state */
    activities;
    /** Tickets, sub-tickets, tags, references, and stage approvals */
    tickets;
    /** The support-desk view of tickets (reads; write via `tickets`) */
    supportTickets;
    /** Boards, stages, transitions, and SLA policies */
    boards;
    /** Projects and their tags, fields, and applications */
    projects;
    /** Canvases: content, sharing, comments, versions, and folders */
    canvases;
    /** Knowledge-base collections and their permissions */
    collections;
    /** Custom forms, their mappings, and submitted values */
    forms;
    /** Calls, scheduling, participation, and recordings */
    calls;
    /** Desk email: drafts, signatures, read state, and labels */
    email;
    /** Daily channel and project recaps, and entity nudges */
    recaps;
    /** Workspace and organization administration */
    admin;
    /** Teams, membership, and assignment routing */
    userGroups;
    /** Dashboards, saved queries, and tile layout */
    dashboards;
    /** Automations and their approval lifecycle */
    automations;
    /** RCAs, impacts, corrective actions, and release attribution */
    incidents;
    /** The current user's own settings, bookmarks, and saved views */
    preferences;
    /** Shared links, repositories, emoji, and reference data */
    workspace;
    /** Remote agents: dispatch, poll, and their own login */
    claw;
    constructor(options = {}) {
        const baseUrl = options.baseUrl ?? 'https://spaces.xyne.app';
        this.http = new HttpClient({
            baseUrl,
            token: options.apiKey,
            timeout: options.timeout,
            useBeta: options.useBeta,
        });
        this.transport = new Transport(this.http);
        // Initialize resources
        this.users = new UsersResource(this.transport);
        this.search = new SearchResource(this.transport);
        this.attachments = new AttachmentsResource(this.transport);
        this.channels = new ChannelsResource(this.transport);
        this.conversations = new ConversationsResource(this.transport);
        this.messages = new MessagesResource(this.transport);
        this.activities = new ActivitiesResource(this.transport);
        this.tickets = new TicketsResource(this.transport);
        this.supportTickets = new SupportTicketsResource(this.transport);
        this.boards = new BoardsResource(this.transport);
        this.projects = new ProjectsResource(this.transport);
        this.canvases = new CanvasesResource(this.transport);
        this.collections = new CollectionsResource(this.transport);
        this.forms = new FormsResource(this.transport);
        this.calls = new CallsResource(this.transport);
        this.email = new EmailResource(this.transport);
        this.recaps = new RecapsResource(this.transport);
        this.admin = new AdminResource(this.transport);
        this.userGroups = new UserGroupsResource(this.transport);
        this.dashboards = new DashboardsResource(this.transport);
        this.automations = new AutomationsResource(this.transport);
        this.incidents = new IncidentsResource(this.transport);
        this.preferences = new PreferencesResource(this.transport);
        this.workspace = new WorkspaceResource(this.transport);
        this.claw = new ClawResource(this.transport);
    }
    /** Set the API key, e.g. after rotating one. */
    setApiKey(apiKey) {
        this.http.setToken(apiKey);
    }
    /** Clear the API key. Subsequent calls fail with `AuthError`. */
    clearApiKey() {
        this.http.clearToken();
    }
    /** Whether an API key is set. Says nothing about whether it is still valid. */
    hasApiKey() {
        return this.http.getToken() !== undefined;
    }
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
export function createClient(options) {
    return new SpacesClient(options);
}
