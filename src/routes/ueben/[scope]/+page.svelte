<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/Button.svelte';
	import Question from '#lib/components/quiz/Question.svelte';
	import { progress } from '#lib/progress/store.svelte.js';
	import { emptyAnswer, isAnswered } from '#lib/quiz/answer.js';
	import { currentRunSchema, resumeRun, scoreRun, startRun, type CurrentRun, type RunScore } from '#lib/quiz/run.js';
	import { scopeTitle } from '#lib/quiz/scopes.js';
	import type { Answer, GroupView } from '#lib/quiz/types.js';

	let { data } = $props();

	let run = $state<CurrentRun | null>(null);
	let result = $state<{ score: RunScore; run: CurrentRun } | null>(null);
	let ready = $state(false);

	// Pick up a run in progress once the stored progress is available.
	$effect(() => {
		if (progress.loaded && !ready) {
			run = resumeRun(progress.data.currentRun, data.scope, data.groups);
			prepare();
			ready = true;
		}
	});

	const byId = $derived(new Map(data.groups.map((g) => [g.id, g])));
	const otherRun = $derived.by(() => {
		const stored = currentRunSchema.safeParse(progress.data.currentRun).data;
		return stored && stored.scope !== data.scope ? stored : null;
	});
	const group = $derived(run ? byId.get(run.groupIds[run.index]!) : undefined);
	const unanswered = $derived.by(() => {
		if (!run) return 0;
		let n = 0;
		for (const id of run.groupIds) {
			const g = byId.get(id);
			if (!g) continue;
			const answers = run.answers[id];
			[g.main, ...g.followUps].forEach((_, i) => {
				if (!answers?.[i] || !isAnswered(answers[i])) n++;
			});
		}
		return n;
	});

	const questionsOf = (g: GroupView) => [g.main, ...g.followUps];

	function save() {
		progress.setCurrentRun(run ? ($state.snapshot(run) as CurrentRun) : undefined);
	}

	function start() {
		result = null;
		run = startRun(data.scope, data.groups, progress.data.groups, new Date());
		prepare();
		save();
		scrollTo({ top: 0 });
	}

	/** Creates empty answers for the group on screen, so stored runs never contain holes. */
	function prepare() {
		const g = run && byId.get(run.groupIds[run.index]!);
		if (run && g) run.answers[g.id] ??= questionsOf(g).map(emptyAnswer);
	}

	function setAnswer(g: GroupView, i: number, answer: Answer) {
		if (!run) return;
		run.answers[g.id]![i] = answer;
		save();
	}

	function go(delta: number) {
		if (!run) return;
		run.index = Math.max(0, Math.min(run.groupIds.length - 1, run.index + delta));
		prepare();
		save();
		scrollTo({ top: 0 });
	}

	function submit() {
		if (!run) return;
		const finished = $state.snapshot(run) as CurrentRun;
		const score = scoreRun(finished, data.groups);
		progress.finishRun(data.scope, score.results, score.correct, score.total);
		result = { score, run: finished };
		run = null;
		scrollTo({ top: 0 });
	}

	const percent = (s: RunScore) => (s.total ? Math.round((s.correct / s.total) * 100) : 0);
</script>

<svelte:head>
	<title>Üben: {data.title} · POS Lernwerkstatt</title>
</svelte:head>

<nav class="crumbs"><a href={resolve('/ueben')}>Üben</a></nav>
<h1>{data.title}</h1>

{#if !ready}
	<p class="muted">Lade …</p>
{:else if result}
	{@const s = result.score}
	<section class="score" class:perfect={s.correct === s.total}>
		<p class="big">{percent(s)} %</p>
		<p>{s.correct} von {s.total} Fragen richtig.</p>
		{#if s.correct === s.total}
			<p>Perfekt – alles richtig!</p>
		{:else}
			<p class="muted">Gruppen mit Fehlern kommen in der nächsten Runde zuerst wieder.</p>
		{/if}
		<div class="actions">
			<Button onclick={start}>Neue Runde</Button>
			<Button variant="secondary" href={resolve('/ueben')}>Zur Übersicht</Button>
		</div>
	</section>

	<h2>Auswertung</h2>
	{#each s.results as r, n (r.groupId)}
		{@const g = byId.get(r.groupId)!}
		<section class="group">
			{#each questionsOf(g) as q, i (i)}
				<div class="step" class:follow={i > 0}>
					<p class="label">
						{i === 0 ? `Frage ${n + 1}` : `Vertiefung ${n + 1}.${i}`}
						{#if i > 0 && !r.mainCorrect}<span class="void">· nicht gewertet, weil die Hauptfrage falsch war</span>{/if}
					</p>
					<Question
						id="review-{g.id}-{i}"
						question={q}
						answer={result.run.answers[g.id]?.[i] ?? emptyAnswer(q)}
						locked
						reveal
					/>
				</div>
			{/each}
		</section>
	{/each}
{:else if run && group}
	{@const total = run.groupIds.length}
	<div class="bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={run.index + 1}>
		<span style="width: {((run.index + 1) / total) * 100}%"></span>
	</div>
	<p class="muted">Fragengruppe {run.index + 1} von {total}</p>

	{#key group.id}
		<section class="group">
			{#each questionsOf(group) as q, i (i)}
				<div class="step" class:follow={i > 0}>
					<p class="label">
						{i === 0 ? 'Hauptfrage' : `Vertiefung ${i}`}
						{#if i > 0}<span class="void">· zählt nur, wenn die Hauptfrage stimmt</span>{/if}
					</p>
					<Question
						id="run-{group.id}-{i}"
						question={q}
						answer={run.answers[group.id]?.[i] ?? emptyAnswer(q)}
						onchange={(a) => setAnswer(group, i, a)}
					/>
				</div>
			{/each}
		</section>
	{/key}

	<div class="nav">
		<Button variant="secondary" disabled={run.index === 0} onclick={() => go(-1)}>Zurück</Button>
		{#if run.index < total - 1}
			<Button onclick={() => go(1)}>Weiter</Button>
		{:else}
			<Button onclick={submit}>Runde abgeben</Button>
		{/if}
	</div>
	{#if run.index === total - 1 && unanswered > 0}
		<p class="muted right">Noch {unanswered} unbeantwortete Fragen – sie zählen als falsch.</p>
	{/if}
{:else if data.groups.length === 0}
	<p class="muted">Für diesen Bereich gibt es noch keine Fragen.</p>
{:else}
	<section class="intro">
		<p>
			Bis zu 10 Fragengruppen aus <strong>{scopeTitle(data.scope)}</strong>. Vertiefungsfragen zählen nur,
			wenn die Hauptfrage stimmt. Die Auswertung bekommst du am Ende.
		</p>
		{#if otherRun}
			<p class="muted">
				Deine begonnene Runde in {scopeTitle(otherRun.scope)} wird verworfen, wenn du hier startest.
			</p>
		{/if}
		<Button onclick={start}>Runde starten</Button>
	</section>
{/if}

<style>
	.crumbs a {
		font-size: 14px;
		color: var(--text-muted);
		text-decoration: none;
	}
	h1 {
		margin: 4px 0 20px;
		font-size: 32px;
		line-height: 1.2;
	}
	h2 {
		margin: 32px 0 12px;
		font-size: 20px;
	}
	.muted {
		color: var(--text-muted);
	}
	.right {
		text-align: right;
	}
	.intro p {
		margin: 0 0 16px;
	}
	.bar {
		height: 6px;
		overflow: hidden;
		border-radius: 3px;
		background: var(--surface-alt);
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--primary);
	}
	.group {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-bottom: 16px;
		padding: 20px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
	}
	.step {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.step.follow {
		padding-top: 20px;
		border-top: 1px dashed var(--border-strong);
	}
	.label {
		margin: 0;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	.void {
		font-weight: 400;
		letter-spacing: 0;
		text-transform: none;
	}
	.nav {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}
	.score {
		padding: 20px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
	}
	.score.perfect {
		border-color: var(--success);
		background: var(--success-soft);
	}
	.score p {
		margin: 0 0 6px;
	}
	.big {
		font-size: 40px;
		font-weight: 800;
		line-height: 1.1;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}
</style>
