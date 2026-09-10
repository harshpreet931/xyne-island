/**
 * SDK Error Types
 *
 * Provides typed error classes for different error scenarios.
 */
/**
 * Base error class for all SDK errors.
 *
 * The contract is not imported here: it depends on zod, and this package ships
 * with no runtime dependencies. The string is passed through verbatim, and
 * `npm run contract-check` verifies the codes the SDK reasons about are real.
 */
export class SdkError extends Error {
    code;
    /** The API's `error.code`, when the failure came from the server. */
    serverCode;
    /**
     * The API's `X-Request-Id` for the failed call — quote it in support requests.
     *
     * Absent when the failure never reached the server (`network_error`,
     * `timeout`), and for the rare error response that carries neither the header
     * nor a `request_id` in its body.
     */
    requestId;
    constructor(code, message, serverCode, requestId) {
        super(message);
        this.name = 'SdkError';
        this.code = code;
        if (serverCode !== undefined)
            this.serverCode = serverCode;
        if (requestId !== undefined)
            this.requestId = requestId;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
/**
 * Thrown when authentication fails (401).
 */
export class AuthError extends SdkError {
    constructor(message = 'Authentication failed', serverCode, requestId) {
        super('api_error', message, serverCode, requestId);
        this.name = 'AuthError';
    }
}
/**
 * Thrown when a resource is not found (404).
 */
export class NotFoundError extends SdkError {
    constructor(message = 'Resource not found', serverCode, requestId) {
        super('api_error', message, serverCode, requestId);
        this.name = 'NotFoundError';
    }
}
/**
 * Thrown when rate limited (429).
 *
 * @deprecated The Spaces API has no rate limiter, so nothing throws this
 * today. It is kept exported because removing it would break any consumer
 * that imports it, and because a limiter is planned. Do not build a retry
 * strategy around it yet — see `RETRYABLE` handling in the README.
 */
export class RateLimitError extends SdkError {
    retryAfter;
    constructor(message = 'Rate limit exceeded', retryAfter, serverCode, requestId) {
        super('api_error', message, serverCode, requestId);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}
/**
 * Thrown when a Zero query or mutator fails.
 */
export class ZeroOperationError extends SdkError {
    operationName;
    constructor(operationName, message) {
        super('api_error', `${operationName}: ${message}`);
        this.name = 'ZeroOperationError';
        this.operationName = operationName;
    }
}
