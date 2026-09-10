/**
 * Transport Layer
 *
 * Routes SDK operations to the versioned API:
 * - Operation ids via /api/sdk/v1/query and /api/sdk/v1/mutate
 * - Versioned REST routes via /api/sdk/v1/*
 */
/**
 * The API version this build of the SDK speaks.
 */
const V1 = '/api/sdk/v1';
export class Transport {
    http;
    constructor(http) {
        this.http = http;
    }
    /**
     * The access token currently in use.
     *
     * Exposed so a resource can read the caller's own identity out of its token —
     * see `core/token.ts`. Not for authorization decisions.
     */
    getToken() {
        return this.http.getToken();
    }
    /**
     * Execute an operation against the appropriate backend.
     */
    async execute(operation, args) {
        // Transform args if mapper provided
        const mappedArgs = 'mapArgs' in operation && operation.mapArgs ? operation.mapArgs(args) : args;
        let rawResult;
        switch (operation.type) {
            case 'sdk':
                rawResult = await this.executeV1(operation.op, operation.kind, mappedArgs);
                break;
            case 'api':
                rawResult = await this.executeApi(operation.method, typeof operation.path === 'function' ? operation.path(args) : operation.path, mappedArgs);
                break;
        }
        // Transform result if mapper provided
        return operation.mapResult
            ? operation.mapResult(rawResult)
            : rawResult;
    }
    /**
     * Execute an operation on the versioned API.
     *
     * The request carries the SDK's own operation id and nothing else about the
     * backend: `{ op: 'projects.update', args }`. Resolving that to a catalog
     * operation is the server's job, which is what lets the catalog move without
     * breaking a published client.
     *
     * A write echoes back any id the server minted for it, so a caller that
     * created a row learns its id without having had to invent one.
     */
    async executeV1(op, kind, args) {
        if (kind === 'query') {
            const response = await this.http.post(`${V1}/query`, { op, args });
            return response.data;
        }
        const response = await this.http.post(`${V1}/mutate`, { op, args });
        return response.generated ?? response;
    }
    /**
     * Execute a direct API call
     */
    async executeApi(method, path, args) {
        const params = args;
        switch (method) {
            case 'GET':
                return this.http.get(path, params);
            case 'POST':
                return this.http.post(path, params);
            case 'PUT':
                return this.http.put(path, params);
            case 'PATCH':
                return this.http.patch(path, params);
            case 'DELETE':
                return this.http.delete(path, params);
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }
    }
}
