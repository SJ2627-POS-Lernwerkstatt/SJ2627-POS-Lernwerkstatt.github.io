<script lang="ts">
	import { resolve } from '$app/paths';
	import { MODULES } from '#lib/content/modules.js';
</script>

<svelte:head>
	<title>POS Lernwerkstatt</title>
</svelte:head>

<h1>POS Lernwerkstatt</h1>
<p class="lead">
	Kleine Lerneinheiten, Übungsfragen und Programmieraufgaben zur Vorbereitung auf die
	Reife- und Diplomprüfung in POS.
</p>

<ol class="modules">
	{#each MODULES as m (m.slug)}
		<li>
			<a href={resolve('/[module]', { module: m.slug })}>{m.title}</a>
			<span class="note">{m.note}</span>
		</li>
	{/each}
</ol>

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.lead {
		margin: 0 0 32px;
		color: var(--text-muted);
	}
	.modules {
		display: grid;
		gap: 8px;
		margin: 0 0 24px;
		padding: 0;
		list-style: none;
		counter-reset: module;
	}
	.modules li {
		display: flex;
		align-items: baseline;
		gap: 12px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		counter-increment: module;
	}
	.modules li::before {
		content: counter(module);
		font: 600 14px var(--font-mono);
		color: var(--text-muted);
	}
	.modules a {
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
	}
	.modules a:hover {
		color: var(--primary);
	}
	.note {
		margin-left: auto;
		font-size: 14px;
		color: var(--text-muted);
	}
</style>
