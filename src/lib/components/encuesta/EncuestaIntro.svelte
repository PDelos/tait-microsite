<script lang="ts">
	import { reveal, HIDDEN, SHOWN } from '$lib/anim';

	let section: HTMLElement;

	$effect(() =>
		reveal(section, (tl) =>
			tl
				.fromTo(
					'[data-reveal="claim-title"]',
					{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
					{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }
				)
				.fromTo('[data-reveal="claim-text"]', HIDDEN, SHOWN, '-=0.5')
		)
	);
</script>

<section id="claim" bind:this={section} class="items-center justify-center">
	<div
		class="@container flex w-[90%] flex-col items-center gap-[6.25rem] text-center lg:w-[74%] lg:gap-[3.125rem]"
	>
		<p
			data-reveal="claim-title"
			class="heading heading-gradient text-[11cqw] font-normal lg:text-[6rem] lg:tracking-[-0.36rem]"
		>
			¡Muchas gracias por celebrar con nosotros esta primera década de TAIT!
		</p>
		<p
			data-reveal="claim-text"
			class="subtitle max-w-[56rem] text-[3rem] leading-none tracking-[-0.1rem] lg:text-[2.5rem] lg:tracking-[-0.15rem]"
		>
			Queremos hacer una breve encuesta para saber qué es lo que más te ha gustado y en qué podemos
			mejorar:
		</p>
	</div>
</section>
