<script lang="ts">
	import { reveal, HIDDEN, SHOWN } from '$lib/anim';

	interface AgendaItem {
		time: string;
		label: string;
	}

	const items: AgendaItem[] = [
		{ time: '11:00-11:30h', label: 'Bienvenida' },
		{ time: '11:30-13:30h', label: 'Reunión Anual' },
		{ time: '13:30-14:30h', label: 'Almuerzo de Aniversario' },
		{ time: '14:45-15:45h', label: 'Reto sorpresa' },
		{ time: '16:00-16:30h', label: '10 años juntos y un futuro brillante' }
	];

	const tardeoTime = '16:30-18:30h';

	// On mobile the tardeo is a sixth dot on the timeline with no label under it —
	// its name is the big footer text. On desktop it sits in the footer instead.
	const mobileItems: AgendaItem[] = [...items, { time: tardeoTime, label: '' }];

	let section: HTMLElement;

	// The line draws itself and the dots land on it as it passes — left to right on
	// desktop, top to bottom on mobile. Both trees are in the DOM but only one is
	// displayed, so the two versions are built at the same timeline label and
	// whichever is on screen is the one you see. They are selected separately
	// rather than together so each gets its own stagger from its own first dot.
	const mobile = (sel: string) => `[data-timeline='mobile'] ${sel}`;
	const desktop = (sel: string) => `[data-timeline='desktop'] ${sel}`;

	$effect(() =>
		reveal(section, (tl) =>
			tl
				.fromTo('[data-reveal="agenda-title"]', HIDDEN, SHOWN)
				.addLabel('draw', '-=0.3')
				// Desktop: one straight run from the first dot to the last.
				.fromTo(
					desktop('[data-reveal="line"]'),
					{ opacity: 1, scaleX: 0 },
					{ scaleX: 1, transformOrigin: 'left center', duration: 1.2, ease: 'power2.inOut' },
					'draw'
				)
				// Mobile: one segment per item, drawn in sequence so they read as a
				// single line growing downwards.
				.fromTo(
					mobile('[data-reveal="line"]'),
					{ opacity: 1, scaleY: 0 },
					{ scaleY: 1, transformOrigin: 'center top', duration: 0.3, ease: 'none', stagger: 0.2 },
					'draw'
				)
				.fromTo(
					desktop('[data-reveal="dot"]'),
					{ opacity: 0, scale: 0 },
					{ opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', stagger: 0.24 },
					'draw+=0.15'
				)
				.fromTo(
					mobile('[data-reveal="dot"]'),
					{ opacity: 0, scale: 0, yPercent: -50 },
					{
						opacity: 1,
						scale: 1,
						yPercent: -50,
						duration: 0.35,
						ease: 'back.out(2)',
						stagger: 0.2
					},
					'draw'
				)
				.fromTo(
					desktop('[data-reveal="item"]'),
					{ opacity: 0 },
					{ opacity: 1, duration: 0.5, stagger: 0.12 },
					'draw+=0.3'
				)
				.fromTo(
					mobile('[data-reveal="item"]'),
					{ opacity: 0, x: -12 },
					{ opacity: 1, x: 0, duration: 0.5, stagger: 0.1 },
					'draw+=0.15'
				)
				.fromTo(
					'[data-reveal-children="agenda-footer"] > *',
					HIDDEN,
					{ ...SHOWN, stagger: 0.1 },
					'-=0.4'
				)
		)
	);
</script>

<section id="agenda" bind:this={section} class="@container items-center">
	<h2 data-reveal="agenda-title" class="heading shrink-0 pt-14 text-center text-white">Agenda</h2>

	<!-- Mobile: vertical timeline, line down the left, text left-justified. -->
	<!-- Height is set rather than flex-1: filling all the leftover space pushed the
	 timeline up into the gradient fade and down into the footer heading. --timeline-h
	 is the one knob here; my-auto centres it in whatever is left over. -->
	<ol
		data-timeline="mobile"
		class="my-auto flex h-[var(--timeline-h)] min-h-0 w-full flex-col pt-10 pr-10 pl-24 lg:hidden"
	>
		{#each mobileItems as { time, label }, i (time)}
			<!-- Every item but the last grows equally, so the dots stay evenly spaced
			 whatever the screen height. -->
			<li
				class="relative flex flex-col gap-1 pl-6 {i < mobileItems.length - 1
					? 'flex-1'
					: 'shrink-0'}"
			>
				{#if i < mobileItems.length - 1}
					<!-- Runs from this dot to the next: items are flush (their spacing is
					 the grown box itself, not a flex gap) so the segments read as one line. -->
					<span
						data-reveal="line"
						class="absolute top-[var(--dot-y)] left-[3px] h-full w-px origin-top bg-primary/40"
					></span>
				{/if}
				<span
					data-reveal="dot"
					class="absolute top-[var(--dot-y)] left-0 size-[7px] -translate-y-1/2 rounded-full bg-primary"
				></span>

				<p data-reveal="item" class="text-note font-normal text-primary">{time}</p>
				{#if label}
					<p data-reveal="item" class="text-body leading-tight font-medium text-primary">{label}</p>
				{/if}
			</li>
		{/each}
	</ol>

	<!-- Desktop: horizontal timeline. Absolutely positioned so the dots sit on
	 --line-y and the event names on --fade-mid, whatever the heading's height. -->
	<div class="absolute inset-x-0 hidden px-16 lg:block" style="top: var(--line-y)">
		<!-- Unpadded, so the line's percentages resolve against the same box the
		 columns are laid out in. -->
		<div data-timeline="desktop" class="relative flex">
			<!-- Five equal columns put the dot centres at 10/30/50/70/90%, so this is
			 one straight run from first dot to last — nothing to break between them. -->
			<span
				data-reveal="line"
				class="absolute top-1/2 right-[10%] left-[10%] h-px origin-left bg-white/50"
				aria-hidden="true"
			></span>

			{#each items as { time, label } (time)}
				<div class="relative flex flex-1 justify-center">
					<!-- Both labels are out of flow, so the row's height stays exactly the
					 dot and the line can't be knocked off --line-y by a wrapped name. -->
					<p
						data-reveal="item"
						class="absolute bottom-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 text-[0.875rem] font-normal whitespace-nowrap text-white"
					>
						{time}
					</p>

					<span data-reveal="dot" class="size-2 shrink-0 rounded-full bg-white"></span>

					<!-- Centred on the midpoint of the fade, measured from the row (which
					 is at --line-y): emerging from the transition, not sitting on flat
					 blue or flat white. -->
					<p
						data-reveal="item"
						class="absolute top-[calc(var(--fade-mid)-var(--line-y))] left-1/2 w-full -translate-x-1/2 -translate-y-1/2 px-1 text-center text-[1.75rem] leading-tight font-medium text-balance text-white"
					>
						{label}
					</p>
				</div>
			{/each}
		</div>
	</div>

	<div
		id="agenda_footer"
		data-reveal-children="agenda-footer"
		class="@container mx-auto mb-28 flex w-[80%] shrink-0 flex-col items-center justify-center gap-8 text-center lg:mt-auto lg:mb-18"
	>
		<p class="hidden text-lead text-primary lg:block">{tardeoTime}</p>
		<!-- mb-0 because this one carries its own pb-20/lg:pb-10: that utility wins over
		 the padding-block in .heading-gradient, leaving its negative bottom margin
		 with nothing to cancel and pulling the footer up by ~0.2em. -->
		<p
			class="heading heading-gradient mb-0 pb-20 text-[12cqw] leading-[1.05] font-normal lg:pb-10 lg:text-[4.5rem]"
		>
			Tardeo de aniversario con actuación y muchas sorpresas
		</p>
	</div>
</section>

<style>
	/* The one place the vertical rhythm is defined. The section is 100dvh, so dvh
	 * units let the gradient stops and the timeline offsets be compared directly.
	 *   --fade-start .. --fade-end  the blue-to-white transition
	 *   --fade-mid                  its midpoint: where the desktop names sit
	 *   --line-y                    the desktop timeline, just above the fade so
	 *                               the dots and time labels stay on solid blue */
	#agenda {
		--fade-start: 11dvh;
		--fade-end: 19dvh;
		/* Mobile timeline height. Centred by my-auto, this lands it at roughly
		 * 21dvh–73dvh: clear of the fade above and the footer heading below. */
		--timeline-h: 45dvh;
		/* Dot centre, measured from each item's top: sits in the gap between the
		 * time label and the event name. Shared by the dot and its line segment. */
		--dot-y: 2.6rem;

		background: linear-gradient(
			180deg,
			var(--color-primary) var(--fade-start),
			#fff var(--fade-end)
		);
	}

	@media (min-width: 1024px) {
		#agenda {
			--fade-start: 38dvh;
			--fade-mid: 45dvh;
			--fade-end: 52dvh;
			--line-y: 35dvh;
		}
	}
</style>
