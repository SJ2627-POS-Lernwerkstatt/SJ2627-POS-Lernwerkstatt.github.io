<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { dndzone, setKeyboardDragTrigger } from 'svelte-dnd-action';
	import Tray from '#lib/components/puzzle/Tray.svelte';
	import { ghostGuard, puzzleMode } from '#lib/puzzle/mode.svelte.js';
	import { placeSelected, returnToTray, toggleSelection, validSelection, type Selection } from '#lib/puzzle/select.js';
	import type { Segment } from '#lib/puzzle/template.js';
	import {
		addToGap,
		initBoard,
		moveInGap,
		real,
		refillPool,
		setGap,
		tidyPool,
		toGaps,
		type Board,
		type Chip,
		type Gaps,
		type Tile
	} from '#lib/puzzle/state.js';

	interface Props {
		lines: Segment[][];
		pieces: Tile[];
		placed: Gaps;
		/** Locked after answering: nothing can be moved any more. */
		disabled?: boolean;
		/** Keep the pieces docked at the bottom of the screen (puzzle pages). */
		dock?: boolean;
		/** Pieces next to the code when the surrounding `puzzle` container is wide enough. */
		split?: boolean;
		onchange: (gaps: Gaps) => void;
	}
	let { lines, pieces, placed, disabled = false, dock = false, split = false, onchange }: Props = $props();

	const FLIP_MS = 120;
	const gapCount = untrack(() => 1 + Math.max(-1, ...lines.flat().map((s) => ('gap' in s ? s.gap : -1))));

	// Space picks a chip up for keyboard dragging; Enter is free to move it between pool and gap.
	setKeyboardDragTrigger('space');

	let board = $state<Board>(untrack(() => initBoard(pieces, gapCount, placed)));
	// The gap that receives a chip when the student taps or presses Enter on a pool chip.
	let selected = $state(0);

	function commit(next: Board) {
		if (disabled) return;
		board = next;
		onchange(toGaps(next));
	}

	const considerPool = (e: CustomEvent<{ items: Chip[] }>) => (board = { ...board, pool: refillPool(board.pool, e.detail.items) });
	const finalizePool = (e: CustomEvent<{ items: Chip[] }>) => commit({ ...board, pool: tidyPool(e.detail.items) });
	const considerGap = (g: number, e: CustomEvent<{ items: Chip[] }>) => (board = setGap(board, g, e.detail.items));
	const finalizeGap = (g: number, e: CustomEvent<{ items: Chip[] }>) => commit(setGap(board, g, real(e.detail.items)));

	onMount(() => puzzleMode.watch());

	// Tap mode: a tapped tray piece is selected, then a tap on a gap places it there.
	let selection = $state<Selection>(null);
	const tap = $derived(puzzleMode.tap);
	const picked = $derived(validSelection(board, selection));
	const pickedText = $derived(board.pool.find((c) => c.id === picked)?.text);

	function pick(chip: Chip) {
		if (tap) selection = toggleSelection(picked, chip.id);
		else commit(addToGap(board, chip.id, selected));
	}

	/** Puts the selected piece into gap `g`. */
	function fill(g: number) {
		selected = g;
		if (!tap || !picked) return;
		const step = placeSelected(board, picked, g);
		selection = step.selection;
		commit(step.board);
	}

	function giveBack(g: number, chip: Chip) {
		selected = g;
		const step = returnToTray(board, picked, g, chip.id);
		selection = step.selection;
		commit(step.board);
	}

	function onPoolKey(e: KeyboardEvent, chip: Chip) {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		pick(chip);
	}

	function onGapKey(e: KeyboardEvent, g: number) {
		// Only for the gap itself, not for a chip inside it.
		if (e.key !== 'Enter' || e.target !== e.currentTarget) return;
		e.preventDefault();
		fill(g);
	}

	function onPlacedKey(e: KeyboardEvent, g: number, chip: Chip) {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (tap && picked) fill(g);
			else giveBack(g, chip);
		} else if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
			e.preventDefault();
			commit(moveInGap(board, g, chip.id, e.key === 'ArrowRight' ? 1 : -1));
		}
	}

	const zone = (items: Chip[]) => ({
		items,
		flipDurationMs: FLIP_MS,
		type: 'chip',
		delayTouchStart: true,
		dragDisabled: disabled,
		dropTargetClasses: ['over'],
		dropTargetStyle: {}
	});
</script>

<p class="sr">
	Tippen: Tippe auf einen Baustein, um ihn auszuwählen, und dann auf die Lücke, in die er gehört. Tippe auf einen
	eingesetzten Baustein, um ihn zurückzulegen. Ohne Tippen-Modus setzt ein Tipp den Baustein in die gewählte Lücke. Du
	kannst die Bausteine auch in die Lücken ziehen. Mit der Tastatur: Baustein fokussieren und Enter wählt ihn aus, dann zur
	Lücke gehen und Enter setzt ihn ein; Enter auf einem eingesetzten Baustein legt ihn zurück, Leertaste hebt ihn auf, die Pfeiltasten bewegen ihn, Alt mit Pfeil links
	oder rechts ändert die Reihenfolge in einer Lücke.
</p>

<div class="layout" class:disabled class:split use:ghostGuard>
	<div class="code" role="group" aria-label="Code mit Lücken">
		{#each lines as line}
			<div class="line">
				{#each line as seg}
					{#if 'text' in seg}
						<span class="fixed">{seg.text}</span>
					{:else}
						{@const g = seg.gap}
						<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
						<span
							class="gap"
							class:selected={!tap && selected === g}
							class:target={tap && picked !== null}
							class:empty={board.gaps[g]?.length === 0}
							role="group"
							aria-label={tap && picked ? `Lücke ${g + 1}, ${pickedText} hier einsetzen` : `Lücke ${g + 1}`}
							data-testid="gap-{g}"
							use:dndzone={zone(board.gaps[g] ?? [])}
							onconsider={(e) => considerGap(g, e)}
							onfinalize={(e) => finalizeGap(g, e)}
							onclick={(e) => fill(g)}
							onkeydown={(e) => onGapKey(e, g)}
							onfocusin={() => (selected = g)}
						>
							{#each board.gaps[g] ?? [] as chip (chip.id)}
								<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
								<span
									class="chip placed"
									aria-label="{chip.text}, antippen zum Zurücklegen"
									onclick={(e) => {
										e.stopPropagation();
										// With a piece selected a tap anywhere in the gap places it; otherwise it takes the chip back.
										if (tap && picked) fill(g);
										else giveBack(g, chip);
									}}
									onkeydown={(e) => onPlacedKey(e, g, chip)}>{chip.text}</span
								>
							{/each}
						</span>
					{/if}
				{/each}
				{#if line.length === 0}<span class="fixed">&nbsp;</span>{/if}
			</div>
		{/each}
	</div>

	<Tray title="Bausteine" note="∞ mehrfach verwendbar" {dock} {split} selectedText={picked ? pickedText : undefined} oncancel={() => (selection = null)}>
			<div
				class="pool"
				aria-label="Bausteine"
				data-testid="pool"
				use:dndzone={zone(board.pool)}
				onconsider={considerPool}
				onfinalize={finalizePool}
			>
				{#each board.pool as chip (chip.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<span
						class="chip"
						class:picked={picked === chip.id}
						aria-label={(chip.reusable ? `${chip.text}, mehrfach verwendbar` : chip.text) +
							(tap ? (picked === chip.id ? ', ausgewählt' : ', antippen zum Auswählen') : '')}
						aria-current={picked === chip.id ? 'true' : undefined}
						onclick={(e) => pick(chip)}
						onkeydown={(e) => onPoolKey(e, chip)}
					>
						{chip.text}{#if chip.reusable}<span class="inf" aria-hidden="true">∞</span>{/if}
					</span>
				{/each}
			</div>
		</Tray>
</div>

<style>
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
	.layout.disabled .chip {
		cursor: default;
	}
	.layout {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.code {
		min-width: 0;
		padding: 20px;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: var(--surface);
		font: 14px/2.4 var(--font-mono);
		overflow-wrap: anywhere;
	}
	.line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		min-height: 2.4em;
	}
	.fixed {
		white-space: pre-wrap;
	}
	.gap {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		min-width: 64px;
		min-height: 36px;
		margin: 0 4px;
		padding: 2px 6px;
		border: 1px dashed var(--border-strong);
		border-radius: 8px;
		background: var(--bg);
		line-height: 1.2;
	}
	.gap.selected {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.gap :global(.over),
	.gap:global(.over),
	.pool:global(.over) {
		outline: 2px dashed var(--primary);
		outline-offset: 2px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 36px;
		padding: 0 12px;
		border: 1px solid var(--border-strong);
		border-radius: 8px;
		background: var(--surface);
		font: 13px var(--font-mono);
		line-height: 1.2;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}
	.chip:focus-visible {
		outline: 2px solid var(--primary);
	}
	.chip.placed {
		border-color: var(--primary);
	}
	.inf {
		color: var(--primary);
		font-weight: 700;
	}
	.pool {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		min-height: 52px;
		padding: 2px;
		border-radius: 10px;
	}
	.gap.target {
		border-color: var(--primary);
		border-style: solid;
		background: var(--primary-soft);
		cursor: pointer;
	}
	.chip.picked {
		border-color: var(--primary);
		background: var(--primary-soft);
		box-shadow: 0 0 0 2px var(--primary);
	}
	/* split (long puzzles, enough room): code | pieces. The tray sticks by itself. */
	@container puzzle (min-width: 1150px) {
		.layout.split {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(240px, 300px);
			align-items: start;
		}
	}
	@media (max-width: 700px) {
		.code {
			padding: 12px;
			font-size: 13px;
		}
		.chip {
			min-height: 44px;
		}
		.gap {
			min-height: 44px;
		}
	}
</style>
