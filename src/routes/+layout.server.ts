import { MODULES } from '#lib/content/modules.js';
import { exercisesOf, unitsOf } from '#lib/server/content/index.js';
import type { LayoutServerLoad } from './$types';

/** Course structure for the side panel. */
export const load: LayoutServerLoad = () => ({
	nav: MODULES.map(({ slug, title }) => ({
		slug,
		title,
		units: unitsOf(slug).map(({ id, slug, title, core }) => ({ id, slug, title, core })),
		exercises: exercisesOf(slug).map(({ slug, title }) => ({ slug, title }))
	}))
});
