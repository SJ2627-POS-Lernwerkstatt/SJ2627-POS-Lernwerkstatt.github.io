import { MODULES } from '#lib/content/modules.js';
import { exercisesOf, groupsForUnit, unitsOf } from '#lib/server/content/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	modules: MODULES.map((m) => ({
		slug: m.slug,
		title: m.title,
		units: unitsOf(m.slug).map((u) => {
			const groups = groupsForUnit(u.id);
			return {
				id: u.id,
				slug: u.slug,
				title: u.title,
				core: u.core,
				minutes: u.minutes,
				status: u.status,
				groups: groups.length,
				questions: groups.reduce((n, g) => n + 1 + g.followUps.length, 0)
			};
		}),
		exercises: exercisesOf(m.slug).map((x) => ({
			id: x.id,
			slug: x.slug,
			title: x.title,
			grading: x.grading,
			minutes: x.minutes,
			status: x.status,
			hasClassroom: Boolean(x.classroomUrl)
		}))
	}))
});
