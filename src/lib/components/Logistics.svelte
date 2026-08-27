<script lang="ts">
	interface LogisticsCard {
		title: string;
		buttonLabel: string;
		buttonIcon: string;
		lines: string[];
		href: string;
		downloadName?: string;
		bg: string;
	}

	const cards: LogisticsCard[] = [
		{
			title: 'Hotel Qgat',
			buttonLabel: 'Ir',
			buttonIcon: '/icons/arrow.svg',
			lines: ['Dirección: Av. de la Via Augusta, 51', '08174 Sant Cugat del Vallès, Barcelona'],
			href: 'https://www.google.com/maps/search/?api=1&query=Hotel+Qgat+Av.+de+la+Via+Augusta+51+Sant+Cugat+del+Valles',
			bg: '/mapa_event.png'
		},
		{
			title: 'Agenda',
			buttonLabel: 'Descargar',
			buttonIcon: '/icons/download.svg',
			lines: ['Horario detallado', 'Descárgate todo lo que pasará en el aniversario'],
			href: '/agenda.pdf',
			downloadName: 'tait-2026-10-agenda.pdf',
			bg: '/gradient.png'
		}
	];
</script>

{#snippet logisticsCard(card: LogisticsCard)}
	<a
		class="flex h-90 w-full flex-col justify-end rounded-3xl bg-cover bg-center p-6 text-white lg:h-88 lg:p-10"
		style="background-image: url({card.bg});"
		href={card.href}
		download={card.downloadName}
		target={card.downloadName ? undefined : '_blank'}
		rel={card.downloadName ? undefined : 'noopener noreferrer'}
	>
		<div class="flex items-center justify-between gap-4">
			<p class="text-[3rem] lg:text-[2rem]">{card.title}</p>

			<span class="btn bg-white text-black">
				{card.buttonLabel}
				<img src={card.buttonIcon} alt="" class="size-4" />
			</span>
		</div>

		<div class="mt-2">
			{#each card.lines as line}
				<p class="text-[2rem] leading-relaxed opacity-80 lg:text-[1rem]">{line}</p>
			{/each}
		</div>
	</a>
{/snippet}

<section id="logistics" class="justify-center p-10">
	<div class="mb-10 flex flex-col gap-8 pt-20">
		<h2 class="heading">Logística</h2>
		<p class="subtitle">El 29 de septiembre de 2026</p>
	</div>

	<div class="flex w-full flex-col gap-8 md:flex-row">
		{#each cards as card}
			{@render logisticsCard(card)}
		{/each}
	</div>
</section>
