<script lang="ts">
	import logo from '$lib/assets/logo_tait.jpg';
</script>

<section id="invite">
	<video
		id="invite_background"
		class="absolute inset-0 z-0 h-full w-full object-cover"
		autoplay
		loop
		muted
		playsinline
		poster="/hero_background_poster.webp"
	>
		<source src="/hero_background.mp4" type="video/mp4" />
	</video>

	<div id="invite_overlay" class="absolute inset-0 z-10"></div>

	<div id="invite_content" class="relative z-20 flex flex-1 flex-col">
		<div id="invite_hero" class="flex flex-1 flex-col items-center justify-center">
			<div
				id="invite_intro"
				class="@container flex w-full flex-col gap-[2.38rem] text-center text-white"
			>
				<p class="text-[4cqw] leading-none tracking-[-0.15rem] lg:text-[2.5rem]">
					Es un placer invitarte a la celebración de los
				</p>
				<h1
					class="font-display text-[30cqw] leading-none tracking-[-1.3cqw] lg:text-[19cqw] lg:whitespace-nowrap @lg:tracking-[-0.9cqw]"
				>
					10 años <br class="lg:hidden" /> TAIT
				</h1>
			</div>
			<div id="invite_actions" class="flex gap-5">
				<a href="#form" class="btn border-[#D0D0D0] bg-white"> Ir al Formulario </a>

				<a href="#agenda" class="btn border-[#6E6E6E] bg-[#2E2E2E78]"> Ver Horario </a>
			</div>
		</div>

		<footer
			id="invite_footer"
			class="flex w-full items-center justify-between px-21 pb-2 text-[2rem] text-primary"
		>
			<img src={logo} class="h-24" alt="Tait España" />
			<p>29·06·26</p>
			<p>Hotel Qgat</p>
			<p>11:00h</p>
		</footer>
	</div>
</section>

<style>
	#invite_overlay {
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0) calc(100% - 10rem),
			#fff calc(100% - 6.7rem),
			#fff 100%
		);
	}
</style>
