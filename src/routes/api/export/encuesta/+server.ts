import type { RequestHandler } from './$types';
import { stringify } from 'csv-stringify/sync';
import { requireAdmin } from '$lib/server/admin';
import { ensureEncuestaSchema, getAllEncuestas, type Encuesta } from '$lib/server/db';
import { aspectoLabel } from '$lib/encuesta';

// Same conventions as the RSVP export next door (../+server.ts): formula-safe cells,
// Madrid time, every string quoted, BOM for Excel.

function safe(value: string): string {
	return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

const DATE_FORMAT = new Intl.DateTimeFormat('sv-SE', {
	timeZone: 'Europe/Madrid',
	dateStyle: 'short',
	timeStyle: 'short'
});

function fecha(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? String(value) : DATE_FORMAT.format(date);
}

const COLUMNS: { header: string; value: (r: Encuesta) => string }[] = [
	{ header: 'ID', value: (r) => String(r.id) },
	{ header: 'Fecha de respuesta', value: (r) => fecha(r.creado_en) },
	{ header: 'Nombre y Apellido', value: (r) => r.nombre ?? '' },
	{ header: 'Lo que más ha gustado', value: (r) => aspectoLabel(r.lo_mejor) },
	{ header: 'Lo que más ha gustado (otro)', value: (r) => r.lo_mejor_otro ?? '' },
	{ header: 'Qué puede mejorar', value: (r) => aspectoLabel(r.a_mejorar) },
	{ header: 'Qué puede mejorar (otro)', value: (r) => r.a_mejorar_otro ?? '' },
	{ header: 'Valoración (0-10)', value: (r) => String(r.valoracion) },
	{ header: 'Comentario', value: (r) => r.comentario }
];

function toCsv(rows: Encuesta[]): string {
	const records = rows.map((row) =>
		Object.fromEntries(COLUMNS.map((c) => [c.header, safe(c.value(row))]))
	);
	const body = stringify(records, {
		header: true,
		columns: COLUMNS.map((c) => c.header),
		record_delimiter: '\r\n',
		quoted_string: true
	});
	return '﻿' + body;
}

export const POST: RequestHandler = async ({ request }) => {
	await requireAdmin(request);
	await ensureEncuestaSchema();

	const csv = toCsv(await getAllEncuestas());
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

	return new Response(csv, {
		status: 200,
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="tait-encuesta-${timestamp}.csv"`
		}
	});
};
