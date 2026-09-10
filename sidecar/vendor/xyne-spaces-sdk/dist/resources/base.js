/**
 * Base Resource Class
 *
 * Provides the foundation for all resource classes.
 * Each resource class represents a collection of related operations
 * (e.g., users, channels, messages).
 */
/**
 * Base class for all resource classes.
 * Provides the `call` method for executing operations.
 */
export class Resource {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    /**
     * Execute an operation with the given arguments.
     */
    call(operation, args) {
        return this.transport.execute(operation, args);
    }
}
