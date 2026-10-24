<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '#lib/components/Badge.svelte';
	import { progress } from '#lib/progress/store.svelte.js';
	import { moduleSummary } from '#lib/progress/summary.js';

	let { data } = $props();

	const core = $derived(data.units.filter((u) => u.core));
	const extra = $derived(data.units.filter((u) => !u.core));
	const summary = $derived(moduleSummary(data.units, data.groupIds, progress.data));
</script>

<svelte:head>
	<title>{data.module.title} · POS Lernwerkstatt</title>
</svelte:head>

<p class="kicker">{data.module.note}</p>
<h1>{data.module.title}</h1>

{#snippet list(units: typeof data.units)}
	<ol class="units">
		{#each units as u (u.id)}
			<li class:read={progress.isRead(u.id)}>
				<span class="check" aria-label={progress.isRead(u.id) ? 'gelesen' : 'noch nicht gelesen'}></span>
				<a href={resolve('/[module]/[unit]', { module: data.module.slug, unit: u.slug })}>{u.title}</a>
				<span class="meta">
					{#if u.status === 'draft'}<Badge tone="warn">Entwurf</Badge>{/if}
					{u.minutes} min
				</span>
			</li>
		{/each}
	</ol>
{/snippet}

{#if data.units.length === 0}
	<p class="empty">Die Einheiten zu diesem Modul erscheinen bald.</p>
{:else}
	{#if progress.loaded}
		<p class="summary">
			{summary.unitsRead} / {summary.units} Einheiten gelesen{summary.groups ? ` · ${summary.groupsKnown} / ${summary.groups} Fragengruppen gekonnt` : ''}
		</p>
	{/if}
	<h2>Einheiten</h2>
	{@render list(core)}
	{#if extra.length}
		<h2>Vertiefung</h2>
		<p class="hint">Optional – für alle, die mehr wissen wollen.</p>
		{@render list(extra)}
	{/if}
{/if}

<style>
	.kicker {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--text-muted);
	}
	h1 {
		margin: 0 0 24px;
		font-size: 32px;
		line-height: 1.2;
	}
	h2 {
		margin: 32px 0 12px;
		font-size: 20px;
	}
	.summary {
		margin: -16px 0 0;
		color: var(--text-muted);
	}
	.hint,
	.empty {
		color: var(--text-muted);
	}
	.units {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.units li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	.check {
		flex: none;
		width: 18px;
		height: 18px;
		border: 2px solid var(--border-strong);
		border-radius: 50%;
	}
	.read .check {
		border-color: var(--success);
		background: var(--success);
		box-shadow: inset 0 0 0 3px var(--surface);
	}
	.units a {
		font-weight: 600;
		text-decoration: none;
		color: var(--text);
	}
	.units a:hover {
		color: var(--primary);
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
		font-size: 14px;
		color: var(--text-muted);
	}
</style>
