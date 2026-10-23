import { correctFlags, templatePercent } from '#lib/puzzle/scoring.js';
import type { Gaps, Tile } from '#lib/puzzle/state.js';
import type { Answer, QuestionView } from './types.ts';

export function emptyAnswer(q: QuestionView): Answer {
	if (q.kind === 'single') return { kind: 'single', choice: null };
	if (q.kind === 'multi') return { kind: 'multi', choices: [] };
	return { kind: 'template', gaps: {} };
}

/** Pool tiles with ids for the puzzle board. */
export function templateTiles(q: QuestionView & { kind: 'template' }): Tile[] {
	return q.tiles.map((t, i) => ({ pieceId: `t${i}`, text: t.text, reusable: t.reusable }));
}

/** Piece texts per gap, in gap order. Unknown ids are ignored. */
export function placedTexts(q: QuestionView & { kind: 'template' }, gaps: Gaps): string[][] {
	return q.gaps.map((_, g) =>
		(gaps[String(g)] ?? []).flatMap((id) => {
			const tile = q.tiles[Number(id.slice(1))];
			return id.startsWith('t') && tile ? [tile.text] : [];
		})
	);
}

export function isAnswered(a: Answer): boolean {
	if (a.kind === 'single') return a.choice !== null;
	if (a.kind === 'multi') return a.choices.length > 0;
	return Object.values(a.gaps).some((ids) => ids.length > 0);
}

/** A question counts only when fully right; a template puzzle needs 100 %. */
export function isCorrect(q: QuestionView, a: Answer): boolean {
	if (q.kind === 'single' && a.kind === 'single') return a.choice === q.answer;
	if (q.kind === 'multi' && a.kind === 'multi') {
		return a.choices.length === q.answer.length && q.answer.every((i) => a.choices.includes(i));
	}
	if (q.kind === 'template' && a.kind === 'template') {
		const placed = placedTexts(q, a.gaps);
		const expectsSomething = q.gaps.some((g) => g.expected.length > 0);
		return expectsSomething && templatePercent(q.gaps, placed) === 100;
	}
	return false;
}

/** 0–100 for template puzzles (shown in the review), 0 or 100 otherwise. */
export function scorePercent(q: QuestionView, a: Answer): number {
	if (q.kind === 'template' && a.kind === 'template') return Math.round(templatePercent(q.gaps, placedTexts(q, a.gaps)));
	return isCorrect(q, a) ? 100 : 0;
}

export type ReviewSegment =
	| { text: string }
	| { gap: number; expected: string[]; submitted: { text: string; correct: boolean }[]; anyOrder: boolean };

/** The template with each gap's placed pieces marked right or wrong, for the review. */
export function reviewLines(q: QuestionView & { kind: 'template' }, gaps: Gaps): ReviewSegment[][] {
	const placed = placedTexts(q, gaps);
	return q.lines.map((line) =>
		line.map((seg) => {
			if ('text' in seg) return seg;
			const gap = q.gaps[seg.gap]!;
			const mine = placed[seg.gap] ?? [];
			const flags = correctFlags(gap, mine);
			return {
				gap: seg.gap,
				expected: gap.expected,
				anyOrder: gap.anyOrder,
				submitted: mine.map((text, i) => ({ text, correct: flags[i]! }))
			};
		})
	);
}
