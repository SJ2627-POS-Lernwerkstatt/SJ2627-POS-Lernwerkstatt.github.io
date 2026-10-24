import { z } from 'zod';
import { MODULE_SLUGS } from './modules.js';

/** Pages in POS_Java_CheatSheet.pdf. */
export const CHEAT_SHEET_PAGES = 22;

const status = z.enum(['draft', 'reviewed']).default('draft');

export const unitFrontmatter = z.strictObject({
	title: z.string().min(1),
	minutes: z.int().min(1).max(30),
	/** false = Vertiefung (optional unit). */
	core: z.boolean().default(true),
	cheatsheet: z.int().min(1).max(CHEAT_SHEET_PAGES).optional(),
	status
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
	status
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

export const question = z.discriminatedUnion('kind', [singleQuestion, multiQuestion, templateQuestion]);
export type Question = z.infer<typeof question>;

export const questionGroup = z.strictObject({
	id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase words separated by "-"'),
	/** Unit id "<module>/<slug>", e.g. "jpa/enums". */
	unit: z.string().regex(/^[a-z]+\/[a-z0-9-]+$/, 'expected "<module>/<slug>"'),
	main: question,
	followUps: z.array(question).max(2).default([])
});
export type QuestionGroup = z.infer<typeof questionGroup>;

export const questionPool = z.array(questionGroup);

export const moduleSlug = z.enum(MODULE_SLUGS);
