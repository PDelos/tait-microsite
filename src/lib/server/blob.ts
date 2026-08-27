import { put, list, get, del } from '@vercel/blob';
import { randomUUID } from 'crypto';

export const IMAGE_PREFIX = 'images/';
export const MAX_FILES = 10;

/** Validate a batch of files before upload: image-only, within max count. */
export function validateImageFiles(files: File[]): string | null {
	if (!files.length || files.every((f) => f.size === 0)) {
		return 'No se ha seleccionado ninguna foto.';
	}
	if (files.length > MAX_FILES) {
		return `Solo puedes subir hasta ${MAX_FILES} fotos.`;
	}
	for (const file of files) {
		if (!file.type.startsWith('image/')) {
			return `«${file.name}» no es una imagen.`;
		}
	}
	return null;
}

/** Upload a batch of validated image files, prefixed under images/. */
export async function uploadImages(files: File[]) {
	return Promise.all(
		files.map((file) =>
			put(`${IMAGE_PREFIX}${randomUUID()}-${file.name}`, file, {
				access: 'private'
			})
		)
	);
}

/** List all stored images. */
export async function listImages() {
	const { blobs } = await list({ prefix: IMAGE_PREFIX });
	return blobs;
}

/** Fetch a single image's stream + metadata by pathname. */
export async function getImage(pathname: string) {
	return get(pathname, { access: 'private' });
}

/** Delete a single image by pathname. */
export async function deleteImage(pathname: string) {
	return del(pathname);
}

/**
 * Delete every stored image, a page at a time. Destructive: only the one-shot
 * `bun run reset` script calls this. Returns how many blobs were removed.
 */
export async function deleteAllImages(): Promise<number> {
	let cursor: string | undefined;
	let deleted = 0;

	do {
		const page = await list({ prefix: IMAGE_PREFIX, cursor });
		if (page.blobs.length > 0) {
			await del(page.blobs.map((blob) => blob.pathname));
			deleted += page.blobs.length;
		}
		cursor = page.hasMore ? page.cursor : undefined;
	} while (cursor);

	return deleted;
}
