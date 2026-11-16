<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/Button.svelte';
	import { progress } from '#lib/progress/store.svelte.js';

	let { data } = $props();

	const solved = (ids: string[]) => ids.filter((id) => progress.isSolved(id)).length;
</script>

<svelte:head>
	<title>Puzzles · POS Lernwerkstatt</title>
</svelte:head>

<h1>Puzzles</h1>
<div class="rules">
	<p>
		Kleine Bauaufgaben, ganz ohne Projekt: Du setzt fertige Zeilen oder Bausteine zu richtigem Code zusammen. So übst du
		die Syntax, bis sie sitzt.
	</p>
	<ul>
		<li><strong>Zeilen</strong>: Bring die Zeilen in die richtige Reihenfolge. Nicht alle gehören dazu.</li>
		<li>
			Wie im Kurs: Getter, Setter und Konstruktoren erzeugt Lombok. Felder stehen in der Reihenfolge des Diagramms.
			Annotationen an derselben Stelle dürfen in beliebiger Reihenfolge stehen.
		</li>
		<li><strong>Lücken</strong>: Zieh die passenden Bausteine in die Lücken. Manche Lücken bleiben leer.</li>
		<li>Du kannst beliebig oft prüfen und weiterarbeiten. Gelöste Puzzles bekommen ein ✓.</li>
	</ul>
</div>

{#each data.modules as m (m.slug)}
	<h2>{m.title} <span class="note">{m.note}</span></h2>
	<ul class="topics">
		{#each m.topics as t (t.slug)}
			{@const done = solved(t.puzzleIds)}
			<li>
				<div class="info">
					<span class="title">{t.title}</span>
					<span class="meta">{t.description}</span>
					<span class="meta">
						{#if t.puzzleIds.length}
							{done} von {t.puzzleIds.length} gelöst
						{:else}
							folgt bald
						{/if}
					</span>
				</div>
				{#if t.puzzleIds.length}
					<Button variant={done === t.puzzleIds.length ? 'ghost' : 'secondary'} href={resolve('/puzzles/[topic]', { topic: t.slug })}>
						Öffnen
					</Button>
				{/if}
			</li>
		{/each}
	</ul>
{/each}

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
	.note {
		font-size: 14px;
		font-weight: 400;
		color: var(--text-muted);
	}
	.rules p {
		margin: 0 0 8px;
	}
	.rules ul {
		margin: 0;
		padding-left: 20px;
		color: var(--text-muted);
	}
	.topics {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.topics li {
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
</style>
