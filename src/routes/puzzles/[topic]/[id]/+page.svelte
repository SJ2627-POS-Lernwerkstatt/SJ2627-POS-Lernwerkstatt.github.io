<script lang="ts">
	import { resolve } from '$app/paths';
	import PuzzleRunner from '#lib/components/puzzle/PuzzleRunner.svelte';
	import { progress } from '#lib/progress/store.svelte.js';

	let { data } = $props();

	const topicHref = $derived(resolve('/puzzles/[topic]', { topic: data.topic.slug }));
	const href = (id: string) => resolve('/puzzles/[topic]/[id]', { topic: data.topic.slug, id });
</script>

<svelte:head>
	<title>{data.puzzle.title} · Puzzles · POS Lernwerkstatt</title>
</svelte:head>

<nav class="crumbs">
	<a href={resolve('/puzzles')}>Puzzles</a> › <a href={topicHref}>{data.topic.title}</a>
</nav>
<h1>
	{data.puzzle.title}
	{#if progress.isSolved(data.puzzle.id)}<span class="solved" title="gelöst">✓</span>{/if}
</h1>
<p class="muted">Puzzle {data.position} von {data.count} · {data.puzzle.kind === 'lines' ? 'Zeilen ordnen' : 'Lücken füllen'}</p>

{#key data.puzzle.id}
	<PuzzleRunner
		puzzle={data.puzzle}
		nextHref={data.next ? href(data.next.id) : topicHref}
		nextLabel={data.next ? 'Nächstes Puzzle' : 'Zur Übersicht'}
		oncheck={(correct) => progress.recordPuzzle(data.puzzle.id, correct)}
	/>
{/key}

<nav class="pager">
	{#if data.prev}<a href={href(data.prev.id)}>← {data.prev.title}</a>{:else}<span></span>{/if}
	{#if data.next}<a href={href(data.next.id)}>{data.next.title} →</a>{/if}
</nav>

<style>
	.crumbs {
		font-size: 14px;
		color: var(--text-muted);
	}
	.crumbs a {
		color: var(--text-muted);
		text-decoration: none;
	}
	h1 {
		margin: 4px 0 4px;
		font-size: 28px;
		line-height: 1.2;
	}
	.solved {
		color: var(--success);
	}
	.muted {
		margin: 0 0 20px;
		color: var(--text-muted);
		font-size: 14px;
	}
	.pager {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		margin-top: 32px;
		padding-top: 16px;
		border-top: 1px solid var(--border);
		font-size: 14px;
	}
</style>
