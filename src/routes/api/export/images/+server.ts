import { error } from '@sveltejs/kit';
import JSZip from 'jszip';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { getImage } from '$lib/server/blob';
import { photoEntryNames } from '$lib/server/export';
import { ensureSchema, getAllRsvps } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	await requireAdmin(request);
	await ensureSchema();

	// Driven from the database rather than the blob listing, so every photo ends
	// up in a folder named after the person who sent it.
	const rsvps = (await getAllRsvps()).filter((rsvp) => rsvp.fotos.length > 0);
	if (rsvps.length === 0) {
		throw error(404, 'Todavía no hay fotos.');
	}

	const zip = new JSZip();
	for (const rsvp of rsvps) {
		const names = photoEntryNames(rsvp);
		for (const [i, pathname] of rsvp.fotos.entries()) {
			const result = await getImage(pathname);
			if (!result) continue; // referenced blob is gone; skip rather than fail the export
			zip.file(names[i], await new Response(result.stream).arrayBuffer());
		}
	}

	const content = await zip.generateAsync({ type: 'arraybuffer' });
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="tait-fotos-${timestamp}.zip"`
		}
	});
};
