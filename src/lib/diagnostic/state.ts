import type { DiagnosticRequest } from '#lib/sync/api.ts';

export const DONE_KEY = 'lernwerkstatt:diagnostic-done';
export const DISMISSED_KEY = 'lernwerkstatt:diagnostic-dismissed';
export const DRAFT_KEY = 'lernwerkstatt:diagnostic-draft';

export type DiagnosticAnswer = number | number[];
export type Draft = { answers: Record<string, DiagnosticAnswer>; index: number; started: boolean };

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const emptyDraft = (): Draft => ({ answers: {}, index: 0, started: false });

function safe<T>(fallback: T, fn: () => T): T {
	try {
		return fn();
	} catch {
		return fallback;
	}
}

const isAnswer = (a: unknown): a is DiagnosticAnswer =>
	(Number.isInteger(a) && (a as number) >= 0) ||
	(Array.isArray(a) && a.length > 0 && a.every((n) => Number.isInteger(n) && n >= 0));

/** Reads the draft kept in sessionStorage; anything unreadable or not matching the known ids is dropped. */
export function loadDraft(store: Store | null, ids: string[]): Draft {
	return safe(emptyDraft(), () => {
		const raw = store?.getItem(DRAFT_KEY);
		if (!raw) return emptyDraft();
		const data = JSON.parse(raw) as Partial<Draft>;
		const answers: Record<string, DiagnosticAnswer> = {};
		for (const id of ids) {
			const a = data.answers?.[id];
			if (isAnswer(a)) answers[id] = a;
		}
		const index = Number.isInteger(data.index) ? Math.max(0, Math.min(ids.length - 1, data.index as number)) : 0;
		return { answers, index, started: data.started === true };
	});
}

export function saveDraft(store: Store | null, draft: Draft) {
	safe(undefined, () => store?.setItem(DRAFT_KEY, JSON.stringify(draft)));
}

export function clearDraft(store: Store | null) {
	safe(undefined, () => store?.removeItem(DRAFT_KEY));
}

/** Unanswered questions are omitted; the order follows the question order. */
export function toPayload(ids: string[], answers: Record<string, DiagnosticAnswer>): DiagnosticRequest {
	return {
		answers: ids.flatMap((id) => {
			const a = answers[id];
			if (a === undefined) return [];
			return [{ id, answer: Array.isArray(a) ? [...a].sort((x, y) => x - y) : a }];
		})
	};
}

export const isDone = (store: Store | null) => safe(false, () => store?.getItem(DONE_KEY) !== null && store !== null);
export const markDone = (store: Store | null) => safe(undefined, () => store?.setItem(DONE_KEY, new Date().toISOString()));
export const isDismissed = (store: Store | null) => safe(false, () => store?.getItem(DISMISSED_KEY) !== null && store !== null);
export const dismiss = (store: Store | null) => safe(undefined, () => store?.setItem(DISMISSED_KEY, '1'));

/** Storage that may be blocked (private mode): null instead of throwing. */
export const local = (): Store | null => safe(null, () => localStorage);
export const session = (): Store | null => safe(null, () => sessionStorage);
