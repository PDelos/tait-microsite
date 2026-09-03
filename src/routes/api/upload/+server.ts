import { error, json } from '@sveltejs/kit';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { RequestHandler } from './$types';
import { ALLOWED_CONTENT_TYPES, MAX_BYTES, isImagePathname } from '$lib/server/blob';

/**
 * Mints the short-lived token the browser uses to upload a photo straight to Blob
 * storage, so the bytes never travel through a function. Vercel caps a function's request
 * body at 4.5 MB, which a single phone photo can exceed on its own — posting photos with
 * the form would fail outright for most guests.
 *
 * The RSVP form is public, so there is no session to check here the way the Vercel
 * example does. These constraints are the substitute: Blob enforces the content type and
 * the size against the actual upload, the pathname is pinned to our own prefix, and the
 * token is only good for a minute.
 *
 * `onUploadCompleted` is deliberately unused — it never fires on localhost, and it isn't
 * needed: upload() resolves with the pathname in the browser, which is then posted with
 * the form. That keeps local development behaving exactly like production.
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as HandleUploadBody;

	try {
		return json(
			await handleUpload({
				body,
				request,
				onBeforeGenerateToken: async (pathname) => {
					if (!isImagePathname(pathname)) throw new Error('Ruta de imagen no válida.');

					return {
						allowedContentTypes: ALLOWED_CONTENT_TYPES,
						maximumSizeInBytes: MAX_BYTES,
						addRandomSuffix: false,
						validUntil: Date.now() + 60_000
					};
				}
			})
		);
	} catch (e) {
		error(400, e instanceof Error ? e.message : 'No se ha podido subir la foto.');
	}
};
