<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import Button from '#lib/components/Button.svelte';
	import LoginGate from '#lib/components/LoginGate.svelte';
	import Question from '#lib/components/quiz/Question.svelte';
	import {
		clearDraft,
		isDone,
		loadDraft,
		local,
		markDone,
		saveDraft,
		session as sessionStore,
		toPayload,
		type DiagnosticAnswer
	} from '#lib/diagnostic/state.ts';
	import type { Answer } from '#lib/quiz/types.js';
	import { ApiError } from '#lib/sync/client.ts';
	import { api } from '#lib/sync/session.svelte.ts';

	let { data } = $props();

	const ids = $derived(data.items.map((i) => i.id));
	type Phase = 'loading' | 'already' | 'intro' | 'questions' | 'sending' | 'thanks';
	let phase = $state<Phase>('loading');
	let answers = $state<Record<string, DiagnosticAnswer>>({});
	let index = $state(0);
	let error = $state('');

	onMount(() => {
		const draft = loadDraft(sessionStore(), ids);
		answers = draft.answers;
		index = draft.index;
		// A draft in progress wins over the "already done" note: the student chose to fill it out again.
		phase = draft.started ? 'questions' : isDone(local()) ? 'already' : 'intro';
	});

	const total = $derived(data.items.length);
	const item = $derived(data.items[index]);
	const answered = $derived(Object.keys(answers).length);
	const last = $derived(index === total - 1);

	const persist = () =>
		saveDraft(sessionStore(), { answers: $state.snapshot(answers), index, started: phase === 'questions' });

	function start() {
		phase = 'questions';
		index = 0;
		persist();
		scrollTo({ top: 0 });
	}

	const asAnswer = (id: string, kind: 'single' | 'multi'): Answer => {
		const a = answers[id];
		if (kind === 'single') return { kind: 'single', choice: typeof a === 'number' ? a : null };
		return { kind: 'multi', choices: Array.isArray(a) ? a : [] };
	};

	function setAnswer(id: string, a: Answer) {
		if (a.kind === 'single' && a.choice !== null) answers[id] = a.choice;
		else if (a.kind === 'multi' && a.choices.length > 0) answers[id] = a.choices;
		else delete answers[id];
		persist();
	}

	function go(delta: number) {
		index = Math.max(0, Math.min(total - 1, index + delta));
		persist();
		scrollTo({ top: 0 });
	}

	async function submit() {
		error = '';
		phase = 'sending';
		try {
			await api.submitDiagnostic(toPayload(ids, $state.snapshot(answers)));
		} catch (e) {
			phase = 'questions';
			error = e instanceof ApiError ? e.message : 'Das Abschicken hat nicht geklappt. Versuche es noch einmal.';
			return;
		}
		markDone(local());
		clearDraft(sessionStore());
		answers = {};
		index = 0;
		phase = 'thanks';
		scrollTo({ top: 0 });
	}

	function again() {
		answers = {};
		index = 0;
		phase = 'intro';
	}
</script>

<svelte:head>
	<title>Einstiegstest · POS Lernwerkstatt</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>Einstiegstest</h1>

<LoginGate>
	{#if phase === 'loading'}
		<p class="muted">Lade …</p>
	{:else if phase === 'already'}
		<section class="box">
			<p class="big">Schon abgegeben – danke!</p>
			<p class="muted">Wenn du magst, kannst du den Test noch einmal ausfüllen. Das ersetzt deine letzte Abgabe.</p>
			<div class="actions">
				<Button href={resolve('/woche')}>Zu dieser Woche</Button>
				<Button variant="secondary" onclick={again}>Nochmal ausfüllen</Button>
			</div>
		</section>
	{:else if phase === 'intro'}
		<section class="box">
			<p>
				10 Fragen, ca. 5 Minuten. Kein Test mit Note – es hilft nur deiner Lehrkraft, zu sehen, wo ihr anfangen sollt.
				„Ich weiß es nicht“ ist eine gute Antwort.
			</p>
			<div class="actions"><Button onclick={start}>Los geht’s</Button></div>
		</section>
	{:else if phase === 'thanks'}
		<section class="box" role="status">
			<p class="big">Danke!</p>
			<p>Deine Antworten sind bei deiner Lehrkraft angekommen.</p>
			<div class="actions"><Button href={resolve('/woche')}>Zu dieser Woche</Button></div>
		</section>
	{:else if item}
		<div class="bar" role="progressbar" aria-label="Fortschritt" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1}>
			<span style="width: {((index + 1) / total) * 100}%"></span>
		</div>
		<p class="muted">Frage {index + 1} von {total}</p>

		{#key item.id}
			<section class="box">
				<Question
					id="diag-{item.id}"
					question={item.question}
					answer={asAnswer(item.id, item.question.kind as 'single' | 'multi')}
					locked={phase === 'sending'}
					onchange={(a) => setAnswer(item.id, a)}
				/>
			</section>
		{/key}

		{#if error}<p class="error" role="alert">{error}</p>{/if}

		<div class="nav">
			<Button variant="secondary" disabled={index === 0 || phase === 'sending'} onclick={() => go(-1)}>Zurück</Button>
			{#if !last}
				<Button onclick={() => go(1)}>Weiter</Button>
			{:else}
				<Button loading={phase === 'sending'} onclick={submit}>Abschicken</Button>
			{/if}
		</div>
		{#if last}
			<p class="muted right">
				{answered === total ? 'Alle Fragen beantwortet.' : `${total - answered} Fragen ohne Antwort – das ist in Ordnung.`}
			</p>
		{/if}
	{/if}
</LoginGate>

<style>
	h1 {
		margin: 0 0 20px;
		font-size: 32px;
		line-height: 1.2;
	}
	.muted {
		margin: 8px 0;
		color: var(--text-muted);
	}
	.right {
		text-align: right;
	}
	.box {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 16px;
		padding: 20px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
	}
	.box p {
		margin: 0;
	}
	.big {
		font-size: 22px;
		font-weight: 700;
	}
	.actions,
	.nav {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
	.nav {
		justify-content: space-between;
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
	.error {
		margin: 0 0 12px;
		padding: 10px 14px;
		border-radius: var(--radius);
		background: var(--danger-soft);
		color: var(--danger);
	}
</style>
