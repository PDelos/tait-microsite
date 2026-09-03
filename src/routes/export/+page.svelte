<script lang="ts">
	import JSZip from 'jszip';

	type Job = 'csv' | 'fotos';

	let password = $state('');
	let running = $state<Job | null>(null);
	let progress = $state('');
	let errorMessage = $state('');

	const busy = $derived(running !== null);
	const canSubmit = $derived(password.length > 0 && !busy);

	/** POST to an admin endpoint. Returns null and sets errorMessage on failure. */
	async function request(endpoint: string, body: object = {}): Promise<Response | null> {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password, ...body })
		});

		if (!response.ok) {
			errorMessage =
				response.status === 401
					? 'Contraseña incorrecta.'
					: response.status === 404
						? 'Todavía no hay nada que descargar.'
						: `No se ha podido exportar (error ${response.status}).`;
			return null;
		}
		return response;
	}

	function save(blob: Blob, filename: string) {
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	}

	const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

	async function downloadCsv() {
		errorMessage = '';
		running = 'csv';

		try {
			const response = await request('/api/export');
			if (!response) return;

			const disposition = response.headers.get('Content-Disposition') ?? '';
			const filename = disposition.match(/filename="?([^"]+)"?/)?.[1] ?? 'tait-rsvps.csv';
			save(await response.blob(), filename);
		} catch {
			errorMessage = 'Algo ha ido mal. Inténtalo de nuevo.';
		} finally {
			running = null;
		}
	}

	// The photos are fetched one at a time and zipped here rather than server-side: a
	// Vercel function can only return 4.5 MB, which a whole event's photos would exceed.
	async function downloadFotos() {
		errorMessage = '';
		running = 'fotos';

		try {
			const manifest = await request('/api/export/images');
			if (!manifest) return;
			const { files } = (await manifest.json()) as { files: { entry: string; pathname: string }[] };

			const zip = new JSZip();
			for (const [i, file] of files.entries()) {
				progress = `${i + 1}/${files.length}`;
				const photo = await request('/api/export/images', { pathname: file.pathname });
				if (!photo) return;
				zip.file(file.entry, await photo.arrayBuffer());
			}

			save(await zip.generateAsync({ type: 'blob' }), `tait-fotos-${stamp()}.zip`);
		} catch {
			errorMessage = 'Algo ha ido mal. Inténtalo de nuevo.';
		} finally {
			running = null;
			progress = '';
		}
	}
</script>

<svelte:head>
	<title>Exportar inscripciones · TAIT</title>
</svelte:head>

<section id="export" class="bg-halo items-center justify-center gap-12 px-10 text-center">
	<div class="flex flex-col gap-4">
		<h1 class="heading">Exportar</h1>
		<p class="subtitle">Panel de administración</p>
	</div>

	<div class="field w-full max-w-md text-left">
		<label class="field-label" for="password">Contraseña</label>
		<input
			id="password"
			type="password"
			bind:value={password}
			placeholder="Escribir aquí"
			autocomplete="current-password"
			disabled={busy}
			class="input rounded-full py-3"
		/>
	</div>

	<div class="flex flex-col items-center gap-3">
		{#if errorMessage}
			<p class="text-note text-red-600" role="alert">{errorMessage}</p>
		{/if}

		<div class="flex flex-col items-center gap-6 lg:flex-row lg:gap-12">
			<button class="btn btn-primary" type="button" disabled={!canSubmit} onclick={downloadCsv}>
				{running === 'csv' ? 'Exportando…' : 'Descargar CSV'}
			</button>

			<button class="btn border-black" type="button" disabled={!canSubmit} onclick={downloadFotos}>
				{running === 'fotos' ? `Exportando… ${progress}` : 'Descargar fotos'}
			</button>
		</div>
	</div>
</section>
