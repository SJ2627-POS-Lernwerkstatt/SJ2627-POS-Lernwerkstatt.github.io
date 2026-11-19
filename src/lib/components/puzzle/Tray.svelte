<script lang="ts">
	import type { Snippet } from 'svelte';
	import { puzzleMode } from '#lib/puzzle/mode.svelte.js';

	interface Props {
		title: string;
		note: string;
		/** Docked at the bottom of the screen (below the code), or the sticky column when `split`. */
		dock?: boolean;
		split?: boolean;
		/** Text of the selected piece; on a narrow screen the tray then shrinks to one bar so the code is free. */
		selectedText?: string;
		oncancel?: (e: MouseEvent) => void;
		/** Tap mode switch is shown here. */
		children: Snippet;
	}
	let { title, note, dock = true, split = false, selectedText, oncancel, children }: Props = $props();

	let open = $state(true);
	const bar = $derived(puzzleMode.narrow && selectedText !== undefined);
</script>

<section class="tray" class:dock class:split aria-labelledby="tray-title">
	<header>
		<h2 id="tray-title">{title}</h2>
		<span class="note">{note}</span>
		{#if !bar}
			<button type="button" class="fold" aria-expanded={open} onclick={() => (open = !open)}>
				{open ? 'Einklappen' : 'Ausklappen'}
			</button>
		{/if}
	</header>
	{#if bar}
		<div class="picked" role="status">
			<span>Ausgewählt: <code>{selectedText}</code> – tippe in den Code, wohin es gehört.</span>
			<button type="button" onclick={(e) => oncancel?.(e)}>Abbrechen</button>
		</div>
	{/if}
	<!-- Always rendered (only hidden), so the pieces keep their drag handlers while the bar shows. -->
	<div class="body" class:off={bar || !open}>
		<label class="mode">
			<input type="checkbox" checked={puzzleMode.tap} onchange={(e) => (puzzleMode.override = e.currentTarget.checked)} />
			Tippen: erst Baustein wählen, dann Ziel antippen
		</label>
		{@render children()}
	</div>
</section>

<style>
	.tray {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
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
		gap: 4px 8px;
	}
	h2 {
		margin: 0;
		font-size: 15px;
		font-weight: 600;
	}
	.note {
		flex: 1;
		color: var(--text-muted);
		font-size: 12px;
	}
	.fold,
	.picked button {
		min-height: 44px;
		padding: 0 14px;
		border: 1px solid var(--border-strong);
		border-radius: 8px;
		background: var(--surface);
		color: var(--primary);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}
	.fold {
		display: none;
	}
	.picked {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		font-size: 13px;
	}
	.picked code {
		font: 13px var(--font-mono);
		overflow-wrap: anywhere;
	}
	.mode {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 24px;
		color: var(--text-muted);
		font-size: 12px;
	}
	.mode input {
		width: 18px;
		height: 18px;
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.body.off {
		display: none;
	}
	/* dock: the pieces stay at the bottom of the screen while the code scrolls behind them. */
	.tray.dock {
		position: sticky;
		bottom: 0;
		z-index: 5;
		max-height: 40dvh;
		overflow-y: auto;
		box-shadow: 0 -8px 20px rgb(0 0 0 / 0.12);
	}
	/* split (long puzzles, enough room): code | pieces, the pieces column stays in view. */
	@container puzzle (min-width: 1150px) {
		.tray.split {
			position: sticky;
			top: 80px;
			bottom: auto;
			max-height: calc(100dvh - 96px);
			overflow-y: auto;
			box-shadow: none;
		}
	}
	@media (max-width: 700px) {
		.tray {
			padding: 12px;
		}
		.tray.dock {
			max-height: 36dvh;
		}
	}
	@media (max-width: 599.98px) {
		.fold {
			display: inline-block;
		}
	}
</style>
