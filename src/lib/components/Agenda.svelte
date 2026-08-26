<section class="agenda">
	<h2 class="agenda__title title">Agenda</h2>

	<div class="agenda__timeline">
		<div class="agenda__times row">
			<span class="agenda__time">10:30-11:00h</span>
			<span class="agenda__time">11:00-13:00h</span>
			<span class="agenda__time">13:15-14:30h</span>
			<span class="agenda__time">14:45-15:45h</span>
			<span class="agenda__time">16:00-16:30h</span>
		</div>

		<div class="agenda__line"></div>

		<div class="agenda__items row">
			<div class="agenda__item stack">
				<span class="agenda__dot"></span>
				<p class="agenda__label">Bienvenida</p>
			</div>

			<div class="agenda__item stack">
				<span class="agenda__dot"></span>
				<p class="agenda__label">Reunión Anual</p>
			</div>

			<div class="agenda__item stack">
				<span class="agenda__dot"></span>
				<p class="agenda__label">Almuerzo de Aniversario</p>
			</div>

			<div class="agenda__item stack">
				<span class="agenda__dot"></span>
				<p class="agenda__label">Reto sorpresa</p>
			</div>

			<div class="agenda__item stack">
				<span class="agenda__dot"></span>
				<p class="agenda__label">10 años juntos y un futuro brillante</p>
			</div>
		</div>
	</div>

	<div class="agenda__footer stack">
		<span class="agenda__footer-time subtitle">16:30-18:30h</span>
		<p class="agenda__footer-text title">Tardeo de aniversario con actuación y muchas sorpresas</p>
	</div>
</section>

<style>
	.agenda {
		background: linear-gradient(0deg, var(--color-white) 50%, var(--color-main) 65%);
		align-items: center;
		justify-content: center;
		gap: 4rem;
		padding: 4rem var(--gutter);
		text-align: center;
	}

	.agenda__title {
		color: var(--color-white);
	}

	.agenda__timeline {
		position: relative;
		width: 100%;
	}

	.agenda__times {
		color: var(--color-white);
		margin-bottom: 1.5rem;
	}

	.agenda__time {
		font-size: 1.125rem;
		letter-spacing: -0.03em;
	}

	.agenda__line {
		height: 1px;
		background: rgba(255, 255, 255, 0.4);
	}

	.agenda__items {
		align-items: flex-start;
		margin-top: 2rem;
	}

	.agenda__item {
		align-items: center;
		gap: 1rem;
		flex: 1;
		color: var(--color-white);
	}

	.agenda__dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: currentColor;
		/* pulls the dot up so it sits on .agenda__line above it */
		margin-top: -2.25rem;
	}

	.agenda__label {
		margin: 0;
		font-size: 2.2rem;
		letter-spacing: -0.03em;
	}

	.agenda__footer {
		align-items: center;
		gap: 1rem;
	}

	.agenda__footer-time,
	.agenda__footer-text {
		color: var(--color-main);
	}
</style>
