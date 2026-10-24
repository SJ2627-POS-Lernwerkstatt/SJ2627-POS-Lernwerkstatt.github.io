import type { Progress } from './schema.ts';

/** What the start page needs to know about a unit. */
export type UnitRef = { id: string; slug: string; title: string; core: boolean };

export type ModuleSummary = {
	unitsRead: number;
	units: number;
	/** Groups in Leitner box 2 or higher, i.e. answered fully correct in the last run they were in. */
	groupsKnown: number;
	groups: number;
};

export function moduleSummary(units: UnitRef[], groupIds: string[], progress: Progress): ModuleSummary {
	return {
		unitsRead: units.filter((u) => u.id in progress.units).length,
		units: units.length,
		groupsKnown: groupIds.filter((id) => (progress.groups[id]?.box ?? 0) >= 2).length,
		groups: groupIds.length
	};
}

/**
 * The unit to continue with: the first unread core unit in course order (modules and units are
 * passed in that order), else the first unread Vertiefung. Null when everything is read.
 */
export function nextUnit<M extends { units: UnitRef[] }>(
	modules: M[],
	progress: Progress
): { module: M; unit: UnitRef } | null {
	for (const core of [true, false]) {
		for (const module of modules) {
			const unit = module.units.find((u) => u.core === core && !(u.id in progress.units));
			if (unit) return { module, unit };
		}
	}
	return null;
}
