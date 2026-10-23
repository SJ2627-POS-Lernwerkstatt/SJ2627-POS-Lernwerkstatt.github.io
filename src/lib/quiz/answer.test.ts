import { describe, expect, it } from 'vitest';
import { buildPool, parseTemplate } from '#lib/puzzle/template.js';
import { emptyAnswer, isAnswered, isCorrect, placedTexts, scorePercent, templateTiles } from './answer.ts';
import type { QuestionView } from './types.ts';

const base = { promptHtml: 'p', explanationHtml: 'e' };
const single: QuestionView = { ...base, kind: 'single', optionsHtml: ['a', 'b', 'c'], answer: 1 };
const multi: QuestionView = { ...base, kind: 'multi', optionsHtml: ['a', 'b', 'c'], answer: [0, 2] };

function template(src: string, herrings: string[] = []): QuestionView & { kind: 'template' } {
	const parsed = parseTemplate(src);
	return { ...base, kind: 'template', lines: parsed.lines, gaps: parsed.gaps, tiles: buildPool(parsed, herrings, []).tiles };
}

describe('single and multi', () => {
	it('needs the exact choice', () => {
		expect(isCorrect(single, { kind: 'single', choice: 1 })).toBe(true);
		expect(isCorrect(single, { kind: 'single', choice: 0 })).toBe(false);
		expect(isCorrect(single, { kind: 'single', choice: null })).toBe(false);
	});

	it('needs exactly the right set, in any order', () => {
		expect(isCorrect(multi, { kind: 'multi', choices: [2, 0] })).toBe(true);
		expect(isCorrect(multi, { kind: 'multi', choices: [0] })).toBe(false);
		expect(isCorrect(multi, { kind: 'multi', choices: [0, 1, 2] })).toBe(false);
	});

	it('knows when something was answered', () => {
		expect(isAnswered(emptyAnswer(single))).toBe(false);
		expect(isAnswered(emptyAnswer(multi))).toBe(false);
		expect(isAnswered({ kind: 'multi', choices: [1] })).toBe(true);
	});
});

describe('template', () => {
	const q = template('@{{Entity}}\nclass A {{extends}} {{B}} {}', ['Table']);

	it('gives every tile an id', () => {
		expect(templateTiles(q).map((t) => [t.pieceId, t.text])).toEqual([
			['t0', 'Entity'],
			['t1', 'extends'],
			['t2', 'B'],
			['t3', 'Table']
		]);
	});

	it('maps placed ids to texts', () => {
		expect(placedTexts(q, { '0': ['t3'], '1': ['t1', 't2'], '7': ['t0'] })).toEqual([['Table'], ['extends', 'B']]);
	});

	it('is correct only at 100 %', () => {
		const right = { kind: 'template' as const, gaps: { '0': ['t0'], '1': ['t1', 't2'] } };
		const half = { kind: 'template' as const, gaps: { '0': ['t3'], '1': ['t1', 't2'] } };
		expect(isCorrect(q, right)).toBe(true);
		expect(isCorrect(q, half)).toBe(false);
		expect(scorePercent(q, half)).toBe(67);
		expect(isAnswered(emptyAnswer(q))).toBe(false);
	});
});
