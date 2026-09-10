/** Direct multipart operations for file bytes that are outside the Zero catalog. */
import type { AttachmentUploadResponse, DraftAttachmentUploadResponse, UploadFileInput } from '../types/index.js';
export interface UploadAttachmentsInput {
    entityId: string;
    entityType: 'IMPACT' | 'FORM_ENTITY_VALUE';
    files: UploadFileInput[];
}
export interface UploadDraftAttachmentsInput {
    attachmentIds: string[];
    draftMessageId: string;
    channelId: string;
    conversationId?: string;
    files: UploadFileInput[];
}
export declare const attachmentsOperations: {
    /** Maps to: POST /api/sdk/attachments */
    readonly upload: import("./types.js").ApiOperation<UploadAttachmentsInput, AttachmentUploadResponse>;
    /** Maps to: POST /api/sdk/draft-attachments */
    readonly uploadDraft: import("./types.js").ApiOperation<UploadDraftAttachmentsInput, DraftAttachmentUploadResponse>;
};
