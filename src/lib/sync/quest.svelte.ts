import { api } from './session.svelte.ts';
import type { CurrentQuest, MeSummary } from './api.ts';
import { ApiError } from './client.ts';
import { flushSync } from './runtime.svelte.ts';

/** State of /woche and /heute: the current quest and the student's summary, loaded from the API. */
class QuestState {
	quest = $state<CurrentQuest | null>(null);
	summary = $state<MeSummary | null>(null);
	loading = $state(false);
	error = $state('');

	async load() {
		this.loading = true;
		try {
			// The server computes "done" from the progress it has, so hand over what happened since the last sync.
			await flushSync();
			const [quest, summary] = await Promise.all([api.currentQuest(), api.summary()]);
			this.quest = quest;
			this.summary = summary;
			this.error = '';
		} catch (e) {
			// A 401 is handled by the session (it shows the login prompt); everything else is a hint.
			if (!(e instanceof ApiError && e.status === 401)) {
				this.error = e instanceof ApiError ? e.message : 'Das hat nicht geklappt.';
			}
		} finally {
			this.loading = false;
		}
	}

	async setMark(itemId: string, on: boolean) {
		try {
			if (on) await api.mark(itemId);
			else await api.unmark(itemId);
			await this.load();
		} catch (e) {
			if (!(e instanceof ApiError && e.status === 401)) {
				this.error = e instanceof ApiError ? e.message : 'Das hat nicht geklappt.';
			}
		}
	}
}

export const questState = new QuestState();
