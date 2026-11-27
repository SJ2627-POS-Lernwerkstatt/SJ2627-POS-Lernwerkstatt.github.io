<script lang="ts">
	import Bi from '#lib/components/Bi.svelte';
	import { onMount, untrack } from 'svelte';
	import Button from '#lib/components/Button.svelte';
	import TemplatePuzzle from '#lib/components/quiz/TemplatePuzzle.svelte';
	import TemplateReview from '#lib/components/quiz/TemplateReview.svelte';
	import { isPlacedAnything, lineMarks, puzzleCorrect, puzzlePercent, puzzleTiles } from '#lib/puzzle/answer.js';
	import type { Gaps } from '#lib/puzzle/state.js';
	import type { PuzzleView } from '#lib/puzzle/view.js';
	import { reviewLines } from '#lib/quiz/answer.js';
	import { shuffled } from '#lib/quiz/shuffle.js';
	import { ghostGuard, puzzleMode } from '#lib/puzzle/mode.svelte.js';
	import { progress } from '#lib/progress/store.svelte.js';
	import LinePuzzle from './LinePuzzle.svelte';

	interface Props {
		puzzle: PuzzleView;
		/** Where "Weiter" leads: the next puzzle or the topic page. */
		nextHref: string;
		nextLabel: string;
		/** Called on every "Prüfen". */
		oncheck: (correct: boolean) => void;
	}
	let { puzzle, nextHref, nextLabel, oncheck }: Props = $props();

	// Pool order is random but fixed while the puzzle is on screen (also across "Weiter bearbeiten").
	const pieces = untrack(() => shuffled(puzzleTiles(puzzle)));
	const indents = untrack(() =>
		puzzle.kind === 'lines' ? Object.fromEntries(puzzle.tiles.map((t, i) => [`t${i}`, t.indent])) : {}
	);

	onMount(() => puzzleMode.watch());

	let gaps = $state<Gaps>({});
	let checked = $state(false);
	let showSolution = $state(false);
	// Bumped to rebuild the board from `gaps` (after "Weiter bearbeiten" or "Zurücksetzen").
	let round = $state(0);

	const correct = $derived(checked && puzzleCorrect(puzzle, gaps));
	// Template text with translated comments: same gaps and pieces, so the answer and the score stay the same.
	const english = $derived(progress.data.settings.lang === 'en');
	const lines = $derived(puzzle.kind === 'template' ? (english && puzzle.en?.lines) || puzzle.lines : []);
	const solutionHtml = $derived((english && puzzle.en?.solutionHtml) || puzzle.solutionHtml);

	const split = $derived(puzzle.layout === 'split');
	// Same width as the container queries here and in the puzzle components.
	const SPLIT_FROM_PX = 1150;
	let width = $state(0);
	const sideBySide = $derived(split && width >= SPLIT_FROM_PX);

	// The task folds away after the first piece is placed (once), to make room for code and pieces.
	// Side by side it has its own column and always stays open.
	let briefOpen = $state(true);
	let folded = false;
	$effect(() => {
		if (sideBySide) briefOpen = true;
	});

	function change(next: Gaps) {
		gaps = next;
		if (!folded && !sideBySide && isPlacedAnything(next)) {
			folded = true;
			briefOpen = false;
		}
	}

	function check() {
		checked = true;
		oncheck(puzzleCorrect(puzzle, gaps));
	}

	function edit() {
		checked = false;
		round++;
	}

	function reset() {
		gaps = {};
		checked = false;
		showSolution = false;
		round++;
	}
</script>

<div class="frame" use:ghostGuard>
	<div class="runner" class:split bind:clientWidth={width}>
		<details class="brief" bind:open={briefOpen}>
			<summary>
				<span>Angabe</span>
				<span class="toggle">{briefOpen ? 'ausblenden' : 'einblenden'}</span>
			</summary>
			<div class="brief-body">
				<div class="prompt"><Bi de={puzzle.promptHtml} en={puzzle.en?.promptHtml} html block /></div>

				{#if puzzle.umlSrc}
					<figure class="uml">
						<img src={puzzle.umlSrc} alt="UML-Diagramm zur Aufgabe" />
					</figure>
				{/if}

				{#if puzzle.givenHtml}
					<div class="given">
						<p class="given-title">Gegeben</p>
						<div class="code"><Bi de={puzzle.givenHtml} en={puzzle.en?.givenHtml} html block /></div>
					</div>
				{/if}
			</div>
		</details>

		<div class="work">
			{#if puzzle.long && puzzleMode.narrow}
				<p class="laptop" role="note"><b>Laptop empfohlen.</b> Dieses Puzzle ist lang. Am Handy kannst du es trotzdem lösen.</p>
			{/if}
			{#key round}
				{#if puzzle.kind === 'lines'}
					<LinePuzzle
						{pieces}
						{indents}
						{split}
						placed={gaps}
						marks={checked ? lineMarks(puzzle, gaps) : undefined}
						onchange={change}
					/>
				{:else if checked}
					<TemplateReview
						lines={reviewLines({ ...puzzle, lines }, gaps)}
						redHerrings={puzzle.tiles.filter((t) => t.herring).map((t) => t.text)}
					/>
				{:else}
					<TemplatePuzzle {lines} {pieces} placed={gaps} dock {split} onchange={change} />
				{/if}
			{/key}

			{#if !checked}
				<div class="actions">
					<Button onclick={check} disabled={!isPlacedAnything(gaps)}>Prüfen</Button>
					<Button variant="ghost" onclick={reset} disabled={!isPlacedAnything(gaps)}>Zurücksetzen</Button>
				</div>
			{:else}
				<div class="result" class:ok={correct} role="status">
					{#if correct}
						<p class="verdict">Richtig!</p>
						<div class="explanation"><Bi de={puzzle.explanationHtml} en={puzzle.en?.explanationHtml} html block /></div>
					{:else}
						<p class="verdict">Noch nicht ganz – {puzzlePercent(puzzle, gaps)} % richtig.</p>
						<p class="hint">
							{puzzle.kind === 'lines'
								? 'Rot markierte Zeilen sind falsch oder an der falschen Stelle. Fehlende Zeilen sind nicht markiert.'
								: 'Unter jeder falschen Lücke steht, was hingehört.'}
						</p>
					{/if}
				</div>
				<div class="actions">
					{#if correct}
						<Button href={nextHref}>{nextLabel}</Button>
						<Button variant="ghost" onclick={reset}>Nochmal</Button>
					{:else}
						<Button onclick={edit}>Weiter bearbeiten</Button>
						<Button variant="secondary" onclick={() => (showSolution = !showSolution)}>
							{showSolution ? 'Lösung ausblenden' : 'Lösung zeigen'}
						</Button>
						<Button variant="ghost" onclick={reset}>Von vorne</Button>
					{/if}
				</div>
				{#if showSolution && !correct}
					<section class="solution">
						<h2>Lösung</h2>
						<div class="code">{@html solutionHtml}</div>
						<div class="explanation"><Bi de={puzzle.explanationHtml} en={puzzle.en?.explanationHtml} html block /></div>
					</section>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	/* The split layout depends on the room the page has (course panel open or not), not on the screen. */
	.frame {
		container: puzzle / inline-size;
	}
	.runner,
	.work,
	.brief-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.brief summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		font-weight: 600;
		cursor: pointer;
		list-style: none;
	}
	.brief summary::-webkit-details-marker {
		display: none;
	}
	.brief[open] summary {
		margin-bottom: 12px;
	}
	.toggle {
		font-size: 13px;
		font-weight: 400;
		color: var(--primary);
	}
	.prompt :global(p) {
		margin: 0 0 8px;
	}
	.prompt :global(p:last-child) {
		margin-bottom: 0;
	}
	.prompt :global(code),
	.explanation :global(:not(pre) > code) {
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--surface-alt);
		font-family: var(--font-mono);
		font-size: 0.9em;
	}
	.uml {
		margin: 0;
		padding: 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: #fff;
		text-align: center;
	}
	.uml img {
		max-width: 100%;
		height: auto;
	}
	.given-title {
		margin: 0 0 8px;
		font-weight: 600;
	}
	.code :global(pre) {
		margin: 0;
		padding: 14px 16px;
		overflow-x: auto;
		border-radius: var(--radius-lg);
		font-size: 13px;
	}
	.laptop {
		margin: 0;
		padding: 10px 12px;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
		background: var(--surface-alt);
		font-size: 14px;
	}
	.runner,
	.work {
		min-width: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.result {
		padding: 14px 16px;
		border: 1px solid var(--danger);
		border-radius: var(--radius-lg);
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
	.hint {
		margin: 0;
		font-size: 14px;
		color: var(--text-muted);
	}
	.explanation :global(p) {
		margin: 0 0 8px;
	}
	.explanation :global(p:last-child) {
		margin-bottom: 0;
	}
	.solution {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.solution h2 {
		margin: 0;
		font-size: 18px;
	}
	/* Side by side: task | (code | pieces). The task column scrolls on its own and stays in view. */
	@container puzzle (min-width: 1150px) {
		.runner.split {
			display: grid;
			grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
			align-items: start;
			gap: 24px;
		}
		.runner.split .brief {
			position: sticky;
			top: 80px;
			max-height: calc(100dvh - 96px);
			overflow-y: auto;
		}
		.runner.split .brief summary {
			display: none;
		}
		.runner.split .uml img {
			max-height: 40vh;
		}
	}
</style>
