<script lang="ts">
	import { reveal, HIDDEN, SHOWN } from '$lib/anim';

	let section: HTMLElement;

	$effect(() =>
		reveal(section, (tl) =>
			tl
				.fromTo(
					'[data-reveal="opening-title"]',
					{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
					{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }
				)
				.fromTo(
					'[data-reveal-children="opening-footer"] > *',
					HIDDEN,
					{ ...SHOWN, stagger: 0.12 },
					'-=0.5'
				)
		)
	);
</script>

<section id="opening" bind:this={section} class="items-center">
	<div
		id="opening_hero"
		class="@container flex w-[90%] flex-1 items-center justify-center text-center lg:w-[70%]"
	>
		<p data-reveal="opening-title" class="heading text-[12cqw] font-normal lg:text-[6rem]">
			y a la reunión anual de la Compañía:
		</p>
	</div>

	<!-- .heading is all inheritable properties, so the three lines share one declaration. -->
	<footer
		id="opening_footer"
		data-reveal-children="opening-footer"
		class="heading flex w-full items-center justify-between p-18 text-[4rem] font-normal"
	>
		<p>29-06-26</p>
		<p>Hotel Qgat</p>
		<p>11:00h</p>
	</footer>
</section>
