import { groupsOf } from '#lib/server/content/index.js';
import { PRACTICE_MODULES } from '#lib/quiz/scopes.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	modules: PRACTICE_MODULES.map((m) => ({ ...m, groupIds: groupsOf(m.slug).map((g) => g.id) }))
});
