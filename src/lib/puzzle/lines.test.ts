import { describe, expect, it } from 'vitest';
import { canonical, lineFlags, lineKey, linesCorrect, linesPercent, parseLines } from './lines.js';

describe('parseLines', () => {
	it('reads indentation levels and drops blank lines', () => {
		const { lines, errors } = parseLines('@Entity\npublic class A {\n\n    private String name;\n}\n');
		expect(errors).toEqual([]);
		expect(lines).toEqual([
			{ indent: 0, text: '@Entity' },
			{ indent: 0, text: 'public class A {' },
			{ indent: 1, text: 'private String name;' },
			{ indent: 0, text: '}' }
		]);
	});

	it('counts a tab as 4 spaces', () => {
		expect(parseLines('\tx;').lines).toEqual([{ indent: 1, text: 'x;' }]);
	});

	it('rejects indentation that is not a multiple of 4', () => {
		expect(parseLines('a\n  b').errors).toEqual(['line 2: indentation of 2 spaces is not a multiple of 4']);
	});
});

describe('scoring', () => {
	const expected = ['a', '    b', '}'];

	it('keys keep the indentation', () => {
		expect(lineKey({ indent: 2, text: '}' })).toBe('        }');
	});

	it('is correct only with exactly the solution in order', () => {
		expect(linesCorrect(expected, ['a', '    b', '}'])).toBe(true);
		expect(linesCorrect(expected, ['a', '}', '    b'])).toBe(false);
		expect(linesCorrect(expected, ['a', '    b', '}', 'x'])).toBe(false);
	});

	it('marks lines of the longest common subsequence', () => {
		expect(lineFlags(expected, ['a', 'x', '    b', '}'])).toEqual([true, false, true, true]);
		expect(linesPercent(expected, ['a', 'x', '    b', '}'])).toBe(75);
		expect(linesPercent(expected, [])).toBe(0);
	});

	it('accepts annotations on the same element in any order', () => {
		const exp = ['@Entity', '@Table(name = "a")', 'class A {', '    @NotNull', '    @Column(length = 3)', '    String x;', '}'];
		const mine = ['@Table(name = "a")', '@Entity', 'class A {', '    @Column(length = 3)', '    @NotNull', '    String x;', '}'];
		expect(linesCorrect(exp, mine)).toBe(true);
		expect(lineFlags(exp, mine).every(Boolean)).toBe(true);
	});

	it('keeps marks in the order the lines were placed', () => {
		const exp = ['@A', '@B', 'x'];
		expect(lineFlags(exp, ['@C', '@A', 'x'])).toEqual([false, true, true]);
		expect(canonical(['@C', '@A', 'x']).order).toEqual([1, 0, 2]);
	});
});
