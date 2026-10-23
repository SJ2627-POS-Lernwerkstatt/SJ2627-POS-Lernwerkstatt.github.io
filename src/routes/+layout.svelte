<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import '../app.css';
	import Logo from '#lib/components/Logo.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import { progress } from '#lib/progress/store.svelte.js';

	let { children } = $props();

	onMount(() => progress.init());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="page">
	<header>
		<a class="home" href={resolve('/')} aria-label="Startseite"><Logo /></a>
	</header>
	<main>
		{@render children()}
	</main>
	<footer>
		<a href={resolve('/datenschutz')}>Datenschutz</a>
	</footer>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
	}
	header {
		display: flex;
		align-items: center;
		height: 64px;
		padding: 0 32px;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
	}
	.home {
		text-decoration: none;
	}
	main {
		flex: 1;
		width: 100%;
		max-width: calc(var(--content-width) + 64px);
		margin: 0 auto;
		padding: 40px 32px 64px;
	}
	footer {
		display: flex;
		gap: 20px;
		padding: 16px 32px;
		border-top: 1px solid var(--border);
		font-size: 14px;
		color: var(--text-muted);
	}
	footer a {
		color: inherit;
	}
	@media (max-width: 600px) {
		header,
		main,
		footer {
			padding-left: 16px;
			padding-right: 16px;
		}
	}
</style>
