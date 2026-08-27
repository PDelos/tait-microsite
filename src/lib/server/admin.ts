import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { timingSafeEqual } from 'node:crypto';

function safeCompare(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) {
		timingSafeEqual(bufA, bufA);
		return false;
	}
	return timingSafeEqual(bufA, bufB);
}

/** Throws 400/401/500 unless the request body is JSON with a valid admin password. */
export async function requireAdmin(request: Request): Promise<void> {
	const adminPassword = env.ADMIN_PASSWORD;
	if (!adminPassword) {
		throw error(500, 'ADMIN_PASSWORD no está configurada en el servidor.');
	}

	let password: unknown;
	try {
		password = (await request.json())?.password;
	} catch {
		throw error(400, 'Se esperaba un cuerpo JSON con el campo "password".');
	}

	if (typeof password !== 'string' || !safeCompare(password, adminPassword)) {
		throw error(401, 'Contraseña incorrecta.');
	}
}
