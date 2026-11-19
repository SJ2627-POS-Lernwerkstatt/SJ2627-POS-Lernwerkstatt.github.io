import { describe, expect, it } from 'vitest';
import { buildDiagnostic } from './build.js';

const entry = (over: Record<string, unknown> = {}, q: Record<string, unknown> = {}) => ({
	id: 'diag-a',
	area: 'jpa',
	question: { kind: 'single', prompt: 'Frage?', options: ['a', 'b'], answer: 1, explanation: 'Darum.', ...q },
	...over
});
const run = (...entries: unknown[]) => buildDiagnostic(JSON.stringify(entries));

describe('buildDiagnostic', () => {
	it('accepts single and multi questions', () => {
		const { entries, errors } = run(entry(), entry({ id: 'diag-b' }, { kind: 'multi', answer: [0, 1] }));
		expect(errors).toEqual([]);
		expect(entries).toHaveLength(2);
	});
	it('rejects duplicate ids', () => {
		expect(run(entry(), entry()).errors.join()).toMatch(/duplicate id/);
	});
	it('rejects an unknown area', () => {
		expect(run(entry({ area: 'streams' })).errors.join()).toMatch(/area/);
	});
	it('rejects template questions', () => {
		expect(run(entry({}, { kind: 'template', template: '{{a}} {{b}}' })).errors.length).toBeGreaterThan(0);
	});
	it('rejects answers out of range and duplicates', () => {
		expect(run(entry({}, { answer: 2 })).errors.join()).toMatch(/out of range/);
		expect(run(entry({}, { kind: 'multi', answer: [0, 5] })).errors.join()).toMatch(/out of range/);
		expect(run(entry({}, { kind: 'multi', answer: [1, 1] })).errors.join()).toMatch(/duplicate answer/);
	});
	it('rejects broken YAML and an empty file', () => {
		expect(buildDiagnostic('a: [').errors.length).toBe(1);
		expect(buildDiagnostic('').errors.length).toBeGreaterThan(0);
	});
});

describe('the real file', () => {
	it('is valid', async () => {
		const raw = (await import('../../../content/diagnostic/einstieg.yaml?raw')).default;
		const { entries, errors } = buildDiagnostic(raw);
		expect(errors).toEqual([]);
		expect(entries).toHaveLength(10);
	});
});
