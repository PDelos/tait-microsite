import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { getImage, isImagePathname } from '$lib/server/blob';
import { photoEntryNames } from '$lib/server/export';
import { ensureSchema, getAllRsvps } from '$lib/server/db';

/**
 * Two shapes behind one admin check:
 *   { password }           → the manifest: every photo and the name it takes in the ZIP
 *   { password, pathname } → that one photo's bytes
 *
 * The ZIP is assembled in the browser (src/routes/export/+page.svelte) rather than here,
 * because Vercel caps a function's response body at 4.5 MB and an event's worth of photos
 * comfortably exceeds that. One photo per response always fits.
 */
export const POST: RequestHandler = async ({ request }) => {
	// requireAdmin reads the JSON body, so hand it a clone and keep the original readable.
	await requireAdmin(request.clone());
	const { pathname } = (await request.json()) as { pathname?: string };

	if (pathname) {
		if (!isImagePathname(pathname)) throw error(400, 'Ruta de imagen no válida.');
		const blob = await getImage(pathname);
		if (!blob) throw error(404, 'La foto ya no está disponible.');

		return new Response(blob.stream, { headers: { 'Content-Type': 'application/octet-stream' } });
	}

	await ensureSchema();

	// Driven from the database rather than the blob listing, so every photo ends
	// up in a folder named after the person who sent it.
	const files = (await getAllRsvps())
		.filter((rsvp) => rsvp.fotos.length > 0)
		.flatMap((rsvp) => {
			const entries = photoEntryNames(rsvp);
			return rsvp.fotos.map((foto, i) => ({ entry: entries[i], pathname: foto }));
		});

	if (files.length === 0) throw error(404, 'Todavía no hay fotos.');

	return json({ files });
};
