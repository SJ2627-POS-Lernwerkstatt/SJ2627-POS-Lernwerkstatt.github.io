import { MODULES, type ModuleSlug } from '#lib/content/modules.js';

/** Exercise mode scopes: every module with a question pool, or all of them. */
export const ALL = 'alle';
export const PRACTICE_MODULES = MODULES.filter((m) => m.slug !== 'pruefungen');

export function scopeTitle(scope: string): string {
	if (scope === ALL) return 'Alle Module';
	return MODULES.find((m) => m.slug === scope)?.title ?? scope;
}

export function isPracticeScope(scope: string): scope is ModuleSlug | typeof ALL {
	return scope === ALL || PRACTICE_MODULES.some((m) => m.slug === scope);
}
