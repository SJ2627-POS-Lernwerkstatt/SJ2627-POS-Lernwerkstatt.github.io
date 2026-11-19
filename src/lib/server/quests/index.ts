import { content } from '#lib/server/content/index.js';
import { buildContentIndex, buildQuests } from './build.js';

const ROOT = '/src/content/';

function load() {
	const files = Object.fromEntries(
		Object.entries(import.meta.glob('/src/content/quests/*.yaml', { query: '?raw', import: 'default', eager: true })).map(
			([path, raw]) => [path.slice(ROOT.length), raw as string]
		)
	);
	const { quests, errors } = buildQuests(files, content);
	if (errors.length) throw new Error(`Quests have ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
	return quests;
}

/** Built once per server/prerender process. Throws if any quest file is invalid, which fails the build. */
export const quests = load();
export const contentIndexFile = buildContentIndex(content);
