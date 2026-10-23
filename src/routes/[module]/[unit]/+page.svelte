<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Badge from '#lib/components/Badge.svelte';
	import { cheatSheetPage, reportIssueUrl } from '#lib/content/links.js';
	import { renderMermaid } from '#lib/diagrams/mermaid.js';
	import '#lib/styles/prose.css';

	let { data } = $props();
	const Unit = $derived(data.component);

	let article: HTMLElement;
	$effect(() => {
		void data.component; // re-run after navigating to another unit
		renderMermaid(article);
	});
</script>

<svelte:head>
	<title>{data.unit.title} · {data.module.title} · POS Lernwerkstatt</title>
</svelte:head>

<nav class="crumbs" aria-label="Brotkrümel">
	<a href={resolve('/[module]', { module: data.module.slug })}>{data.module.title}</a>
</nav>

<header class="unit-head">
	<h1>{data.unit.title}</h1>
	<div class="meta">
		<span>{data.unit.minutes} min</span>
		{#if !data.unit.core}<Badge tone="primary">Vertiefung</Badge>{/if}
		{#if data.unit.status === 'draft'}<Badge tone="warn">Entwurf</Badge>{/if}
		{#if data.unit.cheatsheet}
			<a href={cheatSheetPage(data.unit.cheatsheet)} target="_blank" rel="noopener">
				Spickzettel S. {data.unit.cheatsheet}
			</a>
		{/if}
	</div>
</header>

<article class="prose" bind:this={article}>
	<Unit />
</article>

<footer class="unit-foot">
	<nav class="pager" aria-label="Einheiten">
		{#if data.prev}
			<a class="prev" href={resolve('/[module]/[unit]', { module: data.module.slug, unit: data.prev.slug })}>
				<span>Zurück</span>{data.prev.title}
			</a>
		{/if}
		{#if data.next}
			<a class="next" href={resolve('/[module]/[unit]', { module: data.module.slug, unit: data.next.slug })}>
				<span>Weiter</span>{data.next.title}
			</a>
		{/if}
	</nav>
	<a class="report" href={reportIssueUrl('Einheit', data.unit.title, page.url.href)} target="_blank" rel="noopener">
		Fehler melden
	</a>
</footer>

<style>
	.crumbs {
		font-size: 14px;
	}
	.crumbs a {
		color: var(--text-muted);
		text-decoration: none;
	}
	.crumbs a:hover {
		color: var(--primary);
	}
	.unit-head {
		margin: 4px 0 32px;
	}
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 12px;
		font-size: 14px;
		color: var(--text-muted);
	}
	.unit-foot {
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid var(--border);
	}
	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.pager a {
		display: flex;
		flex-direction: column;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--text);
		font-weight: 600;
		text-decoration: none;
	}
	.pager a:hover {
		border-color: var(--primary);
	}
	.pager span {
		font-size: 13px;
		font-weight: 400;
		color: var(--text-muted);
	}
	.next {
		grid-column: 2;
		text-align: right;
	}
	.report {
		display: inline-block;
		margin-top: 24px;
		font-size: 14px;
		color: var(--text-muted);
	}
	@media (max-width: 600px) {
		.pager {
			grid-template-columns: 1fr;
		}
		.next {
			grid-column: 1;
		}
	}
</style>
