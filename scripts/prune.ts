/**
 * scripts/prune.ts — `bun run prune`
 *
 * Photos upload to Blob storage the moment a guest picks them, so a form that is never
 * submitted — or a photo removed after it uploaded — leaves a blob no row references.
 * This deletes exactly those.
 *
 * Photos belonging to a real submission are never touched, so it is safe to run at any
 * time, unlike `bun run reset`.
 */

import { neon } from '@neondatabase/serverless';
import { listImages, deleteImage } from '../src/lib/server/blob.ts';

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

const rows = await sql`SELECT fotos FROM rsvps`;
const referenced = new Set(rows.flatMap((row) => row.fotos as string[]));

const blobs = await listImages();
const orphans = blobs.filter((blob) => !referenced.has(blob.pathname));

console.log(`${blobs.length} image(s) stored, ${referenced.size} referenced by a submission.`);

if (orphans.length === 0) {
	console.log('Nothing to prune.');
	process.exit(0);
}

for (const orphan of orphans) {
	await deleteImage(orphan.pathname);
	console.log(`  deleted ${orphan.pathname}`);
}

console.log(`Done. ${orphans.length} orphan(s) removed.`);
