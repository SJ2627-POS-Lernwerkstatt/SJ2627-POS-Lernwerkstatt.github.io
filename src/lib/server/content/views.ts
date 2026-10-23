import type { Question, QuestionGroup } from '#lib/content/schema.js';
import { buildPool, parseTemplate } from '#lib/puzzle/template.js';
import type { GroupView, QuestionView } from '#lib/quiz/types.js';
import { highlightToHtml } from '../../../../scripts/markdown/highlight.ts';
import { renderMarkdown } from './text.ts';

async function questionView(q: Question): Promise<QuestionView> {
	const common = {
		promptHtml: await renderMarkdown(q.prompt),
		codeHtml: q.code ? await highlightToHtml(q.code.trimEnd(), 'java') : undefined,
		explanationHtml: await renderMarkdown(q.explanation)
	};
	if (q.kind === 'template') {
		// Already validated in buildIndex.
		const parsed = parseTemplate(q.template.trimEnd());
		const { tiles } = buildPool(parsed, q.redHerrings, q.reusable);
		return { ...common, kind: 'template', lines: parsed.lines, gaps: parsed.gaps, tiles };
	}
	const optionsHtml = await Promise.all(q.options.map(renderMarkdown));
	return q.kind === 'single'
		? { ...common, kind: 'single', optionsHtml, answer: q.answer }
		: { ...common, kind: 'multi', optionsHtml, answer: q.answer };
}

const cache = new Map<string, Promise<GroupView>>();

/** The browser-ready form of a question group, built once per build. */
export function groupView(g: QuestionGroup): Promise<GroupView> {
	let view = cache.get(g.id);
	if (!view) {
		view = (async () => ({
			id: g.id,
			unit: g.unit,
			main: await questionView(g.main),
			followUps: await Promise.all(g.followUps.map(questionView))
		}))();
		cache.set(g.id, view);
	}
	return view;
}
