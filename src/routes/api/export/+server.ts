import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { timingSafeEqual } from 'node:crypto';
import { stringify } from 'csv-stringify/sync';
import { getAllRsvps, type Rsvp } from '$lib/server/db';

const COLUMNS: { key: keyof Rsvp; header: string }[] = [
	{ key: 'id', header: 'ID' },
	{ key: 'creado_en', header: 'Fecha de inscripción' },
	{ key: 'nombre_completo', header: 'Nombre y Apellido' },
	{ key: 'transporte', header: 'Transporte' },
	{ key: 'tiene_restriccion_alimentaria', header: 'Intolerancias/restricciones' },
	{ key: 'detalle_restriccion_alimentaria', header: 'Detalle intolerancias' },
	{ key: 'vegetariano', header: 'Vegetariano/a' },
	{ key: 'vegano', header: 'Vegano/a' },
	{ key: 'talla_camiseta', header: 'Talla camiseta' },
	{ key: 'entrante', header: 'Entrante' },
	{ key: 'principal', header: 'Principal' },
	{ key: 'postre', header: 'Postre' },
	{ key: 'recuerdo_favorito', header: 'Recuerdo favorito' },
	{ key: 'deseo_futuro', header: 'Deseo para los próximos 10 años' }
];

function displayValue(key: keyof Rsvp, value: Rsvp[keyof Rsvp]): string {
	if (value === null || value === undefined) return '';
	if (key === 'transporte') return value === 'bus' ? 'Bus desde TAIT' : 'Vehículo propio';
	if (key === 'tiene_restriccion_alimentaria' || key === 'vegetariano' || key === 'vegano') {
		return value === true ? 'Sí' : 'No';
	}
	if (key === 'entrante') {
		return value === 'arroz_setas_jamon'
			? 'Arroz de setas de temporada con jamón'
			: 'Ensalada de langostinos con frutos rojos y calabaza';
	}
	if (key === 'principal') {
		return value === 'solomillo_ternera'
			? 'Solomillo de ternera con demiglacé de patata encebollada'
			: 'Colita de rape con almejas en salsa verde';
	}
	if (key === 'postre') {
		return value === 'lemon_pie' ? 'Lemon pie' : 'Coulant de chocolate con sorbete de mandarina';
	}
	return String(value);
}

function toCsv(rows: Rsvp[]): string {
	const records = rows.map((row) =>
		Object.fromEntries(COLUMNS.map((c) => [c.header, displayValue(c.key, row[c.key])]))
	);
	const body = stringify(records, {
		header: true,
		columns: COLUMNS.map((c) => c.header),
		record_delimiter: '\r\n'
	});
	// BOM so accented characters open correctly in Excel.
	return '\uFEFF' + body;
}

function safeCompare(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) {
		timingSafeEqual(bufA, bufA);
		return false;
	}
	return timingSafeEqual(bufA, bufB);
}

export const POST: RequestHandler = async ({ request }) => {
	const adminPassword = env.ADMIN_PASSWORD;
	if (!adminPassword) {
		throw error(500, 'ADMIN_PASSWORD no está configurada en el servidor.');
	}

	let password: unknown;
	try {
		const body = await request.json();
		password = body?.password;
	} catch {
		throw error(400, 'Se esperaba un cuerpo JSON con el campo "password".');
	}

	if (typeof password !== 'string' || !safeCompare(password, adminPassword)) {
		throw error(401, 'Contraseña incorrecta.');
	}

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
