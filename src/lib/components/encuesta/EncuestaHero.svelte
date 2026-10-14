<script lang="ts">
	import logo from '$lib/assets/logo_tait.jpg';
	import { reveal, HIDDEN, SHOWN } from '$lib/anim';

	let section: HTMLElement;

	// Same entrance as the invitation's hero (src/lib/components/Hero.svelte).
	$effect(() =>
		reveal(
			section,
			(tl) =>
				tl
					.fromTo('[data-reveal="intro-line"]', HIDDEN, SHOWN)
					.fromTo(
						'[data-reveal="intro-title"]',
						{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
						{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1 },
						'-=0.45'
					)
					.fromTo('[data-reveal="intro-action"]', HIDDEN, SHOWN, '-=0.6')
					.fromTo('[data-reveal="intro-logo"]', HIDDEN, SHOWN, '-=0.5'),
			true
		)
	);
</script>

<section id="encuesta_hero" bind:this={section}>
	<video
		class="absolute inset-0 z-0 h-full w-full object-cover"
		autoplay
		loop
		muted
		playsinline
		poster="/hero_background_poster.webp"
	>
		<source src="/hero_background.mp4" type="video/mp4" />
	</video>

	<div id="encuesta_overlay" class="absolute inset-0 z-10"></div>

	<div class="relative z-20 flex flex-1 flex-col">
		<div class="flex flex-1 flex-col items-center justify-center">
			<div class="@container flex w-full flex-col gap-[2.38rem] text-center text-white">
				<p
					data-reveal="intro-line"
					class="text-[4cqw] leading-none tracking-[-0.15rem] lg:text-[2.5rem]"
				>
					Encuesta Celebración
				</p>
				<h1
					data-reveal="intro-title"
					class="font-display text-[30cqw] leading-none tracking-[-1.3cqw] lg:text-[19cqw] lg:whitespace-nowrap @lg:tracking-[-0.9cqw]"
				>
					10 años <br class="lg:hidden" /> TAIT
				</h1>
			</div>
			<a data-reveal="intro-action" href="#encuesta" class="btn border-[#D0D0D0] bg-white">
				Ir a Encuesta
			</a>
		</div>

		<footer class="flex w-full justify-end px-21 pb-2">
			<img data-reveal="intro-logo" src={logo} class="h-24" alt="Tait España" />
		</footer>
	</div>
</section>

<style>
	#encuesta_overlay {
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0) calc(100% - 10rem),
			#fff calc(100% - 6.7rem),
			#fff 100%
		);
	}
</style>
