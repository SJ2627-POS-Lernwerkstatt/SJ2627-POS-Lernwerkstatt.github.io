/**
 * In-browser fake of the student API (docs/api.md), used when PUBLIC_API_URL=mock.
 * Accepts the code 123456 (or any link token), computes done states from the local progress,
 * keeps manual marks in localStorage and invents class numbers. Only for development and e2e tests.
 */
import { resolve } from '$app/paths';
import { loadProgress } from '#lib/progress/storage.ts';
import { STORAGE_KEY, progressSchema, type Progress } from '#lib/progress/schema.ts';
import type { CatchUpItem, CurrentQuest, CurrentQuestItem, MeSummary } from './api.ts';
import type { Quest, QuestItem, QuestsFile } from '#lib/quests/types.ts';

export const MOCK_CODE = '123456';
const MOCK_STATE_KEY = 'lernwerkstatt:mock';
const MOCK_TOKEN = 'mock-token';

type MockState = { marks: Record<string, string>; serverProgress: Progress | null };

function readState(): MockState {
	try {
		const raw = localStorage.getItem(MOCK_STATE_KEY);
		if (raw) return { marks: {}, serverProgress: null, ...JSON.parse(raw) };
	} catch {
		// fall through
	}
	return { marks: {}, serverProgress: null };
}
const writeState = (s: MockState) => {
	try {
		localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(s));
	} catch {
		// ignore
	}
};

function localProgress(): Progress {
	try {
		return loadProgress(localStorage.getItem(STORAGE_KEY)).progress;
	} catch {
		return loadProgress(null).progress;
	}
}

const json = (status: number, body: unknown) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const noContent = () => new Response(null, { status: 204 });
const error = (status: number, error: string, message: string) => json(status, { error, message });

let questsCache: Promise<QuestsFile> | null = null;
function loadQuests(): Promise<QuestsFile> {
	questsCache ??= fetch(resolve('data/quests.json' as '/')).then((r) => r.json() as Promise<QuestsFile>);
	return questsCache;
}

const today = () => new Date().toISOString().slice(0, 10);

/** The quest of this week; without one (the school year has not started) the next, else the last. */
export function pickQuest(weeks: Quest[], date: string): Quest | null {
	return (
		weeks.find((q) => q.start <= date && date <= q.end) ??
		weeks.find((q) => q.start > date) ??
		weeks.at(-1) ??
		null
	);
}

const dayEnd = (end: string) => new Date(`${end}T23:59:59+01:00`).getTime();

/** doneAt of an item per the "When is a quest item done" table, or null. */
export function itemDoneAt(item: QuestItem, quest: Quest, p: Progress): string | null {
	const before = (iso?: string) => (iso && new Date(iso).getTime() <= dayEnd(quest.end) ? iso : null);
	const done = (iso?: string) => iso ?? null;
	switch (item.kind) {
		case 'unit':
		case 'theory':
			return done(p.units[item.ref]?.readAt);
		case 'puzzle':
			return done(p.puzzles[item.ref]?.solvedAt);
		case 'group': {
			const g = p.groups[item.ref];
			return g && g.box >= 2 ? g.lastAt : null;
		}
		case 'review':
			return (
				p.runs.find((r) => r.scope === item.ref && r.at.slice(0, 10) >= quest.start && before(r.at) !== null)?.at ?? null
			);
		case 'exercise':
			return done(p.exercises[item.ref]?.submittedAt);
	}
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const CLASS_TOTAL = 24;

function buildQuest(quests: QuestsFile, state: MockState, p: Progress): CurrentQuest {
	const quest = pickQuest(quests.weeks, today());
	if (!quest) {
		return {
			quest: null,
			items: [],
			myDone: 0,
			goal: 0,
			goalMet: false,
			classTotal: CLASS_TOTAL,
			classGoalMet: 0,
			classGoal: null,
			catchUp: []
		};
	}
	const items: CurrentQuestItem[] = quest.items.map((it) => {
		const auto = itemDoneAt(it, quest, p);
		const mark = state.marks[it.itemId] ?? null;
		const doneAt = auto ?? mark;
		return {
			itemId: it.itemId,
			done: doneAt !== null,
			doneAt,
			source: auto ? 'auto' : mark ? 'mark' : null,
			classDone: 4 + (hash(it.itemId) % (CLASS_TOTAL - 8))
		};
	});
	const myDone = items.filter((i) => i.done).length;
	const catchUp: CatchUpItem[] = [];
	for (const w of quests.weeks) {
		if (w.end >= quest.start) break;
		for (const it of w.items) {
			if (!it.laptop && !itemDoneAt(it, w, p) && !state.marks[it.itemId]) {
				catchUp.push({ ...it, reason: 'open-from-week', fromWeek: w.week });
			}
		}
	}
	return {
		quest,
		items,
		myDone,
		goal: quest.goal,
		goalMet: myDone >= quest.goal,
		classTotal: CLASS_TOTAL,
		classGoalMet: 9,
		classGoal: quest.classGoal ? { ...quest.classGoal, weeksInRow: 1 } : null,
		catchUp: catchUp.slice(-5)
	};
}

const RANKS = ['Bean-Bastler:in', 'Getter-Setter:in', 'Entity-Entdecker:in', 'Query-Künstler:in', 'Matura-Meister:in'];
const XP_PER_LEVEL = 100;

function buildSummary(p: Progress, state: MockState): MeSummary {
	const xp =
		Object.keys(p.units).length * 20 +
		Object.values(p.puzzles).filter((x) => x.solvedAt).length * 15 +
		Object.keys(state.marks).length * 10;
	const level = Math.floor(xp / XP_PER_LEVEL) + 1;
	return {
		xp,
		level,
		rank: RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 2))],
		levelStartXp: (level - 1) * XP_PER_LEVEL,
		nextLevelXp: level * XP_PER_LEVEL,
		streak: { weeks: 2, jokersLeft: 1, currentWeekMet: false }
	};
}

/** Newer timestamp per entry wins; good enough for a fake. */
function mergeProgress(a: Progress, b: Progress): Progress {
	const merged: Progress = { ...a, ...b, units: { ...a.units, ...b.units } };
	merged.puzzles = { ...a.puzzles, ...b.puzzles };
	merged.exercises = { ...a.exercises, ...b.exercises };
	merged.groups = { ...a.groups, ...b.groups };
	return merged;
}

/** Same signature as fetch; the "base URL" is the literal "mock", so paths look like "mock/auth/redeem". */
export async function mockFetch(url: string, init: RequestInit = {}): Promise<Response> {
	await new Promise((r) => setTimeout(r, 30));
	const path = url.replace(/^mock/, '');
	const method = (init.method ?? 'GET').toUpperCase();
	const body = init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
	const authed = new Headers(init.headers).get('Authorization') === `Bearer ${MOCK_TOKEN}`;
	const student = { id: 'mock-student', displayName: 'Mock-Schüler:in' };

	if (method === 'POST' && path === '/auth/request') return json(202, { ok: true });
	if (method === 'POST' && path === '/auth/redeem') {
		if ('token' in body || body.code === MOCK_CODE) return json(200, { token: MOCK_TOKEN, student });
		if (body.code === '000000') return error(403, 'LOCKED', 'Dein Zugang ist gesperrt.');
		if (body.code === '999999') return error(429, 'RATE_LIMIT', 'Zu viele Versuche. Warte ein paar Minuten.');
		return error(401, 'INVALID', 'Der Code stimmt nicht oder ist abgelaufen.');
	}
	if (!authed) return error(401, 'UNAUTHORIZED', 'Bitte melde dich neu an.');

	const state = readState();
	if (method === 'POST' && path === '/auth/logout') return noContent();
	if (method === 'GET' && path === '/auth/me') return json(200, student);
	if (path === '/progress') {
		if (method === 'GET') return json(200, { progress: state.serverProgress, updatedAt: null });
		const parsed = progressSchema.safeParse((body as { progress?: unknown }).progress);
		if (!parsed.success) return error(400, 'BAD_REQUEST', 'Ungültiger Fortschritt.');
		const merged = state.serverProgress ? mergeProgress(state.serverProgress, parsed.data) : parsed.data;
		writeState({ ...state, serverProgress: merged });
		return json(200, { progress: merged, updatedAt: new Date().toISOString() });
	}
	if (method === 'GET' && path === '/me/summary') return json(200, buildSummary(localProgress(), state));
	if (method === 'GET' && path === '/quest/current') {
		return json(200, buildQuest(await loadQuests(), state, localProgress()));
	}
	if (method === 'POST' && path === '/quest/marks') {
		state.marks[String(body.itemId)] = new Date().toISOString();
		writeState(state);
		return noContent();
	}
	if (method === 'DELETE' && path.startsWith('/quest/marks/')) {
		delete state.marks[decodeURIComponent(path.slice('/quest/marks/'.length))];
		writeState(state);
		return noContent();
	}
	if (method === 'POST' && path === '/diagnostic') return noContent();
	return error(404, 'NOT_FOUND', 'Unbekannte Route.');
}
