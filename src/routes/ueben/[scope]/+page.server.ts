import { error } from '@sveltejs/kit';
import { content, groupsOf } from '#lib/server/content/index.js';
import { groupView } from '#lib/server/content/views.js';
import { ALL, isPracticeScope, PRACTICE_MODULES, scopeTitle } from '#lib/quiz/scopes.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => [ALL, ...PRACTICE_MODULES.map((m) => m.slug)].map((scope) => ({ scope }));

export const load: PageServerLoad = async ({ params }) => {
	const { scope } = params;
	if (!isPracticeScope(scope)) error(404, 'Diesen Übungsbereich gibt es nicht.');
	const pool = scope === ALL ? content.groups : groupsOf(scope);
	return { scope, title: scopeTitle(scope), groups: await Promise.all(pool.map(groupView)) };
};
