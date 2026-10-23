import { error } from '@sveltejs/kit';
import { MODULES } from '#lib/content/modules.js';
import { content, groupsForUnit, unitsOf } from '#lib/server/content/index.js';
import { groupView } from '#lib/server/content/views.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => content.units.map((u) => ({ module: u.module, unit: u.slug }));

export const load: PageServerLoad = async ({ params }) => {
	const module = MODULES.find((m) => m.slug === params.module);
	if (!module) error(404, 'Dieses Modul gibt es nicht.');
	const units = unitsOf(module.slug);
	const i = units.findIndex((u) => u.slug === params.unit);
	if (i < 0) error(404, 'Diese Einheit gibt es nicht.');

	const link = (u: (typeof units)[number] | undefined) => (u ? { slug: u.slug, title: u.title } : null);
	const unit = units[i];
	const checks = await Promise.all(groupsForUnit(unit.id).map(groupView));
	return { module, unit, checks, prev: link(units[i - 1]), next: link(units[i + 1]) };
};
