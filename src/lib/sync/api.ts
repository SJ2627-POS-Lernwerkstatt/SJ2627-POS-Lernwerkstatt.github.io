/**
 * API types of the student side, copied from docs/api.md of the Advent-of-Matura backend
 * (`shared/src/api.ts`). Keep in sync with the contract.
 */
import type { Quest, QuestItem } from '#lib/quests/types.js';
import type { Progress } from '#lib/progress/schema.js';

export type { Progress, Quest, QuestItem };

export type ApiErrorBody = { error: string; message: string };

export type Student = { id: string; displayName: string };

export type RedeemRequest = { email: string; code: string } | { token: string };
export type RedeemResponse = { token: string; student: Student };

export type ProgressResponse = { progress: Progress | null; updatedAt: string | null };
export type PutProgressResponse = { progress: Progress; updatedAt: string };

export type MeSummary = {
	xp: number;
	/** 1-based. */
	level: number;
	/** e.g. "Bean-Bastler:in". */
	rank: string;
	/** XP at which the current level began. */
	levelStartXp: number;
	/** null at max level. */
	nextLevelXp: number | null;
	streak: { weeks: number; jokersLeft: number; currentWeekMet: boolean };
};

export type CurrentQuestItem = {
	itemId: string;
	done: boolean;
	/** ISO. */
	doneAt: string | null;
	source: 'auto' | 'mark' | null;
	/** How many active students have this item done (anonymous). */
	classDone: number;
};

export type CatchUpItem = QuestItem & { reason: 'due-review' | 'open-from-week'; fromWeek?: string };

export type CurrentQuest = {
	/** null when no quest file covers this week. */
	quest: Quest | null;
	items: CurrentQuestItem[];
	myDone: number;
	goal: number;
	goalMet: boolean;
	/** Active students. */
	classTotal: number;
	/** Students who reached the goal this week (anonymous). */
	classGoalMet: number;
	classGoal: { weeks: number; minStudents: number; reward: string; weeksInRow: number } | null;
	/** Max 5. */
	catchUp: CatchUpItem[];
};

export type DiagnosticRequest = { answers: { id: string; answer: number | number[] }[] };
