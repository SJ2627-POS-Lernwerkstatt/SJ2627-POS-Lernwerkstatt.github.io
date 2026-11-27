import { parse as parseYaml } from 'yaml';
import type { z } from 'zod';
import { isModuleSlug, type ModuleSlug } from '#lib/content/modules.js';
import { puzzleTopic } from '#lib/content/puzzles.js';
import { LINE_LIMITS, lineKey, parseLines, toLine } from '#lib/puzzle/lines.js';
import { buildPool, parseTemplate } from '#lib/puzzle/template.js';
import {
	exerciseFrontmatter,
	groupTranslationPool,
	puzzlePool,
	puzzleTranslationPool,
	unitTranslationFrontmatter,
	type GroupTranslation,
	type PuzzleTranslation,
	questionPool,
	type Puzzle,
	unitFrontmatter,
	type ExerciseFrontmatter,
	type Question,
	type QuestionGroup,
	type UnitFrontmatter
} from '#lib/content/schema.js';

export type Unit = UnitFrontmatter & {
	/** "<module>/<slug>" */
	id: string;
	module: ModuleSlug;
	slug: string;
	/** From the file name prefix "06-". */
	order: number;
	/** Source path, used to load the rendered component. */
	file: string;
	/** English translation, if there is one (src/content/en/<file>). */
	en?: { title: string; file: string };
};

export type Exercise = ExerciseFrontmatter & {
	id: string;
	module: ModuleSlug;
	slug: string;
	order: number;
	file: string;
};

export type PuzzleEntry = Puzzle & {
	topic: string;
	/** Position in the topic's file, from 0. */
	order: number;
	en?: PuzzleTranslation;
};

export type GroupEntry = QuestionGroup & { en?: GroupTranslation };

export type ContentIndex = {
	units: Unit[];
	exercises: Exercise[];
	groups: GroupEntry[];
	puzzles: PuzzleEntry[];
};

/** Raw file contents keyed by path relative to the content root, e.g. "jpa/06-enums.md". */
export type ContentFiles = {
	units: Record<string, string>;
	exercises: Record<string, string>;
	pools: Record<string, string>;
	/** "puzzles/<topic>.yaml"; optional so older callers need not pass it. */
	puzzles?: Record<string, string>;
	/** English translations, paths relative to src/content/en/ ("jpa/06-enums.md", "questions/jpa.yaml", "puzzles/jpa-entity.yaml"). */
	en?: { units?: Record<string, string>; pools?: Record<string, string>; puzzles?: Record<string, string> };
};

const MODULE_PART = '([a-z]+(?:-[a-z0-9]+)*)';
const UNIT_PATH = new RegExp(`^${MODULE_PART}/(\\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\\.md$`);
const EXERCISE_PATH = new RegExp(`^${MODULE_PART}/exercises/(\\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\\.md$`);
const POOL_PATH = new RegExp(`^questions/${MODULE_PART}\\.yaml$`);
const PUZZLE_PATH = /^puzzles\/([a-z0-9]+(?:-[a-z0-9]+)*)\.yaml$/;

/** Splits "---\n<yaml>\n---\n<body>" and parses the YAML. */
export function frontmatter(raw: string): unknown {
	const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
	if (!match) throw new Error('missing frontmatter (--- ... ---) at the top of the file');
	return parseYaml(match[1]) ?? {};
}

function zodErrors(file: string, error: z.ZodError): string[] {
	return error.issues.map((i) => `${file}: ${i.path.length ? i.path.join('.') + ': ' : ''}${i.message}`);
}

function checkPuzzle(p: Puzzle, where: string, errors: string[]) {
	for (const [i, m] of p.mutants.entries()) {
		if (!p.given?.includes(m.find)) errors.push(`${where}: mutant ${i + 1}: "${m.find}" does not occur in given`);
	}
	if (p.kind === 'template') {
		checkQuestion(p, where, errors);
		return;
	}
	const { lines, errors: lineErrors } = parseLines(p.solution);
	for (const e of lineErrors) errors.push(`${where}: solution ${e}`);
	if (lines.length < 3) errors.push(`${where}: a line puzzle needs at least 3 solution lines`);
	if (lines.length > LINE_LIMITS.lines) errors.push(`${where}: more than ${LINE_LIMITS.lines} solution lines`);
	const keys = new Set(lines.map(lineKey));
	for (const h of p.redHerrings) {
		const line = toLine(h);
		if (!line) errors.push(`${where}: a red herring must not be blank`);
		else if ('error' in line) errors.push(`${where}: red herring "${h.trim()}": ${line.error}`);
		else if (keys.has(lineKey(line))) errors.push(`${where}: red herring "${h.trim()}" is also a solution line`);
	}
}

function checkQuestion(q: Question | Puzzle, where: string, errors: string[]) {
	if (q.kind === 'template') {
		const parsed = parseTemplate(q.template.trimEnd());
		for (const e of parsed.errors) errors.push(`${where}: template line ${e.line}: ${e.message}`);
		// Pieces of one gap are shown and joined with a space: "find{{A}}{{B}}" would read "findA B".
		q.template.split('\n').forEach((line, i) => {
			if (/\}\}\{\{/.test(line)) errors.push(`${where}: template line ${i + 1}: markers "}}{{" touch – separate them with a blank or fixed text, or use one piece`);
		});
		if (parsed.pieces.length < 2) errors.push(`${where}: a template needs at least 2 pieces`);
		for (const e of buildPool(parsed, q.redHerrings, q.reusable).errors) errors.push(`${where}: ${e}`);
	}
	if (q.kind === 'single' && q.answer >= q.options.length) {
		errors.push(`${where}: answer ${q.answer} is out of range (${q.options.length} options)`);
	}
	if (q.kind === 'multi') {
		for (const a of q.answer) {
			if (a >= q.options.length) errors.push(`${where}: answer ${a} is out of range (${q.options.length} options)`);
		}
		if (new Set(q.answer).size !== q.answer.length) errors.push(`${where}: duplicate answer index`);
	}
}

/** Parses and cross-checks all content. Returns every problem found instead of stopping at the first. */
export function buildIndex(files: ContentFiles): { index: ContentIndex; errors: string[] } {
	const errors: string[] = [];
	const units: Unit[] = [];
	const exercises: Exercise[] = [];
	const groups: GroupEntry[] = [];

	for (const [file, raw] of Object.entries(files.units)) {
		const m = UNIT_PATH.exec(file);
		if (!m) {
			errors.push(`${file}: unit files must be named "<module>/<nn>-<slug>.md"`);
			continue;
		}
		const [, module, nn, slug] = m;
		if (!isModuleSlug(module)) {
			errors.push(`${file}: unknown module "${module}"`);
			continue;
		}
		try {
			const parsed = unitFrontmatter.safeParse(frontmatter(raw));
			if (!parsed.success) errors.push(...zodErrors(file, parsed.error));
			else units.push({ ...parsed.data, id: `${module}/${slug}`, module, slug, order: Number(nn), file });
		} catch (e) {
			errors.push(`${file}: ${(e as Error).message}`);
		}
	}

	for (const [file, raw] of Object.entries(files.exercises)) {
		const m = EXERCISE_PATH.exec(file);
		if (!m) {
			errors.push(`${file}: exercise files must be named "<module>/exercises/<nn>-<slug>.md"`);
			continue;
		}
		const [, module, nn, slug] = m;
		if (!isModuleSlug(module)) {
			errors.push(`${file}: unknown module "${module}"`);
			continue;
		}
		try {
			const parsed = exerciseFrontmatter.safeParse(frontmatter(raw));
			if (!parsed.success) errors.push(...zodErrors(file, parsed.error));
			else exercises.push({ ...parsed.data, id: `${module}/uebungen/${slug}`, module, slug, order: Number(nn), file });
		} catch (e) {
			errors.push(`${file}: ${(e as Error).message}`);
		}
	}

	for (const [file, raw] of Object.entries(files.pools)) {
		const m = POOL_PATH.exec(file);
		if (!m || !isModuleSlug(m[1])) {
			errors.push(`${file}: question pools must be named "questions/<module>.yaml"`);
			continue;
		}
		let data: unknown;
		try {
			data = parseYaml(raw) ?? [];
		} catch (e) {
			errors.push(`${file}: ${(e as Error).message}`);
			continue;
		}
		const parsed = questionPool.safeParse(data);
		if (!parsed.success) {
			errors.push(...zodErrors(file, parsed.error));
			continue;
		}
		for (const g of parsed.data) {
			if (!g.unit.startsWith(`${m[1]}/`)) errors.push(`${file}: group "${g.id}" refers to unit "${g.unit}" of another module`);
			checkQuestion(g.main, `${file}: ${g.id}.main`, errors);
			g.followUps.forEach((q, i) => checkQuestion(q, `${file}: ${g.id}.followUps.${i}`, errors));
			groups.push(g);
		}
	}

	const puzzles: PuzzleEntry[] = [];
	for (const [file, raw] of Object.entries(files.puzzles ?? {})) {
		const m = PUZZLE_PATH.exec(file);
		if (!m || !puzzleTopic(m[1])) {
			errors.push(`${file}: puzzle pools must be named "puzzles/<topic>.yaml" with a topic from PUZZLE_TOPICS`);
			continue;
		}
		let data: unknown;
		try {
			data = parseYaml(raw) ?? [];
		} catch (e) {
			errors.push(`${file}: ${(e as Error).message}`);
			continue;
		}
		const parsed = puzzlePool.safeParse(data);
		if (!parsed.success) {
			errors.push(...zodErrors(file, parsed.error));
			continue;
		}
		parsed.data.forEach((p, order) => {
			checkPuzzle(p, `${file}: ${p.id}`, errors);
			puzzles.push({ ...p, topic: m[1], order });
		});
	}
	duplicates(puzzles, (p) => p.id, (k) => `duplicate puzzle id "${k}"`, errors);

	duplicates(units, (u) => `${u.module}/${u.order}`, (k) => `two units share the number ${k}`, errors);
	duplicates(units, (u) => u.id, (k) => `duplicate unit slug "${k}"`, errors);
	duplicates(exercises, (x) => `${x.module}/${x.order}`, (k) => `two exercises share the number ${k}`, errors);
	duplicates(exercises, (x) => x.id, (k) => `duplicate exercise slug "${k}"`, errors);
	duplicates(groups, (g) => g.id, (k) => `duplicate question group id "${k}"`, errors);

	const unitIds = new Set(units.map((u) => u.id));
	for (const g of groups) {
		if (!unitIds.has(g.unit)) errors.push(`question group "${g.id}": unit "${g.unit}" does not exist`);
	}

	translate(files.en ?? {}, units, groups, puzzles, errors);

	const byOrder = <T extends { module: string; order: number }>(a: T, b: T) =>
		a.module === b.module ? a.order - b.order : 0;
	return { index: { units: units.sort(byOrder), exercises: exercises.sort(byOrder), groups, puzzles }, errors };
}

function duplicates<T>(items: T[], key: (item: T) => string, message: (key: string) => string, errors: string[]) {
	const seen = new Set<string>();
	for (const item of items) {
		const k = key(item);
		if (seen.has(k)) errors.push(message(k));
		seen.add(k);
	}
}

/** Raw YAML list → validated entries, or errors. */
function parsePool<T>(file: string, raw: string, schema: z.ZodType<T[]>, errors: string[]): T[] {
	let data: unknown;
	try {
		data = parseYaml(raw) ?? [];
	} catch (e) {
		errors.push(`${file}: ${(e as Error).message}`);
		return [];
	}
	const parsed = schema.safeParse(data);
	if (!parsed.success) {
		errors.push(...zodErrors(file, parsed.error));
		return [];
	}
	return parsed.data;
}

function checkQuestionText(q: Question, t: GroupTranslation['main'], where: string, errors: string[]) {
	if (q.kind !== 'template' && (t.template || t.redHerrings || t.reusable)) {
		errors.push(`${where}: only template questions have a template`);
	}
	if (q.kind === 'template') {
		if (t.options) errors.push(`${where}: a template question has no options`);
		if (t.template) checkTemplateTranslation(q, t, where, errors);
	} else if (!t.options) errors.push(`${where}: options are missing`);
	else if (t.options.length !== q.options.length) {
		errors.push(`${where}: ${t.options.length} options, the German question has ${q.options.length}`);
	}
}

/** The English template must have the same shape: answers are stored as piece positions ("t3"). */
function checkTemplateTranslation(
	q: Extract<Question, { kind: 'template' }>,
	t: GroupTranslation['main'],
	where: string,
	errors: string[]
) {
	const de = parseTemplate(q.template.trimEnd());
	const en = parseTemplate(t.template!.trimEnd());
	for (const e of en.errors) errors.push(`${where}: template line ${e.line}: ${e.message}`);
	if (en.errors.length) return;
	const shape = (p: typeof de) => p.gaps.map((g) => `${g.expected.length}${g.anyOrder ? '~' : ''}`).join(',');
	if (shape(en) !== shape(de)) errors.push(`${where}: the template's gaps differ from the German one`);
	const pool = (p: typeof de, herrings: string[], reusable: string[]) => buildPool(p, herrings, reusable);
	const dePool = pool(de, q.redHerrings, q.reusable);
	const enPool = pool(en, t.redHerrings ?? q.redHerrings, t.reusable ?? q.reusable);
	for (const e of enPool.errors) errors.push(`${where}: ${e}`);
	const kinds = (tiles: typeof dePool.tiles) => tiles.map((x) => `${x.herring ? 'h' : 'p'}${x.reusable ? 'r' : ''}`).join(',');
	if (kinds(enPool.tiles) !== kinds(dePool.tiles)) errors.push(`${where}: the template's pieces differ from the German ones`);
}

/** Applies a translation's code replacements (German comments → English). */
export function replaceAll(code: string, replacements: { find: string; replace: string }[]): string {
	return replacements.reduce((text, r) => text.split(r.find).join(r.replace), code);
}

function checkPuzzleReplacements(p: PuzzleEntry, t: PuzzleTranslation, where: string, errors: string[]) {
	const template = p.kind === 'template' ? p.template : '';
	for (const r of t.replace) {
		if (!p.given?.includes(r.find) && !template.includes(r.find)) {
			errors.push(`${where}: replace "${r.find}" occurs neither in given nor in the template`);
		}
	}
	if (p.kind !== 'template' || !t.replace.length) return;
	const pieces = (text: string) => JSON.stringify(parseTemplate(text.trimEnd()).gaps.map((g) => g.expected));
	if (pieces(replaceAll(p.template, t.replace)) !== pieces(p.template)) {
		errors.push(`${where}: replace must not change the template's pieces`);
	}
}

/** Attaches the English translations and checks that they match the German originals. Missing ones are fine. */
function translate(en: NonNullable<ContentFiles['en']>, units: Unit[], groups: GroupEntry[], puzzles: PuzzleEntry[], errors: string[]) {
	const unitByFile = new Map(units.map((u) => [u.file, u]));
	for (const [file, raw] of Object.entries(en.units ?? {})) {
		const where = `en/${file}`;
		const unit = unitByFile.get(file);
		if (!unit) {
			errors.push(`${where}: there is no German unit ${file}`);
			continue;
		}
		try {
			const parsed = unitTranslationFrontmatter.safeParse(frontmatter(raw));
			if (!parsed.success) errors.push(...zodErrors(where, parsed.error));
			else unit.en = { title: parsed.data.title, file: `en/${file}` };
		} catch (e) {
			errors.push(`${where}: ${(e as Error).message}`);
		}
	}

	const groupById = new Map(groups.map((g) => [g.id, g]));
	for (const [file, raw] of Object.entries(en.pools ?? {})) {
		const where = `en/${file}`;
		const m = POOL_PATH.exec(file);
		if (!m) {
			errors.push(`${where}: translated question pools must be named "en/questions/<module>.yaml"`);
			continue;
		}
		for (const t of parsePool(where, raw, groupTranslationPool, errors)) {
			const g = groupById.get(t.id);
			if (!g || !g.unit.startsWith(`${m[1]}/`)) {
				errors.push(`${where}: there is no question group "${t.id}" in questions/${m[1]}.yaml`);
				continue;
			}
			if (g.en) errors.push(`${where}: "${t.id}" is translated twice`);
			if (t.followUps.length !== g.followUps.length) {
				errors.push(`${where}: ${t.id}: ${t.followUps.length} follow-ups, the German group has ${g.followUps.length}`);
				continue;
			}
			checkQuestionText(g.main, t.main, `${where}: ${t.id}.main`, errors);
			g.followUps.forEach((q, i) => checkQuestionText(q, t.followUps[i]!, `${where}: ${t.id}.followUps.${i}`, errors));
			g.en = t;
		}
	}

	const puzzleById = new Map(puzzles.map((p) => [p.id, p]));
	for (const [file, raw] of Object.entries(en.puzzles ?? {})) {
		const where = `en/${file}`;
		const m = PUZZLE_PATH.exec(file);
		if (!m) {
			errors.push(`${where}: translated puzzle pools must be named "en/puzzles/<topic>.yaml"`);
			continue;
		}
		for (const t of parsePool(where, raw, puzzleTranslationPool, errors)) {
			const p = puzzleById.get(t.id);
			if (!p || p.topic !== m[1]) {
				errors.push(`${where}: there is no puzzle "${t.id}" in puzzles/${m[1]}.yaml`);
				continue;
			}
			if (p.en) errors.push(`${where}: "${t.id}" is translated twice`);
			if (t.given && !p.given) errors.push(`${where}: ${t.id}: the German puzzle has no given code`);
			checkPuzzleReplacements(p, t, `${where}: ${t.id}`, errors);
			p.en = t;
		}
	}
}
