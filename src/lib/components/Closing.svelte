<script lang="ts">
	import logo from '$lib/assets/logo_tait.svg';
</script>

<section class="closing">
	<img class="closing__logo" src={logo} alt="Tait logo" />

	<div class="closing__content stack">
		<p class="closing__title title">¡Te esperamos!</p>
		<p class="closing__subtitle subtitle">Muchas gracias</p>
	</div>

	<div class="closing__spacer" aria-hidden="true"></div>
</section>

<style>
	.closing {
		background:
			radial-gradient(108% 108% at 51% 0%, var(--color-white) 68%, var(--color-main) 100%),
			var(--color-white);
		justify-content: space-between;
		align-items: center;
		padding: 3.5rem var(--gutter);
		text-align: center;
	}

	.closing__logo {
		align-self: flex-end;
		width: 7rem;
		height: auto;
	}

	.closing__content {
		align-items: center;
		gap: 1.5rem;
	}

	/* balances the logo above so the title/subtitle sit visually centered */
	.closing__spacer {
		height: 7rem;
	}
</style>
