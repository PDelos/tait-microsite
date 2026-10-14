<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { reveal, HIDDEN, SHOWN } from '$lib/anim';
	import { ASPECTOS, VALORACIONES, MAX_COMENTARIO, MAX_OTRO } from '$lib/encuesta';

	// --- Answers ---
	let loMejor = $state<string | null>(null);
	let loMejorOtro = $state('');
	let aMejorar = $state<string | null>(null);
	let aMejorarOtro = $state('');
	let valoracion = $state<number | null>(null);
	let comentario = $state('');

	// Every question is required, and choosing "Otro" means saying what.
	const aspectoValid = (value: string | null, otro: string) =>
		value !== null && (value !== 'otro' || otro.trim().length > 0);

	const valid = $derived(
		aspectoValid(loMejor, loMejorOtro) &&
			aspectoValid(aMejorar, aMejorarOtro) &&
			valoracion !== null &&
			comentario.trim().length > 0
	);

	// --- Submission ---
	// Remembered in this browser so a refresh or a second visit shows the thank-you
	// instead of inviting a duplicate. Storage can be blocked (private mode, some
	// in-app webviews), so every access is guarded and the page works without it.
	const SENT_KEY = 'tait-encuesta-enviada';

	let enviado = $state(false);
	let submitting = $state(false);
	let submitError = $state('');

	$effect(() => {
		try {
			enviado = localStorage.getItem(SENT_KEY) === '1';
		} catch {
			/* storage unavailable: just show the form */
		}
	});

	// Measured in the browser, so a skewed device clock can't reject a real guest.
	const renderedAt = Date.now();

	const onSubmit: SubmitFunction = ({ formData, cancel }) => {
		if (!valid) return cancel();
		formData.set('elapsed', String(Date.now() - renderedAt));
		submitting = true;
		submitError = '';

		return async ({ result }) => {
			submitting = false;
			if (result.type === 'success') {
				enviado = true;
				try {
					localStorage.setItem(SENT_KEY, '1');
				} catch {
					/* fine without it */
				}
			} else if (result.type === 'failure') {
				submitError =
					(result.data as { error?: string } | undefined)?.error ??
					'Ha ocurrido un error al enviar. Inténtalo de nuevo.';
			} else {
				submitError = 'Ha ocurrido un error al enviar. Inténtalo de nuevo.';
			}
		};
	};

	let section: HTMLElement;

	$effect(() =>
		reveal(section, (tl) =>
			tl
				.fromTo('[data-reveal="encuesta-title"]', HIDDEN, SHOWN)
				.fromTo(
					'[data-reveal-children="encuesta-fields"] > *',
					HIDDEN,
					{ ...SHOWN, stagger: 0.12 },
					'-=0.4'
				)
		)
	);
</script>

<!-- One "what did you think of…" question: four fixed aspects plus "Otro", whose
 underline is a real text input. Typing in it selects "Otro" for you. -->
{#snippet aspectoGroup(
	title: string,
	name: string,
	selected: string | null,
	select: (v: string) => void,
	otro: string,
	setOtro: (v: string) => void
)}
	<fieldset class="flex flex-col gap-[1.25rem] lg:gap-[0.625rem]">
		<legend class="field-label mb-[1.25rem] lg:mb-[0.625rem]">{title}</legend>
		{#each ASPECTOS as opt (opt.value)}
			<label class="option py-[1.25rem] lg:py-[0.625rem]">
				<input
					type="radio"
					{name}
					value={opt.value}
					checked={selected === opt.value}
					onchange={() => select(opt.value)}
					class="radio"
				/>
				{opt.label}
				{#if opt.value === 'otro'}
					<input
						type="text"
						name="{name}_otro"
						value={otro}
						maxlength={MAX_OTRO}
						aria-label="{title} — otro, especificar"
						oninput={(e) => {
							setOtro(e.currentTarget.value);
							select('otro');
						}}
						class="otro-input"
					/>
				{/if}
			</label>
		{/each}
	</fieldset>
{/snippet}

<section
	id="encuesta"
	bind:this={section}
	class="h-auto min-h-dvh items-center gap-16 py-20 lg:justify-between lg:gap-[2.5rem] lg:py-[2.5rem]"
>
	<div class="px-[2.5rem] py-[1.875rem] text-center">
		<h2 data-reveal="encuesta-title" class="heading heading-gradient lg:tracking-[-0.36rem]">
			{enviado ? '¡Gracias por participar!' : 'Nos gustaría saber...'}
		</h2>
	</div>

	{#if enviado}
		<div class="flex flex-1 items-center px-[2.5rem] text-center">
			<p class="subtitle lg:text-[2.0625rem]">
				Hemos recibido tu respuesta. Tu opinión nos ayuda a seguir mejorando.
			</p>
		</div>
	{:else}
		<form
			method="POST"
			action="?/submit"
			use:enhance={onSubmit}
			class="flex w-full flex-1 flex-col items-center gap-16 px-[2.5rem] lg:w-[75.5rem] lg:flex-none lg:gap-[1.25rem] lg:px-0"
		>
			<!-- Honeypot. No guest ever sees this, so anything filled in came from a script. -->
			<input
				type="text"
				name="website"
				tabindex="-1"
				autocomplete="off"
				aria-hidden="true"
				class="absolute size-0 opacity-0"
			/>

			<div
				data-reveal-children="encuesta-fields"
				class="flex w-full flex-col gap-16 lg:flex-row lg:gap-[1.25rem]"
			>
				<div class="flex flex-col gap-16 lg:w-[33.5rem] lg:shrink-0 lg:gap-[5.2rem]">
					{@render aspectoGroup(
						'¿Qué es lo que más te ha gustado?',
						'lo_mejor',
						loMejor,
						(v) => (loMejor = v),
						loMejorOtro,
						(v) => (loMejorOtro = v)
					)}
					{@render aspectoGroup(
						'¿Qué crees que puede mejorar?',
						'a_mejorar',
						aMejorar,
						(v) => (aMejorar = v),
						aMejorarOtro,
						(v) => (aMejorarOtro = v)
					)}
				</div>

				<div class="flex flex-col gap-16 lg:flex-1 lg:gap-[2.5rem]">
					<fieldset class="flex flex-col">
						<legend class="field-label mb-[3rem] lg:mb-[2rem] lg:leading-[1.34]">
							Del 0 al 10 siendo 0 la peor nota y 10 la mejor, ¿cómo valorarías la celebración del
							10 aniversario TAIT?
						</legend>
						<div class="grid grid-cols-6 gap-y-[2.5rem] lg:flex lg:justify-between">
							{#each VALORACIONES as n (n)}
								<label class="option">
									<input
										type="radio"
										name="valoracion"
										value={n}
										checked={valoracion === n}
										onchange={() => (valoracion = n)}
										class="radio"
									/>
									{n}
								</label>
							{/each}
						</div>
					</fieldset>

					<div class="field gap-[2.5rem] lg:gap-[1.25rem]">
						<label class="field-label" for="comentario">Déjanos tu comentario:</label>
						<textarea
							id="comentario"
							name="comentario"
							placeholder="Escribir aquí"
							maxlength={MAX_COMENTARIO}
							bind:value={comentario}
							class="input h-[30rem] resize-none rounded-[1.25rem] py-[1.5rem] text-(length:--text-lead) lg:h-[14.5625rem] lg:rounded-[0.625rem] lg:px-[1.1875rem] lg:py-[0.625rem]"
						></textarea>
					</div>
				</div>
			</div>

			<div class="flex flex-col items-center gap-3 pt-8 lg:pt-0">
				{#if submitError}
					<p class="text-note text-red-600" role="alert">{submitError}</p>
				{/if}
				<button
					type="submit"
					class="btn btn-primary w-[36rem] font-medium lg:w-[18rem] lg:py-[1.25rem] lg:text-[1.125rem]"
					disabled={!valid || submitting}
				>
					{submitting ? 'Enviando…' : 'Enviar'}
				</button>
			</div>
		</form>
	{/if}
</section>

<style>
	/* A radio and its text, matching Figma: 20px circle, 3px gap, 18px label. */
	.option {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: fit-content;
		cursor: pointer;
		font-size: var(--text-lead);
		line-height: 1;
		letter-spacing: -0.03em;

		@media (min-width: 1024px) {
			gap: 0.1875rem;
		}
	}

	/* The design draws a plain 1px circle; native radios can't be restyled to that
	 * consistently across browsers, so this one is drawn by hand. The dot is the
	 * brand blue — the only colour the site uses besides black and white. */
	.radio {
		appearance: none;
		display: grid;
		place-content: center;
		flex-shrink: 0;
		width: 2.5rem;
		height: 2.5rem;
		margin: 0;
		border: 1px solid #000;
		border-radius: 9999px;
		background-color: #fff;
		cursor: pointer;

		@media (min-width: 1024px) {
			width: 1.25rem;
			height: 1.25rem;
		}

		&::before {
			content: '';
			width: 0.6em;
			height: 0.6em;
			border-radius: 9999px;
			background-color: #0c4392;
			transform: scale(0);
			transition: transform 0.15s ease;
		}

		&:checked::before {
			transform: scale(1);
		}

		&:focus-visible {
			outline: 2px solid #0c4392;
			outline-offset: 2px;
		}
	}

	/* The design's "Otro____": the underline is where you type. */
	.otro-input {
		width: 20rem;
		margin-left: 0.25rem;
		border: none;
		border-bottom: 1px solid #000;
		border-radius: 0;
		background: transparent;
		color: #000;
		font-size: inherit;
		line-height: 1.2;
		padding: 0 0.25rem;

		@media (min-width: 1024px) {
			width: 10rem;
		}

		&:focus {
			outline: none;
			border-bottom-color: #0c4392;
		}
	}
</style>
