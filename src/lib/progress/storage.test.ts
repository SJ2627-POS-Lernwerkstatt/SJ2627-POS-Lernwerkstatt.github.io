import { describe, expect, it } from 'vitest';
import { emptyProgress } from './schema.ts';
import { exportFileName, loadProgress, parseProgress, serialize } from './storage.ts';

const NOW = '2026-11-02T10:00:00.000Z';

describe('loadProgress', () => {
	it('starts empty without stored data', () => {
		expect(loadProgress(null)).toEqual({ progress: emptyProgress() });
		expect(loadProgress('')).toEqual({ progress: emptyProgress() });
	});

	it('reads valid data and fills defaults for missing sections', () => {
		const { progress, broken } = loadProgress(JSON.stringify({ version: 1, units: { 'jpa/enums': { readAt: NOW } } }));
		expect(broken).toBeUndefined();
		expect(progress.units['jpa/enums'].readAt).toBe(NOW);
		expect(progress.groups).toEqual({});
		expect(progress.settings).toEqual({});
	});

	it('starts fresh but hands back broken data', () => {
		expect(loadProgress('{not json')).toEqual({ progress: emptyProgress(), broken: '{not json' });
		const wrongShape = JSON.stringify({ version: 1, groups: { a: { box: 9 } } });
		expect(loadProgress(wrongShape).broken).toBe(wrongShape);
	});

	it('round-trips through serialize', () => {
		const p = emptyProgress();
		p.units['testing/aufbau'] = { readAt: NOW };
		p.groups['g1'] = { box: 2, lastAt: NOW, runs: 3, wrong: 1 };
		p.settings.theme = 'dark';
		expect(loadProgress(serialize(p)).progress).toEqual(p);
	});
});

describe('parseProgress (import)', () => {
	it('explains what is wrong with a file', () => {
		expect(parseProgress('hello')).toEqual({ ok: false, error: 'Die Datei ist keine gültige JSON-Datei.' });
		expect(parseProgress('{"version":2}')).toMatchObject({ ok: false, error: expect.stringContaining('anderen Version') });
		expect(parseProgress('{"foo":1}')).toMatchObject({ ok: false, error: expect.stringContaining('kein Lernwerkstatt') });
	});
});

describe('exportFileName', () => {
	it('contains the date', () => {
		expect(exportFileName(new Date(NOW))).toBe('lernwerkstatt-fortschritt-2026-11-02.json');
	});
});
