import { describe, expect, it } from 'vitest';
import { insertionLabel, isGhostTap, placeSelected, returnToTray, tapByDefault, toggleSelection, validSelection } from './select.js';
import { initBoard, insertIntoGap, toGaps, type Tile } from './state.js';

const tiles: Tile[] = [
	{ pieceId: 't0', text: 'a', reusable: false },
	{ pieceId: 't1', text: 'b', reusable: false },
	{ pieceId: 't2', text: 'c', reusable: false },
	{ pieceId: 't3', text: 'int', reusable: true }
];
const idOf = (b: ReturnType<typeof initBoard>, pieceId: string) => b.pool.find((c) => c.pieceId === pieceId)!.id;

describe('selection', () => {
	it('toggles and moves', () => {
		expect(toggleSelection(null, 'x')).toBe('x');
		expect(toggleSelection('x', 'x')).toBeNull();
		expect(toggleSelection('x', 'y')).toBe('y');
	});

	it('drops a selection whose chip left the tray', () => {
		const b = initBoard(tiles, 1, { '0': ['t0'] });
		expect(validSelection(b, 'gone')).toBeNull();
		expect(validSelection(b, idOf(b, 't1'))).toBe(idOf(b, 't1'));
		expect(validSelection(b, null)).toBeNull();
	});
});

describe('placeSelected', () => {
	it('inserts at the chosen index and clears the selection', () => {
		let b = initBoard(tiles, 1, { '0': ['t0', 't2'] });
		const step = placeSelected(b, idOf(b, 't1'), 0, 1);
		b = step.board;
		expect(toGaps(b)).toEqual({ '0': ['t0', 't1', 't2'] });
		expect(step.selection).toBeNull();
		expect(b.pool.map((c) => c.pieceId)).toEqual(['t3']);
	});

	it('appends by default and at the start with index 0', () => {
		const b = initBoard(tiles, 1, { '0': ['t0'] });
		expect(toGaps(placeSelected(b, idOf(b, 't1'), 0).board)).toEqual({ '0': ['t0', 't1'] });
		expect(toGaps(placeSelected(b, idOf(b, 't1'), 0, 0).board)).toEqual({ '0': ['t1', 't0'] });
	});

	it('does nothing without a valid selection', () => {
		const b = initBoard(tiles, 1, {});
		expect(placeSelected(b, null, 0).board).toBe(b);
		expect(placeSelected(b, 'gone', 0).board).toBe(b);
	});

	it('ignores an unknown gap', () => {
		const b = initBoard(tiles, 1, {});
		expect(placeSelected(b, idOf(b, 't0'), 5).board.pool).toHaveLength(4);
	});

	it('a reusable chip stays in the tray and can be placed again', () => {
		let b = initBoard(tiles, 2, {});
		b = placeSelected(b, idOf(b, 't3'), 0).board;
		b = placeSelected(b, idOf(b, 't3'), 1).board;
		expect(toGaps(b)).toEqual({ '0': ['t3'], '1': ['t3'] });
		expect(b.pool.some((c) => c.pieceId === 't3')).toBe(true);
	});
});

describe('returnToTray', () => {
	it('sends a placed chip back and keeps a valid selection', () => {
		let b = initBoard(tiles, 1, { '0': ['t0', 't1'] });
		const sel = idOf(b, 't2');
		const chip = b.gaps[0]![0]!;
		const step = returnToTray(b, sel, 0, chip.id);
		b = step.board;
		expect(toGaps(b)).toEqual({ '0': ['t1'] });
		expect(b.pool.some((c) => c.pieceId === 't0')).toBe(true);
		expect(step.selection).toBe(sel);
	});
});

describe('insertIntoGap', () => {
	it('clamps the index', () => {
		const b = initBoard(tiles, 1, { '0': ['t0'] });
		expect(toGaps(insertIntoGap(b, idOf(b, 't1'), 0, -4))).toEqual({ '0': ['t1', 't0'] });
		expect(toGaps(insertIntoGap(b, idOf(b, 't1'), 0, 99))).toEqual({ '0': ['t0', 't1'] });
	});
});

describe('labels and defaults', () => {
	it('names insertion points in German', () => {
		expect(insertionLabel(0, 3)).toBe('Vor Zeile 1 einfügen');
		expect(insertionLabel(3, 3)).toBe('Ans Ende der Lösung setzen');
	});
	it('uses tap mode on narrow or touch screens', () => {
		expect(tapByDefault(true, false)).toBe(true);
		expect(tapByDefault(false, true)).toBe(true);
		expect(tapByDefault(false, false)).toBe(false);
	});
});

describe('isGhostTap', () => {
	it('ignores a pointer click right after the previous tap', () => {
		expect(isGhostTap(1, 1000, 1010)).toBe(true);
		expect(isGhostTap(undefined as unknown as number, 1000, 1010)).toBe(true);
	});
	it('lets a later tap through', () => {
		expect(isGhostTap(1, 1000, 1300)).toBe(false);
		expect(isGhostTap(1, -Infinity, 5)).toBe(false);
	});
	it('never blocks the keyboard (click detail 0)', () => {
		expect(isGhostTap(0, 1000, 1001)).toBe(false);
	});
});
