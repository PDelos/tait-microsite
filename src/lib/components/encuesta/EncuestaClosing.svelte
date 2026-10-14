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

<!-- A full screen like every other section (min- rather than fixed height, so a
 very short phone grows it instead of clipping). The logo sits in its own row
 above the photo, as in Figma, so it can never overlap it. -->
<section
	id="encuesta_closing"
	bind:this={section}
	class="h-auto min-h-dvh items-center justify-center gap-10 px-5 py-8 lg:gap-[3.125rem] lg:px-0 lg:py-10"
>
	<div class="flex w-full justify-end lg:w-[87.45rem]">
		<img data-reveal="closing-logo" class="h-24 lg:h-[9.5rem]" src={logo} alt="Tait España" />
	</div>

	<div
		data-reveal-children="closing-content"
		class="@container flex w-full flex-col items-center gap-[1.25rem] lg:w-[62.45rem]"
	>
		<img
			src="/foto_equipo.webp"
			width="999"
			height="483"
			alt="El equipo de TAIT celebrando el 10º aniversario"
			class="aspect-[999/483] w-full rounded-[1.3125rem] object-cover object-bottom"
		/>
		<div class="flex flex-col items-center gap-[1.25rem] text-center">
			<p
				class="heading heading-gradient text-[9.4cqw] lg:text-[6rem] lg:tracking-[-0.36rem] lg:whitespace-nowrap"
			>
				¡Esperamos tu respuesta!
			</p>
			<p class="subtitle lg:text-[2.0625rem] lg:tracking-[-0.06rem]">Muchas gracias</p>
		</div>
	</div>
</section>
