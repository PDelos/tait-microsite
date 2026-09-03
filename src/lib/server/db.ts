/**
 * src/lib/server/db.ts
 *
 * Postgres (Neon) via @neondatabase/serverless.
 * https://neon.tech/docs/serverless/serverless-driver
 */

import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';
import { createSchema } from './schema';

const DATABASE_URL = env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not set. Add your Neon connection string to the environment.');
}

export const sql = neon(DATABASE_URL);

// The table is created lazily rather than at module scope, so importing this file
// never blocks on a round trip and the CREATE runs at most once per warm instance.
let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
	schemaReady ??= createSchema(sql);
	return schemaReady;
}

export interface Rsvp {
	id: number;
	creado_en: string;
	nombre_completo: string;
	transporte: 'vehiculo_propio' | 'bus';
	tiene_restriccion_alimentaria: boolean;
	detalle_restriccion_alimentaria: string | null;
	vegetariano: boolean;
	vegano: boolean;
	talla_camiseta: 'S' | 'M' | 'L' | 'XL' | 'XXL';
	entrante: 'arroz_setas_jamon' | 'ensalada_langostinos' | null;
	principal: 'solomillo_ternera' | 'colita_rape' | null;
	postre: 'lemon_pie' | 'coulant_chocolate' | null;
	recuerdo_favorito: string | null;
	proyecto_orgullo: string | null;
	deseo_futuro: string | null;
	entrevista: 'si' | 'no' | null;
	/** Vercel Blob pathnames of the photos this person uploaded. */
	fotos: string[];
}

export type NewRsvp = Omit<Rsvp, 'id' | 'creado_en'>;

export async function insertRsvp(input: NewRsvp): Promise<number> {
	const rows = await sql`
    INSERT INTO rsvps (
      nombre_completo, transporte,
      tiene_restriccion_alimentaria, detalle_restriccion_alimentaria, vegetariano, vegano,
      talla_camiseta, entrante, principal, postre,
      recuerdo_favorito, proyecto_orgullo, deseo_futuro, entrevista, fotos
    ) VALUES (
      ${input.nombre_completo}, ${input.transporte},
      ${input.tiene_restriccion_alimentaria}, ${input.detalle_restriccion_alimentaria},
      ${input.vegetariano}, ${input.vegano},
      ${input.talla_camiseta}, ${input.entrante}, ${input.principal}, ${input.postre},
      ${input.recuerdo_favorito}, ${input.proyecto_orgullo}, ${input.deseo_futuro},
      ${input.entrevista},
      ${input.fotos}::text[]
    )
    RETURNING id
  `;
	return rows[0].id as number;
}

export async function getAllRsvps(): Promise<Rsvp[]> {
	return (await sql`SELECT * FROM rsvps ORDER BY id ASC`) as Rsvp[];
}

export async function getRsvpCount(): Promise<number> {
	const rows = await sql`SELECT COUNT(*)::int AS count FROM rsvps`;
	return rows[0].count as number;
}
