import { parse as parseYaml } from 'yaml';
import type { z } from 'zod';
import { isModuleSlug, type ModuleSlug } from '#lib/content/modules.js';
import { buildPool, parseTemplate } from '#lib/puzzle/template.js';
import {
	exerciseFrontmatter,
	questionPool,
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
};

export type Exercise = ExerciseFrontmatter & {
	id: string;
	module: ModuleSlug;
	slug: string;
	order: number;
	file: string;
};

export type ContentIndex = {
	units: Unit[];
	exercises: Exercise[];
	groups: QuestionGroup[];
};

/** Raw file contents keyed by path relative to the content root, e.g. "jpa/06-enums.md". */
export type ContentFiles = {
	units: Record<string, string>;
	exercises: Record<string, string>;
	pools: Record<string, string>;
};

const MODULE_PART = '([a-z]+(?:-[a-z0-9]+)*)';
const UNIT_PATH = new RegExp(`^${MODULE_PART}/(\\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\\.md$`);
const EXERCISE_PATH = new RegExp(`^${MODULE_PART}/exercises/(\\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\\.md$`);
const POOL_PATH = new RegExp(`^questions/${MODULE_PART}\\.yaml$`);

/** Splits "---\n<yaml>\n---\n<body>" and parses the YAML. */
export function frontmatter(raw: string): unknown {
	const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
	if (!match) throw new Error('missing frontmatter (--- ... ---) at the top of the file');
	return parseYaml(match[1]) ?? {};
}

function zodErrors(file: string, error: z.ZodError): string[] {
	return error.issues.map((i) => `${file}: ${i.path.length ? i.path.join('.') + ': ' : ''}${i.message}`);
}

function checkQuestion(q: Question, where: string, errors: string[]) {
	if (q.kind === 'template') {
		const parsed = parseTemplate(q.template.trimEnd());
		for (const e of parsed.errors) errors.push(`${where}: template line ${e.line}: ${e.message}`);
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
	const groups: QuestionGroup[] = [];

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

	duplicates(units, (u) => `${u.module}/${u.order}`, (k) => `two units share the number ${k}`, errors);
	duplicates(units, (u) => u.id, (k) => `duplicate unit slug "${k}"`, errors);
	duplicates(exercises, (x) => `${x.module}/${x.order}`, (k) => `two exercises share the number ${k}`, errors);
	duplicates(exercises, (x) => x.id, (k) => `duplicate exercise slug "${k}"`, errors);
	duplicates(groups, (g) => g.id, (k) => `duplicate question group id "${k}"`, errors);

	const unitIds = new Set(units.map((u) => u.id));
	for (const g of groups) {
		if (!unitIds.has(g.unit)) errors.push(`question group "${g.id}": unit "${g.unit}" does not exist`);
	}

	const byOrder = <T extends { module: string; order: number }>(a: T, b: T) =>
		a.module === b.module ? a.order - b.order : 0;
	return { index: { units: units.sort(byOrder), exercises: exercises.sort(byOrder), groups }, errors };
}

function duplicates<T>(items: T[], key: (item: T) => string, message: (key: string) => string, errors: string[]) {
	const seen = new Set<string>();
	for (const item of items) {
		const k = key(item);
		if (seen.has(k)) errors.push(message(k));
		seen.add(k);
	}
}
