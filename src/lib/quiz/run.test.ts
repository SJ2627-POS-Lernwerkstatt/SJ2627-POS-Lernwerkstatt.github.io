import { describe, expect, it } from 'vitest';
import type { GroupProgress } from '#lib/progress/schema.js';
import { resumeRun, scoreGroup, scoreRun, selectGroups, startRun, updateGroupProgress, type CurrentRun } from './run.ts';
import type { GroupView, QuestionView } from './types.ts';

const q = (answer: number): QuestionView => ({
	kind: 'single',
	promptHtml: 'p',
	explanationHtml: 'e',
	optionsHtml: ['a', 'b', 'c'],
	answer
});
const group = (id: string, followUps = 0): GroupView => ({
	id,
	unit: 'testing/aufbau',
	main: q(0),
	followUps: Array.from({ length: followUps }, () => q(1))
});
const pick = (choice: number) => ({ kind: 'single' as const, choice });
const stat = (box: number, lastAt: string): GroupProgress => ({ box, lastAt, runs: 1, wrong: 0 });
const noRandom = () => 0.5;
const NOW = new Date('2026-11-10T10:00:00.000Z');

describe('selectGroups', () => {
	it('takes failed groups first, then new ones, then the longest ago', () => {
		const stats = {
			old: stat(3, '2026-11-01T00:00:00.000Z'),
			recent: stat(2, '2026-11-09T00:00:00.000Z'),
			failed: stat(1, '2026-11-09T00:00:00.000Z')
		};
		const ids = ['recent', 'old', 'new', 'failed'];
		expect(selectGroups(ids, stats, 10, noRandom)).toEqual(['failed', 'new', 'old', 'recent']);
		expect(selectGroups(ids, stats, 2, noRandom)).toEqual(['failed', 'new']);
	});

	it('picks at most the run size', () => {
		const ids = Array.from({ length: 25 }, (_, i) => `g${i}`);
		const chosen = selectGroups(ids, {});
		expect(chosen).toHaveLength(10);
		expect(new Set(chosen).size).toBe(10);
	});
});

describe('startRun / resumeRun', () => {
	const groups = [group('a'), group('b')];

	it('starts at the first group, or not at all without questions', () => {
		const run = startRun('testing', groups, {}, NOW, noRandom)!;
		expect(run).toMatchObject({ scope: 'testing', index: 0, answers: {}, startedAt: NOW.toISOString() });
		expect(run.groupIds.sort()).toEqual(['a', 'b']);
		expect(startRun('testing', [], {}, NOW)).toBeNull();
	});

	it('resumes a stored run and drops groups that no longer exist', () => {
		const stored: CurrentRun = { scope: 'testing', startedAt: NOW.toISOString(), groupIds: ['a', 'gone', 'b'], index: 2, answers: {} };
		expect(resumeRun(stored, 'testing', groups)).toMatchObject({ groupIds: ['a', 'b'], index: 1 });
	});

	it('rejects broken runs, other scopes and runs without known groups', () => {
		const stored = { scope: 'testing', startedAt: NOW.toISOString(), groupIds: ['gone'], index: 0, answers: {} };
		expect(resumeRun(stored, 'testing', groups)).toBeNull();
		expect(resumeRun({ ...stored, groupIds: ['a'] }, 'jpa', groups)).toBeNull();
		expect(resumeRun({ foo: 1 }, 'testing', groups)).toBeNull();
		expect(resumeRun(undefined, 'testing', groups)).toBeNull();
	});
});

describe('scoring', () => {
	const g = group('a', 2);

	it('counts follow-ups only when the main question is right', () => {
		expect(scoreGroup(g, [pick(0), pick(1), pick(1)])).toMatchObject({ correct: [true, true, true], allCorrect: true });
		expect(scoreGroup(g, [pick(2), pick(1), pick(1)])).toMatchObject({
			correct: [false, false, false],
			mainCorrect: false,
			allCorrect: false
		});
		expect(scoreGroup(g, [pick(0), pick(1)]).correct).toEqual([true, true, false]);
		expect(scoreGroup(g, undefined).correct).toEqual([false, false, false]);
	});

	it('adds up a run over all questions', () => {
		const run: CurrentRun = {
			scope: 'testing',
			startedAt: NOW.toISOString(),
			groupIds: ['a', 'b'],
			index: 1,
			answers: { a: [pick(0), pick(1), pick(0)], b: [pick(0)] }
		};
		expect(scoreRun(run, [g, group('b')])).toMatchObject({ correct: 3, total: 4 });
	});
});

describe('updateGroupProgress', () => {
	it('moves up one box when fully correct, up to 4', () => {
		expect(updateGroupProgress(undefined, true, NOW)).toEqual({ box: 2, lastAt: NOW.toISOString(), runs: 1, wrong: 0 });
		expect(updateGroupProgress(stat(3, 'x'), true, NOW).box).toBe(4);
		expect(updateGroupProgress(stat(4, 'x'), true, NOW).box).toBe(4);
	});

	it('goes back to box 1 when anything is wrong', () => {
		expect(updateGroupProgress(stat(4, 'x'), false, NOW)).toMatchObject({ box: 1, runs: 2, wrong: 1 });
		expect(updateGroupProgress(undefined, false, NOW)).toMatchObject({ box: 1, runs: 1, wrong: 1 });
	});
});
