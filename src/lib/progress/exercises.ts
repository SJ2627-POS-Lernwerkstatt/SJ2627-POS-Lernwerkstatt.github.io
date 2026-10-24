import type { Progress } from './schema.ts';

export type ExerciseProgress = Progress['exercises'][string];

/** Applies a change to an exercise entry; returns undefined when nothing is left to store. */
export function updateExercise(
	entry: ExerciseProgress | undefined,
	change: { submitted?: boolean; selfRating?: 1 | 2 | 3 | 4 | null },
	now = new Date()
): ExerciseProgress | undefined {
	const next = { ...entry };
	if (change.submitted === true) next.submittedAt ??= now.toISOString();
	if (change.submitted === false) delete next.submittedAt;
	if (change.selfRating === null) delete next.selfRating;
	else if (change.selfRating !== undefined) next.selfRating = change.selfRating;
	return next.submittedAt === undefined && next.selfRating === undefined ? undefined : next;
}
