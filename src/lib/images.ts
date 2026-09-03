/**
 * src/lib/images.ts
 *
 * Browser-side downscaling, run just before a photo is uploaded to Blob storage.
 * Phone photos are several MB each; re-encoding them keeps uploads quick on mobile data
 * and keeps every stored blob comfortably under the 4.5 MB limit that the admin photo
 * download streams through.
 */

const MAX_EDGE = 2000;
const QUALITY = 0.85;

/**
 * Downscale to a JPEG, preserving EXIF rotation.
 *
 * Returns the original file untouched if the browser cannot decode it — a raw HEIC
 * outside Safari, mainly. An odd format should cost the guest some upload time, not
 * their submission.
 */
export async function downscale(file: File): Promise<File> {
	try {
		const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
		const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));

		const canvas = document.createElement('canvas');
		canvas.width = Math.round(bitmap.width * scale);
		canvas.height = Math.round(bitmap.height * scale);
		canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		bitmap.close();

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, 'image/jpeg', QUALITY)
		);
		if (!blob) return file;

		return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
	} catch {
		return file;
	}
}
