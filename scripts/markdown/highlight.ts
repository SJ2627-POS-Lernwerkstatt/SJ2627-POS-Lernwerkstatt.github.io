import { escapeSvelte } from 'mdsvex';
import { createHighlighter, type BundledLanguage } from 'shiki';

/** Languages that may appear in units. Anything else is rendered as plain text. */
export const LANGUAGES = ['java', 'json', 'kotlin', 'sql', 'http', 'bash', 'yaml', 'xml', 'properties'] as const;

/** Code blocks are dark in both themes (as in ParsonXam). */
const THEME = 'github-dark-default';

const highlighter = createHighlighter({ themes: [THEME], langs: [...LANGUAGES] });

/** Shiki HTML for a code block, escaped so Svelte does not treat {, } or ` as template syntax. */
export async function highlightToHtml(code: string, lang: string | undefined): Promise<string> {
	const known = (LANGUAGES as readonly string[]).includes(lang ?? '');
	const html = (await highlighter).codeToHtml(code, {
		lang: known ? (lang as BundledLanguage) : 'text',
		theme: THEME
	});
	return html;
}

/** mdsvex highlighter: returns Svelte markup that renders the highlighted HTML. */
export async function highlight(code: string, lang: string | null | undefined): Promise<string> {
	const html = escapeSvelte(await highlightToHtml(code, lang ?? undefined));
	return `{@html \`${html}\`}`;
}
