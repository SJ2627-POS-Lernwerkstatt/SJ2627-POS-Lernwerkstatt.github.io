import { MODULES } from '#lib/content/modules.js';
import { PUZZLE_TOPICS } from '#lib/content/puzzles.js';
import { puzzlesOf } from '#lib/server/content/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	modules: MODULES.flatMap((m) => {
		const topics = PUZZLE_TOPICS.filter((t) => t.module === m.slug).map((t) => ({
			...t,
			puzzleIds: puzzlesOf(t.slug).map((p) => p.id),
			mindestCount: puzzlesOf(t.slug).filter((p) => p.mindest).length
		}));
		return topics.length ? [{ slug: m.slug, title: m.title, note: m.note, topics }] : [];
	})
});
