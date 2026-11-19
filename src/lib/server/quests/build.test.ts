import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildQuests } from './build.js';
import { buildIndex } from '#lib/server/content/build.js';
import { isoWeekOf, weekRange } from '#lib/quests/week.js';

const unit = (title: string) => `---\ntitle: ${title}\nminutes: 8\n---\n\n# x\n`;
const group = (id: string, u: string) => `
- id: ${id}
  unit: ${u}
  main: { kind: single, prompt: "Frage?", options: [a, b], answer: 0, explanation: ok }
  followUps:
    - { kind: single, prompt: "Mehr?", options: [a, b], answer: 1, explanation: ok }
`;
const puzzle = `
- id: entity-room
  kind: lines
  title: Raum
  prompt: p
  explanation: e
  solution: |
    @Entity
    class Room {
        int a;
    }
`;
const { index, errors: contentErrors } = buildIndex({
	units: { 'jpa/01-entity.md': unit('Entity'), 'modern-java/01-var.md': unit('Var') },
	exercises: {
		'jpa/exercises/01-fahrradverleih.md': `---\ntitle: Fahrradverleih\ngrading: auto\nminutes: 90\nrubric: { erwartet: a, genuegend: b, befriedigend: c, gut: d, sehrGut: e }\n---\n`
	},
	pools: { 'questions/jpa.yaml': group('jpa-enum-01', 'jpa/entity') },
	puzzles: { 'puzzles/jpa-entity.yaml': puzzle }
});

const build = (yaml: string) => buildQuests({ 'quests/2027-w02.yaml': yaml }, index, new Date('2027-01-01T00:00:00Z'));
const quest = (extra = '', items = '  - unit: jpa/entity') => `week: 2027-W02\ntitle: T\ngoal: 1\n${extra}\nitems:\n${items}\n`;

it('fixture content is valid', () => expect(contentErrors).toEqual([]));

describe('quest resolver', () => {
	it('resolves every kind', () => {
		const { quests, errors } = build(
			quest(
				'lesson: 2027-01-14',
				[
					'  - unit: jpa/entity',
					'  - review: { module: jpa, cards: 8 }',
					'  - puzzle: entity-room',
					'  - group: jpa-enum-01',
					'  - theory: modern-java/var',
					'  - exercise: jpa/01-fahrradverleih',
					'    laptop: true',
					'    minutes: 45'
				].join('\n')
			)
		);
		expect(errors).toEqual([]);
		const w = quests.weeks[0];
		expect([w.start, w.end, w.lesson]).toEqual(['2027-01-11', '2027-01-17', '2027-01-14']);
		expect(w.items.map((i) => i.itemId)).toEqual([
			'unit:jpa/entity',
			'review:jpa',
			'puzzle:entity-room',
			'group:jpa-enum-01',
			'theory:modern-java/var',
			'exercise:jpa/uebungen/fahrradverleih'
		]);
		expect(w.items[1]).toMatchObject({ minutes: 4, href: '/ueben/jpa', cards: 8 });
		expect(w.items[2]).toMatchObject({ minutes: 4, href: '/puzzles/jpa-entity/entity-room' });
		expect(w.items[3]).toMatchObject({ minutes: 3, href: '/ueben/jpa' });
		expect(w.items[5]).toMatchObject({ minutes: 45, laptop: true, href: '/jpa/uebungen/fahrradverleih' });
	});
	it.each([
		['unit: jpa/nope', 'unit "jpa/nope" does not exist'],
		['puzzle: nope', 'puzzle "nope" does not exist'],
		['group: nope', 'group "nope" does not exist'],
		['exercise: jpa/nope', 'does not exist'],
		['theory: theorie/di', 'theory "theorie/di" does not exist'],
		['review: { module: rest, cards: 5 }', 'no question groups']
	])('unknown id fails: %s', (item, msg) => {
		expect(build(quest('', `  - ${item}`)).errors.join()).toContain(msg);
	});
	it('rejects a week that does not match the file name', () => {
		const r = buildQuests({ 'quests/2027-w03.yaml': quest() }, index);
		expect(r.errors.join()).toContain('does not match the file name');
	});
	it('rejects a lesson outside the week', () => {
		expect(build(quest('lesson: 2027-01-20')).errors.join()).toContain('2027-W03, not in 2027-W02');
	});
	it('rejects duplicate items', () => {
		expect(build(quest('', '  - unit: jpa/entity\n  - unit: jpa/entity')).errors.join()).toContain('duplicate item "unit:jpa/entity"');
	});
	it('rejects a goal out of range', () => {
		expect(build(quest().replace('goal: 1', 'goal: 2')).errors.join()).toContain('goal');
		expect(build(quest().replace('goal: 1', 'goal: 0')).errors.length).toBeGreaterThan(0);
	});
	it('rejects items with zero or two kinds, and bad card counts', () => {
		expect(build(quest('', '  - laptop: true')).errors.join()).toContain('exactly one of');
		expect(build(quest('', '  - unit: jpa/entity\n    puzzle: entity-room')).errors.join()).toContain('exactly one of');
		expect(build(quest('', '  - review: { module: jpa, cards: 21 }')).errors.length).toBeGreaterThan(0);
	});
	it('rejects a bad file name', () => {
		expect(buildQuests({ 'quests/foo.yaml': quest() }, index).errors.join()).toContain('must be named');
	});
});

describe('week helpers', () => {
	it('computes ISO weeks', () => {
		expect(isoWeekOf('2027-01-01')).toBe('2026-W53');
		expect(isoWeekOf('2026-12-14')).toBe('2026-W51');
		expect(weekRange('2026-W50')).toEqual({ start: '2026-12-07', end: '2026-12-13' });
		expect(weekRange('2027-W53')).toBeUndefined();
	});
});

describe('real quest files', () => {
	it('resolve against the real content', async () => {
		// importing the index throws if any real quest file fails to resolve
		const { quests } = await import('./index.js');
		const weeks = quests.weeks.map((w) => w.week);
		expect(weeks.length).toBeGreaterThan(0);
		expect(weeks).toContain('2026-W50');
		expect(weeks).toEqual([...weeks].sort());
		expect(new Set(weeks).size).toBe(weeks.length);
		const files = readdirSync(new URL('../../../content/quests/', import.meta.url))
			.filter((f) => f.endsWith('.yaml'))
			.map((f) => f.replace(/\.yaml$/, ''))
			.sort();
		expect(files).toEqual(weeks.map((w) => w.toLowerCase()));
		for (const w of quests.weeks) {
			expect(w.goal).toBeGreaterThan(0);
			expect(w.items.length).toBeGreaterThan(0);
		}
	});

	it('marks holiday weeks', async () => {
		const { quests } = await import('./index.js');
		for (const week of ['2026-W52', '2026-W53', '2027-W05']) {
			expect(quests.weeks.find((w) => w.week === week)?.holiday, week).toBe(true);
		}
	});
});
