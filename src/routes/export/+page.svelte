<script lang="ts">
	let password = $state('');
	let loading = $state(false);
	let errorMessage = $state('');

	async function handleExport(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';
		loading = true;

		try {
			const response = await fetch('/api/export', {
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
			const filename = disposition.match(/filename="?([^"]+)"?/)?.[1] ?? 'tait-rsvps.csv';

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);

			password = '';
		} catch {
			errorMessage = 'Algo ha ido mal. Inténtalo de nuevo.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Exportar inscripciones · TAIT</title>
</svelte:head>

<main>
	<div class="card">
		<p class="eyebrow">Panel de administración</p>
		<h1>Exportar inscripciones</h1>
		<p class="hint">
			Introduce la contraseña de administrador para descargar todas las respuestas en CSV.
		</p>

		<form onsubmit={handleExport}>
			<label for="password">Contraseña</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				placeholder="••••••••"
				required
				autocomplete="current-password"
				disabled={loading}
			/>

			{#if errorMessage}
				<p class="error" role="alert">{errorMessage}</p>
			{/if}

			<button type="submit" disabled={loading || password.length === 0}>
				{loading ? 'Exportando…' : 'Descargar CSV'}
			</button>
		</form>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
	}

	main {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: #17181c;
		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;
		color: #f1efe9;
	}

	.card {
		width: 100%;
		max-width: 24rem;
		background: #1f2126;
		border: 1px solid #2c2e35;
		border-radius: 0.75rem;
		padding: 2.25rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
	}

	.eyebrow {
		margin: 0 0 0.4rem;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #c98a5e;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.hint {
		margin: 0 0 1.75rem;
		font-size: 0.9rem;
		line-height: 1.5;
		color: #9a9aa3;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	label {
		font-size: 0.8rem;
		font-weight: 500;
		color: #c7c7cf;
	}

	input {
		padding: 0.65rem 0.8rem;
		border-radius: 0.5rem;
		border: 1px solid #34363e;
		background: #14151a;
		color: #f1efe9;
		font-size: 0.95rem;
	}

	input:focus-visible {
		outline: 2px solid #c98a5e;
		outline-offset: 1px;
	}

	.error {
		margin: 0;
		font-size: 0.85rem;
		color: #e2685a;
	}

	button {
		margin-top: 0.5rem;
		padding: 0.7rem 1rem;
		border: none;
		border-radius: 0.5rem;
		background: #c98a5e;
		color: #17181c;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button:not(:disabled):hover {
		opacity: 0.9;
	}
</style>
