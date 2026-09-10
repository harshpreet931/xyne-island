/**
 * Users Operation Registry
 *
 * Maps SDK user methods to backend operations.
 */
import { op, api } from './types.js';
/**
 * User operations registry.
 *
 * Each entry declares an SDK operation id and its argument and result types.
 */
export const usersOperations = {
    /**
     * Identify the user this client acts as.
     */
    me: api('GET', '/api/sdk/v1/me'),
    /**
     * Get all users in workspace.
     */
    list: op('users.list', 'query'),
    /**
     * Get users with only basic fields (no presence).
     */
    listBasic: op('users.listBasic', 'query'),
    /**
     * Get user profiles by user IDs.
     */
    getProfiles: op('users.getProfiles', 'query'),
    /**
     * Get a single user profile.
     */
    getProfile: op('users.getProfile', 'query'),
};
