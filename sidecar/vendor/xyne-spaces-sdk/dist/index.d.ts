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
export { createClient, SpacesClient } from './client.js';
export type { SpacesClientOptions } from './client.js';
export { ClawResource } from './resources/claw.js';
export type { ClawRunAndWaitInput } from './resources/claw.js';
export { SdkError, AuthError, NotFoundError, RateLimitError, } from './core/errors.js';
export type { SdkErrorCode } from './core/errors.js';
export type { MessageType, ChannelRole, ChannelSortOrder, ChannelScopeType, ChannelVisibility, ChannelType, DeskType, CurrentUser, User, UserProfile, UserPresence, Channel, ChannelParticipant, ChannelUserStatus, ChannelSection, ChannelStats, CreateChannelInput, CheckDuplicateChannelResponse, Link, Message, MessageAttachment, UploadFileInput, UploadedAttachment, AttachmentUploadResponse, DraftAttachmentUploadResult, DraftAttachmentUploadResponse, Reaction, DelayedMessage, DraftMessage, Conversation, ConversationParticipant, CreateConversationWithAttachmentsInput, Activity, Ticket, SubTicket, TicketPriority, TicketStatusV2, TicketStageRequest, CreateTicketInput, CreateTicketResponse, StageRequestStatus, TicketActivity, TicketAssignment, TicketExport, TicketFieldDefinition, TicketMailbox, SubTicketMapping, ReleaseAttribution, Board, Stage, Project, Application, ProjectTag, StageTransition, BoardComplexityScore, BoardSlaPolicy, ChannelBoardMapping, FlowPlan, FlowPlanNode, FlowPlanGroup, FlowPlanDecision, FlowDecisionRoute, FlowStepGate, Canvas, CanvasFolder, CanvasParticipant, CanvasComment, CanvasCommentThread, CanvasVersion, CanvasVisibility, CanvasRole, CanvasCommentThreadStatus, Collection, CollectionItem, CollectionPermission, Form, FormField, FormEntityValue, FormContextMapping, Call, CallParticipant, CallStatus, RecurringCallSeries, SummaryTemplate, EmailDraft, EmailSignature, EmailChannelPreference, ConversationLabel, ConversationLabelMapping, Recap, Nudge, Dashboard, Workflow, Rca, ApplicationReleaseTicket, ReleaseChange, ReleaseEvent, UserGroup, UserGroupMember, UserAssignmentState, UserExpertiseMapping, UserWorkloadMapping, UserPreferences, SavedView, Bookmark, App, InstalledApp, AccessResource, ResourceAccess, Invitation, OrgMember, Organization, Role, Workspace, WorkspaceOrganization, ClassificationMapping, CustomEmoji, LookupValue, Merchant, Repo, SdlcTrack, TicketTag, SearchResult, SearchResponse, SearchOptions, ClawAgent, ClawRun, ClawRunInput, PaginatedResponse, PaginationOptions, } from './types/index.js';
export type { Page, PageOptions } from './core/paginate.js';
export { DEFAULT_LIMIT, MAX_LIMIT } from './core/paginate.js';
export type { ConversationCursor } from './registry/conversations.js';
export type { MessageCursor } from './registry/messages.js';
export type { ActivityCursor } from './registry/activities.js';
export type { TicketCursor, TicketActivityCursor, TicketViewMode, KanbanColumnType, KanbanTicketFilters, } from './registry/tickets.js';
export type { SupportTicketCursor } from './registry/support-tickets.js';
export type { StageInput } from './registry/boards.js';
export type { CanvasCursor, CanvasScope } from './registry/canvases.js';
export type { FormFieldInput } from './registry/forms.js';
export type { CallCursor } from './registry/calls.js';
export type { EmailCursor, EmailDraftCursor } from './registry/email.js';
export type { AppCursor, RoleCursor } from './registry/admin.js';
export type { WorkflowCursor } from './registry/automations.js';
export type { RcaCursor } from './registry/incidents.js';
export type { UploadAttachmentsInput, UploadDraftAttachmentsInput, } from './registry/attachments.js';
