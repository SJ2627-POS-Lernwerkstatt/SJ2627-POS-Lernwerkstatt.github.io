import { error } from '@sveltejs/kit';
import { MODULES } from '#lib/content/modules.js';
import { exercisesOf, groupsOf, unitsOf } from '#lib/server/content/index.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => MODULES.map((m) => ({ module: m.slug }));

export const load: PageServerLoad = ({ params }) => {
	const module = MODULES.find((m) => m.slug === params.module);
	if (!module) error(404, 'Dieses Modul gibt es nicht.');
	const units = unitsOf(module.slug).map(({ id, slug, title, minutes, core, status }) => ({
		id,
		slug,
		title,
		minutes,
		core,
		status
	}));
	const exercises = exercisesOf(module.slug).map(({ id, slug, title, minutes, grading, status }) => ({
		id,
		slug,
		title,
		minutes,
		grading,
		status
	}));
	const groupIds = groupsOf(module.slug).map((g) => g.id);
	return { module, units, exercises, groupIds };
};
