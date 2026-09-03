import { list, get, del } from '@vercel/blob';

export const IMAGE_PREFIX = 'images/';
export const MAX_FILES = 10;

/**
 * Per-photo ceiling, enforced by Vercel Blob itself via the client token
 * (src/routes/api/upload). Photos are downscaled in the browser first
 * (src/lib/images.ts), so this is generous in practice; it also keeps every blob under
 * the 4.5 MB response limit that the admin photo download streams through.
 */
export const MAX_BYTES = 4 * 1024 * 1024;

/** Also enforced by Blob against the real upload, not the browser-declared type. */
export const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// The only shape the form may write to or submit: images/<uuid>-<filename>. Disallowing
// slashes in the filename half is what stops a crafted path escaping the prefix.
const IMAGE_PATHNAME =
	/^images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[^/\\]+$/i;

export function isImagePathname(pathname: string): boolean {
	return IMAGE_PATHNAME.test(pathname);
}

/** List every stored image, a page at a time. */
export async function listImages() {
	const all = [];
	let cursor: string | undefined;

	do {
		const page = await list({ prefix: IMAGE_PREFIX, cursor });
		all.push(...page.blobs);
		cursor = page.hasMore ? page.cursor : undefined;
	} while (cursor);

	return all;
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
