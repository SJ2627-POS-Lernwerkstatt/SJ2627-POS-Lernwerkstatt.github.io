import { browser } from '$app/env';
import { API_URL, SYNC_ENABLED } from './config.ts';
import type { Student } from './api.ts';
import { createClient, type FetchLike } from './client.ts';

export const SESSION_KEY = 'lernwerkstatt:session';

type Stored = { token: string; student: Student };

function read(): Stored | null {
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw) as Partial<Stored>;
		return typeof data.token === 'string' && data.student ? (data as Stored) : null;
	} catch {
		return null;
	}
}

function write(value: Stored | null) {
	try {
		if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
		else localStorage.removeItem(SESSION_KEY);
	} catch {
		// private mode: the login lasts until the tab closes
	}
}

class Session {
	enabled = SYNC_ENABLED;
	/** True once the stored token has been read (after hydration). */
	loaded = $state(false);
	token = $state<string | null>(null);
	student = $state<Student | null>(null);
	/** Set after a 401: the UI says "Bitte melde dich neu an". */
	expired = $state(false);

	get loggedIn() {
		return this.token !== null;
	}

	init() {
		if (!browser || this.loaded || !this.enabled) return;
		const stored = read();
		this.token = stored?.token ?? null;
		this.student = stored?.student ?? null;
		this.loaded = true;
		addEventListener('storage', (e) => {
			if (e.key !== SESSION_KEY) return;
			const s = read();
			this.token = s?.token ?? null;
			this.student = s?.student ?? null;
		});
	}

	login(token: string, student: Student) {
		this.token = token;
		this.student = student;
		this.expired = false;
		write({ token, student });
	}

	/** Drops the token. `expired`: the server said 401. Local progress is kept. */
	clear(expired = false) {
		this.token = null;
		this.student = null;
		this.expired = expired;
		write(null);
	}
}

export const session = new Session();

async function pickFetch(): Promise<FetchLike> {
	// A compile-time constant: a real build drops the mock chunk.
	if (__API_MOCK__) return (await import('./mock.ts')).mockFetch;
	return (url, init) => fetch(url, init);
}

/** The fetch is chosen lazily so the mock never loads in a real build. */
const lazyFetch: FetchLike = async (url, init) => (await pickFetch())(url, init);

export const api = createClient({
	baseUrl: API_URL,
	fetch: lazyFetch,
	getToken: () => session.token,
	onUnauthorized: () => {
		if (session.token !== null) session.clear(true);
	}
});
