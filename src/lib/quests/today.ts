import type { CatchUpItem, CurrentQuest } from '#lib/sync/api.ts';
import type { QuestItem } from './types.ts';

export type Suggestion = { item: QuestItem | CatchUpItem; from: 'quest' | 'catchUp' };

/** Exactly one thing for today: the first open quest item without laptop, else the first catch-up item, else nothing. */
export function todaySuggestion(q: CurrentQuest): Suggestion | null {
	const done = new Set(q.items.filter((i) => i.done).map((i) => i.itemId));
	const open = q.quest?.items.find((i) => !done.has(i.itemId) && !i.laptop);
	if (open) return { item: open, from: 'quest' };
	const catchUp = q.catchUp[0];
	return catchUp ? { item: catchUp, from: 'catchUp' } : null;
}
