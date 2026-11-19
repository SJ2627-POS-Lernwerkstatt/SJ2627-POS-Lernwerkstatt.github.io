import { browser } from '$app/env';
import { progress } from '#lib/progress/store.svelte.js';
import { createSyncAdapter, type SyncStatus } from './adapter.ts';
import { api, session } from './session.svelte.ts';

class SyncState {
	status = $state<SyncStatus>('idle');
}
export const syncState = new SyncState();

const adapter = createSyncAdapter({
	put: (doc, keepalive) => api.putProgress(doc, keepalive),
	read: () => progress.snapshot(),
	adopt: (p) => progress.adopt(p),
	onStatus: (s) => (syncState.status = s)
});

let wired = false;

/**
 * Call once from the root layout (onMount). Reads the session and, while someone is logged in,
 * keeps the progress in sync with the server.
 */
export function startSync() {
	if (!browser || !session.enabled || wired) return;
	wired = true;
	session.init();
	progress.onChange = () => adapter.notifyChange();
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') adapter.hidden();
	});
	addEventListener('pagehide', () => adapter.hidden());
	addEventListener('online', () => adapter.online());

	let active = false;
	$effect.root(() => {
		$effect(() => {
			if (!progress.loaded || !session.loaded) return;
			if (session.loggedIn && !active) {
				active = true;
				void adapter.start();
			} else if (!session.loggedIn && active) {
				active = false;
				adapter.stop();
			}
		});
	});
}

/** Push what is pending (e.g. before logging out). Never throws. */
export async function flushSync() {
	try {
		await adapter.flush();
	} catch {
		// stays local
	}
}

export async function logout() {
	await flushSync();
	try {
		await api.logout();
	} catch {
		// the token is dropped locally either way
	}
	session.clear();
}
