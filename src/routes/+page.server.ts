import { fail, type Actions } from '@sveltejs/kit';
import type { NewRsvp } from '$lib/server/db';
import { deleteImage, uploadImages, validateImageFiles } from '$lib/server/blob';

// Note: $lib/server/db is imported dynamically inside the action because it
// throws at import time when DATABASE_URL is missing — deferring the import
// keeps the page itself loadable and lets us return a proper form error.
// $lib/server/blob has no such side effect, so it is imported normally, which
// also keeps deleteImage in scope for the cleanup path below.

function str(data: FormData, key: string): string {
	return String(data.get(key) ?? '').trim();
}

export const actions: Actions = {
	submit: async ({ request }) => {
		const data = await request.formData();

		const tieneRestriccion = str(data, 'intolerancias') === 'si';
		// The special-diet radios only exist under "sí" in the UI; enforce that
		// here too, so a hand-crafted POST can't use a diet to skip the courses.
		const dieta = tieneRestriccion ? str(data, 'dietaEspecial') : ''; // '' | 'vegetariano' | 'vegano'

		const restricciones = data
			.getAll('restricciones')
			.map(String)
			.map((s) => s.trim())
			.filter(Boolean);

		// Server-side mirror of the client validation (never trust the client).
		const required = [
			'nombre',
			'transporte',
			'intolerancias',
			'talla',
			'recuerdo',
			'deseos',
			'entrevista'
		];
		if (required.some((key) => !str(data, key))) {
			return fail(400, { error: 'Faltan campos obligatorios.' });
		}
		// Saying "sí" to restrictions means saying which — either a free-text
		// restriction or a vegetariano/vegano choice counts.
		if (tieneRestriccion && restricciones.length === 0 && !dieta) {
			return fail(400, { error: 'Faltan campos obligatorios.' });
		}
		// Vegans/vegetarians get a special menu, so they choose no courses.
		if (!dieta && (!str(data, 'entrante') || !str(data, 'principal') || !str(data, 'postre'))) {
			return fail(400, { error: 'Faltan campos obligatorios.' });
		}

		// An untouched file input submits one empty File — drop those.
		const fotos = data.getAll('fotos').filter((f): f is File => f instanceof File && f.size > 0);

		if (fotos.length > 0) {
			const invalid = validateImageFiles(fotos);
			if (invalid) return fail(400, { error: invalid });
		}

		// Uploaded first so their pathnames can go into the row; if the insert then
		// fails they are deleted again, so a failed submission leaves no orphans.
		let pathnames: string[] = [];

		try {
			const { ensureSchema, insertRsvp } = await import('$lib/server/db');
			await ensureSchema();

			if (fotos.length > 0) {
				pathnames = (await uploadImages(fotos)).map((blob) => blob.pathname);
			}

			// Values for enum columns match the table's CHECK constraints,
			// which reject anything unexpected.
			const rsvp: NewRsvp = {
				nombre_completo: str(data, 'nombre'),
				transporte: str(data, 'transporte') as NewRsvp['transporte'],
				tiene_restriccion_alimentaria: tieneRestriccion,
				detalle_restriccion_alimentaria: restricciones.length ? restricciones.join('; ') : null,
				vegetariano: dieta === 'vegetariano',
				vegano: dieta === 'vegano',
				talla_camiseta: str(data, 'talla') as NewRsvp['talla_camiseta'],
				entrante: (str(data, 'entrante') || null) as NewRsvp['entrante'],
				principal: (str(data, 'principal') || null) as NewRsvp['principal'],
				postre: (str(data, 'postre') || null) as NewRsvp['postre'],
				recuerdo_favorito: str(data, 'recuerdo'),
				deseo_futuro: str(data, 'deseos'),
				entrevista: str(data, 'entrevista') as NewRsvp['entrevista'],
				fotos: pathnames
			};

			await insertRsvp(rsvp);
		} catch (e) {
			console.error('RSVP submission failed:', e);
			await Promise.all(
				pathnames.map((pathname) =>
					deleteImage(pathname).catch((err) =>
						console.error(`Could not clean up orphaned blob ${pathname}:`, err)
					)
				)
			);
			return fail(500, { error: 'No se ha podido enviar. Inténtalo de nuevo.' });
		}

		return { success: true };
	}
};
