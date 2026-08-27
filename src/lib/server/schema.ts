/**
 * src/lib/server/schema.ts
 *
 * The `rsvps` DDL, kept free of any SvelteKit import so that both the app
 * (src/lib/server/db.ts) and the standalone `bun run db:reset` script can use it.
 * The Neon client is passed in rather than created here.
 */

import type { NeonQueryFunction } from '@neondatabase/serverless';

type Sql = NeonQueryFunction<false, false>;

export async function createSchema(sql: Sql): Promise<void> {
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
      -- Nullable: vegans/vegetarians get a special menu and choose no courses.
      entrante                        TEXT CHECK (entrante IN ('arroz_setas_jamon', 'ensalada_langostinos')),
      principal                       TEXT CHECK (principal IN ('solomillo_ternera', 'colita_rape')),
      postre                          TEXT CHECK (postre IN ('lemon_pie', 'coulant_chocolate')),
      recuerdo_favorito               TEXT,
      deseo_futuro                    TEXT,
      entrevista                      TEXT CHECK (entrevista IN ('si', 'no')),
      -- Vercel Blob pathnames, e.g. images/<uuid>-foto.jpg. Empty when no photos.
      fotos                           TEXT[] NOT NULL DEFAULT '{}'
    );
  `;
}

/** Destructive. Only the one-shot `bun run db:reset` script calls this. */
export async function dropSchema(sql: Sql): Promise<void> {
	await sql`DROP TABLE IF EXISTS rsvps`;
}
