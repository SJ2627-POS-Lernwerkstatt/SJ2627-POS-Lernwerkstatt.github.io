<script lang="ts">
	import { untrack } from 'svelte';
	import { dndzone, setKeyboardDragTrigger } from 'svelte-dnd-action';
	import {
		addToGap,
		initBoard,
		moveInGap,
		real,
		refillPool,
		removeFromGap,
		setGap,
		tidyPool,
		toGaps,
		type Board,
		type Chip,
		type Gaps,
		type Tile
	} from '#lib/puzzle/state.js';

	interface Props {
		/** Lines in pool order (already shuffled). */
		pieces: Tile[];
		/** Indentation level per piece id; shown once a line is placed. */
		indents: Record<string, number>;
		placed: Gaps;
		/** After "Prüfen": right/wrong per placed line. Locks the board. */
		marks?: boolean[];
		/** Lines next to the answer when the surrounding `puzzle` container is wide enough. */
		split?: boolean;
		onchange: (gaps: Gaps) => void;
	}
	let { pieces, indents, placed, marks, split = false, onchange }: Props = $props();

	const FLIP_MS = 120;
	const disabled = $derived(marks !== undefined);

	setKeyboardDragTrigger('space');

	let board = $state<Board>(untrack(() => initBoard(pieces, 1, placed)));
	const answer = $derived(board.gaps[0] ?? []);

	function commit(next: Board) {
		if (disabled) return;
		board = next;
		onchange(toGaps(next));
	}

	const considerPool = (e: CustomEvent<{ items: Chip[] }>) => (board = { ...board, pool: refillPool(board.pool, e.detail.items) });
	const finalizePool = (e: CustomEvent<{ items: Chip[] }>) => commit({ ...board, pool: tidyPool(e.detail.items) });
	const considerAnswer = (e: CustomEvent<{ items: Chip[] }>) => (board = setGap(board, 0, e.detail.items));
	const finalizeAnswer = (e: CustomEvent<{ items: Chip[] }>) => commit(setGap(board, 0, real(e.detail.items)));

	function onPoolKey(e: KeyboardEvent, chip: Chip) {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		commit(addToGap(board, chip.id, 0));
	}

	function onPlacedKey(e: KeyboardEvent, chip: Chip) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commit(removeFromGap(board, 0, chip.id));
		} else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
			e.preventDefault();
			commit(moveInGap(board, 0, chip.id, e.key === 'ArrowDown' ? 1 : -1));
		}
	}

	const zone = (items: Chip[]) => ({
		items,
		flipDurationMs: FLIP_MS,
		type: 'line',
		delayTouchStart: true,
		dragDisabled: disabled,
		dropTargetClasses: ['over'],
		dropTargetStyle: {}
	});
</script>

<p class="sr">
	Tippe auf eine Zeile, um sie unten an deine Lösung anzuhängen. Tippe auf eine Zeile in deiner Lösung, um sie
	zurückzulegen. Oder ziehe die Zeilen an die richtige Stelle. Mit der Tastatur: Enter hängt eine Zeile an oder legt sie
	zurück, Leertaste hebt sie auf, Alt mit Pfeil nach oben oder unten verschiebt sie in deiner Lösung.
</p>

<div class="layout dock" class:disabled class:split>
	<section class="box" aria-labelledby="answer-title">
		<header>
			<h2 id="answer-title">Deine Lösung</h2>
			<span>{real(answer).length === 1 ? '1 Zeile' : `${real(answer).length} Zeilen`}</span>
		</header>
		<ol
			class="answer"
			aria-label="Deine Lösung"
			data-testid="answer"
			use:dndzone={zone(answer)}
			onconsider={considerAnswer}
			onfinalize={finalizeAnswer}
		>
			{#each answer as chip, i (chip.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
				<li
					class="line placed"
					class:ok={marks?.[i] === true}
					class:bad={marks?.[i] === false}
					style:--indent={indents[chip.pieceId] ?? 0}
					aria-label="{chip.text}{marks ? (marks[i] ? ', richtig' : ', falsch') : ', antippen zum Zurücklegen'}"
					onclick={() => commit(removeFromGap(board, 0, chip.id))}
					onkeydown={(e) => onPlacedKey(e, chip)}
				>
					<code>{chip.text}</code>
					{#if marks}<b aria-hidden="true">{marks[i] ? '✓' : '✕'}</b>{/if}
				</li>
			{/each}
		</ol>
		{#if answer.length === 0}
			<p class="empty">Noch leer – tippe unten auf die erste Zeile.</p>
		{/if}
	</section>

	{#if !disabled}
		<section class="box pool-box" aria-labelledby="pool-title">
			<header>
				<h2 id="pool-title">Zeilen</h2>
				<span>nicht alle gehören dazu</span>
			</header>
			<ul class="pool" aria-label="Zeilen" data-testid="pool" use:dndzone={zone(board.pool)} onconsider={considerPool} onfinalize={finalizePool}>
				{#each board.pool as chip (chip.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
					<li class="line" onclick={() => commit(addToGap(board, chip.id, 0))} onkeydown={(e) => onPoolKey(e, chip)}>
						<code>{chip.text}</code>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
	.layout {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.box {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 16px;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: var(--surface);
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 4px;
	}
	h2 {
		font-size: 15px;
		font-weight: 600;
	}
	header span,
	.empty {
		color: var(--text-muted);
		font-size: 12px;
	}
	.empty {
		margin: 0;
	}
	.answer,
	.pool {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-height: 48px;
		margin: 0;
		padding: 2px;
		list-style: none;
		border-radius: 10px;
	}
	.answer {
		min-height: 120px;
		padding: 8px;
		border: 1px dashed var(--border-strong);
		background: var(--bg);
	}
	.answer:global(.over),
	.pool:global(.over) {
		outline: 2px dashed var(--primary);
		outline-offset: 2px;
	}
	.line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		min-height: 36px;
		padding: 4px 12px;
		border: 1px solid var(--border-strong);
		border-radius: 8px;
		background: var(--surface);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}
	.line code {
		font: 13px/1.4 var(--font-mono);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.line.placed {
		/* Indentation is shown once a line is placed: 4 characters per level. */
		margin-left: calc(var(--indent) * 4ch);
		border-color: var(--primary);
	}
	.line:focus-visible {
		outline: 2px solid var(--primary);
	}
	.disabled .line {
		cursor: default;
	}
	.line.ok {
		border-color: var(--success);
		background: var(--success-soft);
	}
	.line.bad {
		border-color: var(--danger);
		background: var(--danger-soft);
	}
	.line b {
		font-size: 13px;
	}
	.line.ok b {
		color: var(--success);
	}
	.line.bad b {
		color: var(--danger);
	}
	/* dock: the pieces stay at the bottom of the screen while the code scrolls behind them. */
	.layout.dock .pool-box {
		position: sticky;
		bottom: 0;
		z-index: 5;
		max-height: 40dvh;
		overflow-y: auto;
		box-shadow: 0 -8px 20px rgb(0 0 0 / 0.12);
	}
	/* split (long puzzles, enough room): code | pieces, the pieces column stays in view. */
	@container puzzle (min-width: 1150px) {
		.layout.split {
			display: grid;
			/* Whole lines are long: pool as wide as the answer. */
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: start;
		}
		.layout.split .pool-box {
			position: sticky;
			top: 80px;
			bottom: auto;
			max-height: calc(100dvh - 96px);
			overflow-y: auto;
			box-shadow: none;
		}
	}
	@media (max-width: 700px) {
		.box {
			padding: 12px;
		}
		.line {
			min-height: 44px;
		}
		.line.placed {
			margin-left: calc(var(--indent) * 2ch);
		}
	}
</style>
