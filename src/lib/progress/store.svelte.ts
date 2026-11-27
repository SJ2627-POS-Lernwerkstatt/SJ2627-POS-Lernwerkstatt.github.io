import { browser } from '$app/env';
import type { CurrentRun, GroupResult } from '#lib/quiz/run.js';
import type { Lang } from '#lib/lang.js';
import type { Theme } from '#lib/theme.js';
import { updateGroupProgress } from '#lib/quiz/run.js';
import { updateExercise } from './exercises.ts';
import { BROKEN_KEY, emptyProgress, MAX_RUNS, STORAGE_KEY, type Progress } from './schema.ts';
import { loadProgress, serialize } from './storage.ts';

/** localStorage can throw (private mode, blocked site data). Progress then lives only in memory. */
function safeGet(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function safeSet(key: string, value: string): boolean {
	try {
		localStorage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

class ProgressStore {
	data = $state<Progress>(emptyProgress());
	/** True once the stored progress has been read (after hydration). */
	loaded = $state(false);
	/** Called after every local change (not after adopting a server copy). Used by the login sync. */
	onChange: (() => void) | null = null;
	/** False if the browser refuses to store data; the UI warns that progress will be lost. */
	persistent = $state(true);

	/** Call once in the root layout's onMount, so prerendered markup hydrates with empty progress first. */
	init() {
		if (!browser || this.loaded) return;
		this.#read();
		this.loaded = true;
		// Keep several open tabs in sync.
		addEventListener('storage', (e) => {
			if (e.key === STORAGE_KEY) this.#read();
		});
	}

	#read() {
		const { progress, broken } = loadProgress(safeGet(STORAGE_KEY));
		if (broken !== undefined && safeGet(BROKEN_KEY) === null) safeSet(BROKEN_KEY, broken);
		this.data = progress;
	}

	save() {
		this.persistent = safeSet(STORAGE_KEY, serialize($state.snapshot(this.data) as Progress));
		this.onChange?.();
	}

	/** Takes over the merged document from the server. Stores it, but does not count as a local change. */
	adopt(progress: Progress) {
		this.data = progress;
		this.persistent = safeSet(STORAGE_KEY, serialize(progress));
	}

	snapshot(): Progress {
		return $state.snapshot(this.data) as Progress;
	}

	isRead(unitId: string): boolean {
		return unitId in this.data.units;
	}

	setRead(unitId: string, read: boolean) {
		if (read) this.data.units[unitId] = { readAt: new Date().toISOString() };
		else delete this.data.units[unitId];
		this.save();
	}

	/** "abgegeben" and the self-rating (Austrian grade, 1 = Sehr gut … 4 = Genügend; null clears it). */
	updateExercise(exerciseId: string, change: Parameters<typeof updateExercise>[1]) {
		const entry = updateExercise(this.data.exercises[exerciseId], change);
		if (entry) this.data.exercises[exerciseId] = entry;
		else delete this.data.exercises[exerciseId];
		this.save();
	}

	isSolved(puzzleId: string): boolean {
		return Boolean(this.data.puzzles[puzzleId]?.solvedAt);
	}

	/** One press of "Prüfen". The first correct answer marks the puzzle as solved for good. */
	recordPuzzle(puzzleId: string, correct: boolean, now = new Date()) {
		const entry = this.data.puzzles[puzzleId] ?? { tries: 0 };
		this.data.puzzles[puzzleId] = {
			tries: entry.tries + 1,
			solvedAt: entry.solvedAt ?? (correct ? now.toISOString() : undefined)
		};
		this.save();
	}

	setTheme(theme: Theme) {
		this.data.settings.theme = theme;
		this.save();
	}

	setLang(lang: Lang) {
		this.data.settings.lang = lang;
		this.save();
	}

	setCurrentRun(run: CurrentRun | undefined) {
		this.data.currentRun = run;
		this.save();
	}

	/** Stores a finished run: repetition boxes per group, the score in the history, and clears the current run. */
	finishRun(scope: string, results: GroupResult[], correct: number, total: number, now = new Date()) {
		for (const r of results) {
			this.data.groups[r.groupId] = updateGroupProgress(this.data.groups[r.groupId], r.allCorrect, now);
		}
		this.data.runs = [...this.data.runs, { scope, at: now.toISOString(), correct, total }].slice(-MAX_RUNS);
		this.data.currentRun = undefined;
		this.save();
	}

	replace(progress: Progress) {
		this.data = progress;
		this.save();
	}

	reset() {
		this.replace(emptyProgress());
	}

	exportText(): string {
		return JSON.stringify($state.snapshot(this.data), null, 2);
	}
}

export const progress = new ProgressStore();
