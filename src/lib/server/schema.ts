/**
 * src/lib/server/schema.ts
 *
 * The `rsvps` and `encuesta` DDL, kept free of any SvelteKit import so that both the app
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
      proyecto_orgullo                TEXT,
      deseo_futuro                    TEXT,
      entrevista                      TEXT CHECK (entrevista IN ('si', 'no')),
      -- Vercel Blob pathnames, e.g. images/<uuid>-foto.jpg. Empty when no photos.
      fotos                           TEXT[] NOT NULL DEFAULT '{}'
    );
  `;
}

/**
 * The post-event survey (the site's homepage). It lives in the same database as
 * `rsvps` but shares nothing with it, so neither table's lifecycle touches the
 * other: `bun run reset` still only drops `rsvps`.
 */
export async function createEncuestaSchema(sql: Sql): Promise<void> {
	await sql`
    CREATE TABLE IF NOT EXISTS encuesta (
      id              SERIAL PRIMARY KEY,
      creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
      lo_mejor        TEXT NOT NULL CHECK (lo_mejor IN
                        ('actividades', 'gastronomia', 'amenizacion', 'informacion_corporativa', 'otro')),
      -- Only filled when lo_mejor is 'otro', and then required.
      lo_mejor_otro   TEXT CHECK ((lo_mejor = 'otro') = (lo_mejor_otro IS NOT NULL)),
      a_mejorar       TEXT NOT NULL CHECK (a_mejorar IN
                        ('actividades', 'gastronomia', 'amenizacion', 'informacion_corporativa', 'otro')),
      a_mejorar_otro  TEXT CHECK ((a_mejorar = 'otro') = (a_mejorar_otro IS NOT NULL)),
      valoracion      SMALLINT NOT NULL CHECK (valoracion BETWEEN 0 AND 10),
      comentario      TEXT NOT NULL
    );
  `;
}

/** Destructive. Only the one-shot `bun run db:reset` script calls this. */
export async function dropSchema(sql: Sql): Promise<void> {
	await sql`DROP TABLE IF EXISTS rsvps`;
}
