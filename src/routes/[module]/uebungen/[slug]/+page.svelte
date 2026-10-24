<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import { reportIssueUrl } from '#lib/content/links.js';
	import { renderMermaid } from '#lib/diagrams/mermaid.js';
	import { progress } from '#lib/progress/store.svelte.js';
	import '#lib/styles/prose.css';

	let { data } = $props();
	const Task = $derived(data.component);
	const x = $derived(data.exercise);
	const saved = $derived(progress.data.exercises[x.id]);

	const SIZES = { small: 'kleine Probeprüfung', medium: 'mittlere Probeprüfung', full: 'volle Probeprüfung' };

	let article: HTMLElement;
	$effect(() => {
		void data.component; // re-run after navigating to another exercise
		renderMermaid(article);
	});

	const date = (iso: string) => new Date(iso).toLocaleDateString('de-AT', { day: 'numeric', month: 'long' });
</script>

<svelte:head>
	<title>{x.title} · {data.module.title} · POS Lernwerkstatt</title>
</svelte:head>

<nav class="crumbs" aria-label="Brotkrümel">
	<a href={resolve('/[module]', { module: data.module.slug })}>{data.module.title}</a>
</nav>

<header class="head">
	<p class="kicker">{x.size ? SIZES[x.size] : 'Programmieraufgabe'}</p>
	<h1>{x.title}</h1>
	<div class="meta">
		<span>ca. {x.minutes} min</span>
		<Badge tone="primary">{x.grading === 'auto' ? 'automatisch bewertet' : 'Feedback der Lehrkraft'}</Badge>
		{#if x.status === 'draft'}<Badge tone="warn">Entwurf</Badge>{/if}
	</div>
</header>

<section class="accept" aria-label="Abgabe">
	{#if x.classroomUrl}
		<p>Nimm die Aufgabe in Classroom50 an. Du bekommst ein eigenes Repository mit dem Projekt.</p>
		<Button href={x.classroomUrl}>Aufgabe in Classroom50 annehmen</Button>
	{:else}
		<p>Der Classroom50-Link für diese Aufgabe folgt bald.</p>
	{/if}
	<p class="how">
		{#if x.grading === 'auto'}
			Bei jeder Abgabe (Push) laufen Bewertungstests. Das Ergebnis siehst du als Release in deinem
			Repository: welche Tests bestanden sind und wie viele Punkte du hast.
		{:else}
			Deine Lehrkraft gibt dir Feedback direkt im Repository. Ob deine eigenen Tests grün sind,
			zeigt dir jede Abgabe.
		{/if}
	</p>
</section>

<article class="prose" bind:this={article}>
	<Task />
</article>

<section class="rubric" aria-labelledby="rubric-title">
	<h2 id="rubric-title">Beurteilung</h2>
	<div class="expected">
		<h3>Erwartete Ergebnisse</h3>
		<div class="text">{@html data.expectedHtml}</div>
	</div>
	<fieldset>
		<legend>Wo stehst du? Schätze dich nach der Abgabe selbst ein.</legend>
		<div class="tiers">
			{#each data.tiers as t (t.grade)}
				<label class="tier" class:chosen={saved?.selfRating === t.grade}>
					<span class="tier-head">
						<input
							type="radio"
							name="self-rating"
							value={t.grade}
							checked={saved?.selfRating === t.grade}
							aria-labelledby="tier-{t.grade}"
							aria-describedby="tier-{t.grade}-text"
							onchange={() => progress.updateExercise(x.id, { selfRating: t.grade })}
						/>
						<span id="tier-{t.grade}">{t.label}</span>
					</span>
					<span class="text" id="tier-{t.grade}-text">{@html t.html}</span>
				</label>
			{/each}
		</div>
	</fieldset>
	{#if saved?.selfRating}
		<Button variant="ghost" onclick={() => progress.updateExercise(x.id, { selfRating: null })}>
			Einschätzung entfernen
		</Button>
	{/if}
</section>

<footer class="foot">
	<label class="submitted">
		<input
			type="checkbox"
			checked={Boolean(saved?.submittedAt)}
			onchange={(e) => progress.updateExercise(x.id, { submitted: e.currentTarget.checked })}
		/>
		Ich habe diese Aufgabe abgegeben
		{#if saved?.submittedAt}<span class="when">am {date(saved.submittedAt)}</span>{/if}
	</label>
	<a class="report" href={reportIssueUrl('Aufgabe', x.title, page.url.href)} target="_blank" rel="noopener">
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
	.head {
		margin: 4px 0 24px;
	}
	.kicker {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--text-muted);
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
	.accept {
		display: grid;
		justify-items: start;
		gap: 10px;
		margin-bottom: 32px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	.accept p {
		margin: 0;
	}
	.how {
		font-size: 14px;
		color: var(--text-muted);
	}
	.rubric {
		margin-top: 48px;
	}
	h2 {
		margin: 0 0 16px;
		font-size: 24px;
	}
	h3 {
		margin: 0 0 4px;
		font-size: 16px;
	}
	.expected {
		margin-bottom: 20px;
	}
	.text :global(p) {
		margin: 0 0 8px;
	}
	.text :global(ul) {
		margin: 0 0 8px;
		padding-left: 20px;
	}
	fieldset {
		margin: 0 0 8px;
		padding: 0;
		border: 0;
	}
	legend {
		margin-bottom: 8px;
		font-weight: 600;
	}
	.tiers {
		display: grid;
		gap: 8px;
	}
	.tier {
		display: grid;
		gap: 4px;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		cursor: pointer;
	}
	.tier:hover {
		border-color: var(--border-strong);
	}
	.tier.chosen {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.tier-head {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
	}
	.tier .text {
		font-size: 15px;
		color: var(--text-muted);
	}
	.tier.chosen .text {
		color: var(--text);
	}
	input {
		accent-color: var(--primary);
	}
	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 40px;
		padding-top: 24px;
		border-top: 1px solid var(--border);
	}
	.submitted {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		cursor: pointer;
	}
	.submitted input {
		width: 18px;
		height: 18px;
	}
	.when {
		font-weight: 400;
		color: var(--text-muted);
	}
	.report {
		font-size: 14px;
		color: var(--text-muted);
	}
</style>
