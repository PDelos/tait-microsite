<script lang="ts">
	type Job = 'csv' | 'fotos';

	let password = $state('');
	let running = $state<Job | null>(null);
	let errorMessage = $state('');

	const busy = $derived(running !== null);
	const canSubmit = $derived(password.length > 0 && !busy);

	async function download(job: Job, endpoint: string, fallbackName: string) {
		errorMessage = '';
		running = job;

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (!response.ok) {
				errorMessage =
					response.status === 401
						? 'Contraseña incorrecta.'
						: response.status === 404
							? 'Todavía no hay nada que descargar.'
							: `No se ha podido exportar (error ${response.status}).`;
				return;
			}

			const disposition = response.headers.get('Content-Disposition') ?? '';
			const filename = disposition.match(/filename="?([^"]+)"?/)?.[1] ?? fallbackName;

			const url = URL.createObjectURL(await response.blob());
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		} catch {
			errorMessage = 'Algo ha ido mal. Inténtalo de nuevo.';
		} finally {
			running = null;
		}
	}
</script>

<svelte:head>
	<title>Exportar inscripciones · TAIT</title>
</svelte:head>

<section id="export" class="items-center justify-center gap-12 px-10 text-center">
	<div class="flex flex-col gap-4">
		<h1 class="heading">Exportar</h1>
		<p class="subtitle">Panel de administración</p>
	</div>

	<div class="flex w-full max-w-md flex-col gap-3 text-left">
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
			<p class="text-[1.75rem] text-red-600 lg:text-sm" role="alert">{errorMessage}</p>
		{/if}

		<div class="flex flex-col items-center gap-6 lg:flex-row lg:gap-12">
			<button
				class="btn border-white bg-primary text-white disabled:cursor-not-allowed disabled:opacity-40"
				type="button"
				disabled={!canSubmit}
				onclick={() => download('csv', '/api/export', 'tait-rsvps.csv')}
			>
				{running === 'csv' ? 'Exportando…' : 'Descargar CSV'}
			</button>

			<button
				class="btn border-black disabled:cursor-not-allowed disabled:opacity-40"
				type="button"
				disabled={!canSubmit}
				onclick={() => download('fotos', '/api/export/images', 'tait-fotos.zip')}
			>
				{running === 'fotos' ? 'Exportando…' : 'Descargar fotos'}
			</button>
		</div>
	</div>
</section>

<style>
	#export {
		background: radial-gradient(108% 108% at 50% -8%, #fff 68%, var(--color-primary) 100%), #fff;
	}
</style>
