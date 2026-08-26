<script lang="ts">
	import logo from '$lib/assets/logo_tait.svg';
</script>

<section class="invite">
	<div class="invite__hero">
		<div class="invite__intro stack">
			<p class="invite__subtitle subtitle">Es un placer invitarte a la celebración de los</p>
			<div class="invite__title-wrap">
				<h1 class="invite__title title">10 años TAIT</h1>
			</div>
		</div>
		<div class="invite__actions">
			<button class="btn">Ir al Formulario</button>
			<button class="btn btn--secondary">Ver Horario</button>
		</div>
	</div>

	<footer class="invite__footer row">
		<img class="invite__logo" src={logo} alt="Tait España" />
		<p class="invite__detail subtitle">29-06-26</p>
		<p class="invite__detail subtitle">Hotel Qgat</p>
		<p class="invite__detail subtitle">11:00h</p>
	</footer>

	<video autoplay loop muted playsinline poster="/hero_background_poster.webp">
		<source src="/hero_background.mp4" type="video/mp4" />
	</video>
</section>

<style>
	.invite {
		position: relative;
		min-height: 100svh;
		overflow: hidden;
		background: var(--color-black);
		/* display / flex-direction come from the shared `section` base */
	}

	.invite > video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
	}

	.invite::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 78%, var(--color-white) 85%);
	}

	.invite__hero {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 4rem;
		text-align: center;
		color: var(--color-white);
		position: relative;
		z-index: 2;
		width: 100%;
	}

	.invite__hero .subtitle,
	.invite__hero .title {
		color: var(--color-white);
	}

	.invite__intro {
		align-items: center;
		gap: 1rem;
	}

	.invite__actions {
		display: flex;
		gap: 1.25rem;
	}

	/* This section sits on a dark video background, so its buttons flip to a
	   light-on-dark palette. Same .btn / .btn--secondary classes as the rest
	   of the site — only the color variables change. */
	.invite__hero .btn {
		--btn-bg: var(--color-white);
		--btn-color: #2e2e2e;
		--btn-border: var(--color-border-light);
		box-shadow: 0 4px 5px rgba(0, 0, 0, 0.05);
	}

	.invite__hero .btn--secondary {
		--btn-bg: rgba(46, 46, 46, 0.47);
		--btn-color: var(--color-white);
		--btn-border: var(--color-border-soft);
		backdrop-filter: blur(20px);
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
	}

	/* container query context — width == the full hero width available to the title */
	.invite__title-wrap {
		container-type: inline-size;
		container-name: title-wrap;
		width: 100%;
	}

	.title {
		margin: 0;
		white-space: nowrap;
		line-height: 1;
		/* cqw = 1% of the container's inline (width) size.
		   Tune this multiplier once for "10 años TAIT" in your font
		   so it just touches both edges — then it holds at any screen size. */
		font-size: 15cqw;
	}

	/* Optional: at very narrow containers, allow wrapping / smaller scale
	   if 15cqw ever becomes too tall relative to viewport height */
	@container title-wrap (max-width: 480px) {
		.title {
			font-size: 15cqw;
		}
	}

	.invite__footer {
		background-color: var(--color-white);
		position: relative;
		z-index: 2;
		padding: 0.2rem 5.25rem;
		flex-shrink: 0;
	}

	.invite__logo {
		width: 6.25rem;
		height: auto;
	}
</style>
