/**
 * src/lib/server/export.ts
 *
 * Naming shared by the two admin exports, so the "Fotos" column in the CSV and
 * the folder layout inside the ZIP always agree.
 */

import { IMAGE_PREFIX } from './blob';
import type { Rsvp } from './db';

function slugify(value: string): string {
	return (
		value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') // strip accents
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'sin-nombre'
	);
}

/** Recover the uploaded filename from `images/<uuid>-<original name>`. */
function originalName(pathname: string): string {
	return (
		pathname
			.slice(pathname.startsWith(IMAGE_PREFIX) ? IMAGE_PREFIX.length : 0)
			.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, '')
			.replace(/[/\\]/g, '_') || 'foto'
	);
}

/** One folder per person, e.g. `007-ana-garcia`. */
export function rsvpFolder(rsvp: Rsvp): string {
	return `${String(rsvp.id).padStart(3, '0')}-${slugify(rsvp.nombre_completo)}`;
}

/**
 * The ZIP entry name for each of a person's photos, in upload order:
 * `007-ana-garcia/01-cumple.jpg`.
 */
export function photoEntryNames(rsvp: Rsvp): string[] {
	const folder = rsvpFolder(rsvp);
	return rsvp.fotos.map(
		(pathname, i) => `${folder}/${String(i + 1).padStart(2, '0')}-${originalName(pathname)}`
	);
}
