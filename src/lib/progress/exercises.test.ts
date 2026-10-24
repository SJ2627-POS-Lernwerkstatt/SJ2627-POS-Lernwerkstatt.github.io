import { describe, expect, it } from 'vitest';
import { updateExercise } from './exercises.ts';

const NOW = new Date('2026-11-02T10:00:00.000Z');
const LATER = new Date('2026-11-03T10:00:00.000Z');

describe('updateExercise', () => {
	it('stores the first submission time and keeps it', () => {
		const first = updateExercise(undefined, { submitted: true }, NOW);
		expect(first).toEqual({ submittedAt: NOW.toISOString() });
		expect(updateExercise(first, { submitted: true }, LATER)).toEqual(first);
	});

	it('sets and clears the self-rating', () => {
		const rated = updateExercise({ submittedAt: NOW.toISOString() }, { selfRating: 2 });
		expect(rated).toEqual({ submittedAt: NOW.toISOString(), selfRating: 2 });
		expect(updateExercise(rated, { selfRating: null })).toEqual({ submittedAt: NOW.toISOString() });
	});

	it('drops the entry when nothing is left', () => {
		expect(updateExercise({ submittedAt: NOW.toISOString() }, { submitted: false })).toBeUndefined();
		expect(updateExercise({ selfRating: 3 }, { selfRating: null })).toBeUndefined();
		expect(updateExercise({ selfRating: 3 }, { submitted: false })).toEqual({ selfRating: 3 });
	});
});
