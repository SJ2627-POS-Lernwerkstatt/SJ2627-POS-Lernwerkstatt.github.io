import { error } from '@sveltejs/kit';
import { PUZZLE_TOPICS, puzzleTopic } from '#lib/content/puzzles.js';
import { puzzlesOf } from '#lib/server/content/index.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => PUZZLE_TOPICS.map((t) => ({ topic: t.slug }));

export const load: PageServerLoad = ({ params }) => {
	const topic = puzzleTopic(params.topic);
	if (!topic) error(404, 'Dieses Puzzle-Thema gibt es nicht.');
	return {
		topic,
		puzzles: puzzlesOf(topic.slug).map(({ id, title, kind, mindest }) => ({ id, title, kind, mindest }))
	};
};
