import { MODULES } from '#lib/content/modules.js';
import { exercisesOf, unitsOf } from '#lib/server/content/index.js';
import type { LayoutServerLoad } from './$types';

/** Course structure for the side panel. */
export const load: LayoutServerLoad = () => ({
	nav: MODULES.map(({ slug, title, titleEn }) => ({
		slug,
		title,
		titleEn,
		units: unitsOf(slug).map(({ id, slug, title, en, core }) => ({ id, slug, title, titleEn: en?.title, core })),
		exercises: exercisesOf(slug).map(({ slug, title }) => ({ slug, title }))
	}))
});
