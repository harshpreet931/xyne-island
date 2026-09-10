/**
 * Users Operation Registry
 *
 * Maps SDK user methods to backend operations.
 */
import type { CurrentUser, User, UserProfile } from '../types/index.js';
/**
 * User operations registry.
 *
 * Each entry declares an SDK operation id and its argument and result types.
 */
export declare const usersOperations: {
    /**
     * Identify the user this client acts as.
     */
    readonly me: import("./types.js").ApiOperation<void, CurrentUser>;
    /**
     * Get all users in workspace.
     */
    readonly list: import("./types.js").SdkOperation<{
        updatedAt?: number;
    } | undefined, User[]>;
    /**
     * Get users with only basic fields (no presence).
     */
    readonly listBasic: import("./types.js").SdkOperation<{
        updatedAt?: number;
    } | undefined, User[]>;
    /**
     * Get user profiles by user IDs.
     */
    readonly getProfiles: import("./types.js").SdkOperation<{
        userIds: string[];
    }, UserProfile[]>;
    /**
     * Get a single user profile.
     */
    readonly getProfile: import("./types.js").SdkOperation<{
        userId: string;
    }, UserProfile | null>;
};
