/**
 * HTTP Client
 *
 * Handles HTTP requests with authentication, timeout, and error handling.
 */
export interface HttpClientOptions {
    /** Base URL of the Spaces API */
    baseUrl: string;
    /** Access token for authentication */
    token?: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Send `x-route-env: playground` so the gateway routes to pre-prod. */
    useBeta?: boolean;
}
export declare class HttpClient {
    private baseUrl;
    private token?;
    private timeout;
    private useBeta;
    constructor(options: HttpClientOptions);
    /**
     * Set the access token for authentication.
     */
    setToken(token: string): void;
    /**
     * Clear the access token.
     */
    clearToken(): void;
    /**
     * Get the current token (for refresh scenarios).
     */
    getToken(): string | undefined;
    get<T>(path: string, params?: Record<string, unknown>): Promise<T>;
    post<T>(path: string, body?: unknown): Promise<T>;
    put<T>(path: string, body?: unknown): Promise<T>;
    patch<T>(path: string, body?: unknown): Promise<T>;
    delete<T>(path: string, params?: Record<string, unknown>): Promise<T>;
    private buildUrl;
    private request;
    private handleError;
}
