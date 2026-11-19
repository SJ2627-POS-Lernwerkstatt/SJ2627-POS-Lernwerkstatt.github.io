import { describe, expect, it } from 'vitest';
import type { CurrentQuest } from '#lib/sync/api.ts';
import type { QuestItem } from './types.ts';
import { todaySuggestion } from './today.ts';

const item = (id: string, laptop = false): QuestItem => ({
	itemId: id,
	kind: 'unit',
	ref: id,
	title: id,
	minutes: 5,
	laptop,
	href: `/${id}`
});

function quest(done: string[], items: QuestItem[], catchUp: CurrentQuest['catchUp'] = []): CurrentQuest {
	return {
		quest: { week: '2026-W50', title: 'W', start: '2026-12-07', end: '2026-12-13', goal: 2, holiday: false, items },
		items: items.map((i) => ({ itemId: i.itemId, done: done.includes(i.itemId), doneAt: null, source: null, classDone: 0 })),
		myDone: done.length,
		goal: 2,
		goalMet: false,
		classTotal: 10,
		classGoalMet: 0,
		classGoal: null,
		catchUp
	};
}

describe('todaySuggestion', () => {
	it('is the first open item that does not need a laptop', () => {
		const q = quest(['a'], [item('a'), item('b', true), item('c')]);
		expect(todaySuggestion(q)?.item.itemId).toBe('c');
	});
	it('falls back to the first catch-up item', () => {
		const q = quest(['a'], [item('a'), item('b', true)], [{ ...item('old'), reason: 'open-from-week' }]);
		expect(todaySuggestion(q)).toMatchObject({ from: 'catchUp', item: { itemId: 'old' } });
	});
	it('is null when everything is done', () => {
		expect(todaySuggestion(quest(['a'], [item('a')]))).toBeNull();
	});
});
