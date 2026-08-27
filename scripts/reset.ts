/**
 * scripts/reset.ts — `bun run reset`
 *
 * DESTRUCTIVE. Wipes both halves of the data layer so they can't drift apart:
 * drops and recreates the `rsvps` table, and deletes every image in the Vercel
 * Blob store. Photos are only reachable through the pathnames stored in
 * rsvps.fotos, so clearing one without the other would leave orphans.
 *
 * This is a one-shot for development; nothing in the app calls it. The app only
 * ever issues CREATE TABLE IF NOT EXISTS (see ensureSchema in db.ts).
 */

import { neon } from '@neondatabase/serverless';
import { createSchema, dropSchema } from '../src/lib/server/schema.ts';
import { deleteAllImages } from '../src/lib/server/blob.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set.');
	process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
	console.error('BLOB_READ_WRITE_TOKEN is not set.');
	process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('Deleting every image in the blob store…');
const deleted = await deleteAllImages();
console.log(`  ${deleted} image(s) deleted.`);

console.log('Dropping table "rsvps"…');
await dropSchema(sql);

console.log('Creating table "rsvps"…');
await createSchema(sql);

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM rsvps`;
console.log(`Done. "rsvps" is ready with ${count} rows and the blob store is empty.`);
