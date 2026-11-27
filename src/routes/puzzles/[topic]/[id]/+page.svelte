<script lang="ts">
	import { resolve } from '$app/paths';
	import Bi from '#lib/components/Bi.svelte';
	import MindestBadge from '#lib/components/MindestBadge.svelte';
	import PuzzleRunner from '#lib/components/puzzle/PuzzleRunner.svelte';
	import { pick } from '#lib/lang.js';
	import { progress } from '#lib/progress/store.svelte.js';

	let { data } = $props();

	const topicHref = $derived(resolve('/puzzles/[topic]', { topic: data.topic.slug }));
	const href = (id: string) => resolve('/puzzles/[topic]/[id]', { topic: data.topic.slug, id });
</script>

<svelte:head>
	<title>{pick(progress.data.settings.lang, data.puzzle.title, data.puzzle.en?.title)} · Puzzles · POS Lernwerkstatt</title>
</svelte:head>

<nav class="crumbs">
	<a href={resolve('/puzzles')}>Puzzles</a> › <a href={topicHref}>{data.topic.title}</a>
</nav>
<h1>
	<Bi de={data.puzzle.title} en={data.puzzle.en?.title} />
	{#if progress.isSolved(data.puzzle.id)}<span class="solved" title="gelöst">✓</span>{/if}
</h1>
<p class="muted">
	Puzzle {data.position} von {data.count} · {data.puzzle.kind === 'lines' ? 'Zeilen ordnen' : 'Lücken füllen'}
	{#if data.mindest}<MindestBadge />{/if}
</p>

{#key data.puzzle.id}
	<PuzzleRunner
		puzzle={data.puzzle}
		nextHref={data.next ? href(data.next.id) : topicHref}
		nextLabel={data.next ? 'Nächstes Puzzle' : 'Zur Übersicht'}
		oncheck={(correct) => progress.recordPuzzle(data.puzzle.id, correct)}
	/>
{/key}

<nav class="pager">
	{#if data.prev}<a href={href(data.prev.id)}>← <Bi de={data.prev.title} en={data.prev.titleEn} /></a>{:else}<span></span>{/if}
	{#if data.next}<a href={href(data.next.id)}><Bi de={data.next.title} en={data.next.titleEn} /> →</a>{/if}
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
