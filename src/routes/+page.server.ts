import { fail, type Actions } from '@sveltejs/kit';
import type { NewEncuesta } from '$lib/server/db';
import { ASPECTO_VALUES, MAX_COMENTARIO, MAX_NOMBRE, MAX_OTRO, type Aspecto } from '$lib/encuesta';

// $lib/server/db throws at import time when DATABASE_URL is missing, so it is
// imported inside the action — the page itself stays loadable either way.
// (Same reasoning as src/routes/evento/+page.server.ts.)

const INVALID = 'Faltan campos obligatorios.';

function str(data: FormData, key: string): string {
	return String(data.get(key) ?? '').trim();
}

/** A chosen aspect plus its "Otro" text, or null if the pair is invalid. */
function aspecto(data: FormData, key: string): { value: Aspecto; otro: string | null } | null {
	const value = str(data, key);
	if (!ASPECTO_VALUES.includes(value)) return null;

	// The text is only kept for "otro", and is then required.
	const otro = value === 'otro' ? str(data, `${key}_otro`) : '';
	if (value === 'otro' && (!otro || otro.length > MAX_OTRO)) return null;

	return { value: value as Aspecto, otro: otro || null };
}

export const actions: Actions = {
	submit: async ({ request }) => {
		const data = await request.formData();

		// Honeypot + minimum fill time, as on the RSVP form. Same generic error, so a
		// bot learns nothing from which check it tripped.
		if (str(data, 'website') || Number(str(data, 'elapsed')) < 3_000) {
			return fail(400, { error: INVALID });
		}

		// Server-side mirror of the client validation (never trust the client).
		const nombre = str(data, 'nombre');
		const nombreOk = nombre.length > 0 && nombre.length <= MAX_NOMBRE;

		const loMejor = aspecto(data, 'lo_mejor');
		const aMejorar = aspecto(data, 'a_mejorar');

		const valoracionRaw = str(data, 'valoracion');
		const valoracion = Number(valoracionRaw);
		const valoracionOk =
			/^\d{1,2}$/.test(valoracionRaw) && Number.isInteger(valoracion) && valoracion <= 10;

		const comentario = str(data, 'comentario');
		const comentarioOk = comentario.length > 0 && comentario.length <= MAX_COMENTARIO;

		if (!nombreOk || !loMejor || !aMejorar || !valoracionOk || !comentarioOk) {
			return fail(400, { error: INVALID });
		}

		try {
			const { ensureEncuestaSchema, insertEncuesta } = await import('$lib/server/db');
			await ensureEncuestaSchema();

			const respuesta: NewEncuesta = {
				nombre,
				lo_mejor: loMejor.value,
				lo_mejor_otro: loMejor.otro,
				a_mejorar: aMejorar.value,
				a_mejorar_otro: aMejorar.otro,
				valoracion,
				comentario
			};
			await insertEncuesta(respuesta);
		} catch (e) {
			console.error('Encuesta submission failed:', e);
			return fail(500, { error: 'No se ha podido enviar. Inténtalo de nuevo.' });
		}

		return { success: true };
	}
};
