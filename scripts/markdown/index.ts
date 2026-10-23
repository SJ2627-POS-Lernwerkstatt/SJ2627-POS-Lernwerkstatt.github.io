import { mdsvex } from 'mdsvex';
import type { PreprocessorGroup } from 'svelte/compiler';
import { transformCallouts } from './callouts.ts';
import { highlight } from './highlight.ts';

const callouts: PreprocessorGroup = {
	name: 'callouts',
	markup({ content, filename }) {
		if (!filename?.endsWith('.md')) return;
		return { code: transformCallouts(content, filename) };
	}
};

/** Preprocessors for Markdown pages and units. Order matters: callouts run on the raw text first. */
export const markdown: PreprocessorGroup[] = [
	callouts,
	mdsvex({
		extensions: ['.md'],
		highlight: { highlighter: highlight },
		// German quotes („…“) are typed directly; smartypants would turn "..." into English quotes.
		smartypants: { quotes: false, ellipses: true, backticks: false, dashes: 'oldschool' }
	})
];
