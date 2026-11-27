import { z } from 'zod';

export const STORAGE_KEY = 'lernwerkstatt:v1';
/** A store that could not be read is kept here once, so nothing is lost silently. */
export const BROKEN_KEY = 'lernwerkstatt:v1:broken';
export const MAX_RUNS = 50;

const timestamp = z.iso.datetime();

export const groupProgress = z.object({
	/** Leitner box: 0 = new, 1 = failed last time, 2–4 = answered correctly 1–3 times in a row. */
	box: z.int().min(0).max(4),
	lastAt: timestamp,
	runs: z.int().min(0),
	wrong: z.int().min(0)
});
export type GroupProgress = z.infer<typeof groupProgress>;

export const runResult = z.object({
	/** Module slug or "alle". */
	scope: z.string(),
	at: timestamp,
	correct: z.int().min(0),
	total: z.int().min(0)
});
export type RunResult = z.infer<typeof runResult>;

export const progressSchema = z.object({
	version: z.literal(1),
	name: z.string().max(100).optional(),
	units: z.record(z.string(), z.object({ readAt: timestamp })).default({}),
	groups: z.record(z.string(), groupProgress).default({}),
	runs: z.array(runResult).max(MAX_RUNS).default([]),
	/** Shape is owned by exercise mode (lib/quiz). */
	currentRun: z.unknown().optional(),
	exercises: z
		.record(
			z.string(),
			z.object({ submittedAt: timestamp.optional(), selfRating: z.int().min(1).max(4).optional() })
		)
		.default({}),
	/** Puzzles by id: how often "Prüfen" was pressed and when it first came out right. */
	puzzles: z
		.record(z.string(), z.object({ tries: z.int().min(0), solvedAt: timestamp.optional() }))
		.default({}),
	settings: z
		.object({
			theme: z.enum(['light', 'dark', 'system']).optional(),
			/** Language of the course content (units, questions, puzzles). The site itself stays German. */
			lang: z.enum(['de', 'en']).optional()
		})
		.default({})
});
export type Progress = z.infer<typeof progressSchema>;

export function emptyProgress(): Progress {
	return { version: 1, units: {}, groups: {}, runs: [], exercises: {}, puzzles: {}, settings: {} };
}
