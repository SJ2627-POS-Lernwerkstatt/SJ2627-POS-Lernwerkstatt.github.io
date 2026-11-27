import type { Question, QuestionText } from '#lib/content/schema.js';
import { lineKey, parseLines, toLine } from '#lib/puzzle/lines.js';
import { buildPool, parseTemplate, type Segment } from '#lib/puzzle/template.js';
import type { PuzzleView } from '#lib/puzzle/view.js';
import type { GroupView, QuestionTextView, QuestionView } from '#lib/quiz/types.js';
import { highlightToHtml } from '../../../../scripts/markdown/highlight.ts';
import { renderPlantUml } from '../../../../scripts/markdown/plantuml.ts';
import { replaceAll, type GroupEntry, type PuzzleEntry } from './build.ts';
import { renderMarkdown } from './text.ts';

async function textView(t: QuestionText, q: Question): Promise<QuestionTextView> {
	const code = t.code ?? q.code;
	let template: QuestionTextView['template'];
	if (q.kind === 'template' && t.template) {
		// Same shape as the German template (checked in buildIndex).
		const parsed = parseTemplate(t.template.trimEnd());
		const { tiles } = buildPool(parsed, t.redHerrings ?? q.redHerrings, t.reusable ?? q.reusable);
		template = { lines: parsed.lines, gaps: parsed.gaps, tiles };
	}
	return {
		promptHtml: await renderMarkdown(t.prompt),
		codeHtml: code ? await highlightToHtml(code.trimEnd(), 'java') : undefined,
		explanationHtml: await renderMarkdown(t.explanation),
		optionsHtml: t.options ? await Promise.all(t.options.map(renderMarkdown)) : undefined,
		template
	};
}

async function questionView(q: Question, en?: QuestionText): Promise<QuestionView> {
	const common = {
		promptHtml: await renderMarkdown(q.prompt),
		codeHtml: q.code ? await highlightToHtml(q.code.trimEnd(), 'java') : undefined,
		explanationHtml: await renderMarkdown(q.explanation),
		en: en ? await textView(en, q) : undefined
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

/** The template's code with every gap filled correctly. */
function templateSolution(lines: Segment[][], gaps: { expected: string[] }[]): string {
	return lines
		.map((line) => line.map((s) => ('text' in s ? s.text : gaps[s.gap]!.expected.join(' '))).join(''))
		.join('\n');
}

async function umlSrc(body: string, id: string): Promise<string> {
	try {
		const svg = await renderPlantUml(body);
		return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
	} catch (e) {
		throw new Error(`puzzle ${id}: ${(e as Error).message}`);
	}
}

/** Long puzzles (given code + code or lines over this) go side by side on wide screens. */
export const SPLIT_FROM_LINES = 16;

export function puzzleLayout(setting: 'auto' | 'stacked' | 'split', givenLines: number, codeLines: number): 'stacked' | 'split' {
	if (setting !== 'auto') return setting;
	return givenLines + codeLines > SPLIT_FROM_LINES ? 'split' : 'stacked';
}

/** On a phone such puzzles get the hint "Laptop empfohlen". */
const isLong = (givenLines: number, codeLines: number) => givenLines + codeLines > SPLIT_FROM_LINES;

const lineCount = (code?: string) => (code ? code.trimEnd().split('\n').length : 0);

/** The browser-ready form of a puzzle. */
async function puzzleEnView(p: PuzzleEntry): Promise<PuzzleView['en']> {
	const en = p.en;
	if (!en) return undefined;
	const given = en.given ?? (p.given && en.replace.length ? replaceAll(p.given, en.replace) : undefined);
	let lines: Segment[][] | undefined;
	let solutionHtml: string | undefined;
	if (p.kind === 'template' && en.replace.length) {
		const parsed = parseTemplate(replaceAll(p.template, en.replace).trimEnd());
		if (parsed.lines.some((l, i) => JSON.stringify(l) !== JSON.stringify(parseTemplate(p.template.trimEnd()).lines[i]))) {
			lines = parsed.lines;
			solutionHtml = await highlightToHtml(templateSolution(parsed.lines, parsed.gaps), 'java');
		}
	}
	return {
		title: en.title,
		promptHtml: await renderMarkdown(en.prompt),
		givenHtml: given ? await highlightToHtml(given.trimEnd(), 'java') : undefined,
		explanationHtml: await renderMarkdown(en.explanation),
		lines,
		solutionHtml
	};
}

export async function puzzleView(p: PuzzleEntry): Promise<PuzzleView> {
	const common = {
		id: p.id,
		topic: p.topic,
		title: p.title,
		promptHtml: await renderMarkdown(p.prompt),
		umlSrc: p.uml ? await umlSrc(p.uml, p.id) : undefined,
		givenHtml: p.given ? await highlightToHtml(p.given.trimEnd(), 'java') : undefined,
		explanationHtml: await renderMarkdown(p.explanation),
		en: await puzzleEnView(p)
	};
	if (p.kind === 'template') {
		const parsed = parseTemplate(p.template.trimEnd());
		const { tiles } = buildPool(parsed, p.redHerrings, p.reusable);
		const solutionHtml = await highlightToHtml(templateSolution(parsed.lines, parsed.gaps), 'java');
		const layout = puzzleLayout(p.layout, lineCount(p.given), parsed.lines.length);
		return { ...common, kind: 'template', layout, long: isLong(lineCount(p.given), parsed.lines.length), solutionHtml, lines: parsed.lines, gaps: parsed.gaps, tiles };
	}
	// Already validated in buildIndex.
	const solution = parseLines(p.solution).lines;
	const herrings = p.redHerrings.flatMap((h) => {
		const line = toLine(h);
		return line && !('error' in line) ? [line] : [];
	});
	return {
		...common,
		kind: 'lines',
		// The pool holds every line, so it is what makes a line puzzle long.
		layout: puzzleLayout(p.layout, lineCount(p.given), solution.length + herrings.length),
		long: isLong(lineCount(p.given), solution.length),
		solutionHtml: await highlightToHtml(solution.map(lineKey).join('\n'), 'java'),
		tiles: [...solution.map((l) => ({ ...l, herring: false })), ...herrings.map((l) => ({ ...l, herring: true }))],
		expected: solution.map(lineKey)
	};
}

const cache = new Map<string, Promise<GroupView>>();

/** The browser-ready form of a question group, built once per build. */
export function groupView(g: GroupEntry): Promise<GroupView> {
	let view = cache.get(g.id);
	if (!view) {
		view = (async () => ({
			id: g.id,
			unit: g.unit,
			main: await questionView(g.main, g.en?.main),
			followUps: await Promise.all(g.followUps.map((q, i) => questionView(q, g.en?.followUps[i])))
		}))();
		cache.set(g.id, view);
	}
	return view;
}
