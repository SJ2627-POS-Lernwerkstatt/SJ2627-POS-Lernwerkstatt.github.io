import { parse as parseYaml } from 'yaml';
import { choiceQuestion } from '#lib/content/schema.js';
import { z } from 'zod';

export const DIAGNOSTIC_AREAS = ['fundament', 'java', 'jpa', 'rest', 'service'] as const;

/** One entry of src/content/diagnostic/einstieg.yaml. */
export const diagnosticEntry = z.strictObject({
	id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase words separated by "-"'),
	area: z.enum(DIAGNOSTIC_AREAS),
	question: choiceQuestion
});
export type DiagnosticEntry = z.infer<typeof diagnosticEntry>;

export const diagnosticFile = z.array(diagnosticEntry).min(1);

/** Parses and cross-checks the diagnostic file. Returns every problem found. */
export function buildDiagnostic(raw: string, file = 'diagnostic/einstieg.yaml'): { entries: DiagnosticEntry[]; errors: string[] } {
	let data: unknown;
	try {
		data = parseYaml(raw) ?? [];
	} catch (e) {
		return { entries: [], errors: [`${file}: ${(e as Error).message}`] };
	}
	const parsed = diagnosticFile.safeParse(data);
	if (!parsed.success) {
		return {
			entries: [],
			errors: parsed.error.issues.map((i) => `${file}: ${i.path.join('.') || '(root)'}: ${i.message}`)
		};
	}
	const errors: string[] = [];
	const seen = new Set<string>();
	for (const { id, question: q } of parsed.data) {
		const where = `${file}: ${id}`;
		if (seen.has(id)) errors.push(`${where}: duplicate id`);
		seen.add(id);
		const answers = q.kind === 'single' ? [q.answer] : q.answer;
		for (const a of answers) {
			if (a >= q.options.length) errors.push(`${where}: answer ${a} is out of range (${q.options.length} options)`);
		}
		if (new Set(answers).size !== answers.length) errors.push(`${where}: duplicate answer index`);
	}
	return { entries: parsed.data, errors };
}
