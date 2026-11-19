import type { QuestionView } from '#lib/quiz/types.js';
import { highlightToHtml } from '../../../../scripts/markdown/highlight.ts';
import { renderMarkdown } from '../content/text.ts';
import { buildDiagnostic, type DiagnosticEntry } from './build.js';

const files = import.meta.glob('/src/content/diagnostic/einstieg.yaml', { query: '?raw', import: 'default', eager: true });

function load(): DiagnosticEntry[] {
	const raw = Object.values(files)[0] as string | undefined;
	if (raw === undefined) throw new Error('src/content/diagnostic/einstieg.yaml is missing');
	const { entries, errors } = buildDiagnostic(raw);
	if (errors.length) throw new Error(`Diagnostic has ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
	return entries;
}

/** Built once per server/prerender process. Throws if the file is invalid, which fails the build. */
export const diagnostic = load();

export type DiagnosticView = { id: string; area: string; question: QuestionView };

/**
 * The browser-ready form. The page never needs the correct answer and the explanation, so neither is sent
 * (the answer field of QuestionView is a placeholder; the page does not look at it).
 */
export async function diagnosticViews(): Promise<DiagnosticView[]> {
	return Promise.all(
		diagnostic.map(async ({ id, area, question: q }) => {
			const common = {
				promptHtml: await renderMarkdown(q.prompt),
				codeHtml: q.code ? await highlightToHtml(q.code.trimEnd(), 'java') : undefined,
				explanationHtml: '',
				optionsHtml: await Promise.all(q.options.map(renderMarkdown))
			};
			const question: QuestionView = q.kind === 'single' ? { ...common, kind: 'single', answer: -1 } : { ...common, kind: 'multi', answer: [] };
			return { id, area, question };
		})
	);
}
