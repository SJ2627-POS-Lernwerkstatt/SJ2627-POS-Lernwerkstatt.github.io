import type {
	ApiErrorBody,
	CurrentQuest,
	MeSummary,
	ProgressResponse,
	PutProgressResponse,
	RedeemRequest,
	RedeemResponse,
	Student
} from './api.ts';
import type { Progress } from './api.ts';

export class ApiError extends Error {
	constructor(
		readonly status: number,
		/** Machine code from the server, or "NETWORK" / "BAD_RESPONSE". */
		readonly code: string,
		message: string
	) {
		super(message);
	}
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type ClientOptions = {
	baseUrl: string;
	fetch: FetchLike;
	getToken: () => string | null;
	/** Called on 401 for routes that send a token. The client does not retry. */
	onUnauthorized: () => void;
};

type Options = { body?: unknown; keepalive?: boolean; auth?: boolean };

/** Fallback texts if the server sends no German message. */
const FALLBACK: Record<number, string> = {
	401: 'Das hat nicht geklappt. Prüfe deine Eingabe oder fordere einen neuen Code an.',
	403: 'Dein Zugang ist gesperrt. Melde dich bei deiner Lehrkraft.',
	429: 'Zu viele Versuche. Warte ein paar Minuten und versuche es dann noch einmal.'
};

export function createClient(opts: ClientOptions) {
	async function request<T>(method: string, path: string, o: Options = {}): Promise<T> {
		const auth = o.auth ?? true;
		const headers: Record<string, string> = {};
		const token = auth ? opts.getToken() : null;
		if (auth && !token) {
			opts.onUnauthorized();
			throw new ApiError(401, 'UNAUTHORIZED', 'Bitte melde dich neu an.');
		}
		if (token) headers.Authorization = `Bearer ${token}`;
		let body: string | undefined;
		if (o.body !== undefined) {
			headers['Content-Type'] = 'application/json';
			body = JSON.stringify(o.body);
		}
		let res: Response;
		try {
			res = await opts.fetch(opts.baseUrl + path, { method, headers, body, keepalive: o.keepalive });
		} catch {
			throw new ApiError(0, 'NETWORK', 'Keine Verbindung zum Server.');
		}
		if (res.status === 401 && auth) opts.onUnauthorized();
		if (!res.ok) {
			let err: Partial<ApiErrorBody> = {};
			try {
				err = (await res.json()) as Partial<ApiErrorBody>;
			} catch {
				// no JSON body
			}
			throw new ApiError(
				res.status,
				err.error ?? 'ERROR',
				err.message ?? FALLBACK[res.status] ?? 'Der Server hat einen Fehler gemeldet. Versuche es später noch einmal.'
			);
		}
		if (res.status === 204) return undefined as T;
		try {
			return (await res.json()) as T;
		} catch {
			throw new ApiError(res.status, 'BAD_RESPONSE', 'Die Antwort des Servers war nicht lesbar.');
		}
	}

	return {
		requestCode: (email: string) => request<{ ok: true }>('POST', '/auth/request', { body: { email }, auth: false }),
		redeem: (body: RedeemRequest) => request<RedeemResponse>('POST', '/auth/redeem', { body, auth: false }),
		logout: () => request<void>('POST', '/auth/logout'),
		me: () => request<Student>('GET', '/auth/me'),
		getProgress: () => request<ProgressResponse>('GET', '/progress'),
		putProgress: (progress: Progress, keepalive = false) =>
			request<PutProgressResponse>('PUT', '/progress', { body: { progress }, keepalive }),
		summary: () => request<MeSummary>('GET', '/me/summary'),
		currentQuest: () => request<CurrentQuest>('GET', '/quest/current'),
		mark: (itemId: string) => request<void>('POST', '/quest/marks', { body: { itemId } }),
		unmark: (itemId: string) => request<void>('DELETE', `/quest/marks/${encodeURIComponent(itemId)}`)
	};
}

export type ApiClient = ReturnType<typeof createClient>;
