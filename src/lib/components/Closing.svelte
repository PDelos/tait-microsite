<script lang="ts">
	import logo from '$lib/assets/logo_tait.jpg';
	import { reveal, HIDDEN, SHOWN } from '$lib/anim';

	let section: HTMLElement;

	$effect(() =>
		reveal(section, (tl) =>
			tl
				.fromTo(
					'[data-reveal="closing-logo"]',
					{ opacity: 0, y: -16 },
					{ opacity: 1, y: 0, duration: 0.6 }
				)
				.fromTo(
					'[data-reveal-children="closing-content"] > *',
					HIDDEN,
					{ ...SHOWN, stagger: 0.15 },
					'-=0.3'
				)
		)
	);
</script>

<section id="closing" bind:this={section} class="bg-halo items-center justify-center">
	<img data-reveal="closing-logo" class="absolute top-8 right-8 h-36" src={logo} alt="Tait logo" />

	<div
		id="closing_content"
		data-reveal-children="closing-content"
		class="flex flex-col gap-16 text-center"
	>
		<p class="heading">¡Te esperamos!</p>
		<p class="subtitle">Muchas gracias</p>
	</div>
</section>
