<script lang="ts">
	// Survey export. The invitation's RSVP + photo export moved with the rest of
	// the invitation to /evento/export (src/routes/evento/export/+page.svelte).
	// Same page, same password, same look — only the endpoint differs.

	let password = $state('');
	let running = $state(false);
	let errorMessage = $state('');

	const canSubmit = $derived(password.length > 0 && !running);

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

	async function downloadCsv() {
		errorMessage = '';
		running = true;

		try {
			const response = await fetch('/api/export/encuesta', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (!response.ok) {
				errorMessage =
					response.status === 401
						? 'Contraseña incorrecta.'
						: `No se ha podido exportar (error ${response.status}).`;
				return;
			}

			const disposition = response.headers.get('Content-Disposition') ?? '';
			const filename = disposition.match(/filename="?([^"]+)"?/)?.[1] ?? 'tait-encuesta.csv';
			save(await response.blob(), filename);
		} catch {
			errorMessage = 'Algo ha ido mal. Inténtalo de nuevo.';
		} finally {
			running = false;
		}
	}
</script>

<svelte:head>
	<title>Exportar encuesta · TAIT</title>
</svelte:head>

<section id="export" class="bg-halo items-center justify-center gap-12 px-10 text-center">
	<div class="flex flex-col gap-4">
		<h1 class="heading">Exportar</h1>
		<p class="subtitle">Respuestas de la encuesta</p>
	</div>

	<form
		class="flex w-full flex-col items-center gap-12"
		onsubmit={(e) => {
			e.preventDefault();
			if (canSubmit) downloadCsv();
		}}
	>
		<div class="field w-full max-w-md text-left">
			<label class="field-label" for="password">Contraseña</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				placeholder="Escribir aquí"
				autocomplete="current-password"
				disabled={running}
				class="input rounded-full py-3"
			/>
		</div>

		<div class="flex flex-col items-center gap-3">
			{#if errorMessage}
				<p class="text-note text-red-600" role="alert">{errorMessage}</p>
			{/if}

			<button class="btn btn-primary" type="submit" disabled={!canSubmit}>
				{running ? 'Exportando…' : 'Descargar CSV'}
			</button>
		</div>
	</form>
</section>
