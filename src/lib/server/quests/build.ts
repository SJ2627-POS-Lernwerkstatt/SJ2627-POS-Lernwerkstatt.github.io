import { createHash } from 'node:crypto';
import { parse as parseYaml } from 'yaml';
import { MODULES } from '#lib/content/modules.js';
import { puzzleTopic } from '#lib/content/puzzles.js';
import { questFile, type QuestItemInput } from '#lib/quests/schema.js';
import { groupMinutes, puzzleMinutes, reviewMinutes } from '#lib/quests/minutes.js';
import { isDate, isoWeekOf, weekRange } from '#lib/quests/week.js';
import type { ContentEntry, ContentIndexFile, Quest, QuestItem, QuestsFile } from '#lib/quests/types.js';
import type { ContentIndex } from '#lib/server/content/build.js';

const QUEST_PATH = /^quests\/(\d{4})-w(\d{2})\.yaml$/;

const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
const oneLine = (md: string, max = 80) => {
	const text = md.replace(/[`*_#>]/g, '').replace(/\s+/g, ' ').trim();
	return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
};

/** Classroom50 assignment slug from ".../assignments/<slug>/accept"; undefined if there is no URL or it does not match. */
export function assignmentSlug(classroomUrl: string | undefined): string | undefined {
	if (!classroomUrl) return undefined;
	return /\/assignments\/([^/?#]+)\/accept\/?(?:[?#].*)?$/.exec(classroomUrl)?.[1];
}

/** Every unit, question group, puzzle and exercise with link, title and minutes. */
export function contentEntries(content: ContentIndex): ContentEntry[] {
	const unitHref = (id: string) => `/${id}`;
	return [
		...content.units.map((u) => ({ id: u.id, kind: 'unit' as const, module: u.module, title: u.title, minutes: u.minutes, href: unitHref(u.id), ...(u.mindest ? { mindest: true } : {}) })),
		...content.groups.map((g) => ({
			id: g.id,
			kind: 'group' as const,
			module: g.unit.split('/')[0],
			title: oneLine(g.main.prompt),
			minutes: groupMinutes(g.followUps.length),
			// Exercise mode serves a module's pool; there is no page for a single group.
			href: `/ueben/${g.unit.split('/')[0]}`,
			unit: g.unit
		})),
		...content.puzzles.map((p) => ({
			id: p.id,
			kind: 'puzzle' as const,
			module: puzzleTopic(p.topic)?.module ?? p.topic,
			title: p.title,
			minutes: puzzleMinutes(p),
			href: `/puzzles/${p.topic}/${p.id}`,
			...(p.mindest ? { mindest: true } : {})
		})),
		...content.exercises.map((x) => {
			const assignment = assignmentSlug(x.classroomUrl);
			return {
				id: x.id,
				kind: 'exercise' as const,
				module: x.module,
				title: x.title,
				minutes: x.minutes,
				href: `/${x.id}`,
				...(assignment ? { assignment } : {}),
				grading: x.grading,
				...(x.mindest ? { mindest: true } : {})
			};
		})
	];
}

export function buildContentIndex(content: ContentIndex, now = new Date()): ContentIndexFile {
	const entries = contentEntries(content);
	const modules = MODULES.map((m) => ({ slug: m.slug, title: m.title }));
	return { version: hash({ modules, entries }), generatedAt: now.toISOString(), modules, entries };
}

type Lookup = Map<string, ContentEntry>;

function resolveItem(raw: QuestItemInput, byKind: Record<ContentEntry['kind'], Lookup>, exerciseAlias: Map<string, string>, content: ContentIndex): QuestItem | string {
	const base = (kind: QuestItem['kind'], ref: string, entry: { title: string; minutes: number; href: string; mindest?: boolean }): QuestItem => ({
		itemId: `${kind}:${ref}`,
		kind,
		ref,
		title: entry.title,
		minutes: raw.minutes ?? entry.minutes,
		laptop: raw.laptop,
		href: entry.href,
		...(entry.mindest ? { mindest: true } : {})
	});
	const lookup = (kind: ContentEntry['kind'], what: string, ref: string) => {
		const e = byKind[kind].get(ref);
		return e ? base(what as QuestItem['kind'], ref, e) : `${what} "${ref}" does not exist`;
	};
	if (raw.unit) return lookup('unit', 'unit', raw.unit);
	if (raw.theory) return lookup('unit', 'theory', raw.theory);
	if (raw.puzzle) return lookup('puzzle', 'puzzle', raw.puzzle);
	if (raw.group) return lookup('group', 'group', raw.group);
	if (raw.exercise) return lookup('exercise', 'exercise', exerciseAlias.get(raw.exercise) ?? raw.exercise);
	if (raw.review) {
		const { module, cards } = raw.review;
		if (!content.groups.some((g) => g.unit.startsWith(`${module}/`))) return `review: module "${module}" has no question groups`;
		const title = MODULES.find((m) => m.slug === module)?.title ?? module;
		const item = base('review', module, { title: `Wiederholen: ${title}`, minutes: reviewMinutes(cards), href: `/ueben/${module}` });
		return { ...item, cards };
	}
	return 'empty item';
}

/** Parses and resolves all quest files against the content index. Returns every problem found. */
export function buildQuests(files: Record<string, string>, content: ContentIndex, now = new Date()): { quests: QuestsFile; errors: string[] } {
	const errors: string[] = [];
	const entries = contentEntries(content);
	const byKind = Object.fromEntries((['unit', 'group', 'puzzle', 'exercise'] as const).map((k) => [k, new Map(entries.filter((e) => e.kind === k).map((e) => [e.id, e]))])) as Record<ContentEntry['kind'], Lookup>;
	// Exercises may also be written like their file: "jpa/01-fahrradverleih".
	const exerciseAlias = new Map(content.exercises.map((x) => [x.file.replace('/exercises/', '/').replace(/\.md$/, ''), x.id]));
	const weeks: Quest[] = [];

	for (const [file, text] of Object.entries(files)) {
		const m = QUEST_PATH.exec(file);
		if (!m) {
			errors.push(`${file}: quest files must be named "quests/<yyyy>-w<ww>.yaml"`);
			continue;
		}
		let data: unknown;
		try {
			data = parseYaml(text);
		} catch (e) {
			errors.push(`${file}: ${(e as Error).message}`);
			continue;
		}
		const parsed = questFile.safeParse(data);
		if (!parsed.success) {
			errors.push(...parsed.error.issues.map((i) => `${file}: ${i.path.length ? i.path.join('.') + ': ' : ''}${i.message}`));
			continue;
		}
		const q = parsed.data;
		const before = errors.length;
		const range = weekRange(q.week);
		if (q.week !== `${m[1]}-W${m[2]}`) errors.push(`${file}: week "${q.week}" does not match the file name`);
		if (!range) errors.push(`${file}: week: "${q.week}" is not a valid ISO week`);
		if (q.lesson !== undefined) {
			if (!isDate(q.lesson)) errors.push(`${file}: lesson: "${q.lesson}" is not a date (YYYY-MM-DD)`);
			else if (isoWeekOf(q.lesson) !== q.week) errors.push(`${file}: lesson ${q.lesson} is in ${isoWeekOf(q.lesson)}, not in ${q.week}`);
		}
		const items: QuestItem[] = [];
		const seen = new Set<string>();
		q.items.forEach((raw, i) => {
			const r = resolveItem(raw, byKind, exerciseAlias, content);
			if (typeof r === 'string') return void errors.push(`${file}: items.${i}: ${r}`);
			if (seen.has(r.itemId)) return void errors.push(`${file}: items.${i}: duplicate item "${r.itemId}"`);
			seen.add(r.itemId);
			items.push(r);
		});
		if (errors.length > before || !range) continue;
		weeks.push({
			week: q.week,
			title: q.title,
			start: range.start,
			end: range.end,
			...(q.lesson ? { lesson: q.lesson } : {}),
			goal: q.goal,
			holiday: q.holiday,
			items,
			...(q.classGoal ? { classGoal: q.classGoal } : {})
		});
	}
	weeks.sort((a, b) => a.week.localeCompare(b.week));
	return { quests: { version: hash(weeks), generatedAt: now.toISOString(), weeks }, errors };
}
