<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { reveal, HIDDEN, SHOWN } from '$lib/anim';

	type Option = { value: string; label: string; sublabel?: string };

	// Values match the CHECK constraints in the rsvps table (src/lib/server/db.ts).
	const transporteOptions: Option[] = [
		{ value: 'vehiculo_propio', label: 'Mi propio vehículo (aparcamiento gratuito)' },
		{
			value: 'bus',
			label: 'Iré y volveré en bus des de TAIT',
			sublabel: 'Recogida en TAIT 10:00h - Vuelta a TAIT a las 18:30h'
		}
	];
	const intoleranciasOptions: Option[] = [
		{ value: 'no', label: 'No' },
		{ value: 'si', label: 'Si' }
	];
	const dietaOptions: Option[] = [
		{ value: 'vegetariano', label: 'Vegetariano/a' },
		{ value: 'vegano', label: 'Vegano/a' }
	];
	const tallaOptions: Option[] = [
		{ value: 'S', label: 'S' },
		{ value: 'M', label: 'M' },
		{ value: 'L', label: 'L' },
		{ value: 'XL', label: 'XL' },
		{ value: 'XXL', label: 'XXL' }
	];
	const entrevistaOptions: Option[] = [
		{ value: 'si', label: 'Sí, me gustaría' },
		{ value: 'no', label: 'No, no quiero participar' }
	];

	// All three courses behave identically: one radio group, one choice.
	const meals: { id: string; label: string; options: Option[] }[] = [
		{
			id: 'entrante',
			label: 'Entrante',
			options: [
				{ value: 'arroz_setas_jamon', label: 'Arroz de setas de temporada con jamón' },
				{
					value: 'ensalada_langostinos',
					label: 'Ensalada de langostions con frutos rojos y calabaza'
				}
			]
		},
		{
			id: 'principal',
			label: 'Principal',
			options: [
				{
					value: 'solomillo_ternera',
					label: 'Solomillo de ternera con demiglacé de patata encebollada'
				},
				{ value: 'colita_rape', label: 'Colita de rape con almejas en salsa verde' }
			]
		},
		{
			id: 'postre',
			label: 'Postre',
			options: [
				{ value: 'lemon_pie', label: 'Lemon pie' },
				{
					value: 'coulant_chocolate',
					label: 'Coulant de chocolate con sorbete de mandarina y petazetas'
				}
			]
		}
	];

	function labelFor(options: Option[], value: string | null) {
		return options.find((o) => o.value === value)?.label ?? '';
	}

	// --- Column A state ---
	let nombre = $state('');
	let transporte = $state<string | null>(null);
	let intolerancias = $state<string | null>(null);
	let restricciones = $state<string[]>([]);
	let restriccionInput = $state('');
	let dietaEspecial = $state<string | null>(null);
	let talla = $state<string | null>(null);

	// --- Column B state (one choice per course) ---
	let mealChoices = $state<Record<string, string | null>>({
		entrante: null,
		principal: null,
		postre: null
	});

	// A special diet (vegano/vegetariano) disables the courses and clears any choice.
	const foodDisabled = $derived(dietaEspecial !== null);

	$effect(() => {
		if (foodDisabled) {
			for (const meal of meals) mealChoices[meal.id] = null;
		}
	});

	$effect(() => {
		if (intolerancias !== 'si') {
			restricciones = [];
			restriccionInput = '';
			dietaEspecial = null;
		}
	});

	// --- Memoria step state ---
	let recuerdo = $state('');
	let deseos = $state('');
	let fotos = $state<File[]>([]);
	let entrevista = $state<string | null>(null);

	const MAX_FOTOS = 10; // mirror of MAX_FILES in src/lib/server/blob.ts

	// The chips are the source of truth; the file input is kept in sync via
	// DataTransfer so the native form submission sends exactly the chosen files.
	let fotoInput: HTMLInputElement | null = null;

	function syncFotoInput() {
		if (!fotoInput) return;
		const dt = new DataTransfer();
		for (const foto of fotos) dt.items.add(foto);
		fotoInput.files = dt.files;
	}

	function addFotos(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		fotos = [...fotos, ...Array.from(input.files ?? [])].slice(0, MAX_FOTOS);
		input.value = ''; // allow picking the same file again
		syncFotoInput();
	}

	function removeFoto(i: number) {
		fotos = fotos.filter((_, idx) => idx !== i);
		syncFotoInput();
	}

	function commitRestriccion() {
		const value = restriccionInput.trim();
		if (!value || restricciones.includes(value)) {
			restriccionInput = '';
			return;
		}
		restricciones = [...restricciones, value];
		restriccionInput = '';
	}

	// Enter turns the text into a chip; blur does too, so text typed and then
	// left behind by clicking "Siguiente" isn't silently discarded.
	function onRestriccionKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commitRestriccion();
		}
	}

	// --- Steps ---
	// Desktop: 'form' (columns A+B) → 'memoria' → 'resumen'
	// Mobile:  'datos' → 'comida' → 'memoria' → 'resumen'
	// With a special diet, the 'comida' step simply doesn't exist on mobile,
	// so next/edit never need special-casing.
	// Steps stay mounted (hidden with CSS, never unmounted) so every input
	// is always part of the submitted FormData.
	let isMobile = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(max-width: 1023px)');
		isMobile = mq.matches;
		const onChange = (e: MediaQueryListEvent) => (isMobile = e.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	const steps = $derived(
		isMobile
			? foodDisabled
				? ['datos', 'memoria', 'resumen']
				: ['datos', 'comida', 'memoria', 'resumen']
			: ['form', 'memoria', 'resumen']
	);

	let step = $state(1);
	const currentStep = $derived(steps[step - 1]);

	const showColumnA = $derived(currentStep === 'form' || currentStep === 'datos');
	const showColumnB = $derived(currentStep === 'form' || currentStep === 'comida');
	const showMemoria = $derived(currentStep === 'memoria');
	const showSummary = $derived(currentStep === 'resumen');

	// --- Validation ---
	// Saying "sí" to restrictions means saying which. A vegetariano/vegano choice
	// counts on its own, and so does text still sitting in the box — otherwise
	// "Siguiente" would stay disabled and never let the field blur into a chip.
	const restriccionesValid = $derived(
		intolerancias !== 'si' ||
			restricciones.length > 0 ||
			restriccionInput.trim().length > 0 ||
			dietaEspecial !== null
	);

	const datosValid = $derived(
		nombre.trim().length > 0 &&
			transporte !== null &&
			intolerancias !== null &&
			restriccionesValid &&
			talla !== null
	);
	const comidaValid = $derived(foodDisabled || meals.every((m) => mealChoices[m.id] !== null));
	const memoriaValid = $derived(
		recuerdo.trim().length > 0 && deseos.trim().length > 0 && entrevista !== null
	);

	const stepValid = $derived.by(() => {
		switch (currentStep) {
			case 'form':
				return datosValid && comidaValid;
			case 'datos':
				return datosValid;
			case 'comida':
				return comidaValid;
			case 'memoria':
				return memoriaValid;
			default:
				return true; // resumen: nothing left to validate
		}
	});

	// --- Navigation & submission ---
	function next() {
		// No-op if blur already turned it into a chip; a safety net if it didn't.
		commitRestriccion();
		if (stepValid) step = Math.min(step + 1, steps.length);
	}

	function edit() {
		step = Math.max(step - 1, 1);
	}

	// "Enviar" is a real submit button; on success we advance to the resumen step.
	let submitting = $state(false);
	let submitError = $state('');

	// Only the first step is revealed: the later steps are swapped in by a button,
	// not by scrolling, and they are already inside a section that has played.
	let section: HTMLElement;

	$effect(() =>
		reveal(section, (tl) =>
			tl
				.fromTo('[data-reveal="form-title"]', HIDDEN, SHOWN)
				.fromTo(
					'[data-reveal="form-progress"]',
					{ opacity: 1, scaleX: 0 },
					{ scaleX: 1, transformOrigin: 'left center', duration: 0.9, ease: 'power2.inOut' },
					'-=0.4'
				)
				.fromTo(
					'[data-reveal-children="form-fields"] > *',
					HIDDEN,
					{ ...SHOWN, stagger: 0.12 },
					'-=0.6'
				)
		)
	);

	const onSubmit: SubmitFunction = () => {
		submitting = true;
		submitError = '';
		return async ({ result }) => {
			submitting = false;
			if (result.type === 'success') {
				step = steps.length;
			} else if (result.type === 'failure') {
				submitError =
					(result.data as { error?: string } | undefined)?.error ??
					'Ha ocurrido un error al enviar. Inténtalo de nuevo.';
			} else {
				submitError = 'Ha ocurrido un error al enviar. Inténtalo de nuevo.';
			}
		};
	};
</script>

{#snippet radioGroup(
	title: string,
	groupName: string,
	options: Option[],
	selected: string | null,
	onSelect: (v: string) => void,
	horizontal = false,
	disabled = false
)}
	<div class="field">
		{#if title}
			<p class="field-label">{title}</p>
		{/if}
		<div class="flex gap-2 {horizontal ? 'flex-row' : 'flex-col'}">
			{#each options as opt (opt.value)}
				<label
					class="pill flex-col items-stretch transition-colors
						{selected === opt.value ? 'border-black' : 'border-transparent'}
						{disabled ? 'pointer-events-none' : 'cursor-pointer'}"
				>
					<span class="flex items-center gap-2">
						<input
							type="radio"
							name={groupName}
							value={opt.value}
							checked={selected === opt.value}
							{disabled}
							onchange={() => onSelect(opt.value)}
							class="accent-black"
						/>
						{opt.label}
					</span>
					{#if opt.sublabel}
						<span class="pl-6 text-note">{opt.sublabel}</span>
					{/if}
				</label>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet chip(text: string, onRemove: () => void)}
	<span class="pill w-fit gap-1.5 border-gray-300 px-3 py-1 text-note">
		{text}
		<button
			type="button"
			onclick={onRemove}
			class="text-gray-400 hover:text-gray-600"
			aria-label="Eliminar {text}"
		>
			✕
		</button>
	</span>
{/snippet}

<!-- One title over one or more pills. `plain` renders the values as unselected
 options (grey, no dot) instead of as the answer that was chosen. -->
{#snippet summary(title: string, values: string[], plain = false)}
	<div class="field">
		<p class="field-label">{title}</p>
		<div class="flex flex-wrap items-start gap-2">
			{#each values as value (value)}
				<span class="pill w-fit {plain ? 'border-gray-300' : 'border-black'}">
					{#if !plain}
						<span class="size-2.5 shrink-0 rounded-full bg-black"></span>
					{/if}
					{value}
				</span>
			{/each}
		</div>
	</div>
{/snippet}

<section id="form" bind:this={section}>
	<form
		method="POST"
		action="?/submit"
		enctype="multipart/form-data"
		use:enhance={onSubmit}
		class="flex h-full min-h-0 w-full flex-col justify-between gap-8 py-5"
	>
		<!-- Header and footer are shrink-0 and the step area scrolls between them,
		 so the buttons keep their place no matter how tall a step gets. -->
		<div class="flex w-full shrink-0 flex-col gap-12 text-center">
			<h1 data-reveal="form-title" class="heading heading-gradient">
				{step < steps.length ? 'Nos gustaría saber...' : '¡Enviado!'}
			</h1>
			<div
				id="progress_bar"
				data-reveal="form-progress"
				class="h-3 w-full origin-left"
				style="--step: {step}; --total-steps: {steps.length};"
			></div>
		</div>

		<!-- min-h-0 lets this shrink below its content so the footer is never pushed
		 out of the (overflow-hidden) section; min-h-full centres short steps. -->
		<div class="min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto">
			<div class="flex min-h-full w-full flex-col justify-center">
				<div
					data-reveal-children="form-fields"
					class="step {showColumnA || showColumnB ? 'flex' : 'hidden'}"
				>
					<div class="step-col {showColumnA ? 'flex' : 'hidden'}">
						<div class="field">
							<p class="field-label">Nombre y Apellido</p>
							<input
								type="text"
								name="nombre"
								placeholder="Escribir aquí"
								bind:value={nombre}
								class="input rounded-full py-3"
							/>
						</div>

						{@render radioGroup(
							'Voy a ir con:',
							'transporte',
							transporteOptions,
							transporte,
							(v) => (transporte = v)
						)}

						{@render radioGroup(
							'Tengo intolerancias o restricciones alimentarias',
							'intolerancias',
							intoleranciasOptions,
							intolerancias,
							(v) => (intolerancias = v),
							true
						)}

						{#if intolerancias === 'si'}
							<div class="flex flex-col gap-2 pl-2">
								{#if restricciones.length > 0}
									<div class="flex flex-wrap gap-1.5">
										{#each restricciones as tag, i (tag)}
											<input type="hidden" name="restricciones" value={tag} />
											{@render chip(
												tag,
												() => (restricciones = restricciones.filter((_, idx) => idx !== i))
											)}
										{/each}
									</div>
								{/if}

								<input
									type="text"
									placeholder="Especificar aquí"
									bind:value={restriccionInput}
									onkeydown={onRestriccionKeydown}
									onblur={commitRestriccion}
									class="input rounded-full py-2 text-note"
								/>

								{@render radioGroup(
									'',
									'dietaEspecial',
									dietaOptions,
									dietaEspecial,
									(v) => (dietaEspecial = v),
									true
								)}
							</div>
						{/if}

						{@render radioGroup(
							'Talla de camiseta',
							'talla',
							tallaOptions,
							talla,
							(v) => (talla = v),
							true
						)}
					</div>

					<div
						class="step-col {showColumnB ? 'flex' : 'hidden'} transition-opacity
					{foodDisabled ? 'pointer-events-none opacity-40' : ''}"
					>
						<p class="field-label">¿Qué te apetece almorzar?</p>
						{#each meals as meal (meal.id)}
							{@render radioGroup(
								`${meal.label} (elige uno)`,
								meal.id,
								meal.options,
								mealChoices[meal.id],
								(v) => (mealChoices[meal.id] = v),
								false,
								foodDisabled
							)}
						{/each}
					</div>
				</div>

				<div class="step {showMemoria ? 'flex' : 'hidden'}">
					<div class="step-col">
						<div class="field">
							<p class="field-label">¿Cuál es tu recuerdo favorito en TAIT?</p>
							<textarea
								name="recuerdo"
								placeholder="Escribir aquí"
								bind:value={recuerdo}
								rows="6"
								class="input resize-none rounded-2xl py-3"></textarea>
						</div>

						<div class="field">
							<p class="field-label">¿Quieres compartir alguna foto de la historia de TAIT?</p>
							<label
								class="flex h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 text-note text-gray-400"
							>
								<input
									type="file"
									name="fotos"
									accept="image/*"
									multiple
									class="hidden"
									bind:this={fotoInput}
									onchange={addFotos}
								/>
								<img src="/icons/upload.svg" alt="upload icon" class="h-5 w-5" />
								<span>
									{fotos.length > 0 ? `${fotos.length} foto(s) seleccionada(s)` : 'Select file'}
								</span>
							</label>
							{#if fotos.length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each fotos as foto, i (foto.name + i)}
										{@render chip(foto.name, () => removeFoto(i))}
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<div class="step-col">
						<div class="field">
							<p class="field-label">¿Qué deseas para los futuros 10 años en TAIT?</p>
							<textarea
								name="deseos"
								placeholder="Escribir aquí"
								bind:value={deseos}
								rows="6"
								class="input resize-none rounded-2xl py-3"></textarea>
						</div>

						{@render radioGroup(
							'El dia 14 de septiembre vamos a realizar unas breves entrevistas para el evento, ¿te gustaría participar?',
							'entrevista',
							entrevistaOptions,
							entrevista,
							(v) => (entrevista = v)
						)}
					</div>
				</div>

				<div
					class="step {showSummary
						? 'flex'
						: 'hidden'} mx-10 self-stretch rounded-2xl border border-gray-200 py-8 lg:mx-0"
				>
					<div class="step-col gap-6">
						{@render summary('Nombre y Apellido', [nombre], true)}
						{@render summary('Voy a ir con:', [labelFor(transporteOptions, transporte)])}
						{@render summary('Tengo intolerancias o restricciones alimentarias', [
							labelFor(intoleranciasOptions, intolerancias)
						])}
						{#if intolerancias === 'si'}
							{@render summary('Especifica intolerancias o restricciones alimentarias', [
								...restricciones,
								...(dietaEspecial ? [labelFor(dietaOptions, dietaEspecial)] : [])
							])}
						{/if}
						{@render summary('Talla de camiseta', [talla ?? ''])}
					</div>

					<div
						class="step-col gap-6 transition-opacity
					{foodDisabled ? 'opacity-40' : ''}"
					>
						<p class="field-label">¿Qué te apetece almorzar?</p>
						{#each meals as meal (meal.id)}
							<!-- With a special diet nothing was selectable, so every option is
							 listed plain instead of one being marked as the choice. -->
							{@render summary(
								meal.label,
								foodDisabled
									? meal.options.map((o) => o.label)
									: [labelFor(meal.options, mealChoices[meal.id])],
								foodDisabled
							)}
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="flex w-full shrink-0 flex-col items-center gap-3">
			{#if submitError}
				<p class="text-note text-red-600">{submitError}</p>
			{/if}
			<div class="flex gap-12">
				{#if step > 1 && step < steps.length}
					<button class="btn" type="button" onclick={edit}>
						<img src="/icons/undo.svg" alt="undo icon" class="h-4 w-4" /> Editar
					</button>
				{/if}
				{#if step < steps.length - 1}
					<button class="btn btn-primary" type="button" onclick={next} disabled={!stepValid}>
						Siguiente
					</button>
				{:else if step === steps.length - 1}
					<button class="btn btn-primary" type="submit" disabled={!stepValid || submitting}>
						{submitting ? 'Enviando…' : 'Enviar'}
					</button>
				{/if}
			</div>
		</div>
	</form>
</section>

<style>
	/* Everything else this section used to define now lives in
	 * src/routes/layout.css, shared with /export. */

	@property --progress {
		syntax: '<percentage>';
		inherits: true;
		initial-value: 0%;
	}

	#progress_bar {
		--progress: calc(var(--step) / var(--total-steps) * 100%);
		background: linear-gradient(
			90deg,
			var(--color-primary) calc(var(--progress) - 20%),
			transparent var(--progress)
		);
		transition: --progress 0.4s ease;
	}
</style>
