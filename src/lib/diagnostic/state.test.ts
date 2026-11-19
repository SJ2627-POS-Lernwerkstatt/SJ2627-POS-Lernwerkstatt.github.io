import { describe, expect, it } from 'vitest';
import { DONE_KEY, clearDraft, isDone, loadDraft, markDone, saveDraft, toPayload } from './state.ts';

function memory() {
	const m = new Map<string, string>();
	return {
		getItem: (k: string) => m.get(k) ?? null,
		setItem: (k: string, v: string) => void m.set(k, v),
		removeItem: (k: string) => void m.delete(k)
	};
}
const ids = ['a', 'b', 'c'];

describe('toPayload', () => {
	it('omits unanswered questions and sorts multi answers', () => {
		expect(toPayload(ids, { c: [2, 0], a: 1 })).toEqual({
			answers: [
				{ id: 'a', answer: 1 },
				{ id: 'c', answer: [0, 2] }
			]
		});
	});
	it('can be empty', () => {
		expect(toPayload(ids, {})).toEqual({ answers: [] });
	});
	it('keeps answer 0', () => {
		expect(toPayload(ids, { b: 0 }).answers).toEqual([{ id: 'b', answer: 0 }]);
	});
});

describe('draft', () => {
	it('round-trips and clears', () => {
		const s = memory();
		saveDraft(s, { answers: { a: 1, b: [0, 1] }, index: 2, started: true });
		expect(loadDraft(s, ids)).toEqual({ answers: { a: 1, b: [0, 1] }, index: 2, started: true });
		clearDraft(s);
		expect(loadDraft(s, ids).started).toBe(false);
	});
	it('drops unknown ids, garbage and clamps the index', () => {
		const s = memory();
		s.setItem('lernwerkstatt:diagnostic-draft', JSON.stringify({ answers: { a: 1, x: 2, b: 'no', c: [] }, index: 99, started: true }));
		expect(loadDraft(s, ids)).toEqual({ answers: { a: 1 }, index: 2, started: true });
		s.setItem('lernwerkstatt:diagnostic-draft', '{oops');
		expect(loadDraft(s, ids)).toEqual({ answers: {}, index: 0, started: false });
	});
	it('survives storage that throws or is missing', () => {
		const broken = {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			},
			removeItem: () => {
				throw new Error('blocked');
			}
		};
		expect(loadDraft(broken, ids).started).toBe(false);
		expect(() => saveDraft(broken, { answers: {}, index: 0, started: false })).not.toThrow();
		expect(loadDraft(null, ids).started).toBe(false);
		expect(isDone(broken)).toBe(false);
		expect(isDone(null)).toBe(false);
	});
});

describe('done flag', () => {
	it('is set by markDone', () => {
		const s = memory();
		expect(isDone(s)).toBe(false);
		markDone(s);
		expect(isDone(s)).toBe(true);
		expect(s.getItem(DONE_KEY)).not.toBeNull();
	});
});
