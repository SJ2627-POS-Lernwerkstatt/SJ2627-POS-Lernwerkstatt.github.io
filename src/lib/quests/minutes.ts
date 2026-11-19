/**
 * Minute estimates for content that has no `minutes` of its own.
 *   puzzle, lines:    3 + ceil(solution lines / 4)  (a 12-line puzzle = 6 min)
 *   puzzle, template: 4
 *   question group:   2 for the main question + 1 per follow-up
 *   review run:       ceil(cards / 2)  (about 30 s a card, at least 1)
 */
export const puzzleMinutes = (p: { kind: 'lines'; solution: string } | { kind: 'template' }): number =>
	p.kind === 'lines' ? 3 + Math.ceil(p.solution.split('\n').filter((l) => l.trim()).length / 4) : 4;

export const groupMinutes = (followUps: number): number => 2 + followUps;

export const reviewMinutes = (cards: number): number => Math.max(1, Math.ceil(cards / 2));
