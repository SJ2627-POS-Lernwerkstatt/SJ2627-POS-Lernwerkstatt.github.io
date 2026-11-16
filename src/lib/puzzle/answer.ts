// Checking a puzzle answer in the browser. Both kinds store their answer as `Gaps`
// (line puzzles use a single gap "0"); piece ids are "t<index into tiles>".

import { lineFlags, lineKey, linesCorrect, linesPercent } from './lines.js';
import { templatePercent } from './scoring.js';
import type { Gaps, Tile } from './state.js';
import type { PuzzleView } from './view.js';

type LineView = PuzzleView & { kind: 'lines' };
type TemplateView = PuzzleView & { kind: 'template' };

export function puzzleTiles(p: PuzzleView): Tile[] {
	return p.tiles.map((t, i) => ({ pieceId: `t${i}`, text: t.text, reusable: 'reusable' in t ? t.reusable : false }));
}

const tileAt = <T>(tiles: T[], id: string): T | undefined => (id.startsWith('t') ? tiles[Number(id.slice(1))] : undefined);

/** Line keys of the placed lines, in order. */
export function placedLines(p: LineView, gaps: Gaps): string[] {
	return (gaps['0'] ?? []).flatMap((id) => {
		const t = tileAt(p.tiles, id);
		return t ? [lineKey(t)] : [];
	});
}

/** Piece texts per gap. */
export function placedPieces(p: TemplateView, gaps: Gaps): string[][] {
	return p.gaps.map((_, g) =>
		(gaps[String(g)] ?? []).flatMap((id) => {
			const t = tileAt(p.tiles, id);
			return t ? [t.text] : [];
		})
	);
}

export function isPlacedAnything(gaps: Gaps): boolean {
	return Object.values(gaps).some((ids) => ids.length > 0);
}

export function puzzleCorrect(p: PuzzleView, gaps: Gaps): boolean {
	if (p.kind === 'lines') return linesCorrect(p.expected, placedLines(p, gaps));
	const expectsSomething = p.gaps.some((g) => g.expected.length > 0);
	return expectsSomething && templatePercent(p.gaps, placedPieces(p, gaps)) === 100;
}

export function puzzlePercent(p: PuzzleView, gaps: Gaps): number {
	if (p.kind === 'lines') return Math.round(linesPercent(p.expected, placedLines(p, gaps)));
	return Math.round(templatePercent(p.gaps, placedPieces(p, gaps)));
}

/** Right/wrong per placed line, for the marks after "Prüfen". */
export function lineMarks(p: LineView, gaps: Gaps): boolean[] {
	return lineFlags(p.expected, placedLines(p, gaps));
}
