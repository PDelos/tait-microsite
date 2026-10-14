/**
 * src/lib/encuesta.ts
 *
 * The survey's answer options, shared by the page, the server action and the CSV
 * export so the three can never disagree. The values are what the `encuesta`
 * table's CHECK constraints accept (src/lib/server/schema.ts).
 */

export const ASPECTOS = [
	{ value: 'actividades', label: 'Las actividades' },
	{ value: 'gastronomia', label: 'La gastronomía' },
	{ value: 'amenizacion', label: 'La amenización' },
	{ value: 'informacion_corporativa', label: 'La información corporativa' },
	{ value: 'otro', label: 'Otro' }
] as const;

export type Aspecto = (typeof ASPECTOS)[number]['value'];

export const ASPECTO_VALUES: readonly string[] = ASPECTOS.map((a) => a.value);

/** 0 to 10 inclusive, as the question itself says. */
export const VALORACIONES = Array.from({ length: 11 }, (_, i) => i);

/** Free-text limits, mirrored by maxlength in the markup. */
export const MAX_OTRO = 200;
export const MAX_COMENTARIO = 2000;

export function aspectoLabel(value: string): string {
	return ASPECTOS.find((a) => a.value === value)?.label ?? value;
}
