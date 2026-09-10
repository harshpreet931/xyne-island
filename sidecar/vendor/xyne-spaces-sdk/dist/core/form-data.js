/** Append SDK file descriptors in the multipart shape used by Spaces routes. */
export function appendFiles(form, files, options = {}) {
    const metadata = [];
    let thumbnailIndex = 0;
    files.forEach((input, fileIndex) => {
        const descriptor = 'file' in input ? input : { file: input };
        appendBlob(form, 'files', descriptor.file, descriptor.filename);
        const entry = {
            fileIndex,
            hasThumbnail: options.includeThumbnails === true && descriptor.thumbnail !== undefined,
        };
        if (entry.hasThumbnail && descriptor.thumbnail) {
            appendBlob(form, 'thumbnails', descriptor.thumbnail, descriptor.thumbnailFilename ?? `thumb_${thumbnailIndex}.jpg`);
            entry.thumbnailIndex = thumbnailIndex;
            thumbnailIndex += 1;
        }
        if (descriptor.width !== undefined)
            entry.width = descriptor.width;
        if (descriptor.height !== undefined)
            entry.height = descriptor.height;
        if (descriptor.duration !== undefined)
            entry.duration = descriptor.duration;
        metadata.push(entry);
    });
    if (metadata.length > 0) {
        form.append('fileMetadata', JSON.stringify(metadata));
    }
}
export function appendOptional(form, key, value) {
    if (value === undefined || value === null)
        return;
    if (value instanceof Date) {
        form.append(key, value.toISOString());
        return;
    }
    if (typeof value === 'object') {
        form.append(key, JSON.stringify(value));
        return;
    }
    form.append(key, String(value));
}
export function appendArray(form, key, values) {
    values?.forEach((value) => form.append(`${key}[]`, value));
}
function appendBlob(form, key, blob, explicitName) {
    const inferredName = 'name' in blob && typeof blob.name === 'string'
        ? blob.name
        : undefined;
    const filename = explicitName ?? inferredName;
    if (filename)
        form.append(key, blob, filename);
    else
        form.append(key, blob);
}
