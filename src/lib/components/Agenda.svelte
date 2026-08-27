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
</script>

{#snippet agendaItem(time: string, label: string)}
	<div class="relative flex flex-1 flex-col items-center text-center">
		<p class="mb-3 text-[0.875rem] whitespace-nowrap text-white">{time}</p>

		<span class="relative z-10 -mt-[5px] size-[10px] shrink-0 rounded-full bg-white"></span>

		<p class="mt-4 max-w-[10ch] text-[1rem] leading-snug text-white">{label}</p>
	</div>
{/snippet}

<section id="agenda" class="@container items-center">
	<h2 class="heading flex-1 pt-14 text-center text-white">Agenda</h2>

	<div id="agenda_timeline" class="flex w-full flex-1 justify-between px-16 text-black lg:flex-row">
		{#each items as { time, label }}
			{@render agendaItem(time, label)}
		{/each}
	</div>

	<div
		id="agenda_footer"
		class="@container mx-auto mb-18 flex w-[80%] flex-col items-center justify-center gap-8 text-center"
	>
		<p class="text-[2rem] text-primary lg:text-[1.125rem]">16:30-18:30h</p>
		<p class="heading text-[9cqw] leading-[1.05] font-normal lg:text-[4.5rem]">
			Tardeo de aniversario con actuación y muchas sorpresas
		</p>
	</div>
</section>

<style>
	#agenda {
		background: linear-gradient(0deg, #fff 80%, var(--color-primary) calc(100% - 12rem));
	}

	@media (min-width: 1024px) {
		#agenda {
			background: linear-gradient(0deg, #fff 45%, var(--color-primary) 60%);
		}
	}
</style>
