/**
 * Shapes of the two build outputs the Advent-of-Matura backend fetches from the live site:
 *   /data/quests.json         (QuestsFile)
 *   /data/content-index.json  (ContentIndexFile)
 * Self-contained on purpose (no imports) so this file can be copied into the backend's `shared/` package.
 */

export type QuestItemKind = 'unit' | 'review' | 'puzzle' | 'group' | 'theory' | 'exercise';

export type QuestItem = {
	/** Stable per week, e.g. "unit:jpa/entity", "review:jpa", "puzzle:jpa-entity-03", "exercise:jpa/uebungen/fahrradverleih". */
	itemId: string;
	kind: QuestItemKind;
	/** Unit id, module slug (review), puzzle id, question group id or exercise id. */
	ref: string;
	title: string;
	minutes: number;
	/** The item needs a laptop (e.g. a programming exercise), not just a phone. */
	laptop: boolean;
	/** Site-relative link, e.g. "/jpa/entity". */
	href: string;
	/** Only for kind "review": number of cards in the run. */
	cards?: number;
	/** Mindestanforderung: the unit/puzzle/exercise/theory is needed for a Genügend. Only set when true; never for review and group items. */
	mindest?: boolean;
};

export type ClassGoal = { weeks: number; minStudents: number };

export type Quest = {
	/** ISO week, e.g. "2026-W50". */
	week: string;
	title: string;
	/** Monday and Sunday of the ISO week, YYYY-MM-DD. */
	start: string;
	end: string;
	/** Default date of the in-person lesson, YYYY-MM-DD, inside the week. */
	lesson?: string;
	/** Items needed for the week streak. */
	goal: number;
	holiday: boolean;
	items: QuestItem[];
	classGoal?: ClassGoal;
};

export type QuestsFile = {
	/** Content hash of `weeks`; changes whenever a quest changes. */
	version: string;
	/** ISO timestamp of the build. */
	generatedAt: string;
	/** Sorted by week. */
	weeks: Quest[];
};

export type ContentKind = 'unit' | 'group' | 'puzzle' | 'exercise';

export type ContentEntry = {
	/** Unit id "<module>/<slug>", group id, puzzle id, or exercise id "<module>/uebungen/<slug>". */
	id: string;
	kind: ContentKind;
	module: string;
	title: string;
	/** Units/exercises: frontmatter. Puzzles/groups: estimate, see src/lib/quests/minutes.ts. */
	minutes: number;
	/** Site-relative link. */
	href: string;
	/** Only for question groups: the unit they belong to. */
	unit?: string;
	/** Only for exercises: Classroom50 assignment slug (from classroomUrl), if the assignment exists. */
	assignment?: string;
	/** Only for exercises: how it is graded. */
	grading?: 'auto' | 'teacher';
	/** Mindestanforderung (needed for a Genügend): units, puzzles and exercises. Only set when true. */
	mindest?: boolean;
};

export type ContentModule = { slug: string; title: string };

export type ContentIndexFile = {
	/** Content hash of `modules` and `entries`. */
	version: string;
	generatedAt: string;
	modules: ContentModule[];
	entries: ContentEntry[];
};
