import { describe, expect, it } from 'vitest';
import { lineMarks, puzzleCorrect, puzzlePercent } from './answer.js';
import type { PuzzleView } from './view.js';

const common = { id: 'p', topic: 'jpa-entity', title: 'P', promptHtml: '', explanationHtml: '', solutionHtml: '', layout: 'stacked' as const, long: false };

const lines: PuzzleView = {
	...common,
	kind: 'lines',
	tiles: [
		{ text: 'class A {', indent: 0, herring: false },
		{ text: '}', indent: 1, herring: false },
		{ text: '}', indent: 0, herring: false },
		{ text: 'record A {', indent: 0, herring: true }
	],
	expected: ['class A {', '    }', '}']
};

const template: PuzzleView = {
	...common,
	kind: 'template',
	lines: [],
	gaps: [
		{ expected: ['Entity'], anyOrder: false },
		{ expected: [], anyOrder: false }
	],
	tiles: [
		{ text: 'Entity', reusable: false, herring: false },
		{ text: 'Table', reusable: false, herring: true }
	]
};

describe('line puzzles', () => {
	it('needs the right lines in order, with the right indentation', () => {
		expect(puzzleCorrect(lines, { '0': ['t0', 't1', 't2'] })).toBe(true);
		// Same text, wrong indentation.
		expect(puzzleCorrect(lines, { '0': ['t0', 't2', 't1'] })).toBe(false);
	});

	it('marks a red herring wrong and scores the rest', () => {
		expect(lineMarks(lines, { '0': ['t3', 't1', 't2'] })).toEqual([false, true, true]);
		expect(puzzlePercent(lines, { '0': ['t3', 't1', 't2'] })).toBe(67);
	});
});

describe('template puzzles', () => {
	it('is right with every gap right and the empty gap left empty', () => {
		expect(puzzleCorrect(template, { '0': ['t0'] })).toBe(true);
		expect(puzzleCorrect(template, { '0': ['t0'], '1': ['t1'] })).toBe(false);
		expect(puzzlePercent(template, { '0': ['t0'], '1': ['t1'] })).toBe(50);
	});
});
