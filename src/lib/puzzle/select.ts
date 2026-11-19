// Tap-to-place: tap a piece in the tray to select it, tap a target to place it, tap a placed piece
// to send it back. Pure functions on top of `state.ts`; the scoring and the saved answer stay the same.

import { insertIntoGap, removeFromGap, type Board } from './state.js';

/** The id of the selected tray chip, or none. */
export type Selection = string | null;

export interface Step {
	board: Board;
	selection: Selection;
}

/** Tapping the selected chip again deselects it; tapping another one moves the selection. */
export const toggleSelection = (selection: Selection, chipId: string): Selection => (selection === chipId ? null : chipId);

/** The selection only lives while its chip is still in the tray. */
export const validSelection = (board: Board, selection: Selection): Selection =>
	selection !== null && board.pool.some((c) => c.id === selection) ? selection : null;

/** Places the selected chip into `gap` at `index` (default: the end). Nothing selected: nothing happens. */
export function placeSelected(board: Board, selection: Selection, gap: number, index = Infinity): Step {
	const valid = validSelection(board, selection);
	if (valid === null) return { board, selection: null };
	return { board: insertIntoGap(board, valid, gap, index), selection: null };
}

/** Tap on a placed chip: it goes back to the tray; a selection in the tray stays if it is still valid. */
export function returnToTray(board: Board, selection: Selection, gap: number, chipId: string): Step {
	const next = removeFromGap(board, gap, chipId);
	return { board: next, selection: validSelection(next, selection) };
}

/** Text for screen readers: where a selected piece would go. */
export const insertionLabel = (index: number, count: number): string =>
	index >= count ? 'Ans Ende der Lösung setzen' : `Vor Zeile ${index + 1} einfügen`;

/** Narrow screens and touch screens start in tap mode; the student can switch either way. */
export const tapByDefault = (narrow: boolean, coarse: boolean): boolean => narrow || coarse;

/**
 * After a tap the DOM changes under the finger (targets appear, the tray folds) and the browser still
 * sends its compatibility click to the new element under the finger. A pointer click this soon after
 * the previous one is such a ghost tap and is ignored. Keyboard clicks (`detail` 0) never are.
 */
export const TAP_GUARD_MS = 250;
export const isGhostTap = (detail: number, lastTapAt: number, now: number): boolean => detail !== 0 && now - lastTapAt < TAP_GUARD_MS;
