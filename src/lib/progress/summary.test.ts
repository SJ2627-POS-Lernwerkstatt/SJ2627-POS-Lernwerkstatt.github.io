import { describe, expect, it } from 'vitest';
import { emptyProgress } from './schema.ts';
import { moduleSummary, nextUnit, type UnitRef } from './summary.ts';

const NOW = '2026-11-02T10:00:00.000Z';
const unit = (id: string, core = true): UnitRef => ({ id, slug: id.split('/')[1], title: id, core });

describe('moduleSummary', () => {
	it('counts read units and groups in box 2 or higher', () => {
		const p = emptyProgress();
		p.units['testing/a'] = { readAt: NOW };
		p.units['streams/x'] = { readAt: NOW }; // other module, not counted
		p.groups['g1'] = { box: 1, lastAt: NOW, runs: 1, wrong: 1 };
		p.groups['g2'] = { box: 2, lastAt: NOW, runs: 1, wrong: 0 };
		p.groups['g3'] = { box: 4, lastAt: NOW, runs: 3, wrong: 0 };
		const s = moduleSummary([unit('testing/a'), unit('testing/b')], ['g1', 'g2', 'g3', 'g4'], p);
		expect(s).toEqual({ unitsRead: 1, units: 2, groupsKnown: 2, groups: 4 });
	});
});

describe('nextUnit', () => {
	const modules = [
		{ slug: 'testing', units: [unit('testing/a'), unit('testing/v', false), unit('testing/b')] },
		{ slug: 'streams', units: [unit('streams/x')] }
	];

	it('starts with the first unit', () => {
		expect(nextUnit(modules, emptyProgress())?.unit.id).toBe('testing/a');
	});

	it('skips Vertiefung while core units are unread, also in later modules', () => {
		const p = emptyProgress();
		p.units['testing/a'] = { readAt: NOW };
		p.units['testing/b'] = { readAt: NOW };
		const next = nextUnit(modules, p);
		expect(next?.module.slug).toBe('streams');
		expect(next?.unit.id).toBe('streams/x');
	});

	it('offers Vertiefung once all core units are read, then nothing', () => {
		const p = emptyProgress();
		for (const id of ['testing/a', 'testing/b', 'streams/x']) p.units[id] = { readAt: NOW };
		expect(nextUnit(modules, p)?.unit.id).toBe('testing/v');
		p.units['testing/v'] = { readAt: NOW };
		expect(nextUnit(modules, p)).toBeNull();
	});
});
