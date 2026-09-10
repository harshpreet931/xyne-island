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
import { op } from './types.js';
export const formsOperations = {
    // ----- Reads -----
    /**
     * One form by id, without its fields.
     *
     * Fields come separately via `listFields` — this returns the form row alone.
     */
    get: op('forms.get', 'query'),
    /**
     * Every form, with its fields and context mappings resolved.
     */
    list: op('forms.list', 'query'),
    /**
     * Forms without their relations — for pickers.
     */
    listLite: op('forms.listLite', 'query'),
    /**
     * Forms bound to a kind of context (board, stage, channel).
     */
    listByContextType: op('forms.listByContextType', 'query'),
    /**
     * Form-to-context mappings for several contexts at once, with their fields.
     *
     * `contextType` is BOARD | RELEASE_CHANGE | STAGE; `entityType` is
     * TICKET | SUB_TICKET | RELEASE_MIGRATION_FORM | RELEASE_ENV_FORM.
     */
    listMappingsByContextIds: op('forms.listMappingsByContextIds', 'query'),
    /**
     * A form's fields, in sequence order.
     */
    listFields: op('forms.listFields', 'query'),
    /**
     * Which form applies in a particular context.
     */
    getMapping: op('forms.getMapping', 'query'),
    /**
     * Form mappings across several boards.
     */
    listMappingsForBoards: op('forms.listMappingsForBoards', 'query'),
    /**
     * The values submitted for one entity, e.g. a ticket.
     */
    listValues: op('forms.listValues', 'query'),
    /**
     * Every ticket form value in the workspace.
     */
    listAllTicketValues: op('forms.listAllTicketValues', 'query'),
    // ----- Writes -----
    /**
     * Create or update a form and its fields.
     *
     * `fields` replaces the entire field list: send every field you want to keep,
     * each with its existing `id`, or it will be dropped.
     */
    update: op('forms.update', 'mutator'),
    /**
     * Bind a form to a context.
     */
    setMapping: op('forms.setMapping', 'mutator'),
    /**
     * Unbind a form from a context.
     */
    deleteMapping: op('forms.deleteMapping', 'mutator'),
    /**
     * Record a value for a form field on an entity.
     */
    createValue: op('forms.createValue', 'mutator'),
    /**
     * Change a recorded value.
     *
     * `expectedValueUpdatedAt` is an optimistic-concurrency check: pass the
     * `updatedAt` you last read and the write is rejected if someone else has
     * changed the value since.
     */
    updateValue: op('forms.updateValue', 'mutator'),
};
