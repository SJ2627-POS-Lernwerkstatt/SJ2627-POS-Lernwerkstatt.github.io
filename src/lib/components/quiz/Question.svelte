<script lang="ts">
	import { untrack } from 'svelte';
	import { isCorrect, reviewLines, scorePercent, templateTiles } from '#lib/quiz/answer.js';
	import { shuffled } from '#lib/quiz/shuffle.js';
	import type { Answer, QuestionView } from '#lib/quiz/types.js';
	import TemplatePuzzle from './TemplatePuzzle.svelte';
	import TemplateReview from './TemplateReview.svelte';

	interface Props {
		question: QuestionView;
		answer: Answer;
		/** No more changes (answer submitted or run finished). */
		locked?: boolean;
		/** Show right/wrong and the explanation. */
		reveal?: boolean;
		/** Unique per page, for radio group names and labels. */
		id: string;
		onchange?: (answer: Answer) => void;
	}
	let { question, answer, locked = false, reveal = false, id, onchange }: Props = $props();

	const correct = $derived(isCorrect(question, answer));
	// Pieces in random order, fixed for the lifetime of this component.
	const pieces = untrack(() => (question.kind === 'template' ? shuffled(templateTiles(question)) : []));

	function choose(i: number) {
		if (locked) return;
		if (answer.kind === 'single') onchange?.({ kind: 'single', choice: i });
		else if (answer.kind === 'multi') {
			const choices = answer.choices.includes(i) ? answer.choices.filter((c) => c !== i) : [...answer.choices, i];
			onchange?.({ kind: 'multi', choices: choices.sort((a, b) => a - b) });
		}
	}

	const selected = (i: number) =>
		answer.kind === 'single' ? answer.choice === i : answer.kind === 'multi' && answer.choices.includes(i);
	const isRight = (i: number) =>
		question.kind === 'single' ? question.answer === i : question.kind === 'multi' && question.answer.includes(i);
</script>

<div class="question" class:reveal>
	<div class="prompt">{@html question.promptHtml}</div>
	{#if question.codeHtml}
		<div class="code">{@html question.codeHtml}</div>
	{/if}

	{#if question.kind === 'single' || question.kind === 'multi'}
		{#if question.kind === 'multi'}<p class="hint">Mehrere Antworten können richtig sein.</p>{/if}
		<div class="options" role={question.kind === 'single' ? 'radiogroup' : 'group'} aria-label="Antworten">
			{#each question.optionsHtml as option, i (i)}
				<label
					class="option"
					class:selected={selected(i)}
					class:right={reveal && isRight(i)}
					class:wrong={reveal && selected(i) && !isRight(i)}
				>
					<input
						type={question.kind === 'single' ? 'radio' : 'checkbox'}
						name="{id}-options"
						checked={selected(i)}
						disabled={locked}
						onchange={() => choose(i)}
					/>
					<span class="text">{@html option}</span>
					{#if reveal && isRight(i)}<span class="mark" aria-label="richtige Antwort">✓</span>{/if}
					{#if reveal && selected(i) && !isRight(i)}<span class="mark" aria-label="falsch gewählt">✕</span>{/if}
				</label>
			{/each}
		</div>
	{:else if answer.kind === 'template'}
		{#if reveal}
			<TemplateReview
				lines={reviewLines(question, answer.gaps)}
				redHerrings={question.tiles.filter((t) => t.herring).map((t) => t.text)}
			/>
		{:else}
			<TemplatePuzzle
				lines={question.lines}
				{pieces}
				placed={answer.gaps}
				disabled={locked}
				onchange={(gaps) => onchange?.({ kind: 'template', gaps })}
			/>
		{/if}
	{/if}

	{#if reveal}
		<div class="result" class:ok={correct} role="status">
			<p class="verdict">
				{#if correct}Richtig!{:else if question.kind === 'template'}Leider nicht ganz – {scorePercent(question, answer)} % richtig.{:else}Leider falsch.{/if}
			</p>
			<div class="explanation">{@html question.explanationHtml}</div>
		</div>
	{/if}
</div>

<style>
	.question {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.prompt {
		font-weight: 600;
	}
	.prompt :global(p),
	.explanation :global(p),
	.text :global(p) {
		margin: 0 0 8px;
	}
	.prompt :global(p:last-child),
	.explanation :global(p:last-child),
	.text :global(p:last-child) {
		margin-bottom: 0;
	}
	.question :global(code) {
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--surface-alt);
		font-family: var(--font-mono);
		font-size: 0.88em;
	}
	.question :global(pre.shiki) {
		overflow-x: auto;
		margin: 0;
		padding: 14px 16px;
		border-radius: var(--radius);
		background: var(--code-bg) !important;
		font-size: 14px;
		line-height: 1.6;
	}
	.question :global(pre.shiki code) {
		padding: 0;
		background: none;
		font-size: inherit;
	}
	.hint {
		margin: 0;
		font-size: 14px;
		color: var(--text-muted);
	}
	.options {
		display: grid;
		gap: 8px;
	}
	.option {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px 14px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		cursor: pointer;
	}
	.option:has(input:disabled) {
		cursor: default;
	}
	.option:hover:not(:has(input:disabled)) {
		border-color: var(--border-strong);
	}
	.option.selected {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.option.right {
		border-color: var(--success);
		background: var(--success-soft);
	}
	.option.wrong {
		border-color: var(--danger);
		background: var(--danger-soft);
	}
	.option input {
		flex: none;
		width: 18px;
		height: 18px;
		margin: 3px 0 0;
		accent-color: var(--primary);
	}
	.text {
		flex: 1;
		min-width: 0;
	}
	.mark {
		font-weight: 700;
	}
	.right .mark {
		color: var(--success);
	}
	.wrong .mark {
		color: var(--danger);
	}
	.result {
		padding: 14px 16px;
		border-left: 4px solid var(--danger);
		border-radius: var(--radius);
		background: var(--danger-soft);
	}
	.result.ok {
		border-color: var(--success);
		background: var(--success-soft);
	}
	.verdict {
		margin: 0 0 6px;
		font-weight: 700;
	}
	.result:not(.ok) .verdict {
		color: var(--danger);
	}
	.result.ok .verdict {
		color: var(--success);
	}
</style>
