<script lang="ts">
	import { resolve } from '$app/paths';
	import MindestBadge from '#lib/components/MindestBadge.svelte';
	import Button from '#lib/components/Button.svelte';
	import { progress } from '#lib/progress/store.svelte.js';

	let { data } = $props();

	const firstOpen = $derived(data.puzzles.find((p) => !progress.isSolved(p.id)) ?? data.puzzles[0]);
	const done = $derived(data.puzzles.filter((p) => progress.isSolved(p.id)).length);
	const href = (id: string) => resolve('/puzzles/[topic]/[id]', { topic: data.topic.slug, id });
</script>

<svelte:head>
	<title>Puzzles: {data.topic.title} · POS Lernwerkstatt</title>
</svelte:head>

<nav class="crumbs"><a href={resolve('/puzzles')}>Puzzles</a></nav>
<h1>{data.topic.title}</h1>
<p class="lead">{data.topic.description}</p>

{#if firstOpen}
	<div class="start">
		<span>{done} von {data.puzzles.length} gelöst</span>
		<Button href={href(firstOpen.id)}>{done === 0 ? 'Loslegen' : done === data.puzzles.length ? 'Von vorne' : 'Weitermachen'}</Button>
	</div>
{/if}

<ol class="list">
	{#each data.puzzles as p, i (p.id)}
		<li>
			<a href={href(p.id)}>
				<span class="nr">{i + 1}</span>
				<span class="title">{p.title}</span>
				{#if p.mindest}<MindestBadge />{/if}
				<span class="kind">{p.kind === 'lines' ? 'Zeilen' : 'Lücken'}</span>
				<span class="state" aria-label={progress.isSolved(p.id) ? 'gelöst' : 'offen'}>{progress.isSolved(p.id) ? '✓' : ''}</span>
			</a>
		</li>
	{/each}
</ol>

<style>
	.crumbs a {
		font-size: 14px;
		color: var(--text-muted);
		text-decoration: none;
	}
	h1 {
		margin: 4px 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.lead {
		margin: 0 0 20px;
		color: var(--text-muted);
	}
	.start {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 20px;
		padding: 12px 16px;
		border: 1px solid var(--primary);
		border-radius: var(--radius-lg);
		background: var(--primary-soft);
	}
	.list {
		display: grid;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.list a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		color: inherit;
		text-decoration: none;
	}
	.list a:hover {
		border-color: var(--primary);
	}
	.nr {
		width: 2ch;
		text-align: right;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
	.title {
		flex: 1;
		min-width: 0;
		font-weight: 600;
	}
	.kind {
		font-size: 12px;
		color: var(--text-muted);
	}
	.state {
		width: 1.5em;
		text-align: center;
		color: var(--success);
		font-weight: 700;
	}
</style>
