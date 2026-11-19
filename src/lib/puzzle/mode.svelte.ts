// Interaction mode of the puzzles: tap-to-place (default on phones and touch screens) or the
// classic mode where a tap places a piece right away. Dragging works in both.

import { isGhostTap, tapByDefault } from './select.js';

export const NARROW_PX = 600;


class PuzzleMode {
	narrow = $state(false);
	coarse = $state(false);
	/** The student's own choice; undefined = follow the device. */
	override = $state<boolean | undefined>(undefined);
	tap = $derived(this.override ?? tapByDefault(this.narrow, this.coarse));
	private started = false;

	/** Starts following the media queries (browser only, once). */
	watch() {
		if (this.started || typeof matchMedia === 'undefined') return;
		this.started = true;
		const narrow = matchMedia(`(max-width: ${NARROW_PX - 0.02}px)`);
		const coarse = matchMedia('(pointer: coarse)');
		const sync = () => {
			this.narrow = narrow.matches;
			this.coarse = coarse.matches;
		};
		sync();
		narrow.addEventListener('change', sync);
		coarse.addEventListener('change', sync);
	}
}

export const puzzleMode = new PuzzleMode();

let lastClick = -Infinity;

function onclick(e: MouseEvent) {
	if (!puzzleMode.tap) return;
	const now = performance.now();
	if (isGhostTap(e.detail, lastClick, now)) {
		e.stopPropagation();
		e.preventDefault();
		return;
	}
	if (e.detail !== 0) lastClick = now;
}

let guards = 0;

/**
 * Svelte action for a puzzle: while one is on screen and tap mode is on, a pointer click right after
 * another one is a ghost tap and is swallowed anywhere on the page. The layout changes under the
 * finger (the tray folds, "Prüfen" or a link to the next puzzle moves there) and the browser sends
 * its compatibility click to whatever is there now.
 */
export function ghostGuard(_node: HTMLElement) {
	if (guards++ === 0) document.addEventListener('click', onclick, true);
	return {
		destroy() {
			if (--guards === 0) document.removeEventListener('click', onclick, true);
		}
	};
}
