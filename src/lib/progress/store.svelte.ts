import { browser } from '$app/env';
import { BROKEN_KEY, emptyProgress, STORAGE_KEY, type Progress } from './schema.ts';
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
	}

	isRead(unitId: string): boolean {
		return unitId in this.data.units;
	}

	setRead(unitId: string, read: boolean) {
		if (read) this.data.units[unitId] = { readAt: new Date().toISOString() };
		else delete this.data.units[unitId];
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
