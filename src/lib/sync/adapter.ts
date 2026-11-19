import type { Progress } from './api.ts';
import { ApiError } from './client.ts';

export const DEBOUNCE_MS = 5_000;
export const RETRY_MS = 30_000;
/** Browsers cap the body of a keepalive request at 64 KB. */
const KEEPALIVE_MAX = 60_000;

export type SyncStatus = 'idle' | 'dirty' | 'syncing' | 'error';

export type SyncDeps = {
	/** Pushes the local document; resolves to the merged document. */
	put: (progress: Progress, keepalive: boolean) => Promise<{ progress: Progress }>;
	/** The current local document (plain object). */
	read: () => Progress;
	/** Replaces the local document with the merged one (must not report a change). */
	adopt: (progress: Progress) => void;
	setTimer?: (fn: () => void, ms: number) => unknown;
	clearTimer?: (id: unknown) => void;
	onStatus?: (status: SyncStatus) => void;
};

/**
 * Keeps the server copy of the progress up to date. localStorage stays the source of truth: a failed
 * PUT only schedules another try, and the merged answer is adopted only if nothing changed meanwhile.
 */
export function createSyncAdapter(deps: SyncDeps) {
	const setTimer = deps.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
	const clearTimer = deps.clearTimer ?? ((id) => clearTimeout(id as ReturnType<typeof setTimeout>));
	let timer: unknown = null;
	let version = 0; // bumped on every local change
	let syncedVersion = -1; // version the server has acknowledged
	let inFlight: Promise<void> | null = null;
	let stopped = true;
	let status: SyncStatus = 'idle';

	function setStatus(s: SyncStatus) {
		status = s;
		deps.onStatus?.(s);
	}

	function schedule(ms: number) {
		if (stopped) return;
		if (timer !== null) clearTimer(timer);
		timer = setTimer(() => {
			timer = null;
			void flush();
		}, ms);
	}

	function cancelTimer() {
		if (timer !== null) clearTimer(timer);
		timer = null;
	}

	/** Pushes now. With `keepalive` (page is being hidden) the request survives the page. */
	function flush(keepalive = false): Promise<void> {
		if (stopped) return Promise.resolve();
		if (inFlight) {
			// Whatever changed while a PUT is on its way goes out right after it.
			return inFlight.then(() => (syncedVersion === version ? undefined : flush(keepalive)));
		}
		cancelTimer();
		const sent = version;
		const doc = deps.read();
		const useKeepalive = keepalive && JSON.stringify(doc).length < KEEPALIVE_MAX;
		setStatus('syncing');
		inFlight = deps
			.put(doc, useKeepalive)
			.then((res) => {
				syncedVersion = sent;
				if (version === sent) {
					deps.adopt(res.progress);
					setStatus('idle');
				} else {
					// The student kept working; the next PUT carries the newer state.
					setStatus('dirty');
					schedule(DEBOUNCE_MS);
				}
			})
			.catch((e: unknown) => {
				if (e instanceof ApiError && e.status === 401) {
					stopped = true; // logged out; the session handles the rest
					setStatus('idle');
					return;
				}
				setStatus('error');
				schedule(RETRY_MS);
			})
			.finally(() => {
				inFlight = null;
			});
		return inFlight;
	}

	return {
		get status() {
			return status;
		},
		/** Start syncing (after login or on app start) and push the local document once. */
		start(): Promise<void> {
			stopped = false;
			version++;
			return flush();
		},
		stop() {
			stopped = true;
			cancelTimer();
		},
		/** A local change happened: push in 5 s unless something newer replaces the timer. */
		notifyChange() {
			if (stopped) return;
			version++;
			setStatus('dirty');
			schedule(DEBOUNCE_MS);
		},
		flush,
		/** The page goes to the background: push immediately, if there is something to push. */
		hidden() {
			if (stopped || (syncedVersion === version && status !== 'error')) return;
			void flush(true);
		},
		/** The network is back. */
		online() {
			if (stopped || (syncedVersion === version && status !== 'error')) return;
			void flush();
		}
	};
}

export type SyncAdapter = ReturnType<typeof createSyncAdapter>;
