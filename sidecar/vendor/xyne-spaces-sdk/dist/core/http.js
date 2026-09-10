/**
 * HTTP Client
 *
 * Handles HTTP requests with authentication, timeout, and error handling.
 */
import { SdkError, AuthError, NotFoundError } from './errors.js';
export class HttpClient {
    baseUrl;
    token;
    timeout;
    useBeta;
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
        this.token = options.token;
        this.timeout = options.timeout ?? 30000;
        this.useBeta = options.useBeta === true;
    }
    /**
     * Set the access token for authentication.
     */
    setToken(token) {
        this.token = token;
    }
    /**
     * Clear the access token.
     */
    clearToken() {
        this.token = undefined;
    }
    /**
     * Get the current token (for refresh scenarios).
     */
    getToken() {
        return this.token;
    }
    async get(path, params) {
        const url = this.buildUrl(path, params);
        return this.request('GET', url);
    }
    async post(path, body) {
        return this.request('POST', `${this.baseUrl}${path}`, body);
    }
    async put(path, body) {
        return this.request('PUT', `${this.baseUrl}${path}`, body);
    }
    async patch(path, body) {
        return this.request('PATCH', `${this.baseUrl}${path}`, body);
    }
    async delete(path, params) {
        const url = this.buildUrl(path, params);
        return this.request('DELETE', url);
    }
    buildUrl(path, params) {
        const url = new URL(path, this.baseUrl);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null) {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        return url.toString();
    }
    async request(method, url, body) {
        const isMultipart = typeof FormData !== 'undefined' && body instanceof FormData;
        const headers = { Accept: 'application/json' };
        if (this.useBeta)
            headers['x-route-env'] = 'playground';
        // Let fetch add the multipart boundary. Supplying Content-Type ourselves
        // would omit it and make Express/multer reject an otherwise valid upload.
        if (!isMultipart)
            headers['Content-Type'] = 'application/json';
        const requestBody = body === undefined
            ? undefined
            : isMultipart
                ? body
                : JSON.stringify(body);
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(url, {
                method,
                headers,
                body: requestBody,
                signal: controller.signal,
                credentials: 'include', // Send cookies automatically (same-origin auth)
            });
            clearTimeout(timeoutId);
            const text = await response.text();
            if (!response.ok) {
                this.handleError(response, text);
            }
            // Handle empty responses (e.g., 204 No Content)
            if (!text)
                return undefined;
            // Not every endpoint answers in JSON — a schema definition comes back as
            // plain text. Parsing by content type keeps a malformed JSON body a real
            // error instead of being silently handed back as a string.
            const contentType = response.headers.get('content-type') ?? '';
            if (!contentType.includes('json'))
                return text;
            return JSON.parse(text);
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof SdkError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new SdkError('timeout', 'Request timed out');
            }
            throw new SdkError('network_error', `Request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    handleError(response, text) {
        let body = {};
        try {
            body = JSON.parse(text);
        }
        catch {
            // Ignore JSON parse errors for error responses
        }
        const nestedError = body.error && typeof body.error === 'object' ? body.error : undefined;
        const message = body.message ||
            nestedError?.message ||
            (typeof body.error === 'string' ? body.error : undefined) ||
            response.statusText;
        // The API's envelope is `{ error: { code, message, request_id } }`.
        const serverCode = nestedError?.code ?? body.code;
        // The API sets `X-Request-Id` on every response and repeats it in the error
        // body. Prefer the header: it is present even when the body is not JSON.
        const requestId = response.headers.get('X-Request-Id') ?? nestedError?.request_id ?? undefined;
        switch (response.status) {
            case 400:
                throw new SdkError('validation_error', message, serverCode, requestId);
            case 401:
                throw new AuthError(message, serverCode, requestId);
            case 403:
                throw new SdkError('forbidden', message, serverCode, requestId);
            case 404:
                throw new NotFoundError(message, serverCode, requestId);
            default:
                throw new SdkError('api_error', message, serverCode, requestId);
        }
    }
}
