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

	const aspectosValid = $derived(
		aspectoValid(loMejor, loMejorOtro) && aspectoValid(aMejorar, aMejorarOtro)
	);
	const opinionValid = $derived(valoracion !== null && comentario.trim().length > 0);
	const valid = $derived(aspectosValid && opinionValid);

	// --- Steps ---
	// Same approach as the RSVP form (src/lib/components/Form.svelte):
	// Desktop: 'form' (both columns, exactly as in Figma)
	// Mobile:  'aspectos' (the two radio questions) → 'opinion' (score + comment)
	// so a phone screen never has to hold all four questions at once. Steps stay
	// mounted (hidden with CSS, never unmounted) so every input is always part of
	// the submitted FormData.
	let isMobile = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(max-width: 1023px)');
		isMobile = mq.matches;
		const onChange = (e: MediaQueryListEvent) => (isMobile = e.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	const steps = $derived(isMobile ? ['aspectos', 'opinion'] : ['form']);
	let step = $state(1);
	// Clamped, so rotating a tablet from portrait to landscape mid-form can't
	// leave `step` pointing past the end of the shorter desktop list.
	const currentStep = $derived(steps[Math.min(step, steps.length) - 1]);
	const isLastStep = $derived(step >= steps.length);

	const showAspectos = $derived(currentStep === 'form' || currentStep === 'aspectos');
	const showOpinion = $derived(currentStep === 'form' || currentStep === 'opinion');

	const stepValid = $derived(
		currentStep === 'aspectos' ? aspectosValid : currentStep === 'opinion' ? opinionValid : valid
	);

	function next() {
		if (stepValid) step = Math.min(step + 1, steps.length);
	}

	function edit() {
		step = Math.max(step - 1, 1);
	}

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

	// The progress bar (mobile only — the Figma desktop layout has none) counts the
	// thank-you as its last segment, like the RSVP form counts its summary.
	const progressStep = $derived(enviado ? steps.length + 1 : step);

	let section: HTMLElement;

	// Only the first step is revealed: the second is swapped in by a button, not by
	// scrolling, inside a section whose timeline has already played.
	$effect(() =>
		reveal(section, (tl) =>
			tl
				.fromTo('[data-reveal="encuesta-title"]', HIDDEN, SHOWN)
				.fromTo(
					'[data-reveal="encuesta-progress"]',
					{ opacity: 1, scaleX: 0 },
					{ scaleX: 1, transformOrigin: 'left center', duration: 0.9, ease: 'power2.inOut' },
					'-=0.4'
				)
				.fromTo(
					'[data-reveal-children="encuesta-fields"] > *',
					HIDDEN,
					{ ...SHOWN, stagger: 0.12 },
					'-=0.6'
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
	<fieldset class="flex flex-col gap-[0.75rem] lg:gap-[0.625rem]">
		<legend class="field-label mb-[1rem] lg:mb-[0.625rem]">{title}</legend>
		{#each ASPECTOS as opt (opt.value)}
			<label class="option py-[1rem] lg:py-[0.625rem]">
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

<section id="encuesta" bind:this={section}>
	<!-- Same frame as the RSVP form: header and footer are shrink-0 and the middle
	 scrolls between them, so the buttons keep their place on any screen height. -->
	<form
		method="POST"
		action="?/submit"
		use:enhance={onSubmit}
		class="flex h-full min-h-0 w-full flex-col justify-between gap-8 py-5 lg:gap-[1.25rem] lg:py-[2.5rem]"
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

		<div class="flex w-full shrink-0 flex-col gap-12 text-center lg:py-[1.875rem]">
			<h2
				data-reveal="encuesta-title"
				class="heading heading-gradient px-[2.5rem] lg:tracking-[-0.36rem]"
			>
				{enviado ? '¡Gracias por participar!' : 'Nos gustaría saber...'}
			</h2>
			<div
				id="encuesta_progress"
				data-reveal="encuesta-progress"
				class="h-3 w-full origin-left lg:hidden"
				style="--step: {progressStep}; --total-steps: {steps.length + 1};"
			></div>
		</div>

		<div class="min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto">
			<div class="flex min-h-full w-full flex-col items-center justify-center">
				{#if enviado}
					<!-- Own line-height: the body's 100% makes wrapped lines overlap. -->
					<p
						class="subtitle max-w-[60rem] px-[2.5rem] text-center leading-[1.3] lg:text-[2.0625rem]"
					>
						Hemos recibido tu respuesta. Tu opinión nos ayuda a seguir mejorando.
					</p>
				{:else}
					<div
						data-reveal-children="encuesta-fields"
						class="flex w-full flex-col px-[2.5rem] lg:w-[75.5rem] lg:flex-row lg:gap-[1.25rem] lg:px-0"
					>
						<div
							class="flex-col gap-12 lg:w-[33.5rem] lg:shrink-0 lg:gap-[5.2rem] {showAspectos
								? 'flex'
								: 'hidden'}"
						>
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

						<div
							class="flex-col gap-16 lg:flex-1 lg:gap-[2.5rem] {showOpinion ? 'flex' : 'hidden'}"
						>
							<fieldset class="flex flex-col">
								<legend class="field-label mb-[3rem] lg:mb-[2rem] lg:leading-[1.34]">
									Del 0 al 10 siendo 0 la peor nota y 10 la mejor, ¿cómo valorarías la celebración
									del 10 aniversario TAIT?
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

							<div class="field gap-[2rem] lg:gap-[1.25rem]">
								<label class="field-label" for="comentario">Déjanos tu comentario:</label>
								<textarea
									id="comentario"
									name="comentario"
									placeholder="Escribir aquí"
									maxlength={MAX_COMENTARIO}
									bind:value={comentario}
									class="input h-[28rem] resize-none rounded-2xl py-3 text-(length:--text-lead) lg:h-[14.5625rem] lg:rounded-[0.625rem] lg:px-[1.1875rem] lg:py-[0.625rem]"
								></textarea>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		{#if !enviado}
			<div class="flex w-full shrink-0 flex-col items-center gap-3">
				{#if submitError}
					<p class="text-note text-red-600" role="alert">{submitError}</p>
				{/if}
				<div class="flex gap-12">
					{#if step > 1}
						<button class="btn" type="button" onclick={edit}>
							<img src="/icons/undo.svg" alt="undo icon" class="h-4 w-4" /> Editar
						</button>
					{/if}
					{#if !isLastStep}
						<button class="btn btn-primary" type="button" onclick={next} disabled={!stepValid}>
							Siguiente
						</button>
					{:else}
						<button
							type="submit"
							class="btn btn-primary font-medium lg:w-[18rem] lg:py-[1.25rem] lg:text-[1.125rem]"
							disabled={!valid || submitting}
						>
							{submitting ? 'Enviando…' : 'Enviar'}
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</form>
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
	/* Same progress bar as the RSVP form (src/lib/components/Form.svelte). */
	@property --progress {
		syntax: '<percentage>';
		inherits: true;
		initial-value: 0%;
	}

	#encuesta_progress {
		--progress: calc(var(--step) / var(--total-steps) * 100%);
		background: linear-gradient(
			90deg,
			var(--color-primary) calc(var(--progress) - 20%),
			transparent var(--progress)
		);
		transition: --progress 0.4s ease;
	}
</style>
