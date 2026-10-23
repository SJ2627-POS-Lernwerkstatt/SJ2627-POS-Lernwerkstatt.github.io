import type { Gaps } from '#lib/puzzle/state.js';
import type { PoolTile, Segment } from '#lib/puzzle/template.js';
import type { TemplateGap } from '#lib/puzzle/scoring.js';

/** A question as the browser gets it: Markdown already rendered, templates already parsed. */
export type QuestionView = {
	promptHtml: string;
	codeHtml?: string;
	explanationHtml: string;
} & (
	| { kind: 'single'; optionsHtml: string[]; answer: number }
	| { kind: 'multi'; optionsHtml: string[]; answer: number[] }
	| { kind: 'template'; lines: Segment[][]; gaps: TemplateGap[]; tiles: PoolTile[] }
);

export type GroupView = {
	id: string;
	unit: string;
	main: QuestionView;
	followUps: QuestionView[];
};

/** What the student did. Template answers hold piece ids ("t0", "t1", … = index in `tiles`) per gap. */
export type Answer =
	| { kind: 'single'; choice: number | null }
	| { kind: 'multi'; choices: number[] }
	| { kind: 'template'; gaps: Gaps };
