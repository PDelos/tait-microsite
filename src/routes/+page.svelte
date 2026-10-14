<script lang="ts">
	import EncuestaHero from '$lib/components/encuesta/EncuestaHero.svelte';
	import EncuestaIntro from '$lib/components/encuesta/EncuestaIntro.svelte';
	import EncuestaForm from '$lib/components/encuesta/EncuestaForm.svelte';
	import EncuestaClosing from '$lib/components/encuesta/EncuestaClosing.svelte';
</script>

<!-- The invitation and RSVP form that used to live here are at /evento. -->

<svelte:head>
	<title>Encuesta · 10 años TAIT</title>
</svelte:head>

<main>
	<EncuestaHero />
	<EncuestaIntro />
	<EncuestaForm />
	<EncuestaClosing />
</main>
