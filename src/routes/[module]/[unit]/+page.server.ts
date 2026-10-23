import { error } from '@sveltejs/kit';
import { MODULES } from '#lib/content/modules.js';
import { content, unitsOf } from '#lib/server/content/index.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => content.units.map((u) => ({ module: u.module, unit: u.slug }));

export const load: PageServerLoad = ({ params }) => {
	const module = MODULES.find((m) => m.slug === params.module);
	if (!module) error(404, 'Dieses Modul gibt es nicht.');
	const units = unitsOf(module.slug);
	const i = units.findIndex((u) => u.slug === params.unit);
	if (i < 0) error(404, 'Diese Einheit gibt es nicht.');

	const link = (u: (typeof units)[number] | undefined) => (u ? { slug: u.slug, title: u.title } : null);
	return { module, unit: units[i], prev: link(units[i - 1]), next: link(units[i + 1]) };
};
