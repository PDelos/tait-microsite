<script lang="ts">
	type MenuKey = 'entrante' | 'principal' | 'postre';

	let step = $state(1);

	let nombre = $state('');
	let transporte = $state('');
	let restriccion = $state(''); // 'No' | 'Si'
	let dieta = $state('');
	let talla = $state('');
	let alergia = $state('');

	let menu = $state<Record<MenuKey, string>>({ entrante: '', principal: '', postre: '' });

	let recuerdo = $state('');
	let deseo = $state('');

	const TALLAS = ['S', 'M', 'L', 'XL', 'XXL'];

	const MENU: Record<MenuKey, string[]> = {
		entrante: [
			'Arroz de setas de temporada con jamón',
			'Ensalada de langostions con frutos rojos y calabaza'
		],
		principal: [
			'Solomillo de ternera con demiglacé de patata encebollada',
			'Colita de rape con almejas en salsa verde'
		],
		postre: ['Lemon pie', 'Coulant de chocolate con sorbete de mandarina y petazetas']
	};

	const MENU_LABELS: Record<MenuKey, string> = {
		entrante: 'Entrante',
		principal: 'Principal',
		postre: 'Postre'
	};

	const next = () => step++;
	const edit = () => step--;

	function setAlergia(e: KeyboardEvent) {
		const target = e.currentTarget as HTMLInputElement;
		const value = target.value.trim();
		if (e.key === 'Enter' && value) {
			alergia = value;
			target.value = '';
		}
	}
</script>

{#snippet radioGroup(
	name: string,
	value: string,
	onSelect: (v: string) => void,
	options: string[],
	formatLabel: (o: string) => string = (o) => o
)}
	{#each options as option}
		<label class="form__radio">
			<input type="radio" {name} checked={value === option} onchange={() => onSelect(option)} />
			{formatLabel(option)}
		</label>
	{/each}
{/snippet}

{#if step === 1}
	<section class="form">
		<h1 class="form__title">Nos gustaría saber...</h1>

		<div class="form__field">
			<label class="form__label" for="nombre">Nombre y Apellido</label>
			<input
				class="form__input"
				id="nombre"
				type="text"
				bind:value={nombre}
				placeholder="Escribir aquí"
			/>
		</div>

		<div class="form__field">
			<h3 class="form__subtitle">Voy a ir con:</h3>
			<label class="form__radio">
				<input type="radio" bind:group={transporte} value="vehiculo" />
				Mi propio vehículo (aparcamiento gratuito)
			</label>
			<label class="form__radio">
				<input type="radio" bind:group={transporte} value="bus" />
				Iré y volveré en bus des de TAIT
				<small class="form__detail">Recogida en TAIT 10:00h · Vuelta a TAIT a las 18:30h</small>
			</label>
		</div>

		<div class="form__field">
			<h3 class="form__subtitle">Tengo intolerancias o restricciones alimentarias</h3>
			<label class="form__radio"
				><input type="radio" bind:group={restriccion} value="No" /> No</label
			>
			<label class="form__radio"
				><input type="radio" bind:group={restriccion} value="Si" /> Si</label
			>

			{#if restriccion === 'Si'}
				{#if alergia}
					<span class="form__tag">
						{alergia}
						<button class="form__tag-remove" type="button" onclick={() => (alergia = '')}>x</button>
					</span>
				{:else}
					<input
						class="form__input"
						type="text"
						placeholder="Especificar aquí"
						onkeydown={setAlergia}
					/>
				{/if}

				<label class="form__radio"
					><input type="radio" bind:group={dieta} value="Vegetariano/a" /> Vegetariano/a</label
				>
				<label class="form__radio"
					><input type="radio" bind:group={dieta} value="Vegano/a" /> Vegano/a</label
				>
			{/if}
		</div>

		<div class="form__field">
			<h3 class="form__subtitle">Talla de camiseta</h3>
			{@render radioGroup('talla', talla, (v) => (talla = v), TALLAS)}
		</div>

		<h2 class="form__title">¿Qué te apetece almorzar?</h2>

		{#each Object.entries(MENU) as [key, options]}
			<div class="form__field">
				<h3 class="form__subtitle">{MENU_LABELS[key as MenuKey]} (elige uno)</h3>
				{@render radioGroup(key, menu[key as MenuKey], (v) => (menu[key as MenuKey] = v), options)}
			</div>
		{/each}

		<button class="form__button" type="button" onclick={next}>Siguiente</button>
	</section>
{/if}

{#if step === 2}
	<section class="form">
		<h1 class="form__title">Nos gustaría saber...</h1>

		<div class="form__field">
			<label class="form__label" for="recuerdo">¿Cuál es tu recuerdo favorito en TAIT?</label>
			<textarea
				class="form__textarea"
				id="recuerdo"
				bind:value={recuerdo}
				placeholder="Escribir aquí"></textarea>
		</div>

		<div class="form__field">
			<label class="form__label" for="deseo">¿Qué deseas para los futuros 10 años en TAIT?</label>
			<textarea class="form__textarea" id="deseo" bind:value={deseo} placeholder="Escribir aquí"
			></textarea>
		</div>

		<button class="form__button form__button--ghost" type="button" onclick={edit}>← Editar</button>
		<button class="form__button" type="button" onclick={next}>Siguiente</button>
	</section>
{/if}

{#if step === 3}
	<section class="summary">
		<h1 class="summary__title">¡Enviado!</h1>

		<div class="summary__card">
			<p class="summary__label">Nombre y Apellido</p>
			<p class="summary__value">{nombre}</p>

			<p class="summary__label">Voy a ir con:</p>
			<p class="summary__value">
				{transporte === 'vehiculo'
					? 'Mi propio vehículo (aparcamiento gratuito)'
					: 'Iré y volveré en bus des de TAIT'}
			</p>

			<p class="summary__label">Tengo intolerancias o restricciones alimentarias</p>
			<p class="summary__value">{restriccion}</p>

			{#if restriccion === 'Si'}
				<p class="summary__label">¿Tienes alguna restricción alimentaria?</p>
				<p class="summary__value">{dieta || 'No'}</p>

				{#if alergia}
					<p class="summary__label">Especifica intolerancias o restricciones alimentarias</p>
					<p class="summary__value">{alergia}</p>
				{/if}
			{/if}

			<p class="summary__label">Talla de camiseta</p>
			<p class="summary__value">{talla}</p>

			{#each Object.entries(MENU_LABELS) as [key, label]}
				<p class="summary__label">{label}</p>
				<p class="summary__value">{menu[key as MenuKey]}</p>
			{/each}
		</div>

		<button class="summary__button summary__button--ghost" type="button" onclick={edit}
			>Editar</button
		>
	</section>
{/if}
