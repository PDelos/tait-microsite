/**
 * src/lib/server/db.ts
 *
 * Postgres (Neon) via @neondatabase/serverless.
 * https://neon.tech/docs/serverless/serverless-driver
 */

import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';

const DATABASE_URL = env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not set. Add your Neon connection string to the environment.');
}

export const sql = neon(DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS rsvps (
    id                              SERIAL PRIMARY KEY,
    creado_en                       TIMESTAMPTZ NOT NULL DEFAULT now(),
    nombre_completo                 TEXT NOT NULL,
    transporte                      TEXT NOT NULL CHECK (transporte IN ('vehiculo_propio', 'bus')),
    tiene_restriccion_alimentaria   BOOLEAN NOT NULL DEFAULT false,
    detalle_restriccion_alimentaria TEXT,
    vegetariano                     BOOLEAN NOT NULL DEFAULT false,
    vegano                          BOOLEAN NOT NULL DEFAULT false,
    talla_camiseta                  TEXT NOT NULL CHECK (talla_camiseta IN ('S', 'M', 'L', 'XL', 'XXL')),
    entrante                        TEXT NOT NULL CHECK (entrante IN ('arroz_setas_jamon', 'ensalada_langostinos')),
    principal                       TEXT NOT NULL CHECK (principal IN ('solomillo_ternera', 'colita_rape')),
    postre                          TEXT NOT NULL CHECK (postre IN ('lemon_pie', 'coulant_chocolate')),
    recuerdo_favorito               TEXT,
    deseo_futuro                    TEXT
  );
`;

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
	entrante: 'arroz_setas_jamon' | 'ensalada_langostinos';
	principal: 'solomillo_ternera' | 'colita_rape';
	postre: 'lemon_pie' | 'coulant_chocolate';
	recuerdo_favorito: string | null;
	deseo_futuro: string | null;
}

export type NewRsvp = Omit<Rsvp, 'id' | 'creado_en'>;

export async function insertRsvp(input: NewRsvp): Promise<number> {
	const rows = await sql`
    INSERT INTO rsvps (
      nombre_completo, transporte,
      tiene_restriccion_alimentaria, detalle_restriccion_alimentaria, vegetariano, vegano,
      talla_camiseta, entrante, principal, postre,
      recuerdo_favorito, deseo_futuro
    ) VALUES (
      ${input.nombre_completo}, ${input.transporte},
      ${input.tiene_restriccion_alimentaria}, ${input.detalle_restriccion_alimentaria},
      ${input.vegetariano}, ${input.vegano},
      ${input.talla_camiseta}, ${input.entrante}, ${input.principal}, ${input.postre},
      ${input.recuerdo_favorito}, ${input.deseo_futuro}
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
