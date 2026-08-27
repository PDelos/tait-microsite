<script lang="ts">
	interface AgendaItem {
		time: string;
		label: string;
	}

	const items: AgendaItem[] = [
		{ time: '10:30-11:00h', label: 'Bienvenida' },
		{ time: '11:00-13:00h', label: 'Reunión Anual' },
		{ time: '13:15-14:30h', label: 'Almuerzo de Aniversario' },
		{ time: '14:45-15:45h', label: 'Reto sorpresa' },
		{ time: '16:00-16:30h', label: '10 años juntos y un futuro brillante' }
	];

	const tardeoTime = '16:30-18:30h';

	// On mobile the tardeo is a sixth dot on the timeline with no label under it —
	// its name is the big footer text. On desktop it sits in the footer instead.
	const mobileItems: AgendaItem[] = [...items, { time: tardeoTime, label: '' }];
</script>

<section id="agenda" class="@container items-center">
	<h2 class="heading shrink-0 pt-14 text-center text-white">Agenda</h2>

	<!-- Mobile: vertical timeline, line down the left, text left-justified. -->
	<!-- Height is set rather than flex-1: filling all the leftover space pushed the
	 timeline up into the gradient fade and down into the footer heading. --timeline-h
	 is the one knob here; my-auto centres it in whatever is left over. -->
	<ol
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
					<span class="absolute top-[var(--dot-y)] left-[3px] h-full w-px bg-primary/40"></span>
				{/if}
				<span
					class="absolute top-[var(--dot-y)] left-0 size-[7px] -translate-y-1/2 rounded-full bg-primary"
				></span>

				<p class="text-[1.5rem] font-normal text-primary">{time}</p>
				{#if label}
					<p class="text-[2.25rem] leading-tight font-medium text-primary">{label}</p>
				{/if}
			</li>
		{/each}
	</ol>

	<!-- Desktop: horizontal timeline. Absolutely positioned so the dots sit on
	 --line-y and the event names on --fade-mid, whatever the heading's height. -->
	<div class="absolute inset-x-0 hidden px-16 lg:block" style="top: var(--line-y)">
		<!-- Unpadded, so the line's percentages resolve against the same box the
		 columns are laid out in. -->
		<div class="relative flex">
			<!-- Five equal columns put the dot centres at 10/30/50/70/90%, so this is
			 one straight run from first dot to last — nothing to break between them. -->
			<span class="absolute top-1/2 right-[10%] left-[10%] h-px bg-white/50" aria-hidden="true"
			></span>

			{#each items as { time, label } (time)}
				<div class="relative flex flex-1 justify-center">
					<!-- Both labels are out of flow, so the row's height stays exactly the
					 dot and the line can't be knocked off --line-y by a wrapped name. -->
					<p
						class="absolute bottom-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 text-[0.875rem] font-normal whitespace-nowrap text-white"
					>
						{time}
					</p>

					<span class="size-2 shrink-0 rounded-full bg-white"></span>

					<!-- Centred on the midpoint of the fade, measured from the row (which
					 is at --line-y): emerging from the transition, not sitting on flat
					 blue or flat white. -->
					<p
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
		class="@container mx-auto mb-28 flex w-[80%] shrink-0 flex-col items-center justify-center gap-8 text-center lg:mt-auto lg:mb-18"
	>
		<p class="hidden text-[1.125rem] text-primary lg:block">{tardeoTime}</p>
		<p class="heading pb-20 text-[12cqw] leading-[1.05] font-normal lg:pb-10 lg:text-[4.5rem]">
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
		--dot-y: 2rem;

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
