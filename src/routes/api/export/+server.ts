import type { RequestHandler } from './$types';
import { stringify } from 'csv-stringify/sync';
import { requireAdmin } from '$lib/server/admin';
import { rsvpFolder } from '$lib/server/export';
import { ensureSchema, getAllRsvps, type Rsvp } from '$lib/server/db';

const TRANSPORTE: Record<string, string> = {
	vehiculo_propio: 'Vehículo propio',
	bus: 'Bus desde TAIT'
};
const ENTRANTE: Record<string, string> = {
	arroz_setas_jamon: 'Arroz de setas de temporada con jamón',
	ensalada_langostinos: 'Ensalada de langostinos con frutos rojos y calabaza'
};
const PRINCIPAL: Record<string, string> = {
	solomillo_ternera: 'Solomillo de ternera con demiglacé de patata encebollada',
	colita_rape: 'Colita de rape con almejas en salsa verde'
};
const POSTRE: Record<string, string> = {
	lemon_pie: 'Lemon pie',
	coulant_chocolate: 'Coulant de chocolate con sorbete de mandarina'
};
const ENTREVISTA: Record<string, string> = { si: 'Sí', no: 'No' };

// Lookups rather than ternaries, so an unexpected value shows up as itself
// instead of silently rendering as the other option's label.
function label(labels: Record<string, string>, value: string | null): string {
	if (value === null) return '';
	return labels[value] ?? value;
}

function yesNo(value: boolean): string {
	return value ? 'Sí' : 'No';
}

// Excel runs a cell that starts with = + - or @, so a guest could put a formula in a
// free-text answer and have it execute when the sheet is opened. The leading apostrophe
// makes Excel treat the cell as text; it is not shown in the cell itself.
function safe(value: string): string {
	return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

// Sortable and parseable by Excel, in the timezone the event happens in.
const DATE_FORMAT = new Intl.DateTimeFormat('sv-SE', {
	timeZone: 'Europe/Madrid',
	dateStyle: 'short',
	timeStyle: 'short'
});

function fecha(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? String(value) : DATE_FORMAT.format(date);
}

// Every cell is single-valued: nothing here joins a list into one cell, so the
// sheet stays sortable and filterable. The photos are located by their ZIP
// folder rather than listed file by file.
const COLUMNS: { header: string; value: (r: Rsvp) => string }[] = [
	{ header: 'ID', value: (r) => String(r.id) },
	{ header: 'Fecha de inscripción', value: (r) => fecha(r.creado_en) },
	{ header: 'Nombre y Apellido', value: (r) => r.nombre_completo },
	{ header: 'Transporte', value: (r) => label(TRANSPORTE, r.transporte) },
	{ header: 'Intolerancias/restricciones', value: (r) => yesNo(r.tiene_restriccion_alimentaria) },
	{ header: 'Detalle intolerancias', value: (r) => r.detalle_restriccion_alimentaria ?? '' },
	{ header: 'Vegetariano/a', value: (r) => yesNo(r.vegetariano) },
	{ header: 'Vegano/a', value: (r) => yesNo(r.vegano) },
	{ header: 'Talla camiseta', value: (r) => r.talla_camiseta },
	{ header: 'Entrante', value: (r) => label(ENTRANTE, r.entrante) },
	{ header: 'Principal', value: (r) => label(PRINCIPAL, r.principal) },
	{ header: 'Postre', value: (r) => label(POSTRE, r.postre) },
	{ header: 'Recuerdo favorito', value: (r) => r.recuerdo_favorito ?? '' },
	{
		header: 'Proyecto del que está más orgulloso/a',
		value: (r) => r.proyecto_orgullo ?? ''
	},
	{ header: 'Deseo para los próximos 10 años', value: (r) => r.deseo_futuro ?? '' },
	{ header: 'Entrevista', value: (r) => label(ENTREVISTA, r.entrevista) },
	{ header: 'Nº de fotos', value: (r) => String(r.fotos.length) },
	{ header: 'Carpeta en el ZIP', value: (r) => (r.fotos.length > 0 ? rsvpFolder(r) : '') }
];

function toCsv(rows: Rsvp[]): string {
	const records = rows.map((row) =>
		Object.fromEntries(COLUMNS.map((c) => [c.header, safe(c.value(row))]))
	);
	const body = stringify(records, {
		header: true,
		columns: COLUMNS.map((c) => c.header),
		record_delimiter: '\r\n',
		// Required: csv-stringify only quotes on the *configured* record delimiter,
		// so a bare \n inside a field (the recuerdo/deseos textareas) would end the
		// row early and corrupt the file. Quoting every string field prevents that.
		quoted_string: true
	});
	// BOM so accented characters open correctly in Excel.
	return '\uFEFF' + body;
}

export const POST: RequestHandler = async ({ request }) => {
	await requireAdmin(request);
	await ensureSchema();

	const csv = toCsv(await getAllRsvps());
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

	return new Response(csv, {
		status: 200,
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="tait-rsvps-${timestamp}.csv"`
		}
	});
};
