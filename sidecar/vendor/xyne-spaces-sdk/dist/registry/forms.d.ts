/**
 * Forms Operation Registry
 *
 * Custom forms attached to work items. A form owns a set of fields; a context
 * mapping binds a form to where it applies (a board, a stage, a channel); and
 * entity values are the answers submitted for one entity, typically a ticket.
 *
 * There is no create-form mutator in the catalog — `update` both creates and
 * edits, and it replaces the whole field list each time.
 */
import type { Form, FormContextMapping, FormContextType, FormEntityType, FormEntityValue, FormField } from '../types/index.js';
/** A field as accepted by {@link formsOperations.update}, which replaces the whole field list. */
export interface FormFieldInput {
    /** Omit to create a field; pass an existing id to keep it. */
    id?: string;
    fieldName?: string;
    fieldType?: string;
    fieldEnum?: unknown;
    fieldOptions?: string;
    isOptional?: boolean;
    sequenceNumber?: number;
    globalFieldId?: string;
    parentOptionId?: string;
}
export declare const formsOperations: {
    /**
     * One form by id, without its fields.
     *
     * Fields come separately via `listFields` — this returns the form row alone.
     */
    readonly get: import("./types.js").SdkOperation<{
        formId: string;
    }, Form | null>;
    /**
     * Every form, with its fields and context mappings resolved.
     */
    readonly list: import("./types.js").SdkOperation<void, Form[]>;
    /**
     * Forms without their relations — for pickers.
     */
    readonly listLite: import("./types.js").SdkOperation<void, Form[]>;
    /**
     * Forms bound to a kind of context (board, stage, channel).
     */
    readonly listByContextType: import("./types.js").SdkOperation<{
        contextType: string;
    }, Form[]>;
    /**
     * Form-to-context mappings for several contexts at once, with their fields.
     *
     * `contextType` is BOARD | RELEASE_CHANGE | STAGE; `entityType` is
     * TICKET | SUB_TICKET | RELEASE_MIGRATION_FORM | RELEASE_ENV_FORM.
     */
    readonly listMappingsByContextIds: import("./types.js").SdkOperation<{
        contextIds: string[];
        contextType: FormContextType;
        entityType: FormEntityType;
    }, FormContextMapping[]>;
    /**
     * A form's fields, in sequence order.
     */
    readonly listFields: import("./types.js").SdkOperation<{
        formId: string;
    }, FormField[]>;
    /**
     * Which form applies in a particular context.
     */
    readonly getMapping: import("./types.js").SdkOperation<{
        contextId: string;
        contextType: FormContextType;
        entityType: FormEntityType;
    }, FormContextMapping | null>;
    /**
     * Form mappings across several boards.
     */
    readonly listMappingsForBoards: import("./types.js").SdkOperation<{
        boardIds: string[];
    }, FormContextMapping[]>;
    /**
     * The values submitted for one entity, e.g. a ticket.
     */
    readonly listValues: import("./types.js").SdkOperation<{
        entityId: string;
    }, FormEntityValue[]>;
    /**
     * Every ticket form value in the workspace.
     */
    readonly listAllTicketValues: import("./types.js").SdkOperation<void, FormEntityValue[]>;
    /**
     * Create or update a form and its fields.
     *
     * `fields` replaces the entire field list: send every field you want to keep,
     * each with its existing `id`, or it will be dropped.
     */
    readonly update: import("./types.js").SdkOperation<{
        formId: string;
        fields: FormFieldInput[];
        projectId?: string;
        formDescription?: string;
    }, void>;
    /**
     * Bind a form to a context.
     */
    readonly setMapping: import("./types.js").SdkOperation<{
        mappingId: string;
        contextId: string;
        contextType: string;
        entityType: string;
        formId: string;
    }, void>;
    /**
     * Unbind a form from a context.
     */
    readonly deleteMapping: import("./types.js").SdkOperation<{
        contextId: string;
        contextType: string;
        entityType: string;
    }, void>;
    /**
     * Record a value for a form field on an entity.
     */
    readonly createValue: import("./types.js").SdkOperation<{
        id: string;
        entityId: string;
        entityType: string;
        formId: string;
        fieldId: string;
        newValue: unknown;
        contextId?: string;
        version?: number;
    }, void>;
    /**
     * Change a recorded value.
     *
     * `expectedValueUpdatedAt` is an optimistic-concurrency check: pass the
     * `updatedAt` you last read and the write is rejected if someone else has
     * changed the value since.
     */
    readonly updateValue: import("./types.js").SdkOperation<{
        formEntityValueId: string;
        newValue: unknown;
        expectedValueUpdatedAt?: number;
    }, void>;
};
