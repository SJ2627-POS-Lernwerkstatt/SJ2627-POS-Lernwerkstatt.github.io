import { describe, expect, it } from 'vitest';
import { buildIndex, frontmatter } from './build.js';

const unit = (fm: string) => `---\n${fm}\n---\n\n# Body\n`;
const okUnit = unit('title: Enums\nminutes: 8\ncheatsheet: 12');

const pool = (yaml: string) => ({ 'questions/jpa.yaml': yaml });
const singleGroup = (id = 'jpa-enum-01', unitRef = 'jpa/enums', answer = 1) => `
- id: ${id}
  unit: ${unitRef}
  main:
    kind: single
    prompt: Wie speichert JPA ein Enum?
    options: [Name, Ordinalzahl]
    answer: ${answer}
    explanation: Ordinalzahl.
`;

function build(files: Partial<Parameters<typeof buildIndex>[0]>) {
	return buildIndex({ units: {}, exercises: {}, pools: {}, ...files });
}

describe('frontmatter', () => {
	it('parses the YAML block at the top', () => {
		expect(frontmatter('---\ntitle: A\nminutes: 3\n---\nbody')).toEqual({ title: 'A', minutes: 3 });
	});
	it('rejects a file without frontmatter', () => {
		expect(() => frontmatter('# Title')).toThrow(/missing frontmatter/);
	});
});

describe('buildIndex', () => {
	it('builds units with id, order and defaults', () => {
		const { index, errors } = build({ units: { 'jpa/06-enums.md': okUnit, 'jpa/02-entity.md': okUnit.replace('Enums', 'Entity') } });
		expect(errors).toEqual([]);
		expect(index.units.map((u) => u.id)).toEqual(['jpa/entity', 'jpa/enums']);
		expect(index.units[1]).toMatchObject({ module: 'jpa', slug: 'enums', order: 6, core: true, status: 'draft', cheatsheet: 12 });
	});

	it('reports bad file names, unknown modules and invalid frontmatter', () => {
		const { errors } = build({
			units: {
				'jpa/enums.md': okUnit,
				'foo/01-bar.md': okUnit,
				'jpa/03-x.md': unit('title: X\nminutes: 99\nextra: 1')
			}
		});
		expect(errors).toEqual(
			expect.arrayContaining([
				expect.stringContaining('jpa/enums.md: unit files must be named'),
				expect.stringContaining('unknown module "foo"'),
				expect.stringMatching(/jpa\/03-x\.md: minutes: /),
				expect.stringMatching(/jpa\/03-x\.md: .*extra/)
			])
		);
	});

	it('reports duplicate unit numbers', () => {
		const { errors } = build({ units: { 'jpa/01-a.md': okUnit, 'jpa/01-b.md': okUnit } });
		expect(errors).toContain('two units share the number jpa/1');
	});

	it('loads question groups and applies defaults', () => {
		const { index, errors } = build({ units: { 'jpa/06-enums.md': okUnit }, pools: pool(singleGroup()) });
		expect(errors).toEqual([]);
		expect(index.groups).toHaveLength(1);
		expect(index.groups[0].followUps).toEqual([]);
	});

	it('reports unknown units, foreign modules, duplicate ids and out-of-range answers', () => {
		const { errors } = build({
			units: { 'jpa/06-enums.md': okUnit },
			pools: pool(singleGroup('a') + singleGroup('a') + singleGroup('b', 'jpa/nope') + singleGroup('c', 'rest/x') + singleGroup('d', 'jpa/enums', 5))
		});
		expect(errors).toEqual(
			expect.arrayContaining([
				'duplicate question group id "a"',
				'question group "b": unit "jpa/nope" does not exist',
				expect.stringContaining('group "c" refers to unit "rest/x" of another module'),
				expect.stringContaining('d.main: answer 5 is out of range (2 options)')
			])
		);
	});

	it('rejects more than two follow-up questions', () => {
		const q = `
      - kind: multi
        prompt: P
        options: [a, b]
        answer: [0, 1]
        explanation: E`;
		const yaml = singleGroup() + `  followUps:${q}${q}${q}\n`;
		const { errors } = build({ units: { 'jpa/06-enums.md': okUnit }, pools: pool(yaml) });
		expect(errors.some((e) => e.includes('followUps'))).toBe(true);
	});

	it('loads exercises', () => {
		const ex = '---\ntitle: Schule\ngrading: auto\nminutes: 90\n---\n';
		const { index, errors } = build({ exercises: { 'jpa/exercises/01-schule.md': ex } });
		expect(errors).toEqual([]);
		expect(index.exercises[0]).toMatchObject({ id: 'jpa/uebungen/schule', grading: 'auto', status: 'draft' });
	});

	it('reports template errors with question and line', () => {
		const yaml = `
- id: t-1
  unit: jpa/enums
  main:
    kind: template
    prompt: P
    explanation: E
    template: |
      @{{Entity}}
      class A {{extends
    reusable: [Nope]
`;
		const { errors } = build({ units: { 'jpa/06-enums.md': okUnit }, pools: pool(yaml) });
		expect(errors).toEqual(
			expect.arrayContaining([
				expect.stringMatching(/t-1\.main: template line 2: Marker .* never closed/),
				expect.stringContaining('t-1.main: a template needs at least 2 pieces'),
				expect.stringContaining('Reusable “Nope”')
			])
		);
	});
});
