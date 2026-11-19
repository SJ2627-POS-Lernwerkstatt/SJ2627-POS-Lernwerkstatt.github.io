import { error } from '@sveltejs/kit';
import { puzzleTopic } from '#lib/content/puzzles.js';
import { content, puzzlesOf } from '#lib/server/content/index.js';
import { puzzleView } from '#lib/server/content/views.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => content.puzzles.map((p) => ({ topic: p.topic, id: p.id }));

export const load: PageServerLoad = async ({ params }) => {
	const topic = puzzleTopic(params.topic);
	if (!topic) error(404, 'Dieses Puzzle-Thema gibt es nicht.');
	const puzzles = puzzlesOf(topic.slug);
	const i = puzzles.findIndex((p) => p.id === params.id);
	if (i < 0) error(404, 'Dieses Puzzle gibt es nicht.');
	const link = (p: (typeof puzzles)[number] | undefined) => (p ? { id: p.id, title: p.title } : null);
	const puzzle = await puzzleView(puzzles[i]!);
	return {
		/** Read by the root layout: wider main column, course panel hidden by default. */
		wide: puzzle.layout === 'split',
		topic,
		puzzle,
		mindest: puzzles[i]!.mindest,
		position: i + 1,
		count: puzzles.length,
		prev: link(puzzles[i - 1]),
		next: link(puzzles[i + 1])
	};
};
