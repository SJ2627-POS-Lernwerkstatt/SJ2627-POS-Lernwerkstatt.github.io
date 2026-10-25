<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import '../app.css';
	import CourseNav from '#lib/components/CourseNav.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import { progress } from '#lib/progress/store.svelte.js';
	import { isNarrow, setCollapsed, setDrawer, storedCollapsed } from '#lib/sidebar.js';
	import { applyTheme } from '#lib/theme.js';

	let { children, data } = $props();

	// Mirrors the data-sidebar / data-drawer attributes on <html>, which the CSS uses.
	let panelOpen = $state(true);

	onMount(() => {
		progress.init();
		panelOpen = isNarrow() ? false : !storedCollapsed();
	});

	function togglePanel() {
		panelOpen = !panelOpen;
		if (isNarrow()) setDrawer(panelOpen);
		else setCollapsed(!panelOpen);
	}

	// The drawer on narrow screens closes after following a link.
	afterNavigate(() => {
		if (isNarrow() && panelOpen) {
			panelOpen = false;
			setDrawer(false);
		}
	});

	// Also covers an import or a change in another tab.
	$effect(() => {
		if (progress.loaded) applyTheme(progress.data.settings.theme);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="page">
	<header>
		<button
			class="panel-toggle"
			type="button"
			aria-controls="course-panel"
			aria-expanded={panelOpen}
			title={panelOpen ? 'Kursübersicht ausblenden' : 'Kursübersicht einblenden'}
			onclick={togglePanel}
		>
			<span aria-hidden="true">☰</span>
			<span class="sr">Kursübersicht</span>
		</button>
		<a class="home" href={resolve('/')} aria-label="Startseite"><Logo /></a>
		<nav class="main-nav" aria-label="Hauptnavigation">
			<a href={resolve('/')}>Lernen</a>
			<a href={resolve('/ueben')}>Üben</a>
		</nav>
		<ThemeToggle />
	</header>
	<div class="body">
		<aside id="course-panel" class="panel">
			<CourseNav modules={data.nav} />
		</aside>
		<button class="scrim" type="button" tabindex="-1" aria-label="Kursübersicht schließen" onclick={togglePanel}
		></button>
		<div class="content">
			<main>
				{@render children()}
			</main>
			<footer>
				<a href={resolve('/so-funktionierts')}>So funktioniert's</a>
				<a href={resolve('/fortschritt')}>Mein Fortschritt</a>
				<a href={resolve('/datenschutz')}>Datenschutz</a>
			</footer>
		</div>
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
	}
	header {
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 12px;
		height: 64px;
		padding: 0 32px 0 16px;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
	}
	.panel-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid transparent;
		border-radius: var(--radius);
		background: transparent;
		color: var(--text-muted);
		font-size: 18px;
		cursor: pointer;
	}
	.panel-toggle:hover {
		border-color: var(--border);
		color: var(--primary);
	}
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.body {
		display: flex;
		flex: 1;
		align-items: flex-start;
	}
	.panel {
		position: sticky;
		top: 64px;
		flex: none;
		width: 300px;
		height: calc(100dvh - 64px);
		overflow-y: auto;
		background: var(--surface);
		border-right: 1px solid var(--border);
	}
	:global(:root[data-sidebar='closed']) .panel {
		display: none;
	}
	.scrim {
		display: none;
	}
	.content {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
		min-height: calc(100dvh - 64px);
	}
	.home {
		text-decoration: none;
	}
	.main-nav {
		display: flex;
		gap: 20px;
		margin-left: auto;
		margin-right: 20px;
	}
	.main-nav a {
		color: var(--text-muted);
		font-weight: 600;
		text-decoration: none;
	}
	.main-nav a:hover {
		color: var(--primary);
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
	/* Narrow screens: the panel is a drawer over the page (keep in sync with NARROW in lib/sidebar.ts). */
	@media (max-width: 960px) {
		.panel,
		:global(:root[data-sidebar='closed']) .panel {
			display: none;
			position: fixed;
			top: 64px;
			left: 0;
			z-index: 15;
			width: min(320px, 85vw);
			box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
		}
		:global(:root[data-drawer='open']) .panel {
			display: block;
		}
		:global(:root[data-drawer='open']) .scrim {
			display: block;
			position: fixed;
			inset: 64px 0 0 0;
			z-index: 10;
			border: 0;
			background: rgb(0 0 0 / 0.3);
		}
	}
	@media (max-width: 600px) {
		.main-nav {
			gap: 14px;
			margin-right: 12px;
		}
		header,
		main,
		footer {
			padding-left: 16px;
			padding-right: 16px;
		}
	}
</style>
