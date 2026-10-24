<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/Button.svelte';
	import { progress } from '#lib/progress/store.svelte.js';
	import { moduleSummary, nextUnit } from '#lib/progress/summary.js';

	let { data } = $props();

	const next = $derived(nextUnit(data.modules, progress.data));
	const started = $derived(Object.keys(progress.data.units).length > 0);
</script>

<svelte:head>
	<title>POS Lernwerkstatt</title>
</svelte:head>

<h1>POS Lernwerkstatt</h1>
<p class="lead">
	Kleine Lerneinheiten, Übungsfragen und Programmieraufgaben zur Vorbereitung auf die
	Reife- und Diplomprüfung in POS.
</p>

<!-- Progress is only known in the browser; until then the entry points stay neutral. -->
<div class="start">
	{#if progress.loaded && next}
		<div class="next">
			<span class="label">{started ? 'Weiter lernen' : 'Hier beginnen'}</span>
			<a href={resolve('/[module]/[unit]', { module: next.module.slug, unit: next.unit.slug })}>
				{next.unit.title}
			</a>
			<span class="meta">{next.module.title}</span>
		</div>
	{:else if progress.loaded && started}
		<div class="next">
			<span class="label">Alles gelesen</span>
			<span>Du hast alle Einheiten gelesen. Wiederhole mit dem Üben-Modus.</span>
		</div>
	{/if}
	<Button variant={progress.loaded && next ? 'secondary' : 'primary'} href={resolve('/ueben')}>Üben</Button>
</div>

<h2>Module</h2>
<ol class="modules">
	{#each data.modules as m (m.slug)}
		{@const s = moduleSummary(m.units, m.groupIds, progress.data)}
		<li>
			<div class="head">
				<a href={resolve('/[module]', { module: m.slug })}>{m.title}</a>
				<span class="note">{m.note}</span>
			</div>
			{#if s.units === 0}
				<p class="meta">Die Einheiten erscheinen bald.</p>
			{:else}
				<div
					class="bar"
					role="progressbar"
					aria-label="Gelesene Einheiten in {m.title}"
					aria-valuemin={0}
					aria-valuemax={s.units}
					aria-valuenow={s.unitsRead}
				>
					<span style:width="{(100 * s.unitsRead) / s.units}%"></span>
				</div>
				<p class="meta">
					{s.unitsRead} / {s.units} Einheiten gelesen{s.groups ? ` · ${s.groupsKnown} / ${s.groups} Fragengruppen gekonnt` : ''}
				</p>
			{/if}
		</li>
	{/each}
</ol>

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	h2 {
		margin: 32px 0 12px;
		font-size: 20px;
	}
	.lead {
		margin: 0 0 24px;
		color: var(--text-muted);
	}
	.start {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 16px;
	}
	.next {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 240px;
		padding: 14px 16px;
		border: 1px solid var(--primary);
		border-radius: var(--radius-lg);
		background: var(--primary-soft);
	}
	.label {
		font-size: 13px;
		font-weight: 600;
		color: var(--primary-dark);
	}
	.next a {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
	}
	.next a:hover {
		color: var(--primary);
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
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		counter-increment: module;
	}
	.head {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}
	.head::before {
		content: counter(module);
		font: 600 14px var(--font-mono);
		color: var(--text-muted);
	}
	.head a {
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
	}
	.head a:hover {
		color: var(--primary);
	}
	.note {
		margin-left: auto;
		font-size: 14px;
		color: var(--text-muted);
	}
	.meta {
		margin: 0;
		font-size: 14px;
		color: var(--text-muted);
	}
	.bar {
		height: 6px;
		margin: 10px 0 6px;
		border-radius: 999px;
		background: var(--surface-alt);
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--success);
	}
</style>
