// Scoring for template puzzles, ported from ParsonXam (backend/src/lib/scoring.ts).

export interface TemplateGap {
	expected: string[];
	anyOrder: boolean;
}

/**
 * Which placed pieces of one gap are right. Ordered gaps: the pieces of the longest common
 * subsequence with the expected ones (the backtrack takes the earliest match, so the result is
 * deterministic). Any-order gaps: the multiset intersection, earlier copies first.
 */
export function correctFlags(gap: TemplateGap, placed: string[]): boolean[] {
	const { expected } = gap;
	const flags = placed.map(() => false);
	if (gap.anyOrder) {
		const left = new Map<string, number>();
		for (const e of expected) left.set(e, (left.get(e) ?? 0) + 1);
		for (const [j, text] of placed.entries()) {
			const n = left.get(text) ?? 0;
			if (n > 0) {
				flags[j] = true;
				left.set(text, n - 1);
			}
		}
		return flags;
	}
	// lcs[i][j]: length of the LCS of expected[i..] and placed[j..].
	const lcs = Array.from({ length: expected.length + 1 }, () => new Array<number>(placed.length + 1).fill(0));
	for (let i = expected.length - 1; i >= 0; i--) {
		for (let j = placed.length - 1; j >= 0; j--) {
			lcs[i]![j] = expected[i] === placed[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
		}
	}
	let i = 0;
	let j = 0;
	while (i < expected.length && j < placed.length) {
		if (expected[i] === placed[j]) {
			flags[j++] = true;
			i++;
		} else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) i++;
		else j++;
	}
	return flags;
}

/**
 * Template puzzles, 0..100: sum of matching pieces over the sum of max(expected, placed) per gap.
 * `placed[g]` holds the piece texts in gap g. Extra, missing and wrong pieces all lower the score;
 * a puzzle with nothing placed scores 0.
 */
export function templatePercent(gaps: TemplateGap[], placed: string[][]): number {
	let match = 0;
	let denom = 0;
	for (const [g, gap] of gaps.entries()) {
		const mine = placed[g] ?? [];
		match += correctFlags(gap, mine).filter(Boolean).length;
		denom += Math.max(gap.expected.length, mine.length);
	}
	return denom === 0 ? 0 : (match / denom) * 100;
}
