import type { UploadFileInput } from '../types/index.js';
interface AppendFilesOptions {
    includeThumbnails?: boolean;
}
/** Append SDK file descriptors in the multipart shape used by Spaces routes. */
export declare function appendFiles(form: FormData, files: readonly UploadFileInput[], options?: AppendFilesOptions): void;
export declare function appendOptional(form: FormData, key: string, value: unknown): void;
export declare function appendArray(form: FormData, key: string, values: readonly string[] | undefined): void;
export {};
