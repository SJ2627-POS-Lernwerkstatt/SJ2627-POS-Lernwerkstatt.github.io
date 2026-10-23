<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/Button.svelte';
	import { progress } from '#lib/progress/store.svelte.js';
	import { currentRunSchema } from '#lib/quiz/run.js';
	import { ALL, scopeTitle } from '#lib/quiz/scopes.js';

	let { data } = $props();

	const allIds = $derived(data.modules.flatMap((m) => m.groupIds));
	const running = $derived(currentRunSchema.safeParse(progress.data.currentRun).data);
	const recent = $derived(progress.data.runs.slice(-5).reverse());

	function stats(ids: string[]) {
		let fresh = 0;
		let repeat = 0;
		let known = 0;
		for (const id of ids) {
			const box = progress.data.groups[id]?.box ?? 0;
			if (box === 0) fresh++;
			else if (box === 1) repeat++;
			else known++;
		}
		return { fresh, repeat, known };
	}

	const date = (iso: string) =>
		new Date(iso).toLocaleDateString('de-AT', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
</script>

<svelte:head>
	<title>Üben · POS Lernwerkstatt</title>
</svelte:head>

<h1>Üben</h1>
<div class="rules">
	<p>Eine Runde hat bis zu <strong>10 Fragengruppen</strong>. Jede Gruppe besteht aus einer Hauptfrage und bis zu zwei Vertiefungsfragen zum selben Thema.</p>
	<ul>
		<li>Vertiefungsfragen zählen nur, wenn die Hauptfrage richtig ist.</li>
		<li>Die Auswertung gibt es erst am Ende der Runde. 100 % hast du nur, wenn alles stimmt.</li>
		<li>Gruppen, bei denen etwas falsch war, kommen in der nächsten Runde zuerst wieder.</li>
	</ul>
</div>

{#if running}
	<div class="resume">
		<p>Du hast eine Runde in <strong>{scopeTitle(running.scope)}</strong> begonnen.</p>
		<Button href={resolve('/ueben/[scope]', { scope: running.scope })}>Runde fortsetzen</Button>
	</div>
{/if}

<h2>Bereich wählen</h2>
<ul class="scopes">
	{#each [{ slug: ALL, title: 'Alle Module', note: 'gemischt', groupIds: allIds }, ...data.modules] as m (m.slug)}
		{@const s = stats(m.groupIds)}
		<li>
			<div class="info">
				<span class="title">{m.title}</span>
				{#if m.groupIds.length}
					<span class="meta">
						{m.groupIds.length} Fragengruppen · {s.fresh} neu · {s.repeat} wiederholen · {s.known} gekonnt
					</span>
				{:else}
					<span class="meta">Noch keine Fragen</span>
				{/if}
			</div>
			{#if m.groupIds.length}
				<Button variant="secondary" href={resolve('/ueben/[scope]', { scope: m.slug })}>Üben</Button>
			{/if}
		</li>
	{/each}
</ul>

{#if recent.length}
	<h2>Letzte Runden</h2>
	<ul class="runs">
		{#each recent as r (r.at)}
			<li>
				<span>{date(r.at)} · {scopeTitle(r.scope)}</span>
				<span class="score">{r.correct} / {r.total}</span>
			</li>
		{/each}
	</ul>
{/if}

<style>
	h1 {
		margin: 0 0 16px;
		font-size: 32px;
		line-height: 1.2;
	}
	h2 {
		margin: 32px 0 12px;
		font-size: 20px;
	}
	.rules p {
		margin: 0 0 8px;
	}
	.rules ul {
		margin: 0;
		padding-left: 20px;
		color: var(--text-muted);
	}
	.resume {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 24px;
		padding: 14px 16px;
		border: 1px solid var(--primary);
		border-radius: var(--radius-lg);
		background: var(--primary-soft);
	}
	.resume p {
		margin: 0;
	}
	.scopes,
	.runs {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.scopes li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	.info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	.title {
		font-weight: 600;
	}
	.meta {
		font-size: 14px;
		color: var(--text-muted);
	}
	.runs li {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 0;
		border-bottom: 1px solid var(--border);
		font-size: 15px;
	}
	.score {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
</style>
