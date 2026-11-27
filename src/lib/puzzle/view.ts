import type { TemplateGap } from './scoring.js';
import type { PoolTile, Segment } from './template.js';

export type LineTile = { text: string; indent: number; herring: boolean };

/** A puzzle as the browser gets it: Markdown and code rendered, UML as an image, templates parsed. */
export type PuzzleView = {
	id: string;
	topic: string;
	title: string;
	promptHtml: string;
	/** data: URI of the rendered PlantUML diagram. */
	umlSrc?: string;
	givenHtml?: string;
	explanationHtml: string;
	/** The complete solution, highlighted, for "Lösung zeigen". */
	solutionHtml: string;
	/** split = task | code | pieces side by side when the screen is wide enough; stacked = always one column. */
	layout: 'stacked' | 'split';
	/** Given code + solution lines exceed `SPLIT_FROM_LINES`: a phone shows "Laptop empfohlen". */
	long: boolean;
	/** English text, if translated. The code and the pieces are the same in both languages. */
	en?: {
		title: string;
		promptHtml: string;
		givenHtml?: string;
		explanationHtml: string;
		/** Template puzzles whose fixed text was translated: same gaps and pieces, other text. */
		lines?: Segment[][];
		solutionHtml?: string;
	};
} & (
	| {
			kind: 'lines';
			/** Solution lines first, then red herrings; the browser shuffles them. */
			tiles: LineTile[];
			/** Line keys (indentation + text) of the solution, in order. */
			expected: string[];
	  }
	| { kind: 'template'; lines: Segment[][]; gaps: TemplateGap[]; tiles: PoolTile[] }
);

/** Link to a neighbouring puzzle. */
export type PuzzleLink = { id: string; title: string; titleEn?: string };
