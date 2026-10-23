import type { ModuleSlug } from '#lib/content/modules.js';
import { buildIndex, type ContentFiles, type ContentIndex } from './build.js';

export type { Unit, Exercise } from './build.js';

const ROOT = '/src/content/';

function relative(files: Record<string, string>): Record<string, string> {
	return Object.fromEntries(Object.entries(files).map(([path, raw]) => [path.slice(ROOT.length), raw]));
}

function load(): ContentIndex {
	const files: ContentFiles = {
		units: relative(import.meta.glob('/src/content/*/*.md', { query: '?raw', import: 'default', eager: true })),
		exercises: relative(
			import.meta.glob('/src/content/*/exercises/*.md', { query: '?raw', import: 'default', eager: true })
		),
		pools: relative(import.meta.glob('/src/content/questions/*.yaml', { query: '?raw', import: 'default', eager: true }))
	};
	const { index, errors } = buildIndex(files);
	if (errors.length) {
		throw new Error(`Content has ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
	}
	return index;
}

/** Built once per server/prerender process. Throws if any content file is invalid, which fails the build. */
export const content: ContentIndex = load();

export const unitsOf = (module: ModuleSlug) => content.units.filter((u) => u.module === module);
export const exercisesOf = (module: ModuleSlug) => content.exercises.filter((x) => x.module === module);
export const groupsOf = (module: ModuleSlug) => content.groups.filter((g) => g.unit.startsWith(`${module}/`));
export const groupsForUnit = (unitId: string) => content.groups.filter((g) => g.unit === unitId);
