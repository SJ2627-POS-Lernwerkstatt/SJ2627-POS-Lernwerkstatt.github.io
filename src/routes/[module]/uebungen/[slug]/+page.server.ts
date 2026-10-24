import { error } from '@sveltejs/kit';
import { GRADES } from '#lib/content/schema.js';
import { MODULES } from '#lib/content/modules.js';
import { content, exercisesOf } from '#lib/server/content/index.js';
import { renderMarkdown } from '#lib/server/content/text.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => content.exercises.map((x) => ({ module: x.module, slug: x.slug }));

export const load: PageServerLoad = async ({ params }) => {
	const module = MODULES.find((m) => m.slug === params.module);
	if (!module) error(404, 'Dieses Modul gibt es nicht.');
	const exercise = exercisesOf(module.slug).find((x) => x.slug === params.slug);
	if (!exercise) error(404, 'Diese Aufgabe gibt es nicht.');

	const { rubric, ...rest } = exercise;
	return {
		module,
		exercise: rest,
		expectedHtml: await renderMarkdown(rubric.erwartet),
		tiers: await Promise.all(
			GRADES.map(async ({ grade, key, label }) => ({ grade, label, html: await renderMarkdown(rubric[key]) }))
		)
	};
};
