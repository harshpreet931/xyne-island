/**
 * SDK Error Types
 *
 * Provides typed error classes for different error scenarios.
 */
export type SdkErrorCode = 'network_error' | 'timeout' | 'api_error' | 'forbidden' | 'validation_error' | 'unknown';
/**
 * Base error class for all SDK errors.
 *
 * The contract is not imported here: it depends on zod, and this package ships
 * with no runtime dependencies. The string is passed through verbatim, and
 * `npm run contract-check` verifies the codes the SDK reasons about are real.
 */
export declare class SdkError extends Error {
    readonly code: SdkErrorCode;
    /** The API's `error.code`, when the failure came from the server. */
    readonly serverCode?: string;
    /**
     * The API's `X-Request-Id` for the failed call — quote it in support requests.
     *
     * Absent when the failure never reached the server (`network_error`,
     * `timeout`), and for the rare error response that carries neither the header
     * nor a `request_id` in its body.
     */
    readonly requestId?: string;
    constructor(code: SdkErrorCode, message: string, serverCode?: string, requestId?: string);
}
/**
 * Thrown when authentication fails (401).
 */
export declare class AuthError extends SdkError {
    constructor(message?: string, serverCode?: string, requestId?: string);
}
/**
 * Thrown when a resource is not found (404).
 */
export declare class NotFoundError extends SdkError {
    constructor(message?: string, serverCode?: string, requestId?: string);
}
/**
 * Thrown when rate limited (429).
 *
 * @deprecated The Spaces API has no rate limiter, so nothing throws this
 * today. It is kept exported because removing it would break any consumer
 * that imports it, and because a limiter is planned. Do not build a retry
 * strategy around it yet — see `RETRYABLE` handling in the README.
 */
export declare class RateLimitError extends SdkError {
    readonly retryAfter?: number;
    constructor(message?: string, retryAfter?: number, serverCode?: string, requestId?: string);
}
/**
 * Thrown when a Zero query or mutator fails.
 */
export declare class ZeroOperationError extends SdkError {
    readonly operationName: string;
    constructor(operationName: string, message: string);
}
