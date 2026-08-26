<section class="logistics">
	<div class="logistics__header stack">
		<h2 class="logistics__title title">Logística</h2>
		<p class="logistics__date subtitle">El 29 de septiembre de 2026</p>
	</div>

	<div class="logistics__cards">
		<div class="card card--map">
			<div class="card__header row">
				<p class="card__title">Hotel Qgat</p>
				<button class="btn btn--sm">Ir <span>↗</span></button>
			</div>
			<p class="card__text">Dirección: Av. de la Via Augusta, 51</p>
			<p class="card__text">08174 Sant Cugat del Vallès, Barcelona</p>
		</div>

		<div class="card card--agenda">
			<div class="card__header row">
				<p class="card__title">Agenda</p>
				<button class="btn btn--sm">Descargar <span>⬇</span></button>
			</div>
			<p class="card__text">Horario detallado</p>
			<p class="card__text">Descárgate todo lo que pasará en el aniversario</p>
		</div>
	</div>
</section>

<style>
	.logistics {
		align-items: center;
		justify-content: center;
		gap: 4rem;
		padding: 6rem var(--gutter);
	}

	.logistics__header {
		align-items: center;
		gap: 1rem;
		text-align: center;
	}

	.logistics__cards {
		display: flex;
		gap: 1.25rem;
		width: 100%;
	}

	/* content-specific art direction for each card — the shared look
	   (radius, shadow, padding, typography) lives in the global .card class */
	.card--map {
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.2)), #2e2e2e;
	}

	.card--agenda {
		background: linear-gradient(180deg, var(--color-white) 35%, var(--color-main) 90%);
	}
</style>
