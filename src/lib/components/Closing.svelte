<script lang="ts">
	import logo from '$lib/assets/logo_tait.jpg';
</script>

<section id="closing" class="items-center justify-center">
	<img class="absolute top-8 right-8 h-36" src={logo} alt="Tait logo" />

	<div id="closing_content" class="flex flex-col gap-16 text-center">
		<p class="heading">¡Te esperamos!</p>
		<p class="subtitle">Muchas gracias</p>
	</div>
</section>

<style>
	#closing {
		background: radial-gradient(108% 108% at 50% -8%, #fff 68%, var(--color-primary) 100%), #fff;
	}
</style>
