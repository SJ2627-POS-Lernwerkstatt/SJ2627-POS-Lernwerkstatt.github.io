// Line puzzles: the student puts whole lines in order. Indentation is part of a line and shown,
// so the student does not have to set it. Pure functions, shared by build, server and browser.

import { correctFlags } from './scoring.js';

export interface CodeLine {
	/** Nesting level, one level = 4 spaces in the source. */
	indent: number;
	text: string;
}

export const LINE_LIMITS = { lines: 30, chars: 200, herrings: 10 };

/** Leading tabs count as 4 spaces. */
function leading(line: string): number {
	const ws = /^[ \t]*/.exec(line)![0];
	return ws.replace(/\t/g, '    ').length;
}

/** Splits a code block into lines. Blank lines are dropped; indentation must be a multiple of 4 spaces. */
export function parseLines(source: string): { lines: CodeLine[]; errors: string[] } {
	const lines: CodeLine[] = [];
	const errors: string[] = [];
	for (const [n, raw] of source.replace(/\r\n/g, '\n').split('\n').entries()) {
		const line = toLine(raw);
		if (!line) continue;
		if ('error' in line) errors.push(`line ${n + 1}: ${line.error}`);
		else lines.push(line);
	}
	return { lines, errors };
}

/** One line of code, or undefined for a blank line. */
export function toLine(raw: string): CodeLine | { error: string } | undefined {
	const text = raw.trim();
	if (!text) return undefined;
	const spaces = leading(raw);
	if (spaces % 4 !== 0) return { error: `indentation of ${spaces} spaces is not a multiple of 4` };
	if (text.length > LINE_LIMITS.chars) return { error: `longer than ${LINE_LIMITS.chars} characters` };
	return { indent: spaces / 4, text };
}

/** Lines are compared with their indentation: `}` at two levels are different lines. */
export const lineKey = (l: CodeLine): string => '    '.repeat(l.indent) + l.text;

const indentOf = (key: string) => /^ */.exec(key)![0].length;
const isAnnotation = (key: string) => key.trimStart().startsWith('@');

/**
 * Annotation order never matters in Java: every run of consecutive annotation lines with the same
 * indentation is sorted. `order[j]` is the original index of the line now at position j.
 */
export function canonical(keys: string[]): { keys: string[]; order: number[] } {
	const order = keys.map((_, i) => i);
	let i = 0;
	while (i < keys.length) {
		let j = i;
		if (isAnnotation(keys[i]!)) {
			while (j + 1 < keys.length && isAnnotation(keys[j + 1]!) && indentOf(keys[j + 1]!) === indentOf(keys[i]!)) j++;
			const run = order.slice(i, j + 1).sort((a, b) => (keys[a]! < keys[b]! ? -1 : keys[a]! > keys[b]! ? 1 : a - b));
			order.splice(i, run.length, ...run);
		}
		i = j + 1;
	}
	return { keys: order.map((k) => keys[k]!), order };
}

/** Which placed lines are right (longest common subsequence with the solution), in placed order. */
export function lineFlags(expected: string[], placed: string[]): boolean[] {
	const mine = canonical(placed);
	const flags = correctFlags({ expected: canonical(expected).keys, anyOrder: false }, mine.keys);
	const out = placed.map(() => false);
	mine.order.forEach((original, j) => (out[original] = flags[j]!));
	return out;
}

/** Right only when exactly the solution lines are placed, in order (annotations in any order). */
export function linesCorrect(expected: string[], placed: string[]): boolean {
	const a = canonical(expected).keys;
	const b = canonical(placed).keys;
	return a.length === b.length && a.every((k, i) => k === b[i]);
}

/** 0..100: matching lines over the larger of expected and placed count. */
export function linesPercent(expected: string[], placed: string[]): number {
	const denom = Math.max(expected.length, placed.length);
	return denom === 0 ? 0 : (lineFlags(expected, placed).filter(Boolean).length / denom) * 100;
}
