<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import { emptyAnswer, isAnswered } from '#lib/quiz/answer.js';
	import type { Answer, GroupView, QuestionView } from '#lib/quiz/types.js';
	import Question from './Question.svelte';

	/** Study mode: every question is checked right away; Vertiefungsfragen follow once the main question was checked. */
	let { group, number }: { group: GroupView; number: number } = $props();

	type Step = { question: QuestionView; answer: Answer; checked: boolean };
	const fresh = (): Step[] =>
		[group.main, ...group.followUps].map((question) => ({ question, answer: emptyAnswer(question), checked: false }));

	let steps = $state<Step[]>(fresh());
	// Bumped on "Nochmal" so puzzles start over with a new shuffle.
	let attempt = $state(0);

	// Show the main question, and each follow-up once the question before it was checked.
	const visible = $derived(steps.filter((_, i) => i === 0 || steps[i - 1]!.checked));
	const done = $derived(steps.every((s) => s.checked));

	function restart() {
		steps = fresh();
		attempt++;
	}
</script>

<section class="group" aria-label="Frage {number}">
	{#key attempt}
		{#each visible as step, i (i)}
			<div class="step" class:follow={i > 0}>
				<p class="label">{i === 0 ? `Frage ${number}` : `Vertiefung ${number}.${i}`}</p>
				<Question
					id="{group.id}-{i}-{attempt}"
					question={step.question}
					answer={step.answer}
					locked={step.checked}
					reveal={step.checked}
					onchange={(a) => (step.answer = a)}
				/>
				{#if !step.checked}
					<div class="actions">
						<Button disabled={!isAnswered(step.answer)} onclick={() => (step.checked = true)}>Antwort prüfen</Button>
					</div>
				{/if}
			</div>
		{/each}
	{/key}
	{#if done}
		<div class="actions"><Button variant="secondary" onclick={restart}>Nochmal</Button></div>
	{/if}
</section>

<style>
	.group {
		display: flex;
		flex-direction: column;
		gap: 20px;
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
	.actions {
		display: flex;
		gap: 8px;
	}
</style>
