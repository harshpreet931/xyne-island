/** Direct multipart operations for file bytes that are outside the Zero catalog. */
import { api } from './types.js';
import { appendFiles, appendOptional } from '../core/form-data.js';
export const attachmentsOperations = {
    /** Maps to: POST /api/sdk/attachments */
    upload: api('POST', '/api/sdk/v1/attachments', {
        mapArgs: (args) => {
            const form = new FormData();
            form.append('entityId', args.entityId);
            form.append('entityType', args.entityType);
            appendFiles(form, args.files);
            return form;
        },
    }),
    /** Maps to: POST /api/sdk/draft-attachments */
    uploadDraft: api('POST', '/api/sdk/v1/draft-attachments', {
        mapArgs: (args) => {
            const form = new FormData();
            form.append('attachmentIds', JSON.stringify(args.attachmentIds));
            form.append('draftMessageId', args.draftMessageId);
            form.append('channelId', args.channelId);
            appendOptional(form, 'conversationId', args.conversationId);
            appendFiles(form, args.files, { includeThumbnails: true });
            return form;
        },
    }),
};
