import { z } from 'zod';
import { MODULE_SLUGS } from './modules.js';

/** Pages in POS_Java_CheatSheet.pdf. */
export const CHEAT_SHEET_PAGES = 22;

const status = z.enum(['draft', 'reviewed']).default('draft');

/** Mindestanforderung: needed for a Genügend. Everything else is for better grades. */
const mindest = z.boolean().default(false);

export const unitFrontmatter = z.strictObject({
	title: z.string().min(1),
	minutes: z.int().min(1).max(30),
	/** false = Vertiefung (optional unit). */
	core: z.boolean().default(true),
	cheatsheet: z.int().min(1).max(CHEAT_SHEET_PAGES).optional(),
	status,
	mindest
});
export type UnitFrontmatter = z.infer<typeof unitFrontmatter>;

const tier = z.string().min(1);

/** Four-tier grading guideline, as in the official Beurteilungskriterien. Markdown subset. */
export const rubric = z.strictObject({
	/** "Erwartete Ergebnisse": what full points require. */
	erwartet: tier,
	genuegend: tier,
	befriedigend: tier,
	gut: tier,
	sehrGut: tier
});
export type Rubric = z.infer<typeof rubric>;

/** Self-rating as an Austrian grade, stored in progress.exercises[id].selfRating. */
export const GRADES = [
	{ grade: 4, key: 'genuegend', label: 'Genügend' },
	{ grade: 3, key: 'befriedigend', label: 'Befriedigend' },
	{ grade: 2, key: 'gut', label: 'Gut' },
	{ grade: 1, key: 'sehrGut', label: 'Sehr gut' }
] as const satisfies readonly { grade: number; key: keyof Rubric; label: string }[];

export const exerciseFrontmatter = z.strictObject({
	title: z.string().min(1),
	/** Classroom50 accept link; missing until the assignment exists. */
	classroomUrl: z.url().optional(),
	grading: z.enum(['auto', 'teacher']),
	minutes: z.int().min(10).max(300),
	/** Only for mock exams. */
	size: z.enum(['small', 'medium', 'full']).optional(),
	rubric,
	status,
	mindest
});
export type ExerciseFrontmatter = z.infer<typeof exerciseFrontmatter>;

const questionBase = {
	/** Markdown. */
	prompt: z.string().min(1),
	/** Optional code shown below the prompt (Java unless the block says otherwise). */
	code: z.string().optional(),
	/** Markdown, shown after answering. */
	explanation: z.string().min(1)
};

const options = z.array(z.string().min(1)).min(2).max(6);

const singleQuestion = z.strictObject({
	kind: z.literal('single'),
	...questionBase,
	options,
	answer: z.int().min(0)
});

const multiQuestion = z.strictObject({
	kind: z.literal('multi'),
	...questionBase,
	options,
	answer: z.array(z.int().min(0)).min(1)
});

/** Parsons puzzle in ParsonXam template syntax ({{piece}}, {{}} empty gap, ~ any order). */
const templateQuestion = z.strictObject({
	kind: z.literal('template'),
	...questionBase,
	template: z.string().min(1),
	redHerrings: z.array(z.string().min(1)).default([]),
	reusable: z.array(z.string().min(1)).default([])
});

/** Questions that are answered by ticking options (the launch diagnostic allows only these). */
export const choiceQuestion = z.discriminatedUnion('kind', [singleQuestion, multiQuestion]);

export const question = z.discriminatedUnion('kind', [singleQuestion, multiQuestion, templateQuestion]);
export type Question = z.infer<typeof question>;

export const questionGroup = z.strictObject({
	id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase words separated by "-"'),
	/** Unit id "<module>/<slug>", e.g. "jpa/enums". */
	unit: z.string().regex(/^[a-z]+(?:-[a-z0-9]+)*\/[a-z0-9-]+$/, 'expected "<module>/<slug>"'),
	main: question,
	followUps: z.array(question).max(2).default([])
});
export type QuestionGroup = z.infer<typeof questionGroup>;

export const questionPool = z.array(questionGroup);

export const moduleSlug = z.enum(MODULE_SLUGS);

const puzzleBase = {
	id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase words separated by "-"'),
	title: z.string().min(1).max(80),
	/** Markdown: the task. */
	prompt: z.string().min(1),
	/** Optional PlantUML diagram body, rendered at build time. */
	uml: z.string().min(1).optional(),
	/**
	 * Optional read-only Java the solution builds on (existing entities, an interface, …). A list of blocks
	 * (e.g. a shared YAML anchor plus a test class) is joined with a blank line.
	 */
	given: z
		.union([z.string().min(1), z.array(z.string().min(1)).min(1)])
		.transform((g) => (Array.isArray(g) ? g.map((s) => s.trimEnd()).join('\n\n') + '\n' : g))
		.optional(),
	/** Markdown, shown once the puzzle is solved or the solution is revealed. */
	explanation: z.string().min(1),
	/** Hidden JUnit test class that scripts/verify-puzzles.ts runs against the solution. Never sent to the browser. */
	check: z.string().min(1).optional(),
	/** Bugs planted in `given` (first occurrence of `find`); the solution's tests must fail on each. Never sent to the browser. */
	mutants: z.array(z.strictObject({ find: z.string().min(1), replace: z.string() })).default([]),
	/** auto = side by side on wide screens when the puzzle is long (see puzzleLayout), else stacked. */
	layout: z.enum(['auto', 'stacked', 'split']).default('auto'),
	status,
	mindest
};

/** Order whole lines. `solution` is the code in the right order; leading spaces (×4) set the indentation. */
const linePuzzle = z.strictObject({
	kind: z.literal('lines'),
	...puzzleBase,
	solution: z.string().min(1),
	/** Wrong lines, with their indentation as leading spaces. */
	redHerrings: z.array(z.string().min(1)).max(10).default([])
});

/** Fill gaps, ParsonXam template syntax as in the question pools. */
const templatePuzzle = z.strictObject({
	kind: z.literal('template'),
	...puzzleBase,
	template: z.string().min(1),
	redHerrings: z.array(z.string().min(1)).default([]),
	reusable: z.array(z.string().min(1)).default([])
});

export const puzzle = z.discriminatedUnion('kind', [linePuzzle, templatePuzzle]);
export type Puzzle = z.infer<typeof puzzle>;

export const puzzlePool = z.array(puzzle);

/*
 * English translations live in src/content/en/ and mirror the German files. They carry only the text;
 * everything else (answers, templates, solutions, flags) comes from the German original.
 */

/** Frontmatter of src/content/en/<module>/<nn>-<slug>.md. */
export const unitTranslationFrontmatter = z.strictObject({
	title: z.string().min(1)
});

const questionText = z.strictObject({
	prompt: z.string().min(1),
	/** Only if the German question shows code with German text in it. */
	code: z.string().optional(),
	explanation: z.string().min(1),
	/** single/multi only, same number and order as in German. */
	options: options.optional(),
	/**
	 * template only, and only if the German pieces are German text: the same gaps and pieces in the same order.
	 * Answers are stored by piece position, so piece n must mean the same in both languages.
	 */
	template: z.string().min(1).optional(),
	redHerrings: z.array(z.string().min(1)).optional(),
	reusable: z.array(z.string().min(1)).optional()
});
export type QuestionText = z.infer<typeof questionText>;

/** One entry of src/content/en/questions/<module>.yaml. */
export const groupTranslation = z.strictObject({
	id: z.string().min(1),
	main: questionText,
	/** Same number and order as in German. */
	followUps: z.array(questionText).max(2).default([])
});
export type GroupTranslation = z.infer<typeof groupTranslation>;
export const groupTranslationPool = z.array(groupTranslation);

/** One entry of src/content/en/puzzles/<topic>.yaml. */
export const puzzleTranslation = z.strictObject({
	id: z.string().min(1),
	title: z.string().min(1).max(80),
	prompt: z.string().min(1),
	explanation: z.string().min(1),
	/** Only if the German `given` has German comments. Display only: checks and mutants use the German one. */
	given: z
		.union([z.string().min(1), z.array(z.string().min(1)).min(1)])
		.transform((g) => (Array.isArray(g) ? g.map((s) => s.trimEnd()).join('\n\n') + '\n' : g))
		.optional(),
	/**
	 * Text replacements for German comments in the code, applied to `given` and to the fixed text of a template
	 * (never to its pieces – the build checks that the gaps stay the same). Display only.
	 */
	replace: z.array(z.strictObject({ find: z.string().min(1), replace: z.string() })).default([])
});
export type PuzzleTranslation = z.infer<typeof puzzleTranslation>;
export const puzzleTranslationPool = z.array(puzzleTranslation);
