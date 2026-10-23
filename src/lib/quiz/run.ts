import { z } from 'zod';
import type { GroupProgress } from '#lib/progress/schema.js';
import { isCorrect } from './answer.ts';
import { shuffled } from './shuffle.ts';
import type { Answer, GroupView } from './types.ts';

export const RUN_SIZE = 10;

const answerSchema = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('single'), choice: z.int().min(0).nullable() }),
	z.object({ kind: z.literal('multi'), choices: z.array(z.int().min(0)) }),
	z.object({ kind: z.literal('template'), gaps: z.record(z.string(), z.array(z.string())) })
]);

/** A run in progress, stored in progress.currentRun so it survives a reload. */
export const currentRunSchema = z.object({
	/** Module slug or "alle". */
	scope: z.string(),
	startedAt: z.iso.datetime(),
	groupIds: z.array(z.string()).min(1),
	/** Index of the group on screen. */
	index: z.int().min(0),
	/** Per group: answers for main question and follow-ups, in that order. */
	answers: z.record(z.string(), z.array(answerSchema))
});
export type CurrentRun = z.infer<typeof currentRunSchema>;

/**
 * Picks the groups for a run:
 * 1. groups answered wrong last time (box 1),
 * 2. groups never seen,
 * 3. the rest, longest ago first.
 * Random among equals.
 */
export function selectGroups(
	ids: string[],
	stats: Record<string, GroupProgress>,
	size = RUN_SIZE,
	random: () => number = Math.random
): string[] {
	const failed = shuffled(ids.filter((id) => stats[id]?.box === 1), random);
	const fresh = shuffled(ids.filter((id) => !stats[id] || stats[id].box === 0), random);
	const known = shuffled(ids.filter((id) => (stats[id]?.box ?? 0) >= 2), random).sort((a, b) =>
		stats[a]!.lastAt.localeCompare(stats[b]!.lastAt)
	);
	return [...failed, ...fresh, ...known].slice(0, size);
}

/** Starts a run, or returns null if the scope has no questions. */
export function startRun(
	scope: string,
	groups: GroupView[],
	stats: Record<string, GroupProgress>,
	now: Date,
	random: () => number = Math.random
): CurrentRun | null {
	const groupIds = selectGroups(
		groups.map((g) => g.id),
		stats,
		RUN_SIZE,
		random
	);
	if (groupIds.length === 0) return null;
	return { scope, startedAt: now.toISOString(), groupIds, index: 0, answers: {} };
}

/**
 * Validates a stored run against the current content. Groups that no longer exist are dropped;
 * returns null if the run is unusable (other scope, broken, or no groups left).
 */
export function resumeRun(stored: unknown, scope: string, groups: GroupView[]): CurrentRun | null {
	const parsed = currentRunSchema.safeParse(stored);
	if (!parsed.success || parsed.data.scope !== scope) return null;
	const known = new Set(groups.map((g) => g.id));
	const groupIds = parsed.data.groupIds.filter((id) => known.has(id));
	if (groupIds.length === 0) return null;
	return { ...parsed.data, groupIds, index: Math.min(parsed.data.index, groupIds.length - 1) };
}

export type GroupResult = {
	groupId: string;
	/** Correct per question: main first, then follow-ups. Follow-ups only count if the main question is right. */
	correct: boolean[];
	mainCorrect: boolean;
	allCorrect: boolean;
};

export function scoreGroup(group: GroupView, answers: Answer[] | undefined): GroupResult {
	const questions = [group.main, ...group.followUps];
	const raw = questions.map((q, i) => {
		const a = answers?.[i];
		return a !== undefined && isCorrect(q, a);
	});
	const mainCorrect = raw[0]!;
	const correct = raw.map((ok, i) => (i === 0 ? ok : mainCorrect && ok));
	return { groupId: group.id, correct, mainCorrect, allCorrect: correct.every(Boolean) };
}

export type RunScore = { results: GroupResult[]; correct: number; total: number };

export function scoreRun(run: CurrentRun, groups: GroupView[]): RunScore {
	const byId = new Map(groups.map((g) => [g.id, g]));
	const results = run.groupIds.flatMap((id) => {
		const g = byId.get(id);
		return g ? [scoreGroup(g, run.answers[id])] : [];
	});
	const flat = results.flatMap((r) => r.correct);
	return { results, correct: flat.filter(Boolean).length, total: flat.length };
}

/** Leitner update: fully correct moves one box up (max 4), anything wrong goes back to box 1. */
export function updateGroupProgress(prev: GroupProgress | undefined, allCorrect: boolean, now: Date): GroupProgress {
	const box = allCorrect ? Math.min(4, Math.max(prev?.box ?? 0, 1) + 1) : 1;
	return {
		box,
		lastAt: now.toISOString(),
		runs: (prev?.runs ?? 0) + 1,
		wrong: (prev?.wrong ?? 0) + (allCorrect ? 0 : 1)
	};
}
