import { MODULES } from '#lib/content/modules.js';
import { groupsOf, unitsOf } from '#lib/server/content/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	modules: MODULES.map((m) => ({
		...m,
		units: unitsOf(m.slug).map(({ id, slug, title, core, mindest }) => ({ id, slug, title, core, mindest })),
		groupIds: groupsOf(m.slug).map((g) => g.id)
	}))
});
